import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { theme, profile, chatHistory } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set.' });
  }

  try {
    const systemInstruction = `당신은 뛰어난 '커리어 마스터 아키텍트'입니다.
사용자는 [${theme}] 테마를 선택했습니다.
사용자의 연차는 [${profile.year || '미입력'}], 현재 커리어 고민은 [${profile.concern || '미입력'}], MBTI 기질은 [${profile.mbti ? Object.values(profile.mbti).join('') : '미입력'}]입니다.
추가 라이프 데이터: 성향(${profile.being || '없음'}), 학습(${profile.growth || '없음'}), 취향(${profile.preference || '없음'}).

당신의 목표는 사용자가 들려준 경험에서 구체적인 '행동(Action)', '수치적 성과(Result)', '문제 해결 과정(Problem Solving)'을 이끌어내는 것입니다.
한 번에 한 가지의 날카롭고 구체적인 꼬리질문만 던지세요. 친절하지만 전문적인 어조를 유지하세요.
사용자의 답변이 부실하다면, 구체적인 예시(예: 예산 규모, 참여 인원 수, 기간 등)를 요구하세요. 답변이 충분히 구체적이라면 칭찬하며 다음 단계 질문으로 넘어가세요.`;

    const formattedHistory = chatHistory.map((msg: any) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: formattedHistory,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(500).json({ error: data.error?.message || 'Failed to generate response' });
    }

    const aiReply = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ reply: aiReply });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
