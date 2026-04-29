import { 
  Mail, 
  ArrowRight,
  Phone,
  Target,
  Workflow,
  Zap,
  Network,
  BookOpen,
  Compass,
  ArrowUpRight
} from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-white font-pretendard select-none text-slate-900 leading-relaxed">
      {/* 1. 히어로 섹션 (Name & Headline) */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-48 md:pb-40 bg-[#0f172a]">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]"></div>
        
        <div className="container mx-auto px-6 max-w-5xl relative z-10 text-white text-center md:text-left">
          <div className="animate-fade-in">
            <p className="text-indigo-300 font-bold text-lg md:text-xl mb-4">
              안녕하세요, 공공 문화예술 기획 및 성과관리를 담당하는 실무 운영자 <span className="text-white font-black">윤나리</span>입니다.
            </p>
            <h1 className="text-3xl md:text-5xl font-black leading-[1.2] mb-12 tracking-tight text-white">
              복잡한 프로젝트를 구조화하고 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-black">실행으로 연결하는</span> 실무형 운영기획자
            </h1>
            
            <div className="space-y-6 text-lg md:text-xl text-slate-300 font-medium max-w-3xl border-l-2 border-indigo-500/30 pl-8">
              <p>
                기획의 본질이 현장에서 <span className="text-white font-bold">완성도 있게 구현</span>되는 운영 시스템을 설계해왔습니다.
              </p>
              <p>
                일정, 자료, 커뮤니케이션의 흐름을 통합적으로 관리하며 다수의 이해관계자가 <br className="hidden md:block" />
                최상의 합의점에 도달할 수 있도록 <span className="text-white font-bold">안정적인 운영 환경</span>을 조율합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 핵심 역량 (Core Competencies - Grid Layout) */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col mb-20">
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-900">핵심 역량</h2>
            <div className="w-20 h-2 bg-indigo-600 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <Workflow className="w-6 h-6" />,
                title: "프로젝트 운영 및 실행 관리",
                desc: "전체 일정을 기반으로 세부 실행 계획을 수립하고, 다수 참여자 간의 업무와 역할을 조율하여 목표를 완수합니다.",
                color: "indigo"
              },
              {
                icon: <Network className="w-6 h-6" />,
                title: "이해관계자 조율 및 소통 관리",
                desc: "공공-민간-전문가 등 상이한 입장의 이해관계를 조율하며, 원활한 소통을 통해 프로젝트의 안정성을 확보합니다.",
                color: "purple"
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: "기획 의도의 실무 전환",
                desc: "아이디어가 현장 상황과 행정적 기준에 어긋나지 않도록 구체적인 매뉴얼과 운영 프로세스로 구현합니다.",
                color: "blue"
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "문제 해결 및 운영 개선",
                desc: "운영 중 발생하는 어려운 지점이나 정체 구간을 파악하여 해결하며, 반복 업무를 체계화하여 실행력을 높입니다.",
                color: "rose"
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 p-8 bg-slate-50 rounded-3xl border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-xl transition-all duration-300">
                <div className={`p-4 bg-${item.color}-100 text-${item.color}-600 rounded-2xl h-fit`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                  <p className="text-slate-600 text-base font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2.5 Highlight Case: 문제 해결 역량 */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="flex flex-col mb-16">
            <span className="text-indigo-400 font-bold tracking-widest text-sm mb-3">HIGHLIGHT CASE</span>
            <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
              문서 이면의 '진짜 문제'를 찾기 위해<br />
              현장으로 달려가다
            </h2>
            <div className="w-20 h-2 bg-indigo-500 rounded-full"></div>
            <p className="mt-6 text-slate-300 text-lg max-w-2xl leading-relaxed">
              2억 원 규모의 신규 프로그램 기획 제안 당시, 데스크 리서치에 의존하지 않고 현장 주도적으로 진짜 문제를 정의하고 솔루션을 도출했던 경험입니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-xl mb-6 font-black text-xl">1</div>
              <h3 className="text-xl font-bold mb-3 text-white">현장 주도형 문제 정의</h3>
              <p className="text-slate-400 text-base leading-relaxed">
                과업지시서의 텍스트에 매몰되지 않고, 실제 수행 기관의 담당자를 수소문해 직접 대면하여 프로젝트의 <strong className="text-indigo-300">본질(Root Cause)</strong>을 파악했습니다.
              </p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-xl mb-6 font-black text-xl">2</div>
              <h3 className="text-xl font-bold mb-3 text-white">다각적 이해관계자 조율</h3>
              <p className="text-slate-400 text-base leading-relaxed">
                제주도로 직접 날아가 하루 만에 <strong className="text-indigo-300">총 10명의 핵심 관계자</strong>(발주 5, 유관 3, 운영 2)를 인터뷰하며 상충하는 니즈를 조율했습니다.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-xl mb-6 font-black text-xl">3</div>
              <h3 className="text-xl font-bold mb-3 text-white">End-to-End 솔루션 설계</h3>
              <p className="text-slate-400 text-base leading-relaxed">
                수집된 데이터에 성과관리 노하우를 접목해 <strong className="text-indigo-300">2억 규모의 기획안</strong>을 설계하고, 직접 경쟁 PT 피칭을 완수했습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 프로젝트 이력 (Experience - Vertical Timeline) */}
      <section className="py-28 bg-slate-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-black mb-20 text-slate-900">Experience</h2>
          
          <div className="space-y-8">
            {[
              {
                category: "성과관리",
                title: "국가유산청 궁궐 및 조선왕릉 활용사업 성과관리 체계 구축",
                desc: "3년간 대규모 국가 유산 활용 사업의 성과 분석 데이터의 연속성을 확보했습니다. 지표 설계부터 현장 조사까지 총괄하며 사업의 질적 성장을 지원했습니다.",
                period: "2023 - 2025",
                tag: "국가유산청"
              },
              {
                category: "정책연구",
                title: "서울문화재단 예술청 중장기 발전방안 및 운영 모델 연구",
                desc: "민관 협력 거버넌스 구조를 설계하고 지속 가능한 예술 센터 운영을 위한 실무적 모델을 제언했습니다.",
                period: "2023",
                tag: "서울문화재단"
              },
              {
                category: "교육기획",
                title: "화성시문화관광재단 시민문화활동가 아카데미 총괄 기획 및 운영",
                desc: "누적 200명 이상의 대규모 교육 과정을 현장 중심으로 기획하고 총괄했습니다. 교육 이수 후 실제 프로젝트로 연결되는 구조를 설계했습니다.",
                period: "2024 - 2025",
                tag: "화성시문화관광재단"
              }
            ].map((proj, idx) => (
              <div key={idx} className="group p-8 md:p-10 rounded-[32px] bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-2xl transition-all duration-500">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-md">{proj.tag}</span>
                  <span className="text-xs font-bold text-slate-400 tracking-widest">{proj.period}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-indigo-600 transition-colors">{proj.title}</h3>
                <p className="text-slate-600 text-lg font-medium leading-relaxed max-w-3xl">
                  {proj.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 전략적 역량 고도화 (Left Aligned & 2 Lines) */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col items-start text-left mb-20">
            <h2 className="text-xl md:text-2xl font-black mb-4 text-slate-900 leading-tight max-w-md">
              지속 가능한 성장을 위한 <br />전략적 역량 고도화
            </h2>
            <div className="w-12 h-1.5 bg-indigo-600 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {
                icon: <Compass className="w-8 h-8 text-indigo-600" />,
                title: "생애 설계 모델 연구",
                desc: "전환기 성인을 위한 생애 설계 및 자기 항해 모델을 연구하고 있습니다. 실질적인 변화를 돕는 도구들을 직접 실험하고 검증해가고 있습니다.",
                label: "지식서비스컨설팅 박사 과정"
              },
              {
                icon: <ArrowUpRight className="w-8 h-8 text-indigo-600" />,
                title: "AI PM 역량의 실무 적용",
                desc: "학습 중인 AI 역량을 대규모 사업에 접목할 계획입니다. 평가 결과 취합을 자동화하고 관리 시스템을 구축하여 자원을 절감합니다.",
                label: "KDT AI MVP 프로덕트 매니저 양성과정"
              },
              {
                icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
                title: "변화 관리 및 소통 설계",
                desc: "퍼실리테이션 방법론을 고도화하여 복잡한 사업의 합의 형성을 지원합니다. 데이터 시각화 도구를 활용하여 유의미한 결과물을 도출할 예정입니다.",
                label: "POS 퍼실리테이터 양성과정 161기"
              }
            ].map((item, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-50 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
                <div className="mb-6">{item.icon}</div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">{item.title}</h3>
                <p className="text-slate-600 text-base font-medium mb-8 flex-grow leading-relaxed">{item.desc}</p>
                <div className="pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Contact */}
      <section className="py-28 bg-[#0f172a]">
        <div className="container mx-auto px-6 max-w-5xl text-white">
          <div className="p-10 md:p-16 rounded-[48px] bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
              <div>
                <h2 className="text-3xl md:text-5xl font-black mb-8">Contact</h2>
                <p className="text-indigo-100 text-base md:text-lg font-medium mb-12 max-w-2xl leading-relaxed">
                  복잡한 실무의 문제를 풀고 안정적인 성과를 만들어낼 파트너를 찾으시나요? <br className="hidden md:block" />
                  유연한 소통과 탄탄한 실행력으로 프로젝트의 성공을 돕겠습니다.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-xl font-bold hover:text-indigo-200 transition-colors">
                    <Mail className="w-6 h-6" />
                    <a href="mailto:cloud4242@naver.com">cloud4242@naver.com</a>
                  </div>
                  <div className="flex items-center gap-4 text-xl font-bold hover:text-indigo-200 transition-colors">
                    <Phone className="w-6 h-6" />
                    <a href="tel:010-8669-4205">010-8669-4205</a>
                  </div>
                </div>
              </div>
              
              <a href="mailto:cloud4242@naver.com" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-900 font-black rounded-full hover:scale-105 active:scale-95 transition-all text-xl shadow-lg">
                Message <ArrowRight className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-[#0f172a] text-center text-slate-500 text-sm tracking-widest border-t border-slate-800">
        <p>Copyright &copy; 2026 Yoon Nari. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
