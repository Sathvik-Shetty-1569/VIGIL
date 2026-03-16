"use client";
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Goal = {
  id: string
  title: string
  deadline: string
  status: string
}

type Task = {
  id: string
  title: string
  due_date: string
  completed: boolean
  day_number: number
}

export default function GoalDetail() {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const goalId = params.id as string

  const [goal, setGoal] = useState<Goal | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (user) fetchGoalData()
  }, [user])

  const fetchGoalData = async () => {
    const { data: goalData } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single()

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('goal_id', goalId)
      .order('day_number', { ascending: true })

    setGoal(goalData)
    setTasks(tasksData || [])
    setLoading(false)
  }

  const generateTasks = async () => {
    if (!goal || !user) return
    setGenerating(true)

    try {
      const res = await fetch('/api/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalTitle: goal.title,
          deadline: goal.deadline,
          userId: user.id,
          goalId: goal.id,
        }),
      })

      const { tasks: newTasks } = await res.json()

      const { data, error } = await supabase
        .from('tasks')
        .insert(newTasks)
        .select()

      if (!error && data) {
        setTasks(data)
      }
    } catch (err) {
      console.error(err)
    }

    setGenerating(false)
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    await supabase
      .from('tasks')
      .update({ completed: !completed })
      .eq('id', taskId)

    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, completed: !completed } : t
    ))
  }

  const completedCount = tasks.filter(t => t.completed).length
  const progress = tasks.length > 0
    ? Math.round((completedCount / tasks.length) * 100)
    : 0

  const daysLeft = goal
    ? Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime())
        / (1000 * 60 * 60 * 24)
      )
    : 0

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
        position: 'fixed', top: '10%', right: '10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
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
        }}>GOAL</span>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Goal header */}
        <div style={{
          borderRadius: '16px', padding: '28px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          marginBottom: '24px',
        }}>
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '22px', fontWeight: '600',
            color: 'rgba(255,255,255,0.92)', marginBottom: '16px',
          }}>{goal?.title}</h1>

          <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
            <div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif', marginBottom: '4px',
              }}>Days Left</div>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '22px', fontWeight: '600',
                color: daysLeft < 7 ? 'rgba(239,68,68,0.8)' : 'rgba(255,255,255,0.85)',
              }}>{daysLeft}</div>
            </div>
            <div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif', marginBottom: '4px',
              }}>Progress</div>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '22px', fontWeight: '600',
                color: progress >= 70 ? 'rgba(79,142,247,0.9)' : 'rgba(255,255,255,0.85)',
              }}>{progress}%</div>
            </div>
            <div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif', marginBottom: '4px',
              }}>Tasks</div>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '22px', fontWeight: '600',
                color: 'rgba(255,255,255,0.85)',
              }}>{completedCount}/{tasks.length}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            height: '3px', borderRadius: '2px',
            background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              width: `${progress}%`,
              background: 'rgba(79,142,247,0.7)',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Tasks section */}
        <div style={{
          fontSize: '10px', letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif', marginBottom: '16px',
        }}>
          AI Generated Tasks
        </div>

        {tasks.length === 0 ? (
          <div style={{
            borderRadius: '16px', padding: '48px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.07)',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '14px', color: 'rgba(255,255,255,0.3)',
              fontFamily: 'Inter, sans-serif', marginBottom: '24px',
            }}>
              VIGIL hasn&apos;t broken this down yet.
            </p>
            <button
              onClick={generateTasks}
              disabled={generating}
              style={{
                borderRadius: '10px', padding: '12px 28px',
                background: generating
                  ? 'rgba(79,142,247,0.06)'
                  : 'rgba(79,142,247,0.12)',
                border: '1px solid rgba(79,142,247,0.25)',
                color: 'rgba(79,142,247,0.9)',
                fontSize: '12px', letterSpacing: '0.12em',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: '500', cursor: generating ? 'not-allowed' : 'pointer',
              }}>
              {generating ? 'VIGIL IS THINKING...' : 'GENERATE TASKS WITH AI →'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.map(task => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id, task.completed)}
                style={{
                  borderRadius: '10px', padding: '16px 18px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${task.completed
                    ? 'rgba(79,142,247,0.2)'
                    : 'rgba(255,255,255,0.07)'}`,
                  backdropFilter: 'blur(12px)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  border: `1px solid ${task.completed
                    ? 'rgba(79,142,247,0.6)'
                    : 'rgba(255,255,255,0.2)'}`,
                  background: task.completed
                    ? 'rgba(79,142,247,0.25)'
                    : 'transparent',
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {task.completed && (
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3"
                        stroke="rgba(79,142,247,0.9)"
                        strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '13px', fontFamily: 'Inter, sans-serif',
                    color: task.completed
                      ? 'rgba(255,255,255,0.25)'
                      : 'rgba(255,255,255,0.8)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    marginBottom: '3px',
                  }}>{task.title}</div>
                  <div style={{
                    fontSize: '10px', letterSpacing: '0.06em',
                    color: 'rgba(255,255,255,0.2)',
                    fontFamily: 'Inter, sans-serif',
                  }}>Day {task.day_number} · {task.due_date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}