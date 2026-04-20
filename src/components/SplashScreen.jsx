import React from 'react';

const BLUE = '#139ED2';
const GREEN = '#94CF53';

export default function SplashScreen() {
  return (
    <div 
      className="flex h-[100dvh] w-full flex-col items-center justify-center relative overflow-hidden" 
      style={{ backgroundColor: BLUE }}
    >
      {/* Subtile baggrundscirkler for et mere levende UI */}
      <div 
        className="absolute inset-0 opacity-30" 
        style={{ background: `radial-gradient(circle at top right, ${GREEN} 0%, transparent 50%)` }} 
      />
      <div 
        className="absolute inset-0 opacity-40" 
        style={{ background: `radial-gradient(circle at bottom left, #0c6a8c 0%, transparent 60%)` }} 
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center animate-splash-breathe">
        <div className="flex h-32 w-32 items-center justify-center rounded-[30px] bg-white shadow-2xl p-3 ring-[6px] ring-white/15">
          <img 
            src="/logo.png" 
            alt="FillUp" 
            className="h-full w-full object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white drop-shadow-xl">
          FillUp
        </h1>
        <p className="mt-3 text-[15px] font-medium text-white/90 drop-shadow-sm tracking-wide">
          Din guide til en grønnere hverdag
        </p>
      </div>

      <style>{`
        @keyframes splashBreathe {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(0.96); }
        }
        .animate-splash-breathe {
          animation: splashBreathe 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
