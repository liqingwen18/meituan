import { Link } from "react-router";
import { Clock3, Heart, MapPin, Star } from "lucide-react";
import type { Restaurant } from "../data/restaurants";
import { getBudgetLabel, getCampusZone, isRestaurantOpen } from "../lib/restaurant-utils";

interface RestaurantCardProps {
  restaurant: Restaurant;
  isFavorite?: boolean;
  onToggleFavorite?: (restaurantId: string) => void;
}

export function RestaurantCard({
  restaurant,
  isFavorite = false,
  onToggleFavorite,
}: RestaurantCardProps) {
  const openNow = isRestaurantOpen(restaurant.hours);

  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="group block overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_18px_60px_rgba(108,83,38,0.1)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(108,83,38,0.16)]"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/20 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/20 bg-black/24 px-3 py-1 text-xs text-white backdrop-blur">
            {getCampusZone(restaurant.campus)}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              openNow
                ? "bg-[#d7f0d9] text-[#1f5a2d]"
                : "bg-white/86 text-[#7f6434]"
            }`}
          >
            {openNow ? "营业中" : "已休息"}
          </span>
        </div>

        <button
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleFavorite?.(restaurant.id);
          }}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur transition ${
            isFavorite
              ? "bg-[#8f4038] text-white"
              : "bg-white/85 text-[#8f4038] hover:bg-white"
          }`}
          aria-label={isFavorite ? "取消收藏" : "收藏餐厅"}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        <div className="absolute inset-x-4 bottom-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-white/78">{restaurant.category}</div>
              <h3 className="mt-1 text-2xl font-semibold text-white">{restaurant.name}</h3>
            </div>
            <div className="rounded-2xl bg-[#ffd38e] px-3 py-2 text-center text-[#2c1a09] shadow-lg">
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Star className="h-4 w-4 fill-current" />
                {restaurant.rating}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#8c7041]">
            Signature
          </div>
          <div className="mt-2 text-lg font-semibold text-[#241b0e]">{restaurant.signature}</div>
          <p className="mt-2 text-sm leading-6 text-[#6d5835]">{restaurant.recommendation}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {restaurant.scenes.slice(0, 3).map((scene) => (
            <span
              key={scene}
              className="rounded-full bg-[#f7f3ea] px-3 py-1 text-sm text-[#6a5129]"
            >
              {scene}
            </span>
          ))}
        </div>

        <div className="grid gap-3 rounded-[24px] bg-[#faf6ee] p-4 text-sm text-[#5f4a27] sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-[#8c7041]" />
            <span>{restaurant.walkTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#8c7041]" />
            <span className="truncate">{restaurant.distance}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#eee3cf] pt-4">
          <div>
            <div className="text-sm text-[#8c7041]">{getBudgetLabel(restaurant.price)}</div>
            <div className="mt-1 text-2xl font-semibold text-[#241b0e]">￥{restaurant.price}/人</div>
          </div>
          <div className="rounded-2xl bg-[#fff0d7] px-4 py-2 text-sm font-medium text-[#9a641f]">
            {restaurant.deal}
          </div>
        </div>
      </div>
    </Link>
  );
}
