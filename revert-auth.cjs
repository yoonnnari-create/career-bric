const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace the auth form back to simple email
const newAuthForm = `                    {/* Auth Form Section */}
                    <div className="w-full max-w-md bg-zinc-900/80 p-8 rounded-3xl border border-zinc-800 shadow-2xl backdrop-blur-sm flex flex-col gap-4 relative mx-auto">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        안전한 데이터 보관
                      </div>
                      <h3 className="text-2xl font-black mb-2 mt-2">빠른 시작하기</h3>
                      <p className="text-sm text-zinc-400 mb-6">테스트 이메일을 입력하면 바로 인터뷰가 시작됩니다.</p>
                      
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

// Find the form using a regex
code = code.replace(/\{\/\* Auth Form Section \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\) : !hasStarted/g, newAuthForm + '\n                  </div>\n                ) : !hasStarted');

// Replace the auth logic
const oldAuthLogicRegex = /  const handleEmailAuth = async \([^]*?setIsAuthLoading\(false\);\n    \}\n  \};/;

const newAuthLogic = `  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email) {
      setAuthError('이메일을 입력해주세요.');
      return;
    }
    
    setIsAuthLoading(true);
    
    try {
      const dummyPassword = 'CareerBrickTest123!';
      // 먼저 가입 시도
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: dummyPassword,
      });
      
      // 이미 존재하는 유저이거나 에러가 났다면 로그인 시도
      if (signUpError) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: dummyPassword,
        });
        if (signInError) throw signInError;
      }
    } catch (error: any) {
      setAuthError('로그인 처리 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };`;

code = code.replace(oldAuthLogicRegex, newAuthLogic);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
