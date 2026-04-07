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

  const addParticle = (e) => {
    const id = Date.now();
    setParticles(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 800);
  };

  const startThreeCardSpread = () => {
    if (!question.trim()) return alert("喵。两脚兽，你不告诉我猫主子做了什么，我怎么通灵？");
    const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5).slice(0, 3)
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

  const getAIReading = async () => {
    if (flippedCards.length < 3) return alert("把三张牌都翻开。猫主子的心事很复杂的喵。");
    setLoading(true);
    setReading(""); 

    try {
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      const cardDetails = selectedCards.map((c, i) => {
        const pos = ["它的动机", "它的感受", "它想对你说的话"][i]; // 针对养猫场景优化位次含义
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
              content: "你是一位专门解读猫咪心理的塔罗大师。用户是养猫的人（两脚兽），他们会描述猫的行为。你需要通过三张牌（分别对应猫的原始动机、当下的真实感受、以及它想传达给主人的话）来解释猫的心理。语气要像一只看透一切的老猫，傲娇、直白、幽默但不发嗲。结尾给一个“小鱼干建议”喵。" 
            },
            { 
              role: "user", 
              content: `两脚兽描述的猫咪行为：${question}。抽到的三张牌是：${cardDetails}。请翻译出主子的内心独白。` 
            }
          ],
          temperature: 0.8
        })
      });

      const data = await response.json();
      setReading(data.choices[0].message.content);
    } catch (err) {
      setReading("啧，连接断了。可能是我在拨弄网线喵。检查一下配置吧。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9FB] flex flex-col items-center p-4 sm:p-6 font-sans text-[#5A4A4A] relative overflow-hidden" onClick={addParticle}>
      
      {particles.map(p => (
        <motion.div key={p.id} initial={{ opacity: 1, scale: 0.5 }} animate={{ opacity: 0, scale: 1.5, y: -20 }} className="fixed pointer-events-none z-50 text-[#FFD1DC]" style={{ left: p.x - 15, top: p.y - 15 }}>
          <PawPrint size={30} fill="currentColor" />
        </motion.div>
      ))}

      <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mt-4 mb-8">
        <div className="flex items-center justify-center gap-2">
          <PawPrint className="text-[#FFD1DC]" size={36} fill="#FFD1DC" />
          <h1 className="text-3xl sm:text-4xl font-black text-[#D4A5A5] tracking-tight">猫猫心意塔罗</h1>
          <Heart className="text-[#FFD1DC]" size={28} fill="#FFD1DC" />
        </div>
        <p className="text-[#D4A5A5]/60 text-xs mt-2 font-bold italic tracking-widest uppercase">—— 翻译主子的每一个眼神与肉垫 ——</p>
      </motion.div>

      <main className="w-full max-w-2xl z-10">
        <AnimatePresence mode="wait">
          
          {stage === 'input' ? (
            <motion.div key="input" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white p-8 sm:p-10 rounded-[50px] shadow-[0_20px_60px_rgba(255,209,220,0.3)] border-4 border-[#FFD1DC]">
              <Cloud className="absolute -top-6 -left-6 text-[#E6E6FA] opacity-40" size={80} />
              <Stars className="absolute -bottom-4 -right-4 text-[#FFF4BD] opacity-60" size={50} />
              
              <div className="mb-8">
                <label className="flex items-center justify-center sm:justify-start gap-2 text-xl font-black text-[#D4A5A5] mb-4">
                  <MessageSquare size={22} /> 描述一下猫主子的反常行为...
                </label>
                <textarea 
                  className="w-full bg-[#FFFDFE] border-4 border-[#FFD1DC] rounded-[25px] p-5 focus:outline-none focus:border-[#D4A5A5] transition-all text-lg text-[#5A4A4A] placeholder-[#FFD1DC] shadow-inner resize-none"
                  placeholder="例如：它为什么盯着空无一物的墙角发出咕噜声？喵。"
                  rows="4"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <button onClick={startThreeCardSpread} className="w-full bg-[#FFD1DC] hover:bg-[#D4A5A5] text-white font-black py-5 rounded-full shadow-lg transition-all active:scale-95 text-xl tracking-widest">
                解读主子心声 🔮
              </button>
            </motion.div>
          ) : (
            
            <motion.div key="shuffle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
              <button onClick={() => setStage('input')} className="flex items-center gap-2 text-[#D4A5A5] font-black mb-8 hover:underline text-sm">
                <ChevronLeft size={18} /> 换个行为再测
              </button>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-12 perspective-1000">
                {selectedCards.map((card, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <span className="text-[10px] font-black text-[#D4A5A5] bg-white px-3 py-1 rounded-full border border-[#FFD1DC] uppercase tracking-tighter">
                      {["动机", "感受", "想说的话"][i]}
                    </span>
                    <div onClick={() => handleFlip(i)} className="relative w-28 h-48 sm:w-40 sm:h-64 cursor-pointer transition-all duration-700" style={{ transformStyle: 'preserve-3d', transform: flippedCards.includes(i) ? 'rotateY(180deg)' : 'none' }}>
                      <div className="absolute inset-0 backface-hidden shadow-xl rounded-2xl border-[6px] border-white overflow-hidden ring-1 ring-[#FFD1DC]">
                        <img src="/card-back.png" className="w-full h-full object-cover" alt="Back" />
                      </div>
                      <div className="absolute inset-0 backface-hidden shadow-xl rounded-2xl border-[6px] border-white bg-white flex flex-col overflow-hidden" style={{ transform: 'rotateY(180deg)' }}>
                        <img src={`/cards/${card.id}.png`} className={`w-full h-full object-cover ${card.reversed ? 'rotate-180' : ''}`} alt={card.name} />
                        <div className="absolute bottom-0 w-full bg-white/95 py-1 text-center border-t border-[#FFD1DC]/20">
                          <span className="text-[10px] sm:text-xs font-black text-[#5A4A4A]">{card.name}</span>
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
                  {loading ? "正在窃听猫咪脑回路..." : "查看主子解释"}
                </button>
              )}

              {reading && (
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[35px] p-7 sm:p-9 mt-8 shadow-2xl border-l-[12px] border-[#E6E6FA] relative mb-12">
                  <Gift className="absolute -top-5 -right-3 text-[#FFD1DC] rotate-12" size={36} />
                  <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap text-[#5A4A4A] font-medium italic">
                    {reading}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="mt-auto pt-10 text-[10px] text-[#D4A5A5]/40 font-bold tracking-[0.2em]">
        TRANSLATING MEOWS SINCE 2026
      </div>

      <style>{`
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .perspective-1000 { perspective: 1200px; }
      `}</style>
    </div>
  );
}