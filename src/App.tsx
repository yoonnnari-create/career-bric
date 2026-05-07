import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, Target, AlertTriangle, Lock, Users, Battery, DollarSign, 
  Briefcase, Heart, Activity, Search, Plus, X, ArrowRight, Grid, 
  LayoutDashboard, Shuffle, Map, Compass, ShieldAlert,
  Minimize2, Share2, Download, Hexagon, Zap, Layers, Trash2, Crosshair, Sparkles, Link as LinkIcon
} from 'lucide-react';

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

const BRICK_DEF: Record<BrickType, { icon: any, bg: string, border: string, text: string, name: string, desc: string }> = {
  experience: { icon: Briefcase, bg: 'bg-slate-700', border: 'border-slate-900', text: 'text-white', name: '경험', desc: '과거 역량' },
  desire: { icon: Heart, bg: 'bg-rose-500', border: 'border-rose-700', text: 'text-white', name: '욕구', desc: '끌리는 방향' },
  anxiety: { icon: AlertTriangle, bg: 'bg-amber-400', border: 'border-amber-600', text: 'text-amber-950', name: '불안', desc: '멈칫하는 요소' },
  constraint: { icon: Lock, bg: 'bg-stone-500', border: 'border-stone-700', text: 'text-white', name: '제약', desc: '현실 조건' },
  relationship: { icon: Users, bg: 'bg-orange-500', border: 'border-orange-700', text: 'text-white', name: '관계', desc: '영향을 주는 사람' },
  energy: { icon: Battery, bg: 'bg-emerald-500', border: 'border-emerald-700', text: 'text-white', name: '에너지', desc: '체력과 몰입' },
  money: { icon: DollarSign, bg: 'bg-green-500', border: 'border-green-700', text: 'text-white', name: '수익', desc: '경제적 보상' },
  work: { icon: Target, bg: 'bg-blue-500', border: 'border-blue-700', text: 'text-white', name: '일', desc: '업무 태도' },
  meaning: { icon: Search, bg: 'bg-purple-500', border: 'border-purple-700', text: 'text-white', name: '의미', desc: '삶의 가치' },
  recovery: { icon: Activity, bg: 'bg-teal-500', border: 'border-teal-700', text: 'text-white', name: '회복', desc: '재충전 방식' },
};

type CoreBrickType = 'stability' | 'meaning' | 'mastery' | 'autonomy';
const CORE_BRICKS: Record<CoreBrickType, { title: string, icon: any, color: string, border: string, glow: string }> = {
  stability: { title: '생존과 안정성', icon: ShieldAlert, color: 'bg-slate-800', border: 'border-slate-950', glow: 'shadow-[0_0_60px_rgba(30,41,59,0.3)]' },
  meaning: { title: '의미와 연결', icon: Heart, color: 'bg-purple-600', border: 'border-purple-900', glow: 'shadow-[0_0_60px_rgba(147,51,234,0.3)]' },
  mastery: { title: '성취와 전문성', icon: Zap, color: 'bg-blue-600', border: 'border-blue-900', glow: 'shadow-[0_0_60px_rgba(37,99,235,0.3)]' },
  autonomy: { title: '자율성과 회복', icon: Activity, color: 'bg-teal-500', border: 'border-teal-800', glow: 'shadow-[0_0_60px_rgba(20,184,166,0.3)]' }
};

// --- Reusable 3D Block Studs ---
const BlockStuds = ({ bg, border, large = false }: { bg: string, border: string, large?: boolean }) => {
  const sizeClass = large ? 'w-10 h-[12px]' : 'w-6 h-[8px]';
  const topSize = large ? 'w-10 h-[8px] top-[4px]' : 'w-6 h-[4px] top-0';
  const bodySize = large ? 'w-10 h-[8px] top-[4px]' : 'w-6 h-[6px] top-[2px]';
  const gap = large ? 'gap-3 left-6 -top-[12px]' : 'gap-2 left-4 -top-[8px]';
  
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

export default function App() {
  const [view, setView] = useState<'landing' | 'workspace'>('landing');
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeBrick, setActiveBrick] = useState<string | null>(null);
  const [insightMessage, setInsightMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto-extract Core Brick based on current bricks
  const extractCoreBrick = (): CoreBrickType => {
    const counts = { stability: 0, meaning: 0, mastery: 0, autonomy: 0 };
    bricks.forEach(b => {
      if (['money', 'constraint', 'anxiety'].includes(b.type)) counts.stability++;
      else if (['desire', 'relationship', 'meaning'].includes(b.type)) counts.meaning++;
      else if (['experience', 'work', 'energy'].includes(b.type)) counts.mastery++;
      else if (['recovery'].includes(b.type)) counts.autonomy++;
    });
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    return (sorted[0][1] > 0 ? sorted[0][0] : 'stability') as CoreBrickType;
  };
  const currentCore = extractCoreBrick();
  const CoreDef = CORE_BRICKS[currentCore];

  // Mid-process Insights Logic
  useEffect(() => {
    if (bricks.length === 3) setInsightMessage("블록이 쌓이기 시작했습니다. 서로 연결되는 패턴을 찾아보세요.");
    if (bricks.filter(b => b.type === 'anxiety').length >= 2) setInsightMessage("불안 블록이 반복적으로 등장하고 있습니다. 이 불안의 진짜 원인은 무엇일까요?");
    if (bricks.filter(b => b.zone === 'discard').length >= 1) setInsightMessage("훌륭합니다! 버릴 것을 명확히 하는 것이 구조화의 첫걸음입니다.");
    
    // Auto-connect conflict example: desire <-> anxiety
    const desires = bricks.filter(b => b.type === 'desire');
    const anxieties = bricks.filter(b => b.type === 'anxiety');
    if (desires.length > 0 && anxieties.length > 0) {
      const exists = connections.some(c => c.from === desires[0].id && c.to === anxieties[0].id);
      if (!exists) {
        setConnections(prev => [...prev, { id: Date.now().toString(), from: desires[0].id, to: anxieties[0].id, type: 'conflict' }]);
        setInsightMessage(`'${desires[0].label}'과 '${anxieties[0].label}' 사이에 강한 충돌이 발생했습니다.`);
      }
    }

    const timer = setTimeout(() => setInsightMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [bricks]);

  const addBrick = (type: BrickType) => {
    const newBrick: Brick = {
      id: Date.now().toString(),
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
    // Determine zone based on x, y position relative to the screen
    // Simple heuristic for zones: top-right is Keep, bottom-right is Discard
    const x = info.point.x;
    const y = info.point.y;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    let newZone: Brick['zone'] = 'none';
    if (x > width - 400 && y < 300) newZone = 'keep';
    else if (x > width - 400 && y > height - 300) newZone = 'discard';
    else if (x > width / 2 - 200 && x < width / 2 + 200 && y > height / 2 - 200 && y < height / 2 + 200) newZone = 'core';

    updateBrick(id, { x: info.point.x - 300 /* offset for sidebar */, y: info.point.y, zone: newZone });
  };

  // --------------------------------------------------------
  // LANDING
  // --------------------------------------------------------
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-900 text-white rounded-full text-sm font-black tracking-widest uppercase border-b-4 border-slate-900 mb-8">
            <Layers size={18} /> Lifebric Canvas
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            삶을, <span className="text-indigo-600">구조화</span>하다.
          </h1>
          <p className="text-xl text-slate-600 font-bold mb-12 leading-relaxed">
            AI의 뻔한 추천을 거부합니다.<br/>
            경험, 욕구, 불안을 워크스페이스에 꺼내어 놓고 당신만의 진짜 지도를 완성하세요.
          </p>
          <button 
            onClick={() => setView('workspace')}
            className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 border-b-[6px] border-indigo-900 active:border-b-0 active:translate-y-[6px] transition-all shadow-xl flex items-center justify-center gap-3 text-xl mx-auto"
          >
            워크스페이스 열기 <ArrowRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // WORKSPACE (Canvas + Panels)
  // --------------------------------------------------------
  return (
    <div className="h-screen w-screen flex bg-slate-50 overflow-hidden font-sans selection:bg-indigo-100">
      
      {/* 1. LEFT PANEL: State & Palette */}
      <div className="w-80 bg-white border-r-4 border-slate-200 flex flex-col z-30 shadow-2xl relative">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Box className="text-indigo-600"/> Lifebric</h1>
        </div>

        {/* Current State Dash */}
        <div className="p-6 border-b-4 border-slate-100">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Current State</h2>
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3">
               <div className="text-[10px] font-black text-emerald-600 mb-1 flex items-center gap-1"><Battery size={12}/> 에너지</div>
               <div className="text-lg font-black text-emerald-900">{bricks.length > 0 ? '소진됨' : '보통'}</div>
             </div>
             <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-3">
               <div className="text-[10px] font-black text-rose-600 mb-1 flex items-center gap-1"><AlertTriangle size={12}/> 불안 수준</div>
               <div className="text-lg font-black text-rose-900">{bricks.filter(b=>b.type==='anxiety').length > 1 ? '높음' : '안정적'}</div>
             </div>
             <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-3 col-span-2">
               <div className="text-[10px] font-black text-indigo-600 mb-1 flex items-center gap-1"><Compass size={12}/> 방향 명확도</div>
               <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
                 <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(100, bricks.length * 15)}%` }}></div>
               </div>
             </div>
          </div>
        </div>

        {/* Brick Palette */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Brick Factory</h2>
          <div className="space-y-3">
            {Object.entries(BRICK_DEF).map(([type, def]) => {
              const Icon = def.icon;
              return (
                <button
                  key={type}
                  onClick={() => addBrick(type as BrickType)}
                  className={`w-full relative text-left p-3 rounded-xl border-2 border-b-[4px] border-r-[3px] ${def.bg} ${def.border} ${def.text} hover:-translate-y-1 active:translate-y-[2px] active:border-b-[2px] transition-all`}
                >
                  <BlockStuds bg={def.bg.replace('bg-', '')} border={def.border.replace('border-', '')} />
                  <div className="flex items-center gap-3 relative z-10">
                    <Icon size={18} />
                    <div>
                      <div className="font-black text-sm">{def.name}</div>
                      <div className="text-[10px] font-bold opacity-80">{def.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. CENTER CANVAS */}
      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:32px_32px]" ref={canvasRef}>
        
        {/* Drop Zones (Visual guides) */}
        <div className="absolute top-10 right-10 w-72 h-48 border-4 border-dashed border-emerald-300 bg-emerald-50/50 rounded-3xl flex items-center justify-center pointer-events-none z-0">
           <span className="font-black text-emerald-400 text-2xl tracking-widest uppercase">Keep (유지)</span>
        </div>
        <div className="absolute bottom-10 right-10 w-72 h-48 border-4 border-dashed border-rose-300 bg-rose-50/50 rounded-3xl flex items-center justify-center pointer-events-none z-0">
           <span className="font-black text-rose-400 text-2xl tracking-widest uppercase">Discard (버리기)</span>
        </div>

        {/* Core Area Indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-[8px] border-slate-200/50 rounded-full flex items-center justify-center pointer-events-none z-0">
           <span className="font-black text-slate-300 text-4xl tracking-widest uppercase opacity-50">Core Zone</span>
        </div>

        {/* SVG Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
          </defs>
          {connections.map(conn => {
            const fromBrick = bricks.find(b => b.id === conn.from);
            const toBrick = bricks.find(b => b.id === conn.to);
            if (!fromBrick || !toBrick) return null;
            // Rough center coordinates
            const x1 = fromBrick.x + 100; const y1 = fromBrick.y + 70;
            const x2 = toBrick.x + 100; const y2 = toBrick.y + 70;
            
            if (conn.type === 'conflict') {
              return <path key={conn.id} d={`M ${x1} ${y1} Q ${(x1+x2)/2} ${(y1+y2)/2 - 50} ${x2} ${y2}`} stroke="#f43f5e" strokeWidth="4" strokeDasharray="10,10" fill="none" className="animate-pulse" />;
            }
            return <line key={conn.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="3" markerEnd="url(#arrow)" />;
          })}
        </svg>

        {/* Bricks rendering */}
        {bricks.map(brick => {
          const def = BRICK_DEF[brick.type];
          const Icon = def.icon;
          const isActive = activeBrick === brick.id;
          
          // Dynamic sizing & animation based on traits
          const sizeClass = brick.importance === 3 ? "w-80 min-h-[160px]" : "w-64 min-h-[120px]";
          const isConflict = connections.some(c => c.type === 'conflict' && (c.from === brick.id || c.to === brick.id));
          const animateProps = isConflict ? { rotate: [-1, 1, -1] } : brick.type === 'recovery' ? { scale: [1, 1.02, 1] } : {};
          const isCore = brick.zone === 'core';

          return (
            <motion.div
              key={brick.id}
              drag
              dragMomentum={false}
              onDragEnd={(_, info) => handleDragEnd(brick.id, info)}
              onMouseDown={() => setActiveBrick(brick.id)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, ...animateProps }}
              transition={{ repeat: isConflict || brick.type === 'recovery' ? Infinity : 0, duration: 2 }}
              style={{ x: brick.x, y: brick.y, position: 'absolute' }}
              className={`cursor-grab active:cursor-grabbing ${isActive || isCore ? 'z-50' : 'z-20'}`}
            >
              <div className={`relative rounded-2xl border-2 border-b-[8px] border-r-[6px] ${def.bg} ${def.border} ${def.text} ${sizeClass} flex flex-col ${isCore ? 'shadow-[0_0_50px_rgba(255,255,255,0.8)]' : 'shadow-xl'} transition-shadow`}>
                <BlockStuds bg={def.bg.replace('bg-', '')} border={def.border.replace('border-', '')} />
                <div className="px-4 py-3 flex items-center justify-between border-b border-black/10">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <Icon size={16} /> {brick.label} {isCore && <span className="ml-2 text-[10px] bg-white/20 px-2 py-0.5 rounded">CORE</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); updateBrick(brick.id, { importance: brick.importance === 3 ? 1 : 3 }); }} className="hover:bg-black/20 p-1 rounded-md" title="크기 변경"><Grid size={14}/></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteBrick(brick.id); }} className="hover:bg-black/20 p-1 rounded-md" title="삭제"><X size={14}/></button>
                  </div>
                </div>
                <textarea 
                  value={brick.content}
                  onChange={(e) => updateBrick(brick.id, { content: e.target.value })}
                  placeholder="내용을 입력하세요..."
                  className={`w-full flex-1 p-4 font-bold text-sm bg-transparent resize-none focus:outline-none placeholder:text-white/50 ${def.text}`}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
            </motion.div>
          );
        })}

        {/* Insight Alert Overlay */}
        <AnimatePresence>
          {insightMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl border-b-4 border-slate-950 shadow-2xl z-50 flex items-center gap-4 max-w-xl w-full"
            >
              <div className="p-2 bg-indigo-500 rounded-xl"><Sparkles size={20} /></div>
              <p className="font-bold text-sm leading-relaxed">{insightMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* 3. RIGHT PANEL: Structuring Panel */}
      <div className="w-96 bg-white border-l-4 border-slate-200 flex flex-col z-30 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] relative overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><Map className="text-indigo-600"/> 구조화 리포트</h2>
          <p className="text-xs font-bold text-slate-500 mt-1">캔버스의 상태가 실시간 분석됩니다.</p>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Core Brick Analysis */}
          <section>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Hexagon size={14}/> Extracted Core</h3>
            <div className={`p-5 rounded-2xl border-2 border-b-[6px] border-r-[4px] ${CoreDef.color} ${CoreDef.border} text-white`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-xl"><CoreDef.icon size={20} /></div>
                <h4 className="font-black text-xl">{CoreDef.title}</h4>
              </div>
              <p className="text-xs font-bold opacity-90 leading-relaxed bg-black/20 p-3 rounded-xl border border-black/10">
                캔버스에 놓인 블록 빈도와 제약/불안 요소의 군집을 분석한 결과, 현재 당신을 움직이는 가장 큰 축은 <b>'{CoreDef.title}'</b>입니다.
              </p>
            </div>
          </section>

          {/* Conflict Network */}
          <section>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><LinkIcon size={14}/> Major Conflicts</h3>
            {connections.filter(c => c.type === 'conflict').length > 0 ? (
              <div className="space-y-3">
                {connections.filter(c => c.type === 'conflict').map(conn => {
                   const b1 = bricks.find(b=>b.id===conn.from);
                   const b2 = bricks.find(b=>b.id===conn.to);
                   return b1 && b2 ? (
                     <div key={conn.id} className="bg-rose-50 border-2 border-rose-200 p-4 rounded-xl flex items-center justify-between">
                       <span className="text-sm font-black text-rose-800 bg-white px-2 py-1 rounded shadow-sm">{b1.label}</span>
                       <Target size={16} className="text-rose-400"/>
                       <span className="text-sm font-black text-rose-800 bg-white px-2 py-1 rounded shadow-sm">{b2.label}</span>
                     </div>
                   ) : null;
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-bold bg-slate-50 p-4 rounded-xl border-2 border-dashed border-slate-200">
                아직 발견된 강한 충돌(Conflict)이 없습니다. 서로 반대되는 욕구와 불안을 놓아보세요.
              </div>
            )}
          </section>

          {/* Structural Paths */}
          <section>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Shuffle size={14}/> Recommended Paths</h3>
            <div className="space-y-4">
              <div className="bg-white border-2 border-slate-200 border-b-4 p-4 rounded-xl hover:-translate-y-1 hover:border-indigo-300 transition-colors cursor-pointer group">
                <div className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded inline-block mb-2">Option A</div>
                <h4 className="font-black text-slate-800 text-sm mb-1 group-hover:text-indigo-600">Core 중심의 피벗</h4>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">{CoreDef.title}을 완벽히 지키면서 제약을 회피하는 경로입니다.</p>
              </div>
              <div className="bg-white border-2 border-slate-200 border-b-4 p-4 rounded-xl hover:-translate-y-1 hover:border-slate-400 transition-colors cursor-pointer group">
                <div className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block mb-2">Option B</div>
                <h4 className="font-black text-slate-800 text-sm mb-1">유지 및 분리 (Stay & Side)</h4>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">현직을 유지하되, 에너지를 분산시켜 다른 블록의 욕구를 해소합니다.</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
