const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  `import { supabase } from './lib/supabase';`,
  `import { supabase } from './lib/supabase';\n\nconst IconMap: Record<string, any> = { Blocks, Target, Network, Layers, Presentation, Cpu, ArrowRight, Briefcase, Heart, Flame, Lightbulb, Castle, BookOpen, Send, MessageSquare, Bot, Mic, Sparkles, Star, TrendingUp, History };\n`
);

code = code.replace(
  `const [userExperienceLog, setUserExperienceLog] = useState<{theme: string, messages: ChatMessage[]}[]>([]);`,
  `const [userExperienceLog, setUserExperienceLog] = useState<{theme: string, messages: ChatMessage[]}[]>([]);\n  const [generatedBlueprint, setGeneratedBlueprint] = useState<any>(null);`
);

const oldHandleSendMessage = `  const handleSendMessage = () => {
    const inputText = chatInput.trim();
    if (!inputText) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAiTyping(true);
    
    // 단답형(ㅎㅎ, 몰라 등) 입력 방지 및 풍부한 데이터 유도 로직 (30자 미만 컷)
    if (inputText.length < 30) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'ai', 
          text: '방금 적어주신 내용만으로는 단단한 역량 브릭을 구워내기가 조금 아쉽습니다. 😅\\n\\nCareerBrick은 인터뷰가 구체적일수록 훨씬 더 날카롭고 매력적인 결과물을 추출해냅니다. 당시의 상황이나 본인만의 결정적인 액션을 조금만 더 생생하게(최소 30자 이상) 들려주시겠어요?' 
        }]);
        setIsAiTyping(false);
      }, 1200);
      return; // 턴을 넘기지 않고 종료
    }

    const nextTurn = chatTurn + 1;
    setChatTurn(nextTurn);

    setTimeout(() => {
      let aiResponse = '';
      let isComplete = false;

      if (nextTurn === 1) {
        aiResponse = '아까 말씀하신 경험과 완벽하게 이어지네요! (User_Experience_Log에 안전하게 누적되었습니다) 🔥 구체적으로 그때 규모나 수치(예: 2억 예산, 만난 사람 수 등)는 어땠나요? 숫자로 디테일을 더해주세요!';
      } else if (nextTurn === 2) {
        aiResponse = '정말 대단하시네요! 이 맥락도 로그에 추가했습니다. 그 상황을 해결하기 위해 님만이 했던 "무식하지만 확실한 행동" 하나만 더 들려주시겠어요?';
      } else {
        aiResponse = '완벽합니다! 👏👏 지금까지의 모든 대화가 User_Experience_Log에 저장되었습니다. 이제 이 조각들을 모아 최종 렌더링 단계로 넘어갈 준비가 되었습니다. 하단의 버튼을 눌러주세요!';
        isComplete = true;
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: aiResponse, isComplete }]);
      setIsAiTyping(false);
    }, 1500); // 1.5초 타이핑 딜레이
  };`;

const newHandleSendMessage = `  const handleSendMessage = async () => {
    const inputText = chatInput.trim();
    if (!inputText) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setChatInput('');
    setIsAiTyping(true);
    
    if (inputText.length < 30) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'ai', 
          text: '방금 적어주신 내용만으로는 단단한 역량 브릭을 구워내기가 조금 아쉽습니다. 😅\\n\\nCareerBrick은 인터뷰가 구체적일수록 훨씬 더 날카롭고 매력적인 결과물을 추출해냅니다. 당시의 상황이나 본인만의 결정적인 액션을 조금만 더 생생하게(최소 30자 이상) 들려주시겠어요?' 
        }]);
        setIsAiTyping(false);
      }, 1200);
      return; 
    }

    const nextTurn = chatTurn + 1;
    setChatTurn(nextTurn);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          profile,
          chatHistory: newMessages
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch AI response');
      
      const isComplete = nextTurn >= 3;
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'ai', 
        text: data.reply + (isComplete ? '\\n\\n💡 완벽합니다! 👏👏 여기까지의 이야기만으로도 충분히 훌륭한 브릭을 추출할 수 있습니다. 하단의 버튼을 눌러주세요.' : ''), 
        isComplete 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'ai', 
        text: 'AI 응답을 생성하는 중 오류가 발생했습니다. 환경 변수를 확인해주세요.',
        isComplete: false
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };`;

code = code.replace(oldHandleSendMessage, newHandleSendMessage);

const oldHandleNextStep = `  const handleNextStep = (nextStep: number) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(nextStep);
    }, 1500);
  };`;

const newHandleNextStep = `  const handleNextStep = async (nextStep: number) => {
    if (nextStep === 2) {
      setIsProcessing(true);
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, userExperienceLog })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Generation failed');
        
        setGeneratedBlueprint(data);
        setStep(nextStep);
      } catch (error) {
        console.error(error);
        alert('포트폴리오 생성 중 오류가 발생했습니다.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setStep(nextStep);
      }, 500);
    }
  };`;

code = code.replace(oldHandleNextStep, newHandleNextStep);

const beforeReturn = `  return (
    <div className="min-h-screen`;

const activeVars = `  const activeBlocks = generatedBlueprint?.skills || ALL_BLOCKS;
  const activeBlocksByCategory = generatedBlueprint ? {
    Core: activeBlocks.filter((b: any) => b.type === 'Core'),
    Network: activeBlocks.filter((b: any) => b.type === 'Network'),
    Action: activeBlocks.filter((b: any) => b.type === 'Action'),
    Future: activeBlocks.filter((b: any) => b.type === 'Future')
  } : BLOCKS_BY_CATEGORY;
  
  const activeBridgeData = generatedBlueprint?.bridgeBuilderData || BRIDGE_BUILDER_DATA;
  const activeWriterData = generatedBlueprint?.careerWriterData || getCareerWriterData(profile.concern);

  return (
    <div className="min-h-screen`;

code = code.replace(beforeReturn, activeVars);

code = code.replace(/BLOCKS_BY_CATEGORY/g, `activeBlocksByCategory`);
code = code.replace(/BRIDGE_BUILDER_DATA/g, `activeBridgeData`);
code = code.replace(/getCareerWriterData\(profile\.concern\)/g, `activeWriterData`);
code = code.replace(/<block\.icon size=\{20\} strokeWidth=\{2\.5\} \/>/g, `{(() => { const Icon = typeof block.icon === 'string' ? (IconMap[block.icon] || Target) : block.icon; return <Icon size={20} strokeWidth={2.5} />; })()}`);

code = code.replace(`const activeBlocksByCategory = {`, `const BLOCKS_BY_CATEGORY = {`);
code = code.replace(`const activeBridgeData = {`, `const BRIDGE_BUILDER_DATA = {`);
code = code.replace(`const activeWriterData = (concern: string) => {`, `const getCareerWriterData = (concern: string) => {`);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
