import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  try {
    const { goalTitle, deadline, userId, goalId } = await req.json()

    const today = new Date()
    const deadlineDate = new Date(deadline)
    const daysLeft = Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    const prompt = `You are a productivity agent. Break this goal into daily tasks.

Goal: "${goalTitle}"
Days available: ${daysLeft}
Start date: ${today.toISOString().split('T')[0]}

Return ONLY a JSON array like this, no other text:
[{"title":"task name","day_number":1,"due_date":"2026-03-17"},{"title":"task name","day_number":2,"due_date":"2026-03-18"}]

Max 15 tasks. Each task takes 1-2 hours. Be specific and actionable.`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    })

    const content = response.choices[0].message.content || '[]'

    // Extract JSON array from response
    const match = content.match(/\[[\s\S]*\]/)
    if (!match) {
      return NextResponse.json({ tasks: [] })
    }

    const tasks = JSON.parse(match[0])

    const tasksWithIds = tasks.map((t: {
      title: string
      day_number: number
      due_date: string
    }) => ({
      title: t.title,
      day_number: t.day_number,
      due_date: t.due_date,
      user_id: userId,
      goal_id: goalId,
      completed: false,
    }))

    return NextResponse.json({ tasks: tasksWithIds })

  } catch (error) {
    console.error('Breakdown error:', error)
    return NextResponse.json({ error: 'Failed to generate tasks' }, { status: 500 })
  }
}