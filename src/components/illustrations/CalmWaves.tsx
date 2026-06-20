import React from "react";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../../theme";

type Props = {
  width?: number;
  height?: number;
};

export function CalmWaves({ width = 400, height = 160 }: Props) {
  const { colors } = useTheme();
  return (
    <Svg width={width} height={height} viewBox="0 0 400 160" style={{ position: "absolute", top: 0 }}>
      <Path
        d="M0 60 C 80 110, 140 0, 220 40 C 300 80, 340 10, 400 30 L 400 0 L 0 0 Z"
        fill={colors.primaryLight}
      />
      <Path
        d="M0 90 C 90 130, 160 50, 240 80 C 310 105, 350 60, 400 70 L 400 0 L 0 0 Z"
        fill={colors.secondaryLight}
        opacity={0.7}
      />
    </Svg>
  );
}
