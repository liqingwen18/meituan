import { useState } from "react";
import { Link } from "react-router";
import {
  ChevronRight,
  Gift,
  Heart,
  MapPinned,
  Settings,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { mockCoupons } from "../data/coupons";
import { restaurants } from "../data/restaurants";
import { useFavoriteRestaurants } from "../hooks/use-favorite-restaurants";
import { getCampusZone } from "../lib/restaurant-utils";

export function Profile() {
  const [activeTab, setActiveTab] = useState<"coupons" | "favorites">("coupons");
  const { favoriteIds } = useFavoriteRestaurants();
  const favoriteRestaurants = restaurants.filter((restaurant) => favoriteIds.includes(restaurant.id));
  const activeCoupons = mockCoupons.filter((coupon) => !coupon.isUsed);
  const favoriteCampusCount = new Set(favoriteRestaurants.map((restaurant) => restaurant.campus)).size;
  const favoriteScenes = [...new Set(favoriteRestaurants.flatMap((restaurant) => restaurant.scenes))].slice(0, 5);
  const favoriteCollections = [
    {
      id: "late-night",
      label: "夜宵候选",
      restaurants: favoriteRestaurants.filter((restaurant) => restaurant.scenes.includes("夜宵")),
    },
    {
      id: "study",
      label: "自习友好",
      restaurants: favoriteRestaurants.filter((restaurant) => restaurant.scenes.includes("自习友好")),
    },
    {
      id: "group",
      label: "宿舍聚餐",
      restaurants: favoriteRestaurants.filter((restaurant) => restaurant.scenes.includes("宿舍聚餐")),
    },
  ].filter((collection) => collection.restaurants.length);

  const formatTime = (date: Date) => {
    const diff = date.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours >= 24) {
      return `${Math.floor(hours / 24)} 天后过期`;
    }

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${Math.max(hours, 0)} 小时 ${Math.max(minutes, 0)} 分钟后过期`;
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fff8ed_0%,_#fffaf4_34%,_#f7f4ec_100%)] pb-28">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,_#193128_0%,_#2f4b3d_58%,_#d48e34_100%)] text-white">
        <div className="absolute -left-10 top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[#ffd38e]/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/12 text-3xl backdrop-blur">
                👨‍🎓
              </div>
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-white/68">Campus Food Persona</div>
                <h1 className="mt-2 text-3xl font-semibold">校园美食家</h1>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-1 text-sm text-white/84">
                  桂林高校联盟 · 本地觅食中
                </div>
              </div>
            </div>

            <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 backdrop-blur">
              <Settings className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-[28px] border border-white/14 bg-white/10 p-5 backdrop-blur">
              <div className="text-sm text-white/70">可用优惠券</div>
              <div className="mt-2 text-3xl font-semibold">{activeCoupons.length}</div>
            </div>
            <div className="rounded-[28px] border border-white/14 bg-white/10 p-5 backdrop-blur">
              <div className="text-sm text-white/70">收藏餐厅</div>
              <div className="mt-2 text-3xl font-semibold">{favoriteRestaurants.length}</div>
            </div>
            <div className="rounded-[28px] border border-white/14 bg-white/10 p-5 backdrop-blur">
              <div className="text-sm text-white/70">覆盖校区</div>
              <div className="mt-2 text-3xl font-semibold">{favoriteCampusCount}</div>
            </div>
            <div className="rounded-[28px] border border-white/14 bg-white/10 p-5 backdrop-blur">
              <div className="text-sm text-white/70">偏好场景</div>
              <div className="mt-2 text-3xl font-semibold">{favoriteScenes.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0d7] text-[#9a641f]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-[#241b0e]">我的偏好</div>
                <div className="text-sm text-[#6d5835]">常去场景和收藏趋势</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {favoriteScenes.length ? (
                favoriteScenes.map((scene) => (
                  <span
                    key={scene}
                    className="rounded-full bg-[#faf6ee] px-3 py-1 text-sm text-[#6d5835]"
                  >
                    {scene}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#8c7041]">还没有收藏，先去首页逛逛。</span>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef7ee] text-[#245031]">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-[#241b0e]">常驻校区</div>
                <div className="text-sm text-[#6d5835]">收藏主要分布</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {favoriteRestaurants.slice(0, 3).map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="rounded-2xl bg-[#faf6ee] px-4 py-3 text-sm text-[#5f4a27]"
                >
                  {getCampusZone(restaurant.campus)} · {restaurant.name}
                </div>
              ))}
              {!favoriteRestaurants.length && (
                <div className="rounded-2xl bg-[#faf6ee] px-4 py-3 text-sm text-[#8c7041]">
                  收藏后会自动生成常去校区画像。
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8ecea] text-[#8f4038]">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-[#241b0e]">我的宝藏夹</div>
                <div className="text-sm text-[#6d5835]">收藏自动归档</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-[#5f4a27]">
              已生成 {favoriteCollections.length} 个主题收藏夹，适合下次直接按场景决策。
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/80 bg-white/90 p-2 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("coupons")}
              className={`flex-1 rounded-[24px] px-4 py-3 text-sm font-medium transition ${
                activeTab === "coupons"
                  ? "bg-[#241b0e] text-white"
                  : "text-[#6d5835] hover:bg-[#faf6ee]"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Ticket className="h-4 w-4" />
                我的卡券
              </div>
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex-1 rounded-[24px] px-4 py-3 text-sm font-medium transition ${
                activeTab === "favorites"
                  ? "bg-[#241b0e] text-white"
                  : "text-[#6d5835] hover:bg-[#faf6ee]"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Heart className="h-4 w-4" />
                宝藏清单
              </div>
            </button>
          </div>
        </section>

        {activeTab === "coupons" ? (
          <section className="space-y-4">
            {activeCoupons.length ? (
              activeCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="overflow-hidden rounded-[32px] border border-white/80 bg-white/90 shadow-[0_18px_60px_rgba(118,93,43,0.08)]"
                >
                  <div className="h-1 bg-[linear-gradient(90deg,_#d48e34,_#efbb68)]" />
                  <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#fff0d7] text-[#9a641f]">
                      <Ticket className="h-8 w-8" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-2xl font-semibold text-[#241b0e]">{coupon.discount}</div>
                      <div className="mt-2 text-sm text-[#6d5835]">{coupon.description}</div>
                      <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#8c7041]">
                        <span>{coupon.restaurantName}</span>
                        <span>{formatTime(coupon.expiresAt)}</span>
                      </div>
                    </div>
                    <Link
                      to={`/restaurant/${coupon.restaurantId}`}
                      className="inline-flex items-center justify-center rounded-2xl bg-[#241b0e] px-5 py-3 text-sm font-medium text-white"
                    >
                      去使用
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[32px] border border-white/80 bg-white/90 p-10 text-center shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#faf6ee] text-[#9a641f]">
                  <Gift className="h-8 w-8" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-[#241b0e]">还没有优惠券</h2>
                <p className="mt-3 text-sm leading-6 text-[#6d5835]">
                  去转盘页抽一下，适合做活动演示和产品功能展示。
                </p>
                <Link
                  to="/lucky-draw"
                  className="mt-6 inline-flex rounded-2xl bg-[#241b0e] px-6 py-3 text-sm font-medium text-white"
                >
                  去转盘抽奖
                </Link>
              </div>
            )}
          </section>
        ) : (
          <section className="space-y-5">
            {favoriteRestaurants.length ? (
              <>
                {favoriteCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(118,93,43,0.08)]"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-xl font-semibold text-[#241b0e]">{collection.label}</div>
                        <div className="mt-1 text-sm text-[#6d5835]">
                          自动按收藏中的学生场景生成
                        </div>
                      </div>
                      <span className="rounded-full bg-[#faf6ee] px-3 py-1 text-sm text-[#8c7041]">
                        {collection.restaurants.length} 家
                      </span>
                    </div>
                    <div className="space-y-3">
                      {collection.restaurants.map((restaurant) => (
                        <Link
                          key={restaurant.id}
                          to={`/restaurant/${restaurant.id}`}
                          className="flex items-center gap-4 rounded-[24px] bg-[#faf6ee] p-4 transition hover:bg-[#f3ecdc]"
                        >
                          <img
                            src={restaurant.imageUrl}
                            alt={restaurant.name}
                            className="h-20 w-20 rounded-2xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold text-[#241b0e]">{restaurant.name}</div>
                            <div className="mt-1 text-sm text-[#6d5835]">
                              {restaurant.category} · {restaurant.walkTime}
                            </div>
                            <div className="mt-2 text-sm text-[#8c7041]">{restaurant.signature}</div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-[#8c7041]" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {!favoriteCollections.length && (
                  <div className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
                    <h2 className="text-2xl font-semibold text-[#241b0e]">全部收藏</h2>
                    <div className="mt-4 space-y-3">
                      {favoriteRestaurants.map((restaurant) => (
                        <Link
                          key={restaurant.id}
                          to={`/restaurant/${restaurant.id}`}
                          className="flex items-center gap-4 rounded-[24px] bg-[#faf6ee] p-4 transition hover:bg-[#f3ecdc]"
                        >
                          <img
                            src={restaurant.imageUrl}
                            alt={restaurant.name}
                            className="h-20 w-20 rounded-2xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold text-[#241b0e]">{restaurant.name}</div>
                            <div className="mt-1 text-sm text-[#6d5835]">
                              {restaurant.category} · {restaurant.walkTime}
                            </div>
                            <div className="mt-2 text-sm text-[#8c7041]">{restaurant.signature}</div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-[#8c7041]" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-[32px] border border-white/80 bg-white/90 p-10 text-center shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#faf6ee] text-[#8f4038]">
                  <Heart className="h-8 w-8" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-[#241b0e]">还没有收藏</h2>
                <p className="mt-3 text-sm leading-6 text-[#6d5835]">
                  在首页或详情页点一下爱心，个人页会自动生成你的宝藏清单。
                </p>
                <Link
                  to="/"
                  className="mt-6 inline-flex rounded-2xl bg-[#241b0e] px-6 py-3 text-sm font-medium text-white"
                >
                  去逛首页
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
