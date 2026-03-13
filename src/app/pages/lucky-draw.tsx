import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Bot,
  Brain,
  Clock3,
  MapPin,
  Phone,
  Shuffle,
  Sparkles,
  Star,
  Ticket,
  WandSparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  campuses,
  cuisineTypes,
  restaurants,
  studentScenes,
  type Restaurant,
} from "../data/restaurants";
import {
  buildAiRanking,
  defaultDecisionInputs,
  getCouponValue,
  type AiDecisionInputs,
  type BudgetPreference,
  type DiningMode,
  type MoodPreference,
  type TimePreference,
} from "../lib/ai-dining-advisor";
import { getCampusZone } from "../lib/restaurant-utils";

const cuisineIcons: Record<string, string> = {
  川菜: "🌶️",
  韩餐: "🍱",
  快餐: "🍔",
  轻食: "🥗",
  烧烤: "🍢",
  食堂: "🍜",
};

const wheelColors = [
  "from-[#ffb26f] via-[#ff9040] to-[#f76d34]",
  "from-[#ff8f8f] via-[#f86f7d] to-[#de5368]",
  "from-[#f4d07b] via-[#e6b65a] to-[#cf9735]",
  "from-[#94d29d] via-[#5fb373] to-[#317a4d]",
  "from-[#8ed2d5] via-[#4cb1ba] to-[#227e92]",
  "from-[#bfbbf8] via-[#9892ea] to-[#756dde]",
];

export function LuckyDraw() {
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);
  const [decisionInputs, setDecisionInputs] = useState<AiDecisionInputs>(defaultDecisionInputs);
  const [useAiPoolForSpin, setUseAiPoolForSpin] = useState(true);
  const [didAnalyze, setDidAnalyze] = useState(false);

  const rankedRestaurants = buildAiRanking(decisionInputs);
  const aiTopPick = rankedRestaurants[0] ?? null;
  const aiCandidates = rankedRestaurants.slice(0, 6);
  const aiPreview = didAnalyze ? aiTopPick : null;
  const sectorAngle = 360 / cuisineTypes.length;

  const handleInputChange = <Key extends keyof AiDecisionInputs>(
    key: Key,
    value: AiDecisionInputs[Key],
  ) => {
    setDecisionInputs((current) => ({
      ...current,
      [key]: value,
    }));
    setDidAnalyze(false);
  };

  const startCouponTimer = () => {
    setTimeRemaining(30 * 60);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      setTimeRemaining((previous) => {
        if (previous <= 1) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
          }
          return 0;
        }

        return previous - 1;
      });
    }, 1000);
  };

  const handleAiDecision = () => {
    setDidAnalyze(true);
  };

  const handleSpin = () => {
    if (isSpinning) {
      return;
    }

    const sourcePool =
      useAiPoolForSpin && aiCandidates.length
        ? aiCandidates.map((item) => item.restaurant)
        : restaurants;

    setIsSpinning(true);

    const spins = 5 + Math.random() * 3;
    const randomAngle = Math.random() * 360;
    const totalRotation = rotation + spins * 360 + randomAngle;

    setRotation(totalRotation);

    window.setTimeout(() => {
      setIsSpinning(false);

      const finalAngle = totalRotation % 360;
      const sectorIndex = Math.floor(finalAngle / sectorAngle);
      const selectedCuisine = cuisineTypes[sectorIndex];
      const matchingRestaurants = sourcePool.filter(
        (restaurant) => restaurant.category === selectedCuisine,
      );
      const restaurantPool = matchingRestaurants.length ? matchingRestaurants : sourcePool;
      const randomRestaurant =
        restaurantPool[Math.floor(Math.random() * restaurantPool.length)] ?? aiTopPick?.restaurant ?? restaurants[0];

      setSelectedRestaurant(randomRestaurant);
      startCouponTimer();
    }, 3200);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,201,117,0.42),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(72,153,117,0.18),_transparent_25%),linear-gradient(180deg,_#20170d_0%,_#342419_22%,_#f7efe0_78%,_#fbf8f2_100%)] pb-28">
      <div className="absolute left-[-120px] top-20 h-72 w-72 rounded-full bg-[#f8aa51]/18 blur-3xl" />
      <div className="absolute right-[-120px] top-40 h-72 w-72 rounded-full bg-[#6cbfa6]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pt-6 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/72 backdrop-blur">
              <WandSparkles className="h-4 w-4" />
              Decision Lab
            </div>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">今天吃什么？</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
              随机转盘负责打破纠结，AI 吃饭顾问负责把预算、场景和心情翻译成更像学生会选的答案。
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/18"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden rounded-[36px] border border-white/12 bg-[linear-gradient(180deg,_rgba(255,255,255,0.12),_rgba(255,255,255,0.06))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.24)_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="absolute -right-12 top-8 h-40 w-40 rounded-full border border-white/12" />
            <div className="absolute left-6 top-24 h-px w-[70%] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm uppercase tracking-[0.18em] text-white/64">Lucky Spin</div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">随机一把，也可以带 AI 候选池</h2>
                </div>
                <label className="inline-flex items-center gap-3 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={useAiPoolForSpin}
                    onChange={(event) => setUseAiPoolForSpin(event.target.checked)}
                    className="h-4 w-4 accent-[#f5b455]"
                  />
                  AI 候选池参与转盘
                </label>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/12 bg-white/10 p-4">
                  <div className="text-sm text-white/64">AI 候选池</div>
                  <div className="mt-2 text-3xl font-semibold text-white">{aiCandidates.length}</div>
                  <div className="mt-2 text-xs text-white/58">家进入优先抽取范围</div>
                </div>
                <div className="rounded-[24px] border border-white/12 bg-white/10 p-4">
                  <div className="text-sm text-white/64">AI 首选</div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {aiTopPick ? aiTopPick.restaurant.name : "等待分析"}
                  </div>
                  <div className="mt-2 text-xs text-white/58">当前权重最高</div>
                </div>
                <div className="rounded-[24px] border border-white/12 bg-white/10 p-4">
                  <div className="text-sm text-white/64">当前策略</div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {useAiPoolForSpin ? "AI 约束随机" : "全量纯随机"}
                  </div>
                  <div className="mt-2 text-xs text-white/58">更像真实决策过程</div>
                </div>
              </div>

              <div className="relative mx-auto mt-8 max-w-xl">
                <div className="absolute inset-x-16 top-14 h-56 rounded-full bg-[#f5b455]/16 blur-3xl" />

                <div className="relative mx-auto h-[380px] w-[380px] max-w-full">
                  <div className="absolute inset-0 rounded-full border border-white/10 bg-white/6 shadow-[0_0_0_22px_rgba(255,255,255,0.04)] backdrop-blur" />

                  <motion.div
                    className="absolute inset-[18px]"
                    animate={{ rotate: rotation }}
                    transition={{ duration: 3.2, ease: [0.22, 0.9, 0.22, 1] }}
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-full border-[10px] border-[#fff7ec] shadow-[0_25px_80px_rgba(0,0,0,0.32)]">
                      {cuisineTypes.map((cuisine, index) => (
                        <div
                          key={cuisine}
                          className={`absolute inset-0 bg-gradient-to-br ${wheelColors[index % wheelColors.length]}`}
                          style={{
                            clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((index * sectorAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((index * sectorAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((((index + 1) * sectorAngle) - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((((index + 1) * sectorAngle) - 90) * Math.PI / 180)}%)`,
                          }}
                        >
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                              transform: `rotate(${index * sectorAngle + sectorAngle / 2}deg)`,
                            }}
                          >
                            <div className="text-center" style={{ transform: "translateY(-88px)" }}>
                              <div className="mb-1 text-4xl">{cuisineIcons[cuisine]}</div>
                              <div className="text-sm font-semibold tracking-[0.16em] text-white drop-shadow-lg">
                                {cuisine}
                              </div>
                              <div className="mt-1 text-[11px] text-white/76">
                                {aiCandidates.filter((item) => item.restaurant.category === cuisine).length} 家候选
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-[#f5b455] bg-white shadow-xl">
                          <div className="text-center">
                            <div className="text-xs uppercase tracking-[0.18em] text-[#915b18]">Spin</div>
                            <div className="mt-1 text-2xl font-semibold text-[#241b0e]">GO</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-2">
                    <div className="h-0 w-0 border-x-[18px] border-b-0 border-t-[32px] border-x-transparent border-t-[#fff7ec] drop-shadow-xl" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-4">
                <button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="inline-flex items-center gap-3 rounded-full bg-[linear-gradient(135deg,_#ffcf7e_0%,_#f59f3a_100%)] px-8 py-4 text-lg font-semibold text-[#2b1806] shadow-[0_20px_50px_rgba(245,159,58,0.4)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Shuffle className="h-5 w-5" />
                  {isSpinning ? "转盘加速中..." : "开始抽一把"}
                </button>

                <p className="text-sm text-white/70">
                  {useAiPoolForSpin
                    ? "已开启 AI 候选池，转盘会优先在更符合条件的餐厅里随机。"
                    : "当前是纯随机模式，适合彻底摆脱选择困难。"}
                </p>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {aiCandidates.slice(0, 3).map((item, index) => (
                  <div
                    key={item.restaurant.id}
                    className="rounded-[24px] border border-white/12 bg-white/10 p-4 text-white/84"
                  >
                    <div className="text-xs uppercase tracking-[0.18em] text-white/56">Top 0{index + 1}</div>
                    <div className="mt-2 font-semibold text-white">{item.restaurant.name}</div>
                    <div className="mt-1 text-sm text-white/68">
                      {item.restaurant.category} · {item.restaurant.walkTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[36px] border border-[#efe1c8] bg-white/92 p-6 shadow-[0_30px_90px_rgba(37,23,10,0.14)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#fff3dd] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#9a641f]">
                  <Bot className="h-4 w-4" />
                  AI 食力顾问
                </div>
                <h2 className="mt-3 text-3xl font-semibold text-[#241b0e]">先说条件，我来收窄答案</h2>
                <p className="mt-2 text-sm leading-7 text-[#6d5835]">
                  用本地规则模拟 AI 决策，把预算、场景、时效和偏好翻译成更合理的推荐，并且能直接反向驱动转盘候选池。
                </p>
              </div>
              <div className="rounded-full bg-[#faf6ee] p-3 text-[#9a641f]">
                <Brain className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="rounded-[24px] bg-[#faf6ee] px-4 py-4">
                <span className="text-xs uppercase tracking-[0.18em] text-[#8c7041]">校区</span>
                <select
                  value={decisionInputs.campus}
                  onChange={(event) => handleInputChange("campus", event.target.value)}
                  className="mt-2 w-full bg-transparent text-sm font-semibold text-[#241b0e] outline-none"
                >
                  <option value="不限">不限校区</option>
                  {campuses.map((campus) => (
                    <option key={campus} value={campus}>
                      {campus}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-[24px] bg-[#faf6ee] px-4 py-4">
                <span className="text-xs uppercase tracking-[0.18em] text-[#8c7041]">场景</span>
                <select
                  value={decisionInputs.scene}
                  onChange={(event) => handleInputChange("scene", event.target.value)}
                  className="mt-2 w-full bg-transparent text-sm font-semibold text-[#241b0e] outline-none"
                >
                  <option value="不限">不限场景</option>
                  {studentScenes.map((scene) => (
                    <option key={scene} value={scene}>
                      {scene}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-[24px] bg-[#faf6ee] px-4 py-4">
                <span className="text-xs uppercase tracking-[0.18em] text-[#8c7041]">预算</span>
                <select
                  value={decisionInputs.budget}
                  onChange={(event) => handleInputChange("budget", event.target.value as BudgetPreference)}
                  className="mt-2 w-full bg-transparent text-sm font-semibold text-[#241b0e] outline-none"
                >
                  <option value="不限">不限预算</option>
                  <option value="20">20 元以内</option>
                  <option value="30">30 元以内</option>
                  <option value="40+">40 元以上</option>
                </select>
              </label>

              <label className="rounded-[24px] bg-[#faf6ee] px-4 py-4">
                <span className="text-xs uppercase tracking-[0.18em] text-[#8c7041]">想吃类型</span>
                <select
                  value={decisionInputs.cuisine}
                  onChange={(event) => handleInputChange("cuisine", event.target.value)}
                  className="mt-2 w-full bg-transparent text-sm font-semibold text-[#241b0e] outline-none"
                >
                  <option value="不限">不限类型</option>
                  {cuisineTypes.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-[24px] bg-[#faf6ee] px-4 py-4">
                <span className="text-xs uppercase tracking-[0.18em] text-[#8c7041]">当前心情</span>
                <select
                  value={decisionInputs.mood}
                  onChange={(event) => handleInputChange("mood", event.target.value as MoodPreference)}
                  className="mt-2 w-full bg-transparent text-sm font-semibold text-[#241b0e] outline-none"
                >
                  <option value="稳妥不踩雷">稳妥不踩雷</option>
                  <option value="解压重口">解压重口</option>
                  <option value="轻盈健康">轻盈健康</option>
                  <option value="适合社交">适合社交</option>
                </select>
              </label>

              <label className="rounded-[24px] bg-[#faf6ee] px-4 py-4">
                <span className="text-xs uppercase tracking-[0.18em] text-[#8c7041]">用餐方式</span>
                <select
                  value={decisionInputs.diningMode}
                  onChange={(event) => handleInputChange("diningMode", event.target.value as DiningMode)}
                  className="mt-2 w-full bg-transparent text-sm font-semibold text-[#241b0e] outline-none"
                >
                  <option value="随便吃一口">随便吃一口</option>
                  <option value="一个人安静吃">一个人安静吃</option>
                  <option value="和室友一起">和室友一起</option>
                  <option value="请客别翻车">请客别翻车</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-[28px] bg-[#faf6ee] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-[#5f4a27]">
                  <input
                    type="checkbox"
                    checked={decisionInputs.onlyOpenNow}
                    onChange={(event) => handleInputChange("onlyOpenNow", event.target.checked)}
                    className="h-4 w-4 accent-[#d58d36]"
                  />
                  只看当前营业中
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-[#5f4a27]">
                  <Clock3 className="h-4 w-4 text-[#8c7041]" />
                  <select
                    value={decisionInputs.timeLimit}
                    onChange={(event) => handleInputChange("timeLimit", event.target.value as TimePreference)}
                    className="bg-transparent font-medium outline-none"
                  >
                    <option value="不限">不限制时长</option>
                    <option value="10 分钟内">10 分钟内</option>
                    <option value="20 分钟内">20 分钟内</option>
                  </select>
                </label>
              </div>

              <button
                onClick={handleAiDecision}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#241b0e] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#3a2a15]"
              >
                <Sparkles className="h-4 w-4" />
                生成 AI 推荐
              </button>
            </div>

            <div className="mt-6 rounded-[32px] bg-[linear-gradient(180deg,_#fffaf3_0%,_#fff4e4_100%)] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm uppercase tracking-[0.18em] text-[#9a641f]">AI Top Pick</div>
                  <h3 className="mt-2 text-2xl font-semibold text-[#241b0e]">
                    {aiPreview ? aiPreview.restaurant.name : "等待分析"}
                  </h3>
                </div>
                <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#9a641f] shadow-sm">
                  {aiPreview ? Math.round(aiPreview.score) : 0} 分
                </div>
              </div>

              {aiPreview ? (
                <div className="mt-5">
                  <div className="overflow-hidden rounded-[28px]">
                    <img
                      src={aiPreview.restaurant.imageUrl}
                      alt={aiPreview.restaurant.name}
                      className="h-52 w-full object-cover"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-sm text-[#6d5835]">
                      {aiPreview.restaurant.category}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-sm text-[#6d5835]">
                      {aiPreview.restaurant.walkTime}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-sm text-[#6d5835]">
                      ￥{aiPreview.restaurant.price}/人
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-sm text-[#6d5835]">
                      {getCampusZone(aiPreview.restaurant.campus)}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[#5f4a27]">{aiPreview.summary}</p>

                  <div className="mt-4 space-y-3">
                    {aiPreview.reasons.map((reason) => (
                      <div
                        key={reason}
                        className="rounded-[20px] bg-white px-4 py-3 text-sm text-[#5f4a27] shadow-sm"
                      >
                        {reason}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Link
                      to={`/restaurant/${aiPreview.restaurant.id}`}
                      className="rounded-2xl bg-[#241b0e] px-4 py-3 text-center text-sm font-medium text-white"
                    >
                      查看完整详情
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedRestaurant(aiPreview.restaurant);
                        startCouponTimer();
                      }}
                      className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-medium text-[#6d5835]"
                    >
                      直接采用这个答案
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {selectedRestaurant && !isSpinning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setSelectedRestaurant(null)}
          >
            <motion.div
              initial={{ scale: 0.88, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 30 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-3xl overflow-hidden rounded-[36px] border border-white/10 bg-[#fffaf3] shadow-[0_35px_120px_rgba(0,0,0,0.32)]"
            >
              <div className="grid md:grid-cols-[0.95fr_1.05fr]">
                <div className="relative min-h-[280px]">
                  <img
                    src={selectedRestaurant.imageUrl}
                    alt={selectedRestaurant.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,14,8,0.12)_0%,rgba(20,14,8,0.66)_100%)]" />
                  <div className="absolute left-6 top-6 rounded-full bg-white/16 px-4 py-2 text-sm text-white backdrop-blur">
                    {selectedRestaurant.category}
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#ffd38e] px-4 py-2 text-sm font-medium text-[#2c1a09]">
                      <Ticket className="h-4 w-4" />
                      抽中专属优惠
                    </div>
                    <h2 className="mt-4 text-4xl font-semibold text-white">{selectedRestaurant.name}</h2>
                    <p className="mt-3 text-sm leading-6 text-white/78">{selectedRestaurant.signature}</p>
                  </div>
                </div>

                <div className="p-6 md:p-7">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm uppercase tracking-[0.18em] text-[#9a641f]">Result</div>
                      <h3 className="mt-2 text-3xl font-semibold text-[#241b0e]">这次推荐可以直接执行</h3>
                    </div>
                    <button
                      onClick={() => setSelectedRestaurant(null)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5ede0] text-[#6d5835]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#faf6ee] px-3 py-1 text-sm text-[#6d5835]">
                      {selectedRestaurant.walkTime}
                    </span>
                    <span className="rounded-full bg-[#faf6ee] px-3 py-1 text-sm text-[#6d5835]">
                      ￥{selectedRestaurant.price}/人
                    </span>
                    <span className="rounded-full bg-[#faf6ee] px-3 py-1 text-sm text-[#6d5835]">
                      {getCampusZone(selectedRestaurant.campus)}
                    </span>
                    <span className="rounded-full bg-[#faf6ee] px-3 py-1 text-sm text-[#6d5835]">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-4 w-4 fill-[#d58d36] text-[#d58d36]" />
                        {selectedRestaurant.rating}
                      </span>
                    </span>
                  </div>

                  <div className="mt-5 rounded-[28px] bg-[linear-gradient(135deg,_#f5c66f_0%,_#df8334_100%)] p-5 text-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm text-white/80">本次优惠</div>
                        <div className="mt-2 text-4xl font-semibold">{getCouponValue(selectedRestaurant.price)}</div>
                        <div className="mt-2 text-sm text-white/82">{selectedRestaurant.deal}</div>
                      </div>
                      <div className="rounded-[24px] bg-white/16 px-4 py-3 text-center backdrop-blur">
                        <div className="text-xs uppercase tracking-[0.16em] text-white/68">倒计时</div>
                        <div className="mt-2 text-3xl font-semibold">{formatTime(timeRemaining)}</div>
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/18">
                      <motion.div
                        className="h-full rounded-full bg-white"
                        initial={{ width: "100%" }}
                        animate={{ width: `${(timeRemaining / (30 * 60)) * 100}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 rounded-[28px] bg-[#faf6ee] p-5">
                    <div className="text-sm uppercase tracking-[0.18em] text-[#9a641f]">推荐理由</div>
                    <p className="mt-3 text-sm leading-7 text-[#5f4a27]">{selectedRestaurant.recommendation}</p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => navigate(`/restaurant/${selectedRestaurant.id}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#241b0e] px-4 py-4 text-sm font-medium text-white"
                    >
                      <MapPin className="h-4 w-4" />
                      查看餐厅详情
                    </button>
                    <a
                      href={`tel:${selectedRestaurant.phone}`}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f3ebdc] px-4 py-4 text-sm font-medium text-[#5f4a27]"
                    >
                      <Phone className="h-4 w-4" />
                      直接联系
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

