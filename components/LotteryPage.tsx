"use client";

import {
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
  SoundFilled,
  SoundOutlined,
  ThunderboltFilled,
  TrophyFilled,
  UploadOutlined,
  AudioOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  ConfigProvider,
  InputNumber,
  Modal,
  Switch,
  Table,
  Typography,
  Upload,
  message,
} from "antd";
import { Trash2 as IconTrash } from "lucide-react";
import localFont from "next/font/local";
import React, { useCallback, useEffect, useState } from "react";
import UAlertDialog from "~/components/ui/ualert-dialog";
import { audioManager } from "../lib/audio";
import { assetDB, AUDIO_KEYS } from "../lib/db";
import {
  lotteryStorage,
  settingsStorage,
  type LotteryResult,
} from "../lib/storage";
import FireworksCanvas from "./FireworksCanvas";

const { Title, Text } = Typography;

const campana = localFont({
  src: "../src/font/GastrolineSignature.otf",
  display: "swap",
});

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
    className={`bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-2xl flex flex-col h-full overflow-hidden shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] ${className}`}
  >
    {(title || extra) && (
      <div className="px-5 py-3 border-b-2 border-white/20 flex justify-between items-center bg-white/10 shrink-0">
        {typeof title === "string" ? (
          <Text
            strong
            className="text-base uppercase tracking-widest !text-white"
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
      className={`flex-1 overflow-y-auto scrollbar-hidden relative min-h-0 ${noPadding ? "" : "p-4"}`}
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
  const [maxRange, setMaxRange] = useState(99999);
  const [showSettings, setShowSettings] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [useCustomSound, setUseCustomSound] = useState(false);
  const [hasCustomSound, setHasCustomSound] = useState(false);
  const [useCustomSpinSound, setUseCustomSpinSound] = useState(false);
  const [hasCustomSpinSound, setHasCustomSpinSound] = useState(false);
  const [spinDuration, setSpinDuration] = useState(5);

  useEffect(() => {
    const settings = settingsStorage.getSettings();
    setSoundEnabled(settings.soundEnabled);
    setMaxRange(settings.maxRange || 99999);
    setUseCustomSound(!!settings.useCustomSound);
    setUseCustomSpinSound(!!settings.useCustomSpinSound);
    setSpinDuration(settings.spinDuration || 5);
    setHistory(lotteryStorage.getHistory());

    // Load custom sounds if exist
    assetDB.getAudio(AUDIO_KEYS.WIN).then((buffer) => {
      if (buffer) {
        setHasCustomSound(true);
        if (settings.useCustomSound) {
          audioManager.loadFromArrayBuffer("win", buffer);
        }
      }
    });

    assetDB.getAudio(AUDIO_KEYS.SPIN).then((buffer) => {
      if (buffer) {
        setHasCustomSpinSound(true);
        if (settings.useCustomSpinSound) {
          audioManager.loadFromArrayBuffer("spin", buffer);
        }
      }
    });

    // Try to load default sound effects if they exist in public folder
    if (!settings.useCustomSpinSound) {
      audioManager.loadSound("spin", "/music.mp3");
    }
    audioManager.loadSound("spin", "/music.mp3");
    audioManager.loadSound(
      "win",
      "/hieu_ung_am_thanh_chien_thang-www_tiengdong_com.mp3",
    );
    audioManager.loadSound("click", "/click.mp3");

    const digits = Math.max(
      1,
      Math.floor(Math.log10(settings.maxRange || 99999)) + 1,
    );
    setNumbers(new Array(digits).fill(0));
  }, []);

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
    const totalSteps = Math.max(10, spinDuration * 5); // Approximately 5 updates per second
    const interval = setInterval(() => {
      setNumbers((prev) => prev.map(() => Math.floor(Math.random() * 10)));
      counter++;

      if (counter > totalSteps) {
        clearInterval(interval);
        const winner = Math.floor(Math.random() * maxRange) + 1;
        const winnerStr = winner.toString().padStart(digits, "0");
        const finalNumbers = winnerStr.split("").map(Number);

        setNumbers(finalNumbers);
        setIsSpinning(false);
        setHasResult(true);
        setShowWinModal(true);
        audioManager.stopSpinSound();

        // Save to history immediately
        lotteryStorage.addResult(finalNumbers);
        setHistory(lotteryStorage.getHistory());
        setCurrentPage(1);

        setTimeout(() => playSound("win"), 300);
      }
    }, 180);
  };

  const reset = async () => {
    playSound("click");
    const digits = Math.max(1, Math.floor(Math.log10(maxRange)) + 1);
    setNumbers(new Array(digits).fill(0));
    setHasResult(false);
  };

  const deleteRecord = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id);
    setHistory(newHistory);
    // Adjust current page if last item on page is deleted
    const maxPage = Math.max(1, Math.ceil(newHistory.length / 5));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
    // Overwrite storage with updated history
    localStorage.setItem("lottery_history", JSON.stringify(newHistory));
    message.success("Đã xóa kết quả");
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_: unknown, __: unknown, index: number) => (
        <span className="text-white/70 font-black text-4xl">
          {history.length - ((currentPage - 1) * 5 + index)}
        </span>
      ),
    },
    {
      title: "KẾT QUẢ",
      dataIndex: "numbers",
      key: "numbers",
      render: (nums: number[]) => (
        <div className="flex gap-3 flex-wrap">
          {nums.map((n, i) => (
            <div
              key={i}
              className="w-16 h-18 flex items-center justify-center font-black border-2 border-white/50 bg-white/30 text-white text-4xl rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
            >
              {n}
            </div>
          ))}
        </div>
      ),
    },
    // {
    //   title: "Thời gian",
    //   dataIndex: "date",
    //   key: "date",
    //   render: (date: string) => (
    //     <Text className="text-sm text-secondary/50 font-mono">
    //       {date.split(",")[1]?.trim() || date}
    //     </Text>
    //   ),
    // },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_: any, record: LotteryResult) => (
        <UAlertDialog
          iconChildren={
            <div className="w-14 h-14 flex items-center justify-center rounded-xl hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
              <IconTrash size={28} className="text-white" />
            </div>
          }
          onDelete={() => {
            deleteRecord(record.id);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <FireworksCanvas isActive={hasResult && !isSpinning} />
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#22C55E",
            borderRadius: 12,
            colorBgContainer: "rgba(255, 255, 255, 0.05)",
            colorBorder: "rgba(255, 255, 255, 0.3)",
          },
          components: {
            Button: {
              controlHeightLG: 48,
              borderRadiusLG: 12,
              fontWeight: 700,
            },
            Table: {
              headerBg: "transparent",
              headerColor: "#FFFFFF",
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
          className={`flex flex-col h-screen max-h-screen w-full max-w-[1440px] mx-auto px-4 py-3 gap-2 overflow-hidden`}
        >
          {/* Header */}
          <header
            className={`bg-red-400 backdrop-blur-2xl border-2 border-white/30 rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] flex items-center justify-between px-5 h-14 shrink-0`}
          >
            <div className="flex items-center gap-3">
              <Avatar
                src="/logo1.jpg"
                size={38}
                className="border-2 border-white/30 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] shrink-0"
              />
              <div className="hidden sm:block">
                <Title
                  level={5}
                  className={`!m-0 !mb-0 font-black tracking-tight text-white! !text-lg`}
                >
                  Giáo Xứ Ân Thịnh
                </Title>
              </div>
            </div>

            <div className="flex gap-3 items-center shrink-0">
              <div
                className={`bg-red-400 border-2 border-white/20 rounded-xl px-3 h-9 hidden sm:flex items-center gap-2`}
              >
                <SoundOutlined
                  className={`text-sm ${soundEnabled ? "text-white/30" : "text-white"}`}
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
                  className={`text-sm ${soundEnabled ? "text-primary" : "text-white/30"}`}
                />
              </div>

              <Button
                icon={<SettingOutlined />}
                onClick={() => setShowSettings(true)}
                className={`h-9 px-4 rounded-xl border-2 border-white/30 font-bold text-sm tracking-wide shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] bg-white/10 text-white hover:bg-white/20`}
              >
                CÀI ĐẶT
              </Button>
            </div>
          </header>

          {/* Main Content Grid */}
          <div className="flex-1 pb-5 rounded-xl grid grid-cols-5 gap-3 min-h-0 overflow-hidden">
            <div className="lg:col-span-3 h-full bg-[#FA5C5C] rounded-xl overflow-hidden">
              <BentoTile>
                <div className="flex flex-col gap-15 items-center justify-center h-full">
                  {/* Title */}
                  <h1
                    className={`${campana.className} text-[85px] font-black tracking-tighter text-white text-center leading-none`}
                  >
                    Vui Xuân Cùng Ân Thịnh
                  </h1>

                  {/* Number Cards */}
                  <div
                    className={`flex gap-4 sm:gap-6 ${hasResult ? "mb-2" : "mb-6"} flex-wrap justify-center w-full px-8`}
                  >
                    {numbers.map((num, idx) => (
                      <div
                        key={idx}
                        className={`
                        flex-1 min-w-[80px] max-w-[180px] aspect-4/5 max-h-[30vh]
                        bg-white/10 backdrop-blur-xl
                        border-4 rounded-3xl md:rounded-[2.5rem] 
                        flex items-center justify-center 
                        text-8xl sm:text-9xl md:text-[10rem] font-black
                        transition-all duration-200
                        mb-2
                      `}
                      >
                        {num}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-5">
                    <Button
                      type="primary"
                      size="large"
                      icon={<ThunderboltFilled />}
                      onClick={spinLottery}
                      disabled={isSpinning}
                      className="h-20 md:h-24 px-12 md:px-20 text-5xl font-black rounded-4xl border-4 border-emerald-700 shadow-[10px_10px_0px_0px_#166534] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                    >
                      {isSpinning ? "ĐANG QUAY..." : "QUAY NGAY"}
                    </Button>

                    {hasResult && !isSpinning && (
                      <Button
                        size="large"
                        icon={<ReloadOutlined />}
                        onClick={reset}
                        className={`h-20 md:h-24 px-10 md:px-14 text-3xl md:text-4xl font-black rounded-4xl border-4 border-white/60 shadow-[10px_10px_0px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all bg-white/10 text-white`}
                      >
                        THỬ LẠI
                      </Button>
                    )}
                  </div>
                </div>
              </BentoTile>
            </div>

            {/* History Panel */}
            <div className="h-full hidden bg-[#FA5C5C] rounded-xl lg:block lg:col-span-2">
              <BentoTile
                title={
                  <span
                    className={`text-4xl font-black uppercase tracking-wide text-white`}
                  >
                    Lịch sử quay số
                  </span>
                }
                noPadding
                extra={
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    className="font-semibold text-sm h-8 flex items-center px-3 hover:!bg-white/20 !text-white/60 hover:!text-white border border-white/20"
                    size="small"
                    disabled={history.length === 0}
                    onClick={() => {
                      Modal.confirm({
                        title: "Xóa tất cả lịch sử?",
                        content: "Toàn bộ lịch sử sẽ bị xóa vĩnh viễn.",
                        okType: "danger",
                        cancelText: "Hủy",
                        centered: true,
                        onOk() {
                          lotteryStorage.clearHistory();
                          setHistory([]);
                          setCurrentPage(1);
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
                      current: currentPage,
                      pageSize: 5,
                      onChange: (page) => setCurrentPage(page),
                      size: "large",
                      showSizeChanger: false,
                      className: "px-3 my-2",
                    }}
                    rowKey="id"
                    className="h-full lottery-table"
                    onRow={() => ({
                      className: "group",
                    })}
                    size="large"
                    locale={{
                      emptyText: (
                        <span className="text-white/40 text-2xl">
                          Chưa có kết quả
                        </span>
                      ),
                    }}
                  />
                </div>
              </BentoTile>
            </div>
          </div>

          {/* Win Result Modal */}
          <ConfigProvider
            theme={{
              token: {
                colorBgElevated: "#FA5C5C",
                colorText: "#ffffff",
                colorTextHeading: "#ffffff",
              },
              components: {
                Modal: {
                  paddingContentHorizontal: 0,
                  paddingMD: 0,
                },
              },
            }}
          >
            <Modal
              open={showWinModal}
              footer={null}
              onCancel={() => {
                setShowWinModal(false);
                reset();
              }}
              centered
              width={800}
              className="win-modal"
              closeIcon={
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40">
                  ×
                </div>
              }
            >
              <div className="flex flex-col items-center gap-8 py-8 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                  <div className="w-[600px] h-[600px] bg-gradient-radial from-yellow-500/40 to-transparent rounded-full blur-3xl animate-pulse" />
                </div>

                <div className="flex items-center justify-center gap-6 z-10 animate-bounce-slow">
                  <TrophyFilled className="text-yellow-300 text-7xl drop-shadow-lg" />
                  <span className="font-black text-6xl tracking-tighter drop-shadow-lg text-white">
                    XIN CHÚC MỪNG
                  </span>
                  <TrophyFilled className="text-yellow-300 text-7xl drop-shadow-lg" />
                </div>

                <div className="flex flex-col items-center gap-4 z-10">
                  <p className="text-3xl text-white/60 font-medium uppercase tracking-widest">
                    Con số may mắn
                  </p>
                  <div className="flex gap-4">
                    {numbers.map((n, i) => (
                      <div
                        key={i}
                        className="w-24 h-32 flex items-center justify-center font-black border-4 border-yellow-400/50 bg-linear-to-br from-yellow-500/20 to-amber-600/20 text-yellow-300 text-8xl rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.3)] animate-pop-in"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  size="large"
                  type="primary"
                  onClick={() => {
                    setShowWinModal(false);
                    reset();
                  }}
                  className="h-16 px-12 text-2xl font-bold rounded-2xl bg-linear-to-r from-emerald-500 to-green-600 border-none shadow-lg hover:shadow-green-500/30 hover:scale-105 active:scale-95 transition-all z-10 mt-4"
                >
                  Quay Lại
                </Button>
              </div>
            </Modal>
          </ConfigProvider>

          {/* Settings Modal */}
          <ConfigProvider
            theme={{
              token: {
                colorBgElevated: "#FA5C5C",
                colorText: "#ffffff",
                colorTextHeading: "#ffffff",
              },
            }}
          >
            <Modal
              title={
                <div className="flex items-center gap-2">
                  <SettingOutlined className="text-white" />
                  <span className="font-bold text-xl text-white">Cài đặt</span>
                </div>
              }
              open={showSettings}
              onCancel={() => setShowSettings(false)}
              footer={null}
              centered
              width={600}
              className="settings-modal"
            >
              <div className="flex flex-col gap-5 p-6">
                {/* Max Range Setting */}
                <div className="flex flex-col gap-2">
                  <Text
                    strong
                    className="text-white text-2xl uppercase tracking-wider"
                  >
                    Giới hạn số tối đa
                  </Text>
                  <InputNumber
                    min={1}
                    max={9999}
                    value={maxRange}
                    onChange={(val) => {
                      if (val) {
                        setMaxRange(val);
                        settingsStorage.updateSettings({ maxRange: val });
                        const digits = Math.max(
                          1,
                          Math.floor(Math.log10(val)) + 1,
                        );
                        setNumbers(new Array(digits).fill(0));
                        setHasResult(false);
                      }
                    }}
                    style={{
                      width: "100%",
                      height: "56px",
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "white",
                    }}
                  />
                </div>

                {/* Quick Select */}
                <div className="flex flex-col gap-2">
                  <Text
                    strong
                    className="text-white text-2xl uppercase tracking-wider"
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
                          const digits = Math.max(
                            1,
                            Math.floor(Math.log10(v)) + 1,
                          );
                          setNumbers(new Array(digits).fill(0));
                          setHasResult(false);
                        }}
                        className={`
                        h-10 font-bold text-2xl rounded-lg border-2
                        ${
                          maxRange === v
                            ? "bg-primary text-white border-primary shadow-[2px_2px_0px_0px_#166534]"
                            : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                        }
                      `}
                      >
                        {v.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sound Toggle (Mobile) */}
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/20">
                  <div className="flex items-center gap-2">
                    <SoundFilled
                      className={
                        soundEnabled ? "text-primary" : "text-white/30"
                      }
                    />
                    <Text className="font-semibold !text-white text-2xl">
                      Âm thanh
                    </Text>
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

                <div className="flex flex-col gap-3 p-4 bg-white/10 rounded-xl border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AudioOutlined className="text-white text-xl" />
                      <Text className="font-semibold !text-white text-xl">
                        Nhạc lúc quay tùy chỉnh
                      </Text>
                    </div>
                    <Switch
                      disabled={!hasCustomSpinSound}
                      checked={useCustomSpinSound}
                      onChange={(val) => {
                        setUseCustomSpinSound(val);
                        settingsStorage.updateSettings({
                          useCustomSpinSound: val,
                        });
                        if (val) {
                          assetDB.getAudio(AUDIO_KEYS.SPIN).then((buffer) => {
                            if (buffer) {
                              audioManager.loadFromArrayBuffer("spin", buffer);
                            }
                          });
                        } else {
                          // Reload default
                          audioManager.loadSound("spin", "/music.mp3");
                        }
                      }}
                      className={useCustomSpinSound ? "bg-primary" : ""}
                    />
                  </div>

                  <Upload
                    accept="audio/*"
                    showUploadList={false}
                    beforeUpload={async (file) => {
                      try {
                        await assetDB.saveAudio(AUDIO_KEYS.SPIN, file);
                        setHasCustomSpinSound(true);
                        setUseCustomSpinSound(true);
                        settingsStorage.updateSettings({
                          useCustomSpinSound: true,
                        });

                        const arrayBuffer = await file.arrayBuffer();
                        await audioManager.loadFromArrayBuffer(
                          "spin",
                          arrayBuffer,
                        );

                        message.success("Đã tải nhạc lúc quay thành công!");
                      } catch (err) {
                        message.error("Lỗi khi tải nhạc!");
                        console.error(err);
                      }
                      return false;
                    }}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      className="w-full h-12 border-dashed border-white/30 bg-white/5 text-white hover:!bg-white/10"
                    >
                      {hasCustomSpinSound
                        ? "Thay đổi nhạc lúc quay"
                        : "Tải nhạc lúc quay (.mp3, .wav)"}
                    </Button>
                  </Upload>

                  {hasCustomSpinSound && (
                    <Button
                      type="text"
                      size="small"
                      onClick={async () => {
                        await assetDB.removeAudio(AUDIO_KEYS.SPIN);
                        setHasCustomSpinSound(false);
                        setUseCustomSpinSound(false);
                        settingsStorage.updateSettings({
                          useCustomSpinSound: false,
                        });
                        audioManager.loadSound("spin", "/music.mp3");
                        message.info("Đã xóa nhạc lúc quay tùy chỉnh");
                      }}
                      className="text-white hover:text-white"
                    >
                      Xóa nhạc lúc quay hiện tại
                    </Button>
                  )}
                </div>

                <div className="flex flex-col gap-3 p-4 bg-white/10 rounded-xl border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AudioOutlined className="text-white text-xl" />
                      <Text className="font-semibold !text-white text-xl">
                        Nhạc chúc mừng tùy chỉnh
                      </Text>
                    </div>
                    <Switch
                      disabled={!hasCustomSound}
                      checked={useCustomSound}
                      onChange={(val) => {
                        setUseCustomSound(val);
                        settingsStorage.updateSettings({ useCustomSound: val });
                        if (val) {
                          assetDB.getAudio(AUDIO_KEYS.WIN).then((buffer) => {
                            if (buffer) {
                              audioManager.loadFromArrayBuffer("win", buffer);
                            }
                          });
                        } else {
                          audioManager.clearBuffer("win");
                        }
                      }}
                      className={useCustomSound ? "bg-primary" : ""}
                    />
                  </div>

                  <Upload
                    accept="audio/*"
                    showUploadList={false}
                    beforeUpload={async (file) => {
                      try {
                        await assetDB.saveAudio(AUDIO_KEYS.WIN, file);
                        setHasCustomSound(true);
                        setUseCustomSound(true);
                        settingsStorage.updateSettings({
                          useCustomSound: true,
                        });

                        const arrayBuffer = await file.arrayBuffer();
                        await audioManager.loadFromArrayBuffer(
                          "win",
                          arrayBuffer,
                        );

                        message.success("Đã tải nhạc chúc mừng thành công!");
                      } catch (err) {
                        message.error("Lỗi khi tải nhạc!");
                        console.error(err);
                      }
                      return false; // Prevent auto upload
                    }}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      className="w-full h-12 border-dashed border-white/30 bg-white/5 text-white hover:!bg-white/10"
                    >
                      {hasCustomSound
                        ? "Thay đổi nhạc chúc mừng"
                        : "Tải nhạc chúc mừng (.mp3, .wav)"}
                    </Button>
                  </Upload>

                  {hasCustomSound && (
                    <Button
                      type="text"
                      size="small"
                      onClick={async () => {
                        await assetDB.removeAudio(AUDIO_KEYS.WIN);
                        setHasCustomSound(false);
                        setUseCustomSound(false);
                        settingsStorage.updateSettings({
                          useCustomSound: false,
                        });
                        audioManager.clearBuffer("win");
                        message.info("Đã xóa nhạc chúc mừng tùy chỉnh");
                      }}
                      className="text-white hover:text-white"
                    >
                      Xóa nhạc chúc mừng hiện tại
                    </Button>
                  )}
                </div>

                {/* Spin Duration Setting */}
                <div className="flex flex-col gap-2">
                  <Text
                    strong
                    className="text-white text-2xl uppercase tracking-wider"
                  >
                    Thời gian quay (giây)
                  </Text>
                  <InputNumber
                    min={1}
                    max={60}
                    value={spinDuration}
                    onChange={(val) => {
                      if (val) {
                        setSpinDuration(val);
                        settingsStorage.updateSettings({ spinDuration: val });
                      }
                    }}
                    style={{
                      width: "100%",
                      height: "56px",
                      fontSize: "24px",
                      fontWeight: "bold",
                    }}
                  />
                </div>

                {/* Done Button */}
                <Button
                  type="primary"
                  onClick={() => setShowSettings(false)}
                  className="h-20 font-bold text-2xl py-5 rounded-xl border-2 border-emerald-700 shadow-[3px_3px_0px_0px_#166534] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                  block
                >
                  Hoàn tất
                </Button>
              </div>
            </Modal>
          </ConfigProvider>

          {/* Custom Styles */}
          <style jsx global>{`
            .lottery-table .ant-table {
              background: transparent !important;
            }
            .lottery-table .ant-table-thead > tr > th {
              font-size: 24px;
              font-weight: 900;
              padding: 16px 12px !important;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              border-bottom: 3px solid rgba(255, 255, 255, 0.3) !important;
              color: white !important;
            }
            .lottery-table .ant-table-tbody > tr > td {
              padding: 16px 12px !important;
              border-bottom: 2px solid rgba(255, 255, 255, 0.2) !important;
              font-size: 48px;
              font-weight: 900;
              color: white !important;
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
              background: #fa5c5c !important;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
            }
            .settings-modal .ant-modal-title {
              color: white !important;
              background: transparent !important;
            }
            .settings-modal .ant-modal-header {
              margin-bottom: 16px;
            }
            .settings-modal .ant-modal-close {
              top: 18px;
              right: 20px;
            }

            .win-modal .ant-modal-content {
              background: #fa5c5c !important;
              backdrop-filter: blur(40px) !important;
              border: 2px solid rgba(255, 255, 255, 0.3) !important;
              border-radius: 32px !important;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
              padding: 0 !important;
              overflow: hidden !important;
            }
            .win-modal .ant-modal-body {
              padding: 0 !important;
            }
            .win-modal .ant-modal-close {
              top: 24px;
              right: 24px;
            }

            @keyframes bounce-slow {
              0%,
              100% {
                transform: translateY(-5%);
              }
              50% {
                transform: translateY(5%);
              }
            }
            .animate-bounce-slow {
              animation: bounce-slow 3s infinite ease-in-out;
            }

            @keyframes pop-in {
              0% {
                transform: scale(0);
                opacity: 0;
              }
              70% {
                transform: scale(1.1);
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
            .animate-pop-in {
              animation: pop-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
        </div>
      </ConfigProvider>
    </>
  );
};

export default LotteryPage;
