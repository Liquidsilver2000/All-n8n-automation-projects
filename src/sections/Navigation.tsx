import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (navRef.current && isVisible) {
      gsap.fromTo(navRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
    }
  }, [isVisible]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '64px',
        zIndex: 100,
        background: 'rgba(5, 5, 7, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        opacity: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: '14px',
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          cursor: 'pointer',
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        n8n showcase
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {[
          { label: 'Features', id: 'features' },
          { label: 'Workflows', id: 'workflows' },
          { label: 'Docs', id: 'docs' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '14px',
              color: '#A1A1A1',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#A1A1A1')}
          >
            {item.label}
          </button>
        ))}
        <button
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            color: '#FFFFFF',
            background: '#FF6D2E',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 20px',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#E55A20')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#FF6D2E')}
          onClick={() => scrollTo('workflows')}
        >
          Get Started
        </button>
      </div>
    </nav>
  );
}
