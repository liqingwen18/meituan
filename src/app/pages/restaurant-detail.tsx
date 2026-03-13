import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Bike,
  Clock3,
  Flame,
  Heart,
  MapPin,
  Phone,
  Share2,
  Sparkles,
  Star,
  Ticket,
  TriangleAlert,
  Users,
} from "lucide-react";
import { restaurants } from "../data/restaurants";
import { useFavoriteRestaurants } from "../hooks/use-favorite-restaurants";
import { getCampusZone, isRestaurantOpen } from "../lib/restaurant-utils";

export function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavoriteRestaurants();
  const restaurant = restaurants.find((item) => item.id === id);

  if (!restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf7ef] px-4">
        <div className="max-w-md rounded-[32px] border border-white/80 bg-white/90 p-10 text-center shadow-[0_20px_60px_rgba(118,93,43,0.08)]">
          <div className="text-5xl">🍜</div>
          <h1 className="mt-4 text-2xl font-semibold text-[#241b0e]">餐厅不存在</h1>
          <p className="mt-3 text-sm leading-6 text-[#6d5835]">
            这个店铺可能还没加入地图，或者链接已经失效。
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-2xl bg-[#241b0e] px-6 py-3 text-sm font-medium text-white"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const openNow = isRestaurantOpen(restaurant.hours);
  const relatedRestaurants = restaurants
    .filter(
      (item) =>
        item.id !== restaurant.id &&
        (item.campus === restaurant.campus || item.category === restaurant.category),
    )
    .slice(0, 3);

  const handleShare = async () => {
    const shareData = {
      title: restaurant.name,
      text: `${restaurant.name} · ${restaurant.signature}`,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      window.alert("链接已复制，可以发给室友了。");
      return;
    }

    window.alert(window.location.href);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fff8ed_0%,_#fffaf4_30%,_#f7f4ec_100%)] pb-28">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="h-[420px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,12,8,0.32)_0%,rgba(15,12,8,0.65)_65%,rgba(255,248,237,1)_100%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-6 md:px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/88 text-[#241b0e] shadow-lg backdrop-blur"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/88 text-[#241b0e] shadow-lg backdrop-blur"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => toggleFavorite(restaurant.id)}
                className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur ${
                  isFavorite(restaurant.id)
                    ? "bg-[#8f4038] text-white"
                    : "bg-white/88 text-[#8f4038]"
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite(restaurant.id) ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          <div className="pb-16 pt-28 text-white md:pb-24">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm backdrop-blur">
                {restaurant.category}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm backdrop-blur">
                {getCampusZone(restaurant.campus)}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  openNow ? "bg-[#d7f0d9] text-[#1f5a2d]" : "bg-white/90 text-[#6d5835]"
                }`}
              >
                {openNow ? "营业中" : "休息中"}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-4xl font-semibold md:text-5xl">{restaurant.name}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/76 md:text-base">
                  {restaurant.recommendation}
                </p>
              </div>
              <div className="rounded-[28px] border border-white/12 bg-white/10 px-6 py-5 backdrop-blur">
                <div className="text-sm text-white/70">学生人均</div>
                <div className="mt-2 text-4xl font-semibold">￥{restaurant.price}</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-white/72">
                  <Star className="h-4 w-4 fill-[#ffd38e] text-[#ffd38e]" />
                  {restaurant.rating} 分
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-8 max-w-7xl space-y-6 px-4 md:px-6">
        <section className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
            <div className="text-sm text-[#8c7041]">步行到店</div>
            <div className="mt-2 text-2xl font-semibold text-[#241b0e]">{restaurant.walkTime}</div>
          </div>
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
            <div className="text-sm text-[#8c7041]">骑行效率</div>
            <div className="mt-2 text-2xl font-semibold text-[#241b0e]">
              {restaurant.bikeTime ?? "步行更方便"}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
            <div className="text-sm text-[#8c7041]">拼单热度</div>
            <div className="mt-2 text-2xl font-semibold text-[#241b0e]">
              {restaurant.currentOrders ? `${restaurant.currentOrders} 人` : "暂无"}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
            <div className="text-sm text-[#8c7041]">学生活动</div>
            <div className="mt-2 text-lg font-semibold text-[#241b0e]">{restaurant.deal}</div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
              <div className="mb-4 flex items-center gap-2 text-[#241b0e]">
                <Sparkles className="h-5 w-5 text-[#d58d36]" />
                <h2 className="text-2xl font-semibold">学生决策板</h2>
              </div>
              <div className="rounded-[28px] bg-[#faf6ee] p-5">
                <div className="text-sm font-medium uppercase tracking-[0.18em] text-[#8c7041]">
                  Signature
                </div>
                <div className="mt-2 text-2xl font-semibold text-[#241b0e]">
                  {restaurant.signature}
                </div>
                <p className="mt-3 text-sm leading-7 text-[#5f4a27]">{restaurant.recommendation}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {restaurant.scenes.map((scene) => (
                  <span
                    key={scene}
                    className="rounded-full bg-[#fff0d7] px-4 py-2 text-sm text-[#8a5d1e]"
                  >
                    {scene}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {restaurant.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#ebdcc1] bg-white px-4 py-2 text-sm text-[#6d5835]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
              <div className="mb-4 flex items-center gap-2 text-[#241b0e]">
                <Flame className="h-5 w-5 text-[#d58d36]" />
                <h2 className="text-2xl font-semibold">到店前先看</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] bg-[#faf6ee] p-4">
                  <div className="flex items-center gap-2 text-sm text-[#8c7041]">
                    <Clock3 className="h-4 w-4" />
                    营业时间
                  </div>
                  <div className="mt-3 text-lg font-semibold text-[#241b0e]">{restaurant.hours}</div>
                </div>
                <div className="rounded-[24px] bg-[#faf6ee] p-4">
                  <div className="flex items-center gap-2 text-sm text-[#8c7041]">
                    <MapPin className="h-4 w-4" />
                    校园位置
                  </div>
                  <div className="mt-3 text-lg font-semibold text-[#241b0e]">{restaurant.distance}</div>
                </div>
                <div className="rounded-[24px] bg-[#faf6ee] p-4">
                  <div className="flex items-center gap-2 text-sm text-[#8c7041]">
                    <MapPin className="h-4 w-4" />
                    详细地址
                  </div>
                  <div className="mt-3 text-lg font-semibold text-[#241b0e]">{restaurant.address}</div>
                </div>
                <div className="rounded-[24px] bg-[#faf6ee] p-4">
                  <div className="flex items-center gap-2 text-sm text-[#8c7041]">
                    <Phone className="h-4 w-4" />
                    联系方式
                  </div>
                  <div className="mt-3 text-lg font-semibold text-[#241b0e]">{restaurant.phone}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
                <div className="mb-4 flex items-center gap-2 text-[#241b0e]">
                  <Users className="h-5 w-5 text-[#1f5a2d]" />
                  <h2 className="text-2xl font-semibold">学生好评</h2>
                </div>
                <div className="space-y-3">
                  {restaurant.greenFlags.map((flag) => (
                    <div
                      key={flag}
                      className="rounded-[24px] bg-[#eef7ee] px-4 py-4 text-sm leading-6 text-[#245031]"
                    >
                      {flag}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
                <div className="mb-4 flex items-center gap-2 text-[#241b0e]">
                  <TriangleAlert className="h-5 w-5 text-[#c46d2a]" />
                  <h2 className="text-2xl font-semibold">避雷提醒</h2>
                </div>
                <div className="space-y-3">
                  {restaurant.redFlags.length ? (
                    restaurant.redFlags.map((flag) => (
                      <div
                        key={flag}
                        className="rounded-[24px] bg-[#fff3e8] px-4 py-4 text-sm leading-6 text-[#8f4e17]"
                      >
                        {flag}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[24px] bg-[#faf6ee] px-4 py-4 text-sm leading-6 text-[#6d5835]">
                      当前没有明显避雷项，整体稳定。
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
              <div className="mb-4 flex items-center gap-2 text-[#241b0e]">
                <MapPin className="h-5 w-5 text-[#d58d36]" />
                <h2 className="text-2xl font-semibold">校园动线</h2>
              </div>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-[#d58d36]" />
                  <div>
                    <div className="text-sm text-[#8c7041]">出发地</div>
                    <div className="mt-1 font-semibold text-[#241b0e]">{restaurant.campus}</div>
                  </div>
                </div>
                <div className="ml-[5px] h-12 w-px bg-[#ead9b9]" />
                <div className="flex gap-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-[#173026]" />
                  <div>
                    <div className="text-sm text-[#8c7041]">路径提示</div>
                    <div className="mt-1 font-semibold text-[#241b0e]">{restaurant.distance}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-[#6d5835]">
                      <span className="rounded-full bg-[#f7f3ea] px-3 py-1">{restaurant.walkTime}</span>
                      {restaurant.bikeTime && (
                        <span className="rounded-full bg-[#f7f3ea] px-3 py-1">{restaurant.bikeTime}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ml-[5px] h-12 w-px bg-[#ead9b9]" />
                <div className="flex gap-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-[#8f4038]" />
                  <div>
                    <div className="text-sm text-[#8c7041]">到店点位</div>
                    <div className="mt-1 font-semibold text-[#241b0e]">{restaurant.address}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
              <div className="mb-4 flex items-center gap-2 text-[#241b0e]">
                <Ticket className="h-5 w-5 text-[#d58d36]" />
                <h2 className="text-2xl font-semibold">立即行动</h2>
              </div>
              <div className="grid gap-3">
                <a
                  href={`https://www.google.com/maps?q=${restaurant.location.lat},${restaurant.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-[#241b0e] px-4 py-4 text-center text-sm font-medium text-white"
                >
                  打开导航
                </a>
                <a
                  href={`tel:${restaurant.phone}`}
                  className="rounded-2xl bg-[#faf6ee] px-4 py-4 text-center text-sm font-medium text-[#5f4a27]"
                >
                  电话联系
                </a>
                <button
                  onClick={() => toggleFavorite(restaurant.id)}
                  className="rounded-2xl bg-[#fff0d7] px-4 py-4 text-center text-sm font-medium text-[#9a641f]"
                >
                  {isFavorite(restaurant.id) ? "已加入收藏" : "加入收藏"}
                </button>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(118,93,43,0.08)]">
              <div className="mb-4 flex items-center gap-2 text-[#241b0e]">
                <Users className="h-5 w-5 text-[#d58d36]" />
                <h2 className="text-2xl font-semibold">同校区再看看</h2>
              </div>
              <div className="space-y-3">
                {relatedRestaurants.map((item) => (
                  <Link
                    key={item.id}
                    to={`/restaurant/${item.id}`}
                    className="flex items-center gap-4 rounded-[24px] bg-[#faf6ee] p-4 transition hover:bg-[#f4ecdd]"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-20 w-20 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-[#241b0e]">{item.name}</div>
                      <div className="mt-1 text-sm text-[#6d5835]">
                        {item.category} · {item.walkTime}
                      </div>
                      <div className="mt-2 text-sm text-[#8c7041]">{item.signature}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
