import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, language } = await req.json();

    const systemPrompts: Record<string, string> = {
      en: "You are Arthromed AI, a professional surgical assistant for Arthromed, a medical equipment company. You are expert in specialized surgical equipment. Provide precise, professional, and helpful responses in English. Use natural language suitable for voice synthesis; avoid complex markdown or symbols that sound awkward when read aloud.",
      es: "Eres Arthromed AI, un asistente quirúrgico profesional para Arthromed, una empresa de equipos médicos. Eres experto en equipos quirúrgicos especializados. Proporciona respuestas precisas, profesionales y útiles en español. Usa un lenguaje natural adecuado para la síntesis de voz; evita markdown complejo o símbolos que suenen mal al ser leídos en voz alta.",
      zh: "您是 Arthromed AI，Arthromed（一家医疗设备公司）的专业手术助手。您是专业手术设备方面的专家。请使用中文提供准确、专业且有用的回复。使用适合语音合成的自然语言；避免在朗读时听起来尴尬的复杂 Markdown 或符号。"
    };

    // Convert UIMessages from frontend to CoreMessages for the backend
    const coreMessages = messages.map((m: any) => {
      const text = m.parts
        ?.filter((p: any) => p.type === 'text')
        ?.map((p: any) => p.text)
        ?.join('') || '';
      
      return {
        role: m.role,
        content: text
      };
    });

    // Load technical knowledge context if available
    let technicalContext = "";
    try {
      const fs = await import('fs');
      const path = await import('path');
      const knowledgePath = path.join(process.cwd(), 'src/lib/knowledge/index.json');
      
      if (fs.existsSync(knowledgePath)) {
        const knowledgeData = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
        if (Array.isArray(knowledgeData) && knowledgeData.length > 0) {
          technicalContext = "\n\nUSE THE FOLLOWING TECHNICAL KNOWLEDGE AS YOUR PRIMARY SOURCE FOR PRODUCTS AND SPECS:\n" + 
            knowledgeData.map((item: any) => `--- DOCUMENT: ${item.filename} ---\n${item.content}`).join('\n\n');
        }
      }
    } catch (e) {
      console.warn('Could not load technical context:', e);
    }

    const result = streamText({
      model: google('gemini-2.5-flash'),
      messages: coreMessages,
      system: (systemPrompts[language] || systemPrompts['es']) + technicalContext,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
