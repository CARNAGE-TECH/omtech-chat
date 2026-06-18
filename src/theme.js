export const getPalette = (theme = 'dark') => {
  const isDark = theme === 'dark';

  return {
    isDark,
    bg: isDark ? '#0a0a0a' : '#f3f6fb',
    surface: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    surfaceStrong: isDark ? '#111111' : '#ffffff',
    elevated: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(255,255,255,0.96)',
    input: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)',
    accentBorder: isDark ? 'rgba(24,95,165,0.28)' : 'rgba(24,95,165,0.2)',
    text: isDark ? '#ffffff' : '#111827',
    muted: isDark ? 'rgba(255,255,255,0.48)' : '#64748b',
    subtle: isDark ? 'rgba(255,255,255,0.28)' : '#94a3b8',
    icon: isDark ? '#90cdf4' : '#185FA5',
    danger: '#fc8181',
    success: '#86efac',
    buttonText: '#ffffff',
    mineText: '#ffffff',
    otherBubble: isDark ? 'rgba(255,255,255,0.07)' : '#e8eef7',
    otherText: isDark ? '#ffffff' : '#111827',
    shadow: isDark ? 'none' : '0 10px 30px rgba(15,23,42,0.08)'
  };
};

export const accentGradient = (color = '#185FA5') => `linear-gradient(135deg, ${color}, #2b8dd4)`;
