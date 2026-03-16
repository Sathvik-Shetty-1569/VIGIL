"use client";
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Goal = {
  id: string
  title: string
  deadline: string
  status: string
  created_at: string
  abandoned_at: string | null
}

type Task = {
  id: string
  goal_id: string
  completed: boolean
}

export default function History() {
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
      .select('id, goal_id, completed')
      .eq('user_id', user?.id)

    setGoals(goalsData || [])
    setTasks(tasksData || [])
    setLoading(false)
  }

  const getProgress = (goalId: string) => {
    const goalTasks = tasks.filter(t => t.goal_id === goalId)
    if (goalTasks.length === 0) return { completed: 0, total: 0, percent: 0 }
    const completed = goalTasks.filter(t => t.completed).length
    return {
      completed,
      total: goalTasks.length,
      percent: Math.round((completed / goalTasks.length) * 100)
    }
  }

  const statusColor = (status: string) => {
    if (status === 'active') return 'rgba(79,142,247,0.8)'
    if (status === 'completed') return 'rgba(34,197,94,0.8)'
    return 'rgba(239,68,68,0.6)'
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#020818', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(79,142,247,0.5)', fontFamily: 'Inter, sans-serif' }}>LOADING...</div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#020818', color: 'rgba(255,255,255,0.9)', position: 'relative', overflow: 'hidden' }}>

      <div style={{ position: 'fixed', top: '15%', left: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <nav style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(2,8,24,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>
          ← DASHBOARD
        </button>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>/</span>
        <span style={{ fontSize: '12px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>HISTORY</span>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 32px' }}>

        <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
  <div>
    <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Goal History</h1>
    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>Every attempt VIGIL has watched over.</p>
  </div>
  <button
    onClick={async () => {
  if (!confirm('This will permanently delete everything. VIGIL will forget you completely. Are you sure?')) return
  await supabase.from('tasks').delete().eq('user_id', user?.id)
  await supabase.from('reviews').delete().eq('user_id', user?.id)
  await supabase.from('goals').delete().eq('user_id', user?.id)
  router.push('/onboarding')
}}
    style={{
      background: 'none',
      border: '1px solid rgba(239,68,68,0.15)',
      borderRadius: '8px', padding: '8px 16px',
      color: 'rgba(239,68,68,0.4)',
      fontSize: '11px', letterSpacing: '0.1em',
      fontFamily: 'Inter, sans-serif',
      cursor: 'pointer',
    }}
  >
    CLEAR ALL →
  </button>
</div>

        {goals.length === 0 ? (
          <div style={{ borderRadius: '12px', padding: '48px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif' }}>No goals yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {goals.map(goal => {
              const { completed, total, percent } = getProgress(goal.id)
              return (
                <div key={goal.id} style={{ borderRadius: '14px', padding: '22px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.85)', flex: 1, paddingRight: '16px' }}>{goal.title}</div>
                    <span style={{ fontSize: '9px', letterSpacing: '0.12em', color: statusColor(goal.status), border: `1px solid ${statusColor(goal.status)}`, borderRadius: '6px', padding: '3px 8px', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', opacity: 0.8 }}>
                      {goal.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '10px' }}>
                    <div style={{ height: '100%', borderRadius: '2px', width: `${percent}%`, background: goal.status === 'failed' ? 'rgba(239,68,68,0.5)' : 'rgba(79,142,247,0.6)', transition: 'width 0.5s ease' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif' }}>
                      {completed}/{total} tasks · {percent}% done
                    </span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif' }}>
                      {goal.status === 'failed' && goal.abandoned_at
                        ? `Abandoned ${new Date(goal.abandoned_at).toLocaleDateString()}`
                        : `Deadline ${new Date(goal.deadline).toLocaleDateString()}`}
                    </span>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}