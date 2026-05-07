import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, Target, AlertTriangle, Lock, Users, Battery, DollarSign, 
  Briefcase, Heart, Activity, Search, Plus, X, ArrowRight, Grid, 
  LayoutDashboard, Shuffle, Map, Compass, ShieldAlert,
  Minimize2, Share2, Download, Hexagon, Zap, Layers
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

const BRICK_DEF: Record<BrickType, { icon: any, bg: string, border: string, text: string, name: string, desc: string }> = {
  experience: { icon: Briefcase, bg: 'bg-slate-700', border: 'border-slate-900', text: 'text-white', name: '경험', desc: '과거에 쌓은 실질적 역량' },
  desire: { icon: Heart, bg: 'bg-rose-500', border: 'border-rose-700', text: 'text-white', name: '욕구', desc: '가장 끌리는 변화 방향' },
  anxiety: { icon: AlertTriangle, bg: 'bg-amber-400', border: 'border-amber-600', text: 'text-amber-950', name: '불안', desc: '나를 멈칫하게 만드는 요소' },
  constraint: { icon: Lock, bg: 'bg-stone-500', border: 'border-stone-700', text: 'text-white', name: '제약', desc: '포기할 수 없는 현실 조건' },
  relationship: { icon: Users, bg: 'bg-orange-500', border: 'border-orange-700', text: 'text-white', name: '관계', desc: '나에게 영향을 주는 사람들' },
  energy: { icon: Battery, bg: 'bg-emerald-500', border: 'border-emerald-700', text: 'text-white', name: '에너지', desc: '나의 체력과 몰입' },
  money: { icon: DollarSign, bg: 'bg-green-500', border: 'border-green-700', text: 'text-white', name: '수익', desc: '필요한 경제적 보상' },
  work: { icon: Target, bg: 'bg-blue-500', border: 'border-blue-700', text: 'text-white', name: '일', desc: '업무의 방식과 태도' },
  meaning: { icon: Search, bg: 'bg-purple-500', border: 'border-purple-700', text: 'text-white', name: '의미', desc: '내 삶의 가치와 목적' },
  recovery: { icon: Activity, bg: 'bg-teal-500', border: 'border-teal-700', text: 'text-white', name: '회복', desc: '재충전하는 방식' },
};

const CORE_BRICKS = {
  stability: { title: '생존과 안정성', icon: ShieldAlert, desc: '현재 당신을 움직이는 가장 강력한 중심축은 생존과 안정성입니다. 불확실성을 최소화하고, 재무적/물리적 제약을 방어하려는 패턴이 뚜렷하게 나타납니다.', color: 'bg-slate-800', border: 'border-slate-950', glow: 'shadow-[0_0_60px_rgba(30,41,59,0.5)]' },
  meaning: { title: '의미와 연결', icon: Heart, desc: '지금 당신의 선택을 지배하는 핵심 축은 의미와 관계입니다. 단순한 보상이나 생존을 넘어, 내가 하는 일의 내적 가치와 타인과의 연결성을 깊게 탐색하고 있습니다.', color: 'bg-purple-600', border: 'border-purple-900', glow: 'shadow-[0_0_60px_rgba(147,51,234,0.5)]' },
  mastery: { title: '성취와 전문성', icon: Zap, desc: '현재 가장 강한 중심축은 성취와 전문성입니다. 일의 결과물, 스스로의 성장, 그리고 보유한 자원을 어떻게 폭발시킬 것인지가 모든 고민의 중심에 놓여 있습니다.', color: 'bg-blue-600', border: 'border-blue-900', glow: 'shadow-[0_0_60px_rgba(37,99,235,0.5)]' },
  autonomy: { title: '자율성과 회복', icon: Activity, desc: '지금 당신을 움직이는 거대한 축은 자율성과 에너지 회복입니다. 외부 시스템에 소모되기보다, 주도적으로 일과 삶의 주도권을 되찾으려는 강렬한 욕구가 보입니다.', color: 'bg-teal-500', border: 'border-teal-800', glow: 'shadow-[0_0_60px_rgba(20,184,166,0.5)]' }
};

const extractCoreBrick = (bricks: Brick[]) => {
  const counts = { stability: 0, meaning: 0, mastery: 0, autonomy: 0 };
  bricks.forEach(b => {
    if (['money', 'constraint', 'anxiety'].includes(b.type)) counts.stability++;
    else if (['desire', 'relationship', 'meaning'].includes(b.type)) counts.meaning++;
    else if (['experience', 'work', 'energy'].includes(b.type)) counts.mastery++;
    else if (['recovery'].includes(b.type)) counts.autonomy++;
  });
  
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
  const coreKey = sorted[0][1] > 0 ? sorted[0][0] : 'stability';
  return CORE_BRICKS[coreKey as keyof typeof CORE_BRICKS];
};

// --- Reusable Block Component ---
const BlockStuds = ({ bg, border, large = false }: { bg: string, border: string, large?: boolean }) => {
  const sizeClass = large ? 'w-12 h-[14px]' : 'w-8 h-[10px]';
  const topSize = large ? 'w-12 h-[10px] top-[4px]' : 'w-8 h-[6px] top-0';
  const bodySize = large ? 'w-12 h-[10px] top-[4px]' : 'w-8 h-[8px] top-[2px]';
  const gap = large ? 'gap-4 left-6 -top-[14px]' : 'gap-3 left-4 -top-[10px]';
  
  return (
    <div className={`absolute flex z-0 pointer-events-none ${gap}`}>
      {[1, 2, 3].map(i => (
        <div key={i} className={`relative ${sizeClass}`}>
          <div className={`absolute rounded-b-sm border-b-2 border-r-2 ${bg} ${border} ${bodySize}`}></div>
          <div className={`absolute rounded-[50%] border-t border-l border-white/30 ${bg} ${topSize}`}></div>
        </div>
      ))}
    </div>
  );
};

const BlockContainer = ({ type, children, className = '', isDragging = false }: { type: BrickType, children: React.ReactNode, className?: string, isDragging?: boolean }) => {
  const def = BRICK_DEF[type];
  return (
    <div className={`relative rounded-xl border-2 border-b-[6px] border-r-[4px] ${def.bg} ${def.border} ${def.text} transition-transform ${isDragging ? 'scale-105 shadow-2xl z-50' : 'hover:-translate-y-1 hover:shadow-lg'} ${className}`}>
      <BlockStuds bg={def.bg} border={def.border} />
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
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
    setBricks(prev => prev.filter(b => b.id !== id));
    if (activeBrick === id) setActiveBrick(null);
  };

  // --------------------------------------------------------
  // 1. LANDING VIEW
  // --------------------------------------------------------
  const renderLanding = () => (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', backgroundSize: '48px 48px' }} />
      
      {/* Core Brick Hero Concept */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        
        {/* The Massive Core Brick in Center */}
        <motion.div 
          animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute z-10"
        >
          <div className="relative w-80 h-40 bg-indigo-600 rounded-3xl border-4 border-b-[16px] border-r-[12px] border-indigo-900 shadow-[0_0_80px_rgba(79,70,229,0.4)] flex items-center justify-center">
            <BlockStuds bg="bg-indigo-600" border="border-indigo-900" large />
            <div className="relative z-10 flex flex-col items-center text-white">
              <Hexagon size={48} className="mb-2 opacity-80" />
              <span className="font-black text-2xl tracking-widest uppercase">Core Brick</span>
            </div>
          </div>
        </motion.div>

        {/* Orbiting / Connecting Bricks */}
        <motion.div animate={{ x: [0, 20, 0], y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[20%] left-[20%] w-40 z-20">
          <BlockContainer type="experience"><div className="p-3 font-black flex items-center gap-2 text-sm"><Briefcase size={16}/> 경험</div></BlockContainer>
        </motion.div>
        
        <motion.div animate={{ x: [0, -30, 0], y: [0, 10, 0], rotate: [0, -8, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-[25%] right-[20%] w-40 z-20">
          <BlockContainer type="desire"><div className="p-3 font-black flex items-center gap-2 text-sm"><Heart size={16}/> 욕구</div></BlockContainer>
        </motion.div>

        <motion.div animate={{ x: [0, 10, 0], y: [0, 25, 0], rotate: [0, -5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[20%] left-[25%] w-40 z-20">
          <BlockContainer type="anxiety"><div className="p-3 font-black flex items-center gap-2 text-sm"><AlertTriangle size={16}/> 불안</div></BlockContainer>
        </motion.div>
        
        <motion.div animate={{ x: [0, -15, 0], y: [0, -15, 0], rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute bottom-[25%] right-[25%] w-40 z-20">
          <BlockContainer type="constraint"><div className="p-3 font-black flex items-center gap-2 text-sm"><Lock size={16}/> 제약</div></BlockContainer>
        </motion.div>

        {/* Dynamic Connecting Lines to Core */}
        <svg className="absolute inset-0 w-full h-full stroke-indigo-300 stroke-[3] opacity-40 z-0" style={{ fill: 'none' }}>
          <motion.path d="M 25vw 25vh Q 50vw 50vh 50vw 50vh" animate={{ strokeDashoffset: [100, 0] }} transition={{ duration: 2, repeat: Infinity }} strokeDasharray="10,10" />
          <motion.path d="M 75vw 30vh Q 50vw 50vh 50vw 50vh" animate={{ strokeDashoffset: [100, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} strokeDasharray="10,10" />
          <motion.path d="M 30vw 75vh Q 50vw 50vh 50vw 50vh" animate={{ strokeDashoffset: [100, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} strokeDasharray="10,10" />
          <motion.path d="M 70vw 70vh Q 50vw 50vh 50vw 50vh" animate={{ strokeDashoffset: [100, 0] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.2 }} strokeDasharray="10,10" />
        </svg>
      </div>

      {/* Hero Content */}
      <div className="relative z-30 max-w-4xl mx-auto px-6 text-center mt-32 bg-white/70 p-12 rounded-[3rem] backdrop-blur-xl border-4 border-white shadow-2xl">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-900 text-white rounded-full text-sm font-black tracking-widest uppercase border-b-4 border-slate-900 mb-8 shadow-md">
          <Layers size={18} />
          Lifebric: Core Architecture
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
          내 삶을 움직이는<br/>
          <span className="text-indigo-600">핵심 블록(Core Brick)</span>을 찾아라.
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 font-bold mb-12 max-w-2xl mx-auto leading-relaxed">
          단순한 정리가 아닙니다. 조각난 경험과 불안을 조립하여,<br/>
          가장 중심에서 나를 이끄는 <b className="text-slate-900">삶의 중심축</b>을 구조화합니다.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => setView('workspace')}
            className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 border-b-[6px] border-indigo-900 active:border-b-0 active:translate-y-[6px] transition-all shadow-xl flex items-center justify-center gap-3 text-xl"
          >
            내 블록 조립하기 <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );

  // --------------------------------------------------------
  // 2. WORKSPACE VIEW (Canvas)
  // --------------------------------------------------------
  const renderWorkspace = () => (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden relative" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}>
      
      {/* Workspace Header */}
      <header className="h-16 bg-white border-b-4 border-slate-200 flex items-center justify-between px-6 z-40 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('landing')} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors border-b-2 border-slate-300 active:border-b-0 active:translate-y-[2px]">
            <LayoutDashboard size={20} />
          </button>
          <h1 className="font-black text-slate-800 tracking-tight text-xl flex items-center gap-2"><Box className="text-indigo-600"/> Lifebric Workspace</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 shadow-inner">
            조립된 블록 <span className="text-indigo-600 ml-1 font-black">{bricks.length}</span>개
          </div>
          <button 
            onClick={() => setView('report')}
            disabled={bricks.length < 3}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-500 border-b-4 border-indigo-900 active:border-b-0 active:translate-y-[4px] disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0 transition-all flex items-center gap-2 shadow-md"
          >
            <Map size={18} /> 구조화 리포트 생성
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Toolbar (Palette) */}
        <div className="w-72 bg-white border-r-4 border-slate-200 shadow-2xl z-30 flex flex-col h-full absolute left-0 top-0 md:relative">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h2 className="font-black text-slate-800 mb-1">브릭 팩토리</h2>
            <p className="text-xs font-bold text-slate-500">클릭하여 캔버스로 블록을 꺼내세요.</p>
          </div>
          <div className="p-5 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
            {Object.entries(BRICK_DEF).map(([type, def]) => {
              const Icon = def.icon;
              return (
                <button
                  key={type}
                  onClick={() => addBrick(type as BrickType)}
                  className="w-full text-left focus:outline-none block"
                >
                  {/* Miniature 3D Block in Sidebar */}
                  <div className={`relative rounded-xl border-2 border-b-[4px] border-r-[3px] ${def.bg} ${def.border} ${def.text} p-3 hover:-translate-y-1 hover:shadow-lg transition-transform active:translate-y-[2px] active:border-b-[2px]`}>
                    <div className="absolute -top-[6px] left-3 flex gap-1.5 z-0 pointer-events-none">
                      {[1,2].map(i => (
                        <div key={i} className="relative w-5 h-[6px]">
                          <div className={`absolute top-[1px] w-5 h-[5px] rounded-b-sm border-b border-r ${def.bg} ${def.border}`}></div>
                          <div className={`absolute top-0 w-5 h-[4px] rounded-[50%] border-t border-l border-white/30 ${def.bg}`}></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="shrink-0 mt-0.5"><Icon size={20} /></div>
                      <div>
                        <div className="font-black text-sm mb-0.5">{def.name}</div>
                        <div className="text-[10px] font-medium opacity-80 leading-tight">{def.desc}</div>
                      </div>
                    </div>
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
              <div className="p-6 bg-slate-200 rounded-3xl mb-4 border-b-[6px] border-slate-300">
                <Plus size={48} className="opacity-50" />
              </div>
              <p className="font-black text-xl mb-2 text-slate-500">비어있는 세계입니다</p>
              <p className="font-bold">왼쪽 팩토리에서 블록을 꺼내 조립을 시작하세요.</p>
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
                className="absolute cursor-grab active:cursor-grabbing"
              >
                <BlockContainer type={brick.type} className="w-72 min-h-[140px]" isDragging={isActive}>
                  <div className="px-4 py-3 flex items-center justify-between border-b border-black/10">
                    <div className="flex items-center gap-2 font-black text-sm">
                      <Icon size={16} /> {def.name}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteBrick(brick.id); }} className="hover:bg-black/20 p-1 rounded-md transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <textarea 
                      value={brick.content}
                      onChange={(e) => updateBrickContent(brick.id, e.target.value)}
                      placeholder={`이 ${def.name} 블록의 구체적인 내용을 적어주세요...`}
                      className={`w-full flex-1 font-bold text-sm bg-transparent resize-none focus:outline-none placeholder:text-white/50 ${def.text}`}
                      onMouseDown={(e) => e.stopPropagation()} // Allow text selection
                    />
                  </div>
                </BlockContainer>
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
    // Extract insights & Core Brick
    const experiences = bricks.filter(b => b.type === 'experience' && b.content);
    const anxieties = bricks.filter(b => b.type === 'anxiety' && b.content);
    const constraints = bricks.filter(b => b.type === 'constraint' && b.content);
    const desires = bricks.filter(b => b.type === 'desire' && b.content);
    
    const coreBrick = extractCoreBrick(bricks);
    const CoreIcon = coreBrick.icon;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 overflow-y-auto pb-32">
        <header className="bg-white border-b-4 border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <button onClick={() => setView('workspace')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-black text-sm transition-colors px-3 py-1.5 bg-slate-100 rounded-lg border-b-2 border-slate-300 active:border-b-0 active:translate-y-[2px]">
              <Grid size={18} /> 캔버스로 돌아가기
            </button>
            <div className="flex gap-3">
               <button className="flex items-center gap-2 px-4 py-2 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors border-b-[4px] active:border-b-2 active:translate-y-[2px]">
                 <Share2 size={16} /> 공유
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-500 transition-colors shadow-md border-b-[4px] border-indigo-900 active:border-b-0 active:translate-y-[4px]">
                 <Download size={16} /> PDF 저장
               </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 pt-12 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-4 bg-white p-10 rounded-2xl border-[3px] border-b-[8px] border-r-[6px] border-slate-300 shadow-xl relative mt-4">
             <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                <div className="w-20 h-20 rounded-2xl border-4 border-b-[8px] border-r-[6px] bg-indigo-600 border-indigo-900 flex items-center justify-center text-white shadow-lg">
                  <Map size={32} />
                  <BlockStuds bg="bg-indigo-600" border="border-indigo-900" />
                </div>
             </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-900 mt-6">구조화 리포트</h1>
            <p className="text-lg text-slate-600 font-bold leading-relaxed">
              캔버스에 조립된 {bricks.length}개의 블록들을 분석하여,<br/>
              현재 상태의 중심축과 가장 현실적인 다음 경로를 도출했습니다.
            </p>
          </div>

          {/* Section: CORE BRICK */}
          <section className="mt-12 relative">
             <div className={`p-10 rounded-3xl border-[4px] border-b-[16px] border-r-[12px] ${coreBrick.color} ${coreBrick.border} ${coreBrick.glow} flex flex-col items-center text-center text-white relative z-20`}>
                <BlockStuds bg={coreBrick.color.replace('bg-', '')} border={coreBrick.border.replace('border-', '')} large />
                
                <div className="px-4 py-1.5 bg-white/20 rounded-full font-black text-sm uppercase tracking-widest mb-6 backdrop-blur-md border border-white/30">
                  Your Core Brick
                </div>
                
                <CoreIcon size={64} className="mb-4 opacity-90" />
                
                <h2 className="text-4xl md:text-5xl font-black mb-6">"{coreBrick.title}"</h2>
                
                <p className="text-lg font-bold leading-relaxed max-w-3xl opacity-90">
                  {coreBrick.desc}
                </p>

                <div className="mt-10 grid md:grid-cols-2 gap-4 w-full">
                  <div className="bg-black/20 p-5 rounded-2xl border border-white/10 text-left">
                    <h4 className="font-black text-white/80 mb-2 flex items-center gap-2"><Layers size={18}/> 중심 주변의 블록들</h4>
                    <p className="text-sm font-bold opacity-90">당신의 캔버스에 놓인 빈도 높은 욕구와 불안, 제약 블록들이 모두 이 핵심 축을 보호하거나 달성하기 위해 연결되어 있습니다.</p>
                  </div>
                  <div className="bg-black/20 p-5 rounded-2xl border border-white/10 text-left">
                    <h4 className="font-black text-white/80 mb-2 flex items-center gap-2"><AlertTriangle size={18}/> 주요 충돌 발생</h4>
                    <p className="text-sm font-bold opacity-90">이 거대한 중심축이 다른 욕구(예: {desires[0]?.content || '새로운 시도'})와 부딪히면서, 현재의 멈칫거림과 고민을 만들어내고 있습니다.</p>
                  </div>
                </div>
             </div>
             
             {/* Visual connection lines to next section */}
             <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-4 h-24 bg-slate-300 border-x-4 border-slate-400 z-10"></div>
          </section>

          {/* Section 1: Current Map */}
          <section className="bg-slate-50 rounded-3xl p-8 border-[3px] border-b-[10px] border-r-[8px] border-slate-300 shadow-xl relative mt-20 z-20">
            <BlockStuds bg="bg-slate-50" border="border-slate-300" />
            <h2 className="text-xl font-black flex items-center gap-2 mb-6 border-b-4 border-slate-200 pb-4">
              <Map className="text-indigo-500" /> 연결 블록 구조도 (State Map)
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2"><Briefcase size={16}/> 나의 핵심 자원</h3>
                {experiences.length > 0 ? experiences.map(b => (
                  <BlockContainer key={b.id} type="experience" className="p-3 text-sm font-bold shadow-md">{b.content}</BlockContainer>
                )) : <div className="p-4 bg-slate-100 text-slate-400 rounded-xl text-sm font-bold border-2 border-slate-300 border-dashed">입력된 경험 블록이 없습니다.</div>}
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2"><Lock size={16}/> 절대적 제약</h3>
                {constraints.length > 0 ? constraints.map(b => (
                  <BlockContainer key={b.id} type="constraint" className="p-3 text-sm font-bold shadow-md">{b.content}</BlockContainer>
                )) : <div className="p-4 bg-slate-100 text-slate-400 rounded-xl text-sm font-bold border-2 border-slate-300 border-dashed">제약 블록이 없습니다.</div>}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-black text-rose-500 uppercase tracking-wider flex items-center gap-2"><AlertTriangle size={16}/> 병목 블록</h3>
                <div className="p-5 bg-rose-50 border-4 border-rose-200 rounded-2xl shadow-inner">
                  <p className="text-sm text-rose-800 leading-relaxed font-black">
                    현재 <b>{desires[0]?.content || "새로운 변화"}</b>를 원하지만, 동시에 <b>{anxieties[0]?.content || "불확실성"}</b>에 대한 불안이 Core Brick과 충돌하여 실행을 가로막고 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Path Analysis */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Shuffle className="text-indigo-600" /> 블록 재조립 시나리오
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Path 1 */}
              <div className="bg-white rounded-2xl p-8 border-[3px] border-b-[8px] border-r-[6px] border-indigo-300 shadow-xl relative overflow-hidden hover:-translate-y-2 active:translate-y-[2px] active:border-b-[4px] transition-all">
                <BlockStuds bg="bg-white" border="border-indigo-300" />
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Target size={100} />
                </div>
                <div className="relative z-10">
                  <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-black rounded-lg uppercase tracking-wider mb-4 inline-block border-b-2 border-indigo-200">Option A. Pivot</span>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">핵심 자원 기반의 직무 피벗</h3>
                  <p className="text-slate-500 font-bold mb-6 text-sm leading-relaxed">
                    기존 경험({experiences[0]?.content || '현재 역량'}) 블록을 살리되, Core Brick의 손실을 막으며 새로운 도메인으로 이동.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100">
                      <div className="text-xs font-black text-emerald-600 mb-1">방어 가능한 제약 (PROS)</div>
                      <div className="text-sm font-bold text-slate-700">{constraints[0]?.content || 'Core Brick 유지 가능성'}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100">
                      <div className="text-xs font-black text-rose-600 mb-1">감수해야 할 리스크 (CONS)</div>
                      <div className="text-sm font-bold text-slate-700">초기 3~6개월의 높은 에너지 소모와 불확실성</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Path 2 */}
              <div className="bg-white rounded-2xl p-8 border-[3px] border-b-[8px] border-r-[6px] border-slate-300 shadow-xl relative overflow-hidden hover:-translate-y-2 active:translate-y-[2px] active:border-b-[4px] transition-all">
                <BlockStuds bg="bg-white" border="border-slate-300" />
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Minimize2 size={100} />
                </div>
                <div className="relative z-10">
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-black rounded-lg uppercase tracking-wider mb-4 inline-block border-b-2 border-slate-200">Option B. Stay & Side</span>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">현직 유지 + 워라밸 확보</h3>
                  <p className="text-slate-500 font-bold mb-6 text-sm leading-relaxed">
                    현재 직장에서 에너지를 조율하고, Core Brick을 완벽히 보호하며 나머지 에너지를 개인 성장에 투자하는 전략.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100">
                      <div className="text-xs font-black text-emerald-600 mb-1">방어 가능한 제약 (PROS)</div>
                      <div className="text-sm font-bold text-slate-700">심리적 안정감 극대화 및 {anxieties[0]?.content || '불안 요소'} 완벽 차단</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100">
                      <div className="text-xs font-black text-rose-600 mb-1">감수해야 할 리스크 (CONS)</div>
                      <div className="text-sm font-bold text-slate-700">{desires[0]?.content || '자아 실현 욕구'}의 지연 및 동기부여 저하</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Next Actions */}
          <section className="bg-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-2xl flex flex-col md:flex-row gap-8 items-center relative border-[3px] border-b-[12px] border-r-[8px] border-indigo-900 mt-12">
             <BlockStuds bg="bg-indigo-600" border="border-indigo-900" />
             <div className="md:w-1/3 z-10 space-y-4">
               <h2 className="text-3xl font-black tracking-tight">2주 안에 실행할<br/>작은 조립</h2>
               <p className="text-indigo-200 font-bold text-sm leading-relaxed">
                 거창한 이직이나 퇴사가 아닌, 리스크 없이 경로를 테스트해 볼 수 있는 구체적인 액션 아이템입니다.
               </p>
             </div>
             <div className="md:w-2/3 z-10 w-full space-y-4">
               <div className="flex items-start gap-4 bg-white/10 p-5 rounded-2xl border-2 border-white/20 backdrop-blur-sm">
                 <div className="w-10 h-10 rounded-xl bg-white text-indigo-900 flex items-center justify-center shrink-0 font-black shadow-lg border-b-4 border-indigo-200">1</div>
                 <div>
                   <h4 className="font-black text-white mb-1.5 text-lg">관심 경로의 현직자와 가벼운 커피챗</h4>
                   <p className="text-sm text-indigo-100 font-bold leading-relaxed">LinkedIn을 통해 내가 고려하는 직무(Option A)로 이직한 분에게 메시지를 보내 현실적인 이야기를 들어봅니다.</p>
                 </div>
               </div>
               <div className="flex items-start gap-4 bg-white/10 p-5 rounded-2xl border-2 border-white/20 backdrop-blur-sm">
                 <div className="w-10 h-10 rounded-xl bg-teal-400 text-teal-950 flex items-center justify-center shrink-0 font-black shadow-lg border-b-4 border-teal-600">2</div>
                 <div>
                   <h4 className="font-black text-white mb-1.5 text-lg">나의 '경험 블록'을 한 장으로 조립하기</h4>
                   <p className="text-sm text-indigo-100 font-bold leading-relaxed">디자인이나 형식을 빼고, 오늘 캔버스에 적었던 <b>핵심 자원 블록</b> 3가지만을 중심으로 문서화해 봅니다.</p>
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
