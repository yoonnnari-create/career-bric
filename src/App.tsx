import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, Target, AlertTriangle, Lock, Users, Battery, DollarSign, 
  Briefcase, Heart, Activity, Search, Plus, X, ArrowRight, Grid, 
  LayoutDashboard, Shuffle, Map, Compass, ShieldAlert,
  Layers, Sparkles, Link as LinkIcon, CheckCircle, Zap, Hexagon
} from 'lucide-react';
import { supabase } from './lib/supabase';

// --- Types & Data ---
type BrickType = 'experience' | 'desire' | 'anxiety' | 'constraint' | 'relationship' | 'energy' | 'money' | 'work' | 'meaning' | 'recovery';

interface Brick {
  id: string;
  type: BrickType;
  label: string;
  x: number;
  y: number;
  content: string;
  zone: 'core' | 'keep' | 'discard' | 'none';
  importance: number; // 1 to 3
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'conflict' | 'influence';
}

const BRICK_DEF: Record<BrickType, { icon: any, color: string, name: string, desc: string }> = {
  experience: { icon: Briefcase, color: 'slate', name: '경험', desc: '과거 역량' },
  desire: { icon: Heart, color: 'rose', name: '욕구', desc: '끌리는 방향' },
  anxiety: { icon: AlertTriangle, color: 'amber', name: '불안', desc: '멈칫하는 요소' },
  constraint: { icon: Lock, color: 'stone', name: '제약', desc: '현실 조건' },
  relationship: { icon: Users, color: 'orange', name: '관계', desc: '영향을 주는 사람' },
  energy: { icon: Battery, color: 'emerald', name: '에너지', desc: '체력과 몰입' },
  money: { icon: DollarSign, color: 'green', name: '수익', desc: '경제적 보상' },
  work: { icon: Target, color: 'blue', name: '일', desc: '업무 태도' },
  meaning: { icon: Search, color: 'purple', name: '의미', desc: '삶의 가치' },
  recovery: { icon: Activity, color: 'teal', name: '회복', desc: '재충전 방식' },
};

type CoreBrickType = 'stability' | 'meaning' | 'mastery' | 'autonomy';
const CORE_BRICKS: Record<CoreBrickType, { title: string, icon: any, color: string, desc: string }> = {
  stability: { title: '생존과 안정성', icon: ShieldAlert, color: 'slate', desc: '불확실성을 최소화하고 현실 제약을 방어하려는 패턴' },
  meaning: { title: '의미와 연결', icon: Heart, color: 'purple', desc: '단순 보상보다 내적 가치와 타인과의 연결성을 추구하는 패턴' },
  mastery: { title: '성취와 전문성', icon: Zap, color: 'blue', desc: '결과물과 자원을 폭발시키며 성장하려는 패턴' },
  autonomy: { title: '자율성과 회복', icon: Activity, color: 'teal', desc: '외부 시스템에서 벗어나 주도권과 에너지를 되찾으려는 패턴' }
};

// Map color prefixes to Tailwind classes explicitly for Tailwind to parse
const COLOR_CLASSES: Record<string, any> = {
  slate: { bg: 'bg-slate-500', borderBody: 'border-slate-700', text: 'text-white', studBg: 'bg-slate-400', studBorder: 'border-slate-600' },
  rose: { bg: 'bg-rose-500', borderBody: 'border-rose-700', text: 'text-white', studBg: 'bg-rose-400', studBorder: 'border-rose-600' },
  amber: { bg: 'bg-amber-400', borderBody: 'border-amber-600', text: 'text-amber-950', studBg: 'bg-amber-300', studBorder: 'border-amber-500' },
  stone: { bg: 'bg-stone-500', borderBody: 'border-stone-700', text: 'text-white', studBg: 'bg-stone-400', studBorder: 'border-stone-600' },
  orange: { bg: 'bg-orange-500', borderBody: 'border-orange-700', text: 'text-white', studBg: 'bg-orange-400', studBorder: 'border-orange-600' },
  emerald: { bg: 'bg-emerald-500', borderBody: 'border-emerald-700', text: 'text-white', studBg: 'bg-emerald-400', studBorder: 'border-emerald-600' },
  green: { bg: 'bg-green-500', borderBody: 'border-green-700', text: 'text-white', studBg: 'bg-green-400', studBorder: 'border-green-600' },
  blue: { bg: 'bg-blue-500', borderBody: 'border-blue-700', text: 'text-white', studBg: 'bg-blue-400', studBorder: 'border-blue-600' },
  purple: { bg: 'bg-purple-500', borderBody: 'border-purple-700', text: 'text-white', studBg: 'bg-purple-400', studBorder: 'border-purple-600' },
  teal: { bg: 'bg-teal-500', borderBody: 'border-teal-700', text: 'text-white', studBg: 'bg-teal-400', studBorder: 'border-teal-600' },
};

const getBrickColors = (color: string) => COLOR_CLASSES[color] || COLOR_CLASSES['slate'];

// --- High Quality 3D Lego Brick Component ---
const Brick3D = ({ type, children, large = false, onClick, className = '' }: { type: BrickType | CoreBrickType, children: React.ReactNode, large?: boolean, onClick?: () => void, className?: string }) => {
  const isCore = ['stability', 'meaning', 'mastery', 'autonomy'].includes(type);
  const colorKey = isCore ? CORE_BRICKS[type as CoreBrickType].color : BRICK_DEF[type as BrickType].color;
  const colors = getBrickColors(colorKey);
  
  const studCount = large ? 4 : 2;
  const studClass = large ? 'w-10 h-3' : 'w-6 h-2';
  
  return (
    <div onClick={onClick} className={`relative pt-3 ${onClick ? 'cursor-pointer hover:-translate-y-1 active:translate-y-[2px] transition-transform' : ''} ${className}`}>
      {/* Studs */}
      <div className="absolute top-0 left-6 flex gap-3 z-0">
        {Array.from({ length: studCount }).map((_, i) => (
          <div key={i} className={`rounded-t-md border-b-2 border-r border-t border-l border-white/20 shadow-inner ${colors.studBg} ${colors.studBorder} ${studClass}`}></div>
        ))}
      </div>
      {/* Body */}
      <div className={`relative z-10 rounded-xl border-2 border-b-[8px] border-r-[6px] border-l-white/20 border-t-white/20 shadow-xl ${colors.bg} ${colors.borderBody} ${colors.text} flex flex-col overflow-hidden`}>
        {children}
      </div>
    </div>
  );
};


export default function App() {
  const [view, setView] = useState<'landing' | 'workspace' | 'report'>('landing');
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeBrick, setActiveBrick] = useState<string | null>(null);
  const [insightMessage, setInsightMessage] = useState<string | null>(null);
  const [manualCore, setManualCore] = useState<CoreBrickType | null>(null);
  
  // Auth & Session
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const canvasRef = useRef<HTMLDivElement>(null);

  const extractCoreBrick = (): CoreBrickType => {
    if (bricks.length === 0) return 'stability';
    const counts = { stability: 0, meaning: 0, mastery: 0, autonomy: 0 };
    bricks.forEach(b => {
      if (['money', 'constraint', 'anxiety'].includes(b.type)) counts.stability++;
      else if (['desire', 'relationship', 'meaning'].includes(b.type)) counts.meaning++;
      else if (['experience', 'work', 'energy'].includes(b.type)) counts.mastery++;
      else if (['recovery'].includes(b.type)) counts.autonomy++;
    });
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    return sorted[0][0] as CoreBrickType;
  };
  const currentCore = manualCore || extractCoreBrick();
  const CoreDef = CORE_BRICKS[currentCore];

  useEffect(() => {
    if (bricks.length === 1 && connections.length === 0) setInsightMessage("첫 번째 블록이 캔버스에 놓였습니다. 마우스로 드래그하여 위치를 자유롭게 이동해 보세요.");
    if (bricks.length === 3 && connections.length === 0) setInsightMessage("블록이 쌓이고 있습니다. 관련된 욕구와 불안은 서로 가까이 붙여보세요.");
    if (bricks.filter(b => b.zone === 'discard').length >= 1 && connections.length === 0) setInsightMessage("훌륭합니다! 버릴 것을 명확히 분리하는 것이 구조화의 핵심입니다.");
    
    const desires = bricks.filter(b => b.type === 'desire');
    const anxieties = bricks.filter(b => b.type === 'anxiety');
    if (desires.length > 0 && anxieties.length > 0) {
      const exists = connections.some(c => c.from === desires[0].id && c.to === anxieties[0].id);
      if (!exists) {
        setConnections(prev => [...prev, { id: Date.now().toString() + Math.random().toString(36).substring(2, 9), from: desires[0].id, to: anxieties[0].id, type: 'conflict' }]);
        setInsightMessage(`'${desires[0].label}'과 '${anxieties[0].label}' 사이에 갈등 구조가 발견되었습니다. 빨간 점선으로 연결됩니다.`);
      }
    }

    const timer = setTimeout(() => setInsightMessage(null), 6000);
    return () => clearTimeout(timer);
  }, [bricks, connections]);

  const addBrick = (type: BrickType) => {
    const newBrick: Brick = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      type,
      label: BRICK_DEF[type].name,
      x: window.innerWidth / 2 - 100 + (Math.random() * 40 - 20),
      y: window.innerHeight / 2 - 100 + (Math.random() * 40 - 20),
      content: '',
      zone: 'none',
      importance: 1
    };
    setBricks(prev => [...prev, newBrick]);
    setActiveBrick(newBrick.id);
  };

  const updateBrick = (id: string, updates: Partial<Brick>) => {
    setBricks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBrick = (id: string) => {
    setBricks(prev => prev.filter(b => b.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    if (activeBrick === id) setActiveBrick(null);
  };

  const handleDragEnd = (id: string, info: any) => {
    // Canvas coordinate space
    const canvasWidth = window.innerWidth - 320 - 384; // width minus left(320) and right(384) sidebars
    const canvasHeight = window.innerHeight;
    
    // x is relative to viewport, subtract left sidebar width to get canvas relative x
    const x = info.point.x - 320;
    const y = info.point.y;
    
    let newZone: Brick['zone'] = 'none';
    if (x < canvasWidth / 2 && y < canvasHeight / 2) newZone = 'core';
    else if (x >= canvasWidth / 2 && y < canvasHeight / 2) newZone = 'keep';
    else if (x < canvasWidth / 2 && y >= canvasHeight / 2) newZone = 'none'; // Experiment is 'none' for now to match types
    else if (x >= canvasWidth / 2 && y >= canvasHeight / 2) newZone = 'discard';

    updateBrick(id, { x: x, y: y, zone: newZone });
  };

  const handleFinish = async () => {
    try {
      await supabase.from('workbook_submissions').insert([
        {
          theme: currentCore,
          messages: bricks,
          user_email: session?.user?.email || 'anonymous',
          profile: { type: 'lifebric_canvas', name: session?.user?.user_metadata?.full_name || '익명' }
        }
      ]);
    } catch (e) {
      console.error(e);
    }
    setView('report');
  };

  // --------------------------------------------------------
  // 1. LANDING
  // --------------------------------------------------------
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row items-center justify-center p-6 lg:p-24 gap-12 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 flex-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-900 text-white rounded-full text-sm font-black tracking-widest uppercase border-b-4 border-slate-900 mb-8 shadow-lg">
            <Layers size={18} /> Lifebric
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            삶을 블록으로 <span className="text-indigo-600">구조화</span>하다.
          </h1>
          <p className="text-xl text-slate-600 font-bold mb-10 leading-relaxed">
            AI의 뻔한 추천을 거부합니다.<br/>
            당신의 경험, 욕구, 불안, 제약들을 레고 블록처럼 캔버스에 꺼내어 조립하세요. 무질서했던 생각들이 맞춰지며, 당신을 이끄는 '거대한 중심(Core)'이 모습을 드러냅니다.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setView('workspace')}
              className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 border-b-[6px] border-indigo-900 active:border-b-0 active:translate-y-[6px] transition-all shadow-xl flex items-center justify-center gap-3 text-lg"
            >
              워크스페이스 열기 <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Generated Hero Image or Massive 3D CSS structure */}
        <div className="flex-1 relative z-10 hidden md:flex justify-center">
          <div className="relative w-96 h-96">
            <img src="/lifebric_hero_image_1778145991399.png" alt="Lifebric 3D Blocks" className="w-full h-full object-contain drop-shadow-2xl animate-float" />
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // 2. WORKSPACE
  // --------------------------------------------------------
  if (view === 'workspace') {
    return (
      <div className="h-screen w-screen flex bg-slate-50 overflow-hidden font-sans selection:bg-indigo-100">
        
        {/* LEFT PANEL: Factory */}
        <div className="w-80 bg-white border-r-4 border-slate-200 flex flex-col z-30 shadow-2xl relative shrink-0">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Box className="text-indigo-600"/> Lifebric</h1>
            <button onClick={() => setView('landing')} className="text-slate-400 hover:text-slate-700"><LayoutDashboard size={20}/></button>
          </div>

          <div className="p-6 border-b-4 border-slate-100 bg-slate-50/50">
             <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Battery size={14}/> Current State</h2>
             <div className="text-xs font-bold text-slate-500 mb-4">현재 캔버스에 올려진 자원 밀도</div>
             <div className="w-full bg-slate-200 rounded-full h-3">
               <div className="bg-indigo-500 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, bricks.length * 10)}%` }}></div>
             </div>
             <div className="flex justify-between text-[10px] font-black text-slate-400 mt-1 uppercase">
               <span>Empty</span><span>Structured</span>
             </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-slate-100">
            <h2 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-4">Brick Factory</h2>
            <div className="space-y-4">
              {Object.entries(BRICK_DEF).map(([type, def]) => {
                const Icon = def.icon;
                return (
                  <Brick3D key={type} type={type as BrickType} onClick={() => addBrick(type as BrickType)}>
                    <div className="p-3 flex items-center gap-3">
                      <Icon size={20} />
                      <div>
                        <div className="font-black text-sm">{def.name}</div>
                        <div className="text-[10px] font-bold opacity-80">{def.desc}</div>
                      </div>
                    </div>
                  </Brick3D>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER CANVAS */}
        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:32px_32px]" ref={canvasRef}>
          
          {bricks.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
               <div className="text-slate-300 mb-6 animate-bounce"><ArrowRight size={64} className="rotate-180" /></div>
               <h2 className="text-2xl font-black text-slate-400">왼쪽 팩토리에서 블록을 클릭하거나 꺼내어 조립을 시작하세요.</h2>
               <p className="text-slate-500 font-bold mt-2">경험, 욕구, 제약들을 자유롭게 나열해 보세요.</p>
            </div>
          )}

          {/* 4 Quadrants Zones */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Horizontal Line */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200/50"></div>
            {/* Vertical Line */}
            <div className="absolute top-0 left-1/2 w-px h-full bg-slate-200/50"></div>
            
            {/* Top Left: Core */}
            <div className="absolute top-8 left-8">
              <div className="text-4xl font-black text-slate-200/50 uppercase tracking-widest">Core</div>
              <div className="text-sm font-bold text-slate-300">내려놓을 수 없는 핵심</div>
            </div>
            {/* Top Right: Keep */}
            <div className="absolute top-8 right-8 text-right">
              <div className="text-4xl font-black text-emerald-200/50 uppercase tracking-widest">Keep</div>
              <div className="text-sm font-bold text-emerald-300">유지하고 강화할 요소</div>
            </div>
            {/* Bottom Left: Experiment */}
            <div className="absolute bottom-8 left-8">
              <div className="text-4xl font-black text-indigo-200/50 uppercase tracking-widest">Try</div>
              <div className="text-sm font-bold text-indigo-300">작게 실험해 볼 요소</div>
            </div>
            {/* Bottom Right: Discard */}
            <div className="absolute bottom-8 right-8 text-right">
              <div className="text-4xl font-black text-rose-200/50 uppercase tracking-widest">Discard</div>
              <div className="text-sm font-bold text-rose-300">포기하거나 버릴 요소</div>
            </div>
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {connections.map(conn => {
              const fromBrick = bricks.find(b => b.id === conn.from);
              const toBrick = bricks.find(b => b.id === conn.to);
              if (!fromBrick || !toBrick) return null;
              const x1 = fromBrick.x + 120; const y1 = fromBrick.y + 60;
              const x2 = toBrick.x + 120; const y2 = toBrick.y + 60;
              
              if (conn.type === 'conflict') {
                return <path key={conn.id} d={`M ${x1} ${y1} Q ${(x1+x2)/2} ${(y1+y2)/2 - 50} ${x2} ${y2}`} stroke="#f43f5e" strokeWidth="4" strokeDasharray="10,10" fill="none" className="animate-pulse opacity-60" />;
              }
              return null;
            })}
          </svg>

          {bricks.map(brick => {
            const def = BRICK_DEF[brick.type];
            const Icon = def.icon;
            const isActive = activeBrick === brick.id;
            const isConflict = connections.some(c => c.type === 'conflict' && (c.from === brick.id || c.to === brick.id));
            const animateProps = isConflict ? { rotate: [-1, 1, -1] } : {};
            
            return (
              <motion.div
                key={brick.id}
                drag
                dragMomentum={false}
                onDragEnd={(_, info) => handleDragEnd(brick.id, info)}
                onMouseDown={() => setActiveBrick(brick.id)}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, ...animateProps }}
                transition={{ repeat: isConflict ? Infinity : 0, duration: 1 }}
                style={{ top: 0, left: 0, x: brick.x, y: brick.y, position: 'absolute' }}
                className={`cursor-grab active:cursor-grabbing w-64 min-h-[140px] ${isActive ? 'z-50' : 'z-20'}`}
              >
                <Brick3D type={brick.type} className="h-full">
                  <div className="px-4 py-3 flex items-center justify-between border-b border-black/10">
                    <div className="flex items-center gap-2 font-black text-sm">
                      <Icon size={16} /> {def.name}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteBrick(brick.id); }} className="hover:bg-black/20 p-1 rounded-md transition-colors"><X size={14}/></button>
                  </div>
                  <textarea 
                    value={brick.content}
                    onChange={(e) => updateBrick(brick.id, { content: e.target.value })}
                    placeholder={`${def.name}에 대해 입력하세요...`}
                    className={`w-full flex-1 p-4 font-bold text-sm bg-transparent resize-none focus:outline-none placeholder:text-white/50`}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </Brick3D>
              </motion.div>
            );
          })}

          <AnimatePresence>
            {insightMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl border-b-4 border-slate-950 shadow-2xl z-50 flex items-center gap-4 max-w-xl w-full"
              >
                <div className="p-2 bg-indigo-500 rounded-xl"><Sparkles size={20} /></div>
                <p className="font-bold text-sm leading-relaxed">{insightMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT PANEL: Live Structuring & Finish */}
        <div className="w-96 bg-slate-100 border-l-4 border-slate-200 flex flex-col z-30 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] shrink-0">
          <div className="p-6 border-b-4 border-slate-200 bg-white sticky top-0 z-10 flex flex-col items-center text-center">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-1"><Compass className="text-indigo-600"/> 실시간 분석</h2>
            <p className="text-xs font-bold text-slate-500">조립 과정이 자동으로 해석됩니다.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {bricks.length < 3 ? (
              <div className="text-center p-8 bg-slate-200 rounded-2xl border-2 border-dashed border-slate-300">
                <p className="text-slate-500 font-bold text-sm">블록을 3개 이상 캔버스에 올려 분석을 시작하세요.</p>
              </div>
            ) : (
              <>
                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Hexagon size={14}/> Extracted Core</h3>
                  <Brick3D type={currentCore} large>
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-xl"><CoreDef.icon size={20} /></div>
                        <h4 className="font-black text-xl">{CoreDef.title}</h4>
                      </div>
                      <p className="text-xs font-bold opacity-90 leading-relaxed bg-black/20 p-3 rounded-xl border border-black/10">
                        {CoreDef.desc}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(Object.keys(CORE_BRICKS) as CoreBrickType[]).map(key => {
                          const kDef = CORE_BRICKS[key];
                          return (
                            <button 
                              key={key} 
                              onClick={() => setManualCore(key)}
                              className={`px-2 py-1 rounded text-[10px] font-black transition-all border ${currentCore === key ? 'bg-white text-slate-900 border-white' : 'bg-transparent text-white/70 border-white/30 hover:bg-white/10'}`}
                            >
                              {kDef.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Brick3D>
                </section>

                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><LinkIcon size={14}/> 발견된 충돌</h3>
                  {connections.filter(c => c.type === 'conflict').length > 0 ? (
                    <div className="space-y-3">
                      {connections.filter(c => c.type === 'conflict').map(conn => {
                         const b1 = bricks.find(b=>b.id===conn.from);
                         const b2 = bricks.find(b=>b.id===conn.to);
                         return b1 && b2 ? (
                           <div key={conn.id} className="bg-rose-50 border-2 border-rose-200 p-4 rounded-xl flex items-center justify-between">
                             <span className="text-sm font-black text-rose-800 bg-white px-2 py-1 rounded shadow-sm">{b1.label}</span>
                             <Target size={16} className="text-rose-400 mx-2"/>
                             <span className="text-sm font-black text-rose-800 bg-white px-2 py-1 rounded shadow-sm">{b2.label}</span>
                           </div>
                         ) : null;
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-bold bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm">
                      현재 명확한 구조적 충돌은 발견되지 않았습니다.
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          <div className="p-6 bg-white border-t-4 border-slate-200">
            <button 
              onClick={handleFinish}
              disabled={bricks.length < 3}
              className="w-full py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 border-b-[6px] border-slate-950 active:border-b-0 active:translate-y-[6px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:border-b-[6px] disabled:active:translate-y-0"
            >
              <CheckCircle size={20} /> 결과 저장 및 리포트 보기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // 3. FINAL REPORT
  // --------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
      <header className="bg-white border-b-4 border-slate-200 sticky top-0 z-50 p-4 flex justify-between items-center px-8">
        <button onClick={() => setView('workspace')} className="flex items-center gap-2 font-black text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors border-b-2 border-slate-300 active:border-b-0 active:translate-y-[2px]"><Grid size={16}/> 워크스페이스 복귀</button>
        <h1 className="font-black text-xl flex items-center gap-2"><Map className="text-indigo-600"/> Lifebric Report</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-16 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">구조화 리포트</h2>
          <p className="text-lg text-slate-600 font-bold">당신이 조립한 캔버스를 분석한 최종 결과입니다.</p>
        </div>

        <section className="flex justify-center mt-12">
          <div className="w-full max-w-2xl">
            <Brick3D type={currentCore} large className="w-full">
              <div className="p-10 text-center flex flex-col items-center">
                <div className="px-4 py-1.5 bg-white/20 rounded-full font-black text-sm uppercase tracking-widest mb-6">Your Core Brick</div>
                <CoreDef.icon size={80} className="mb-6 opacity-90" />
                <h3 className="text-5xl font-black mb-6">"{CoreDef.title}"</h3>
                <p className="text-xl font-bold opacity-90 leading-relaxed bg-black/20 p-6 rounded-2xl">
                  {CoreDef.desc}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {(Object.keys(CORE_BRICKS) as CoreBrickType[]).map(key => {
                    const kDef = CORE_BRICKS[key];
                    const Icon = kDef.icon;
                    return (
                      <button 
                        key={key} 
                        onClick={() => setManualCore(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all border-2 ${currentCore === key ? 'bg-white text-slate-900 border-white' : 'bg-transparent text-white/70 border-white/30 hover:bg-white/10 hover:border-white/50'}`}
                      >
                        <Icon size={16} /> {kDef.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Brick3D>
          </div>
        </section>

        {/* New Assembly Summary Section */}
        <section className="bg-white rounded-3xl p-10 border-[4px] border-b-[12px] border-r-[8px] border-slate-300 shadow-xl mt-16">
          <h2 className="text-2xl font-black flex items-center gap-2 mb-8 pb-4 border-b-4 border-slate-100">
            <Layers className="text-indigo-600" /> 나의 블록 조립 결과
          </h2>
          
          <div className="space-y-8">
            {/* Keep Zone Bricks */}
            {bricks.filter(b => b.zone === 'keep').length > 0 && (
              <div>
                <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest mb-4">Keep (유지할 것)</h3>
                <div className="flex flex-wrap gap-4">
                  {bricks.filter(b => b.zone === 'keep').map(brick => {
                    const def = BRICK_DEF[brick.type];
                    const Icon = def.icon;
                    return (
                      <div key={brick.id} className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl shadow-sm min-w-[200px]">
                        <div className="flex items-center gap-2 text-emerald-700 font-black text-sm mb-2"><Icon size={16}/> {def.name}</div>
                        <p className="text-sm font-bold text-emerald-900">{brick.content || '(내용 없음)'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Discard Zone Bricks */}
            {bricks.filter(b => b.zone === 'discard').length > 0 && (
              <div>
                <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-4">Discard (버릴 것)</h3>
                <div className="flex flex-wrap gap-4">
                  {bricks.filter(b => b.zone === 'discard').map(brick => {
                    const def = BRICK_DEF[brick.type];
                    const Icon = def.icon;
                    return (
                      <div key={brick.id} className="bg-rose-50 border-2 border-rose-200 p-4 rounded-xl shadow-sm min-w-[200px]">
                        <div className="flex items-center gap-2 text-rose-700 font-black text-sm mb-2"><Icon size={16}/> {def.name}</div>
                        <p className="text-sm font-bold text-rose-900">{brick.content || '(내용 없음)'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conflicts */}
            {connections.filter(c => c.type === 'conflict').length > 0 && (
              <div>
                <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4">Conflicts (강한 충돌)</h3>
                <div className="flex flex-col gap-3">
                  {connections.filter(c => c.type === 'conflict').map(conn => {
                    const b1 = bricks.find(b=>b.id===conn.from);
                    const b2 = bricks.find(b=>b.id===conn.to);
                    if (!b1 || !b2) return null;
                    return (
                      <div key={conn.id} className="bg-amber-50 border-2 border-amber-200 p-4 rounded-xl shadow-sm flex items-center justify-between max-w-xl">
                        <div className="flex-1">
                          <span className="text-xs font-black text-amber-600 bg-amber-100 px-2 py-1 rounded mb-1 inline-block">{b1.label}</span>
                          <p className="text-sm font-bold text-amber-900">{b1.content || '(내용 없음)'}</p>
                        </div>
                        <Target size={24} className="text-amber-400 mx-4 shrink-0"/>
                        <div className="flex-1 text-right">
                          <span className="text-xs font-black text-amber-600 bg-amber-100 px-2 py-1 rounded mb-1 inline-block">{b2.label}</span>
                          <p className="text-sm font-bold text-amber-900">{b2.content || '(내용 없음)'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Bricks */}
            {bricks.filter(b => b.zone !== 'keep' && b.zone !== 'discard' && !connections.some(c => c.from === b.id || c.to === b.id)).length > 0 && (
              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Other Bricks (기타 요소)</h3>
                <div className="flex flex-wrap gap-3">
                  {bricks.filter(b => b.zone !== 'keep' && b.zone !== 'discard' && !connections.some(c => c.from === b.id || c.to === b.id)).map(brick => {
                    const def = BRICK_DEF[brick.type];
                    const Icon = def.icon;
                    return (
                      <div key={brick.id} className="bg-slate-100 border-2 border-slate-200 px-4 py-2 rounded-lg flex items-center gap-2">
                        <Icon size={14} className="text-slate-500" />
                        <span className="font-bold text-sm text-slate-700">{def.name}:</span>
                        <span className="text-sm text-slate-600">{brick.content || '...'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {bricks.length === 0 && (
              <p className="text-slate-500 font-bold text-center py-4">캔버스에 배치된 블록이 없습니다.</p>
            )}

            {/* AI Interpretation */}
            {bricks.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl mt-12">
                <h3 className="text-sm font-black text-indigo-600 mb-6 flex items-center gap-2"><Sparkles size={16}/> 캔버스 구조 분석</h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-1.5 bg-indigo-500 rounded-full shrink-0"></div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">핵심 동인 (Core Driver)</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        현재 당신을 움직이는 가장 큰 동력은 <b>'{CoreDef.title}'</b>입니다. {CoreDef.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-1.5 bg-amber-500 rounded-full shrink-0"></div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">에너지 누수 (Energy Leak)</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {connections.filter(c => c.type === 'conflict').length > 0 ? (
                          `캔버스에 드러난 강한 충돌이 의사결정을 지연시키고 있습니다. 상충하는 욕구들을 모두 충족하려는 시도가 에너지를 고갈시킬 수 있습니다.`
                        ) : (
                          `현재 캔버스에는 뚜렷한 가치 충돌이 보이지 않아, 결단만 내린다면 빠르게 실행으로 옮길 수 있는 에너지가 비축되어 있습니다.`
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-1.5 bg-rose-500 rounded-full shrink-0"></div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">방향성 진단 (Direction)</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {bricks.filter(b => b.zone === 'discard').length === 0 ? (
                          `'버릴 것(Discard)'이 전혀 정의되지 않았습니다. 무엇을 포기할지 정하지 않으면, 새로운 것을 시도할 공간(Keep/Try)을 만들 수 없습니다.`
                        ) : (
                          `버려야 할 요소들을 명확히 시각화했습니다. 이제 남은 것은 '유지할 것'을 지키며 리스크를 줄이는 경로를 선택하는 것입니다.`
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-10 border-[4px] border-b-[12px] border-r-[8px] border-slate-300 shadow-xl mt-16">
          <h2 className="text-2xl font-black flex items-center gap-2 mb-8 pb-4 border-b-4 border-slate-100">
            <Shuffle className="text-indigo-600" /> 추천 조립 시나리오 (Path A/B)
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-b-4 border-indigo-200">
              <div className="text-xs font-black text-indigo-500 bg-indigo-100 px-2 py-1 rounded inline-block mb-3">Option A</div>
              <h3 className="text-xl font-black mb-2 text-slate-800">Core 중심의 피벗</h3>
              <p className="text-sm font-bold text-slate-600 mb-4">현재 Core Brick을 완벽히 지키면서 제약을 회피하는 직무/환경 이동.</p>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <strong className="text-xs text-indigo-600 block mb-1">2주 액션 테스트</strong>
                <span className="text-sm font-bold text-slate-700">관심 경로 현직자에게 커피챗 요청하기</span>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-b-4 border-slate-300">
              <div className="text-xs font-black text-slate-500 bg-slate-200 px-2 py-1 rounded inline-block mb-3">Option B</div>
              <h3 className="text-xl font-black mb-2 text-slate-800">유지 및 분리 (Stay & Side)</h3>
              <p className="text-sm font-bold text-slate-600 mb-4">현직을 유지하되, 에너지를 분산시켜 다른 블록의 욕구를 별도로 해소.</p>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <strong className="text-xs text-slate-600 block mb-1">2주 액션 테스트</strong>
                <span className="text-sm font-bold text-slate-700">이번 주 하루 칼퇴근 후 2시간 사이드 프로젝트 실험</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
