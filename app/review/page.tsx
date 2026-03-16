"use client";
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Goal = {
  id: string
  title: string
  deadline: string
}

type Task = {
  id: string
  goal_id: string
  title: string
  completed: boolean
  due_date: string
}

type Review = {
  score: number
  report: string
}

export default function WeeklyReview() {
const { user } = useUser()
const router = useRouter()
const [goals, setGoals] = useState<Goal[]>([])
const [tasks, setTasks] = useState<Task[]>([])
const [review, setReview] = useState<Review | null>(null)
const [loading, setLoading] = useState(true)
const [generating, setGenerating] = useState(false)
const [canReview, setCanReview] = useState(false)

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  
  const fetchData = async () => {
    const { data: goalsData } = await supabase
  .from('goals')
  .select('*')
  .eq('user_id', user?.id)
  .in('status', ['active', 'failed'])
  .gte('abandoned_at', getWeekStart()) // only this week's failures

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id)

    setGoals(goalsData || [])
    setTasks(tasksData || [])
    setLoading(false)
    const oldestGoal = (goalsData || []).sort(
  (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
)[0]

if (oldestGoal) {
  const daysSinceCreated = Math.floor(
    (new Date().getTime() - new Date(oldestGoal.created_at).getTime())
    / (1000 * 60 * 60 * 24)
  )
  setCanReview(daysSinceCreated >= 7)
}
  }

  const getWeekStart = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(now.setDate(diff)).toISOString()
}

  const generateReview = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals, tasks }),
      })
      const data = await res.json()
      setReview(data)

      // Save to Supabase
      const now = new Date()
      await supabase.from('reviews').insert({
        user_id: user?.id,
        week_number: getWeekNumber(now),
        year: now.getFullYear(),
        score: data.score,
        report: data.report,
      })
    } catch (err) {
      console.error(err)
    }
    setGenerating(false)
  }

  const getWeekNumber = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1)
    const diff = date.getTime() - start.getTime()
    return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const completionRate = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0

  const scoreColor = (score: number) => {
    if (score >= 80) return 'rgba(79,142,247,0.9)'
    if (score >= 50) return 'rgba(234,179,8,0.8)'
    return 'rgba(239,68,68,0.8)'
  }

  if (loading) return (
    <main style={{
      minHeight: '100vh', background: '#020818',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        fontSize: '11px', letterSpacing: '0.2em',
        color: 'rgba(79,142,247,0.5)', fontFamily: 'Inter, sans-serif',
      }}>LOADING...</div>
    </main>
  )

  return (
    <main style={{
      minHeight: '100vh', background: '#020818',
      color: 'rgba(255,255,255,0.9)',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Glow */}
      <div style={{
        position: 'fixed', top: '15%', left: '10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '15%', right: '10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,142,247,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Navbar */}
      <nav style={{
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'rgba(2,8,24,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
            fontSize: '12px', letterSpacing: '0.1em',
            fontFamily: 'Inter, sans-serif',
          }}>
          ← DASHBOARD
        </button>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>/</span>
        <span style={{
          fontSize: '12px', letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'Inter, sans-serif',
        }}>WEEKLY REVIEW</span>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '24px', fontWeight: '600',
            color: 'rgba(255,255,255,0.9)', marginBottom: '8px',
          }}>Weekly Review</h1>
          <p style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.3)',
            fontFamily: 'Inter, sans-serif',
          }}>
            VIGIL has been watching. Here&apos;s the truth.
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px', marginBottom: '32px',
        }}>
          {[
            { value: goals.length, label: 'Goals Active' },
            { value: `${completedTasks}/${totalTasks}`, label: 'Tasks Done' },
            {
              value: `${completionRate}%`,
              label: 'Completion Rate',
              accent: completionRate >= 70,
            },
          ].map((stat, i) => (
            <div key={i} style={{
              borderRadius: '12px', padding: '20px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${stat.accent
                ? 'rgba(79,142,247,0.2)'
                : 'rgba(255,255,255,0.07)'}`,
              backdropFilter: 'blur(12px)',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '26px', fontWeight: '600',
                color: stat.accent
                  ? 'rgba(79,142,247,0.9)'
                  : 'rgba(255,255,255,0.85)',
                marginBottom: '6px',
              }}>{stat.value}</div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.25)',
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif',
              }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Review output */}
        {!review ? (
          <div style={{
            borderRadius: '16px', padding: '48px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.07)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '13px', color: 'rgba(255,255,255,0.25)',
              fontFamily: 'Inter, sans-serif', marginBottom: '28px',
              lineHeight: '1.7',
            }}>
              VIGIL has been watching your week silently.<br />
              Ready to hear the truth?
            </div>
            <button
              onClick={generateReview}
              disabled={generating || totalTasks === 0 || !canReview}
              style={{
                borderRadius: '10px', padding: '13px 32px',
                background: generating
                  ? 'rgba(79,142,247,0.06)'
                  : 'rgba(79,142,247,0.12)',
                border: '1px solid rgba(79,142,247,0.25)',
                color: 'rgba(79,142,247,0.9)',
                fontSize: '12px', letterSpacing: '0.12em',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: '500',
                cursor: generating || totalTasks === 0
                  ? 'not-allowed'
                  : 'pointer',
              }}>
              {generating
  ? 'VIGIL IS JUDGING...'
  : !canReview
    ? 'AVAILABLE AFTER 7 DAYS'
    : totalTasks === 0
      ? 'NO TASKS TO REVIEW'
      : 'GENERATE WEEKLY REVIEW →'}
            </button>
          </div>
        ) : (
          <div style={{
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(12px)',
            overflow: 'hidden',
          }}>

            {/* Score banner */}
            <div style={{
              padding: '28px 32px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  fontSize: '10px', letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                  fontFamily: 'Inter, sans-serif', marginBottom: '6px',
                }}>Weekly Score</div>
                <div style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '52px', fontWeight: '700',
                  color: scoreColor(review.score),
                  lineHeight: '1',
                }}>{review.score}</div>
              </div>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                border: `2px solid ${scoreColor(review.score)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0.4,
              }}>
                <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="10"
                    stroke={scoreColor(review.score)}
                    strokeWidth="1" fill="none"/>
                  <circle cx="14" cy="14" r="4"
                    fill={scoreColor(review.score)}/>
                  <circle cx="14" cy="14" r="1.5" fill="white"/>
                </svg>
              </div>
            </div>

            {/* Report text */}
            <div style={{ padding: '28px 32px' }}>
              {review.report.split('\n').filter(Boolean).map((line, i) => {
                const isLabel = line.startsWith('SCORE:') ||
                  line.startsWith('VERDICT:') ||
                  line.startsWith('BREAKDOWN:') ||
                  line.startsWith('WARNING:')

                if (line.startsWith('SCORE:')) return null

                return (
                  <div key={i} style={{
                    marginBottom: isLabel ? '6px' : '20px',
                    fontFamily: isLabel ? 'Space Grotesk, sans-serif' : 'Inter, sans-serif',
                    fontSize: isLabel ? '10px' : '14px',
                    letterSpacing: isLabel ? '0.15em' : '0.02em',
                    color: isLabel
                      ? 'rgba(79,142,247,0.6)'
                      : 'rgba(255,255,255,0.7)',
                    textTransform: isLabel ? 'uppercase' : 'none',
                    lineHeight: isLabel ? '1' : '1.7',
                  }}>{line}</div>
                )
              })}
            </div>

            {/* Regenerate */}
            <div style={{
              padding: '16px 32px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              <button
                onClick={() => setReview(null)}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.2)',
                  fontSize: '11px', letterSpacing: '0.1em',
                  fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                }}>
                ↺ Generate again
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}