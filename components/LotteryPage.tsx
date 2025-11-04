"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, Trophy, Star, Flame, Crown, Zap, History, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { audioManager } from '../lib/audio';
import { lotteryStorage, settingsStorage, type LotteryResult } from '../lib/storage';
import FireworksCanvas from './FireworksCanvas';

interface ConfettiItem {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
}

const LotteryPage = () => {
  const [numbers, setNumbers] = useState([0, 0, 0, 0, 0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiItem[]>([]);
  const [showFireworks, setShowFireworks] = useState(false);
  const [history, setHistory] = useState<LotteryResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currentState, setCurrentState] = useState<'idle' | 'spinning' | 'result'>('idle');

  // Initialize audio and load settings
  useEffect(() => {
    audioManager.init();
    const settings = settingsStorage.getSettings();
    setSoundEnabled(settings.soundEnabled);
    setTheme(settings.theme === 'light' ? 'light' : 'dark');
    setHistory(lotteryStorage.getHistory());
  }, []);

  // Save result to history when lottery completes
  useEffect(() => {
    if (hasResult) {
      lotteryStorage.addResult(numbers);
      setHistory(lotteryStorage.getHistory());
    }
  }, [hasResult, numbers]);

  // Tạo confetti khi có kết quả
  useEffect(() => {
    if (hasResult) {
      setShowFireworks(true);

      // Tạo 100 particles confetti
      const newConfetti: ConfettiItem[] = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: ['#FFD700', '#FF1493', '#00F5FF', '#FF69B4', '#7B68EE', '#FFA500'][Math.floor(Math.random() * 6)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        rotation: Math.random() * 3600
      }));
      setConfetti(newConfetti);

      // Clear sau 4 giây
      setTimeout(() => {
        setConfetti([]);
        setShowFireworks(false);
      }, 4000);
    }
  }, [hasResult]);

  // Hàm quay số
  const spinLottery = () => {
    if (soundEnabled) {
      audioManager.playClickSound();
      setTimeout(() => audioManager.playSpinSound(), 200);
    }

    setIsSpinning(true);
    setHasResult(false);
    setConfetti([]);

    let counter = 0;
    const interval = setInterval(() => {
      // Random số liên tục
      setNumbers(prev => prev.map(() => Math.floor(Math.random() * 10)));
      counter++;

      // Sau 40 lần thì dừng
      if (counter > 40) {
        clearInterval(interval);
        // Tạo số cuối cùng
        const finalNumbers = Array.from({ length: 5 }, () =>
          Math.floor(Math.random() * 10)
        );
        setNumbers(finalNumbers);
        setIsSpinning(false);
        setHasResult(true);

        // Play win sound
        if (soundEnabled) {
          setTimeout(() => audioManager.playWinSound(), 500);
        }
      }
    }, 150); // Mỗi 150ms đổi số 1 lần
  };

  // Reset về ban đầu
  const reset = () => {
    if (soundEnabled) {
      audioManager.playClickSound();
    }
    setNumbers([0, 0, 0, 0, 0]);
    setHasResult(false);
    setConfetti([]);
  };

  // Toggle sound
  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    settingsStorage.updateSettings({ soundEnabled: newSoundEnabled });
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    settingsStorage.updateSettings({ theme: newTheme });
  };

  // Clear history
  const clearHistory = () => {
    lotteryStorage.clearHistory();
    setHistory([]);
  };

  return (
    <>
      {/* Confetti explosion */}
      {confetti.map(conf => (
        <div
          key={conf.id}
          className="absolute top-0 w-2.5 h-2.5 rounded-sm pointer-events-none"
          style={{
            left: `${conf.left}%`,
            backgroundColor: conf.color,
            transform: `rotate(${conf.rotation}deg)`,
            animation: `confetti ${conf.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${conf.delay}s forwards`,
            boxShadow: `0 0 10px ${conf.color}`
          }}
        />
      ))}

      {/* Fireworks effect */}
      {showFireworks && (
        <>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/4 left-1/2 w-2 h-2 rounded-full"
              style={{
                background: ['#FFD700', '#FF1493', '#00F5FF'][i % 3],
                animation: `firework 1s ease-out ${i * 0.2}s`,
                animationFillMode: 'forwards'
              }}
            />
          ))}
        </>
      )}

      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes firework {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(30); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255,215,0,0.4),
                        0 0 40px rgba(255,105,180,0.3),
                        0 0 60px rgba(138,43,226,0.2),
                        inset 0 0 20px rgba(255,255,255,0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(255,215,0,0.8),
                        0 0 80px rgba(255,105,180,0.6),
                        0 0 120px rgba(138,43,226,0.4),
                        inset 0 0 30px rgba(255,255,255,0.2);
          }
        }
        @keyframes bounce-in {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes rotate-3d {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>

      <div className={`container mx-auto px-4 py-4 h-screen flex flex-col transition-all duration-500 overflow-hidden ${
        theme === 'light'
          ? 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
          : 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
      }`}>
        {/* Header với Logo và Controls */}
        <div
          className="flex items-center justify-between mb-4 "
          style={{ animation: 'slide-up 0.8s ease-out' }}
        >
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
              <Image
                src="/logo.jpg"
                alt="Logo TNTT"
                width={64}
                height={64}
                className={`relative w-16 h-16 rounded-full object-cover border-2 shadow-2xl transform group-hover:scale-110 transition-all duration-300 ${
                  theme === 'light' ? 'border-black' : 'border-white'
                }`}
              />
            </div>
            <div>
              <h2 className={`text-2xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent ${
                theme === 'light' ? 'drop-shadow-lg' : ''
              }`}>
                Đoàn TNTT Phêrô NéRon Bắc GX Phú Cát
              </h2>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              className={`p-3 rounded-full transition-all duration-300 backdrop-blur-sm ${
                theme === 'light'
                  ? 'bg-black/10 hover:bg-black/20'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
            >
              {soundEnabled ? (
                <Volume2 className={theme === 'light' ? 'w-6 h-6 text-black' : 'w-6 h-6 text-white'} />
              ) : (
                <VolumeX className={theme === 'light' ? 'w-6 h-6 text-black/50' : 'w-6 h-6 text-white/50'} />
              )}
            </button>

            <button
              onClick={toggleTheme}
              className={`p-3 rounded-full transition-all duration-300 backdrop-blur-sm ${
                theme === 'light'
                  ? 'bg-black/10 hover:bg-black/20'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title={theme === 'light' ? "Chuyển sang chế độ tối" : "Chuyển sang chế độ sáng"}
            >
              {theme === 'dark' ? (
                <Sun className="w-6 h-6 text-white" />
              ) : (
                <Moon className="w-6 h-6 text-black" />
              )}
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-3 rounded-full transition-all duration-300 backdrop-blur-sm ${
                theme === 'light'
                  ? 'bg-black/10 hover:bg-black/20'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title="Lịch sử quay số"
            >
              <History className={theme === 'light' ? 'w-6 h-6 text-black' : 'w-6 h-6 text-white'} />
            </button>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-5xl">
            {showHistory ? (
              /* History Panel */
              <div
                className="relative backdrop-blur-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-[2.5rem] p-8 md:p-12 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
                style={{ animation: 'bounce-in 1s ease-out' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    📚 Lịch sử quay số
                  </h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 text-white font-semibold"
                  >
                    Quay lại
                  </button>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70 text-lg">Chưa có lịch sử quay số nào</p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 mb-6 max-h-96 overflow-y-auto">
                      {history.map((result, index) => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-white/70 font-mono">#{history.length - index}</span>
                            <div className="flex gap-2">
                              {result.numbers.map((num, i) => (
                                <span
                                  key={i}
                                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm"
                                >
                                  {num}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-white/50 text-sm">{result.date}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-white/70">
                        Tổng số lần quay: <span className="font-bold text-yellow-400">{history.length}</span>
                      </p>
                      <button
                        onClick={clearHistory}
                        className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 hover:text-red-200 transition-all duration-300 font-semibold"
                      >
                        Xóa lịch sử
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Main Lottery Interface */
              <div
                className="relative backdrop-blur-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-[2rem] p-4 md:p-6 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] h-full flex flex-col"
                style={{ animation: 'bounce-in 1s ease-out' }}
              >
                {/* Crown trang trí */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Crown className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
                </div>

                {/* Góc phát sáng */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-tl-[2rem] blur-xl"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-400/20 to-transparent rounded-tr-[2rem] blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-bl-[2rem] blur-xl"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-blue-400/20 to-transparent rounded-br-[2rem] blur-xl"></div>

                {/* Tiêu đề */}
                <div className="text-center mb-4 flex-shrink-0">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-6 h-6 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
                    <h1
                      className="text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent"
                      style={{
                        backgroundSize: '200% auto',
                        animation: 'shimmer 3s linear infinite',
                        filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.3))'
                      }}
                    >
                      VÒNG QUAY
                    </h1>
                    <Flame className="w-6 h-6 text-orange-400 animate-bounce" />
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-2">
                    MAY MẮN
                  </h2>
                  <div className="flex items-center justify-center gap-1">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <p className={`${theme === 'light' ? 'text-black/90' : 'text-white/90'} text-sm font-semibold`}>Khám phá vận may của bạn ngay bây giờ!</p>
                    <Sparkles className="w-4 h-4 text-pink-400" />
                  </div>
                </div>

                {/* Hiển thị số */}
                <div className="flex-1 flex flex-col justify-center mb-4">
                  <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-4 perspective-1000">
                    {numbers.map((num, index) => (
                      <div
                        key={index}
                        className="relative transform-gpu"
                        style={{
                          animation: isSpinning ? `rotate-3d 0.5s linear infinite` : 'none',
                          animationDelay: `${index * 0.1}s`
                        }}
                      >
                        {/* Vòng sáng ngoài */}
                        <div
                          className={`absolute inset-0 rounded-2xl ${hasResult ? 'animate-spin' : ''}`}
                          style={{
                            background: 'conic-gradient(from 0deg, #FFD700, #FF1493, #00F5FF, #FF69B4, #FFD700)',
                            filter: 'blur(8px)',
                            opacity: hasResult ? 0.8 : 0.5,
                            animationDuration: '3s'
                          }}
                        ></div>

                        {/* Thẻ số */}
                        <div
                          className="relative w-16 h-20 md:w-24 md:h-28 rounded-2xl flex items-center justify-center overflow-hidden transform transition-all duration-500"
                          style={{
                            background: isSpinning
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            animation: hasResult ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                            transform: `scale(${isSpinning ? 1.1 : hasResult ? 1.05 : 1})`
                          }}
                        >
                          {/* Hiệu ứng shimmer */}
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            style={{
                              animation: 'shimmer 2s linear infinite',
                              backgroundSize: '200% 100%'
                            }}
                          ></div>

                          <span
                            className="relative text-4xl md:text-6xl font-black text-white"
                            style={{
                              textShadow: '0 0 15px rgba(255,255,255,0.5), 2px 2px 4px rgba(0,0,0,0.5)'
                            }}
                          >
                            {num}
                          </span>

                          {/* Icons góc */}
                          {hasResult && (
                            <>
                              <Trophy className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 animate-bounce" />
                              <Zap className="absolute -bottom-1 -left-1 w-5 h-5 text-cyan-300 animate-pulse" />
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Banner kết quả */}
                  {hasResult && (
                    <div
                      className="relative overflow-hidden rounded-2xl p-4 mb-4"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                        animation: 'bounce-in 0.6s ease-out',
                        boxShadow: '0 0 40px rgba(102, 126, 234, 0.6)'
                      }}
                    >
                      <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                      <div className="relative text-center">
                        <Trophy className="w-10 h-10 text-yellow-300 mx-auto mb-2 animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" />
                        <h3 className="text-2xl md:text-4xl font-black text-white mb-2 drop-shadow-lg">
                          🎊 CHÚC MỪNG! 🎊
                        </h3>
                        <p className="text-lg font-bold text-white/90 mb-1">
                          Số may mắn của bạn:
                        </p>
                        <p className="text-3xl md:text-5xl font-black text-yellow-300 drop-shadow-[0_0_15px_rgba(255,215,0,0.9)]">
                          {numbers.join("")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nút bấm */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center flex-shrink-0">
                  <button
                    onClick={spinLottery}
                    disabled={isSpinning}
                    className={`group relative px-8 py-4 rounded-xl font-black text-lg overflow-hidden transition-all duration-300 ${
                      isSpinning
                        ? 'bg-gray-600 cursor-not-allowed scale-95'
                        : 'hover:scale-110 active:scale-95'
                    }`}
                    style={{
                      background: isSpinning
                        ? undefined
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                      boxShadow: isSpinning ? undefined : '0 8px 30px rgba(102, 126, 234, 0.5)'
                    }}
                  >
                    {!isSpinning && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }}></div>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                      </>
                    )}
                    <span className="relative z-10 flex items-center gap-2 text-white drop-shadow-lg">
                      {isSpinning ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          ĐANG QUAY...
                        </>
                      ) : (
                        <>
                          <Zap className="w-6 h-6 animate-pulse" />
                          QUAY NGAY
                          <Zap className="w-6 h-6 animate-pulse" />
                        </>
                      )}
                    </span>
                  </button>

                  {hasResult && (
                    <button
                      onClick={reset}
                      className="group relative px-8 py-4 rounded-xl font-black text-lg bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative z-10 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        THỬ LẠI
                      </span>
                    </button>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 text-center flex-shrink-0">
                  <div className={`flex items-center justify-center gap-1 ${theme === 'light' ? 'text-black/70' : 'text-white/70'} text-sm font-semibold`}>
                    <Star className="w-4 h-4 text-yellow-400" />
                    <p>Chúc bạn luôn gặp nhiều may mắn và niềm vui</p>
                    <Star className="w-4 h-4 text-pink-400" />
                  </div>
                </div>
              </div>

            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LotteryPage;
