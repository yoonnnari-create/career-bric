import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, Target, AlertTriangle, Lock, Users, Battery, DollarSign, 
  Briefcase, Heart, Activity, Search, Plus, X, ArrowRight, Grid, 
  LayoutDashboard, Shuffle, Map, Compass, CheckCircle2,
  Minimize2, Share2, Download
} from 'lucide-react';
import { supabase } from './lib/supabase';

// --- Types & Data Definitions ---
type BrickType = 'experience' | 'desire' | 'anxiety' | 'constraint' | 'relationship' | 'energy' | 'money' | 'work' | 'meaning' | 'recovery';

interface Brick {
  id: string;
  type: BrickType;
  label: string;
  x: number;
  y: number;
  content: string;
}

const BRICK_DEF: Record<BrickType, { icon: any, color: string, border: string, name: string, desc: string }> = {
  experience: { icon: Briefcase, color: 'bg-slate-800 text-white', border: 'border-slate-800', name: '경험', desc: '과거에 쌓은 실질적 역량' },
  desire: { icon: Heart, color: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-200', name: '욕구', desc: '가장 끌리는 변화 방향' },
  anxiety: { icon: AlertTriangle, color: 'bg-rose-100 text-rose-700', border: 'border-rose-200', name: '불안', desc: '나를 멈칫하게 만드는 요소' },
  constraint: { icon: Lock, color: 'bg-slate-200 text-slate-700', border: 'border-slate-300', name: '제약', desc: '포기할 수 없는 현실 조건' },
  relationship: { icon: Users, color: 'bg-orange-100 text-orange-700', border: 'border-orange-200', name: '관계', desc: '나에게 영향을 주는 사람들' },
  energy: { icon: Battery, color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', name: '에너지', desc: '나의 체력과 몰입 가능성' },
  money: { icon: DollarSign, color: 'bg-green-100 text-green-700', border: 'border-green-200', name: '수익', desc: '필요한 경제적 보상' },
  work: { icon: Target, color: 'bg-blue-100 text-blue-700', border: 'border-blue-200', name: '일', desc: '업무의 방식과 태도' },
  meaning: { icon: Search, color: 'bg-purple-100 text-purple-700', border: 'border-purple-200', name: '의미', desc: '내 삶의 가치와 목적' },
  recovery: { icon: Activity, color: 'bg-teal-100 text-teal-700', border: 'border-teal-200', name: '회복', desc: '재충전하는 방식' },
};

export default function App() {
  const [view, setView] = useState<'landing' | 'workspace' | 'report'>('landing');
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [activeBrick, setActiveBrick] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auth State
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const addBrick = (type: BrickType) => {
    const newBrick: Brick = {
      id: Date.now().toString(),
      type,
      label: BRICK_DEF[type].name,
      x: Math.random() * 200 + 100, // Random initial X
      y: Math.random() * 200 + 100, // Random initial Y
      content: ''
    };
    setBricks(prev => [...prev, newBrick]);
    setActiveBrick(newBrick.id);
  };

  const updateBrickContent = (id: string, content: string) => {
    setBricks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const deleteBrick = (id: string) => {
    setBricks(prev => prev.map(b => b.id === id ? { ...b, content: '' } : b)); // fade out logic if needed, simple filter for now
    setBricks(prev => prev.filter(b => b.id !== id));
    if (activeBrick === id) setActiveBrick(null);
  };

  // --------------------------------------------------------
  // 1. LANDING VIEW
  // --------------------------------------------------------
  const renderLanding = () => (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Floating Animated Bricks */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 p-6 bg-slate-800 text-white rounded-2xl shadow-xl rotate-12 backdrop-blur-sm opacity-90"
        >
          <div className="flex items-center gap-3 font-bold"><Briefcase /> B2B 기획 (경험)</div>
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 right-1/4 p-5 bg-indigo-100 text-indigo-700 rounded-2xl shadow-lg -rotate-6 border border-indigo-200"
        >
          <div className="flex items-center gap-3 font-bold"><Heart /> 주도적인 삶 (욕구)</div>
        </motion.div>

        <motion.div 
          animate={{ x: [0, 20, 0], y: [0, 15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 left-1/3 p-4 bg-rose-100 text-rose-700 rounded-2xl shadow-md border border-rose-200"
        >
          <div className="flex items-center gap-2 font-bold text-sm"><AlertTriangle size={18}/> 불확실성 (불안)</div>
        </motion.div>
        
        <motion.div 
          animate={{ x: [0, -15, 0], y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-1/3 right-1/3 p-4 bg-slate-200 text-slate-700 rounded-2xl shadow-md border border-slate-300"
        >
          <div className="flex items-center gap-2 font-bold text-sm"><Lock size={18}/> 수도권 거주 (제약)</div>
        </motion.div>
        
        {/* Connecting Lines SVG */}
        <svg className="absolute inset-0 w-full h-full stroke-slate-300 stroke-[2] opacity-50" style={{ fill: 'none' }}>
          <motion.path d="M 25vw 25vh Q 50vw 50vh 75vw 33vh" animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 8, repeat: Infinity }} strokeDasharray="5,5" />
          <motion.path d="M 33vw 75vh Q 50vw 50vh 66vw 66vh" animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }} strokeDasharray="5,5" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center mt-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold tracking-wide border border-indigo-200 mb-8 shadow-sm">
          <LayoutDashboard size={16} />
          Transition Navigation Interface
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
          복잡한 삶을,<br/>
          정리 가능한 <span className="text-indigo-600 bg-indigo-50 px-2 rounded-lg">블록</span>으로.
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
          Lifebric은 삶의 요소들을 블록처럼 정리하고 연결하여<br/>
          현실적인 다음 경로를 탐색할 수 있도록 돕는 <b className="text-slate-800">구조화 플랫폼</b>입니다.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => setView('workspace')}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 flex items-center justify-center gap-3 text-lg"
          >
            내 블록 정리하기 <ArrowRight size={20} />
          </button>
        </div>
        
        <div className="mt-20 text-slate-400 font-medium text-sm flex items-center justify-center gap-6">
          <span className="flex items-center gap-2"><CheckCircle2 size={16}/> 취업 플랫폼 아님</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={16}/> 심리테스트 아님</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={16}/> 오직 구조화와 정리를 위해</span>
        </div>
      </div>
    </div>
  );

  // --------------------------------------------------------
  // 2. WORKSPACE VIEW (Canvas)
  // --------------------------------------------------------
  const renderWorkspace = () => (
    <div className="h-screen bg-[#f8fafc] flex flex-col overflow-hidden relative" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      
      {/* Workspace Header */}
      <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('landing')} className="text-slate-400 hover:text-slate-700 transition-colors">
            <LayoutDashboard size={20} />
          </button>
          <h1 className="font-bold text-slate-800 tracking-tight text-lg">Lifebric Workspace</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md flex items-center gap-2">
            블록 <span className="text-indigo-600">{bricks.length}</span>개
          </div>
          <button 
            onClick={() => setView('report')}
            disabled={bricks.length < 3}
            className="px-5 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Map size={16} /> 구조화 리포트 생성
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Toolbar (Palette) */}
        <div className="w-64 bg-white border-r border-slate-200 shadow-xl z-30 flex flex-col h-full absolute left-0 top-0 md:relative">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-800 mb-1">브릭 팔레트</h2>
            <p className="text-xs text-slate-500">삶의 조각들을 캔버스로 꺼내세요.</p>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
            {Object.entries(BRICK_DEF).map(([type, def]) => {
              const Icon = def.icon;
              return (
                <button
                  key={type}
                  onClick={() => addBrick(type as BrickType)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-start gap-3 group"
                >
                  <div className={`p-2 rounded-lg shrink-0 ${def.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm mb-0.5">{def.name}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{def.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden" ref={containerRef}>
          {bricks.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
              <Plus size={48} className="mb-4 opacity-20" />
              <p className="font-semibold">왼쪽 팔레트에서 브릭을 추가해 보세요</p>
              <p className="text-sm">경험, 욕구, 제약 등을 캔버스에 자유롭게 배치하세요.</p>
            </div>
          )}

          {/* Render Bricks */}
          {bricks.map(brick => {
            const def = BRICK_DEF[brick.type];
            const Icon = def.icon;
            const isActive = activeBrick === brick.id;

            return (
              <motion.div
                key={brick.id}
                drag
                dragMomentum={false}
                dragConstraints={containerRef}
                onMouseDown={() => setActiveBrick(brick.id)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ x: brick.x, y: brick.y }}
                className={`absolute w-64 rounded-xl shadow-lg border-2 cursor-grab active:cursor-grabbing flex flex-col bg-white overflow-hidden transition-shadow ${isActive ? 'ring-4 ring-indigo-500/20 z-20 ' + def.border : 'border-slate-200 z-10 hover:shadow-xl'}`}
              >
                <div className={`px-3 py-2 flex items-center justify-between border-b ${def.color.replace('text-', 'bg-opacity-10 text-')}`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Icon size={14} /> {def.name}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteBrick(brick.id); }} className="text-slate-400 hover:text-slate-800">
                    <X size={14} />
                  </button>
                </div>
                <div className="p-3">
                  <textarea 
                    value={brick.content}
                    onChange={(e) => updateBrickContent(brick.id, e.target.value)}
                    placeholder={`${def.name}에 대해 적어주세요...`}
                    className="w-full text-sm text-slate-700 bg-transparent resize-none focus:outline-none min-h-[60px]"
                    onMouseDown={(e) => e.stopPropagation()} // Allow text selection
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );

  // --------------------------------------------------------
  // 3. REPORT VIEW (Structured Output)
  // --------------------------------------------------------
  const renderReport = () => {
    // Basic logic to extract insights from placed bricks
    const experiences = bricks.filter(b => b.type === 'experience' && b.content);
    const anxieties = bricks.filter(b => b.type === 'anxiety' && b.content);
    const constraints = bricks.filter(b => b.type === 'constraint' && b.content);
    const desires = bricks.filter(b => b.type === 'desire' && b.content);

    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 overflow-y-auto pb-32">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <button onClick={() => setView('workspace')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors">
              <Grid size={18} /> 캔버스로 돌아가기
            </button>
            <div className="flex gap-3">
               <button className="flex items-center gap-2 px-4 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                 <Share2 size={16} /> 공유
               </button>
               <button className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm">
                 <Download size={16} /> PDF 저장
               </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 pt-12 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-2xl mb-2 shadow-inner">
              <Compass size={32} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">구조화 리포트</h1>
            <p className="text-lg text-slate-500 leading-relaxed">
              캔버스에 흩어져 있던 {bricks.length}개의 블록들을 분석하여,<br/>
              현재 상태의 모순점과 가장 현실적인 다음 경로를 도출했습니다.
            </p>
          </div>

          {/* Section 1: Current Map */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <Map className="text-indigo-500" /> 현재 상태 맵 (State Map)
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Briefcase size={16}/> 나의 핵심 자원</h3>
                {experiences.length > 0 ? experiences.map(b => (
                  <div key={b.id} className="p-3 bg-slate-800 text-white rounded-xl text-sm font-medium shadow-sm">{b.content}</div>
                )) : <div className="p-3 bg-slate-50 text-slate-400 rounded-xl text-sm border border-slate-200 border-dashed">입력된 경험이 없습니다.</div>}
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Lock size={16}/> 절대적 제약</h3>
                {constraints.length > 0 ? constraints.map(b => (
                  <div key={b.id} className="p-3 bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-sm font-medium shadow-sm">{b.content}</div>
                )) : <div className="p-3 bg-slate-50 text-slate-400 rounded-xl text-sm border border-slate-200 border-dashed">제약 조건이 없습니다.</div>}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2"><AlertTriangle size={16}/> 충돌 요소 (병목)</h3>
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl shadow-sm">
                  <p className="text-sm text-rose-800 leading-relaxed font-medium">
                    현재 <b>{desires[0]?.content || "새로운 변화"}</b>를 원하지만, 동시에 <b>{anxieties[0]?.content || "불확실성"}</b>에 대한 불안이 충돌하여 실행을 가로막는 병목 상태입니다.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Path Analysis */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shuffle className="text-indigo-600" /> 현실적인 다음 경로 탐색
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Path 1 */}
              <div className="bg-white rounded-3xl p-8 border border-indigo-100 shadow-md relative overflow-hidden ring-1 ring-indigo-500/10 hover:shadow-lg transition-shadow">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Target size={100} />
                </div>
                <div className="relative z-10">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md uppercase tracking-wider mb-4 inline-block">Option A. Pivot</span>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">핵심 자원 기반의 직무 피벗</h3>
                  <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                    기존 경험({experiences[0]?.content || '현재 역량'})을 살리되, 새로운 도메인이나 역할로 이동하여 성장 정체를 극복하는 전략.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-xs font-bold text-emerald-600 mb-1">방어 가능한 제약 (PROS)</div>
                      <div className="text-sm font-medium text-slate-700">{constraints[0]?.content || '연봉/근무조건 유지 가능성'}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-xs font-bold text-rose-600 mb-1">감수해야 할 리스크 (CONS)</div>
                      <div className="text-sm font-medium text-slate-700">초기 3~6개월의 높은 에너지 소모와 불확실성</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Path 2 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Minimize2 size={100} />
                </div>
                <div className="relative z-10">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md uppercase tracking-wider mb-4 inline-block">Option B. Stay & Side</span>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">현직 유지 + 워라밸 확보</h3>
                  <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                    현재 직장에서 에너지를 70% 수준으로 조율하고, 나머지 30%를 개인의 성장이나 다른 욕구 충족에 투자하는 방어적 전략.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-xs font-bold text-emerald-600 mb-1">방어 가능한 제약 (PROS)</div>
                      <div className="text-sm font-medium text-slate-700">심리적 안정감 극대화 및 {anxieties[0]?.content || '불안 요소'} 완벽 차단</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-xs font-bold text-rose-600 mb-1">감수해야 할 리스크 (CONS)</div>
                      <div className="text-sm font-medium text-slate-700">{desires[0]?.content || '자아 실현 욕구'}의 지연 및 동기부여 저하</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Next Actions */}
          <section className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
             <div className="md:w-1/3 z-10 space-y-4">
               <h2 className="text-2xl font-bold">2주 안에 실행할<br/>작은 실험</h2>
               <p className="text-slate-400 text-sm leading-relaxed">
                 거창한 이직이나 퇴사가 아닌, 리스크 없이 경로를 테스트해 볼 수 있는 구체적인 액션 아이템입니다.
               </p>
             </div>
             <div className="md:w-2/3 z-10 w-full space-y-3">
               <div className="flex items-start gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
                 <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold">1</div>
                 <div>
                   <h4 className="font-bold text-indigo-100 mb-1">관심 경로의 현직자와 가벼운 커피챗 1회</h4>
                   <p className="text-sm text-slate-400 leading-relaxed">LinkedIn을 통해 내가 고려하는 직무(Option A)로 이직한 분에게 메시지를 보내 현실적인 이야기를 들어봅니다.</p>
                 </div>
               </div>
               <div className="flex items-start gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
                 <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 font-bold">2</div>
                 <div>
                   <h4 className="font-bold text-teal-100 mb-1">나의 '경험 블록'을 한 장의 이력서(원페이저)로 요약하기</h4>
                   <p className="text-sm text-slate-400 leading-relaxed">디자인이나 형식을 빼고, 오늘 캔버스에 적었던 <b>핵심 자원</b> 3가지만을 중심으로 무기가 될 수 있는지 문서화해 봅니다.</p>
                 </div>
               </div>
             </div>
          </section>

        </main>
      </div>
    );
  };

  // --------------------------------------------------------
  // ROUTER LOGIC
  // --------------------------------------------------------
  return (
    <AnimatePresence mode="wait">
      {view === 'landing' && <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen">{renderLanding()}</motion.div>}
      {view === 'workspace' && <motion.div key="workspace" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-screen">{renderWorkspace()}</motion.div>}
      {view === 'report' && <motion.div key="report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-screen">{renderReport()}</motion.div>}
    </AnimatePresence>
  );
}
