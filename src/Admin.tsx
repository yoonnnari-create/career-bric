import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { isAdmin } from './lib/admin';

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 첫 로딩 시 현재 세션 확인 (새로고침 시 로그인 유지)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. 로그인 상태 변화 감지 (로그인/로그아웃 시 상태 즉각 반영)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
  };

  // 로딩 중 화면
  if (loading) {
    return <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white">로딩 중...</div>;
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
  if (!isAdmin(session.user.email)) {
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
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400">
          <p className="mb-2 text-lg text-white font-bold">환영합니다, 관리자님! 👋</p>
          <p>여기에 전체 사용자 목록, 통계 등 어드민 기능이 추가될 예정입니다.</p>
        </div>
      </div>
    </div>
  );
}
