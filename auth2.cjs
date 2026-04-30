const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Normalize line endings to LF
code = code.replace(/\r\n/g, '\n');

const oldAuthLogic = `  useEffect(() => {
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
  };`;

const newAuthLogic = `  useEffect(() => {
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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) {
      setAuthError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    
    setIsAuthLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setAuthError('회원가입이 완료되었습니다! (혹시 넘어가지 않으면 다시 로그인해주세요)');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setAuthError(error.message === 'Invalid login credentials' ? '이메일 또는 비밀번호가 올바르지 않습니다.' : error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setStep(1);
    setHasStarted(false);
    setIsOnboarded(false);
    setTheme(null);
    setMessages([]);
    setChatTurn(0);
  };`;

code = code.replace(oldAuthLogic, newAuthLogic);

const oldAuthForm = `                    {/* Auth Form Section */}
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
                    </div>`;

const newAuthForm = `                    {/* Auth Form Section */}
                    <div className="w-full max-w-md bg-zinc-900/80 p-8 rounded-3xl border border-zinc-800 shadow-2xl backdrop-blur-sm flex flex-col gap-4 relative mx-auto">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        안전한 데이터 보관
                      </div>
                      <h3 className="text-2xl font-black mb-2 mt-2">{isSignUp ? '간편 회원가입' : '간편 로그인'}</h3>
                      <p className="text-sm text-zinc-400 mb-6">내 계정에 접속하여 작성한 내용을 영구 보관하세요.</p>
                      
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
                            placeholder="이메일 주소"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>

                        <div className="text-left space-y-1 mb-4">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Password</label>
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호 (6자리 이상)"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={isAuthLoading || !email || !password}
                          className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-500 transition-all active:scale-95 shadow-lg shadow-purple-600/30 flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                          {isAuthLoading ? <span className="animate-pulse">처리 중...</span> : (isSignUp ? '가입하고 시작하기' : '로그인하고 시작하기')}
                        </button>
                      </form>

                      <div className="mt-4 text-sm text-zinc-400">
                        {isSignUp ? '이미 계정이 있으신가요? ' : '아직 계정이 없으신가요? '}
                        <button 
                          type="button"
                          onClick={() => setIsSignUp(!isSignUp)}
                          className="text-purple-400 font-bold hover:underline"
                        >
                          {isSignUp ? '로그인하기' : '회원가입하기'}
                        </button>
                      </div>
                    </div>`;

code = code.replace(oldAuthForm, newAuthForm);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log('Is new logic in code?', code.includes('supabase.auth.getSession()'));
