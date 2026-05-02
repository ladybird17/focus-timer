export type Theme = "butter" | "sky" | "ivory";

interface ThemeColors {
  frame: string;
  dialBg: string;
  sector: string;
  knob: string;
  knobCenter: string;
  text: string;
  tickMajor: string;
  tickMinor: string;
  numberLabel: string;
}

export const THEMES: Record<Theme, ThemeColors> = {
  butter: {
    frame: "#f1e3bd",
    dialBg: "#fdfaf2",
    sector: "#1d3c8c",
    knob: "#f5b228",
    knobCenter: "#b07112",
    text: "#1d3c8c",
    tickMajor: "#3f3f46",
    tickMinor: "#a1a1aa",
    numberLabel: "#52525b",
  },
  sky: {
    frame: "#82a8c4",
    dialBg: "#fdfaf2",
    sector: "#d62a26",
    knob: "#d4d4d8",
    knobCenter: "#71717a",
    text: "#d62a26",
    tickMajor: "#3f3f46",
    tickMinor: "#a1a1aa",
    numberLabel: "#52525b",
  },
  ivory: {
    frame: "#ebe2c5",
    dialBg: "#fdfaf2",
    sector: "#4f7d4a",
    knob: "#e58f3a",
    knobCenter: "#a85d1e",
    text: "#3d5f37",
    tickMajor: "#3f3f46",
    tickMinor: "#a1a1aa",
    numberLabel: "#52525b",
  },
};

interface Props {
  /** 60분 다이얼 기준으로 채워질 부채꼴 비율. 0..1 (1 = 한 바퀴) */
  dialFraction: number;
  theme: Theme;
  /** true면 다이얼 안쪽이 밝게 빛남 (종료 알림 동기) */
  flash?: boolean;
}

export function TimerDisplay({ dialFraction, theme, flash }: Props) {
  const colors = THEMES[theme];

  const cardSize = 320;
  const dialSize = 280;
  const cx = dialSize / 2;
  const cy = dialSize / 2;
  const tickOuterR = 132;
  const tickInnerMajor = 121;
  const tickInnerMinor = 126;
  const labelR = 109;
  const sectorR = 90;
  const knobOuter = 18;
  const knobInner = 5;

  const fraction = Math.min(1, Math.max(0, dialFraction));
  const angle = fraction * 2 * Math.PI;

  let sectorPath = "";
  if (fraction >= 0.9999) {
    sectorPath =
      `M ${cx} ${cy - sectorR} ` +
      `A ${sectorR} ${sectorR} 0 1 1 ${cx - 0.001} ${cy - sectorR} Z`;
  } else if (fraction > 0) {
    const endAngle = -Math.PI / 2 + angle;
    const endX = cx + sectorR * Math.cos(endAngle);
    const endY = cy + sectorR * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    sectorPath =
      `M ${cx} ${cy} ` +
      `L ${cx} ${cy - sectorR} ` +
      `A ${sectorR} ${sectorR} 0 ${largeArc} 1 ${endX} ${endY} Z`;
  }

  const ticks: React.ReactElement[] = [];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
    const isMajor = i % 5 === 0;
    const innerR = isMajor ? tickInnerMajor : tickInnerMinor;
    const x1 = cx + innerR * Math.cos(a);
    const y1 = cy + innerR * Math.sin(a);
    const x2 = cx + tickOuterR * Math.cos(a);
    const y2 = cy + tickOuterR * Math.sin(a);
    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isMajor ? colors.tickMajor : colors.tickMinor}
        strokeWidth={isMajor ? 1.5 : 0.7}
        strokeLinecap="round"
      />,
    );
  }

  const labels: React.ReactElement[] = [];
  for (let i = 0; i < 12; i++) {
    const minute = i * 5;
    const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const x = cx + labelR * Math.cos(a);
    const y = cy + labelR * Math.sin(a);
    labels.push(
      <text
        key={i}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.numberLabel}
        fontSize="11"
        fontFamily="ui-monospace, monospace"
      >
        {minute}
      </text>,
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-3xl shadow-md"
        style={{
          width: cardSize,
          height: cardSize,
          backgroundColor: colors.frame,
        }}
      >
        <div
          className="absolute top-3 left-4 text-[11px] font-semibold tracking-[0.18em] lowercase"
          style={{ color: colors.text }}
        >
          focus.
        </div>
        <div
          className="absolute rounded-full"
          style={{
            width: dialSize,
            height: dialSize,
            top: (cardSize - dialSize) / 2,
            left: (cardSize - dialSize) / 2,
            backgroundColor: colors.dialBg,
          }}
        >
          <svg
            width={dialSize}
            height={dialSize}
            viewBox={`0 0 ${dialSize} ${dialSize}`}
            style={{ display: "block" }}
          >
            {ticks}
            {labels}
            {sectorPath && <path d={sectorPath} fill={colors.sector} />}
            <circle cx={cx} cy={cy} r={knobOuter} fill={colors.knob} />
            <circle cx={cx} cy={cy} r={knobInner} fill={colors.knobCenter} />
          </svg>
          <div
            className="absolute inset-0 rounded-full pointer-events-none transition-opacity"
            style={{
              backgroundColor: "#fff7c2",
              opacity: flash ? 0.85 : 0,
              transitionDuration: flash ? "30ms" : "120ms",
              boxShadow: flash ? "0 0 60px 20px rgba(255,247,194,0.8)" : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
