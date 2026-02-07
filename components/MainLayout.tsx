"use client";

import React from 'react';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-transparent">
      {/* 1440px Centered Container */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-2 flex flex-col gap-4 relative">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;