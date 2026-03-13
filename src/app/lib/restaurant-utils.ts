import type { Restaurant } from "../data/restaurants";

export function getMinutesFromTimeString(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isRestaurantOpen(hours: string, now = new Date()) {
  const [opensAt, closesAt] = hours.split("-");
  const openMinutes = getMinutesFromTimeString(opensAt);
  const closeMinutes = getMinutesFromTimeString(closesAt);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (closeMinutes <= openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

export function getWalkMinutes(walkTime: string) {
  const match = walkTime.match(/(\d+)/);
  return match ? Number(match[1]) : 99;
}

export function getBudgetLabel(price: number) {
  if (price <= 18) {
    return "穷鬼友好";
  }

  if (price <= 30) {
    return "日常可冲";
  }

  return "适合聚餐";
}

export function getCampusZone(campus: string) {
  const match = campus.match(/（(.+)）/);
  return match?.[1] ?? campus;
}

export function getRestaurantMapPosition(
  restaurant: Restaurant,
  sourceRestaurants: Restaurant[],
) {
  if (sourceRestaurants.length <= 1) {
    return { left: 50, top: 50 };
  }

  const latitudes = sourceRestaurants.map((item) => item.location.lat);
  const longitudes = sourceRestaurants.map((item) => item.location.lng);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latSpan = maxLat - minLat || 0.01;
  const lngSpan = maxLng - minLng || 0.01;

  const left = 16 + ((restaurant.location.lng - minLng) / lngSpan) * 68;
  const top = 18 + ((maxLat - restaurant.location.lat) / latSpan) * 60;

  return {
    left: Number(left.toFixed(2)),
    top: Number(top.toFixed(2)),
  };
}
