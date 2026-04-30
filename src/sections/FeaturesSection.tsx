import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu, HardDrive, ShieldCheck, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: <Cpu size={22} />,
    title: 'AI Workflows',
    description: 'Integrate OpenAI, Anthropic, and local LLMs directly into your automations with native AI nodes.',
  },
  {
    icon: <HardDrive size={22} />,
    title: 'Self-Hosted',
    description: 'Run n8n on your own infrastructure with full data control. Docker, Kubernetes, or bare metal.',
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Error Handling',
    description: 'Built-in retry logic, error branches, and fallback flows. Production-grade reliability out of the box.',
  },
  {
    icon: <Users size={22} />,
    title: 'Community',
    description: '50,000+ active instances. 400+ community-built nodes. Source-available forever.',
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];

    const st1 = ScrollTrigger.create({
      trigger: headingRef.current,
      start: 'top 80%',
      onEnter: () => {
        if (headingRef.current) {
          gsap.fromTo(
            headingRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
          );
        }
      },
      once: true,
    });

    const st2 = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 70%',
      onEnter: () => {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.15 }
        );
      },
      once: true,
    });

    return () => {
      st1.kill();
      st2.kill();
    };
  }, []);

  return (
    <div
      id="features"
      ref={sectionRef}
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '12vh 24px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div ref={headingRef} style={{ opacity: 0, marginBottom: '64px' }}>
        <div
          style={{
            fontFamily: "'Fira Code', monospace",
            fontWeight: 500,
            fontSize: '12px',
            letterSpacing: '0.15em',
            color: '#A1A1A1',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          WHY N8N
        </div>
        <h2
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(32px, 4vw, 56px)',
            color: '#FFFFFF',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '16px',
          }}
        >
          Code when you want.
          <br />
          Automate when you don't.
        </h2>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: '18px',
            color: '#A1A1A1',
            maxWidth: '560px',
            lineHeight: 1.6,
          }}
        >
          The only platform that balances no-code speed with full-code flexibility. Build custom nodes, write JavaScript expressions, or connect 400+ native integrations.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '32px',
        }}
      >
        {features.map((feature, i) => (
          <div
            key={i}
            ref={(el) => { cardsRef.current[i] = el; }}
            style={{
              opacity: 0,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '32px',
              transition: 'border-color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 109, 46, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 109, 46, 0.08)',
                borderRadius: '4px',
                color: '#FF6D2E',
                marginBottom: '20px',
              }}
            >
              {feature.icon}
            </div>
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '18px',
                color: '#FFFFFF',
                marginBottom: '10px',
                letterSpacing: '-0.02em',
              }}
            >
              {feature.title}
            </h3>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: '14px',
                color: '#A1A1A1',
                lineHeight: 1.6,
              }}
            >
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
