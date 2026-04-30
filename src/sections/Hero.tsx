import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    if (labelRef.current) {
      tl.fromTo(labelRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    }

    if (titleRef.current) {
      const words = titleRef.current.querySelectorAll('.word');
      tl.fromTo(
        words,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05 },
        '-=0.2'
      );
    }

    if (subtitleRef.current) {
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      );
    }

    if (ctaRef.current) {
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.2'
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  const titleText = 'Real-World n8n Automation Projects';
  const subtitleText =
    'Production-grade workflows solving real business problems. Built with source-available tooling, running on your own infrastructure.';

  const scrollToWorkflows = () => {
    const el = document.getElementById('workflows');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      ref={sectionRef}
      id="hero"
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '15vh 24px 10vh',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div
        ref={labelRef}
        style={{
          fontFamily: "'Fira Code', monospace",
          fontWeight: 500,
          fontSize: '12px',
          letterSpacing: '0.15em',
          color: '#FF6D2E',
          textTransform: 'uppercase',
          opacity: 0,
        }}
      >
        OPEN SOURCE WORKFLOWS
      </div>

      <h1
        ref={titleRef}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(40px, 5vw, 72px)',
          color: '#FFFFFF',
          lineHeight: 1.1,
          maxWidth: '700px',
          marginTop: '16px',
          letterSpacing: '-0.03em',
        }}
      >
        {titleText.split(' ').map((word, i) => (
          <span key={i} className="word" style={{ display: 'inline-block', marginRight: '0.3em' }}>
            {word}
          </span>
        ))}
      </h1>

      <p
        ref={subtitleRef}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: '18px',
          color: '#A1A1A1',
          maxWidth: '520px',
          marginTop: '24px',
          lineHeight: 1.6,
          letterSpacing: '0.01em',
          opacity: 0,
        }}
      >
        {subtitleText}
      </p>

      <div
        ref={ctaRef}
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: '32px',
          opacity: 0,
        }}
      >
        <button
          onClick={scrollToWorkflows}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '16px',
            color: '#FFFFFF',
            background: '#FF6D2E',
            border: 'none',
            borderRadius: '4px',
            padding: '14px 28px',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#E55A20')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#FF6D2E')}
        >
          Explore Workflows
        </button>
        <button
          onClick={() => window.open('https://github.com/n8n-io/n8n', '_blank')}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '16px',
            color: '#FFFFFF',
            background: 'transparent',
            border: '1px solid #3A3A3A',
            borderRadius: '4px',
            padding: '14px 28px',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6B6B6B')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#3A3A3A')}
        >
          View GitHub
        </button>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          right: '24px',
          fontFamily: "'Fira Code', monospace",
          fontWeight: 500,
          fontSize: '12px',
          color: '#6B6B6B',
        }}
      >
        v1.80.0
      </div>
    </div>
  );
}
