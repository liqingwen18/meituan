import { useEffect, useState } from "react";

const FAVORITES_STORAGE_KEY = "university-food-map:favorites";
const FAVORITES_EVENT_NAME = "university-food-map:favorites-updated";

function readFavorites() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const value = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeFavorites(nextFavorites: string[]) {
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
  window.dispatchEvent(new Event(FAVORITES_EVENT_NAME));
}

export function useFavoriteRestaurants() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readFavorites());

  useEffect(() => {
    const syncFavorites = () => {
      setFavoriteIds(readFavorites());
    };

    window.addEventListener("storage", syncFavorites);
    window.addEventListener(FAVORITES_EVENT_NAME, syncFavorites);

    return () => {
      window.removeEventListener("storage", syncFavorites);
      window.removeEventListener(FAVORITES_EVENT_NAME, syncFavorites);
    };
  }, []);

  const toggleFavorite = (restaurantId: string) => {
    const nextFavorites = favoriteIds.includes(restaurantId)
      ? favoriteIds.filter((id) => id !== restaurantId)
      : [...favoriteIds, restaurantId];

    setFavoriteIds(nextFavorites);
    writeFavorites(nextFavorites);
  };

  return {
    favoriteIds,
    favoriteCount: favoriteIds.length,
    isFavorite: (restaurantId: string) => favoriteIds.includes(restaurantId),
    toggleFavorite,
  };
}
