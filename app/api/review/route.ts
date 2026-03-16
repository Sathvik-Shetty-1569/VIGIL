import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  try {
    const { goals, tasks } = await req.json()

    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t: { completed: boolean }) => t.completed).length
    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0

    const goalSummaries = goals.map((g: {
        id:string
      title: string
      deadline: string
    }) => {
      const goalTasks = tasks.filter((t: { goal_id: string }) => t.goal_id === g.id)
      const goalCompleted = goalTasks.filter((t: { completed: boolean }) => t.completed).length
      return `- "${g.title}": ${goalCompleted}/${goalTasks.length} tasks done`
    }).join('\n')

    const prompt = `You are VIGIL, a cold and honest AI productivity agent.

Here is the user's weekly performance:
Total tasks: ${totalTasks}
Completed: ${completedTasks}
Completion rate: ${completionRate}%

Goals breakdown:
${goalSummaries}

Write a weekly review in exactly this format:

SCORE: [0-100]

VERDICT: [one cold, honest sentence about their week — no sugarcoating]

BREAKDOWN: [2-3 sentences analyzing what they did and didn't do]

WARNING: [one specific thing they need to fix next week]

Be direct. Be cold. Don't motivate — just report the facts like a silent watcher.`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    })

    const content = response.choices[0].message.content || ''

    // Parse score
    const scoreMatch = content.match(/SCORE:\s*(\d+)/)
    const score = scoreMatch ? parseInt(scoreMatch[1]) : completionRate

    return NextResponse.json({ report: content, score })

  } catch (error) {
    console.error('Review error:', error)
    return NextResponse.json({ error: 'Failed to generate review' }, { status: 500 })
  }
}