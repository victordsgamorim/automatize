import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

export interface FadeProps {
  children: React.ReactNode;
  visible: boolean;
  duration?: number;
  style?: ViewStyle;
}

export const Fade: React.FC<FadeProps> = ({
  children,
  visible,
  duration = 200,
  style,
}) => {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [visible, duration, opacity]);

  return (
    <Animated.View
      style={[{ opacity }, style]}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
    >
      {children}
    </Animated.View>
  );
};
