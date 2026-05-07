import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Blocks } from 'lucide-react';

export default function MyPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyData(session.user.id);
    }
  }, [session]);

  const fetchMyData = async (userId: string) => {
    setLoading(true);
    
    // 1. Fetch Profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileData) {
      setProfile(profileData);
    }

    // 2. Fetch Submissions
    const { data: subData } = await supabase
      .from('workbook_submissions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (subData) {
      setSubmissions(subData);
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.replace('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white">데이터를 불러오는 중...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-white p-6 text-center">
        <h1 className="text-3xl font-black mb-4">로그인이 필요합니다</h1>
        <p className="text-zinc-400 mb-8">마이페이지는 워크북을 1회 이상 제출하여 가입된 계정만 이용 가능합니다.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-500 transition-colors"
        >
          메인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-zinc-800">
          <div onClick={() => window.location.href = '/'} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-white text-black flex items-center justify-center rounded-lg shadow-lg group-hover:scale-105 transition-transform">
              <Blocks size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter group-hover:text-purple-400 transition-colors">Lifebric</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">마이페이지</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400 hidden sm:inline-block">{profile?.name || session.user.email}님</span>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-500/10 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors font-bold"
            >
              로그아웃
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6 text-purple-400 border-b border-zinc-800 pb-3">내 프로필</h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-zinc-500 mb-1">이메일</span>
                <span className="font-bold">{session.user.email}</span>
              </div>
              <div>
                <span className="block text-zinc-500 mb-1">닉네임</span>
                <span className="font-bold">{profile?.name || '미등록'}</span>
              </div>
              <div>
                <span className="block text-zinc-500 mb-1">연차</span>
                <span className="font-bold">{profile?.year || '미등록'}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6 text-white border-b border-zinc-800 pb-3 flex items-center justify-between">
              <span>과거 제출 기록</span>
              <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">총 {submissions.length}건</span>
            </h2>
            
            {submissions.length === 0 ? (
              <div className="text-center py-10 text-zinc-500">
                <p>아직 제출된 워크북 기록이 없습니다.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="mt-4 text-purple-400 hover:text-purple-300 font-bold text-sm underline"
                >
                  첫 워크북 작성하러 가기
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {submissions.map((sub) => (
                  <div key={sub.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="inline-block bg-purple-500/20 text-purple-400 text-xs font-bold px-2.5 py-1 rounded-md mb-2">
                          {sub.theme} 테마
                        </span>
                        <span className="ml-3 text-xs text-zinc-500">
                          {new Date(sub.created_at).toLocaleString('ko-KR')}
                        </span>
                      </div>
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
    </div>
  );
}
