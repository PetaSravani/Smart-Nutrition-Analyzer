import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { theme } from '../theme';
import { ScreenName } from '../types';

// ---------------------------------------------------------------------------
// CustomButton
// ---------------------------------------------------------------------------
type CustomButtonProps = {
  title: string;
  onPress: () => void;
  style?: object;
  textStyle?: object;
  disabled?: boolean;
  icon?: string;
  secondary?: boolean;
};

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled,
  icon,
  secondary,
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      secondary && styles.secondaryButton,
      disabled && styles.buttonDisabled,
      style,
    ]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
  >
    {icon && <Text style={styles.buttonIcon}>{icon}</Text>}
    <Text
      style={[
        styles.buttonText,
        secondary && styles.secondaryButtonText,
        textStyle,
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

// ---------------------------------------------------------------------------
// Checkbox
// ---------------------------------------------------------------------------
type CheckboxProps = {
  label: string;
  isSelected: boolean;
  onValueChange: () => void;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  isSelected,
  onValueChange,
}) => (
  <Pressable style={styles.checkboxContainer} onPress={onValueChange}>
    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
      {isSelected && <Text style={styles.checkboxCheck}>✓</Text>}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </Pressable>
);

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
type HeaderProps = {
  title: string;
  onBack?: () => void;
};

export const Header: React.FC<HeaderProps> = ({ title, onBack }) => (
  <View style={styles.header}>
    <View style={styles.headerNav}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <View style={styles.backButtonInner}>
            <Text style={styles.headerButtonText}>{'<'}</Text>
            <Text style={styles.headerButtonLabel}>Back</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={styles.headerNav} />
  </View>
);

// ---------------------------------------------------------------------------
// BottomNav
// ---------------------------------------------------------------------------
type BottomNavProps = {
  setScreen: (screen: ScreenName) => void;
  activeScreen: ScreenName;
};

export const BottomNav: React.FC<BottomNavProps> = ({
  setScreen,
  activeScreen,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const navigate = (screen: ScreenName) => {
    setScreen(screen);
    setMenuVisible(false);
  };

  return (
    <>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigate('Home')}
        >
          <Text
            style={[
              styles.navIcon,
              activeScreen === 'Home' && styles.navTextActive,
            ]}
          >
            🍎
          </Text>
          <Text
            style={[
              styles.navLabel,
              activeScreen === 'Home' && styles.navTextActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={[styles.navIcon, menuVisible && styles.navTextActive]}>
            ☰
          </Text>
          <Text style={[styles.navLabel, menuVisible && styles.navTextActive]}>
            Menu
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContent}>
            {(
              [
                { screen: 'Reports' as ScreenName, label: '📊 Reports' },
                {
                  screen: 'FoodReport' as ScreenName,
                  label: '📄 Daily Report',
                },
                {
                  screen: 'FoodChoices' as ScreenName,
                  label: '🤖 Smart Choices',
                },
                {
                  screen: 'AllergyTracker' as ScreenName,
                  label: '🚨 Allergy Log',
                },
                { screen: 'Settings' as ScreenName, label: '⚙️ Settings' },
              ] as { screen: ScreenName; label: string }[]
            ).map(({ screen, label }) => (
              <TouchableOpacity
                key={screen}
                style={styles.menuButton}
                onPress={() => navigate(screen)}
              >
                <Text
                  style={[
                    styles.menuButtonText,
                    activeScreen === screen && styles.menuButtonActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

// ---------------------------------------------------------------------------
// Component-specific styles (shared, non-layout styles)
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // Button
  button: {
    backgroundColor: theme.primaryColor,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.primaryColor,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButtonText: { color: theme.primaryColor },
  buttonIcon: { fontSize: 18, marginRight: 8 },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.primaryColor,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: { backgroundColor: theme.primaryColor },
  checkboxCheck: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  checkboxLabel: { fontSize: 16, color: theme.textDark },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    paddingTop: Platform.OS === 'android' ? 15 : 10,
    height: Platform.OS === 'android' ? 60 : 50,
    backgroundColor: theme.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: theme.textDark },
  headerNav: { width: 60, alignItems: 'flex-start' },
  headerButton: { padding: 8 },
  backButtonInner: { flexDirection: 'row', alignItems: 'center' },
  headerButtonText: {
    fontSize: 16,
    color: theme.primaryDark,
    fontWeight: '700',
  },
  headerButtonLabel: {
    fontSize: 14,
    color: theme.primaryDark,
    fontWeight: '600',
    marginLeft: 2,
  },

  // BottomNav
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: theme.backgroundWhite,
    borderTopWidth: 1,
    borderTopColor: theme.borderColor,
  },
  navButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navIcon: { fontSize: 22, color: theme.textLight },
  navLabel: { fontSize: 10, color: theme.textLight, marginTop: 2 },
  navTextActive: { color: theme.primaryColor },

  // Menu modal
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: theme.backgroundWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  menuButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  menuButtonText: { fontSize: 17, color: theme.textDark },
  menuButtonActive: { color: theme.primaryColor, fontWeight: '600' },
});
