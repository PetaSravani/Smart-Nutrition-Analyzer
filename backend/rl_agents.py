import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import random

STATE_SIZE = 4  # [TimeNorm, CalorieGoalNorm, CurrentCalNorm, IsWorkout]

# --- 1. Upper Confidence Bound (UCB) ---
class UCBAgent:
    def __init__(self, action_list):
        self.actions = action_list
        self.n_actions = len(action_list)
        self.counts = np.zeros(self.n_actions)
        self.values = np.zeros(self.n_actions) 

    def select_action(self):
        c = 1.5 
        total_counts = np.sum(self.counts)
        if total_counts == 0: return np.random.choice(self.n_actions)

        ucb_values = np.zeros(self.n_actions)
        for a in range(self.n_actions):
            if self.counts[a] == 0: return a
            exploitation = self.values[a]
            exploration = c * np.sqrt(np.log(total_counts) / self.counts[a])
            ucb_values[a] = exploitation + exploration
        
        return np.argmax(ucb_values)

    def update(self, action_idx, reward):
        if 0 <= action_idx < self.n_actions:
            self.counts[action_idx] += 1
            n = self.counts[action_idx]
            self.values[action_idx] = ((n - 1) / n) * self.values[action_idx] + (1 / n) * reward

# --- 2. Deep Q-Network (DQN) ---
class DQN(nn.Module):
    def __init__(self, state_size, action_size):
        super(DQN, self).__init__()
        self.fc1 = nn.Linear(state_size, 64) # Increased neurons for larger datasets
        self.fc2 = nn.Linear(64, 64)
        self.fc3 = nn.Linear(64, action_size)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        return self.fc3(x)

class DQNAgent:
    def __init__(self, state_size, action_list):
        self.actions = action_list
        self.action_size = len(action_list)
        self.model = DQN(state_size, self.action_size)
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.001)
        self.criterion = nn.MSELoss()
        self.epsilon = 1.0 
        self.epsilon_decay = 0.995
        self.epsilon_min = 0.05

    def select_action(self, state):
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_size)
        state_t = torch.FloatTensor(state).unsqueeze(0)
        with torch.no_grad():
            q_values = self.model(state_t)
        return torch.argmax(q_values).item()

    def update(self, state, action, reward, next_state):
        # Standard DQN Update
        state_t = torch.FloatTensor(state).unsqueeze(0)
        next_state_t = torch.FloatTensor(next_state).unsqueeze(0)
        action_t = torch.LongTensor([action])
        reward_t = torch.FloatTensor([reward])

        q_values = self.model(state_t)
        q_value = q_values.gather(1, action_t.unsqueeze(1)).squeeze(1)

        with torch.no_grad():
            next_q_values = self.model(next_state_t)
            target_q = reward_t + (0.99 * next_q_values.max(1)[0])

        loss = self.criterion(q_value, target_q)
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

# --- 3. Policy Gradient ---
class PolicyNetwork(nn.Module):
    def __init__(self, state_size, action_size):
        super(PolicyNetwork, self).__init__()
        self.fc1 = nn.Linear(state_size, 128)
        self.fc2 = nn.Linear(128, action_size)
        self.softmax = nn.Softmax(dim=1)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.relu(self.fc1(x))
        return self.softmax(self.fc2(x))

class PolicyGradientAgent:
    def __init__(self, state_size, action_list):
        self.actions = action_list
        self.action_size = len(action_list)
        self.model = PolicyNetwork(state_size, self.action_size)
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.01)
        self.saved_log_probs = []
        self.rewards = []

    def select_action(self, state):
        state_t = torch.FloatTensor(state).unsqueeze(0)
        probs = self.model(state_t)
        m = torch.distributions.Categorical(probs)
        action = m.sample()
        self.saved_log_probs.append(m.log_prob(action))
        return action.item()

    def update(self, reward):
        # Simplified one-step update
        policy_loss = []
        # In a real scenario, you'd normalize rewards over a batch
        # Here we just take the single step reward
        loss = -self.saved_log_probs[-1] * reward
        
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        self.saved_log_probs = [] # Reset