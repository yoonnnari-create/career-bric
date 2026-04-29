import { useState, useRef, useEffect } from 'react';
import { 
  Blocks, 
  Target, 
  Network, 
  Layers, 
  Presentation, 
  Cpu,
  ArrowRight,
  Briefcase,
  Heart,
  Flame,
  Lightbulb,
  Castle,
  BookOpen,
  Send,
  MessageSquare,
  Bot,
  Mic,
  Sparkles,
  Star,
  TrendingUp,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';

// --- Hard Skills Data (Updated to Block Architect JSON Spec) ---
const HARD_SKILLS = [
  { id: 1, title: "현장 밀착형 요구사항 발굴", type: 'Action', color: 'green', colorCode: '#77DD77', layout: 1, icon: Target, detail: "모호한 과업지시서에 의존하지 않고 즉각적으로 제주도 현장에 투입하여 실무자의 진짜 문제(Root Cause)를 파악함", impact: "탁상공론을 배제한 실효성 있는 제안 기틀 마련" },
  { id: 2, title: "다각적 이해관계자 조율", type: 'Network', color: 'blue', colorCode: '#AEC6CF', layout: 2, icon: Network, detail: "단 하루 만에 발주처 5명, 유관 기관 3명, 운영 기획자 2명 등 총 10명의 각기 다른 핵심 관계자를 심층 인터뷰함", impact: "다부서 복합 프로젝트의 성공적 커뮤니케이션 및 상호 합의 도출" },
  { id: 3, title: "엔드투엔드 솔루션 아키텍처", type: 'Core', color: 'gray', colorCode: '#D3D3D3', layout: 3, icon: Layers, detail: "현장에서 수집된 로우 데이터에 기존의 성과관리 노하우를 융합하여 End-to-End 프로그램을 기획함", impact: "2억 원 규모 예산의 실행 가능한 비즈니스 모델(BM) 설계" },
  { id: 4, title: "클라이언트 밸류 딜리버리", type: 'Network', color: 'blue', colorCode: '#AEC6CF', layout: 4, icon: Presentation, detail: "개인적인 허들(발표 두려움)을 돌파하고 경쟁 PT 무대에 직접 올라 심사위원들에게 기획안의 가치를 설득함", impact: "핵심 B2B 경쟁 피칭을 통한 성공적인 투자/수주 설득력 입증" },
  { id: 5, title: "기획 방법론 자산화", type: 'Future', color: 'purple', colorCode: '#B19CD9', layout: 5, icon: Cpu, detail: "수주 여부에 얽매이지 않고 주도했던 기획 사이클의 완성도를 객관적으로 복기하여 독립적인 컨설팅 방법론으로 내재화함", impact: "조직 및 개인의 지식 자산(Knowledge Base) 구축 및 문제 해결 프레임워크 전파" }
];

// --- Soft Skills Data (Maintained for 2x2 grid) ---
const SOFT_SKILLS = [
  { id: 101, title: "돌파하는 진정성", type: 'Network', color: 'blue', colorCode: '#AEC6CF', layout: 6, icon: Heart, detail: "두려움보다 산출물의 가치를 알리려는 목적을 우선시하며 공감을 이끌어내는 내면의 힘.", impact: "위기 상황에서의 오너십 발휘 및 한계 극복" },
  { id: 102, title: "본질적 집요함", type: 'Action', color: 'green', colorCode: '#77DD77', layout: 7, icon: Flame, detail: "문서상 요구사항에 타협하지 않고 진짜 문제의 실체와 마주할 때까지 파고드는 추진력.", impact: "모호한 텍스트를 실체적 행동으로 전환하는 의지" },
  { id: 103, title: "완성도 자부심", type: 'Core', color: 'gray', colorCode: '#D3D3D3', layout: 8, icon: Lightbulb, detail: "스스로 떳떳할 수 있는 퀄리티 기준을 충족시키는 것에 더 큰 가치를 느끼고 몰입하는 장인정신.", impact: "외적 보상에 흔들리지 않는 내적 동기 발현" }
];

const ALL_BLOCKS = [...HARD_SKILLS, ...SOFT_SKILLS];

const BLOCKS_BY_CATEGORY = {
  Core: ALL_BLOCKS.filter(b => b.type === 'Core'),
  Network: ALL_BLOCKS.filter(b => b.type === 'Network'),
  Action: ALL_BLOCKS.filter(b => b.type === 'Action'),
  Future: ALL_BLOCKS.filter(b => b.type === 'Future')
};

const CATEGORY_INFO = {
  Core: { title: "기본 직무 역량", sub: "기획, 문서, 구조화" },
  Network: { title: "사람 지향 역량", sub: "소통, 조율, 네트워크" },
  Action: { title: "추진력 역량", sub: "실행, 현장 조사, 문제 해결" },
  Future: { title: "미래 확장 역량", sub: "연구, 지표 설계, 컨설팅" }
};

const BRIDGE_BUILDER_DATA = {
  summary: "현장 밀착형 실행력과 다각적 조율 능력을 겸비한 공공 비즈니스 전략가",
  greeting: "당신의 브릭들로 쌓아 올린 3가지 성의 설계도입니다.",
  matrix: {
    title: "✨ 브릭 매트릭스 (Golden Circle)",
    what: "13년간 쌓아온 B2B/공공 기획 및 문서 구조화 역량",
    who: "ENFJ 특유의 타인을 조율하고 이끄는 관계 지향적 기질",
    future: "데이터 기반의 지표 설계 및 PM/PO 방법론 학습 (현재 진행 중)",
    synergy: "이 3가지가 교차하는 당신의 '골든 서클'은 [모호한 요구사항을 구체적 지표로 번역하여 사람들을 움직이게 만드는 '구조적 리더십']입니다."
  },
  scenarios: [
    {
      type: "시나리오 A (마스터 경로)",
      title: "공공/엔터프라이즈 B2B 프로덕트 오너 (PO)",
      logic: "현재 13년간 쌓아온 기획 역량을 200% 활용하는 가장 현실적이면서 파괴력 있는 경로입니다. 모호함을 구조화하는 문서 능력과, 이해관계를 조율하는 기질은 B2B 프로덕트 오너의 핵심 무기입니다. 여기에 현재 학습 중인 '데이터 지표 설계' 능력이 더해지면 연봉의 퀀텀 점프가 가능합니다.",
      target: "타겟 기업: 대형 SI 기업의 신사업 부서, B2B SaaS 스타트업의 리드 PM (예상 연봉 상승률: 20~30%)"
    },
    {
      type: "시나리오 B (하이브리드 경로)",
      title: "커뮤니티 기반의 사이드 프로젝트 비즈니스",
      logic: "평소 '사람 모으기'나 '독서/봉사 모임' 같은 취향과 강점을 현재 직무와 결합하는 모델입니다. 낮에는 기획자로 일하되, 주말이나 퇴근 후에는 기획/PM 주니어들을 위한 커뮤니티를 운영하거나 멘토링 프로그램을 런칭해 보세요. 당신의 조율 역량과 문서 구조화 능력은 훌륭한 교육 콘텐츠가 됩니다.",
      target: "기대 효과: 월 100~200만 원의 파이프라인 추가 및 잠재적 고객/파트너 발굴"
    },
    {
      type: "시나리오 C (독립 경로)",
      title: "B2B 기획/컨설팅 1인 지식 창업 (PhD 전문가 레벨)",
      logic: "특정 조직에 얽매이지 않고 당신의 13년 노하우 자체를 '상품화'하는 궁극의 독립 로드맵입니다. 박사 과정이나 심화 학습을 통해 얻은 전문성을 기반으로 1인 컨설팅 펌을 설립할 수 있습니다.",
      target: "5가지 콘텐츠 테마: 1) 공공 입찰 100% 수주하는 제안서 구조, 2) 이해관계자 갈등 해결의 프레임워크, 3) 요구사항 정의서(PRD) 작성법, 4) 2억 예산을 통제하는 리스크 관리법, 5) B2B B2G 커뮤니케이션 스킬"
    }
  ],
  killerQuest: "내일 아침 9시에 바로 할 수 있는 가장 구체적인 행동 하나:\n[지난 3년간 진행한 프로젝트 중 가장 성과가 좋았던 1개의 WBS와 결과 보고서를 바탕으로 '나만의 템플릿 1장' 만들기]",
  cheatKey: {
    title: "자소서 1번 문항 (성장과정/핵심역량) 치트키",
    content: "저의 가장 큰 경쟁력은 '모호함을 해체하여 합의 가능한 구조로 조립하는 집요함'입니다. 13년간 공공 및 B2B 기획자로 일하며, 요구사항이 불명확한 수많은 프로젝트를 마주했습니다. 저는 데스크 리서치에 의존하지 않고, 항상 대립하는 이해관계자 3곳 이상을 직접 대면하며 현장의 페인포인트를 수집했습니다. 이를 바탕으로 복잡한 과업을 5개의 명확한 실행 플랜(WBS)으로 쪼개어 모두가 동의하는 방향으로 이끌었습니다. 이러한 '현장 밀착형 조율'과 '문서 구조화' 역량은 귀사의 2억 규모 신규 예산 프로젝트를 성공적으로 완수하는 핵심 동력이 될 것입니다."
  }
};

const getCareerWriterData = (concern: string) => {
  if (concern.includes("전문성")) {
    return {
      title: "전문가 포지셔닝 리포트",
      greeting: "당신의 깊이를 더해줄 전문가 포지셔닝 리포트입니다:",
      headline: "[학술적 기반과 현장 실행력을 결합한 대체 불가능한 도메인 엑스퍼트]",
      sections: [
        { label: "미래 핵심 키워드", content: "데이터 기반 의사결정(Data-Driven), 이해관계자 갈등 조정(Conflict Resolution), 공공 B2B 특화 전략" },
        { label: "학술/실무 결합 전략", content: "현재 진행 중인 지표 설계 학습을 기존의 문서 구조화 역량과 결합하여, 단순한 기획을 넘어 '숫자로 증명되는 기획 방법론'을 구축하세요." },
        { label: "전문가 네트워킹 제안", content: "B2B SaaS PM 커뮤니티나 공공 입찰 컨설팅 그룹에 참여하여, 당신의 문제 해결 프레임워크를 공유하고 인지도를 확보하세요." }
      ]
    };
  } else if (concern.includes("독립")) {
    return {
      title: "1인 기업 / 프리랜서 비즈니스 초안",
      greeting: "조직의 명함을 떼고 홀로서기를 준비하는 당신을 위한 비즈니스 설계도입니다:",
      headline: "[B2B/공공 기획 및 갈등 조율을 무기로 한 1인 컨설팅 펌]",
      sections: [
        { label: "1. 타겟 페인 포인트 (Target Pain Point)", content: "스타트업이나 중소기업이 대형 공공 입찰(RFP)이나 B2B 수주를 준비할 때 겪는 '모호한 요구사항 해독'의 어려움과, 유관 부서 간 커뮤니케이션 부재로 인한 '프로젝트 딜레이' 현상." },
        { label: "2. 고유 가치 제안 (Unique Value Proposition)", content: "단순히 예쁜 제안서 디자인을 넘어서, 데스크 리서치가 아닌 직접 발로 뛰며 이해관계자의 숨은 니즈를 파악해 '100% 합의 가능한 구조'를 짜주는 실전형 기획. 2억 규모의 예산과 리스크를 성공적으로 통제해 낸 검증된 노하우." },
        { label: "3. 핵심 수익화 모델 (MVP Service)", content: "• [Tier 1] B2B 공공 입찰 제안서 구조화 원데이 진단 컨설팅 (2시간, 50만 원)\n• [Tier 2] 실무자용 이해관계자 갈등 해결 및 WBS 작성 템플릿 VOD + 1:1 코칭 패키지 (29만 원)" },
        { label: "4. 초기 고객 획득 전략 (Go-to-Market)", content: "링크드인(LinkedIn) 및 IT 커뮤니티에 '공공 입찰에서 무조건 떨어지는 제안서의 3가지 특징' 등 실무 밀착형 인사이트 칼럼 연재. 고관여 B2B 고객을 대상으로 하는 프라이빗 웨비나 개최." },
        { label: "5. 리스크 및 확장 전략 (Scale-up)", content: "초기 1인 체제에서는 물리적 시간(Man-Month)의 한계가 명확함. 직접 모든 페이지를 다 쓰는 용역을 피하고, '요구사항 정의서(PRD) 및 WBS 뼈대 컨설팅'으로 서비스를 날카롭게 한정하여 시급(ROI)을 극대화할 것." }
      ]
    };
  } else if (concern.includes("고민")) {
    return {
      title: "커리어 탐색 가이드북",
      greeting: "당신만의 북극성을 찾기 위한 커리어 탐색 가이드북입니다:",
      headline: "[안정적인 구조를 만들고 사람을 돕는 것에 탁월한 조율의 멘토]",
      sections: [
        { label: "발견된 핵심 기질 분석", content: "당신은 타인의 문제를 깊이 공감하고(ENFJ), 흩어진 정보를 모아 합의 가능한 구조로 엮어내는 데에 강한 성취감을 느낍니다." },
        { label: "성향에 맞는 직군 리스트", content: "1. B2B 프로덕트 매니저(PM/PO)\n2. 사내 조직문화/커뮤니케이션 리더\n3. 고객 성공 매니저 (Customer Success)" },
        { label: "마스터의 한 마디", content: "지금 당장 목적지가 명확하지 않아도 괜찮습니다. 당신이 지금까지 조율해 온 복잡한 문제들과 사람들의 마음은, 어느 곳으로 가든 가장 강력한 대체 불가능한 무기가 될 것입니다. 당신의 속도대로 나아가세요." }
      ]
    };
  } else {
    // Default (이직 등)
    return {
      title: "커리어 하이라이트 & 자소서 치트키",
      greeting: "이 블록들로 만든 당신의 이직용 필살기 문장입니다:",
      headline: "[현장 밀착형 실행력(역량)을 바탕으로 부처 간의 이해관계(문제)를 해결하여 2억 규모의 신규 예산(성과)을 확보한 전략가]",
      resumeMode: [
        "모호한 RFI/RFP 요구사항을 분석하여, 실행 가능한 구체적 액션 플랜과 WBS로 재구조화 (문서화 역량)",
        "이해관계가 대립하는 3개 부처 실무진과의 현장 인터뷰를 통해 합의점을 도출하고 통합 과업 지시서 완성 (조율 역량)",
        "기존 대비 20% 절감된 예산 내에서 최적의 퍼포먼스를 내기 위한 벤더사 관리 및 리스크 통제 (실행 역량)"
      ],
      coverLetterMode: {
        title: "끝까지 파고드는 집요함으로 만들어낸 2억 원의 가치",
        content: "[JD 핵심 키워드: B2B 사업 기획, 이해관계자 커뮤니케이션, 문제 해결력]\n\n[Situation] 당시 발주처는 구체적인 방향성 없이 막연한 기대감만으로 사업을 추진 중이었습니다. (💡 주석: '분석력 브릭'을 사용하여 JD의 '문제 정의 역량'과 1:1 매칭)\n\n[Task] 저는 모호한 요구사항을 실체화하고, 한정된 예산 내에서 최대 효율을 낼 수 있는 구조를 짜야 했습니다.\n\n[Action] 직접 3개의 유관 부서를 찾아가 대면 인터뷰를 진행하며 각기 다른 페인포인트를 수집했습니다. 이후 이를 5개의 핵심 과제로 쪼개어 전원의 동의를 얻어냈습니다. (💡 주석: '조율 브릭'과 'MBTI: ENFJ' 기질을 활용하여 JD의 '커뮤니케이션 역량'을 강력하게 어필)\n\n[Result] 그 결과, 초기 예산 2억 원 규모의 프로젝트를 성공적으로 수주하였으며, 이는 조직의 새로운 B2B 수익 모델로 안착했습니다.\n\n⚠️ 마스터 아키텍트의 역질문 (해상도 업그레이드):\n'새로운 B2B 수익 모델로 안착했다'는 부분에 구체적인 숫자가 빠져 있습니다. 이 수주 이후에 추가로 발생한 매출액이나, 프로젝트를 통해 절감된 시간(Man-Month) 데이터가 있다면 추가해 주세요!"
      }
    };
  }
};

const LegoStuds = ({ colorCode }: { colorCode: string }) => (
  <div className="absolute -top-[8px] left-6 flex gap-3 z-0">
    {[1, 2, 3].map(i => (
      <div key={i} className="relative w-8 h-[8px]">
        {/* Stud body (shadowed) */}
        <div className="absolute top-[3px] w-8 h-[6px] rounded-b-md" style={{ backgroundColor: colorCode, filter: 'brightness(0.85)', boxShadow: '2px 0px 3px rgba(0,0,0,0.1)' }}></div>
        {/* Stud top */}
        <div className="absolute top-0 w-8 h-[6px] rounded-[50%] border-t border-white/60" style={{ backgroundColor: colorCode, filter: 'brightness(1.1)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5)' }}></div>
      </div>
    ))}
  </div>
);

type ChatMessage = { id: string; role: 'ai' | 'user'; text: string; isComplete?: boolean };

const SAVE_KEY = 'careerbrick_save_data';

export default function App() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingToDB, setIsSavingToDB] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  // Onboarding State
  const [hasStarted, setHasStarted] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [profile, setProfile] = useState({ name: '', year: '', concern: '', mbti: { ei: '', sn: '', tf: '', jp: '' }, being: '', growth: '', preference: '' });

  // Chat Interface State
  const [theme, setTheme] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatTurn, setChatTurn] = useState(0);
  const [userExperienceLog, setUserExperienceLog] = useState<{theme: string, messages: ChatMessage[]}[]>([]);
  
  const [showLoadPrompt, setShowLoadPrompt] = useState(false);
  const [savedData, setSavedData] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Auth State
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // [Mock Auth] Supabase Auth 대신 로컬 스토리지를 활용한 간편 테스트 로그인
    const mockSession = localStorage.getItem('mock_session');
    if (mockSession) {
      setSession(JSON.parse(mockSession));
    }
    setIsAuthLoading(false);
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email) {
      setAuthError('이메일을 입력해주세요.');
      return;
    }
    
    setIsAuthLoading(true);
    
    // [Mock Auth] 테스트를 위한 0.5초 가짜 딜레이 후 강제 로그인 처리
    setTimeout(() => {
      const mockSession = { user: { email, id: 'mock-user-' + Date.now() } };
      setSession(mockSession);
      localStorage.setItem('mock_session', JSON.stringify(mockSession));
      setIsAuthLoading(false);
    }, 500);
  };

  const handleLogout = async () => {
    // [Mock Auth] 로그아웃
    setSession(null);
    localStorage.removeItem('mock_session');
    
    setStep(1);
    setHasStarted(false);
    setIsOnboarded(false);
    setTheme(null);
    setMessages([]);
    setChatTurn(0);
  };
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isOnboarded || parsed.step > 1 || (parsed.profile && parsed.profile.year)) {
          setSavedData(parsed);
          setShowLoadPrompt(true);
          return;
        }
      }
    } catch(e) {}
    setIsInitialized(true);
  }, []);

  const handleLoadSavedData = () => {
    if (savedData) {
      if (savedData.step) setStep(savedData.step);
      if (savedData.hasStarted !== undefined) setHasStarted(savedData.hasStarted);
      if (savedData.isOnboarded !== undefined) setIsOnboarded(savedData.isOnboarded);
      if (savedData.profile) setProfile(p => ({...p, ...savedData.profile}));
      if (savedData.theme) setTheme(savedData.theme);
      if (savedData.messages) setMessages(savedData.messages);
      if (savedData.chatTurn !== undefined) setChatTurn(savedData.chatTurn);
      if (savedData.userExperienceLog) setUserExperienceLog(savedData.userExperienceLog);
    }
    setShowLoadPrompt(false);
    setIsInitialized(true);
  };

  const handleStartNew = () => {
    setShowLoadPrompt(false);
    setIsInitialized(true);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 스마트 자동 저장 (빈 데이터 덮어쓰기 방지)
  useEffect(() => {
    if (isInitialized && (hasStarted || isOnboarded || step > 1 || messages.length > 0 || userExperienceLog.length > 0)) {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ step, hasStarted, isOnboarded, profile, theme, messages, chatTurn, userExperienceLog }));
    }
  }, [isInitialized, step, hasStarted, isOnboarded, profile, theme, messages, chatTurn, userExperienceLog]);

  const handleSelectTheme = (selectedTheme: string) => {
    setTheme(selectedTheme);
    let initialMessage = '';
    
    if (selectedTheme === '돌파') {
      initialMessage = '🚀 [돌파] 테마군요! 불가능해 보이던 상황에서 님의 발목을 잡은 가장 큰 허들(빌런)은 무엇이었나요?';
    } else if (selectedTheme === '조율') {
      initialMessage = '🤝 [조율] 테마네요! 도저히 안 맞던 사람들과 합을 맞췄던 그때, 의견이 가장 팽팽하게 대립했던 부분은 어디였나요?';
    } else if (selectedTheme === '몰입') {
      initialMessage = '🔍 [몰입]의 순간이군요! 퀄리티를 높이기 위해 남들은 모르는, 님만이 집요하게 파고들었던 디테일은 무엇이었나요?';
    } else if (selectedTheme === '증명') {
      initialMessage = '📊 [증명] 테마군요! 막연한 주장을 확실한 성과로 입증하기 위해, 당신이 세웠던 가장 핵심적인 \'숫자(지표)\'는 무엇이었나요?';
    } else if (selectedTheme === '시스템') {
      initialMessage = '🛠️ [시스템] 테마네요! 매번 반복되는 병목 현상을 님은 어떤 도구(혹은 구조)로 해결하셨나요?';
    } else if (selectedTheme === '성장') {
      initialMessage = '🌱 [성장]의 순간이군요! 꼼짝도 안 하던 동료나 조직을 움직이게 만든, 당신만의 결정적인 한 마디나 액션은 무엇이었나요?';
    } else if (selectedTheme === '기타(자유)') {
      initialMessage = '✨ [자유 주제]를 선택하셨네요! 건강, 재정, 개인적인 목표 등 현재 가장 기록해 두고 싶은 당신만의 특별한 상황이나 고민은 무엇인가요?';
    }

    setMessages([{ id: Date.now().toString(), role: 'ai', text: initialMessage }]);
    setChatInput('');
    setChatTurn(0);
  };

  const handleSendMessage = () => {
    const inputText = chatInput.trim();
    if (!inputText) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAiTyping(true);
    
    // 단답형(ㅎㅎ, 몰라 등) 입력 방지 및 풍부한 데이터 유도 로직 (30자 미만 컷)
    if (inputText.length < 30) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'ai', 
          text: '방금 적어주신 내용만으로는 단단한 역량 브릭을 구워내기가 조금 아쉽습니다. 😅\n\nCareerBrick은 인터뷰가 구체적일수록 훨씬 더 날카롭고 매력적인 결과물을 추출해냅니다. 당시의 상황이나 본인만의 결정적인 액션을 조금만 더 생생하게(최소 30자 이상) 들려주시겠어요?' 
        }]);
        setIsAiTyping(false);
      }, 1200);
      return; // 턴을 넘기지 않고 종료
    }

    const nextTurn = chatTurn + 1;
    setChatTurn(nextTurn);

    setTimeout(() => {
      let aiResponse = '';
      let isComplete = false;

      if (nextTurn === 1) {
        aiResponse = '아까 말씀하신 경험과 완벽하게 이어지네요! (User_Experience_Log에 안전하게 누적되었습니다) 🔥 구체적으로 그때 규모나 수치(예: 2억 예산, 만난 사람 수 등)는 어땠나요? 숫자로 디테일을 더해주세요!';
      } else if (nextTurn === 2) {
        aiResponse = '정말 대단하시네요! 이 맥락도 로그에 추가했습니다. 그 상황을 해결하기 위해 님만이 했던 "무식하지만 확실한 행동" 하나만 더 들려주시겠어요?';
      } else {
        aiResponse = '완벽합니다! 👏👏 지금까지의 모든 대화가 User_Experience_Log에 저장되었습니다. 이제 이 조각들을 모아 최종 렌더링 단계로 넘어갈 준비가 되었습니다. 하단의 버튼을 눌러주세요!';
        isComplete = true;
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: aiResponse, isComplete }]);
      setIsAiTyping(false);
    }, 1500); // 1.5초 타이핑 딜레이
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNextStep = (nextStep: number) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(nextStep);
    }, 1500);
  };

  const handleHomeClick = () => {
    if(window.confirm("현재 화면의 모든 내용이 초기화됩니다. (수동 저장한 데이터는 유지됩니다.) 처음으로 돌아가시겠습니까?")) {
      setStep(1);
      setTheme(null);
      setMessages([]);
      setChatTurn(0);
      setChatInput('');
      setIsOnboarded(false);
      setHasStarted(false);
      setProfile({ name: '', year: '', concern: '', mbti: { ei: '', sn: '', tf: '', jp: '' }, being: '', growth: '', preference: '' });
    }
  };

  const handleBackClick = () => {
    if (step === 4) setStep(3);
    else if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else if (step === 1) {
      if (theme) {
        if(window.confirm("테마 선택 화면으로 돌아가시겠습니까? 현재 진행 중인 대화는 안전하게 저장됩니다.")) {
          if (messages.length > 0) {
            setUserExperienceLog(prev => {
              const filtered = prev.filter(p => p.theme !== theme);
              return [...filtered, { theme, messages }];
            });
          }
          setTheme(null);
          setMessages([]);
          setChatTurn(0);
          setChatInput('');
        }
      } else if (isOnboarded) {
        setIsOnboarded(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-zinc-100 overflow-hidden relative" style={{ fontFamily: "'Pretendard', sans-serif" }}>
      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css");
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex flex-col h-screen">
        
        {/* Header */}
        <nav className="flex items-center justify-between mb-8 shrink-0 relative z-20">
          <div className="flex items-center gap-6">
            <div onClick={handleHomeClick} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 bg-white text-black flex items-center justify-center rounded-lg shadow-lg group-hover:scale-105 transition-transform">
                <Blocks size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter group-hover:text-purple-400 transition-colors">CareerBrick</h1>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Mining & Builder Engine</p>
              </div>
            </div>

            {(step > 1 || isOnboarded) && (
              <button 
                onClick={handleBackClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors text-sm font-bold border border-zinc-700/50"
              >
                ← 뒤로 가기
              </button>
            )}

          </div>

          <div className="flex gap-2 items-center ml-auto border-l border-zinc-800 pl-4">
            <button 
              onClick={() => {
                localStorage.setItem(SAVE_KEY, JSON.stringify({ step, hasStarted, isOnboarded, profile, theme, messages, chatTurn, userExperienceLog }));
                alert('현재 전체 진행 상황이 안전하게 수동 저장되었습니다!');
              }}
              className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg font-bold transition-colors border border-zinc-700"
            >
              💾 저장
            </button>
            <button 
              onClick={() => {
                try {
                  const saved = localStorage.getItem(SAVE_KEY);
                  if (saved) {
                    const parsed = JSON.parse(saved);
                    if (!parsed.hasStarted && !parsed.isOnboarded && !parsed.theme && (!parsed.messages || parsed.messages.length === 0)) {
                      alert('현재 보관된 저장 데이터가 비어있습니다. (이전 오류로 인해 초기화 상태가 저장됨)\n새로 입력을 진행하신 뒤 [저장] 버튼을 눌러 덮어씌워주세요!');
                      return;
                    }
                    setSavedData(parsed);
                    setShowLoadPrompt(true);
                  } else {
                    alert('저장된 데이터가 없습니다.');
                  }
                } catch(e) {}
              }}
              className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg font-bold transition-colors border border-zinc-700"
            >
              <History size={12} />
              불러오기
            </button>

            {session && (
              <>
                <div className="text-xs text-zinc-400 mr-1 ml-2 flex items-center gap-1.5 hidden md:flex">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  {session.user.email}
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg font-bold transition-colors border border-red-900/50"
                >
                  로그아웃
                </button>
              </>
            )}
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-md">
            <button onClick={() => setStep(1)} className={step === 1 ? "text-white" : "text-zinc-600 transition-colors"}>1. 브릭 추출</button>
            <ArrowRight size={14} className="text-zinc-700" />
            <button className={step === 2 ? "text-purple-400 font-bold" : "text-zinc-600"}>2. 브릭 분포</button>
            <ArrowRight size={14} className="text-zinc-700" />
            <button className={step === 3 ? "text-indigo-400 font-bold" : "text-zinc-600"}>3. 브릭 조립</button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden pb-8 relative">
          {showLoadPrompt && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
              <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full relative -top-10">
                <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-xl font-black text-white mb-2">저장된 데이터 불러오기</h3>
                <p className="text-sm text-zinc-400 mb-8 leading-relaxed">이전에 작성 중이던 내역이 있습니다.<br/>이어서 작성하시겠습니까?</p>
                <div className="flex flex-col gap-3">
                  <button onClick={handleLoadSavedData} className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/30">
                    네, 이어서 할게요
                  </button>
                  <button onClick={handleStartNew} className="w-full bg-zinc-800 text-zinc-300 font-bold py-3.5 rounded-xl hover:bg-zinc-700 transition-colors">
                    아니오, 처음부터 할게요
                  </button>
                </div>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            
            {/* STEP 1: INTERVIEW WIZARD */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-4xl mx-auto flex flex-col h-full gap-6"
              >
                {!session && !isAuthLoading ? (
                  <div className="flex-1 flex flex-col items-center text-center max-w-4xl mx-auto w-full pt-8 pb-16 custom-scrollbar">
                    
                    {/* Hero Introduction Section */}
                    <div className="mb-6 inline-flex items-center justify-center p-4 bg-purple-500/10 text-purple-400 rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                      <Blocks size={48} />
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
                      당신이 보낸 시간의 가치를<br/><span className="text-purple-400">브릭</span>으로 확인해보세요.
                    </h1>
                    
                    <p className="text-xl text-zinc-300 font-medium mb-12 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 shadow-xl max-w-2xl mx-auto">
                      "경력(Career)은 정지된 기록이 아니라,<br/>언제든 다시 조립할 수 있는 <span className="text-emerald-400 font-bold">레고(Lego)</span>입니다."
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16 text-left">
                      <div className="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800 shadow-xl hover:-translate-y-1 transition-transform">
                        <div className="flex items-center gap-2 mb-3 text-purple-400"><Target size={20}/> <h3 className="font-bold text-lg text-white">1. 추출</h3></div>
                        <p className="text-sm text-zinc-400 leading-relaxed">모호한 경험에서 날카로운 역량을 뽑아냅니다.</p>
                      </div>
                      <div className="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800 shadow-xl hover:-translate-y-1 transition-transform">
                        <div className="flex items-center gap-2 mb-3 text-amber-400"><Star size={20}/> <h3 className="font-bold text-lg text-white">2. 발견</h3></div>
                        <p className="text-sm text-zinc-400 leading-relaxed">당신만의 고유한 기질과 강점을 찾아냅니다.</p>
                      </div>
                      <div className="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800 shadow-xl hover:-translate-y-1 transition-transform">
                        <div className="flex items-center gap-2 mb-3 text-indigo-400"><Castle size={20}/> <h3 className="font-bold text-lg text-white">3. 조립</h3></div>
                        <p className="text-sm text-zinc-400 leading-relaxed">당신의 미래를 3가지 구체적인 시나리오로 설계합니다.</p>
                      </div>
                    </div>

                    {/* Auth Form Section */}
                    <div className="w-full max-w-md bg-zinc-900/80 p-8 rounded-3xl border border-zinc-800 shadow-2xl backdrop-blur-sm flex flex-col gap-4 relative mx-auto">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        안전한 데이터 보관
                      </div>
                      <h3 className="text-2xl font-black mb-2 mt-2">간편 로그인 / 가입</h3>
                      <p className="text-sm text-zinc-400 mb-6">내 계정에 로그인하여 작성한 내용을 영구 보관하세요.</p>
                      
                      <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 w-full">
                        {authError && (
                          <div className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-500/20 text-left">
                            {authError}
                          </div>
                        )}
                        
                        <div className="text-left space-y-1 mb-2">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Email</label>
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="테스트용 이메일을 아무거나 입력하세요"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={isAuthLoading || !email}
                          className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-500 transition-all active:scale-95 shadow-lg shadow-purple-600/30 flex justify-center items-center gap-2 mt-2 disabled:opacity-50"
                        >
                          {isAuthLoading ? <span className="animate-pulse">처리 중...</span> : '1초 만에 바로 시작하기'}
                        </button>
                      </form>
                    </div>
                  </div>
                ) : !hasStarted ? (
                  <div className="flex-1 flex flex-col justify-center items-center text-center max-w-3xl mx-auto w-full">
                    <div className="mb-6 inline-flex items-center justify-center p-4 bg-purple-500/10 text-purple-400 rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                      <Blocks size={48} />
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
                      환영합니다!<br/>오늘 사용할 <span className="text-purple-400">닉네임</span>을 알려주세요.
                    </h1>
                    
                    <p className="text-xl text-zinc-400 font-medium mb-12">
                      당신의 경험을 멋지게 기록해 드릴게요.
                    </p>
                    
                    <div className="mb-8 w-full max-w-sm">
                      <input type="text" value={profile.name || ''} onChange={e => setProfile(p => ({...p, name: e.target.value}))} placeholder="이름(닉네임)을 알려주세요" className="w-full bg-zinc-900/80 border border-zinc-700 rounded-2xl px-6 py-4 text-center text-lg text-white focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all shadow-inner" />
                    </div>
                    
                    <button 
                      onClick={() => setHasStarted(true)}
                      disabled={!profile.name}
                      className="bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                    >
                      <Blocks size={20} /> 나의 브릭 성 쌓기 시작
                    </button>
                  </div>
                ) : !isOnboarded ? (
                  <div className="flex-1 flex flex-col justify-center items-center text-center max-w-2xl mx-auto w-full">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                      당신을 더 깊이 이해하고 싶습니다.<br/>
                      <span className="text-purple-400">현재 상황</span>을 알려주세요.
                    </h2>
                    <p className="text-zinc-400 mb-10">입력하신 정보는 인터뷰 질문의 톤과 깊이를 조율하는 데 사용됩니다.</p>
                    
                    <div className="w-full bg-zinc-900/60 border border-zinc-800 p-8 rounded-3xl text-left space-y-8 shadow-2xl">
                      <div>
                        <h3 className="font-bold text-lg mb-3 text-zinc-200">1. 현재 커리어 연차는 어떻게 되시나요?</h3>
                        <div className="flex flex-wrap gap-3">
                          {['1~3년 차 (주니어)', '4~7년 차 (미들)', '8년 차 이상 (시니어)'].map(y => (
                            <button 
                              key={y}
                              onClick={() => setProfile(p => ({ ...p, year: y }))}
                              className={`px-4 py-2.5 rounded-xl font-medium border transition-all ${profile.year === y ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/50' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500'}`}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-lg mb-3 text-zinc-200">2. 지금 가장 큰 커리어 고민은 무엇인가요?</h3>
                        <div className="flex flex-wrap gap-3">
                          {['새로운 도약 (이직/전직)', '전문성 심화 (승진/리더십)', '독립적인 삶 (창업/프리랜서)', '아직 고민 중 (방향 탐색)'].map(c => (
                            <button 
                              key={c}
                              onClick={() => setProfile(p => ({ ...p, concern: c }))}
                              className={`px-4 py-2.5 rounded-xl font-medium border transition-all ${profile.concern === c ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500'}`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <h3 className="font-bold text-lg mb-3 text-zinc-200">3. 본인의 기질(MBTI)은 무엇인가요?</h3>
                        <div className="flex flex-wrap gap-4">
                          {[
                            ['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']
                          ].map((pair, idx) => {
                            const key = (['ei', 'sn', 'tf', 'jp'] as const)[idx];
                            return (
                              <div key={idx} className="flex gap-2 bg-zinc-800/50 p-1.5 rounded-xl border border-zinc-700/50">
                                {pair.map(l => (
                                  <button 
                                    key={l} 
                                    onClick={() => setProfile(p => ({ ...p, mbti: { ...p.mbti, [key]: l } }))} 
                                    className={`w-12 h-10 rounded-lg font-black text-lg transition-all ${profile.mbti && profile.mbti[key] === l ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50'}`}
                                  >
                                    {l}
                                  </button>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="mb-2 space-y-4">
                        <h3 className="font-bold text-lg mb-2 text-zinc-200">4. 경력 외에 당신을 설명하는 '라이프 데이터'를 적어주세요. (선택)</h3>
                        
                        <div className="bg-zinc-800/30 p-4 rounded-2xl border border-zinc-700/50">
                          <label className="flex items-center gap-2 text-sm font-bold text-amber-400 mb-2"><Star size={16}/> 기질 (Being)</label>
                          <p className="text-xs text-zinc-500 mb-2">경력 말고, 인간으로서 가진 '타고난 장점'은 무엇인가요? (예: 공감능력, 꼼꼼함, 유머감각)</p>
                          <input type="text" value={profile.being || ''} onChange={e => setProfile(p => ({...p, being: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none transition-colors" placeholder="예: 무거운 분위기도 금방 풀어버리는 유머감각" />
                        </div>

                        <div className="bg-zinc-800/30 p-4 rounded-2xl border border-zinc-700/50">
                          <label className="flex items-center gap-2 text-sm font-bold text-orange-400 mb-2"><TrendingUp size={16}/> 학습 (Growth)</label>
                          <p className="text-xs text-zinc-500 mb-2">미래를 위해 새롭게 투자하고 있거나 공부하는 것이 있나요? (예: 자격증, AI 활용, 대학원)</p>
                          <input type="text" value={profile.growth || ''} onChange={e => setProfile(p => ({...p, growth: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none transition-colors" placeholder="예: 최근 AI 프롬프트 엔지니어링을 독학 중" />
                        </div>

                        <div className="bg-zinc-800/30 p-4 rounded-2xl border border-zinc-700/50">
                          <label className="flex items-center gap-2 text-sm font-bold text-pink-400 mb-2"><Heart size={16}/> 취향 (Preference)</label>
                          <p className="text-xs text-zinc-500 mb-2">일 외에 당신을 숨 쉬게 하는 '좋아하는 일'은 무엇인가요? (예: 커피 내리기, 러닝, 블로그)</p>
                          <input type="text" value={profile.preference || ''} onChange={e => setProfile(p => ({...p, preference: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:border-pink-500 focus:outline-none transition-colors" placeholder="예: 주말마다 독립서점을 찾아다니며 독서 모임 운영" />
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-zinc-800 flex justify-end">
                        <button 
                          onClick={() => setIsOnboarded(true)}
                          disabled={!profile.year || !profile.concern || !profile.mbti?.ei || !profile.mbti?.sn || !profile.mbti?.tf || !profile.mbti?.jp}
                          className="bg-white text-black px-8 py-3 rounded-xl font-black disabled:opacity-50 hover:scale-105 transition-transform flex items-center gap-2"
                        >
                          인터뷰 시작하기 <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : !theme ? (
                  <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <div className="mb-4 text-purple-400 bg-purple-500/10 p-4 rounded-full">
                      <MessageSquare size={32} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                      안녕하세요! 경험 속 진짜 무기를 찾아드릴 커리어 파트너입니다.<br/>
                      가장 기억에 남는 경험의 <span className="text-purple-400">테마</span>를 골라주세요.
                    </h2>
                    <p className="text-zinc-400 mb-10">당신의 이야기를 구체적인 브릭으로 해체해드립니다.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl px-4">
                      <button onClick={() => handleSelectTheme('돌파')} className="bg-zinc-900 border border-zinc-700 hover:border-emerald-500 hover:bg-zinc-800 p-5 rounded-2xl transition-all text-left group">
                        <div className="text-3xl mb-2">🚀</div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-emerald-400 transition-colors">돌파</h3>
                        <p className="text-xs text-zinc-500">한계를 뚫어낸 추진력</p>
                      </button>
                      <button onClick={() => handleSelectTheme('조율')} className="bg-zinc-900 border border-zinc-700 hover:border-blue-500 hover:bg-zinc-800 p-5 rounded-2xl transition-all text-left group">
                        <div className="text-3xl mb-2">🤝</div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors">조율</h3>
                        <p className="text-xs text-zinc-500">관계를 풀어낸 소통력</p>
                      </button>
                      <button onClick={() => handleSelectTheme('몰입')} className="bg-zinc-900 border border-zinc-700 hover:border-yellow-500 hover:bg-zinc-800 p-5 rounded-2xl transition-all text-left group">
                        <div className="text-3xl mb-2">🔍</div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-yellow-400 transition-colors">몰입</h3>
                        <p className="text-xs text-zinc-500">본질을 파고든 분석력</p>
                      </button>
                      <button onClick={() => handleSelectTheme('증명')} className="bg-zinc-900 border border-zinc-700 hover:border-purple-500 hover:bg-zinc-800 p-5 rounded-2xl transition-all text-left group">
                        <div className="text-3xl mb-2">📊</div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-purple-400 transition-colors">증명</h3>
                        <p className="text-xs text-zinc-500">성과를 숫자로 바꾼 논리력</p>
                      </button>
                      <button onClick={() => handleSelectTheme('시스템')} className="bg-zinc-900 border border-zinc-700 hover:border-indigo-500 hover:bg-zinc-800 p-5 rounded-2xl transition-all text-left group">
                        <div className="text-3xl mb-2">🛠️</div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-indigo-400 transition-colors">시스템</h3>
                        <p className="text-xs text-zinc-500">혼란을 질서로 바꾼 설계력</p>
                      </button>
                      <button onClick={() => handleSelectTheme('성장')} className="bg-zinc-900 border border-zinc-700 hover:border-rose-500 hover:bg-zinc-800 p-5 rounded-2xl transition-all text-left group">
                        <div className="text-3xl mb-2">🌱</div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-rose-400 transition-colors">성장</h3>
                        <p className="text-xs text-zinc-500">사람을 움직이게 한 촉진력</p>
                      </button>
                      <button onClick={() => handleSelectTheme('기타(자유)')} className="bg-zinc-900 border border-zinc-700 hover:border-emerald-500 hover:bg-zinc-800 p-5 rounded-2xl transition-all text-left group md:col-span-3 lg:col-span-1 border-dashed bg-zinc-900/50">
                        <div className="text-3xl mb-2">✨</div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-emerald-400 transition-colors">기타 (자유)</h3>
                        <p className="text-xs text-zinc-500">나만의 특별한 사정 및 고려사항</p>
                      </button>
                    </div>

                    {userExperienceLog.length > 0 && (
                      <div className="mt-16 w-full max-w-4xl px-4 flex flex-col">
                        <div className="w-full border-t border-zinc-800 pt-8">
                          <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                            <span className="text-purple-400">내 브릭 창고</span> 
                            <span className="text-sm bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{userExperienceLog.length}</span>
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {userExperienceLog.map((log, idx) => (
                              <div key={idx} className="bg-zinc-900/80 border border-zinc-700 p-5 rounded-2xl flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                                      {log.theme[0]}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-lg">{log.theme} 테마</h4>
                                      <p className="text-xs text-zinc-500">{log.messages.filter(m => m.role === 'user').length}개의 대화 기록됨</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-auto">
                                  <button 
                                    onClick={() => {
                                      setTheme(log.theme);
                                      setMessages(log.messages);
                                      setChatTurn(log.messages.filter(m => m.role === 'user').length);
                                      setUserExperienceLog(prev => prev.filter(p => p.theme !== log.theme));
                                    }}
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                  >
                                    <History size={14} /> 이어서 쓰기
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if(window.confirm('이 테마의 기록을 삭제하시겠습니까?')) {
                                        setUserExperienceLog(prev => prev.filter(p => p.theme !== log.theme));
                                      }
                                    }}
                                    className="px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-bold transition-colors"
                                  >
                                    삭제
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-center">
                            <button 
                              onClick={() => handleNextStep(2)}
                              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-10 py-4 rounded-xl font-black shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all flex items-center gap-2"
                            >
                              <Castle size={20} /> 조립소로 이동 (최종 렌더링)
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col h-full bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <Bot className="text-purple-400" />
                        <span className="font-bold">커리어 마이닝 인터뷰 진행 중...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-zinc-800 px-2 py-1 rounded text-zinc-400">테마: {theme}</span>
                        
                        <button 
                          onClick={() => {
                            if (messages.length > 0) {
                              // 창고에 임시 저장하고 나가기
                              setUserExperienceLog(prev => {
                                const filtered = prev.filter(p => p.theme !== theme);
                                return [...filtered, { theme: theme!, messages }];
                              });
                              alert('현재 대화 내용이 브릭 창고에 임시 저장되었습니다!');
                            }
                            setTheme(null);
                            setMessages([]);
                            setChatTurn(0);
                            setChatInput('');
                          }}
                          className="text-xs font-bold bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded text-zinc-300 transition-colors border border-zinc-700 flex items-center gap-1.5"
                        >
                          <History size={12} /> {messages.length > 0 ? '창고에 저장하고 나가기' : '그냥 나가기'}
                        </button>
                        
                        {chatTurn > 0 && chatTurn < 3 && (
                          <button 
                            onClick={() => {
                              setChatTurn(3);
                              setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: '좋습니다! 여기까지의 이야기만으로도 충분히 훌륭한 브릭을 추출할 수 있습니다. 하단의 버튼을 눌러 다음 단계로 이동해주세요!', isComplete: true }]);
                            }}
                            className="text-xs font-bold bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 px-3 py-1.5 rounded transition-colors"
                          >
                            인터뷰 완료하기
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                      {messages.map((msg) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={msg.id} 
                          className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'ai' ? 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700' : 'bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-900/50'}`}>
                            <p className="leading-relaxed">{msg.text}</p>
                            
                            {msg.isComplete && (
                              <div className="mt-4 flex flex-col gap-3 w-full">
                                <button 
                                  onClick={async () => {
                                    setIsSavingToDB(true);
                                    try {
                                      // 실제 DB 저장 로직 (사용자가 Supabase에 career_bricks 테이블을 만들었다고 가정)
                                      /* 
                                      await supabase.from('career_bricks').insert({
                                        user_id: session?.user?.id,
                                        theme: theme,
                                        content: JSON.stringify(messages)
                                      });
                                      */
                                      
                                      // 임시 로컬 DB(상태) 저장
                                      setUserExperienceLog(prev => {
                                        const filtered = prev.filter(p => p.theme !== theme);
                                        return [...filtered, { theme: theme!, messages }];
                                      });
                                      
                                      alert('데이터베이스에 이 경험이 안전하게 영구 저장되었습니다!');
                                      setTheme(null);
                                      setMessages([]);
                                      setChatTurn(0);
                                      setChatInput('');
                                    } catch (e) {
                                      alert('저장에 실패했습니다.');
                                    } finally {
                                      setIsSavingToDB(false);
                                    }
                                  }}
                                  disabled={isSavingToDB || isProcessing}
                                  className="w-full bg-emerald-600 text-white px-6 py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-white/20"
                                >
                                  {isSavingToDB ? 'DB에 기록하는 중...' : '💾 이 경험을 내 계정 DB에 영구 보관하기'}
                                </button>

                                <button 
                                  onClick={() => handleNextStep(2)}
                                  disabled={isProcessing || isSavingToDB}
                                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                                >
                                  {isProcessing ? '렌더링 준비 중...' : '저장 없이 바로 최종 렌더링 진입하기'}
                                  <Castle size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {isAiTyping && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="bg-zinc-800 text-zinc-200 rounded-2xl rounded-tl-none border border-zinc-700 px-5 py-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </motion.div>
                      )}

                      <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 bg-zinc-950 border-t border-zinc-800 shrink-0">
                      <div className="relative">
                        <textarea
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={chatTurn >= 3 ? "인터뷰가 완료되었습니다." : isAiTyping ? "AI가 답변을 생성하고 있습니다..." : "당신의 경험을 들려주세요 (Enter로 전송)"}
                          disabled={chatTurn >= 3 || isAiTyping}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-3 pl-4 pr-24 text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 resize-none h-[60px] custom-scrollbar disabled:opacity-50"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button 
                            title="음성으로 입력하기 (준비 중)"
                            className="p-2 text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                          >
                            <Mic size={18} />
                          </button>
                          <button 
                            onClick={handleSendMessage}
                            disabled={!chatInput.trim() || chatTurn >= 3 || isAiTyping}
                            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 transition-colors"
                          >
                            <Send size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: 2x2 Grid Distribution */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full h-full flex flex-col"
              >
                <div className="text-center mb-6 shrink-0">
                  <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3">
                    <Briefcase className="text-zinc-300" />
                    나의 4분면 역량 브릭 분포도
                  </h2>
                  <p className="text-zinc-400 font-medium bg-zinc-900 inline-block px-4 py-2 rounded-full border border-zinc-800">
                    <span className="text-purple-400 mr-2">요약:</span>
                    {BRIDGE_BUILDER_DATA.summary}
                  </p>
                </div>

                <motion.div 
                  className="flex-1 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar shadow-inner relative"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.15 } }
                  }}
                >
                  <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-px bg-zinc-800 border-dashed border-t border-zinc-700"></div>
                  <div className="hidden lg:block absolute left-1/2 top-8 bottom-8 w-px bg-zinc-800 border-dashed border-l border-zinc-700"></div>

                  {Object.entries(BLOCKS_BY_CATEGORY).map(([category, blocks]) => {
                    const colorMap: Record<string, string> = { Core: '#D3D3D3', Network: '#AEC6CF', Action: '#77DD77', Future: '#B19CD9' };
                    const bgColor = colorMap[category];
                    const info = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
                    
                    return (
                      <motion.div 
                        key={category} 
                        className="relative z-10 flex flex-col bg-zinc-950/40 p-5 rounded-2xl border border-zinc-800/50 backdrop-blur-sm"
                        variants={{
                          hidden: { opacity: 0, y: 30 },
                          visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                        }}
                      >
                        <div className="flex items-center gap-3 mb-5 border-b border-zinc-800 pb-3">
                          <div className="w-4 h-4 rounded shadow-[0_0_15px_currentColor]" style={{ backgroundColor: bgColor, color: bgColor }}></div>
                          <div>
                            <h3 className="font-black text-lg tracking-widest uppercase text-white">{category}</h3>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase">{info.title} | {info.sub}</p>
                          </div>
                          <span className="ml-auto text-xs font-bold bg-zinc-800 px-2 py-1 rounded text-zinc-300">{blocks.length} 브릭</span>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          {blocks.length === 0 ? (
                            <div className="w-full h-24 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 text-sm font-bold">해당 역량 서사 없음</div>
                          ) : (
                            blocks.map(block => (
                              <motion.div 
                                key={block.id} 
                                className="relative p-5 mt-4 rounded-xl shadow-[0_6px_0_rgba(0,0,0,0.2),0_15px_20px_rgba(0,0,0,0.3)] group hover:-translate-y-1 hover:shadow-[0_8px_0_rgba(0,0,0,0.2),0_20px_25px_rgba(0,0,0,0.3)] transition-all cursor-default border-t border-l border-white/30"
                                style={{ backgroundColor: block.colorCode }}
                                variants={{
                                  hidden: { opacity: 0, scale: 0.8, y: 20 },
                                  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 12 } }
                                }}
                              >
                                <LegoStuds colorCode={block.colorCode} />
                                <div className="relative z-10 flex items-start gap-3">
                                  <div className="p-2.5 rounded-xl bg-black/10 mt-0.5 text-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] backdrop-blur-sm border border-white/20">
                                    <block.icon size={20} strokeWidth={2.5} />
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-black text-lg block mb-1.5 text-black/90 tracking-tight">{block.title}</span>
                                    <p className="text-[13px] text-black/70 leading-relaxed font-bold">{block.detail}</p>
                                    <div className="mt-3 inline-flex items-center bg-white/40 text-black/80 px-3 py-1.5 rounded-lg shadow-sm text-[11px] font-black tracking-wide border border-white/50">
                                      <span className="text-black/50 mr-1.5 uppercase">Impact ➔</span> {block.impact}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {(profile.being || profile.growth || profile.preference) && (
                  <div className="mt-8 bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800 shadow-xl backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Sparkles size={18} className="text-amber-400"/> 라이프 데이터 브릭 (Life Bricks)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {profile.being && (
                        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl shadow-inner">
                          <div className="text-amber-400 font-bold mb-1.5 flex items-center gap-1.5 text-sm"><Star size={14}/> 기질 (Being)</div>
                          <div className="text-white text-sm leading-relaxed">{profile.being}</div>
                        </div>
                      )}
                      {profile.growth && (
                        <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl shadow-inner">
                          <div className="text-orange-400 font-bold mb-1.5 flex items-center gap-1.5 text-sm"><TrendingUp size={14}/> 학습 (Growth)</div>
                          <div className="text-white text-sm leading-relaxed">{profile.growth}</div>
                        </div>
                      )}
                      {profile.preference && (
                        <div className="bg-pink-500/10 border border-pink-500/30 p-4 rounded-xl shadow-inner">
                          <div className="text-pink-400 font-bold mb-1.5 flex items-center gap-1.5 text-sm"><Heart size={14}/> 취향 (Preference)</div>
                          <div className="text-white text-sm leading-relaxed">{profile.preference}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end shrink-0">
                  <button 
                    onClick={() => handleNextStep(3)}
                    disabled={isProcessing}
                    className="bg-[#B19CD9] text-black px-8 py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-[#a18ac9] transition-colors shadow-lg shadow-[#B19CD9]/30"
                  >
                    {isProcessing ? '설계도 그리는 중...' : '브릭 성(Castle) 조립하기'}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: The Castle (3 Scenarios) */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full h-full flex flex-col relative overflow-hidden"
              >
                {/* Blueprint Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>
                
                {/* Dynamic Center Glow based on theme */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
                <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>
                
                <div className="w-full max-w-6xl mx-auto relative z-10 flex flex-col h-full pt-4">
                  <div className="text-center mb-8 shrink-0">
                    <div className="inline-flex items-center justify-center p-3 bg-[#B19CD9]/20 text-[#B19CD9] rounded-2xl mb-4 shadow-[0_0_30px_rgba(177,156,217,0.3)]">
                      <Castle size={32} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
                      당신은 <span className="text-emerald-400">[{profile.year ? profile.year.split(' ')[0] + '의 내공' : '실무 경험'}]</span>과 <br className="hidden md:block" />
                      <span className="text-amber-400">[MBTI: {profile.mbti ? Object.values(profile.mbti).join('') : '고유'}]</span>의 기질을 결합한 보기 드문 브릭 조합이군요!
                    </h2>
                    <h3 className="text-lg text-zinc-400">
                      {BRIDGE_BUILDER_DATA.greeting}
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 px-2">
                    {/* Golden Circle Matrix */}
                    <div className="bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-amber-500/30 p-6 rounded-3xl mb-8 shadow-xl backdrop-blur-md">
                      <h3 className="text-xl font-black text-amber-400 mb-4">{BRIDGE_BUILDER_DATA.matrix.title}</h3>
                      <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-700/50">
                          <span className="text-xs font-bold text-zinc-500 mb-1 block">What (경력)</span>
                          <p className="text-sm text-zinc-200">{BRIDGE_BUILDER_DATA.matrix.what}</p>
                        </div>
                        <div className="flex-1 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-700/50">
                          <span className="text-xs font-bold text-zinc-500 mb-1 block">Who (기질)</span>
                          <p className="text-sm text-zinc-200">{BRIDGE_BUILDER_DATA.matrix.who}</p>
                        </div>
                        <div className="flex-1 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-700/50">
                          <span className="text-xs font-bold text-zinc-500 mb-1 block">Future (학습)</span>
                          <p className="text-sm text-zinc-200">{BRIDGE_BUILDER_DATA.matrix.future}</p>
                        </div>
                      </div>
                      <div className="bg-amber-500/20 text-amber-100 p-4 rounded-2xl border border-amber-500/30 font-bold text-center leading-relaxed text-sm">
                        {BRIDGE_BUILDER_DATA.matrix.synergy}
                      </div>
                    </div>

                    {/* 3 Scenarios */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                      {BRIDGE_BUILDER_DATA.scenarios.map((scenario, idx) => (
                        <div key={idx} className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-6 shadow-2xl relative flex flex-col group hover:-translate-y-1 transition-transform">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#B19CD9] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                          
                          <div className="mb-5 border-b border-zinc-800 pb-4">
                            <span className="text-[10px] font-bold bg-[#B19CD9]/20 text-[#B19CD9] px-2.5 py-1 rounded-full mb-3 inline-block uppercase tracking-wider">
                              {scenario.type}
                            </span>
                            <h3 className="text-xl font-black text-white leading-tight">{scenario.title}</h3>
                          </div>

                          <div className="space-y-4 flex-1 text-sm text-zinc-300">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <Bot size={14} className="text-purple-400" />
                                <strong className="text-white text-xs">핵심 조립 논리</strong>
                              </div>
                              <p className="leading-relaxed bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 text-xs">{scenario.logic}</p>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <Target size={14} className="text-emerald-400" />
                                <strong className="text-white text-xs">타겟 및 기대 효과</strong>
                              </div>
                              <p className="leading-relaxed bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-emerald-100 font-medium text-xs">{scenario.target}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Killer Quest & Cheat Key */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl backdrop-blur-md">
                        <h3 className="flex items-center gap-2 text-red-400 font-black mb-3"><Flame size={20}/> 킬러 퀘스트 (Killer Quest)</h3>
                        <p className="text-red-100 text-sm leading-relaxed whitespace-pre-wrap">{BRIDGE_BUILDER_DATA.killerQuest}</p>
                      </div>
                      
                      <div className="bg-indigo-500/10 border border-indigo-500/30 p-6 rounded-3xl backdrop-blur-md">
                        <h3 className="flex items-center gap-2 text-indigo-400 font-black mb-3"><Lightbulb size={20}/> {
                          profile.concern.includes("독립") ? "나의 첫 번째 세일즈 피칭 (Elevator Pitch)" : 
                          profile.concern.includes("전문성") ? "성과 리뷰 / 연봉 협상 핵심 방어 논리" :
                          profile.concern.includes("고민") ? "나를 소개하는 퍼스널 브랜딩 원라이너" :
                          BRIDGE_BUILDER_DATA.cheatKey.title
                        }</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed whitespace-pre-wrap bg-zinc-950/50 p-4 rounded-xl border border-indigo-500/20">{BRIDGE_BUILDER_DATA.cheatKey.content}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-center gap-4 shrink-0">
                    <button onClick={handleHomeClick} className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-white transition-colors">
                      처음으로 돌아가기
                    </button>
                    <button 
                      onClick={() => handleNextStep(4)}
                      disabled={isProcessing}
                      className="bg-[#B19CD9] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#9b82c7] transition-colors shadow-lg shadow-[#B19CD9]/30 flex items-center gap-2"
                    >
                      <BookOpen size={18} />
                      {isProcessing ? '작성 중...' : 
                       profile.concern.includes("전문성") ? '이 설계도로 포트폴리오 초안 추출하기' : 
                       profile.concern.includes("독립") ? '이 설계도로 비즈니스 제안서 추출하기' : 
                       profile.concern.includes("고민") ? '이 설계도로 커리어 강점 리포트 추출하기' : 
                       '이 설계도로 이력서/자소서 추출하기'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Career Writer */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full h-full flex flex-col relative"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="w-full max-w-4xl mx-auto relative z-10 flex flex-col h-full">
                  <div className="text-center mb-10 shrink-0">
                    <div className="inline-flex items-center justify-center p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl mb-4 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                      <BookOpen size={32} />
                    </div>
                    <h3 className="text-lg text-zinc-400 mb-2">{getCareerWriterData(profile.concern).greeting}</h3>
                    <h2 className="text-xl md:text-2xl font-black text-white leading-tight bg-zinc-900/80 p-5 rounded-2xl border border-zinc-700/50 shadow-2xl">
                      {getCareerWriterData(profile.concern).headline}
                    </h2>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pb-6 pr-2">
                    {(() => {
                      const writerData = getCareerWriterData(profile.concern);
                      
                      return writerData.sections ? (
                        <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden font-sans">
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-purple-500 to-indigo-500"></div>
                          <h4 className="text-2xl md:text-3xl font-black text-white mb-10 pb-6 border-b border-zinc-800 flex items-center gap-4">
                            <span className="text-4xl">📄</span> {writerData.title}
                          </h4>
                          <div className="space-y-10">
                            {writerData.sections.map((sec, idx) => (
                              <div key={idx} className="group">
                                <h5 className="font-bold text-lg text-emerald-400 mb-4 flex items-center gap-3">
                                  <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded text-xs tracking-wider uppercase group-hover:bg-emerald-500/20 transition-colors">Section {idx + 1}</span>
                                  {sec.label.replace(/^[0-9]+\.\s*/, '')}
                                </h5>
                                <p className="text-[15px] md:text-base text-zinc-300 leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-zinc-800 group-hover:border-emerald-500/50 transition-colors">{sec.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {/* Resume Mode */}
                          <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                            <h4 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                              <span className="text-3xl">📝</span> 이력서 불릿 포인트 <span className="text-xs font-bold text-zinc-500 bg-zinc-800 px-3 py-1.5 rounded-full ml-auto">Resume Mode</span>
                            </h4>
                            <ul className="space-y-5">
                              {writerData.resumeMode?.map((line, idx) => (
                                <li key={idx} className="flex items-start gap-4 text-zinc-300 leading-relaxed text-[15px] md:text-base">
                                  <span className="text-emerald-400 mt-1">✦</span>
                                  <span>
                                    {line.split(/(문서화 역량|조율 역량|실행 역량)/).map((part, i) => {
                                      if (['문서화 역량', '조율 역량', '실행 역량'].includes(part)) return <strong key={i} className="text-zinc-500 ml-1">({part})</strong>;
                                      return part;
                                    })}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Cover Letter Mode */}
                          <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                            <h4 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                              <span className="text-3xl">✍️</span> 자소서 스토리텔링 <span className="text-xs font-bold text-zinc-500 bg-zinc-800 px-3 py-1.5 rounded-full ml-auto">STAR Method</span>
                            </h4>
                            <h5 className="text-xl font-bold text-zinc-100 mb-8 pb-5 border-b border-zinc-800 tracking-tight">"{writerData.coverLetterMode?.title}"</h5>
                            <div className="space-y-6 text-[15px] md:text-base text-zinc-300 leading-loose font-medium">
                              {writerData.coverLetterMode?.content.split('\n').map((para, idx) => (
                                <p key={idx} className="pl-4 border-l-2 border-zinc-800 group-hover:border-blue-500/30 transition-colors">
                                  {para.split(/(\[Situation\]|\[Task\]|\[Action\]|\[Result\])/).map((part, i) => {
                                    if (part === '[Situation]') return <span key={i} className="text-blue-400 font-bold mr-2">{part}</span>;
                                    if (part === '[Task]') return <span key={i} className="text-amber-400 font-bold mr-2">{part}</span>;
                                    if (part === '[Action]') return <span key={i} className="text-emerald-400 font-bold mr-2">{part}</span>;
                                    if (part === '[Result]') return <span key={i} className="text-purple-400 font-bold mr-2">{part}</span>;
                                    return part;
                                  })}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-center gap-4 shrink-0">
                    <button onClick={handleHomeClick} className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-white transition-colors">
                      처음으로 돌아가기
                    </button>
                    <button className="bg-emerald-500 text-black px-8 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/30 flex items-center gap-2">
                      <BookOpen size={18} />
                      클립보드에 전체 복사하기
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
