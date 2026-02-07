"use client";

import MainLayout from "../components/MainLayout";
import LotteryPage from "../components/LotteryPage";

export default function App() {
  return (
    <MainLayout>
      <div className="bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed">
        <LotteryPage />
      </div>
    </MainLayout>
  );
}
