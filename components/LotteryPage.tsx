"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ConfigProvider,
  Button,
  Modal,
  Table,
  Typography,
  InputNumber,
  Switch,
  Space,
  Tooltip,
  Avatar,
  Tag,
  message,
  theme as antdTheme,
} from "antd";
import {
  SoundOutlined,
  SoundFilled,
  DeleteOutlined,
  ReloadOutlined,
  ThunderboltFilled,
  TrophyFilled,
  CrownFilled,
  BulbOutlined,
  BulbFilled,
  SettingOutlined,
} from "@ant-design/icons";
import { audioManager } from "../lib/audio";
import {
  lotteryStorage,
  settingsStorage,
  type LotteryResult,
} from "../lib/storage";
import { Trash2 as IconTrash } from "lucide-react";
import UAlertDialog from "~/components/ui/ualert-dialog";

const { Title, Text } = Typography;

// Balanced Bento Tile component
const BentoTile = ({
  children,
  className = "",
  title,
  extra,
  noPadding = false,
}: {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  extra?: React.ReactNode;
  noPadding?: boolean;
}) => (
  <div
    className={`bg-white border-2 border-secondary rounded-2xl flex flex-col h-full overflow-hidden shadow-[3px_3px_0px_0px_#0f172a] ${className}`}
  >
    {(title || extra) && (
      <div className="px-5 py-3 border-b-2 border-secondary flex justify-between items-center bg-ghost/50 shrink-0">
        {typeof title === "string" ? (
          <Text
            strong
            className="text-sm uppercase tracking-wider text-secondary"
          >
            {title}
          </Text>
        ) : (
          title
        )}
        {extra}
      </div>
    )}
    <div
      className={`flex-1 overflow-hidden relative min-h-0 ${noPadding ? "" : "p-4"}`}
    >
      {children}
    </div>
  </div>
);

const LotteryPage = () => {
  const [numbers, setNumbers] = useState([0, 0, 0, 0, 0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [history, setHistory] = useState<LotteryResult[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [maxRange, setMaxRange] = useState(99999);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const settings = settingsStorage.getSettings();
    setSoundEnabled(settings.soundEnabled);
    // Default to light theme
    setTheme(settings.theme === "dark" ? "dark" : "light");
    setMaxRange(settings.maxRange || 99999);
    setHistory(lotteryStorage.getHistory());

    const digits = Math.max(
      1,
      Math.floor(Math.log10(settings.maxRange || 99999)) + 1,
    );
    setNumbers(new Array(digits).fill(0));
  }, []);

  useEffect(() => {
    if (hasResult) {
      lotteryStorage.addResult(numbers);
      setHistory(lotteryStorage.getHistory());
    }
  }, [hasResult, numbers]);

  const playSound = useCallback(
    async (type: "click" | "spin" | "win") => {
      if (!soundEnabled) return;

      // Ensure audio is ready on user interaction
      await audioManager.ensureReady();

      switch (type) {
        case "click":
          audioManager.playClickSound();
          break;
        case "spin":
          audioManager.playSpinSound();
          break;
        case "win":
          audioManager.playWinSound();
          break;
      }
    },
    [soundEnabled],
  );

  const spinLottery = async () => {
    await playSound("click");
    setTimeout(() => playSound("spin"), 100);

    setIsSpinning(true);
    setHasResult(false);

    const digits = Math.max(1, Math.floor(Math.log10(maxRange)) + 1);
    let counter = 0;
    const interval = setInterval(() => {
      setNumbers((prev) => prev.map(() => Math.floor(Math.random() * 10)));
      counter++;

      if (counter > 25) {
        clearInterval(interval);
        const winner = Math.floor(Math.random() * maxRange) + 1;
        const winnerStr = winner.toString().padStart(digits, "0");
        const finalNumbers = winnerStr.split("").map(Number);

        setNumbers(finalNumbers);
        setIsSpinning(false);
        setHasResult(true);

        setTimeout(() => playSound("win"), 300);
      }
    }, 200);
  };

  const reset = async () => {
    await playSound("click");
    const digits = Math.max(1, Math.floor(Math.log10(maxRange)) + 1);
    setNumbers(new Array(digits).fill(0));
    setHasResult(false);
  };

  const deleteRecord = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id);
    setHistory(newHistory);
    // Overwrite storage with updated history
    localStorage.setItem("lottery_history", JSON.stringify(newHistory));
    message.success("Đã xóa kết quả");
  };

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => (
        <span className="text-secondary/40 font-mono text-xl">
          {history.length - index}
        </span>
      ),
    },
    {
      title: "Kết quả",
      dataIndex: "numbers",
      key: "numbers",
      render: (nums: number[]) => (
        <Space size={3} wrap>
          {nums.map((n, i) => (
            <Tag
              key={i}
              className="font-bold border-2 border-primary/30 m-0 bg-primary/10 text-primary text-xl px-4 py-1 rounded-lg"
            >
              {n}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <Text className="text-sm text-secondary/50 font-mono">
          {date.split(",")[1]?.trim() || date}
        </Text>
      ),
    },
    {
      title: "",
      key: "action",
      width: 40,
      render: (_: any, record: LotteryResult) => (
        <UAlertDialog
          iconChildren={
            <div className="text-red-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
              <IconTrash size={16} />
            </div>
          }
          onDelete={() => {
            deleteRecord(record.id);
          }}
        />
      ),
    },
  ];

  const isDark = theme === "dark";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#22C55E",
          borderRadius: 12,
          fontFamily: "'Inter', system-ui, sans-serif",
          colorBgContainer: isDark ? "#1E293B" : "#FFFFFF",
          colorBorder: "#0F172A",
        },
        components: {
          Button: {
            controlHeightLG: 48,
            borderRadiusLG: 12,
            fontWeight: 700,
          },
          Table: {
            headerBg: "transparent",
            headerColor: "#64748B",
            headerSplitColor: "transparent",
            cellPaddingBlockSM: 10,
            cellPaddingInlineSM: 8,
          },
          Modal: {
            borderRadiusLG: 20,
          },
        },
      }}
    >
      <div
        className={`flex flex-col h-full w-full max-w-[1440px] mx-auto px-4 py-3 gap-3 ${isDark ? "bg-slate-900" : "bg-ghost"}`}
      >
        {/* Header */}
        <header
          className={`${isDark ? "bg-slate-800" : "bg-white"} border-2 border-secondary rounded-2xl shadow-[3px_3px_0px_0px_#0f172a] flex items-center justify-between px-5 h-14 shrink-0`}
        >
          <div className="flex items-center gap-3">
            <Avatar
              src="/logo.jpg"
              size={38}
              className="border-2 border-secondary shadow-[2px_2px_0px_0px_#0f172a] shrink-0"
            />
            <div className="hidden sm:block">
              <Title
                level={5}
                className={`!m-0 !mb-0 font-black tracking-tight ${isDark ? "text-white" : "text-secondary"} !text-base`}
              >
                TNTT PHÊRÔ NÉRON BẮC
              </Title>
            </div>
          </div>

          <div className="flex gap-3 items-center shrink-0">
            {/* <Tooltip title={isDark ? "Chế độ sáng" : "Chế độ tối"}>
              <Button
                type="text"
                className={`flex items-center justify-center w-9 h-9 rounded-xl border-2 border-secondary ${isDark ? 'bg-slate-700 text-white' : 'bg-white'}`}
                icon={isDark ? <BulbFilled className="text-amber-400" /> : <BulbOutlined />}
                onClick={() => {
                  const newTheme = isDark ? 'light' : 'dark';
                  setTheme(newTheme);
                  settingsStorage.updateSettings({ theme: newTheme });
                }}
              />
            </Tooltip> */}

            <div
              className={`${isDark ? "bg-slate-700" : "bg-ghost"} border-2 border-secondary rounded-xl px-2 h-9 hidden sm:flex items-center gap-2`}
            >
              <SoundOutlined
                className={`text-xs ${soundEnabled ? "text-secondary/30" : "text-secondary"}`}
              />
              <Switch
                checked={soundEnabled}
                onChange={(val) => {
                  setSoundEnabled(val);
                  settingsStorage.updateSettings({ soundEnabled: val });
                }}
                size="small"
                className={soundEnabled ? "bg-primary" : ""}
              />
              <SoundFilled
                className={`text-xs ${soundEnabled ? "text-primary" : "text-secondary/30"}`}
              />
            </div>

            <Button
              icon={<SettingOutlined />}
              onClick={() => setShowSettings(true)}
              className={`h-9 px-4 rounded-xl border-2 border-secondary font-bold text-xs tracking-wide shadow-[2px_2px_0px_0px_#0f172a] ${isDark ? "bg-slate-700 text-white" : "bg-white text-secondary"}`}
            >
              CÀI ĐẶT
            </Button>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0">
          {/* Main Lottery Board - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 h-full">
            <BentoTile
              className={`${isDark ? "bg-slate-800 border-slate-600" : ""}`}
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-emerald-400" />

              <div className="flex flex-col items-center justify-center h-full py-2">
                {/* Badge */}
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-full px-4 py-1.5">
                  <span className="text-emerald-600 text-[11px] font-bold tracking-[0.12em] uppercase flex items-center gap-2">
                    <CrownFilled className="text-amber-500" /> Vòng Quay May Mắn
                  </span>
                </div>

                {/* Title */}
                <h1
                  className={`text-6xl sm:text-7xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter ${isDark ? "text-white" : "text-[#E5BA41]"}`}
                >
                  LUCKY NUMBER
                </h1>

                {/* Number Cards */}
                <div className="flex gap-4 sm:gap-6 mb-10 flex-wrap justify-center w-full px-8">
                  {numbers.map((num, idx) => (
                    <div
                      key={idx}
                      className={`
                        flex-1 min-w-[140px] max-w-[280px] aspect-3/4
                        ${isDark ? "bg-slate-700" : "bg-white"} 
                        border-4 rounded-3xl md:rounded-[3rem] 
                        flex items-center justify-center 
                        text-8xl sm:text-9xl md:text-[10rem] font-black
                        transition-all duration-200
                        mb-5
                        ${
                          isSpinning
                            ? "animate-card-spin border-secondary scale-105"
                            : hasResult
                              ? "border-primary text-primary shadow-[15px_15px_0px_0px_#22C55E]"
                              : `border-secondary shadow-[15px_15px_0px_0px_#0f172a] ${isDark ? "text-white" : "text-secondary"}`
                        }
                      `}
                    >
                      {num}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-8">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ThunderboltFilled />}
                    onClick={spinLottery}
                    disabled={isSpinning}
                    className="h-20 md:h-24 px-12 md:px-20 text-3xl md:text-4xl font-black rounded-4xl border-4 border-emerald-700 shadow-[10px_10px_0px_0px_#166534] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                  >
                    {isSpinning ? "ĐANG QUAY..." : "QUAY NGAY"}
                  </Button>

                  {hasResult && !isSpinning && (
                    <Button
                      size="large"
                      icon={<ReloadOutlined />}
                      onClick={reset}
                      className={`h-20 md:h-24 px-10 md:px-14 text-3xl md:text-4xl font-black rounded-[2rem] border-4 border-secondary shadow-[10px_10px_0px_0px_#0f172a] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all ${isDark ? "bg-slate-700 text-white" : "bg-white text-secondary"}`}
                    >
                      THỬ LẠI
                    </Button>
                  )}
                </div>

                {/* Win Message */}
                {hasResult && !isSpinning && (
                  <div className="mt-10 animate-fade-in-up text-center">
                    <div className="flex items-center justify-center gap-6 mb-4">
                      <TrophyFilled className="text-amber-500 text-6xl" />
                      <span className="text-primary font-black text-6xl tracking-tight">
                        XIN CHÚC MỪNG!
                      </span>
                      <TrophyFilled className="text-amber-500 text-6xl" />
                    </div>
                    <p
                      className={`text-5xl ${isDark ? "text-slate-400" : "text-secondary/60"}`}
                    >
                      Kết quả:{" "}
                      <span
                        className={`font-black ${isDark ? "text-white" : "text-[#E5BA41]"}`}
                      >
                        {numbers.join("")}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </BentoTile>
          </div>

          {/* History Panel */}
          <div className="h-full hidden lg:block">
            <BentoTile
              title={
                <span
                  className={`text-2xl font-black uppercase tracking-widest ${isDark ? "text-white" : "text-secondary"}`}
                >
                  Lịch sử quay số
                </span>
              }
              className={isDark ? "bg-slate-800 border-slate-600" : ""}
              noPadding
              extra={
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  className="font-semibold text-[10px] h-6 flex items-center px-2"
                  size="small"
                  disabled={history.length === 0}
                  onClick={() => {
                    Modal.confirm({
                      title: "Xóa tất cả lịch sử?",
                      content: "Toàn bộ lịch sử sẽ bị xóa vĩnh viễn.",
                      okText: "Xóa hết",
                      okType: "danger",
                      cancelText: "Hủy",
                      centered: true,
                      onOk() {
                        lotteryStorage.clearHistory();
                        setHistory([]);
                        message.success("Đã xóa tất cả lịch sử");
                      },
                    });
                  }}
                >
                  Xóa hết
                </Button>
              }
            >
              <div className="p-5">
                <Table
                  dataSource={history}
                  columns={columns}
                  pagination={{
                    pageSize: 8,
                    size: "small",
                    showSizeChanger: false,
                    className: "px-3",
                  }}
                  rowKey="id"
                  className="h-full lottery-table"
                  onRow={() => ({
                    className: "group",
                  })}
                  size="small"
                  locale={{
                    emptyText: (
                      <span className="text-secondary/40 text-xs">
                        Chưa có kết quả
                      </span>
                    ),
                  }}
                />
              </div>
            </BentoTile>
          </div>
        </div>

        {/* Settings Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <SettingOutlined className="text-primary" />
              <span className="font-bold text-lg">Cài đặt</span>
            </div>
          }
          open={showSettings}
          onCancel={() => setShowSettings(false)}
          footer={null}
          centered
          width={380}
          className="settings-modal"
        >
          <div className="flex flex-col gap-5 py-3">
            {/* Max Range Setting */}
            <div className="flex flex-col gap-2">
              <Text
                strong
                className="text-secondary/60 text-xs uppercase tracking-wider"
              >
                Giới hạn số tối đa
              </Text>
              <InputNumber
                min={1}
                max={999999}
                value={maxRange}
                onChange={(val) => {
                  if (val) {
                    setMaxRange(val);
                    settingsStorage.updateSettings({ maxRange: val });
                    const digits = Math.max(1, Math.floor(Math.log10(val)) + 1);
                    setNumbers(new Array(digits).fill(0));
                  }
                }}
                className="w-full h-11 text-lg font-bold"
              />
            </div>

            {/* Quick Select */}
            <div className="flex flex-col gap-2">
              <Text
                strong
                className="text-secondary/60 text-xs uppercase tracking-wider"
              >
                Chọn nhanh
              </Text>
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 5000].map((v) => (
                  <Button
                    key={v}
                    onClick={() => {
                      setMaxRange(v);
                      settingsStorage.updateSettings({ maxRange: v });
                      const digits = Math.max(1, Math.floor(Math.log10(v)) + 1);
                      setNumbers(new Array(digits).fill(0));
                    }}
                    className={`
                      h-9 font-bold text-xs rounded-lg border-2
                      ${
                        maxRange === v
                          ? "bg-primary text-white border-primary shadow-[2px_2px_0px_0px_#166534]"
                          : "bg-white text-secondary border-secondary/30 hover:border-secondary"
                      }
                    `}
                  >
                    {v.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sound Toggle (Mobile) */}
            <div className="flex items-center justify-between p-3 bg-ghost rounded-xl border border-secondary/10">
              <div className="flex items-center gap-2">
                <SoundFilled
                  className={
                    soundEnabled ? "text-primary" : "text-secondary/30"
                  }
                />
                <Text className="font-medium">Âm thanh</Text>
              </div>
              <Switch
                checked={soundEnabled}
                onChange={(val) => {
                  setSoundEnabled(val);
                  settingsStorage.updateSettings({ soundEnabled: val });
                }}
                className={soundEnabled ? "bg-primary" : ""}
              />
            </div>

            {/* Done Button */}
            <Button
              type="primary"
              onClick={() => setShowSettings(false)}
              className="h-11 font-bold text-sm rounded-xl border-2 border-emerald-700 shadow-[3px_3px_0px_0px_#166534] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
              block
            >
              Hoàn tất
            </Button>
          </div>
        </Modal>

        {/* Custom Styles */}
        <style jsx global>{`
          .lottery-table .ant-table {
            background: transparent !important;
          }
          .lottery-table .ant-table-thead > tr > th {
            font-size: 16px;
            font-weight: 900;
            padding: 20px 12px !important;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border-bottom: 3px solid rgba(15, 23, 42, 0.1) !important;
          }
          .lottery-table .ant-table-tbody > tr > td {
            padding: 16px 12px !important;
            border-bottom: 2px solid rgba(15, 23, 42, 0.05) !important;
            font-size: 20px;
            font-weight: 700;
          }
          .lottery-table .ant-pagination {
            margin: 12px 0 8px !important;
            justify-content: center !important;
          }
          .lottery-table .ant-pagination-item {
            border-radius: 6px !important;
            border: 1px solid #e2e8f0 !important;
          }
          .lottery-table .ant-pagination-item-active {
            background: #22c55e !important;
            border-color: #22c55e !important;
          }
          .lottery-table .ant-pagination-item-active a {
            color: white !important;
          }

          .settings-modal .ant-modal-content {
            border: 2px solid #0f172a !important;
            border-radius: 20px !important;
            box-shadow: 4px 4px 0px 0px #0f172a !important;
            padding: 20px 24px !important;
          }
          .settings-modal .ant-modal-header {
            margin-bottom: 16px;
          }
          .settings-modal .ant-modal-close {
            top: 18px;
            right: 20px;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default LotteryPage;
