import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Layers, 
  Target, 
  Briefcase, 
  AlertCircle, 
  RefreshCw,
  MapPin,
  ListChecks,
  Lightbulb,
  X
} from 'lucide-react';
import { supabase } from './lib/supabase';

// --- Data & Options ---
const CONCERN_OPTIONS = [
  "역량의 정체 (더 이상 성장하지 않는 느낌)",
  "번아웃 및 체력/정신적 에너지고갈",
  "조직 문화 및 리더십과의 불일치",
  "불투명한 비전 (이 일을 계속해도 될까?)",
  "보상 수준에 대한 불만족",
  "역할과 책임(R&R)의 모호함",
  "물리적 시간 부족 (일과 삶의 불균형)"
];

const CONDITION_OPTIONS = [
  "현재 수준의 연봉 유지 (타협 불가)",
  "출퇴근 거리 및 물리적 시간 확보",
  "주도적인 업무 환경 (마이크로매니징 배제)",
  "안정적인 고용 상태",
  "명확한 평가와 보상 체계",
  "수평적이고 유연한 커뮤니케이션",
  "원격 근무 또는 유연 근무제 보장"
];

const DIRECTION_OPTIONS = [
  { id: 'expert', title: "전문성 심화 (Mastery)", desc: "현재 직무에서 대체 불가능한 시니어/전문가로 성장" },
  { id: 'pivot', title: "인접 직무 전환 (Pivot)", desc: "기존 자원을 활용하여 새로운 역할이나 도메인으로 확장" },
  { id: 'balance', title: "라이프 밸런스 (Balance)", desc: "일의 비중을 조율하고 개인의 삶이나 다른 프로젝트에 집중" },
  { id: 'independent', title: "독립 및 창업 (Independence)", desc: "조직을 벗어나 주도적으로 1인 기업이나 비즈니스 시작" }
];

const RESOURCE_SUGGESTIONS = [
  "B2B 세일즈/영업망", "데이터 분석 역량", "프로젝트 관리(PM)", "이해관계자 조율", 
  "비즈니스 기획력", "글쓰기/문서화", "예산 관리 및 재무 지식", "외국어 커뮤니케이션"
];

// --- Interfaces ---
interface FormData {
  currentState: string;
  concerns: string[];
  resources: string[];
  nonNegotiables: string[];
  desiredDirection: string;
}

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    currentState: '',
    concerns: [],
    resources: [],
    nonNegotiables: [],
    desiredDirection: ''
  });

  const [resourceInput, setResourceInput] = useState('');

  // Authentication State
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNext = () => setStep(s => Math.min(s + 1, 7));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const toggleSelection = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const arr = prev[field] as string[];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...arr, value] };
      }
    });
  };

  const addResource = (res: string) => {
    if (!res.trim()) return;
    if (!formData.resources.includes(res.trim())) {
      setFormData(prev => ({ ...prev, resources: [...prev.resources, res.trim()] }));
    }
    setResourceInput('');
  };

  const removeResource = (res: string) => {
    setFormData(prev => ({ ...prev, resources: prev.resources.filter(r => r !== res) }));
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">현재 상태를 정의해 주세요</h2>
              <p className="text-slate-500">막연한 상황을 한 줄의 문장으로 명확히 규정하는 것부터 시작합니다.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <label className="block text-sm font-semibold text-slate-700">지금 나의 상황 (예: 5년 차 기획자, 번아웃으로 휴식 중)</label>
              <textarea 
                value={formData.currentState}
                onChange={e => setFormData({...formData, currentState: e.target.value})}
                placeholder="현재 직무, 연차, 그리고 직면한 가장 큰 화두를 자유롭게 적어주세요."
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">반복되는 고민의 패턴</h2>
              <p className="text-slate-500">주기적으로 나를 괴롭히거나 머릿속을 맴도는 고민들을 선택해 주세요. (다중 선택 가능)</p>
            </div>
            <div className="grid gap-3">
              {CONCERN_OPTIONS.map(option => {
                const isSelected = formData.concerns.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleSelection('concerns', option)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                      {isSelected && <Check size={14} />}
                    </div>
                    <span className="font-medium text-sm md:text-base">{option}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">내가 가진 자원(Resource) 정리</h2>
              <p className="text-slate-500">경험을 통해 획득한 기술, 네트워크, 태도 등 확실한 나의 무기를 적어주세요.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-wrap gap-2">
                {formData.resources.map(res => (
                  <span key={res} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200">
                    {res}
                    <button onClick={() => removeResource(res)} className="text-slate-400 hover:text-slate-600"><X size={14}/></button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  value={resourceInput}
                  onChange={e => setResourceInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addResource(resourceInput)}
                  placeholder="예: 데이터 기반 의사결정"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button 
                  onClick={() => addResource(resourceInput)}
                  className="px-6 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors text-sm"
                >
                  추가
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">추천 키워드 (클릭하여 추가)</p>
                <div className="flex flex-wrap gap-2">
                  {RESOURCE_SUGGESTIONS.map(s => (
                    <button 
                      key={s} 
                      onClick={() => addResource(s)}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">절대 포기할 수 없는 조건 (제약)</h2>
              <p className="text-slate-500">다음 경로를 선택할 때 반드시 지켜져야 하는 핵심 기준을 2~3개만 선택해 주세요.</p>
            </div>
            <div className="grid gap-3">
              {CONDITION_OPTIONS.map(option => {
                const isSelected = formData.nonNegotiables.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleSelection('nonNegotiables', option)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-slate-800 border-slate-800 text-white shadow-md' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'border-white text-white' : 'border-slate-300'}`}>
                      {isSelected && <Check size={14} />}
                    </div>
                    <span className="font-medium text-sm md:text-base">{option}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">가장 끌리는 변화의 방향</h2>
              <p className="text-slate-500">현재 시점에서 본인이 가장 갈망하는 다음 단계의 형태를 하나만 선택해 주세요.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {DIRECTION_OPTIONS.map(dir => (
                <button
                  key={dir.id}
                  onClick={() => setFormData({...formData, desiredDirection: dir.id})}
                  className={`p-6 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                    formData.desiredDirection === dir.id 
                      ? 'bg-indigo-50 border-indigo-300 shadow-md ring-1 ring-indigo-500' 
                      : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <span className={`font-bold text-lg ${formData.desiredDirection === dir.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {dir.title}
                  </span>
                  <span className={`text-sm leading-relaxed ${formData.desiredDirection === dir.id ? 'text-indigo-700' : 'text-slate-500'}`}>
                    {dir.desc}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 6:
        // Result Dashboard Generation
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            {/* Report Header */}
            <div className="pb-8 border-b border-slate-200">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-4">
                <MapPin size={14} /> 경로 정리 리포트
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                구조화된 선택지 보드
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                작성하신 정보를 바탕으로 현재 상태를 요약하고, 현실적으로 선택 가능한 경로들을 비교 분석했습니다.
              </p>
            </div>

            {/* Current State Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-wider"><Target size={16}/> 핵심 자원</div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.resources.slice(0, 3).map(r => (
                    <span key={r} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium">{r}</span>
                  ))}
                  {formData.resources.length === 0 && <span className="text-slate-400 text-sm">입력된 자원이 없습니다.</span>}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-wider"><AlertCircle size={16}/> 반복 패턴 (고민)</div>
                <div className="text-slate-700 text-sm leading-relaxed font-medium">
                  {formData.concerns[0] || '입력된 패턴이 없습니다.'}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-wider"><ListChecks size={16}/> 필수 제약 조건</div>
                <ul className="text-slate-700 text-sm leading-relaxed font-medium space-y-1">
                  {formData.nonNegotiables.slice(0,2).map(n => <li key={n}>• {n}</li>)}
                  {formData.nonNegotiables.length === 0 && <li className="text-slate-400">조건 없음</li>}
                </ul>
              </div>
            </div>

            {/* Path Comparisons */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Compass className="text-indigo-500" /> 현실적인 다음 경로 비교
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Path A */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
                  <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-indigo-600 mb-1 tracking-wider uppercase">Path A. 마스터 트랙</div>
                      <h4 className="font-bold text-lg text-slate-900">현 직무 전문성 극대화</h4>
                    </div>
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">난이도: 中</span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-400 mb-2">장점 (PROS)</div>
                      <ul className="text-sm text-slate-700 space-y-1.5">
                        <li>• 현재 보유한 <b>핵심 자원</b>을 가장 빠르게 수익/성장에 활용 가능</li>
                        <li>• 이직 시 연봉 방어 및 상승에 유리</li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 mb-2">리스크 (CONS)</div>
                      <ul className="text-sm text-slate-700 space-y-1.5">
                        <li>• <b>반복되는 고민 패턴</b>(번아웃 등)이 해소되지 않을 확률 높음</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Path B */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
                  <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-purple-600 mb-1 tracking-wider uppercase">Path B. 피벗 트랙</div>
                      <h4 className="font-bold text-lg text-slate-900">인접 직무/도메인 전환</h4>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">난이도: 高</span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-400 mb-2">장점 (PROS)</div>
                      <ul className="text-sm text-slate-700 space-y-1.5">
                        <li>• 새로운 환경에서 동기부여 및 <b>시야 확장</b> 가능</li>
                        <li>• 필수 제약 조건을 일부 타협하면 이직 기회 증가</li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 mb-2">리스크 (CONS)</div>
                      <ul className="text-sm text-slate-700 space-y-1.5">
                        <li>• 초기 학습 곡선 발생 및 단기적 성과 증명 압박</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-indigo-900 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden mt-12">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Target size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                  <Lightbulb className="text-indigo-300" /> 다음 행동 제안 (Next Steps)
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-indigo-200 font-semibold mb-3 text-sm tracking-wider uppercase">🧪 2주 안에 가능한 작은 실험</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 bg-indigo-800/50 p-3 rounded-lg border border-indigo-700/50 text-sm leading-relaxed">
                        <span className="text-indigo-300 mt-0.5">•</span>
                        타겟으로 하는 경로(A 또는 B)에 있는 사람과 30분 커피챗(콜드메일) 진행하기
                      </li>
                      <li className="flex items-start gap-2 bg-indigo-800/50 p-3 rounded-lg border border-indigo-700/50 text-sm leading-relaxed">
                        <span className="text-indigo-300 mt-0.5">•</span>
                        내 핵심 자원 3가지를 증명할 수 있는 '원페이지 포트폴리오' 작성해보기
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-indigo-200 font-semibold mb-3 text-sm tracking-wider uppercase">🗑️ 지금 당장 버려도 되는 선택지</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 text-sm leading-relaxed text-slate-300">
                        <span className="text-slate-500 mt-0.5">✕</span>
                        아무런 조건 없이 단순히 '쉬고 싶다'는 생각으로 퇴사부터 지르는 것
                      </li>
                      <li className="flex items-start gap-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 text-sm leading-relaxed text-slate-300">
                        <span className="text-slate-500 mt-0.5">✕</span>
                        나의 필수 조건을 100% 만족시키는 유토피아적 회사가 있을 것이란 환상
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8">
               <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors shadow-sm"
               >
                 <RefreshCw size={16} /> 다시 분석하기
               </button>
            </div>

          </motion.div>
        );
      default:
        return null;
    }
  };

  if (!session && !isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-8">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-2">
            <Compass size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
              전환기 네비게이션 도구
            </h1>
            <p className="text-slate-500 leading-relaxed text-sm">
              막연한 고민을 구조화하여 다음 선택지를 정리합니다.<br/>
              지금의 경험과 조건을 정리하고 현실적인 경로를 탐색해보세요.
            </p>
          </div>
          
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Google 계정으로 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-slate-800">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Compass size={20} />
            </div>
            <span>Lifebric</span>
          </div>
          
          <div className="flex items-center gap-4">
            {step < 6 && (
              <div className="text-sm font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                Step {step} <span className="text-slate-300">/</span> 5
              </div>
            )}
            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {step < 6 && (
        <div className="h-1 bg-slate-100 w-full">
          <motion.div 
            className="h-full bg-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Main Content Form */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 pb-32">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </main>

      {/* Footer Navigation */}
      {step < 6 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="px-6 py-3 text-slate-500 font-medium disabled:opacity-30 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={18} /> 이전
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              {step === 5 ? '리포트 생성하기' : '다음으로'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
