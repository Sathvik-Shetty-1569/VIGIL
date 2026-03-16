"use client";
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'

export default function Onboarding() {
  const { user } = useUser()
  const router = useRouter()
const [goals, setGoals] = useState([
  { title: '', deadline: '', start_date: '' }
])
const [suggestions, setSuggestions] = useState<(string | null)[]>([null])
const [suggestionTimers, setSuggestionTimers] = useState<(ReturnType<typeof setTimeout> | null)[]>([null])
  const [loading, setLoading] = useState(false)

 const addGoalField = () => {
  setGoals([...goals, { title: '', deadline: '', start_date: '' }])
  setSuggestions([...suggestions, null])
  setSuggestionTimers([...suggestionTimers, null])
}

 const updateGoal = (index: number, field: string, value: string) => {
  const updated = [...goals]
  updated[index] = { ...updated[index], [field]: value }
  setGoals(updated)

  // Trigger suggestion on title change
  if (field === 'title') {
    // Clear existing timer
    const timers = [...suggestionTimers]
    if (timers[index]) clearTimeout(timers[index]!)
    
    // Clear suggestion while typing
    const newSuggestions = [...suggestions]
    newSuggestions[index] = null
    setSuggestions(newSuggestions)

    if (value.length >= 5) {
      const timer = setTimeout(async () => {
        const res = await fetch('/api/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: value }),
        })
        const data = await res.json()
        setSuggestions(prev => {
  const updated = [...prev]
  updated[index] = data.suggestion
  return updated
})
      }, 600)
      timers[index] = timer
      setSuggestionTimers(timers)
    }
  }
}

  const removeGoal = (index: number) => {
  setGoals(goals.filter((_, i) => i !== index))
  setSuggestions(suggestions.filter((_, i) => i !== index))
  setSuggestionTimers(suggestionTimers.filter((_, i) => i !== index))
}

  const handleSubmit = async () => {
    const validGoals = goals.filter(g => g.title.trim() && g.deadline)
    if (validGoals.length === 0) return

    setLoading(true)

    const { error } = await supabase.from('goals').insert(
  validGoals.map(g => ({
    user_id: user?.id,
    title: g.title.trim(),
    deadline: g.deadline,
    start_date: g.start_date || new Date().toISOString().split('T')[0],
    status: 'active',
  }))
)

    if (!error) {
      router.push('/dashboard')
    } else {
      console.error(error)
      setLoading(false)
    }
  }

 return (
    <main style={{
      minHeight: '100vh',
      background: '#020818',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Back button - true top left */}
      <button
        onClick={() => router.push('/dashboard')}
        style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
          fontSize: '12px', letterSpacing: '0.1em',
          fontFamily: 'Inter, sans-serif',
          padding: '8px 0',
          display: 'block',
        }}>
        ← DASHBOARD
      </button>

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', top: '10%', right: '10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Centered form */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 60px)',
      }}>
        <div style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: '560px',
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 30px rgba(79,142,247,0.1)',
            }}>
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="10" stroke="rgba(79,142,247,0.7)" strokeWidth="1" fill="none"/>
                <circle cx="14" cy="14" r="4" fill="rgba(79,142,247,0.8)"/>
                <circle cx="14" cy="14" r="1.5" fill="white"/>
              </svg>
            </div>
            <h1 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '28px', fontWeight: '700',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.92)',
              marginBottom: '10px',
            }}>
              What are you chasing?
            </h1>
            <p style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.05em',
              fontFamily: 'Inter, sans-serif',
            }}>
              Add the goals you want VIGIL to watch over.
            </p>
          </div>

          {/* Goal inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {goals.map((goal, index) => (
              <div key={index} style={{
                borderRadius: '12px', padding: '20px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(12px)',
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '10px', letterSpacing: '0.15em',
                    color: 'rgba(79,142,247,0.7)', textTransform: 'uppercase',
                    fontFamily: 'Inter, sans-serif',
                  }}>Goal {index + 1}</span>
                  {goals.length > 1 && (
                    <button onClick={() => removeGoal(index)} style={{
                      background: 'none', border: 'none',
                      color: 'rgba(255,255,255,0.2)',
                      cursor: 'pointer', fontSize: '16px', lineHeight: '1',
                    }}>×</button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="e.g. Learn Next.js and build 3 projects"
                  value={goal.title}
                  onChange={e => updateGoal(index, 'title', e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', padding: '12px 14px',
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '14px', fontFamily: 'Inter, sans-serif',
                    outline: 'none', width: '100%',
                  }}
                />
                {/* AI Suggestion */}
{suggestions[index] && suggestions[index] !== goal.title && (
  <div
    onClick={() => updateGoal(index, 'title', suggestions[index]!)}
    style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 12px',
      borderRadius: '8px',
      background: 'rgba(79,142,247,0.06)',
      border: '1px solid rgba(79,142,247,0.15)',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }}
    onMouseEnter={e => (e.currentTarget).style.borderColor = 'rgba(79,142,247,0.35)'}
    onMouseLeave={e => (e.currentTarget).style.borderColor = 'rgba(79,142,247,0.15)'}
  >
    <span style={{
      fontSize: '9px', letterSpacing: '0.12em',
      color: 'rgba(79,142,247,0.6)', fontFamily: 'Inter, sans-serif',
      whiteSpace: 'nowrap',
    }}>VIGIL SUGGESTS</span>
    <span style={{
      fontSize: '13px', fontFamily: 'Inter, sans-serif',
      color: 'rgba(255,255,255,0.6)', flex: 1,
    }}>{suggestions[index]}</span>
    <span style={{
      fontSize: '10px', color: 'rgba(79,142,247,0.5)',
      fontFamily: 'Inter, sans-serif',
    }}>← tap to use</span>
  </div>
)}
<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <span style={{
    fontSize: '11px', color: 'rgba(255,255,255,0.3)',
    fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
  }}>Start from</span>
  <input
    type="date"
    value={goal.start_date}
    onChange={e => updateGoal(index, 'start_date', e.target.value)}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px', padding: '10px 14px',
      color: 'rgba(255,255,255,0.7)',
      fontSize: '13px', fontFamily: 'Inter, sans-serif',
      outline: 'none', flex: 1, colorScheme: 'dark',
    }}
  />
</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                    fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                  }}>Complete by</span>
                  <input
                    type="date"
                    value={goal.deadline}
                    onChange={e => updateGoal(index, 'deadline', e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px', padding: '10px 14px',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '13px', fontFamily: 'Inter, sans-serif',
                      outline: 'none', flex: 1, colorScheme: 'dark',
                    }}
                  />
                </div>
                
              </div>
            ))}
          </div>

          <button onClick={addGoalField} style={{
            width: '100%', padding: '12px', borderRadius: '10px',
            background: 'transparent',
            border: '1px dashed rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '12px', letterSpacing: '0.1em',
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s',
          }}
            onMouseEnter={e => {
              (e.currentTarget).style.borderColor = 'rgba(79,142,247,0.3)'
              ;(e.currentTarget).style.color = 'rgba(79,142,247,0.6)'
            }}
            onMouseLeave={e => {
              (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.1)'
              ;(e.currentTarget).style.color = 'rgba(255,255,255,0.3)'
            }}
          >
            + Add another goal
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: '10px',
              background: loading ? 'rgba(79,142,247,0.08)' : 'rgba(79,142,247,0.15)',
              border: '1px solid rgba(79,142,247,0.25)',
              color: 'rgba(79,142,247,0.9)',
              fontSize: '13px', letterSpacing: '0.12em',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'SAVING...' : 'BEGIN VIGIL →'}
          </button>

        </div>
      </div>
    </main>
  )
}