"use client";
import React, { useEffect, useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, TrendingUp } from 'lucide-react';

const useScrollReveal = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  return { ref, isInView };
};

const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const particles = Array.from({ length: 160 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1 + 0.2,
      o: Math.random() * 0.5 + 0.08,
      v: Math.random() * 0.1 + 0.02
    }));
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    let frameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.v;
        if (p.y > canvas.height) { p.y = 0; p.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 210, 255, ${p.o})`;
        ctx.fill();
      });
      frameId = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(frameId); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />;
};

const NavBar = () => {
  const router = useRouter();
  return (
    <nav style={{
      position: 'fixed', top: 0, width: '100%', height: '56px', background: 'rgba(2, 8, 24, 0.75)',
      backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--glass-border)', padding: '0 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 50
    }}>
      <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '20px', letterSpacing: '0.16em', color: 'var(--text-primary)' }}>
        VIG<span style={{ color: 'var(--accent-primary)' }}>IL</span>
      </div>
      <div className="nav-links" style={{ display: 'flex', gap: '32px' }}>
        <a href="#how-it-works" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>How it works</a>
        <a href="#features" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>Features</a>
      </div>
      <button onClick={() => router.push('/sign-up')} style={{
        fontFamily: 'var(--font-syne)', fontWeight: 500, fontSize: '12px', letterSpacing: '0.06em',
        color: 'var(--accent-primary)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
        borderRadius: '8px', padding: '9px 22px', cursor: 'pointer'
      }}>
        Get started
      </button>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) { .nav-links { display: none !important; } nav { padding: 0 24px !important; } }
      `}} />
    </nav>
  );
};

export default function LandingPage() {
  const router = useRouter();
  const heroReveal: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } } };

  return (
    <main style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
      <Starfield />
      
      {/* Nebula Blobs */}
      <div style={{ position: 'fixed', top: '-100px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: '#08205A', filter: 'blur(120px)', opacity: 0.16, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: '40%', right: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: '#0A3D2B', filter: 'blur(120px)', opacity: 0.12, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-100px', left: '10%', width: '380px', height: '380px', borderRadius: '50%', background: '#150835', filter: 'blur(120px)', opacity: 0.20, zIndex: 0, pointerEvents: 'none' }} />

      <NavBar />

      {/* Hero Section */}
      <section style={{
        position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: '176px', paddingBottom: '80px', textAlign: 'center', minHeight: '100vh'
      }}>
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          
          <motion.div variants={heroReveal} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'var(--accent-dim)',
            border: '1px solid var(--accent-border)', borderRadius: '100px', marginBottom: '24px'
          }}>
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent-primary)', fontFamily: 'var(--font-syne)' }}>AI Productivity Agent</span>
          </motion.div>

          <motion.h1 variants={heroReveal} style={{ fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '24px', fontFamily: 'var(--font-syne)' }}>
            Stay focused.<br/>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Not reminded.</span>
          </motion.h1>

          <motion.p variants={heroReveal} style={{ fontSize: 'clamp(15px, 2vw, 19px)', fontWeight: 300, color: 'var(--text-muted)', maxWidth: '480px', lineHeight: 1.7, marginBottom: '24px' }}>
            VIGIL watches your goals, breaks them into tasks, and scores your week — silently, without pressure.
          </motion.p>

          <motion.div variants={heroReveal} style={{ fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--font-syne)', marginBottom: '52px' }}>
            IT DOESN&apos;T PUSH YOU. IT WATCHES.
          </motion.div>

          <motion.div variants={heroReveal} style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => router.push('/sign-up')} className="primary-btn" style={{
              fontSize: '14px', fontWeight: 500, padding: '13px 30px', background: 'var(--accent-primary)',
              color: 'var(--bg-color)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', border: 'none'
            }}>
              Get started free
            </button>
            <a href="#how-it-works" className="ghost-btn" style={{
              fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px',
              textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer'
            }}>
              See how it works <ArrowRight size={14} />
            </a>
          </motion.div>
        </motion.div>

        <motion.div animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0], transformOrigin: ['top', 'top', 'bottom'] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{
          position: 'absolute', bottom: '40px', width: '1px', height: '48px', background: 'linear-gradient(to bottom, transparent, var(--text-dim))'
        }} />
      </section>

      {/* Stats Row */}
      <SectionWrapper>
        <div className="stats-container" style={{
          display: 'flex', maxWidth: '680px', margin: '0 auto', background: 'var(--glass-border)',
          border: '1px solid var(--glass-border)', borderRadius: '12px', gap: '1px', overflow: 'hidden'
        }}>
          {[{v:"AI", l:"Task breakdown"}, {v:"Weekly", l:"Cold verdict"}, {v:"Real-time", l:"Focus score"}].map((s, i) => (
            <div key={i} className="stat-cell" style={{
              flex: 1, background: 'var(--bg-color)', padding: '24px 12px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', position: 'relative'
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'var(--glass-bg)', pointerEvents: 'none' }} />
              <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '22px', marginBottom: '4px' }}>{s.v}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* How It Works */}
      <section id="how-it-works" style={{ paddingTop: '100px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <SectionWrapper>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div style={{ fontSize: '12px', color: 'var(--accent-primary)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '16px' }}>HOW IT WORKS</div>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 'clamp(30px, 4vw, 46px)', marginBottom: '16px' }}>Three steps. Zero friction.</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7, fontSize: '15px' }}>
                Set your goals, let VIGIL handle the strategy, then get a brutally honest weekly report.
              </p>
            </div>
          </SectionWrapper>

          <SectionWrapper>
            <div className="steps-container" style={{
              display: 'flex', border: '1px solid var(--glass-border)', borderRadius: '14px', background: 'var(--glass-border)', gap: '1px', overflow: 'hidden'
            }}>
              {[
                { n: "01 / SET", ic: <ArrowRight size={20} strokeWidth={1.4} color="var(--accent-primary)" />, t: "Set Goals", d: "Define what you want to achieve. No complex setups." },
                { n: "02 / WATCH", ic: <Eye size={20} strokeWidth={1.4} color="var(--accent-primary)" />, t: "VIGIL Watches", d: "AI automatically breaks it down into actionable tasks." },
                { n: "03 / REVIEW", ic: <TrendingUp size={20} strokeWidth={1.4} color="var(--accent-primary)" />, t: "Weekly Verdict", d: "Receive a cold, clear score on your actual progress." }
              ].map((step, i) => (
                <div key={i} className="step-card glass-hover" style={{
                  flex: 1, background: 'var(--bg-color)', padding: '44px 32px', position: 'relative'
                }}>
                  <div className="glass-bg" style={{ position: 'absolute', inset: 0, background: 'var(--glass-bg)', transition: 'background 0.2s', pointerEvents: 'none' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '10px', letterSpacing: '0.14em', color: 'var(--accent-primary)', marginBottom: '24px' }}>{step.n}</div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '9px', border: '1px solid var(--glass-border)', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                      {step.ic}
                    </div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: '18px', letterSpacing: '-0.01em', marginBottom: '12px' }}>{step.t}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, fontWeight: 300 }}>{step.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ paddingTop: '100px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <SectionWrapper>
            <div style={{ marginBottom: '64px' }}>
              <div style={{ fontSize: '12px', color: 'var(--accent-primary)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '16px' }}>FEATURES</div>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 'clamp(30px, 4vw, 46px)' }}>Everything you need.<br/>Nothing you don&apos;t.</h2>
            </div>
          </SectionWrapper>

          <div className="features-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--glass-border)',
            border: '1px solid var(--glass-border)', borderRadius: '14px', overflow: 'hidden'
          }}>
            <SectionWrapper style={{ gridColumn: '1 / -1' }}>
              <div className="feature-card glass-hover" style={{ background: 'var(--bg-color)', position: 'relative' }}>
                <div className="glass-bg" style={{ position: 'absolute', inset: 0, background: 'var(--glass-bg)', transition: 'background 0.2s', pointerEvents: 'none' }} />
                <div className="feat-col-layout" style={{ position: 'relative', zIndex: 1, display: 'flex', padding: '64px', alignItems: 'center', gap: '48px' }}>
                  <div style={{ flex: 1 }}>
                    <div className="tag-pill" style={{ display: 'inline-block', fontSize: '10px', color: 'var(--accent-primary)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: '4px', padding: '4px 8px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '24px' }}>AI-POWERED</div>
                    <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: '24px', marginBottom: '16px' }}>Intelligent task breakdown</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, fontWeight: 300 }}>Powered by Groq&apos;s Llama 3.3, VIGIL instantly dissects your large goals into precise, actionable steps without you lifting a finger.</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '24px', background: 'rgba(2,8,24,0.4)', backdropFilter: 'blur(10px)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                        <div style={{ position: 'relative', width: '68px', height: '68px' }}>
                          <svg width="68" height="68" viewBox="0 0 68 68" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="34" cy="34" r="32" stroke="var(--glass-border)" strokeWidth="2" fill="none" />
                            <circle cx="34" cy="34" r="32" stroke="var(--accent-primary)" strokeWidth="4" fill="none" strokeDasharray="201" strokeDashoffset="50" strokeLinecap="round" />
                          </svg>
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '15px', color: 'var(--accent-primary)' }}>74</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>Focus Score</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>This week&apos;s performance</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[ {l:"Design", p:"85%"}, {l:"Dev", p:"62%"}, {l:"Research", p:"40%"} ].map((b, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '72px', fontSize: '11px', color: 'var(--text-muted)' }}>{b.l}</div>
                            <div style={{ flex: 1, height: '3px', background: 'var(--glass-border)', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
                              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: b.p, background: 'var(--accent-primary)', borderRadius: '2px' }} />
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', width: '28px', textAlign: 'right' }}>{b.p}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionWrapper>

            {[
              { t: "WEEKLY REVIEW", title: "Cold verdict, every Monday", d: "Get an honest, AI-generated weekly score. No sugarcoating, just your actual output." },
              { t: "DASHBOARD", title: "Everything in one view", d: "Track your goals, tasks, and historical scores in a sleek, distraction-free environment." },
              { t: "AUTH & DATA", title: "Secure by default", d: "Built on Clerk and Supabase. Your goals are completely secure and private to you." },
              { t: "DESIGN", title: "Glassmorphism deep space UI", d: "Designed to look like a high-end mission control interface. Calm, dark, and focused." }
            ].map((f, i) => (
              <SectionWrapper key={i}>
                <div className="feature-card glass-hover" style={{ background: 'var(--bg-color)', padding: '40px 36px', position: 'relative', height: '100%' }}>
                  <div className="glass-bg" style={{ position: 'absolute', inset: 0, background: 'var(--glass-bg)', transition: 'background 0.2s', pointerEvents: 'none' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="tag-pill" style={{ display: 'inline-block', fontSize: '10px', color: 'var(--accent-primary)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: '4px', padding: '4px 8px', letterSpacing: '0.1em', marginBottom: '24px' }}>{f.t}</div>
                    <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: '20px', marginBottom: '12px' }}>{f.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, fontWeight: 300 }}>{f.d}</p>
                  </div>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ paddingTop: '100px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px', position: 'relative', zIndex: 10 }}>
        <SectionWrapper>
          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '18px', padding: '64px 44px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'var(--accent-dim)', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 'clamp(26px, 4vw, 40px)', marginBottom: '16px' }}>Ready to be watched?</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, fontWeight: 300, marginBottom: '32px' }}>
                Set your goals. Let VIGIL do the rest. No reminders. No guilt trips. Just cold, clear progress.
              </p>
              <button onClick={() => router.push('/sign-up')} className="primary-btn" style={{
                fontSize: '14px', fontWeight: 500, padding: '13px 30px', background: 'var(--accent-primary)',
                color: 'var(--bg-color)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', border: 'none'
              }}>
                Start for free
              </button>
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '28px 48px', position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="footer-flex">
        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '15px', color: 'var(--text-muted)' }}>
          VIG<span style={{ color: 'var(--accent-primary)' }}>IL</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Built by Sathvik · 2025</div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .primary-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .ghost-btn:hover { color: var(--text-primary) !important; }
        .glass-hover:hover .glass-bg { background: rgba(255,255,255,0.055) !important; }
        @media (max-width: 768px) {
          .stats-container { flex-direction: column; }
          .steps-container { flex-direction: column; }
          .features-grid { grid-template-columns: 1fr !important; }
          .feat-col-layout { flex-direction: column; padding: 32px !important; }
          .footer-flex { flex-direction: column; gap: 16px; text-align: center; }
        }
      `}} />
    </main>
  );
}

const SectionWrapper = ({ children, style = {} }: { children: React.ReactNode, style?: React.CSSProperties }) => {
  const { ref, isInView } = useScrollReveal();
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 26 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }} transition={{ duration: 0.7, ease: "easeOut" }} style={style}>
      {children}
    </motion.div>
  );
};
