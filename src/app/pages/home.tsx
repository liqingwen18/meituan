import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Clock3,
  Flame,
  Heart,
  MapPinned,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  TimerReset,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import {
  campuses,
  cuisineTypes,
  hotSearches,
  restaurants,
  studentScenes,
} from "../data/restaurants";
import { RestaurantCard } from "../components/restaurant-card";
import { useFavoriteRestaurants } from "../hooks/use-favorite-restaurants";
import {
  getCampusZone,
  getRestaurantMapPosition,
  getWalkMinutes,
  isRestaurantOpen,
} from "../lib/restaurant-utils";

const budgetOptions = [
  { label: "全部预算", value: "全部" },
  { label: "20 元以内", value: "20" },
  { label: "30 元以内", value: "30" },
  { label: "40 元以上", value: "40+" },
];

const sortOptions = [
  { label: "智能推荐", value: "smart" },
  { label: "离我最近", value: "distance" },
  { label: "评分最高", value: "rating" },
  { label: "人均最低", value: "price" },
];

export function Home() {
  const { favoriteCount, favoriteIds, isFavorite, toggleFavorite } = useFavoriteRestaurants();
  const [selectedCampus, setSelectedCampus] = useState("全部校区");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedScene, setSelectedScene] = useState("全部");
  const [selectedBudget, setSelectedBudget] = useState("全部");
  const [sortBy, setSortBy] = useState("smart");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyGroupOrders, setOnlyGroupOrders] = useState(false);
  const [activeMapRestaurantId, setActiveMapRestaurantId] = useState<string | null>(
    restaurants[0]?.id ?? null,
  );
  const deferredSearch = useDeferredValue(searchQuery.trim().toLowerCase());

  const filteredRestaurants = [...restaurants]
    .filter((restaurant) => {
      const searchableText = [
        restaurant.name,
        restaurant.category,
        restaurant.campus,
        restaurant.signature,
        restaurant.deal,
        restaurant.recommendation,
        restaurant.tags.join(" "),
        restaurant.scenes.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !deferredSearch || searchableText.includes(deferredSearch);
      const matchesCampus =
        selectedCampus === "全部校区" || restaurant.campus === selectedCampus;
      const matchesCategory =
        selectedCategory === "全部" || restaurant.category === selectedCategory;
      const matchesScene =
        selectedScene === "全部" || restaurant.scenes.includes(selectedScene);
      const matchesBudget =
        selectedBudget === "全部"
          ? true
          : selectedBudget === "20"
            ? restaurant.price <= 20
            : selectedBudget === "30"
              ? restaurant.price <= 30
              : restaurant.price >= 40;
      const matchesOpen = !onlyOpen || isRestaurantOpen(restaurant.hours);
      const matchesFavorite = !onlyFavorites || favoriteIds.includes(restaurant.id);
      const matchesGroup = !onlyGroupOrders || (restaurant.currentOrders ?? 0) > 0;

      return (
        matchesSearch &&
        matchesCampus &&
        matchesCategory &&
        matchesScene &&
        matchesBudget &&
        matchesOpen &&
        matchesFavorite &&
        matchesGroup
      );
    })
    .sort((left, right) => {
      if (sortBy === "distance") {
        return getWalkMinutes(left.walkTime) - getWalkMinutes(right.walkTime);
      }

      if (sortBy === "rating") {
        return right.rating - left.rating;
      }

      if (sortBy === "price") {
        return left.price - right.price;
      }

      const getSmartScore = (restaurant: (typeof restaurants)[number]) =>
        restaurant.rating * 20 +
        Math.max(0, 14 - getWalkMinutes(restaurant.walkTime)) +
        (restaurant.currentOrders ?? 0) * 2 +
        (isRestaurantOpen(restaurant.hours) ? 8 : 0) +
        (favoriteIds.includes(restaurant.id) ? 3 : 0);

      return getSmartScore(right) - getSmartScore(left);
    });

  useEffect(() => {
    if (!filteredRestaurants.length) {
      setActiveMapRestaurantId(null);
      return;
    }

    if (!filteredRestaurants.some((restaurant) => restaurant.id === activeMapRestaurantId)) {
      setActiveMapRestaurantId(filteredRestaurants[0].id);
    }
  }, [activeMapRestaurantId, filteredRestaurants]);

  const activeMapRestaurant =
    filteredRestaurants.find((restaurant) => restaurant.id === activeMapRestaurantId) ??
    filteredRestaurants[0] ??
    null;

  const openRestaurantsCount = filteredRestaurants.filter((restaurant) =>
    isRestaurantOpen(restaurant.hours),
  ).length;
  const averageRating = filteredRestaurants.length
    ? (
        filteredRestaurants.reduce((sum, restaurant) => sum + restaurant.rating, 0) /
        filteredRestaurants.length
      ).toFixed(1)
    : "0.0";
  const campusCount = new Set(filteredRestaurants.map((restaurant) => restaurant.campus)).size;
  const topPicks = filteredRestaurants.slice(0, 3);
  const groupOrderRestaurants = filteredRestaurants
    .filter((restaurant) => (restaurant.currentOrders ?? 0) > 0)
    .slice(0, 3);

  const applyHotSearch = (type: string, value: string, label: string) => {
    startTransition(() => {
      if (type === "scene") {
        setSelectedScene(label);
        return;
      }

      if (type === "budget") {
        setSelectedBudget(value);
        return;
      }

      if (type === "group") {
        setOnlyGroupOrders(true);
        return;
      }

      if (type === "sort") {
        setSortBy(value);
        return;
      }

      setSearchQuery(label);
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,214,153,0.45),_transparent_38%),linear-gradient(180deg,_#fff7eb_0%,_#fffaf4_38%,_#f7f4ec_100%)] pb-28">
      <div className="mx-auto max-w-7xl px-4 pt-4 md:px-6">
        <div className="sticky top-3 z-40 rounded-[28px] border border-white/70 bg-white/78 px-4 py-4 shadow-[0_18px_60px_rgba(120,74,15,0.12)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#7f6434]">
                <MapPinned className="h-4 w-4" />
                大学城美食地图
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9f865d]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="搜索店名、口味、场景，例如：夜宵、图书馆附近"
                  className="w-full rounded-2xl border border-[#ecd8b4] bg-[#fffaf3] py-3.5 pl-12 pr-4 text-sm text-[#2d2415] outline-none transition focus:border-[#d9a44d] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:w-[360px]">
              <label className="rounded-2xl border border-[#ecd8b4] bg-[#fffaf3] px-4 py-3">
                <span className="mb-1 block text-xs font-medium text-[#8f7446]">校区</span>
                <select
                  value={selectedCampus}
                  onChange={(event) => setSelectedCampus(event.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-[#2d2415] outline-none"
                >
                  <option value="全部校区">全部校区</option>
                  {campuses.map((campus) => (
                    <option key={campus} value={campus}>
                      {campus}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-2xl border border-[#ecd8b4] bg-[#fffaf3] px-4 py-3">
                <span className="mb-1 block text-xs font-medium text-[#8f7446]">排序</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-[#2d2415] outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <main className="space-y-6 py-6">
          <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="relative overflow-hidden rounded-[36px] bg-[#173026] p-7 text-white shadow-[0_24px_80px_rgba(20,40,30,0.22)]"
            >
              <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-[#d7b06f]/20 blur-3xl" />
              <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-[#f6e4bf]/12 blur-3xl" />
              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/88">
                  <Sparkles className="h-4 w-4 text-[#ffd18b]" />
                  覆盖 3 所高校，解决“今天吃什么”
                </div>

                <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
                  为大学城做一张真正能用的
                  <span className="block text-[#ffd18b]">学生本地美食地图</span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-white/76 md:text-base">
                  不再在外卖、短视频、群聊和学长学姐口碑之间来回切换。这里把校区周边餐馆、步行距离、预算、拼单热度和学生评价放在一张页面里。
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur">
                    <div className="text-sm text-white/68">当前筛到</div>
                    <div className="mt-3 text-3xl font-semibold">{filteredRestaurants.length}</div>
                    <div className="mt-2 text-xs text-white/68">家店，覆盖 {campusCount || 0} 个校区</div>
                  </div>
                  <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur">
                    <div className="text-sm text-white/68">营业中</div>
                    <div className="mt-3 text-3xl font-semibold">{openRestaurantsCount}</div>
                    <div className="mt-2 text-xs text-white/68">家，适合立刻出门</div>
                  </div>
                  <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur">
                    <div className="text-sm text-white/68">学生平均评分</div>
                    <div className="mt-3 flex items-end gap-2 text-3xl font-semibold">
                      {averageRating}
                      <span className="pb-1 text-sm text-white/68">/ 5.0</span>
                    </div>
                    <div className="mt-2 text-xs text-white/68">收藏 {favoriteCount} 家宝藏店</div>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-2">
                  {hotSearches.map((search) => (
                    <button
                      key={search.label}
                      onClick={() => applyHotSearch(search.type, search.value, search.label)}
                      className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm text-white/88 transition hover:bg-white/14"
                    >
                      {search.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="grid gap-4">
              <Link
                to="/lucky-draw"
                className="group rounded-[32px] bg-[linear-gradient(135deg,_#f5c66f_0%,_#dd7b37_100%)] p-6 text-[#2d1603] shadow-[0_20px_60px_rgba(193,101,24,0.22)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#7d3c02]">
                      <Sparkles className="h-4 w-4" />
                      决策辅助
                    </div>
                    <div className="text-2xl font-semibold">今天吃什么转盘</div>
                    <p className="mt-2 text-sm leading-6 text-[#543012]">
                      适合没时间纠结时快速抽一个答案，还附带学生优惠券。
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </div>
              </Link>

              <div className="rounded-[32px] border border-white/80 bg-white/82 p-6 shadow-[0_20px_60px_rgba(118,93,43,0.08)] backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#846736]">
                      本周趋势
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#241b0e]">
                      学生最常用的决策方式
                    </div>
                  </div>
                  <SlidersHorizontal className="h-5 w-5 text-[#9f824f]" />
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl bg-[#f6efe0] p-4">
                    <div className="flex items-center justify-between text-sm text-[#6b5227]">
                      <span>预算友好</span>
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#241b0e]">
                      {
                        restaurants.filter((restaurant) => restaurant.scenes.includes("预算友好"))
                          .length
                      }
                      <span className="ml-1 text-sm font-medium text-[#6b5227]">家可选</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#eef4ea] p-4">
                    <div className="flex items-center justify-between text-sm text-[#45624a]">
                      <span>夜宵持续营业</span>
                      <Clock3 className="h-4 w-4" />
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#16261b]">
                      {
                        restaurants.filter((restaurant) => restaurant.scenes.includes("夜宵"))
                          .length
                      }
                      <span className="ml-1 text-sm font-medium text-[#45624a]">家常备</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/70 bg-white/84 p-5 shadow-[0_22px_70px_rgba(118,93,43,0.08)] backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#846736]">
                  学生筛选器
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-[#241b0e]">
                  按场景、预算和是否营业，快速缩到可执行答案
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setOnlyOpen((current) => !current)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    onlyOpen
                      ? "bg-[#173026] text-white"
                      : "bg-[#f6efe0] text-[#6c5427] hover:bg-[#efe5d1]"
                  }`}
                >
                  只看营业中
                </button>
                <button
                  onClick={() => setOnlyFavorites((current) => !current)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    onlyFavorites
                      ? "bg-[#8f4038] text-white"
                      : "bg-[#f8ecea] text-[#8f4038] hover:bg-[#f2dfdb]"
                  }`}
                >
                  只看收藏
                </button>
                <button
                  onClick={() => setOnlyGroupOrders((current) => !current)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    onlyGroupOrders
                      ? "bg-[#e08c2d] text-white"
                      : "bg-[#fff1dc] text-[#9a641f] hover:bg-[#fde4bc]"
                  }`}
                >
                  只看拼单中
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("全部")}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  selectedCategory === "全部"
                    ? "bg-[#241b0e] text-white"
                    : "bg-[#f7f4ec] text-[#5a4726] hover:bg-[#f0eadb]"
                }`}
              >
                全部品类
              </button>
              {cuisineTypes.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    selectedCategory === category
                      ? "bg-[#241b0e] text-white"
                      : "bg-[#f7f4ec] text-[#5a4726] hover:bg-[#f0eadb]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedScene("全部")}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  selectedScene === "全部"
                    ? "bg-[#d58d36] text-white"
                    : "bg-[#fff4e6] text-[#8a5d1e] hover:bg-[#fde8c8]"
                }`}
              >
                全部场景
              </button>
              {studentScenes.map((scene) => (
                <button
                  key={scene}
                  onClick={() => setSelectedScene(scene)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    selectedScene === scene
                      ? "bg-[#d58d36] text-white"
                      : "bg-[#fff4e6] text-[#8a5d1e] hover:bg-[#fde8c8]"
                  }`}
                >
                  {scene}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {budgetOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedBudget(option.value)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    selectedBudget === option.value
                      ? "bg-[#e7ddc7] text-[#23190e]"
                      : "bg-[#faf7ef] text-[#725e3a] hover:bg-[#f1eadc]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
          <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="relative overflow-hidden rounded-[36px] bg-[#1f3328] p-6 text-white shadow-[0_26px_80px_rgba(24,42,33,0.22)]">
              <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_0)] [background-size:28px_28px]" />
              <div className="absolute left-6 top-20 h-px w-[72%] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="absolute left-14 top-[52%] h-px w-[65%] bg-gradient-to-r from-transparent via-white/18 to-transparent" />
              <div className="absolute right-8 top-10 h-56 w-56 rounded-full border border-white/12" />
              <div className="absolute left-12 bottom-10 h-40 w-40 rounded-full border border-white/10" />

              <div className="relative z-10">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d8c8a7]">
                      Map View
                    </div>
                    <h2 className="mt-2 text-2xl font-semibold">校区热区地图</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/72">
                      不接外部地图服务，也能先把“食物分布 + 决策路径”表达清楚。点击热区点位，右侧直接看推荐理由。
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm text-white/78">
                    <Store className="h-4 w-4" />
                    当前显示 {filteredRestaurants.length} 个点位
                  </div>
                </div>

                <div className="relative mt-8 h-[420px] overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0.02))]">
                  <div className="absolute left-6 top-6 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/76">
                    步行生活圈
                  </div>
                  <div className="absolute right-6 top-6 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/76">
                    适配校区联盟浏览
                  </div>

                  {filteredRestaurants.map((restaurant, index) => {
                    const position = getRestaurantMapPosition(restaurant, filteredRestaurants);
                    const isActive = restaurant.id === activeMapRestaurant?.id;

                    return (
                      <motion.button
                        key={restaurant.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setActiveMapRestaurantId(restaurant.id)}
                        className="absolute"
                        style={{
                          left: `calc(${position.left}% - 16px)`,
                          top: `calc(${position.top}% - 16px)`,
                        }}
                      >
                        <div
                          className={`relative flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition ${
                            isActive
                              ? "border-[#ffd38e] bg-[#ffd38e] text-[#2c1a09] shadow-[0_0_0_10px_rgba(255,211,142,0.12)]"
                              : "border-white/18 bg-white text-[#173026] shadow-[0_14px_34px_rgba(0,0,0,0.16)]"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="mt-2 min-w-[90px] -translate-x-1/3 rounded-2xl border border-white/12 bg-black/18 px-3 py-2 text-left text-[11px] leading-5 text-white/80 backdrop-blur">
                          <div className="font-semibold text-white">{restaurant.name}</div>
                          <div>{getCampusZone(restaurant.campus)}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-[36px] border border-white/70 bg-white/86 p-5 shadow-[0_22px_70px_rgba(118,93,43,0.08)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#846736]">
                    地图焦点
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold text-[#241b0e]">
                    {activeMapRestaurant ? activeMapRestaurant.name : "暂无匹配结果"}
                  </h2>
                </div>
                {activeMapRestaurant && (
                  <button
                    onClick={() => toggleFavorite(activeMapRestaurant.id)}
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                      isFavorite(activeMapRestaurant.id)
                        ? "bg-[#8f4038] text-white"
                        : "bg-[#f8ecea] text-[#8f4038] hover:bg-[#f2dfdb]"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isFavorite(activeMapRestaurant.id) ? "fill-current" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {activeMapRestaurant ? (
                <>
                  <div className="mt-5 overflow-hidden rounded-[28px]">
                    <img
                      src={activeMapRestaurant.imageUrl}
                      alt={activeMapRestaurant.name}
                      className="h-52 w-full object-cover"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#fff2da] px-3 py-1 text-sm text-[#8a5d1e]">
                      {activeMapRestaurant.category}
                    </span>
                    <span className="rounded-full bg-[#eef4ea] px-3 py-1 text-sm text-[#45624a]">
                      {isRestaurantOpen(activeMapRestaurant.hours) ? "营业中" : "已休息"}
                    </span>
                    <span className="rounded-full bg-[#f4efe4] px-3 py-1 text-sm text-[#6d5835]">
                      {getCampusZone(activeMapRestaurant.campus)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-[#6d5835]">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#d58d36] text-[#d58d36]" />
                      {activeMapRestaurant.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <TimerReset className="h-4 w-4 text-[#8c7041]" />
                      {activeMapRestaurant.walkTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Wallet className="h-4 w-4 text-[#8c7041]" />￥{activeMapRestaurant.price}/人
                    </div>
                  </div>

                  <div className="mt-4 rounded-[24px] bg-[#f7f3ea] p-4">
                    <div className="text-sm font-medium text-[#8c7041]">为什么适合学生</div>
                    <div className="mt-2 text-lg font-semibold text-[#241b0e]">
                      {activeMapRestaurant.signature}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#5f4a27]">
                      {activeMapRestaurant.recommendation}
                    </p>
                    <div className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm text-[#724d16]">
                      当前活动：{activeMapRestaurant.deal}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeMapRestaurant.scenes.map((scene) => (
                      <span
                        key={scene}
                        className="rounded-full border border-[#ecd8b4] bg-[#fffaf3] px-3 py-1 text-sm text-[#6a5129]"
                      >
                        {scene}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Link
                      to={`/restaurant/${activeMapRestaurant.id}`}
                      className="rounded-2xl bg-[#241b0e] px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-[#3a2a15]"
                    >
                      看完整详情
                    </Link>
                    <a
                      href={`https://www.google.com/maps?q=${activeMapRestaurant.location.lat},${activeMapRestaurant.location.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-[#f4efe4] px-4 py-3 text-center text-sm font-medium text-[#5f4a27] transition hover:bg-[#ebe2d2]"
                    >
                      直接导航
                    </a>
                  </div>
                </>
              ) : (
                <div className="mt-8 rounded-[28px] bg-[#f7f3ea] p-8 text-center text-sm leading-6 text-[#6d5835]">
                  当前筛选条件没有结果，建议放宽校区、预算或场景限制。
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[32px] border border-white/70 bg-white/86 p-5 shadow-[0_22px_70px_rgba(118,93,43,0.08)] backdrop-blur">
              <div className="mb-4 flex items-center gap-2 text-[#241b0e]">
                <Flame className="h-5 w-5 text-[#d58d36]" />
                <h3 className="text-xl font-semibold">今晚适合吃</h3>
              </div>
              <div className="space-y-3">
                {topPicks.map((restaurant, index) => (
                  <Link
                    key={restaurant.id}
                    to={`/restaurant/${restaurant.id}`}
                    className="flex items-center gap-4 rounded-[24px] bg-[#faf6ee] p-4 transition hover:bg-[#f4ecdd]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#241b0e] text-sm font-semibold text-white">
                      0{index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-[#241b0e]">{restaurant.name}</div>
                      <div className="mt-1 text-sm text-[#6d5835]">
                        {restaurant.signature} · {restaurant.walkTime}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/86 p-5 shadow-[0_22px_70px_rgba(118,93,43,0.08)] backdrop-blur">
              <div className="mb-4 flex items-center gap-2 text-[#241b0e]">
                <Sparkles className="h-5 w-5 text-[#d58d36]" />
                <h3 className="text-xl font-semibold">拼单热度</h3>
              </div>
              <div className="space-y-3">
                {groupOrderRestaurants.length ? (
                  groupOrderRestaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="rounded-[24px] bg-[#fff4e6] p-4 text-[#6d4a1e]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-[#241b0e]">{restaurant.name}</div>
                          <div className="mt-1 text-sm">{restaurant.deal}</div>
                        </div>
                        <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#b16d1e]">
                          {restaurant.currentOrders} 人
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] bg-[#f7f3ea] p-6 text-sm text-[#6d5835]">
                    当前筛选条件下暂无拼单中店铺。
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/86 p-5 shadow-[0_22px_70px_rgba(118,93,43,0.08)] backdrop-blur">
              <div className="mb-4 flex items-center gap-2 text-[#241b0e]">
                <MapPinned className="h-5 w-5 text-[#d58d36]" />
                <h3 className="text-xl font-semibold">校区覆盖</h3>
              </div>
              <div className="space-y-3">
                {campuses.map((campus) => {
                  const count = restaurants.filter((restaurant) => restaurant.campus === campus).length;
                  return (
                    <div
                      key={campus}
                      className="flex items-center justify-between rounded-[24px] bg-[#f7f3ea] px-4 py-4"
                    >
                      <div>
                        <div className="font-medium text-[#241b0e]">{getCampusZone(campus)}</div>
                        <div className="mt-1 text-sm text-[#6d5835]">{campus}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-semibold text-[#241b0e]">{count}</div>
                        <div className="text-xs uppercase tracking-[0.16em] text-[#8c7041]">
                          Spots
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-[36px] border border-white/70 bg-white/88 p-6 shadow-[0_22px_70px_rgba(118,93,43,0.08)] backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#846736]">
                  全量浏览
                </div>
                <h2 className="mt-2 text-3xl font-semibold text-[#241b0e]">全部餐厅</h2>
                <p className="mt-2 text-sm text-[#6d5835]">
                  把校区、预算、学生场景和口碑信息放在一张列表里，适合快速横向比较。
                </p>
              </div>
              <div className="text-sm text-[#6d5835]">
                共找到 <span className="font-semibold text-[#241b0e]">{filteredRestaurants.length}</span> 家
              </div>
            </div>

            {filteredRestaurants.length ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isFavorite={isFavorite(restaurant.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[32px] bg-[#faf6ee] px-6 py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#9a641f] shadow-sm">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[#241b0e]">没有找到匹配餐厅</h3>
                <p className="mt-2 text-sm leading-6 text-[#6d5835]">
                  可以先取消“只看收藏 / 只看拼单中”，或把预算恢复到“全部预算”再试。
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
