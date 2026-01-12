/**
 * Card Component
 * Container with elevation and padding
 */

import React, { ReactNode } from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { colors, spacing } from "../tokens";

export interface CardProps extends ViewProps {
  /** Content of the card */
  children: ReactNode;
  /** Card padding */
  padding?: "sm" | "md" | "lg";
  /** Elevation level (0-3) */
  elevation?: 0 | 1 | 2 | 3;
}

const elevations = {
  0: {
    shadowColor: "transparent",
    elevation: 0,
  },
  1: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  2: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  3: {
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
};

const paddings = {
  sm: spacing[2],
  md: spacing[4],
  lg: spacing[6],
};

export const Card = React.forwardRef<View, CardProps>(
  ({ children, padding = "md", elevation = 1, style, ...props }, ref) => {
    const elevationStyle = elevations[elevation];
    const paddingValue = paddings[padding];

    return (
      <View
        ref={ref}
        style={[
          styles.card,
          elevationStyle,
          { padding: paddingValue },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = "Card";

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    overflow: "hidden",
  },
});
