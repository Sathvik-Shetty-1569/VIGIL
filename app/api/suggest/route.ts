import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  try {
    const { title } = await req.json()
    if (!title || title.length < 5) return NextResponse.json({ suggestion: null })

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are a goal-setting coach. The user typed this goal: "${title}"
        
Rewrite it as a single, sharper, more specific and measurable goal in under 12 words.
Return ONLY the improved goal text, nothing else. No quotes, no explanation.`
      }],
      temperature: 0.4,
      max_tokens: 50,
    })

    const suggestion = response.choices[0].message.content?.trim() || null
    return NextResponse.json({ suggestion })
  } catch {
    return NextResponse.json({ suggestion: null })
  }
}