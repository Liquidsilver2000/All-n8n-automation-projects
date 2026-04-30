import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { X, Zap, ArrowRight, BarChart3, CheckCircle, AlertTriangle, Clock, Database, MessageSquare, FileText, TrendingUp, Shield, Globe, Cpu, Layers } from 'lucide-react';

interface WorkflowStep {
  node: string;
  icon: React.ReactNode;
  description: string;
}

interface WorkflowData {
  id: number;
  title: string;
  badge: string;
  badgeColor: string;
  useCase: string;
  steps: WorkflowStep[];
  impact: { metric: string; label: string }[];
  flowNodes: string[];
}

const workflows: WorkflowData[] = [
  {
    id: 1,
    title: 'AI Sales Lead Qualification & CRM Sync',
    badge: 'Sales',
    badgeColor: '#FF6D2E',
    useCase: 'Automate inbound website leads, score them using AI, and push qualified leads to CRM.',
    steps: [
      { node: 'Webhook Trigger', icon: <Zap size={16} />, description: 'Triggered by new form submission from website' },
      { node: 'OpenAI Scoring', icon: <Cpu size={16} />, description: 'AI analyzes lead using BANT framework (Budget, Authority, Need, Timeline)' },
      { node: 'Conditional Logic', icon: <Layers size={16} />, description: 'IF score > 70 → qualified; IF score < 70 → nurture track' },
      { node: 'HubSpot / Salesforce', icon: <Database size={16} />, description: 'Creates fully populated contact record with AI insights' },
      { node: 'Slack Notification', icon: <MessageSquare size={16} />, description: 'Instant alert to assigned sales rep with lead profile' },
      { node: 'Google Sheets Log', icon: <FileText size={16} />, description: 'Complete audit trail with timestamps and scores' },
    ],
    impact: [
      { metric: '80%', label: 'Manual review reduced' },
      { metric: '5 min', label: 'Avg. response time' },
      { metric: '300%', label: 'Conversion increase' },
    ],
    flowNodes: ['Webhook', 'OpenAI', 'IF', 'HubSpot', 'Slack', 'Sheets'],
  },
  {
    id: 2,
    title: 'Automated Invoice Processing & Accounting Sync',
    badge: 'Finance',
    badgeColor: '#22C55E',
    useCase: 'Process incoming invoices via email and push structured data into QuickBooks.',
    steps: [
      { node: 'Gmail Trigger', icon: <MessageSquare size={16} />, description: 'Watches inbox for new invoice attachments' },
      { node: 'File Extraction', icon: <FileText size={16} />, description: 'Downloads PDF/image attachments automatically' },
      { node: 'Mistral OCR', icon: <Cpu size={16} />, description: 'Extracts text from complex invoice layouts' },
      { node: 'GPT Data Parsing', icon: <Layers size={16} />, description: 'Structures vendor details, line items, totals, taxes' },
      { node: 'QuickBooks API', icon: <Database size={16} />, description: 'Creates vendor, items, and bill automatically' },
      { node: 'Error Handling', icon: <AlertTriangle size={16} />, description: 'Anomalies routed to Slack for human review' },
    ],
    impact: [
      { metric: '$15→$2', label: 'Cost per invoice' },
      { metric: 'Zero', label: 'Manual data entry' },
      { metric: '99.2%', label: 'Accuracy rate' },
    ],
    flowNodes: ['Gmail', 'OCR', 'GPT', 'QuickBooks', 'Slack'],
  },
  {
    id: 3,
    title: 'AI Customer Support Auto-Responder',
    badge: 'Support',
    badgeColor: '#3B82F6',
    useCase: 'Auto-handle customer tickets and escalate only complex issues to human agents.',
    steps: [
      { node: 'Zendesk Trigger', icon: <Zap size={16} />, description: 'Fires when new unassigned ticket is created' },
      { node: 'OpenAI Intent', icon: <Cpu size={16} />, description: 'Classifies ticket into Billing, Technical, or General' },
      { node: 'FAQ Lookup', icon: <Database size={16} />, description: 'Searches knowledge base for matching documentation' },
      { node: 'Auto-Reply', icon: <MessageSquare size={16} />, description: 'Sends contextual response if confidence > 85%' },
      { node: 'Escalation Branch', icon: <Layers size={16} />, description: 'Complex tickets routed to senior support queue' },
      { node: 'Slack Alert', icon: <AlertTriangle size={16} />, description: 'Manager notified for tickets needing attention' },
    ],
    impact: [
      { metric: '60%', label: 'Ticket reduction' },
      { metric: '<2 min', label: 'First response' },
      { metric: '+24 pts', label: 'CSAT improvement' },
    ],
    flowNodes: ['Zendesk', 'OpenAI', 'FAQ', 'Reply', 'Escalate', 'Slack'],
  },
  {
    id: 4,
    title: 'Social Media Content Automation Engine',
    badge: 'Operations',
    badgeColor: '#8B5CF6',
    useCase: 'Generate, schedule, and publish social media posts automatically.',
    steps: [
      { node: 'Airtable Trigger', icon: <Database size={16} />, description: 'Content calendar drives daily publishing schedule' },
      { node: 'GPT-4 Content', icon: <Cpu size={16} />, description: 'Generates platform-optimized copy for LinkedIn, X, Instagram' },
      { node: 'DALL-E Images', icon: <FileText size={16} />, description: 'Creates brand-aligned visuals for each post' },
      { node: 'Buffer API', icon: <Globe size={16} />, description: 'Schedules and publishes across all platforms' },
      { node: 'Analytics Log', icon: <BarChart3 size={16} />, description: 'Tracks impressions, engagement, clicks to Sheets' },
      { node: 'Report Branch', icon: <TrendingUp size={16} />, description: 'Weekly performance summary to marketing team' },
    ],
    impact: [
      { metric: '90%', label: 'Content time saved' },
      { metric: '7x/week', label: 'Consistent posting' },
      { metric: '3.2x', label: 'Engagement growth' },
    ],
    flowNodes: ['Airtable', 'GPT-4', 'DALL-E', 'Buffer', 'Sheets', 'Report'],
  },
  {
    id: 5,
    title: 'SQL Server Monitoring & Alert System',
    badge: 'DevOps',
    badgeColor: '#EF4444',
    useCase: 'Monitor SQL Server health and alert on performance thresholds.',
    steps: [
      { node: 'Cron Trigger', icon: <Clock size={16} />, description: 'Runs every 5 minutes for continuous monitoring' },
      { node: 'SQL Query', icon: <Database size={16} />, description: 'Checks CPU, memory, disk I/O, connection count' },
      { node: 'Threshold Check', icon: <Layers size={16} />, description: 'Compares metrics against baseline thresholds' },
      { node: 'Conditional Branch', icon: <Shield size={16} />, description: 'IF threshold breached → alert; ELSE → log' },
      { node: 'Teams/Slack Alert', icon: <MessageSquare size={16} />, description: 'Instant notification with metric details' },
      { node: 'AI Summary', icon: <Cpu size={16} />, description: 'Optional GPT-generated incident report' },
    ],
    impact: [
      { metric: '99.9%', label: 'Uptime maintained' },
      { metric: '-73%', label: 'Mean time to resolve' },
      { metric: '24/7', label: 'Automated coverage' },
    ],
    flowNodes: ['Cron', 'SQL', 'Check', 'Alert', 'Teams', 'AI'],
  },
];

interface WorkflowModalProps {
  workflowId: number | null;
  onClose: () => void;
}

export default function WorkflowModal({ workflowId, onClose }: WorkflowModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const workflow = workflowId ? workflows.find((w) => w.id === workflowId) : null;

  const handleClose = useCallback(() => {
    if (overlayRef.current && contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: 'power2.in',
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (workflowId !== null) {
      document.body.style.overflow = 'hidden';
      if (overlayRef.current && contentRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: 'power2.out' }
        );
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 }
        );
      }
    } else {
      document.body.style.overflow = '';
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [workflowId, handleClose]);

  if (!workflow) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(5, 5, 7, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflowY: 'auto',
      }}
    >
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#0A0A0C',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0px',
          padding: '48px',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'none',
            border: 'none',
            color: '#A1A1A1',
            cursor: 'pointer',
            padding: '8px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#A1A1A1')}
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <span
            style={{
              display: 'inline-block',
              fontFamily: "'Fira Code', monospace",
              fontWeight: 500,
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              background: workflow.badgeColor,
              padding: '4px 12px',
              borderRadius: '4px',
              marginBottom: '16px',
            }}
          >
            {workflow.badge}
          </span>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(28px, 3.5vw, 44px)',
              color: '#FFFFFF',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '12px',
            }}
          >
            {workflow.title}
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: '16px',
              color: '#A1A1A1',
              lineHeight: 1.6,
              maxWidth: '640px',
            }}
          >
            {workflow.useCase}
          </p>
        </div>

        {/* Flow Diagram */}
        <div style={{ marginBottom: '48px' }}>
          <h3
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              color: '#6B6B6B',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}
          >
            Workflow Diagram
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0px',
              padding: '32px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {workflow.flowNodes.map((node, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 20px',
                    background:
                      i === 0
                        ? 'rgba(255, 109, 46, 0.12)'
                        : i === workflow.flowNodes.length - 1
                        ? 'rgba(34, 197, 94, 0.12)'
                        : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${
                      i === 0
                        ? 'rgba(255, 109, 46, 0.3)'
                        : i === workflow.flowNodes.length - 1
                        ? 'rgba(34, 197, 94, 0.3)'
                        : 'rgba(255,255,255,0.08)'
                    }`,
                    borderRadius: '4px',
                    minWidth: '100px',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background:
                        i === 0
                          ? '#FF6D2E'
                          : i === workflow.flowNodes.length - 1
                          ? '#22C55E'
                          : '#4F4F4F',
                      animation:
                        i === 0 ? 'pulse 2s infinite' : 'none',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Fira Code', monospace",
                      fontWeight: 500,
                      fontSize: '12px',
                      color: '#FFFFFF',
                    }}
                  >
                    {node}
                  </span>
                </div>
                {i < workflow.flowNodes.length - 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 8px',
                      color: '#4F4F4F',
                    }}
                  >
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Two-column: Steps + Impact */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '48px',
            marginBottom: '48px',
          }}
        >
          {/* Left: Step-by-step */}
          <div>
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: '#6B6B6B',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '24px',
              }}
            >
              Step-by-Step Logic
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {workflow.steps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 109, 46, 0.1)',
                      borderRadius: '4px',
                      color: '#FF6D2E',
                      flexShrink: 0,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#FFFFFF',
                        marginBottom: '4px',
                      }}
                    >
                      {i + 1}. {step.node}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 400,
                        fontSize: '13px',
                        color: '#A1A1A1',
                        lineHeight: 1.5,
                      }}
                    >
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Metrics */}
          <div>
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: '#6B6B6B',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '24px',
              }}
            >
              Measurable Impact
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {workflow.impact.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '24px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: '36px',
                      color: '#FF6D2E',
                      marginBottom: '8px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {item.metric}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 400,
                      fontSize: '14px',
                      color: '#A1A1A1',
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '32px',
                padding: '24px',
                background: 'rgba(255, 109, 46, 0.04)',
                border: '1px solid rgba(255, 109, 46, 0.15)',
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <CheckCircle size={16} color="#22C55E" />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#FFFFFF',
                  }}
                >
                  Production Ready
                </span>
              </div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: '13px',
                  color: '#A1A1A1',
                  lineHeight: 1.6,
                }}
              >
                This workflow is deployed in production environments. Error handling, retry logic,
                and audit logging are built in. Fully customizable via the n8n node editor.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            onClick={() => window.open('https://n8n.io/workflows', '_blank')}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              color: '#FFFFFF',
              background: '#FF6D2E',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 28px',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#E55A20')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FF6D2E')}
          >
            View on n8n.io
          </button>
        </div>
      </div>
    </div>
  );
}
