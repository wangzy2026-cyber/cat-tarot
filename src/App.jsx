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
  const [stage, setStage] = useState('input'); // input, shuffle
  const [selectedCards, setSelectedCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [reading, setReading] = useState('');
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  // 1. 点击特效：粉色小猫爪
  const addParticle = (e) => {
    const id = Date.now();
    setParticles(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 800);
  };

  // 2. 抽牌初始化
  const startShuffle = (count) => {
    if (!question.trim()) return alert("喵呜！两脚兽还没写下心事呢~");
    const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5).slice(0, count)
      .map(c => ({ ...c, reversed: Math.random() > 0.5 }));
    setSelectedCards(shuffled);
    setFlippedCards([]);
    setReading('');
    setStage('shuffle');
  };

  // 3. 翻牌逻辑
  const handleFlip = (index) => {
    if (!flippedCards.includes(index)) {
      setFlippedCards([...flippedCards, index]);
    }
  };

  // 4. DeepSeek 核心接口调用
  const getAIReading = async () => {
    if (flippedCards.length < selectedCards.length) return alert("请先把所有牌翻开喵！");
    
    setLoading(true);
    setReading(""); 

    try {
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      if (!apiKey || apiKey.includes('YOUR_API_KEY')) {
        throw new Error("MISSING_KEY");
      }

      const cardDetails = selectedCards.map(c => `${c.name}${c.reversed ? '(逆位)' : '(正位)'}`).join('、');
      
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "你是一位精通猫语的塔罗占卜师，语气治愈、傲娇且温馨。称呼用户为“两脚兽”，多用“喵”作为语气词。" },
            { role: "user", content: `两脚兽的问题：${question}。抽到的牌面：${cardDetails}。请给出心意解读和小鱼干建议。` }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "API_ERROR");
      }

      const data = await response.json();
      setReading(data.choices[0].message.content);
    } catch (err) {
      console.error("猫猫出错啦:", err);
      if (err.message === "MISSING_KEY") {
        setReading("喵呜... 没找到 API Key！请检查项目根目录的 .env 文件，确保有 VITE_DEEPSEEK_API_KEY=你的key 这一行。");
      } else {
        setReading("喵... 信号断掉了。可能是由于：\n1. DeepSeek 余额不足喵\n2. 网络被猫毛堵住了\n3. API Key不正确喵！");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9FB] flex flex-col items-center p-6 font-sans text-[#5A4A4A] relative overflow-hidden" onClick={addParticle}>
      
      {/* 粒子层 */}
      {particles.map(p => (
        <motion.div key={p.id} initial={{ opacity: 1, scale: 0.5 }} animate={{ opacity: 0, scale: 1.5, y: -20 }} className="fixed pointer-events-none z-50 text-[#FFD1DC]" style={{ left: p.x - 15, top: p.y - 15 }}>
          <PawPrint size={30} fill="currentColor" />
        </motion.div>
      ))}

      {/* 标题栏 */}
      <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mt-6 mb-10">
        <div className="flex items-center justify-center gap-3">
          <PawPrint className="text-[#FFD1DC]" size={40} fill="#FFD1DC" />
          <h1 className="text-4xl font-black text-[#D4A5A5] tracking-tight">猫猫心意塔罗</h1>
          <Heart className="text-[#FFD1DC]" size={32} fill="#FFD1DC" />
        </div>
        <p className="text-[#D4A5A5]/60 text-sm mt-2 font-bold italic">Listening to the Whispers of Paws</p>
      </motion.div>

      <main className="w-full max-w-xl z-10">
        <AnimatePresence mode="wait">
          
          {/* 阶段 1：云朵输入框 */}
          {stage === 'input' ? (
            <motion.div key="input" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative bg-white p-10 rounded-[60px] shadow-[0_20px_50px_rgba(255,209,220,0.4)] border-4 border-[#FFD1DC]">
              <Cloud className="absolute -top-8 -left-8 text-[#E6E6FA] opacity-50" size={100} />
              <Stars className="absolute -bottom-6 -right-6 text-[#FFF4BD] opacity-80" size={60} />
              
              <div className="mb-8">
                <label className="flex items-center gap-2 text-xl font-black text-[#D4A5A5] mb-4">
                  <MessageSquare size={24} /> 告诉猫猫你的困惑喵...
                </label>
                <textarea 
                  className="w-full bg-[#FFF9FB] border-4 border-[#FFD1DC] rounded-[30px] p-6 focus:outline-none focus:border-[#D4A5A5] transition-all text-lg text-[#5A4A4A] placeholder-[#FFD1DC] shadow-inner"
                  placeholder="例如：为什么猫猫总是在我睡觉时踩我的脸？喵~"
                  rows="4"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-4">
                <button onClick={() => startShuffle(1)} className="bg-[#FFD1DC] hover:bg-[#D4A5A5] text-white font-black py-5 rounded-full shadow-lg transition-all active:scale-95 text-xl">
                  单牌模式 🐾
                </button>
                <button onClick={() => startShuffle(3)} className="bg-white border-4 border-[#D4A5A5] text-[#D4A5A5] font-black py-5 rounded-full hover:bg-[#FFF9FB] transition-all active:scale-95 text-xl">
                  三牌阵法 🔮
                </button>
              </div>
            </motion.div>
          ) : (
            
            /* 阶段 2：翻牌阵 */
            <motion.div key="shuffle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
              <button onClick={() => setStage('input')} className="flex items-center gap-2 text-[#D4A5A5] font-black mb-10 hover:underline">
                <ChevronLeft /> 重新提问
              </button>

              <div className="flex flex-wrap justify-center gap-6 mb-16 perspective-1000">
                {selectedCards.map((card, i) => (
                  <div key={i} onClick={() => handleFlip(i)} className="relative w-36 h-60 cursor-pointer transition-all duration-700" style={{ transformStyle: 'preserve-3d', transform: flippedCards.includes(i) ? 'rotateY(180deg)' : 'none' }}>
                    {/* 卡背 */}
                    <div className="absolute inset-0 backface-hidden shadow-2xl rounded-3xl border-8 border-white overflow-hidden ring-2 ring-[#FFD1DC]">
                      <img src="/card-back.png" className="w-full h-full object-cover" alt="Back" />
                    </div>
                    {/* 卡面 */}
                    <div className="absolute inset-0 backface-hidden shadow-2xl rounded-3xl border-8 border-white bg-white flex flex-col overflow-hidden" style={{ transform: 'rotateY(180deg)' }}>
                      <img src={`/cards/${card.id}.png`} className={`w-full h-full object-cover ${card.reversed ? 'rotate-180' : ''}`} alt={card.name} />
                      <div className="absolute bottom-0 w-full bg-white/90 py-2 text-center border-t border-[#FFD1DC]/30">
                        <span className="text-xs font-black text-[#5A4A4A]">{card.name}</span>
                        {card.reversed && <p className="text-[10px] text-[#D4A5A5] font-bold">逆位</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!reading && (
                <button 
                  onClick={getAIReading} 
                  disabled={loading}
                  className="bg-[#D4A5A5] hover:bg-[#FFD1DC] text-white font-black px-12 py-5 rounded-full shadow-2xl flex items-center gap-3 disabled:opacity-50 transition-all active:scale-95 text-xl"
                >
                  {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                  {loading ? "猫猫通灵中..." : "开启猫语解读"}
                </button>
              )}

              {/* 解读面板 (淡紫色边框云朵) */}
              {reading && (
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[40px] p-8 mt-10 shadow-2xl border-l-[15px] border-[#E6E6FA] relative">
                  <Gift className="absolute -top-6 -right-4 text-[#FFD1DC] rotate-12" size={40} />
                  <p className="text-lg leading-relaxed whitespace-pre-wrap text-[#5A4A4A] font-medium">
                    {reading}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 底部小尾巴装饰 */}
      <div className="fixed bottom-0 right-10 w-32 h-32 opacity-20 pointer-events-none">
        <svg viewBox="0 0 100 100" className="fill-[#FFD1DC] animate-bounce">
          <path d="M10,90 Q30,50 60,80 T90,40" stroke="#FFD1DC" strokeWidth="8" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      <style>{`
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .perspective-1000 { perspective: 1200px; }
      `}</style>
    </div>
  );
}