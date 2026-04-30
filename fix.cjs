const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const beforeReturn = `  return (
    <div className="min-h-screen bg-[#111111] text-zinc-100 overflow-hidden relative" style={{ fontFamily: "'Pretendard', sans-serif" }}>`;

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
    <div className="min-h-screen bg-[#111111] text-zinc-100 overflow-hidden relative" style={{ fontFamily: "'Pretendard', sans-serif" }}>`;

code = code.replace(beforeReturn, activeVars);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
