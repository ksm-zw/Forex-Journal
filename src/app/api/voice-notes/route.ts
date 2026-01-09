import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Readable } from 'stream';

const prisma = new PrismaClient();

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const formData = await request.formData();

    const audioBlob = formData.get('audio') as Blob;
    const tradeId = formData.get('tradeId') as string | null;
    const transcribe = formData.get('transcribe') === 'true';

    if (!audioBlob) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert Blob to Buffer
    const buffer = Buffer.from(await audioBlob.arrayBuffer());
    const duration = Math.floor((audioBlob.size / 128000) * 8); // Rough estimate

    let transcript = null;

    // Transcribe if requested and API key available
    if (transcribe && process.env.OPENAI_API_KEY) {
      try {
        const openai = getOpenAI();
        if (openai) {
          const file = new File([buffer], 'audio.webm', { type: 'audio/webm' });
          const response = await openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
            language: 'en',
          });
          transcript = response.text;
        }
      } catch (transcribeError) {
        console.error('Transcription error:', transcribeError);
        // Continue without transcript
      }
    }

    // Store voice note in database
    const voiceNote = await prisma.voiceNote.create({
      data: {
        userId,
        tradeId: tradeId || null,
        url: `data:audio/webm;base64,${buffer.toString('base64')}`,
        duration,
        transcript,
      },
    });

    return NextResponse.json(voiceNote, { status: 201 });
  } catch (error) {
    console.error('Error saving voice note:', error);
    return NextResponse.json(
      { error: 'Failed to save voice note' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const { searchParams } = new URL(request.url);
    const tradeId = searchParams.get('tradeId');

    const where: any = { userId };
    if (tradeId) where.tradeId = tradeId;

    const voiceNotes = await prisma.voiceNote.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
    });

    return NextResponse.json(voiceNotes);
  } catch (error) {
    console.error('Error fetching voice notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voice notes' },
      { status: 500 }
    );
  }
}
