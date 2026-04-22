import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import { CustomButton } from '../components';
import { ScreenName } from '../types';

type Props = { setScreen: (s: ScreenName) => void };

export const OnboardingScreen: React.FC<Props> = ({ setScreen }) => (
  <View style={styles.screenContainerCentered}>
    <Text style={styles.logo}>Smart Nutrition Analyzer</Text>
    <Text style={styles.subtitle}>Your Personalized Nutrition Guide</Text>
    <Text style={styles.description}>
      Scan food labels, understand ingredients, and get recommendations based on
      your unique health profile.
    </Text>
    <CustomButton title="Get Started" onPress={() => setScreen('Login')} />
  </View>
);
