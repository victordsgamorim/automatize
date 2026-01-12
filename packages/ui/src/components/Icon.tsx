/**
 * Icon Components
 * Simple icon wrappers for common icons
 */

import { View, ViewStyle } from 'react-native';
import { semanticColors } from '../tokens';

const theme = semanticColors.light;

export interface IconProps {
  color?: string;
  size?: number;
  style?: ViewStyle;
}

/**
 * HomeIcon - House/home symbol
 */
export function HomeIcon({ color = theme.text.primary, size = 24, style }: IconProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <View
        style={{
          width: size * 0.7,
          height: size * 0.7,
          borderWidth: 2,
          borderColor: color,
          borderRadius: size * 0.1,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.35,
          borderRightWidth: size * 0.35,
          borderBottomWidth: size * 0.4,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          top: -size * 0.2,
        }}
      />
    </View>
  );
}

/**
 * UserIcon - Person/profile symbol
 */
export function UserIcon({ color = theme.text.primary, size = 24, style }: IconProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {/* Head */}
      <View
        style={{
          position: 'absolute',
          width: size * 0.35,
          height: size * 0.35,
          borderRadius: size * 0.175,
          borderWidth: 2,
          borderColor: color,
          top: size * 0.1,
        }}
      />
      {/* Body */}
      <View
        style={{
          position: 'absolute',
          width: size * 0.6,
          height: size * 0.35,
          borderTopLeftRadius: size * 0.1,
          borderTopRightRadius: size * 0.1,
          borderWidth: 2,
          borderColor: color,
          bottom: size * 0.05,
        }}
      />
    </View>
  );
}

/**
 * BuildingIcon - Building/organization symbol
 */
export function BuildingIcon({ color = theme.text.primary, size = 24, style }: IconProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <View
        style={{
          width: size * 0.6,
          height: size * 0.8,
          borderWidth: 2,
          borderColor: color,
          borderTopLeftRadius: size * 0.1,
          borderTopRightRadius: size * 0.1,
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingVertical: size * 0.08,
        }}
      >
        {/* Windows */}
        {[0, 1].map((row) => (
          <View key={row} style={{ flexDirection: 'row', gap: size * 0.08 }}>
            {[0, 1].map((col) => (
              <View
                key={`${row}-${col}`}
                style={{
                  width: size * 0.12,
                  height: size * 0.12,
                  borderWidth: 1,
                  borderColor: color,
                }}
              />
            ))}
          </View>
        ))}
      </View>
      {/* Door */}
      <View
        style={{
          position: 'absolute',
          width: size * 0.15,
          height: size * 0.25,
          borderWidth: 1.5,
          borderColor: color,
          bottom: 0,
        }}
      />
    </View>
  );
}

/**
 * LogOutIcon - Sign out symbol
 */
export function LogOutIcon({ color = theme.text.primary, size = 24, style }: IconProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {/* Door */}
      <View
        style={{
          position: 'absolute',
          width: size * 0.5,
          height: size * 0.65,
          borderWidth: 2,
          borderColor: color,
          borderRadius: size * 0.05,
        }}
      />
      {/* Arrow */}
      <View
        style={{
          position: 'absolute',
          right: size * 0.05,
          width: size * 0.3,
          height: 2,
          backgroundColor: color,
        }}
      />
      {/* Arrow head */}
      <View
        style={{
          position: 'absolute',
          right: size * 0.02,
          top: size * 0.35,
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.08,
          borderRightWidth: 0,
          borderTopWidth: size * 0.06,
          borderBottomWidth: size * 0.06,
          borderLeftColor: color,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: 'transparent',
        }}
      />
    </View>
  );
}
