import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  try {
    const { missedTasks, goalTitle, today } = await req.json()

    const prompt = `You are a productivity agent. The user missed these tasks:
${missedTasks.map((t: { title: string, due_date: string }) => `- "${t.title}" (was due ${t.due_date})`).join('\n')}

Goal: "${goalTitle}"
Today's date: ${today}

Reschedule these missed tasks starting from tomorrow. Keep the same titles.
Return ONLY a JSON array:
[{"title":"task name","due_date":"2026-03-18","day_number":1}]`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    })

    const content = response.choices[0].message.content || '[]'
    const match = content.match(/\[[\s\S]*\]/)
    if (!match) return NextResponse.json({ tasks: [] })

    const tasks = JSON.parse(match[0])
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to reschedule' }, { status: 500 })
  }
}