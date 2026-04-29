import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json();

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
    // 'nova' is excellent for a professional yet alluring female tone.
    // It supports multilingual inputs (English, Spanish, Chinese, etc.)
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text,
      speed: 1.0,
    });

    // Return the audio buffer as an MP3
    const audioBuffer = Buffer.from(await response.arrayBuffer());

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
