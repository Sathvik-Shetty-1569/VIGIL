"use client";
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter()

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#020818',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px',
    }}>

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', top: '20%', left: '20%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,142,247,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '20%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Stars */}
      {[...Array(60)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: i % 5 === 0 ? '2px' : '1px',
          height: i % 5 === 0 ? '2px' : '1px',
          borderRadius: '50%',
          background: 'white',
          top: `${(i * 17) % 100}%`,
          left: `${(i * 23) % 100}%`,
          opacity: (i % 10) * 0.06 + 0.05,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: '580px',
        width: '100%',
      }}>

        {/* Logo icon */}
        <div style={{
          width: '64px', height: '64px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 40px rgba(79,142,247,0.12)',
          marginBottom: '28px',
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="10" stroke="rgba(79,142,247,0.7)" strokeWidth="1" fill="none"/>
            <circle cx="14" cy="14" r="4" fill="rgba(79,142,247,0.8)"/>
            <circle cx="14" cy="14" r="1.5" fill="white"/>
            <line x1="14" y1="4" x2="14" y2="8" stroke="rgba(79,142,247,0.35)" strokeWidth="1"/>
            <line x1="14" y1="20" x2="14" y2="24" stroke="rgba(79,142,247,0.35)" strokeWidth="1"/>
            <line x1="4" y1="14" x2="8" y2="14" stroke="rgba(79,142,247,0.35)" strokeWidth="1"/>
            <line x1="20" y1="14" x2="24" y2="14" stroke="rgba(79,142,247,0.35)" strokeWidth="1"/>
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '60px',
          fontWeight: '700',
          letterSpacing: '0.18em',
          color: 'rgba(255,255,255,0.95)',
          lineHeight: '1',
          marginBottom: '14px',
          textShadow: '0 0 80px rgba(79,142,247,0.25)',
          fontFamily: 'Space Grotesk, sans-serif',
        }}>
          VIGIL
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: '11px',
          letterSpacing: '0.22em',
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
          marginBottom: '52px',
          fontFamily: 'Inter, sans-serif',
        }}>
          It doesn&apos;t push you. It watches.
        </p>

        {/* Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          width: '100%',
          marginBottom: '40px',
        }}>
          {[
            { value: '0', label: 'Tasks Today' },
            { value: '—', label: 'Focus Score' },
            { value: '—', label: 'Weekly Review' },
          ].map((stat, i) => (
            <div key={i} style={{
              borderRadius: '12px',
              padding: '20px 16px',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{
                fontSize: '26px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.8)',
                marginBottom: '6px',
                fontFamily: 'Space Grotesk, sans-serif',
              }}>{stat.value}</div>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.28)',
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif',
              }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          style={{
            borderRadius: '10px',
            padding: '12px 32px',
            background: 'rgba(79,142,247,0.12)',
            border: '1px solid rgba(79,142,247,0.25)',
            backdropFilter: 'blur(12px)',
            color: 'rgba(79,142,247,0.9)',
            letterSpacing: '0.12em',
            fontSize: '12px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(79,142,247,0.22)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(79,142,247,0.18)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(79,142,247,0.12)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
            onClick={() => router.push('/sign-up')}

        >
          ENTER VIGIL
        </button>

      </div>
    </main>
  );
}

