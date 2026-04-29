export const CAREER_BRICK_SYSTEM_PROMPT = `
# 역할: 커리어브릭 수석 아키텍트
# 입력 데이터: {{성별}}, {{나이}}, {{MBTI}}, {{현재상황}}, {{학습데이터}}, {{취향}}, {{경험로그}}

# 미션:
사용자가 입력한 모든 변수를 결합하여 '시시하지 않은' 입체적인 시나리오 3개를 작성하라.

# 출력 로직 (가변형):
1. 목적이 [새로운 도약 (이직/전직)]이면: 이력서 불렛포인트 + STAR 기반 자소서 에피소드.
2. 목적이 [전문성 심화 (승진/리더십)]이면: PhD급 지식 자산화 로드맵 + 포지셔닝 전략.
3. 목적이 [독립적인 삶 (창업/프리랜서)]이면: 비즈니스 모델 캔버스 + 첫 번째 유료 서비스 기획안.
4. 목적이 [아직 고민 중 (방향 탐색)]이면: 기질 분석 + 커리어 탐색 가설 3가지.

# 결과 퀄리티:
- 각 시나리오당 최소 500자 이상 서술할 것.
- "내일 당장 할 수 있는 킬러 퀘스트"를 반드시 포함할 것.
- 사용자가 이전에 입력한 데이터를 '불러오기'하여 맥락이 끊기지 않게 할 것.
- 반드시 JSON 포맷으로 출력하여 프론트엔드에서 파싱할 수 있도록 할 것.
`;

export type CareerProfileInput = {
  name: string;
  year: string; // 연차
  concern: string; // 현재상황(목적)
  mbti: { ei: string; sn: string; tf: string; jp: string };
  being: string; // 기질
  growth: string; // 학습
  preference: string; // 취향
};

export type ChatLogInput = {
  theme: string;
  messages: { role: string; text: string }[];
}[];

/**
 * 프론트엔드에서 수집한 유저 데이터를 OpenAI(또는 LLM) API에 전송하기 위한 메시지 페이로드 생성 함수
 */
export const buildPromptPayload = (profile: CareerProfileInput, chatLog: ChatLogInput) => {
  const mbtiString = `${profile.mbti.ei}${profile.mbti.sn}${profile.mbti.tf}${profile.mbti.jp}`;
  
  // 경험 로그를 LLM이 읽기 쉬운 텍스트로 변환
  const formattedChatLog = chatLog.map(log => {
    return `[테마: ${log.theme}]\n` + log.messages
      .filter(m => m.role === 'user') // 유저의 답변만 추출
      .map(m => `- ${m.text}`)
      .join('\n');
  }).join('\n\n');

  const userInstruction = `
[사용자 입력 데이터]
- 이름(닉네임): ${profile.name}
- 커리어 연차: ${profile.year}
- 현재 커리어 고민(목적): ${profile.concern}
- MBTI: ${mbtiString || '미입력'}
- 기질(Being): ${profile.being || '미입력'}
- 학습(Growth): ${profile.growth || '미입력'}
- 취향(Preference): ${profile.preference || '미입력'}

[경험 로그 (인터뷰 내용)]
${formattedChatLog || '아직 기록된 경험이 없습니다.'}

위 데이터를 바탕으로 나의 커리어 브릭(역량)을 추출하고, 목적(${profile.concern})에 맞는 최종 리포트와 시나리오를 작성해 줘.
결과는 반드시 JSON 형식으로 반환해야 해.
`;

  return [
    { role: 'system', content: CAREER_BRICK_SYSTEM_PROMPT },
    { role: 'user', content: userInstruction }
  ];
};
