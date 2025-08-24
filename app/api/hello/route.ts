import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'hello' })
}

export async function POST() {
  return NextResponse.json({ message: 'hello from POST' })
} 