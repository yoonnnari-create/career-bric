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

  const { profile, userExperienceLog } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set.' });
  }

  try {
    const systemInstruction = `당신은 뛰어난 '커리어 마스터 아키텍트'입니다.
사용자의 프로필과 여러 테마에 걸친 인터뷰 로그를 분석하여, 사용자의 역량을 구조화된 JSON 데이터로 추출해야 합니다.
반드시 아래의 JSON 스키마를 완벽하게 준수하여 응답하세요. 다른 설명이나 마크다운 백틱(\`\`\`)은 제외하고 순수 JSON 문자열만 반환하세요.

[사용자 프로필]
연차: ${profile.year}
고민: ${profile.concern}
MBTI: ${profile.mbti ? Object.values(profile.mbti).join('') : '미입력'}
기질: ${profile.being || '없음'}
학습: ${profile.growth || '없음'}
취향: ${profile.preference || '없음'}

[응답 JSON 스키마 (반드시 이 형태를 지킬 것)]
{
  "skills": [
    {
      "id": 1,
      "title": "역량 제목 (예: 현장 밀착형 요구사항 발굴)",
      "type": "Action 또는 Network 또는 Core 또는 Future 중 하나",
      "colorCode": "헥스코드 (Action은 #77DD77, Network는 #AEC6CF, Core는 #D3D3D3, Future는 #B19CD9 추천)",
      "icon": "Target, Network, Layers, Presentation, Cpu, Heart, Flame, Lightbulb 중 하나",
      "detail": "역량에 대한 구체적인 설명 (사용자 인터뷰 기반)",
      "impact": "이 역량이 가져온 결과적 성과 (Impact ➔ ... 형태)"
    }
    // 4~6개의 역량 브릭 추출
  ],
  "bridgeBuilderData": {
    "summary": "전체 역량을 한 줄로 요약하는 타이틀",
    "greeting": "사용자에게 건네는 환영 인사 한 줄",
    "matrix": {
      "title": "✨ 브릭 매트릭스 (Golden Circle)",
      "what": "경험에서 도출된 핵심 직무 역량",
      "who": "MBTI 및 인터뷰에서 묻어나는 성향적 강점",
      "future": "학습 중이거나 앞으로 나아갈 방향",
      "synergy": "위 3가지가 교차하여 만들어지는 궁극적인 시너지 문장"
    },
    "scenarios": [
      {
        "type": "시나리오 A (마스터 경로 등)",
        "title": "추천 직무/경로 타이틀",
        "logic": "왜 이 경로를 추천하는지에 대한 논리적 설명",
        "target": "타겟 기업이나 기대 효과"
      }
      // 3개의 구체적인 커리어 시나리오 작성
    ],
    "killerQuest": "내일 아침 9시에 바로 할 수 있는 가장 구체적인 행동 미션 한 가지",
    "cheatKey": {
      "title": "자소서 치트키 또는 엘리베이터 피치 제목",
      "content": "면접이나 자소서에서 바로 쓸 수 있는 강렬한 자기소개 문단"
    }
  },
  "careerWriterData": {
    "title": "포트폴리오 초안 / 비즈니스 제안서 등 (고민에 맞춰 변형)",
    "greeting": "해당 리포트를 제공하며 건네는 인사말",
    "headline": "전체를 관통하는 강력한 헤드라인 [대괄호 포함]",
    "sections": [
      {
        "label": "섹션 제목 (예: 1. 타겟 페인 포인트)",
        "content": "섹션 상세 내용"
      }
      // 3~5개의 섹션
    ],
    "resumeMode": [
      "이력서에 들어갈 구체적인 불릿 포인트 1 (수치 포함)",
      "이력서에 들어갈 구체적인 불릿 포인트 2",
      "이력서에 들어갈 구체적인 불릿 포인트 3"
    ],
    "coverLetterMode": {
      "title": "자소서 스토리텔링 제목",
      "content": "[Situation] ... \\n\\n[Task] ... \\n\\n[Action] ... \\n\\n[Result] ... 형태의 STAR 기법 자소서 초안"
    }
  }
}`;

    const contents = [{
      role: 'user',
      parts: [{
        text: `다음은 내가 여러 테마에 걸쳐 진행한 인터뷰 로그야. 이를 바탕으로 JSON 리포트를 생성해줘.\n\n${JSON.stringify(userExperienceLog, null, 2)}`
      }]
    }];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(500).json({ error: data.error?.message || 'Failed to generate report' });
    }

    const aiReply = data.candidates[0].content.parts[0].text;
    
    // Parse to ensure it's valid JSON
    const parsedJson = JSON.parse(aiReply);
    return res.status(200).json(parsedJson);

  } catch (error: any) {
    console.error('Generate API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
