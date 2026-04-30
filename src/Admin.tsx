import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { isAdmin } from './lib/admin';

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
    // 1. 첫 로딩 시 현재 세션 확인 (새로고침 시 로그인 유지)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        checkAdminStatus(session.user.email);
      } else {
        setLoading(false);
      }
    });

    // 2. 로그인 상태 변화 감지 (로그인/로그아웃 시 상태 즉각 반영)
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
      setSubmissions(data);
    }
    setLoadingSubmissions(false);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 로그인 완료 후 다시 /admin 페이지로 돌아오도록 설정
        redirectTo: window.location.origin + '/admin',
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAdminStatus(null);
    window.location.replace('/'); // 로그아웃 후 뒤로가기 방지를 위해 replace 사용
  };

  // 로딩 중 화면
  if (loading) {
    return <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white">권한 확인 중...</div>;
  }

  // 비로그인 상태 화면
  if (!session) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-black mb-8">관리자 로그인</h1>
        <button
          onClick={handleLogin}
          className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 로그인
        </button>
      </div>
    );
  }

  // 로그인 했지만 관리자가 아닌 경우 (화이트리스트 통과 실패)
  if (adminStatus === false) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold text-red-500 mb-4">접근 권한이 없습니다</h1>
        <p className="text-zinc-400 mb-8 text-center">
          등록된 관리자 계정이 아닙니다.<br />
          <span className="text-zinc-500 text-sm mt-2 block">현재 로그인된 계정: {session.user.email}</span>
        </p>
        <button
          onClick={handleLogout}
          className="bg-zinc-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-zinc-700 transition-colors"
        >
          로그아웃 후 다른 계정으로 시도
        </button>
      </div>
    );
  }

  // 로그인 성공 & 관리자 권한 확인됨
  const themeStats = submissions.reduce((acc, curr) => {
    const theme = curr.theme || '미지정';
    acc[theme] = (acc[theme] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalSubmissions = submissions.length;

  return (
    <div className="min-h-screen bg-[#111111] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-800">
          <h1 className="text-3xl font-black">관리자 페이지</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400 hidden sm:inline-block">{session.user.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-500/10 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors font-bold"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 대시보드 통계 섹션 */}
        {!loadingSubmissions && submissions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">현황 요약</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg hover:border-zinc-700 transition-colors">
                <span className="text-sm text-zinc-400 font-bold mb-2">총 제출 건수</span>
                <span className="text-4xl font-black text-white">{totalSubmissions}</span>
              </div>
              {Object.entries(themeStats).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([theme, count]) => (
                <div key={theme} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg hover:border-purple-500/30 transition-colors">
                  <span className="text-sm text-zinc-400 font-bold mb-2">{theme} 테마</span>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-purple-400">{count as number}</span>
                    <span className="text-zinc-500 font-bold mb-1">건</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">사용자 답변 기록</h2>
            <button 
              onClick={fetchSubmissions}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors border border-zinc-700"
            >
              새로고침
            </button>
          </div>
          
          {loadingSubmissions ? (
            <p className="text-zinc-400 text-center py-8">데이터를 불러오는 중...</p>
          ) : submissions.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">아직 등록된 답변이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                    <div>
                      <span className="inline-block bg-purple-500/20 text-purple-400 text-xs font-bold px-2.5 py-1 rounded-md mb-2">
                        {sub.theme} 테마
                      </span>
                      <h3 className="font-bold text-white text-lg">
                        {sub.profile?.name || '익명'} 
                        <span className="text-sm font-normal text-zinc-500 ml-2">({sub.user_email})</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {sub.profile?.year} / {sub.profile?.concern} / MBTI: {sub.profile?.mbti ? Object.values(sub.profile.mbti).join('') : '알 수 없음'}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                      {new Date(sub.created_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  
                  <div className="bg-zinc-900/80 p-4 rounded-lg text-sm text-zinc-300 space-y-3 border border-zinc-800/50">
                    {sub.messages?.filter((m: any) => m.role === 'user').map((msg: any, i: number) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-emerald-400 font-black shrink-0">A.</span>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
