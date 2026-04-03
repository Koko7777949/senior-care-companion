import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'الرسالة مطلوبة' },
        { status: 400 }
      );
    }

    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد ذكي لكبار السن. أجب بإيجاز ووضوح بالعربية. كن لطيفاً ومحترماً. إجاباتك قصيرة ومفيدة.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        thinking: { type: 'disabled' },
      });
      
      const response = completion.choices[0]?.message?.content || 'عذراً، لم أفهم طلبك.';
      
      return NextResponse.json({ response });
    } catch {
      // Fallback response if AI fails
      const responses: Record<string, string> = {
        'مرحب': 'أهلاً وسهلاً! كيف يمكنني مساعدتك؟',
        'كيف حالك': 'أنا بخير، شكراً لسؤالك! كيف يمكنني مساعدتك؟',
        'شكرا': 'عفواً، سعيد بخدمتك!',
        'وداعا': 'مع السلامة! أتمنى لك يوماً سعيداً.',
      };
      
      const lowerMessage = message.toLowerCase();
      let response = 'عذراً، لم أفهم طلبك. هل يمكنك إعادة صياغته؟';
      
      for (const [key, value] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
          response = value;
          break;
        }
      }
      
      return NextResponse.json({ response });
    }
  } catch (error) {
    console.error('Error in assistant API:', error);
    return NextResponse.json(
      { response: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }
}
