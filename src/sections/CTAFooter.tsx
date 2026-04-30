import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '400+', label: 'Native integrations' },
  { value: '50K+', label: 'Active instances' },
  { value: '99.9%', label: 'Self-hosted uptime' },
  { value: '$0', label: 'To get started' },
];

export default function CTAFooter() {
  const statsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const statsEls = statsRef.current.filter(Boolean) as HTMLDivElement[];

    const st = ScrollTrigger.create({
      trigger: ctaRef.current,
      start: 'top 75%',
      onEnter: () => {
        statsEls.forEach((el, i) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: i * 0.1 }
          );
        });
      },
      once: true,
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <div
      id="cta"
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '15vh 24px 8vh',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <div ref={ctaRef}>
        <h2
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(36px, 5vw, 64px)',
            color: '#FFFFFF',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '32px',
          }}
        >
          Start building in minutes.
        </h2>

        <button
          onClick={() => window.open('https://n8n.io', '_blank')}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '16px',
            color: '#FFFFFF',
            background: '#FF6D2E',
            border: 'none',
            borderRadius: '4px',
            padding: '14px 32px',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#E55A20')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#FF6D2E')}
        >
          Deploy n8n Free
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '64px',
          marginTop: '80px',
          flexWrap: 'wrap',
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            ref={(el) => { statsRef.current[i] = el; }}
            style={{ opacity: 0, textAlign: 'center' }}
          >
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: '44px',
                color: '#FF6D2E',
                marginBottom: '8px',
                letterSpacing: '-0.02em',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: '14px',
                color: '#A1A1A1',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Footer links */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          marginTop: '80px',
          flexWrap: 'wrap',
        }}
      >
        {['Documentation', 'Community Forum', 'Enterprise', 'Security', 'Status'].map(
          (link) => (
            <a
              key={link}
              href="https://n8n.io"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: '14px',
                color: '#6B6B6B',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#A1A1A1')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6B6B')}
            >
              {link}
            </a>
          )
        )}
      </div>

      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: '12px',
          color: '#4A4A4A',
          marginTop: '24px',
        }}
      >
        &copy; 2025 n8n GmbH
      </div>
    </div>
  );
}
