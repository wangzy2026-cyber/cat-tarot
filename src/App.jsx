import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint, Heart, Sparkles, Cloud, Stars, Gift, RefreshCw, ChevronLeft, MessageSquare } from 'lucide-react';

const MAJOR_ARCANA = [
  { id: 0, name: '愚者' }, { id: 1, name: '魔术师' }, { id: 2, name: '女祭司' }, { id: 3, name: '皇后' },
  { id: 4, name: '皇帝' }, { id: 5, name: '教皇' }, { id: 6, name: '恋人' }, { id: 7, name: '战车' },
  { id: 8, name: '力量' }, { id: 9, name: '隐士' }, { id: 10, name: '命运之轮' }, { id: 11, name: '正义' },
  { id: 12, name: '倒吊人' }, { id: 13, name: '死神' }, { id: 14, name: '节制' }, { id: 15, name: '恶魔' },
  { id: 16, name: '高塔' }, { id: 17, name: '星星' }, { id: 18, name: '月亮' }, { id: 19, name: '太阳' },
  { id: 20, name: '审判' }, { id: 21, name: '世界' }
];

export default function CatTarotApp() {
  const [question, setQuestion] = useState('');
  const [stage, setStage] = useState('input');
  const [selectedCards, setSelectedCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [reading, setReading] = useState('');
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  // 1. 点击特效：淡粉色小猫爪
  const addParticle = (e) => {
    const id = Date.now();
    setParticles(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 800);
  };

  // 2. 开启三牌阵法
  const startThreeCardSpread = () => {
    if (!question.trim()) return alert("喵。两脚兽还没写下心事，我看不见你的因果。");
    const shuffled = [...MAJOR_ARCANA]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => ({ ...c, reversed: Math.random() > 0.5 }));
    
    setSelectedCards(shuffled);
    setFlippedCards([]);
    setReading('');
    setStage('shuffle');
  };

  const handleFlip = (index) => {
    if (!flippedCards.includes(index)) {
      setFlippedCards([...flippedCards, index]);
    }
  };

  // 3. AI 调用逻辑：成熟、傲娇、不嗲的语气
  const getAIReading = async () => {
    if (flippedCards.length < 3) return alert("把三张牌都翻开。真相需要完整的碎片喵。");
    
    setLoading(true);
    setReading(""); 

    try {
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      const cardDetails = selectedCards.map((c, i) => {
        const pos = ["过去", "现在", "未来"][i];
        return `${pos}：${c.name}${c.reversed ? '(逆位)' : '(正位)'}`;
      }).join('；');
      
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { 
              role: "system", 
              content: "你是一位活了几百年的资深猫猫占卜师。你称呼用户为“两脚兽”，语气自然、简洁、带点看穿世俗的傲娇。你会根据过去、现在、未来三张牌给出直球且有洞察力的解读，不要过度卖萌或发嗲。结尾请给出一个实用的“小鱼干建议”喵。" 
            },
            { 
              role: "user", 
              content: `两脚兽的问题：${question}。抽到的三张牌是：${cardDetails}。请给出简练的解读。` 
            }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      setReading(data.choices[0].message.content);
    } catch (err) {
      setReading("啧，信号断了。可能是因为我刚才打了个哈欠。检查一下 Key 吧两脚兽。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9FB] flex flex-col items-center p-4 sm:p-6 font-sans text-[#5A4A4A] relative overflow-hidden" onClick={addParticle}>
      
      {/* 粒子层 */}
      {particles.map(p => (
        <motion.div key={p.id} initial={{ opacity: 1, scale: 0.5 }} animate={{ opacity: 0, scale: 1.5, y: -20 }} className="fixed pointer-events-none z-50 text-[#FFD1DC]" style={{ left: p.x - 15, top: p.y - 15 }}>
          <PawPrint size={30} fill="currentColor" />
        </motion.div>
      ))}

      {/* 标题 */}
      <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mt-4 mb-8">
        <div className="flex items-center justify-center gap-2">
          <PawPrint className="text-[#FFD1DC]" size={36} fill="#FFD1DC" />
          <h1 className="text-3xl sm:text-4xl font-black text-[#D4A5A5] tracking-tight">猫猫心意塔罗</h1>
          <Heart className="text-[#FFD1DC]" size={28} fill="#FFD1DC" />
        </div>
        <p className="text-[#D4A5A5]/60 text-xs mt-2 font-bold italic tracking-widest uppercase">The Wisdom of Ancient Paws</p>
      </motion.div>

      <main className="w-full max-w-2xl z-10">
        <AnimatePresence mode="wait">
          
          {/* 阶段 1：输入云朵 */}
          {stage === 'input' ? (
            <motion.div key="input" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white p-8 sm:p-10 rounded-[50px] shadow-[0_20px_60px_rgba(255,209,220,0.3)] border-4 border-[#FFD1DC]">
              <Cloud className="absolute -top-6 -left-6 text-[#E6E6FA] opacity-40" size={80} />
              <Stars className="absolute -bottom-4 -right-4 text-[#FFF4BD] opacity-60" size={50} />
              
              <div className="mb-8 text-center sm:text-left">
                <label className="flex items-center justify-center sm:justify-start gap-2 text-xl font-black text-[#D4A5A5] mb-4">
                  <MessageSquare size={22} /> 提交你的疑惑...
                </label>
                <textarea 
                  className="w-full bg-[#FFFDFE] border-4 border-[#FFD1DC] rounded-[25px] p-5 focus:outline-none focus:border-[#D4A5A5] transition-all text-lg text-[#5A4A4A] placeholder-[#FFD1DC] shadow-inner resize-none"
                  placeholder="例如：我到底该不该换工作？喵。"
                  rows="4"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <button onClick={startThreeCardSpread} className="w-full bg-[#FFD1DC] hover:bg-[#D4A5A5] text-white font-black py-5 rounded-full shadow-lg transition-all active:scale-95 text-xl tracking-widest">
                开启三牌阵法 🔮
              </button>
            </motion.div>
          ) : (
            
            /* 阶段 2：翻牌展示 */
            <motion.div key="shuffle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
              <button onClick={() => setStage('input')} className="flex items-center gap-2 text-[#D4A5A5] font-black mb-8 hover:underline text-sm">
                <ChevronLeft size={18} /> 重新提问
              </button>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-12 perspective-1000">
                {selectedCards.map((card, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <span className="text-[10px] font-black text-[#D4A5A5] bg-white px-3 py-1 rounded-full border border-[#FFD1DC] uppercase tracking-tighter">
                      {["过去", "现在", "未来"][i]}
                    </span>
                    <div onClick={() => handleFlip(i)} className="relative w-28 h-48 sm:w-40 sm:h-64 cursor-pointer transition-all duration-700" style={{ transformStyle: 'preserve-3d', transform: flippedCards.includes(i) ? 'rotateY(180deg)' : 'none' }}>
                      {/* 卡背 */}
                      <div className="absolute inset-0 backface-hidden shadow-xl rounded-2xl border-[6px] border-white overflow-hidden ring-1 ring-[#FFD1DC]">
                        <img src="/card-back.png" className="w-full h-full object-cover" alt="Back" />
                      </div>
                      {/* 卡面 */}
                      <div className="absolute inset-0 backface-hidden shadow-xl rounded-2xl border-[6px] border-white bg-white flex flex-col overflow-hidden" style={{ transform: 'rotateY(180deg)' }}>
                        <img src={`/cards/${card.id}.png`} className={`w-full h-full object-cover ${card.reversed ? 'rotate-180' : ''}`} alt={card.name} />
                        <div className="absolute bottom-0 w-full bg-white/95 py-1 text-center border-t border-[#FFD1DC]/20">
                          <span className="text-[10px] sm:text-xs font-black text-[#5A4A4A]">{card.name}</span>
                          {card.reversed && <p className="text-[8px] text-[#D4A5A5] font-bold leading-none">逆位</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!reading && (
                <button 
                  onClick={getAIReading} 
                  disabled={loading}
                  className="bg-[#D4A5A5] hover:bg-[#FFD1DC] text-white font-black px-10 py-4 rounded-full shadow-2xl flex items-center gap-3 disabled:opacity-50 transition-all active:scale-95 text-lg"
                >
                  {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                  {loading ? "听取灵界呼唤..." : "猫猫解读"}
                </button>
              )}

              {/* 解读面板 */}
              {reading && (
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[35px] p-7 sm:p-9 mt-8 shadow-2xl border-l-[12px] border-[#E6E6FA] relative mb-12">
                  <Gift className="absolute -top-5 -right-3 text-[#FFD1DC] rotate-12" size={36} />
                  <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap text-[#5A4A4A] font-medium">
                    {reading}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 底部装饰 */}
      <div className="mt-auto pt-10 text-[10px] text-[#D4A5A5]/40 font-bold tracking-[0.2em]">
        PURR-FECTION READING BY CAT TAROT
      </div>

      <style>{`
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .perspective-1000 { perspective: 1200px; }
      `}</style>
    </div>
  );
}