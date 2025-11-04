"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, Trophy, Star, Flame, Crown, Zap } from 'lucide-react';

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
        rotation: Math.random() * 360
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
      }
    }, 60); // Mỗi 60ms đổi số 1 lần
  };

  // Reset về ban đầu
  const reset = () => {
    setNumbers([0, 0, 0, 0, 0]);
    setHasResult(false);
    setConfetti([]);
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

      <div className="container mx-auto px-4 py-6 min-h-screen flex flex-col">
        {/* Header với Logo */}
        <div
          className="flex items-center gap-4 mb-6"
          style={{ animation: 'slide-up 0.8s ease-out' }}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
            <Image
              src="/logo.jpg"
              alt="Logo TNTT"
              width={64}
              height={64}
              className="relative w-16 h-16 rounded-full object-cover border-2 border-white shadow-2xl transform group-hover:scale-110 transition-all duration-300"
            />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Đoàn TNTT Phêrô NéRon Bắc GX Phú Cát
            </h2>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-5xl">
            <div
              className="relative backdrop-blur-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-[2.5rem] p-8 md:p-12 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
              style={{ animation: 'bounce-in 1s ease-out' }}
            >
              {/* Crown trang trí */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <Crown className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
              </div>

              {/* Góc phát sáng */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-tl-[2.5rem] blur-xl"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-400/20 to-transparent rounded-tr-[2.5rem] blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-bl-[2.5rem] blur-xl"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-400/20 to-transparent rounded-br-[2.5rem] blur-xl"></div>

              {/* Tiêu đề */}
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Star className="w-10 h-10 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <h1
                    className="text-6xl md:text-8xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent"
                    style={{
                      backgroundSize: '200% auto',
                      animation: 'shimmer 3s linear infinite',
                      filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.5))'
                    }}
                  >
                    VÒNG QUAY
                  </h1>
                  <Flame className="w-10 h-10 text-orange-400 animate-bounce" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-4">
                  MAY MẮN
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <p className="text-white/90 text-lg font-semibold">Khám phá vận may của bạn ngay bây giờ!</p>
                  <Sparkles className="w-5 h-5 text-pink-400" />
                </div>
              </div>

              {/* Hiển thị số */}
              <div className="mb-10">
                <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8 perspective-1000">
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
                        className={`absolute inset-0 rounded-3xl ${hasResult ? 'animate-spin' : ''}`}
                        style={{
                          background: 'conic-gradient(from 0deg, #FFD700, #FF1493, #00F5FF, #FF69B4, #FFD700)',
                          filter: 'blur(10px)',
                          opacity: hasResult ? 0.8 : 0.5,
                          animationDuration: '3s'
                        }}
                      ></div>

                      {/* Thẻ số */}
                      <div
                        className="relative w-24 h-32 md:w-32 md:h-40 rounded-3xl flex items-center justify-center overflow-hidden transform transition-all duration-500"
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
                          className="relative text-7xl md:text-8xl font-black text-white"
                          style={{
                            textShadow: '0 0 20px rgba(255,255,255,0.5), 4px 4px 8px rgba(0,0,0,0.5)'
                          }}
                        >
                          {num}
                        </span>

                        {/* Icons góc */}
                        {hasResult && (
                          <>
                            <Trophy className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-bounce" />
                            <Zap className="absolute -bottom-2 -left-2 w-8 h-8 text-cyan-300 animate-pulse" />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Banner kết quả */}
                {hasResult && (
                  <div
                    className="relative overflow-hidden rounded-3xl p-8"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                      animation: 'bounce-in 0.6s ease-out',
                      boxShadow: '0 0 60px rgba(102, 126, 234, 0.8)'
                    }}
                  >
                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                    <div className="relative text-center">
                      <Trophy className="w-16 h-16 text-yellow-300 mx-auto mb-4 animate-bounce drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]" />
                      <h3 className="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-lg">
                        🎊 CHÚC MỪNG! 🎊
                      </h3>
                      <p className="text-2xl font-bold text-white/90 mb-2">
                        Số may mắn của bạn:
                      </p>
                      <p className="text-5xl md:text-6xl font-black text-yellow-300 drop-shadow-[0_0_20px_rgba(255,215,0,0.9)]">
                        {numbers.join("")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Nút bấm */}
              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                <button
                  onClick={spinLottery}
                  disabled={isSpinning}
                  className={`group relative px-14 py-6 rounded-2xl font-black text-2xl overflow-hidden transition-all duration-300 ${
                    isSpinning
                      ? 'bg-gray-600 cursor-not-allowed scale-95'
                      : 'hover:scale-110 active:scale-95'
                  }`}
                  style={{
                    background: isSpinning
                      ? undefined
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                    boxShadow: isSpinning ? undefined : '0 10px 40px rgba(102, 126, 234, 0.6)'
                  }}
                >
                  {!isSpinning && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }}></div>
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                    </>
                  )}
                  <span className="relative z-10 flex items-center gap-3 text-white drop-shadow-lg">
                    {isSpinning ? (
                      <>
                        <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        ĐANG QUAY...
                      </>
                    ) : (
                      <>
                        <Zap className="w-8 h-8 animate-pulse" />
                        QUAY NGAY
                        <Zap className="w-8 h-8 animate-pulse" />
                      </>
                    )}
                  </span>
                </button>

                {hasResult && (
                  <button
                    onClick={reset}
                    className="group relative px-14 py-6 rounded-2xl font-black text-2xl bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative z-10 flex items-center gap-3">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      THỬ LẠI
                    </span>
                  </button>
                )}
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <div className="flex items-center justify-center gap-2 text-white/70 text-base font-semibold">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <p>Chúc bạn luôn gặp nhiều may mắn và niềm vui</p>
                  <Star className="w-5 h-5 text-pink-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LotteryPage;
