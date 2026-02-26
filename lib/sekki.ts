import sekkiDatesData from "@/data/sekki-dates.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AnimationType =
  | "particle"
  | "wave"
  | "flare"
  | "heatHaze"
  | "crystal"
  | "breath";

export interface AnimationParams {
  /** Particle/effect count */
  count?: number;
  /** Movement speed multiplier */
  speed?: number;
  /** Size range [min, max] in px */
  size?: [number, number];
  /** Optional particle variant label */
  variant?: string;
  /** Opacity range [min, max] */
  opacity?: [number, number];
  /** Sway / oscillation amplitude */
  sway?: number;
  /** Wave frequency */
  frequency?: number;
  /** Wave amplitude */
  amplitude?: number;
  /** Intensity multiplier for haze / flare */
  intensity?: number;
  /** Glow radius in px */
  glow?: number;
  /** Pulse period in ms */
  pulsePeriod?: number;
  /** Scale range [min, max] */
  scale?: [number, number];
}

export interface SekkiData {
  /** 節気名 (e.g. "立春") */
  name: string;
  /** 読み仮名 (e.g. "りっしゅん") */
  reading: string;
  /** 説明文 */
  description: string;
  /** Approximate start month (1-12) */
  startMonth: number;
  /** Approximate start day (1-31) */
  startDay: number;
  /** Background gradient: [color1, color2, angleDeg] */
  bgGradient: [string, string, number];
  /** Canvas animation type */
  animationType: AnimationType;
  /** Canvas animation parameters */
  animationParams: AnimationParams;
  /** Card border color (rgba) */
  cardBorderColor: string;
  /** Card shadow color (rgba) */
  cardShadowColor: string;
}

// ---------------------------------------------------------------------------
// 24 Solar Terms Data
// ---------------------------------------------------------------------------

export const SEKKI_DATA: SekkiData[] = [
  // ── 春 Spring ──────────────────────────────────────────────
  {
    name: "立春",
    reading: "りっしゅん",
    description: "春の気配が立ち始める頃",
    startMonth: 2,
    startDay: 4,
    bgGradient: ["#8B9DC3", "#6B7FA0", 160],
    animationType: "breath",
    animationParams: {
      pulsePeriod: 4000,
      intensity: 0.3,
      scale: [0.98, 1.02],
    },
    cardBorderColor: "rgba(255,182,193,0.15)",
    cardShadowColor: "rgba(139,157,195,0.25)",
  },
  {
    name: "雨水",
    reading: "うすい",
    description: "雪が雨に変わり、氷が溶け始める頃",
    startMonth: 2,
    startDay: 19,
    bgGradient: ["#9B8FB4", "#7D7399", 160],
    animationType: "particle",
    animationParams: {
      variant: "rain",
      count: 60,
      speed: 3.0,
      size: [1, 3],
      opacity: [0.2, 0.5],
    },
    cardBorderColor: "rgba(155,143,180,0.15)",
    cardShadowColor: "rgba(125,115,153,0.25)",
  },
  {
    name: "啓蟄",
    reading: "けいちつ",
    description: "冬眠していた虫たちが目を覚ます頃",
    startMonth: 3,
    startDay: 5,
    bgGradient: ["#A8988A", "#C8B8A0", 160],
    animationType: "breath",
    animationParams: {
      pulsePeriod: 5000,
      intensity: 0.25,
      scale: [0.97, 1.03],
      sway: 2,
    },
    cardBorderColor: "rgba(168,152,138,0.15)",
    cardShadowColor: "rgba(200,184,160,0.25)",
  },
  {
    name: "春分",
    reading: "しゅんぶん",
    description: "昼と夜の長さがほぼ等しくなる頃",
    startMonth: 3,
    startDay: 20,
    bgGradient: ["#D4B8A0", "#E8C8B8", 150],
    animationType: "flare",
    animationParams: {
      intensity: 0.5,
      glow: 80,
      pulsePeriod: 3000,
      opacity: [0.15, 0.4],
    },
    cardBorderColor: "rgba(212,184,160,0.15)",
    cardShadowColor: "rgba(232,200,184,0.25)",
  },
  {
    name: "清明",
    reading: "せいめい",
    description: "すべてのものが清らかで生き生きする頃",
    startMonth: 4,
    startDay: 4,
    bgGradient: ["#F5C6D0", "#FDDDE6", 160],
    animationType: "particle",
    animationParams: {
      variant: "sakura",
      count: 35,
      speed: 1.2,
      size: [6, 14],
      opacity: [0.4, 0.8],
      sway: 4,
    },
    cardBorderColor: "rgba(245,198,208,0.2)",
    cardShadowColor: "rgba(253,221,230,0.3)",
  },
  {
    name: "穀雨",
    reading: "こくう",
    description: "穀物を潤す春の雨が降る頃",
    startMonth: 4,
    startDay: 20,
    bgGradient: ["#A8D8A8", "#C8E8B8", 150],
    animationType: "particle",
    animationParams: {
      variant: "gold",
      count: 25,
      speed: 0.8,
      size: [3, 8],
      opacity: [0.3, 0.7],
      sway: 2,
    },
    cardBorderColor: "rgba(168,216,168,0.15)",
    cardShadowColor: "rgba(200,232,184,0.25)",
  },

  // ── 夏 Summer ──────────────────────────────────────────────
  {
    name: "立夏",
    reading: "りっか",
    description: "夏の気配が立ち始める頃",
    startMonth: 5,
    startDay: 5,
    bgGradient: ["#A0D8D0", "#B8E8E0", 140],
    animationType: "wave",
    animationParams: {
      frequency: 0.02,
      amplitude: 20,
      speed: 1.0,
      opacity: [0.1, 0.3],
    },
    cardBorderColor: "rgba(160,216,208,0.15)",
    cardShadowColor: "rgba(184,232,224,0.25)",
  },
  {
    name: "小満",
    reading: "しょうまん",
    description: "草木が茂り、万物が満ち始める頃",
    startMonth: 5,
    startDay: 21,
    bgGradient: ["#6DB070", "#88C488", 160],
    animationType: "breath",
    animationParams: {
      pulsePeriod: 4500,
      intensity: 0.3,
      scale: [0.98, 1.02],
    },
    cardBorderColor: "rgba(109,176,112,0.15)",
    cardShadowColor: "rgba(136,196,136,0.25)",
  },
  {
    name: "芒種",
    reading: "ぼうしゅ",
    description: "稲や麦などの種を蒔く頃",
    startMonth: 6,
    startDay: 5,
    bgGradient: ["#8BA898", "#A0B8A8", 170],
    animationType: "particle",
    animationParams: {
      variant: "rain",
      count: 80,
      speed: 3.5,
      size: [1, 2],
      opacity: [0.15, 0.4],
    },
    cardBorderColor: "rgba(139,168,152,0.15)",
    cardShadowColor: "rgba(160,184,168,0.25)",
  },
  {
    name: "夏至",
    reading: "げし",
    description: "一年で最も昼が長くなる頃",
    startMonth: 6,
    startDay: 21,
    bgGradient: ["#8898A8", "#A0A8B8", 170],
    animationType: "particle",
    animationParams: {
      variant: "rain",
      count: 100,
      speed: 4.0,
      size: [1, 3],
      opacity: [0.2, 0.5],
    },
    cardBorderColor: "rgba(136,152,168,0.15)",
    cardShadowColor: "rgba(160,168,184,0.25)",
  },
  {
    name: "小暑",
    reading: "しょうしょ",
    description: "暑さが本格的になり始める頃",
    startMonth: 7,
    startDay: 7,
    bgGradient: ["#F0A830", "#F8C040", 140],
    animationType: "heatHaze",
    animationParams: {
      intensity: 0.6,
      speed: 0.8,
      frequency: 0.03,
      amplitude: 8,
    },
    cardBorderColor: "rgba(240,168,48,0.15)",
    cardShadowColor: "rgba(248,192,64,0.25)",
  },
  {
    name: "大暑",
    reading: "たいしょ",
    description: "一年で最も暑さが厳しい頃",
    startMonth: 7,
    startDay: 22,
    bgGradient: ["#E88020", "#F09830", 140],
    animationType: "heatHaze",
    animationParams: {
      intensity: 0.8,
      speed: 1.0,
      frequency: 0.04,
      amplitude: 12,
    },
    cardBorderColor: "rgba(232,128,32,0.15)",
    cardShadowColor: "rgba(240,152,48,0.25)",
  },

  // ── 秋 Autumn ──────────────────────────────────────────────
  {
    name: "立秋",
    reading: "りっしゅう",
    description: "秋の気配が立ち始める頃",
    startMonth: 8,
    startDay: 7,
    bgGradient: ["#E89060", "#F0A870", 150],
    animationType: "heatHaze",
    animationParams: {
      intensity: 0.4,
      speed: 0.6,
      frequency: 0.02,
      amplitude: 6,
    },
    cardBorderColor: "rgba(232,144,96,0.15)",
    cardShadowColor: "rgba(240,168,112,0.25)",
  },
  {
    name: "処暑",
    reading: "しょしょ",
    description: "暑さが和らぎ始める頃",
    startMonth: 8,
    startDay: 23,
    bgGradient: ["#D8A080", "#E8B898", 155],
    animationType: "particle",
    animationParams: {
      variant: "dust",
      count: 20,
      speed: 0.5,
      size: [2, 5],
      opacity: [0.15, 0.35],
      sway: 3,
    },
    cardBorderColor: "rgba(216,160,128,0.15)",
    cardShadowColor: "rgba(232,184,152,0.25)",
  },
  {
    name: "白露",
    reading: "はくろ",
    description: "草花に朝露が宿り始める頃",
    startMonth: 9,
    startDay: 7,
    bgGradient: ["#D8D0C8", "#E8E0D8", 150],
    animationType: "flare",
    animationParams: {
      variant: "sparkle",
      intensity: 0.35,
      glow: 40,
      pulsePeriod: 2500,
      count: 15,
      opacity: [0.2, 0.6],
    },
    cardBorderColor: "rgba(216,208,200,0.15)",
    cardShadowColor: "rgba(232,224,216,0.25)",
  },
  {
    name: "秋分",
    reading: "しゅうぶん",
    description: "昼と夜の長さがほぼ等しくなる頃",
    startMonth: 9,
    startDay: 22,
    bgGradient: ["#B8A890", "#D0B898", 160],
    animationType: "wave",
    animationParams: {
      frequency: 0.015,
      amplitude: 15,
      speed: 0.7,
      opacity: [0.1, 0.25],
    },
    cardBorderColor: "rgba(184,168,144,0.15)",
    cardShadowColor: "rgba(208,184,152,0.25)",
  },
  {
    name: "寒露",
    reading: "かんろ",
    description: "露が冷たく感じられる頃",
    startMonth: 10,
    startDay: 8,
    bgGradient: ["#D4A830", "#E8C040", 145],
    animationType: "particle",
    animationParams: {
      variant: "kinmokusei",
      count: 40,
      speed: 0.6,
      size: [3, 7],
      opacity: [0.4, 0.8],
      sway: 5,
    },
    cardBorderColor: "rgba(212,168,48,0.2)",
    cardShadowColor: "rgba(232,192,64,0.3)",
  },
  {
    name: "霜降",
    reading: "そうこう",
    description: "霜が降り始める頃",
    startMonth: 10,
    startDay: 23,
    bgGradient: ["#A03040", "#B84858", 160],
    animationType: "particle",
    animationParams: {
      variant: "leaves",
      count: 25,
      speed: 1.0,
      size: [8, 16],
      opacity: [0.4, 0.7],
      sway: 6,
    },
    cardBorderColor: "rgba(160,48,64,0.15)",
    cardShadowColor: "rgba(184,72,88,0.25)",
  },

  // ── 冬 Winter ──────────────────────────────────────────────
  {
    name: "立冬",
    reading: "りっとう",
    description: "冬の気配が立ち始める頃",
    startMonth: 11,
    startDay: 7,
    bgGradient: ["#8B5060", "#A06878", 160],
    animationType: "particle",
    animationParams: {
      variant: "dust",
      count: 15,
      speed: 0.4,
      size: [2, 4],
      opacity: [0.1, 0.3],
    },
    cardBorderColor: "rgba(139,80,96,0.15)",
    cardShadowColor: "rgba(160,104,120,0.25)",
  },
  {
    name: "小雪",
    reading: "しょうせつ",
    description: "わずかに雪が降り始める頃",
    startMonth: 11,
    startDay: 22,
    bgGradient: ["#708090", "#8898A8", 165],
    animationType: "particle",
    animationParams: {
      variant: "snow",
      count: 30,
      speed: 0.8,
      size: [2, 5],
      opacity: [0.3, 0.6],
      sway: 3,
    },
    cardBorderColor: "rgba(112,128,144,0.15)",
    cardShadowColor: "rgba(136,152,168,0.25)",
  },
  {
    name: "大雪",
    reading: "たいせつ",
    description: "本格的に雪が降り積もる頃",
    startMonth: 12,
    startDay: 7,
    bgGradient: ["#6878A0", "#8090B0", 170],
    animationType: "particle",
    animationParams: {
      variant: "snow",
      count: 50,
      speed: 1.2,
      size: [3, 8],
      opacity: [0.4, 0.8],
      sway: 4,
    },
    cardBorderColor: "rgba(104,120,160,0.15)",
    cardShadowColor: "rgba(128,144,176,0.25)",
  },
  {
    name: "冬至",
    reading: "とうじ",
    description: "一年で最も夜が長くなる頃",
    startMonth: 12,
    startDay: 21,
    bgGradient: ["#1A2040", "#283058", 180],
    animationType: "particle",
    animationParams: {
      variant: "stars",
      count: 60,
      speed: 0.3,
      size: [1, 4],
      opacity: [0.3, 0.9],
      sway: 1,
    },
    cardBorderColor: "rgba(26,32,64,0.15)",
    cardShadowColor: "rgba(40,48,88,0.3)",
  },
  {
    name: "小寒",
    reading: "しょうかん",
    description: "寒さが一段と厳しくなる頃",
    startMonth: 1,
    startDay: 5,
    bgGradient: ["#B0C8E0", "#C8D8F0", 170],
    animationType: "crystal",
    animationParams: {
      count: 20,
      speed: 0.4,
      size: [4, 10],
      opacity: [0.3, 0.7],
      glow: 30,
      pulsePeriod: 3500,
    },
    cardBorderColor: "rgba(176,200,224,0.15)",
    cardShadowColor: "rgba(200,216,240,0.25)",
  },
  {
    name: "大寒",
    reading: "だいかん",
    description: "一年で最も寒さが厳しい頃",
    startMonth: 1,
    startDay: 20,
    bgGradient: ["#D8E0E8", "#E8EFF5", 170],
    animationType: "crystal",
    animationParams: {
      count: 30,
      speed: 0.3,
      size: [5, 12],
      opacity: [0.4, 0.8],
      glow: 40,
      pulsePeriod: 4000,
    },
    cardBorderColor: "rgba(216,224,232,0.15)",
    cardShadowColor: "rgba(232,239,245,0.25)",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sekkiDates = sekkiDatesData as Record<string, Record<string, string>>;

/**
 * Ordered list of sekki names matching the calendar year order
 * (小寒 is first because it starts in January).
 */
const SEKKI_CALENDAR_ORDER: string[] = [
  "小寒", "大寒", "立春", "雨水", "啓蟄", "春分",
  "清明", "穀雨", "立夏", "小満", "芒種", "夏至",
  "小暑", "大暑", "立秋", "処暑", "白露", "秋分",
  "寒露", "霜降", "立冬", "小雪", "大雪", "冬至",
];

/** Lookup map: name -> SekkiData */
const sekkiByName = new Map<string, SekkiData>(
  SEKKI_DATA.map((s) => [s.name, s])
);

/**
 * Get the exact Date for a sekki in a given year from the dates table.
 * Falls back to the approximate month/day from SEKKI_DATA.
 */
function getSekkiDate(name: string, year: number): Date {
  const yearData = sekkiDates[String(year)];
  if (yearData && yearData[name]) {
    return new Date(yearData[name] + "T00:00:00");
  }
  const data = sekkiByName.get(name);
  if (!data) {
    return new Date(year, 0, 1);
  }
  return new Date(year, data.startMonth - 1, data.startDay);
}

/**
 * Build a sorted timeline of sekki dates surrounding the given date.
 * Returns entries for the previous year's 冬至 through the next year's 小寒
 * to handle year boundaries.
 */
function buildTimeline(
  date: Date
): Array<{ name: string; date: Date; data: SekkiData }> {
  const year = date.getFullYear();
  const timeline: Array<{ name: string; date: Date; data: SekkiData }> = [];

  for (const yr of [year - 1, year, year + 1]) {
    for (const name of SEKKI_CALENDAR_ORDER) {
      const data = sekkiByName.get(name);
      if (!data) continue;
      timeline.push({
        name,
        date: getSekkiDate(name, yr),
        data,
      });
    }
  }

  timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
  return timeline;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the current SekkiData based on the given date.
 * The current sekki is the most recent one whose start date is <= the given date.
 */
export function getCurrentSekki(date: Date = new Date()): SekkiData {
  const timeline = buildTimeline(date);
  let current = timeline[0];

  for (const entry of timeline) {
    if (entry.date.getTime() <= date.getTime()) {
      current = entry;
    } else {
      break;
    }
  }

  return current.data;
}

export interface SekkiTransition {
  current: SekkiData;
  next: SekkiData;
  /** 0-1 progress through transition (0 = fully current, 1 = fully next) */
  progress: number;
}

/**
 * Returns the current sekki, the next sekki, and a progress value (0-1)
 * representing the transition between them.
 *
 * The transition zone is 3 days before and after the next sekki's start date
 * (6-day total window). Outside this window, progress is 0 or 1.
 */
export function getSekkiTransition(
  date: Date = new Date()
): SekkiTransition {
  const timeline = buildTimeline(date);
  const now = date.getTime();

  let currentIdx = 0;
  for (let i = 0; i < timeline.length; i++) {
    if (timeline[i].date.getTime() <= now) {
      currentIdx = i;
    } else {
      break;
    }
  }

  const nextIdx = Math.min(currentIdx + 1, timeline.length - 1);
  const current = timeline[currentIdx];
  const next = timeline[nextIdx];

  const TRANSITION_DAYS = 3;
  const TRANSITION_MS = TRANSITION_DAYS * 24 * 60 * 60 * 1000;

  const nextStart = next.date.getTime();
  const transitionBegin = nextStart - TRANSITION_MS;
  const transitionEnd = nextStart + TRANSITION_MS;

  let progress = 0;
  if (now >= transitionBegin && now <= transitionEnd) {
    progress = (now - transitionBegin) / (transitionEnd - transitionBegin);
  } else if (now > transitionEnd) {
    progress = 1;
  }

  return {
    current: current.data,
    next: next.data,
    progress: Math.max(0, Math.min(1, progress)),
  };
}

/**
 * Linear interpolation between two hex colors.
 * Supports 3-digit (#RGB), 6-digit (#RRGGBB), and 8-digit (#RRGGBBAA) hex.
 */
export function lerpColor(color1: string, color2: string, t: number): string {
  const clamp = Math.max(0, Math.min(1, t));

  const parse = (hex: string): [number, number, number] => {
    let h = hex.replace("#", "");
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return [r, g, b];
  };

  const [r1, g1, b1] = parse(color1);
  const [r2, g2, b2] = parse(color2);

  const r = Math.round(r1 + (r2 - r1) * clamp);
  const g = Math.round(g1 + (g2 - g1) * clamp);
  const b = Math.round(b1 + (b2 - b1) * clamp);

  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Linearly interpolates an rgba() color string.
 * Expects format: "rgba(R,G,B,A)"
 */
function lerpRgba(rgba1: string, rgba2: string, t: number): string {
  const clamp = Math.max(0, Math.min(1, t));

  const parse = (s: string): [number, number, number, number] => {
    const match = s.match(
      /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/
    );
    if (!match) return [0, 0, 0, 1];
    return [
      parseInt(match[1]),
      parseInt(match[2]),
      parseInt(match[3]),
      match[4] !== undefined ? parseFloat(match[4]) : 1,
    ];
  };

  const [r1, g1, b1, a1] = parse(rgba1);
  const [r2, g2, b2, a2] = parse(rgba2);

  const r = Math.round(r1 + (r2 - r1) * clamp);
  const g = Math.round(g1 + (g2 - g1) * clamp);
  const b = Math.round(b1 + (b2 - b1) * clamp);
  const a = +(a1 + (a2 - a1) * clamp).toFixed(3);

  return `rgba(${r},${g},${b},${a})`;
}

export interface InterpolatedSekkiStyle {
  bgGradient: string;
  cardBorderColor: string;
  cardShadowColor: string;
}

/**
 * Returns interpolated CSS values for the current sekki transition state.
 * During transition zones (3 days before/after), values smoothly blend
 * between the current and next sekki.
 */
export function getInterpolatedSekkiStyle(
  date: Date = new Date()
): InterpolatedSekkiStyle {
  const { current, next, progress } = getSekkiTransition(date);

  if (progress === 0) {
    const [c1, c2, angle] = current.bgGradient;
    return {
      bgGradient: `linear-gradient(${angle}deg, ${c1}, ${c2})`,
      cardBorderColor: current.cardBorderColor,
      cardShadowColor: current.cardShadowColor,
    };
  }

  if (progress === 1) {
    const [c1, c2, angle] = next.bgGradient;
    return {
      bgGradient: `linear-gradient(${angle}deg, ${c1}, ${c2})`,
      cardBorderColor: next.cardBorderColor,
      cardShadowColor: next.cardShadowColor,
    };
  }

  // Interpolate gradient colors
  const gradColor1 = lerpColor(
    current.bgGradient[0],
    next.bgGradient[0],
    progress
  );
  const gradColor2 = lerpColor(
    current.bgGradient[1],
    next.bgGradient[1],
    progress
  );
  const gradAngle = Math.round(
    current.bgGradient[2] +
      (next.bgGradient[2] - current.bgGradient[2]) * progress
  );

  // Interpolate card colors
  const borderColor = lerpRgba(
    current.cardBorderColor,
    next.cardBorderColor,
    progress
  );
  const shadowColor = lerpRgba(
    current.cardShadowColor,
    next.cardShadowColor,
    progress
  );

  return {
    bgGradient: `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})`,
    cardBorderColor: borderColor,
    cardShadowColor: shadowColor,
  };
}
