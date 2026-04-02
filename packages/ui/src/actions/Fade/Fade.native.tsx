import React, { useEffect, useRef } from 'react';
import { Animated, Easing, type ViewStyle } from 'react-native';
import { animation } from '../../tokens/animation';

export interface FadeProps {
  children: React.ReactNode;
  /**
   * Controls visibility. Defaults to `true`.
   * - On mount with `true`: runs the entrance animation (opacity 0→1 + transform).
   * - Toggling: animates opacity between 0 and 1.
   */
  visible?: boolean;
  /** Staggered entrance delay in ms. */
  delay?: number;
  /** Entrance animation type from design tokens. */
  type?: 'fadeSlideIn' | 'slideRightIn' | 'testimonialIn';
  /** Transition duration in ms for visibility toggle (default uses token duration). */
  duration?: number;
  style?: ViewStyle;
}

type AnimationType = 'fadeSlideIn' | 'slideRightIn' | 'testimonialIn';

function getConfig(type: AnimationType) {
  return animation[type];
}

function getInitialTranslate(config: ReturnType<typeof getConfig>): number {
  if ('translateX' in config) return config.translateX;
  if ('translateY' in config) return config.translateY;
  return 0;
}

function getInitialScale(config: ReturnType<typeof getConfig>): number {
  if ('scale' in config) return config.scale;
  return 1;
}

export const Fade: React.FC<FadeProps> = ({
  children,
  visible = true,
  delay = 0,
  type = 'fadeSlideIn',
  duration,
  style,
}) => {
  const config = getConfig(type);
  const effectiveDuration = duration ?? config.duration;

  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(
    new Animated.Value(getInitialTranslate(config))
  ).current;
  const scale = useRef(new Animated.Value(getInitialScale(config))).current;

  useEffect(() => {
    const easingFn = Easing.bezier(
      ...(config.easing as [number, number, number, number])
    );

    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: effectiveDuration,
          delay,
          easing: easingFn,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: 0,
          duration: effectiveDuration,
          delay,
          easing: easingFn,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: effectiveDuration,
          delay,
          easing: easingFn,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: effectiveDuration,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, config, delay, effectiveDuration, opacity, translate, scale]);

  const animatedStyle = {
    opacity,
    transform: [
      'translateX' in config
        ? { translateX: translate }
        : { translateY: translate },
      { scale },
    ],
  };

  return (
    <Animated.View
      style={[animatedStyle, style]}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
    >
      {children}
    </Animated.View>
  );
};
