/**
 * RadioGroup — React Native placeholder.
 * TODO: Implement native RadioGroup when needed.
 */

import React from 'react';
import { View, Text } from 'react-native';

export function RadioGroup({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <View>{children}</View>;
}

export function RadioGroupItem({
  value,
}: {
  value: string;
}): React.JSX.Element {
  return <Text>{value}</Text>;
}
