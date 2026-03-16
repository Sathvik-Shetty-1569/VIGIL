"use client";
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type ActivityLog = {
  id: string
  date: string
  note: string | null
  hours: number
  tasks_completed: number
  tasks_total: number
}

type Task = {
  id: string
  goal_id: string
  title: string
  due_date: string
  completed: boolean
  day_number: number
}

type Goal = {
  id: string
  title: string
}

export default function Activity() {
  const { user } = useUser()
  const router = useRouter()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [hours, setHours] = useState('')
  const [saving, setSaving] = useState(false)
  const [rescheduling, setRescheduling] = useState(false)
  const [rescheduled, setRescheduled] = useState(false)

  const today = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))
    .toISOString().split('T')[0]

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    const { data: logsData } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user?.id)
      .order('date', { ascending: false })

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id)

    const { data: goalsData } = await supabase
      .from('goals')
      .select('id, title')
      .eq('user_id', user?.id)
      .eq('status', 'active')

    setLogs(logsData || [])
    setTasks(tasksData || [])
    setGoals(goalsData || [])
    setLoading(false)

    await syncTodayActivity(tasksData || [], logsData || [])
  }

  const syncTodayActivity = async (allTasks: Task[], allLogs: ActivityLog[]) => {
    const todayTasks = allTasks.filter(t => t.due_date === today)
    if (todayTasks.length === 0) return

    const completed = todayTasks.filter(t => t.completed).length
    const total = todayTasks.length
    const existingLog = allLogs.find(l => l.date === today)

    if (existingLog) {
      await supabase
        .from('activity_logs')
        .update({ tasks_completed: completed, tasks_total: total })
        .eq('id', existingLog.id)
    } else {
      await supabase
        .from('activity_logs')
        .insert({ user_id: user?.id, date: today, tasks_completed: completed, tasks_total: total, hours: 0 })
    }
  }

  const saveNote = async () => {
    if (!note.trim()) return
    setSaving(true)
    const hoursVal = parseFloat(hours) || 0

    const existingLog = logs.find(l => l.date === today)
    if (existingLog) {
      await supabase
        .from('activity_logs')
        .update({ note: note.trim(), hours: hoursVal })
        .eq('id', existingLog.id)
      setLogs(prev => prev.map(l => l.date === today ? { ...l, note: note.trim(), hours: hoursVal } : l))
    } else {
      const { data } = await supabase
        .from('activity_logs')
        .insert({ user_id: user?.id, date: today, note: note.trim(), hours: hoursVal, tasks_completed: 0, tasks_total: 0 })
        .select()
        .single()
      if (data) setLogs(prev => [data, ...prev])
    }

    setNote('')
    setHours('')
    setSaving(false)
  }

  const rescheduleMissedTasks = async () => {
    setRescheduling(true)
    const yesterday = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000) - 86400000)
      .toISOString().split('T')[0]

    const missedTasks = tasks.filter(t =>
      t.due_date <= yesterday && !t.completed
    )

    if (missedTasks.length === 0) {
      alert('No missed tasks to reschedule!')
      setRescheduling(false)
      return
    }

    for (const goal of goals) {
      const goalMissed = missedTasks.filter(t => t.goal_id === goal.id)
      if (goalMissed.length === 0) continue

      const res = await fetch('/api/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missedTasks: goalMissed,
          goalTitle: goal.title,
          today,
        }),
      })

      const { tasks: rescheduledTasks } = await res.json()

      await supabase
        .from('tasks')
        .delete()
        .in('id', goalMissed.map(t => t.id))

      await supabase
        .from('tasks')
        .insert(rescheduledTasks.map((t: { title: string, due_date: string, day_number: number }) => ({
          ...t,
          user_id: user?.id,
          goal_id: goal.id,
          completed: false,
        })))
    }

    setRescheduled(true)
    setRescheduling(false)
    fetchData()
  }

  const getHeatmapData = () => {
    const days = []
    for (let i = 89; i >= 0; i--) {
      const d = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000) - i * 86400000)
      const dateStr = d.toISOString().split('T')[0]
      const log = logs.find(l => l.date === dateStr)

      let intensity = 0
      if (log) {
        const taskIntensity = log.tasks_total > 0
          ? (log.tasks_completed / log.tasks_total) * 0.5
          : 0
        const hoursIntensity = log.hours > 0
          ? Math.min(log.hours / 6, 1) * 0.5
          : 0
        const noteBonus = log.note ? 0.1 : 0
        intensity = Math.min(taskIntensity + hoursIntensity + noteBonus, 1)
      }

      days.push({ date: dateStr, log, intensity })
    }
    return days
  }

  const heatmapDays = getHeatmapData()

  const intensityColor = (intensity: number) => {
    if (intensity === 0) return 'rgba(255,255,255,0.05)'
    if (intensity <= 0.3) return 'rgba(79,142,247,0.2)'
    if (intensity <= 0.6) return 'rgba(79,142,247,0.45)'
    if (intensity <= 0.9) return 'rgba(79,142,247,0.7)'
    return 'rgba(79,142,247,0.95)'
  }

  const missedCount = tasks.filter(t => {
    const yesterday = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000) - 86400000)
      .toISOString().split('T')[0]
    return t.due_date <= yesterday && !t.completed
  }).length

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#020818', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(79,142,247,0.5)', fontFamily: 'Inter, sans-serif' }}>LOADING...</div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#020818', color: 'rgba(255,255,255,0.9)', position: 'relative', overflow: 'hidden' }}>

      <div style={{ position: 'fixed', top: '15%', right: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <nav style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(2,8,24,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>
          ← DASHBOARD
        </button>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>/</span>
        <span style={{ fontSize: '12px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>ACTIVITY</span>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Activity</h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>Your consistency over the last 3 months.</p>
          </div>
          {missedCount > 0 && !rescheduled && (
            <button
              onClick={rescheduleMissedTasks}
              disabled={rescheduling}
              style={{
                background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)',
                borderRadius: '10px', padding: '10px 18px',
                color: 'rgba(234,179,8,0.8)', fontSize: '11px', letterSpacing: '0.1em',
                fontFamily: 'Space Grotesk, sans-serif', cursor: rescheduling ? 'not-allowed' : 'pointer',
              }}
            >
              {rescheduling ? 'RESCHEDULING...' : `RESCHEDULE ${missedCount} MISSED TASKS →`}
            </button>
          )}
          {rescheduled && (
            <span style={{ fontSize: '11px', color: 'rgba(34,197,94,0.7)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em' }}>✓ RESCHEDULED</span>
          )}
        </div>

        {/* Heatmap */}
        <div style={{ borderRadius: '16px', padding: '28px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', marginBottom: '32px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', marginBottom: '20px' }}>
            Last 90 Days
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: '4px' }}>
            {heatmapDays.map((day, i) => (
              <div
                key={i}
                title={`${day.date}${day.log?.note ? ` — ${day.log.note}` : ''}${day.log?.hours ? ` — ${day.log.hours}h` : ''}${day.log?.tasks_total ? ` — ${day.log.tasks_completed}/${day.log.tasks_total} tasks` : ''}`}
                style={{
                  aspectRatio: '1',
                  borderRadius: '3px',
                  background: intensityColor(day.intensity),
                  cursor: 'default',
                  transition: 'transform 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget).style.transform = 'scale(1.3)'}
                onMouseLeave={e => (e.currentTarget).style.transform = 'scale(1)'}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif' }}>Less</span>
            {[0, 0.3, 0.6, 0.9, 1].map((v, i) => (
              <div key={i} style={{ width: '12px', height: '12px', borderRadius: '2px', background: intensityColor(v) }} />
            ))}
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif' }}>More</span>
          </div>
        </div>

        {/* Log today */}
        <div style={{ borderRadius: '16px', padding: '24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', marginBottom: '32px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>
            Log Today
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="e.g. Coding practice, read DSA chapter 5"
              value={note}
              onChange={e => setNote(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveNote()}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '12px 14px',
                color: 'rgba(255,255,255,0.85)', fontSize: '13px',
                fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
            />
            <input
              type="number"
              placeholder="hrs"
              value={hours}
              min="0" max="24" step="0.5"
              onChange={e => setHours(e.target.value)}
              style={{
                width: '70px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '12px 10px',
                color: 'rgba(255,255,255,0.85)', fontSize: '13px',
                fontFamily: 'Inter, sans-serif', outline: 'none',
                textAlign: 'center',
              }}
            />
            <button
              onClick={saveNote}
              disabled={saving || !note.trim()}
              style={{
                background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)',
                borderRadius: '8px', padding: '12px 20px',
                color: 'rgba(79,142,247,0.9)', fontSize: '11px', letterSpacing: '0.1em',
                fontFamily: 'Space Grotesk, sans-serif', cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? '...' : 'LOG →'}
            </button>
          </div>
        </div>

        {/* Recent logs */}
        <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>
          Recent Activity
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {logs.filter(l => l.note || l.tasks_total > 0).slice(0, 10).map(log => (
            <div key={log.id} style={{ borderRadius: '10px', padding: '16px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif', marginBottom: '4px', letterSpacing: '0.05em' }}>{log.date}</div>
                {log.note && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif' }}>{log.note}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                {log.tasks_total > 0 && (
                  <div style={{ fontSize: '11px', color: log.tasks_completed === log.tasks_total ? 'rgba(34,197,94,0.7)' : 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em' }}>
                    {log.tasks_completed}/{log.tasks_total} TASKS
                  </div>
                )}
                {log.hours > 0 && (
                  <div style={{ fontSize: '11px', color: 'rgba(79,142,247,0.6)', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                    {log.hours}h logged
                  </div>
                )}
              </div>
            </div>
          ))}
          {logs.filter(l => l.note || l.tasks_total > 0).length === 0 && (
            <div style={{ borderRadius: '12px', padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif' }}>No activity logged yet.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}