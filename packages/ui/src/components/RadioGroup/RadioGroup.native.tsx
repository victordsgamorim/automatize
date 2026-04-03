/**
 * RadioGroup — React Native placeholder.
 * TODO: Implement native RadioGroup when needed.
 */

import React from 'react';
import { View, Text } from 'react-native';

export function RadioGroup({ children }: { children: React.ReactNode }) {
  return <View>{children}</View>;
}

export function RadioGroupItem({ value }: { value: string }) {
  return <Text>{value}</Text>;
}
