import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';
import { animation } from '../../tokens/animation';

export interface AnimatedFadeInProps {
  children: React.ReactNode;
  delay?: number;
  type?: keyof typeof animation;
  style?: ViewStyle;
}

export const AnimatedFadeIn: React.FC<AnimatedFadeInProps> = ({
  children,
  delay = 0,
  type = 'fadeSlideIn',
  style,
}) => {
  const config = animation[type === 'delay' ? 'fadeSlideIn' : type];
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(
    new Animated.Value(
      'translateX' in config
        ? (config as any).translateX
        : 'translateY' in config
          ? (config as any).translateY
          : 0
    )
  ).current;
  const scale = useRef(
    new Animated.Value('scale' in config ? (config as any).scale : 1)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: config.duration,
        delay,
        easing: Easing.bezier(
          ...(config.easing as [number, number, number, number])
        ),
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: config.duration,
        delay,
        easing: Easing.bezier(
          ...(config.easing as [number, number, number, number])
        ),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: config.duration,
        delay,
        easing: Easing.bezier(
          ...(config.easing as [number, number, number, number])
        ),
        useNativeDriver: true,
      }),
    ]).start();
  }, [config, delay, opacity, translate, scale]);

  const animatedStyle: ViewStyle = {
    opacity,
    transform: [
      'translateX' in config
        ? { translateX: translate }
        : { translateY: translate },
      { scale },
    ] as any,
  };

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  );
};
