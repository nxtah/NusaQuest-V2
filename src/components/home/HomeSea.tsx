function swellPath(period: number, amplitude: number, repeats: number, baseline: number, floor: number) {
  let d = `M0,${baseline}`;
  for (let i = 0; i < repeats; i++) {
    const x0 = i * period;
    d += ` Q${x0 + period * 0.25},${baseline - amplitude} ${x0 + period * 0.5},${baseline}`;
    d += ` Q${x0 + period * 0.75},${baseline + amplitude} ${x0 + period},${baseline}`;
  }
  d += ` L${period * repeats},${floor} L0,${floor} Z`;
  return d;
}

const VIEW_WIDTH = 2400;
const SWELL_HEIGHT = 220;

// Periods must divide VIEW_WIDTH into an EVEN repeat count so a -50% translateX loop
// wraps on an exact period boundary (odd/uneven counts cause a visible seam each loop).
// Layered from farthest/deepest (first, darkest) to nearest shore (last, brightest foam-tinted crest).
const SWELLS = [
  { top: '2%', period: 600, amplitude: 26, duration: 46, reverse: false, from: 'rgba(83,178,214,0.32)', to: 'rgba(20,90,140,0)' },
  { top: '16%', period: 400, amplitude: 30, duration: 38, reverse: true, from: 'rgba(96,192,224,0.36)', to: 'rgba(18,84,134,0)' },
  { top: '32%', period: 300, amplitude: 32, duration: 42, reverse: false, from: 'rgba(108,201,230,0.4)', to: 'rgba(16,78,128,0)' },
  { top: '50%', period: 240, amplitude: 30, duration: 33, reverse: true, from: 'rgba(130,213,236,0.46)', to: 'rgba(14,72,120,0)' },
  { top: '68%', period: 200, amplitude: 28, duration: 36, reverse: false, from: 'rgba(150,222,240,0.52)', to: 'rgba(12,66,112,0)' },
  { top: '84%', period: 150, amplitude: 24, duration: 28, reverse: true, from: 'rgba(190,236,248,0.62)', to: 'rgba(10,60,104,0)' },
];

const GLOWS = [
  { top: '10%', left: '18%', size: 220, duration: 14, delay: 0 },
  { top: '30%', left: '62%', size: 260, duration: 17, delay: 2 },
  { top: '52%', left: '30%', size: 240, duration: 15.5, delay: 4 },
  { top: '70%', left: '75%', size: 220, duration: 14.5, delay: 1 },
  { top: '86%', left: '45%', size: 200, duration: 13, delay: 3 },
];

const SPARKLES = [
  { top: '14%', left: '24%', size: 4, duration: 3.8, delay: 0 },
  { top: '24%', left: '70%', size: 3, duration: 3.2, delay: 0.9 },
  { top: '40%', left: '46%', size: 4, duration: 4.2, delay: 1.7 },
  { top: '55%', left: '18%', size: 3, duration: 3.5, delay: 2.4 },
  { top: '63%', left: '82%', size: 4, duration: 4, delay: 0.5 },
  { top: '78%', left: '55%', size: 3, duration: 3.6, delay: 1.3 },
];

export default function HomeSea() {
  return (
    <div className="sea">
      <div className="sea-gradient" aria-hidden="true" />

      <div className="sea-glows" aria-hidden="true">
        {GLOWS.map((g, i) => (
          <span
            key={i}
            className="sea-glow"
            style={{
              top: g.top,
              left: g.left,
              width: g.size,
              height: g.size,
              animationDuration: `${g.duration}s`,
              animationDelay: `${g.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="sea-swells" aria-hidden="true">
        {SWELLS.map((s, i) => {
          const gradientId = `swell-gradient-${i}`;
          return (
            <svg
              key={i}
              className={`sea-swell ${s.reverse ? 'sea-swell-reverse' : ''}`}
              style={{ top: s.top, animationDuration: `${s.duration}s` }}
              viewBox={`0 0 ${VIEW_WIDTH} ${SWELL_HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.from} />
                  <stop offset="100%" stopColor={s.to} />
                </linearGradient>
              </defs>
              <path
                d={swellPath(s.period, s.amplitude, VIEW_WIDTH / s.period, SWELL_HEIGHT * 0.3, SWELL_HEIGHT)}
                fill={`url(#${gradientId})`}
              />
            </svg>
          );
        })}
      </div>

      <div className="sea-sparkles" aria-hidden="true">
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="sea-sparkle"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
