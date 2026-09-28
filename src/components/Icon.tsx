import Svg, { Circle, Path } from "react-native-svg";
import { C } from "@/theme";

const PATHS: Record<string, string[]> = {
  home: ["M3 11 12 3l9 8", "M5 10v10h14V10", "M10 20v-6h4v6"],
  dumbbell: ["M6 7v10", "M18 7v10", "M3 10v4", "M21 10v4", "M6 12h12"],
  food: ["M6 3v5a2.5 2.5 0 0 0 5 0V3", "M8.5 10.5V21", "M17 3v18", "M17 3c3 3 3 9 0 10"],
  chart: ["M5 20v-6", "M11 20V8", "M17 20v-10", "M3 20h18"],
  chat: ["M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-4.5A8 8 0 1 1 21 12z"],
  flame: ["M12 22c4 0 7-3 7-7 0-3-2-5-3-7-.5 2-1.5 3-2.5 3.5C13 9 13 5 10 3c0 3-1 5-3 7s-2 3.5-2 5c0 4 3 7 7 7z"],
  drop: ["M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"],
  activity: ["M3 12h4l3-8 4 16 3-8h4"],
  check: ["M5 12l5 5L20 7"],
  plus: ["M12 5v14", "M5 12h14"],
  minus: ["M5 12h14"],
  x: ["M6 6l12 12", "M18 6L6 18"],
  left: ["M15 6l-6 6 6 6"],
  right: ["M9 6l6 6-6 6"],
  trophy: ["M8 21h8", "M12 17v4", "M7 4h10v5a5 5 0 0 1-10 0V4z", "M7 6H4v2a3 3 0 0 0 3 3", "M17 6h3v2a3 3 0 0 1-3 3"],
  scale: ["M6 8h12l2 12H4z", "M9 8V6a3 3 0 0 1 6 0v2"],
  timer: ["M12 9v4l3 2", "M9 2h6"],
  user: ["M4 21a8 8 0 0 1 16 0"],
  send: ["M22 2 11 13", "M22 2 15 22 11 13 2 9z"],
  trash: ["M4 7h16", "M10 11v6", "M14 11v6", "M6 7l1 13h10l1-13", "M9 7V4h6v3"],
  bolt: ["M13 2 4 14h7l-1 8 9-12h-7z"],
  play: ["M7 4v16l13-8z"],
  arrow: ["M5 12h14", "M13 6l6 6-6 6"],
  moon: ["M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"],
  edit: ["M4 20h4l10-10-4-4L4 16z", "M13 7l4 4"],
  bus: ["M5 4h14a2 2 0 0 1 2 2v11H3V6a2 2 0 0 1 2-2z", "M3 11h18", "M7 20v-3M17 20v-3", "M7 14h.01M17 14h.01"],
  tram: ["M6 3h12", "M12 3v3", "M6 6h12a2 2 0 0 1 2 2v9H4V8a2 2 0 0 1 2-2z", "M4 12h16", "M8 17l-2 4M16 17l2 4"],
  pin: ["M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  star: ["M12 3l2.7 5.6 6.2.9-4.5 4.3 1.1 6.1L12 17l-5.5 2.9 1.1-6.1L3.1 9.5l6.2-.9z"],
  search: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M20 20l-4-4"],
  card: ["M3 6h18v12H3z", "M3 10h18", "M7 15h4"],
  bell: ["M6 16V11a6 6 0 0 1 12 0v5l2 2H4z", "M10 21h4"],
  settings: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.4 3h-4l-.4 2.6a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z"],
  walk: ["M13 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z", "M9 21l3-7 3 3v4", "M9 11l3-3 3 2 3 3", "M12 8l-3 3-1 4"],
  swap: ["M7 4v16", "M4 7l3-3 3 3", "M17 20V4", "M14 17l3 3 3-3"],
  navigation: ["M21 3 9 13l3 3 2 5z", "M21 3l-7 18"],
  locate: ["M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M12 2v3M12 19v3M2 12h3M19 12h3", "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"],
  layers: ["M12 3 2 8l10 5 10-5z", "M2 13l10 5 10-5", "M2 18l10 5 10-5"],
  wifiOff: ["M2 2l20 20", "M5 12a12 12 0 0 1 4-2.5M9 16a6 6 0 0 1 3-1M12 20h.01", "M9 8a12 12 0 0 1 10 4M15 12a6 6 0 0 1 2 2"],
  info: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 11v5", "M12 8h.01"],
  wallet: ["M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M3 7V5a2 2 0 0 1 2-2h11v4", "M16 13h5v4h-5a2 2 0 0 1 0-4z"],
  wheelchair: ["M10 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z", "M9 7v6h6l3 6", "M9 13a5 5 0 1 0 6 5"],
};
export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 22, color = C.text, stroke = 2 }: { name: IconName; size?: number; color?: string; stroke?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === "timer" && <Circle cx={12} cy={13} r={8} stroke={color} strokeWidth={stroke} />}
      {name === "user" && <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={stroke} />}
      {PATHS[name].map((d, i) => <Path key={i} d={d} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill={name === "play" ? color : "none"} />)}
    </Svg>
  );
}
