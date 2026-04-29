import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text');
  const language = searchParams.get('language') || 'en';
  return handleSpeech(text, language);
}

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json();
    return handleSpeech(text, language);
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

async function handleSpeech(text: string | null, language: string) {
  try {
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('TTS Error: OpenAI API Key not configured in process.env');
      return NextResponse.json({ error: 'OpenAI API Key not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    // OpenAI TTS-1 with 'nova' voice
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text,
      speed: 1.0,
    });

    // Stream the response directly to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
