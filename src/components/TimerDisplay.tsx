export type Theme =
  | "moran"
  | "sunfish"
  | "pepe"
  | "rocky"
  | "pointNemo"
  | "burjKhalifa";

export const THEME_LABELS: Record<Theme, string> = {
  moran: "Moran",
  sunfish: "Sunfish",
  pepe: "Pepe",
  rocky: "Rocky",
  pointNemo: "Point Nemo",
  burjKhalifa: "Burj Khalifa",
};

interface ThemeColors {
  frame: string;
  dialBg: string;
  sector: string;
  knob: string;
  knobCenter: string;
  /** 시작 버튼 배경 + 일반 액센트 (위에 흰 글자가 올라감) */
  text: string;
  /** 다이얼 좌상단 "focus." 라벨 색 — 다크 frame일 때만 text와 분리됨 */
  frameLabel: string;
  tickMajor: string;
  tickMinor: string;
  numberLabel: string;
}

export const THEMES: Record<Theme, ThemeColors> = {
  moran: {
    frame: "#f3e5bc",
    dialBg: "#fdfaf2",
    sector: "#b8252a",
    knob: "#f3b62b",
    knobCenter: "#ad7415",
    text: "#b8252a",
    frameLabel: "#b8252a",
    tickMajor: "#3f3f46",
    tickMinor: "#a1a1aa",
    numberLabel: "#52525b",
  },
  sunfish: {
    frame: "#b8d4e8",
    dialBg: "#fdfaf2",
    sector: "#f48fb1",
    knob: "#d6d6da",
    knobCenter: "#74747c",
    text: "#d94a82",
    frameLabel: "#d94a82",
    tickMajor: "#3f3f46",
    tickMinor: "#a1a1aa",
    numberLabel: "#52525b",
  },
  pepe: {
    frame: "#f0e8d2",
    dialBg: "#fdfaf2",
    sector: "#7fbf7e",
    knob: "#f5b577",
    knobCenter: "#c98452",
    text: "#4a8a4a",
    frameLabel: "#4a8a4a",
    tickMajor: "#3f3f46",
    tickMinor: "#a1a1aa",
    numberLabel: "#52525b",
  },
  rocky: {
    frame: "#c8c8c5",
    dialBg: "#fafaf8",
    sector: "#a3e635",
    knob: "#71717a",
    knobCenter: "#27272a",
    text: "#4d7c0f",
    frameLabel: "#4d7c0f",
    tickMajor: "#3f3f46",
    tickMinor: "#a1a1aa",
    numberLabel: "#52525b",
  },
  pointNemo: {
    frame: "#dfe6ec",
    dialBg: "#fafaf8",
    sector: "#0891b2",
    knob: "#475569",
    knobCenter: "#1e293b",
    text: "#0e7490",
    frameLabel: "#0e7490",
    tickMajor: "#3f3f46",
    tickMinor: "#a1a1aa",
    numberLabel: "#52525b",
  },
  burjKhalifa: {
    frame: "#282a36",
    dialBg: "#fdfaf2",
    sector: "#bd93f9",
    knob: "#f1fa8c",
    knobCenter: "#a8a035",
    text: "#bd93f9",
    frameLabel: "#f8f8f2",
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
  /** 표시 크기(픽셀). 기본 320. 다른 값을 주면 CSS transform 으로 스케일. */
  size?: number;
}

export function TimerDisplay({ dialFraction, theme, flash, size }: Props) {
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

  const card = (
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
          style={{ color: colors.frameLabel }}
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
  );

  if (size && size !== cardSize) {
    const scale = size / cardSize;
    return (
      <div style={{ width: size, height: size, position: "relative" }}>
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {card}
        </div>
      </div>
    );
  }

  return <div className="flex flex-col items-center">{card}</div>;
}
