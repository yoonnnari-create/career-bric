import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { isAdmin } from './lib/admin';
import { Box, Map, ShieldAlert, Heart, Zap, Activity, Grid, LogOut, Hexagon } from 'lucide-react';

const CORE_ICONS: Record<string, any> = {
  stability: ShieldAlert,
  meaning: Heart,
  mastery: Zap,
  autonomy: Activity
};

const CORE_NAMES: Record<string, string> = {
  stability: '생존과 안정성',
  meaning: '의미와 연결',
  mastery: '성취와 전문성',
  autonomy: '자율성과 회복'
};

const BlockStuds = ({ bg, border }: { bg: string, border: string }) => (
  <div className="absolute -top-[8px] left-4 flex gap-2 z-0 pointer-events-none">
    {[1, 2, 3].map(i => (
      <div key={i} className="relative w-6 h-[8px]">
        <div className={`absolute top-[2px] w-6 h-[6px] rounded-b-sm border-b-2 border-r-2 ${bg} ${border}`}></div>
        <div className={`absolute top-0 w-6 h-[4px] rounded-[50%] border-t border-l border-white/30 ${bg}`}></div>
      </div>
    ))}
  </div>
);

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const checkAdminStatus = async (email: string) => {
    setLoading(true);
    const status = await isAdmin(email);
    setAdminStatus(status);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        checkAdminStatus(session.user.email);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) {
        checkAdminStatus(session.user.email);
      } else {
        setAdminStatus(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (adminStatus === true) {
      fetchSubmissions();
    }
  }, [adminStatus]);

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    const { data, error } = await supabase
      .from('workbook_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      // Filter out only lifebric submissions if needed, or just show all
      setSubmissions(data.filter((s: any) => s.profile?.type === 'lifebric_canvas' || s.theme));
    }
    setLoadingSubmissions(false);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/admin' },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAdminStatus(null);
    window.location.replace('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">권한 확인 중...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-12 rounded-3xl border-[4px] border-b-[12px] border-r-[8px] border-slate-300 shadow-2xl text-center relative max-w-md w-full">
          <BlockStuds bg="bg-white" border="border-slate-300" />
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 text-white rounded-2xl mb-6 shadow-md border-b-4 border-indigo-900">
            <Hexagon size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">관리자 로그인</h1>
          <p className="text-slate-500 font-bold mb-8">Lifebric 백오피스에 접근합니다.</p>
          <button
            onClick={handleLogin}
            className="w-full bg-slate-800 text-white px-6 py-4 rounded-xl font-black hover:bg-slate-700 transition-colors flex items-center justify-center gap-3 border-b-[6px] border-slate-950 active:border-b-0 active:translate-y-[6px]"
          >
            Google 계정으로 로그인
          </button>
        </div>
      </div>
    );
  }

  if (adminStatus === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-2xl border-[3px] border-b-[8px] border-r-[6px] border-rose-300 shadow-xl relative max-w-md w-full">
           <BlockStuds bg="bg-white" border="border-rose-300" />
           <h1 className="text-2xl font-black text-rose-600 mb-4">접근 권한 없음</h1>
           <p className="text-slate-500 font-bold mb-8">
             등록된 관리자 계정이 아닙니다.<br />
             <span className="text-slate-400 text-sm mt-2 block">현재 로그인: {session.user.email}</span>
           </p>
           <button onClick={handleLogout} className="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-black border-b-4 border-slate-300 active:border-b-0 active:translate-y-[4px]">
             다른 계정으로 시도
           </button>
        </div>
      </div>
    );
  }

  const themeStats = submissions.reduce((acc, curr) => {
    const theme = CORE_NAMES[curr.theme] || curr.theme || '미지정';
    acc[theme] = (acc[theme] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans selection:bg-indigo-100 pb-32" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12 bg-white p-6 rounded-2xl border-[3px] border-b-[8px] border-r-[6px] border-slate-300 shadow-lg relative">
          <BlockStuds bg="bg-white" border="border-slate-300" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-inner"><Box size={24} /></div>
            <h1 className="text-2xl font-black text-slate-800">Lifebric Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hidden md:block">{session.user.email}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm bg-rose-100 text-rose-600 px-4 py-2 rounded-xl hover:bg-rose-200 font-black transition-colors border-b-4 border-rose-300 active:border-b-0 active:translate-y-[4px]">
              <LogOut size={16} /> 로그아웃
            </button>
          </div>
        </header>

        {/* Dashboard Stats */}
        {!loadingSubmissions && submissions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><Grid size={20} className="text-indigo-600"/> 데이터 요약 (Core Brick 통계)</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-indigo-600 text-white border-[3px] border-b-[8px] border-r-[6px] border-indigo-900 p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg relative">
                <BlockStuds bg="bg-indigo-600" border="border-indigo-900" />
                <span className="text-xs font-black text-indigo-200 mb-1">총 캔버스</span>
                <span className="text-4xl font-black">{submissions.length}</span>
              </div>
              {Object.entries(themeStats).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([theme, count]) => (
                <div key={theme} className="bg-white border-[3px] border-b-[6px] border-r-[4px] border-slate-300 p-5 rounded-xl flex flex-col items-center justify-center shadow-md relative">
                  <span className="text-xs font-black text-slate-500 mb-1">{theme}</span>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-slate-800">{count as number}</span>
                    <span className="text-slate-400 font-bold mb-1">건</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Submissions List */}
        <div className="bg-white border-[4px] border-b-[12px] border-r-[8px] border-slate-300 rounded-3xl p-8 relative shadow-xl">
          <BlockStuds bg="bg-white" border="border-slate-300" />
          <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-100">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Map size={24} className="text-indigo-500"/> 유저 캔버스 기록</h2>
            <button 
              onClick={fetchSubmissions}
              className="text-sm font-black bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors border-b-4 border-slate-300 active:border-b-0 active:translate-y-[4px]"
            >
              새로고침
            </button>
          </div>
          
          {loadingSubmissions ? (
            <div className="flex justify-center py-20"><div className="animate-spin text-indigo-500"><Hexagon size={48} /></div></div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-20">
               <div className="bg-slate-100 w-24 h-24 rounded-2xl mx-auto flex items-center justify-center text-slate-300 border-b-8 border-slate-200 mb-4"><Box size={40}/></div>
               <p className="text-slate-500 font-bold">아직 제출된 캔버스가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map((sub) => {
                const CoreIcon = CORE_ICONS[sub.theme] || Box;
                const coreName = CORE_NAMES[sub.theme] || sub.theme || '미지정';
                const bricks = Array.isArray(sub.messages) ? sub.messages : [];
                
                return (
                  <div key={sub.id} className="bg-slate-50 border-2 border-b-[6px] border-r-[4px] border-slate-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all relative">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-xs font-black px-3 py-1.5 rounded-lg border-b-2 border-indigo-200">
                            <CoreIcon size={14} /> Core: {coreName}
                          </span>
                          <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">
                            블록 {bricks.length}개
                          </span>
                        </div>
                        <h3 className="font-black text-slate-800 text-lg">
                          {sub.profile?.name || '익명'} 
                          <span className="text-sm font-bold text-slate-500 ml-2">({sub.user_email})</span>
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border-2 border-slate-100 shadow-sm whitespace-nowrap">
                        {new Date(sub.created_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    
                    {/* Bricks rendering */}
                    {bricks.length > 0 ? (
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                         {bricks.map((brick: any, i: number) => (
                           <div key={i} className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 shadow-sm">
                             <div className="text-xs font-black text-slate-400 mb-1">{brick.label || brick.type}</div>
                             <div className="text-sm font-bold text-slate-700">{brick.content || '(내용 없음)'}</div>
                           </div>
                         ))}
                       </div>
                    ) : (
                      <div className="text-sm text-slate-400 font-bold p-4 bg-white rounded-xl border border-slate-200 border-dashed">캔버스 데이터가 없습니다. (구버전 데이터)</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
