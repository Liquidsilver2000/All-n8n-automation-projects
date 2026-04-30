import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, DollarSign, MessageSquare, Globe, Server, ArrowRight } from 'lucide-react';
import WorkflowModal from './WorkflowModal';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: 1,
    title: 'AI Sales Lead Qualification & CRM Sync',
    description: 'Automate inbound website leads, score them using AI, and push qualified leads to CRM instantly.',
    badge: 'Sales',
    badgeColor: '#FF6D2E',
    icon: <Zap size={24} />,
  },
  {
    id: 2,
    title: 'Automated Invoice Processing & Accounting Sync',
    description: 'Process incoming invoices via email and push structured data into QuickBooks with zero manual entry.',
    badge: 'Finance',
    badgeColor: '#22C55E',
    icon: <DollarSign size={24} />,
  },
  {
    id: 3,
    title: 'AI Customer Support Auto-Responder',
    description: 'Auto-handle customer tickets and escalate only complex issues to human agents.',
    badge: 'Support',
    badgeColor: '#3B82F6',
    icon: <MessageSquare size={24} />,
  },
  {
    id: 4,
    title: 'Social Media Content Automation Engine',
    description: 'Generate, schedule, and publish social media posts automatically across all platforms.',
    badge: 'Operations',
    badgeColor: '#8B5CF6',
    icon: <Globe size={24} />,
  },
  {
    id: 5,
    title: 'SQL Server Monitoring & Alert System',
    description: 'Monitor SQL Server health and alert on performance thresholds before issues impact users.',
    badge: 'DevOps',
    badgeColor: '#EF4444',
    icon: <Server size={24} />,
  },
];

export default function ProjectGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<number | null>(null);

  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 80%',
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
      st.kill();
    };
  }, []);

  return (
    <>
      <div
        id="workflows"
        ref={sectionRef}
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '12vh 24px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '64px', textAlign: 'center' }}>
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
            PRODUCTION WORKFLOWS
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
            5 Real-World n8n Projects
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: '18px',
              color: '#A1A1A1',
              maxWidth: '560px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Click any workflow to see the full flow diagram, step-by-step logic, and measurable business impact.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '32px',
          }}
        >
          {projects.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => { cardsRef.current[i] = el; }}
              onClick={() => setActiveWorkflow(project.id)}
              style={{
                opacity: 0,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '32px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 109, 46, 0.3)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 109, 46, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Glow border effect */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'inherit',
                  padding: '1px',
                  background: 'linear-gradient(135deg, rgba(255,109,46,0) 0%, rgba(255,109,46,0.15) 50%, rgba(255,109,46,0) 100%)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none',
                }}
                className="card-glow"
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${project.badgeColor}15`,
                    borderRadius: '4px',
                    color: project.badgeColor,
                  }}
                >
                  {project.icon}
                </div>
                <span
                  style={{
                    fontFamily: "'Fira Code', monospace",
                    fontWeight: 500,
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#FFFFFF',
                    background: project.badgeColor,
                    padding: '3px 10px',
                    borderRadius: '4px',
                  }}
                >
                  {project.badge}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '20px',
                  color: '#FFFFFF',
                  lineHeight: 1.3,
                  marginBottom: '12px',
                  letterSpacing: '-0.02em',
                }}
              >
                {project.title}
              </h3>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: '15px',
                  color: '#A1A1A1',
                  lineHeight: 1.6,
                  marginBottom: '24px',
                }}
              >
                {project.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#FF6D2E',
                }}
              >
                <span>View Workflow</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <WorkflowModal
        workflowId={activeWorkflow}
        onClose={() => setActiveWorkflow(null)}
      />
    </>
  );
}
