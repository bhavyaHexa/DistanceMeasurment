export const MEASURE_COLORS = [
  { line: '#F2B705', tagBg: '#FFE89A', tagText: '#5A4300' },
  { line: '#29B6D6', tagBg: '#BDEFFA', tagText: '#0B4552' },
  { line: '#F0609A', tagBg: '#FFD0E3', tagText: '#6E1B3F' },
  { line: '#F2803A', tagBg: '#FFDCC4', tagText: '#6A2C05' },
  { line: '#8B6CFF', tagBg: '#DDD3FF', tagText: '#2A1A6B' },
  { line: '#1FA89A', tagBg: '#C4EFEA', tagText: '#0B3F3A' },
] as const;

export const measureColor = (i: number) => MEASURE_COLORS[i % MEASURE_COLORS.length];
