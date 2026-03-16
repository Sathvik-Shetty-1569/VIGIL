"use client";
import { useEffect, useState } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Goal = {
  id: string
  title: string
  deadline: string
  status: string
  created_at: string
}

type Task = {
  id: string
  goal_id: string
  title: string
  due_date: string
  completed: boolean
  day_number: number
}

export default function Dashboard() {
  const { user } = useUser()
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    const { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id)

    setGoals(goalsData || [])
    setTasks(tasksData || [])
    setLoading(false)
  }

  const todaysTasks = tasks.filter(t => {
    const today = new Date().toISOString().split('T')[0]
    return t.due_date === today
  })

  const completedToday = todaysTasks.filter(t => t.completed).length
  const focusScore = todaysTasks.length > 0
    ? Math.round((completedToday / todaysTasks.length) * 100)
    : 0

  const toggleTask = async (taskId: string, completed: boolean) => {
    await supabase
      .from('tasks')
      .update({ completed: !completed })
      .eq('id', taskId)

    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, completed: !completed } : t
    ))
  }

  const daysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (loading) return (
    <main style={{
      minHeight: '100vh', background: '#020818',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        fontSize: '11px', letterSpacing: '0.2em',
        color: 'rgba(79,142,247,0.5)', fontFamily: 'Inter, sans-serif',
      }}>
        VIGIL IS WATCHING...
      </div>
    </main>
  )

  return (
    <main style={{
      minHeight: '100vh', background: '#020818',
      color: 'rgba(255,255,255,0.9)', position: 'relative', overflow: 'hidden',
    }}>

      {/* Glow orbs */}
      <div style={{
        position: 'fixed', top: '10%', right: '5%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', left: '5%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(2,8,24,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="10" stroke="rgba(79,142,247,0.7)" strokeWidth="1" fill="none"/>
            <circle cx="14" cy="14" r="4" fill="rgba(79,142,247,0.8)"/>
            <circle cx="14" cy="14" r="1.5" fill="white"/>
          </svg>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '16px', fontWeight: '600',
            letterSpacing: '0.15em', color: 'rgba(255,255,255,0.9)',
          }}>VIGIL</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.push('/onboarding')}
            style={{
              background: 'rgba(79,142,247,0.1)',
              border: '1px solid rgba(79,142,247,0.2)',
              borderRadius: '8px', padding: '8px 14px',
              color: 'rgba(79,142,247,0.8)',
              fontSize: '11px', letterSpacing: '0.1em',
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
            }}>
            + NEW GOAL
          </button>
          <UserButton />
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '26px', fontWeight: '600',
            color: 'rgba(255,255,255,0.9)', marginBottom: '6px',
          }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {user?.firstName || 'there'}.
          </h1>
          <p style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.3)',
            fontFamily: 'Inter, sans-serif', letterSpacing: '0.03em',
          }}>
            VIGIL is watching. Here&apos;s where you stand.
          </p>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px', marginBottom: '40px',
        }}>
          {[
            { value: goals.length, label: 'Active Goals' },
            { value: todaysTasks.length, label: 'Tasks Today' },
            {
              value: todaysTasks.length > 0 ? `${focusScore}%` : '—',
              label: 'Focus Score',
              accent: focusScore >= 70,
            },
          ].map((stat, i) => (
            <div key={i} style={{
              borderRadius: '12px', padding: '24px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${stat.accent ? 'rgba(79,142,247,0.2)' : 'rgba(255,255,255,0.07)'}`,
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '32px', fontWeight: '600',
                color: stat.accent ? 'rgba(79,142,247,0.9)' : 'rgba(255,255,255,0.85)',
                marginBottom: '6px',
              }}>{stat.value}</div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase', fontFamily: 'Inter, sans-serif',
              }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Goals */}
          <div>
            <div style={{
              fontSize: '10px', letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif', marginBottom: '16px',
            }}>
              Goals being watched
            </div>

            {goals.length === 0 ? (
              <div style={{
                borderRadius: '12px', padding: '32px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed rgba(255,255,255,0.07)',
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '13px', color: 'rgba(255,255,255,0.2)',
                  fontFamily: 'Inter, sans-serif',
                }}>No goals yet. VIGIL is waiting.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {goals.map(goal => (
                  <div
                    key={goal.id}
                    onClick={() => router.push(`/goals/${goal.id}`)}
                    style={{
                      borderRadius: '12px', padding: '20px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      backdropFilter: 'blur(12px)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget).style.borderColor = 'rgba(79,142,247,0.25)'
                      ;(e.currentTarget).style.background = 'rgba(79,142,247,0.05)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.07)'
                      ;(e.currentTarget).style.background = 'rgba(255,255,255,0.04)'
                    }}
                  >
                    <div style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px', fontWeight: '500',
                      color: 'rgba(255,255,255,0.85)', marginBottom: '10px',
                    }}>{goal.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: '10px', letterSpacing: '0.08em',
                        color: daysLeft(goal.deadline) < 7
                          ? 'rgba(239,68,68,0.7)'
                          : 'rgba(255,255,255,0.25)',
                        fontFamily: 'Inter, sans-serif',
                      }}>
                        {daysLeft(goal.deadline)} days left
                      </span>
                      <span style={{
                        fontSize: '10px', letterSpacing: '0.08em',
                        color: 'rgba(79,142,247,0.5)',
                        fontFamily: 'Inter, sans-serif',
                      }}>
                        VIEW →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's tasks */}
          <div>
            <div style={{
              fontSize: '10px', letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif', marginBottom: '16px',
            }}>
              Today&apos;s tasks
            </div>

            {todaysTasks.length === 0 ? (
              <div style={{
                borderRadius: '12px', padding: '32px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed rgba(255,255,255,0.07)',
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '13px', color: 'rgba(255,255,255,0.2)',
                  fontFamily: 'Inter, sans-serif', marginBottom: '8px',
                }}>No tasks for today.</p>
                <p style={{
                  fontSize: '11px', color: 'rgba(255,255,255,0.12)',
                  fontFamily: 'Inter, sans-serif',
                }}>Open a goal to generate tasks with AI.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {todaysTasks.map(task => (
                  <div key={task.id}
                    onClick={() => toggleTask(task.id, task.completed)}
                    style={{
                      borderRadius: '10px', padding: '14px 16px',
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${task.completed ? 'rgba(79,142,247,0.2)' : 'rgba(255,255,255,0.07)'}`,
                      backdropFilter: 'blur(12px)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '50%',
                      border: `1px solid ${task.completed ? 'rgba(79,142,247,0.6)' : 'rgba(255,255,255,0.2)'}`,
                      background: task.completed ? 'rgba(79,142,247,0.3)' : 'transparent',
                      flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {task.completed && (
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="rgba(79,142,247,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                    <span style={{
                      fontSize: '13px', fontFamily: 'Inter, sans-serif',
                      color: task.completed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      transition: 'all 0.2s',
                    }}>{task.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}