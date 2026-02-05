"use client";

import React from 'react';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-full bg-[#F9FAFB] flex flex-col overflow-hidden">
      {/* 1440px Centered Container */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-4 flex flex-col gap-6 relative">
        {/* Abstract Background Accents matching LearnHub style */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        
        {children}
      </div>

      <style jsx global>{`
        body {
          background-color: #F9FAFB;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;