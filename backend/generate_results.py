# ============================================================
# RESEARCH-GRADE RL NUTRITION SIM (Stateful, Un-Rigged, Full Code)
# ============================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.mixture import GaussianMixture
from sklearn.decomposition import PCA
from scipy.stats import f_oneway
import statsmodels.stats.multicomp as mc
import torch
import torch.nn as nn
import torch.optim as optim
import random
import os

# ------------------------------------------------------------
# 0. CONFIG & SEEDS
# ------------------------------------------------------------
# Reproducibility
np.random.seed(42)
torch.manual_seed(42)
random.seed(42)

SEEDS = 10           # Consistent seeds for valid stats
EPISODES = 600       # Enough time for convergence
WINDOW = 40          # Smoothing window

# ------------------------------------------------------------
# 1. LOAD DATA (With Dummy Fallback for Testing)
# ------------------------------------------------------------
try:
    df = pd.read_csv("food_data.csv")
    # Standardize columns
    df.columns = [c.lower() for c in df.columns]
except FileNotFoundError:
    print("WARNING: 'food_data.csv' not found. Generating dummy data for simulation...")
    # Generate synthetic data if file missing
    data_size = 500
    df = pd.DataFrame({
        "food_name": [f"Food_{i}" for i in range(data_size)],
        "energy_kcal": np.random.uniform(50, 800, data_size),
        "carb_g": np.random.uniform(0, 100, data_size),
        "protein_g": np.random.uniform(0, 50, data_size),
        "fat_g": np.random.uniform(0, 50, data_size),
        "freesugar_g": np.random.uniform(0, 50, data_size),
        "fibre_g": np.random.uniform(0, 20, data_size),
        "unit_serving_vitc_mg": np.random.uniform(0, 100, data_size)
    })

feat_cols = [
    "energy_kcal","carb_g","protein_g","fat_g",
    "freesugar_g","fibre_g","unit_serving_vitc_mg"
]
df[feat_cols] = df[feat_cols].fillna(0).astype(float)
food_names = df["food_name"].tolist()
data = df[feat_cols].values

# ------------------------------------------------------------
# 2. GMM CONTEXT ASSIGNMENT
# ------------------------------------------------------------
X = StandardScaler().fit_transform(data)
Xp = PCA(n_components=4).fit_transform(X)
gmm = GaussianMixture(n_components=4, random_state=42).fit(Xp)
cluster = gmm.predict(Xp)
contexts = ["C1","C2","C3","C4"]
cluster_map = {0:"C3", 1:"C1", 2:"C2", 3:"C4"}

def rule_ctx(n):
    kcal,carb,protein,fat,sugar,fibre,vitC = n
    scores={
        "C1": carb + kcal*0.3,        # energy biased
        "C2": protein*1.2,            # protein biased
        "C3": max(0, 200-kcal),       # low calorie
        "C4": max(0, 35-carb)         # low carb
    }
    return max(scores, key=scores.get)

def assign(i):
    base = rule_ctx(data[i])
    cm = cluster_map.get(cluster[i], "C1")
    if base in ["C2","C4"]: return base
    return cm

ctx_assign = [assign(i) for i in range(len(df))]
ctx_dict = {c:[] for c in contexts}
for i in range(len(df)):
    ctx_dict[ctx_assign[i]].append({"name":food_names[i], "n":data[i]})

# ------------------------------------------------------------
# 3. ENVIRONMENT (Stateful & Hybrid Logic)
# ------------------------------------------------------------
def step_env(state, n, context):
    """
    Calculates next state and reward based on food and context.
    REPLACES the static 'rew' function to allow state dynamics.
    """
    kcal,carb,p,fat,s,fibre,vitC = n
    
    # --- A. STATE DYNAMICS (Metabolism) ---
    # Inputs scaled down to keep state changes gradual (0.0 to 1.0)
    glycemic_load = (s / 100.0) + (carb / 200.0)
    satiety_load = (p / 100.0) + (fibre / 50.0)
    
    state_inc = glycemic_load + satiety_load
    decay = 0.05
    
    next_state = state + state_inc - decay
    
    # --- B. REWARD CALCULATION ---
    reward = 0.0
    
    # Global Soft Constraints (No massive cliffs, just pressure)
    if next_state < 0.0: 
        reward -= 1.0; next_state = 0.0 # Starvation
    elif next_state > 1.0: 
        reward -= 1.0; next_state = 0.9 # Bloating

    # Context Specific Rewards
    if context == "C1": # Energy/Carb (Stateless-ish)
        # Simple Goal: Maximize Energy. State doesn't punish much.
        reward += (kcal / 1000.0) + (carb / 200.0)
        
    elif context == "C2": # Protein (Stateless-ish)
        # Simple Goal: Maximize Protein.
        reward += (p / 50.0) - (s / 100.0)
        
    elif context == "C3": # Low Cal (Stateful Trap)
        # Goal: Low Calorie. BUT if State > 0.8, eating is BAD.
        reward += (fibre / 20.0) 
        if next_state > 0.8 and kcal > 200:
            reward -= 2.0 # Trap!
        elif kcal > 400:
            reward -= 0.5 # Soft punishment
        
    elif context == "C4": # Low Carb (Stateful Trap)
        # Goal: Low Carb. BUT if State > 0.6, Sugar is DEADLY.
        reward -= (s / 50.0)
        
        if next_state > 0.6 and (s > 10 or carb > 20):
            reward -= 3.0 # Trap!
        elif next_state < 0.2 and carb > 15:
            reward += 1.5 # Recovery bonus (DQN learns this)

    # Clip state to valid range
    next_state = np.clip(next_state, 0.0, 1.0)
    
    # Small noise for statistical validity (prevents 0 std dev)
    reward += np.random.normal(0, 0.1)
    
    return next_state, reward

def norm(x):
    # Standard Min-Max normalization for plotting
    x = np.array(x)
    if x.std() == 0: return x - x.mean()
    return (x - x.min()) / (x.max() - x.min() + 1e-9)

def ema(x, a=0.05):
    y = []
    prev = x[0]
    for v in x:
        prev = a*v + (1-a)*prev
        y.append(prev)
    return y

# ------------------------------------------------------------
# 4. RL AGENTS
# ------------------------------------------------------------
class UCBAgent:
    def __init__(self, A):
        self.A = A
        self.c = np.zeros(A)
        self.v = np.zeros(A) # Estimated value
        
    def select(self, s=None): # Accepts state but ignores it (Standard UCB)
        t = sum(self.c) + 1
        # UCB1 formula
        u = self.v + np.sqrt(1.5 * np.log(t) / (self.c + 1e-8))
        return np.argmax(u)
        
    def update(self, s, a, r, sn): # Ignores state in update
        self.c[a] += 1
        # Incremental mean update
        self.v[a] += (r - self.v[a]) / self.c[a]

STATE_DIM = 1
class DQN(nn.Module):
    def __init__(self, A):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(STATE_DIM, 32),
            nn.ReLU(),
            nn.Linear(32, A)
        )
    def forward(self, x): return self.net(x)

class DQNAgent:
    def __init__(self, A):
        self.A = A
        self.m = DQN(A)
        self.opt = optim.Adam(self.m.parameters(), lr=0.001)
        self.eps = 1.0
        
    def select(self, s):
        if random.random() < self.eps:
            return random.randint(0, self.A-1)
        with torch.no_grad():
            q = self.m(torch.tensor([[s]], dtype=torch.float32))
        return q.argmax().item()
        
    def update(self, s, a, r, sn):
        # [IMPROVEMENT] Uses Next State (sn) for true Q-Learning
        s_tens = torch.tensor([[s]], dtype=torch.float32)
        sn_tens = torch.tensor([[sn]], dtype=torch.float32)
        
        q = self.m(s_tens)
        
        with torch.no_grad():
            max_next_q = self.m(sn_tens).max()
        
        tgt = q.clone()
        # Gamma = 0.9 (Plans for future)
        tgt[0, a] = r + 0.9 * max_next_q
        
        loss = (q - tgt).pow(2).mean()
        self.opt.zero_grad(); loss.backward(); self.opt.step()
        self.eps = max(self.eps*0.995, 0.05)

class PG(nn.Module):
    def __init__(self, A):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(STATE_DIM, 32),
            nn.ReLU(),
            nn.Linear(32, A)
        )
    def forward(self, x): return self.net(x)

class PGAgent:
    def __init__(self, A):
        self.A = A
        self.m = PG(A)
        self.opt = optim.Adam(self.m.parameters(), lr=0.0005)
        self.saved_log_prob = None
        
    def select(self, s):
        logits = self.m(torch.tensor([[s]], dtype=torch.float32))
        p = torch.softmax(logits, dim=-1)
        p = torch.clamp(p, 1e-8, 1-1e-8) # Numerical stability
        p = p / p.sum()
        d = torch.distributions.Categorical(p)
        a = d.sample()
        self.saved_log_prob = d.log_prob(a)
        return a.item()
        
    def update(self, r):
        if self.saved_log_prob is None: return
        loss = -self.saved_log_prob * r
        self.opt.zero_grad(); loss.backward(); self.opt.step()

# ------------------------------------------------------------
# 5. RUN EXPERIMENT (multi-seed)
# ------------------------------------------------------------
def run(c, algo, eps=EPISODES, seeds=SEEDS):
    foods = ctx_dict[c]
    A = len(foods)
    if A < 2: return None, None, None, None
    
    all_runs = []
    
    print(f"Processing {c} - {algo}...")
    
    for sd in range(seeds):
        # Set seeds for reproducibility PER RUN
        np.random.seed(sd)
        torch.manual_seed(sd)
        random.seed(sd)
        
        ag = UCBAgent(A) if algo=="UCB" else DQNAgent(A) if algo=="DQN" else PGAgent(A)
        
        r_history = []
        s = 0.5 # [FIX] Initial State (Starts Balanced)
        
        for _ in range(eps):
            # 1. Select Action
            a = ag.select(s) 
            
            # 2. Step Environment (Get Reward & Next State)
            # [FIX] No more static 'rew' function. Logic is now dynamic.
            s_next, val = step_env(s, foods[a]["n"], c)
            
            # 3. Update Agent
            if algo=="UCB": ag.update(s, a, val, s_next)
            elif algo=="DQN": ag.update(s, a, val, s_next)
            else: ag.update(val)
            
            # 4. Advance State
            s = s_next 
            
            r_history.append(val)
            
        # Save raw data for stats
        all_runs.append(r_history)
        
    all_runs = np.array(all_runs) # Shape: (seeds, eps)
    
    # Calculate smoothed curves for plotting
    smoothed_runs = np.array([ema(run) for run in all_runs])
    mean_curve = np.mean(smoothed_runs, axis=0)
    std_curve = np.std(smoothed_runs, axis=0)
    
    # Normalize for plotting
    norm_mean = norm(mean_curve)
    
    return norm_mean, std_curve, all_runs

algos = ["UCB", "DQN", "PG"]

# ------------------------------------------------------------
# 6. GENERATE DATA FIRST
# ------------------------------------------------------------
print("Running simulations... please wait.")
res = {}
for c in contexts:
    res[c] = {}
    for a in algos:
        m, s, raw = run(c, a)
        # Store data. Note: 'm' is normalized for plotting, 'raw' is raw for stats
        res[c][a] = dict(mean=m, std=s, raw=raw)

# ------------------------------------------------------------
# 7. PLOTTING (Learning Curves)
# ------------------------------------------------------------
plt.style.use("seaborn-v0_8-whitegrid")
fig, axs = plt.subplots(2, 2, figsize=(14, 10))
axs = axs.flatten()
colors = {"UCB":"#2d7dd2", "DQN":"#f26419", "PG":"#2a9d8f"}

for i, c in enumerate(contexts):
    ax = axs[i]
    for a in algos:
        data_ = res[c][a]
        m = data_["mean"]
        s = data_["std"]
        
        # Standard Error for cleaner Confidence Interval
        se = s / np.sqrt(SEEDS)
        
        x = np.arange(len(m))
        ax.plot(x, m, label=a, color=colors[a], linewidth=2.2)
        ax.fill_between(x, m-se, m+se, color=colors[a], alpha=0.2)
        
    ax.set_title(f"Context {c}", fontsize=14, fontweight='bold')
    ax.set_xlabel("Episode")
    ax.set_ylabel("Normalized Reward")
    ax.grid(alpha=0.3)
    ax.legend(loc='lower right')

plt.tight_layout()
plt.show()

# ------------------------------------------------------------
# 8. STATISTICAL ANALYSIS
# ------------------------------------------------------------
def cohen_d(x, y):
    nx, ny = len(x), len(y)
    sx, sy = np.var(x, ddof=1), np.var(y, ddof=1)
    pooled = np.sqrt(((nx-1)*sx + (ny-1)*sy) / (nx+ny-2))
    return (np.mean(x) - np.mean(y)) / (pooled + 1e-12)

print(f"\n=== FINAL STATISTICAL ANALYSIS (SEEDS={SEEDS}, Last 50 Episodes) ===")

anova_rows = []
rank_rows = []

for c in contexts:
    print(f"\n--- Context {c} ---")
    
    # 1. Aggregate samples (Mean of last 50 episodes per seed)
    samples = {}
    for a in algos:
        raw = res[c][a]["raw"] 
        window = raw[:, -50:]  
        per_seed_mean = window.mean(axis=1) 
        samples[a] = per_seed_mean

    # 2. ANOVA
    try:
        F, p = f_oneway(samples["UCB"], samples["DQN"], samples["PG"])
        
        # Eta-squared
        all_vals = np.concatenate(list(samples.values()))
        grand_mean = all_vals.mean()
        ss_total = ((all_vals - grand_mean)**2).sum()
        ss_between = sum([len(samples[a]) * (samples[a].mean() - grand_mean)**2 for a in algos])
        eta = ss_between / (ss_total + 1e-12)
        
        anova_rows.append([c, F, p, eta])
        print(f"ANOVA: F={F:.4f}, p={p:.4g}, η²={eta:.3f}")

        # 3. Tukey HSD
        data_list = []
        labels_list = []
        for a in algos:
            data_list.extend(samples[a])
            labels_list.extend([a]*len(samples[a]))
            
        comp = mc.MultiComparison(data_list, labels_list)
        t_res = comp.tukeyhsd()
        
        significant_wins = {} 
        
        print("\nTukey HSD (Corrected Direction, g1-g2):")
        for row in t_res._results_table.data[1:]:
            g1, g2, _, p_adj, _, _, reject = row
            diff = samples[g1].mean() - samples[g2].mean()
            d_score = cohen_d(samples[g1], samples[g2])
            symbol = ">" if diff > 0 else "<"
            print(f"{g1} {symbol} {g2}: Δ={diff:.3f}, p={p_adj:.4g}, reject={reject}")
            
            if reject:
                winner = g1 if diff > 0 else g2
                loser = g2 if diff > 0 else g1
                significant_wins[(winner, loser)] = True

        # 4. Ranking
        means = {a: samples[a].mean() for a in algos}
        sorted_algos = sorted(algos, key=lambda x: means[x], reverse=True)
        numerical_winner = sorted_algos[0]
        
        actual_winners = [numerical_winner]
        for candidate in sorted_algos[1:]:
            if (numerical_winner, candidate) not in significant_wins:
                actual_winners.append(candidate)
                
        actual_losers = [a for a in algos if a not in actual_winners]
        rank_rows.append([c, ", ".join(actual_winners), ", ".join(actual_losers)])
        
    except Exception as e:
        print(f"Stats Error: {e}")

# ============================================================
# 9. OUTPUT TABLES
# ============================================================

print("\n=== PERFORMANCE TABLE (Mean ± Std, Final Window) ===")
perf_tbl = pd.DataFrame(index=algos, columns=contexts)

for c in contexts:
    for a in algos:
        raw = res[c][a]["raw"]
        window = raw[:, -50:]
        per_seed_mean = window.mean(axis=1) 
        m_val = per_seed_mean.mean()
        s_val = per_seed_mean.std() 
        perf_tbl.loc[a, c] = f"{m_val:.3f} ± {s_val:.3f}"

print(perf_tbl)

print("\n=== RANK TABLE (Winner / Loser) ===")
rank_tbl = pd.DataFrame(rank_rows, columns=["Context", "Winner(s)", "Loser(s)"])
print(rank_tbl)

# Export
rank_tbl.to_csv("rank_table.csv", index=False)
perf_tbl.to_csv("performance_table.csv")
print("\nAnalysis Complete.")