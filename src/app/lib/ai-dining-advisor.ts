import { restaurants, type Restaurant } from "../data/restaurants";
import { getCampusZone, getWalkMinutes, isRestaurantOpen } from "./restaurant-utils";

export type BudgetPreference = "不限" | "20" | "30" | "40+";
export type MoodPreference = "稳妥不踩雷" | "解压重口" | "轻盈健康" | "适合社交";
export type DiningMode = "随便吃一口" | "一个人安静吃" | "和室友一起" | "请客别翻车";
export type TimePreference = "不限" | "10 分钟内" | "20 分钟内";

export interface AiDecisionInputs {
  campus: string;
  scene: string;
  budget: BudgetPreference;
  mood: MoodPreference;
  cuisine: string;
  diningMode: DiningMode;
  timeLimit: TimePreference;
  onlyOpenNow: boolean;
}

export interface AiRestaurantScore {
  restaurant: Restaurant;
  score: number;
  reasons: string[];
  summary: string;
}

export const defaultDecisionInputs: AiDecisionInputs = {
  campus: "不限",
  scene: "不限",
  budget: "30",
  mood: "稳妥不踩雷",
  cuisine: "不限",
  diningMode: "和室友一起",
  timeLimit: "20 分钟内",
  onlyOpenNow: true,
};

function getBudgetScore(price: number, budget: BudgetPreference) {
  if (budget === "不限") {
    return 0;
  }

  const maxPrice = budget === "20" ? 20 : budget === "30" ? 30 : 999;

  if (budget === "40+") {
    return price >= 35 ? 14 : 2;
  }

  if (price <= maxPrice) {
    return 16;
  }

  return Math.max(-18, 12 - (price - maxPrice) * 2);
}

function getMoodScore(restaurant: Restaurant, mood: MoodPreference) {
  if (mood === "解压重口") {
    return ["川菜", "烧烤", "韩餐"].includes(restaurant.category) ? 15 : 4;
  }

  if (mood === "轻盈健康") {
    return ["轻食", "食堂"].includes(restaurant.category) ? 15 : 3;
  }

  if (mood === "适合社交") {
    return restaurant.scenes.includes("宿舍聚餐") || restaurant.scenes.includes("请客不掉面")
      ? 15
      : 4;
  }

  return restaurant.rating >= 4.6 ? 14 : 6;
}

function getDiningModeScore(restaurant: Restaurant, diningMode: DiningMode) {
  if (diningMode === "随便吃一口") {
    return getWalkMinutes(restaurant.walkTime) <= 5 ? 14 : 4;
  }

  if (diningMode === "一个人安静吃") {
    return restaurant.scenes.includes("一人食") || restaurant.scenes.includes("自习友好")
      ? 16
      : 2;
  }

  if (diningMode === "请客别翻车") {
    return restaurant.scenes.includes("请客不掉面") ? 18 : 2;
  }

  return restaurant.scenes.includes("宿舍聚餐") || (restaurant.currentOrders ?? 0) > 0 ? 16 : 4;
}

function getTimeScore(restaurant: Restaurant, timeLimit: TimePreference) {
  const walkMinutes = getWalkMinutes(restaurant.walkTime);

  if (timeLimit === "10 分钟内") {
    return walkMinutes <= 5 ? 16 : Math.max(-10, 10 - walkMinutes * 2);
  }

  if (timeLimit === "20 分钟内") {
    return walkMinutes <= 10 ? 12 : Math.max(-8, 8 - walkMinutes);
  }

  return 4;
}

export function buildAiRanking(inputs: AiDecisionInputs) {
  return restaurants
    .map((restaurant) => {
      const reasons: string[] = [];
      let score = restaurant.rating * 18;

      if (inputs.campus !== "不限") {
        if (restaurant.campus === inputs.campus) {
          score += 18;
          reasons.push(`就在 ${getCampusZone(inputs.campus)} 周边，决策成本更低`);
        } else {
          score -= 4;
        }
      }

      if (inputs.scene !== "不限") {
        if (restaurant.scenes.includes(inputs.scene)) {
          score += 20;
          reasons.push(`匹配你现在的“${inputs.scene}”场景`);
        } else {
          score -= 3;
        }
      }

      if (inputs.cuisine !== "不限") {
        if (restaurant.category === inputs.cuisine) {
          score += 16;
          reasons.push(`正好是你想吃的 ${inputs.cuisine}`);
        } else {
          score -= 2;
        }
      }

      const budgetScore = getBudgetScore(restaurant.price, inputs.budget);
      score += budgetScore;
      if (inputs.budget !== "不限" && budgetScore >= 10) {
        reasons.push(`人均 ￥${restaurant.price}，预算压力小`);
      }

      const moodScore = getMoodScore(restaurant, inputs.mood);
      score += moodScore;
      if (moodScore >= 14) {
        reasons.push(`风格更贴合你现在想要的“${inputs.mood}”`);
      }

      const diningModeScore = getDiningModeScore(restaurant, inputs.diningMode);
      score += diningModeScore;
      if (diningModeScore >= 14) {
        reasons.push(`适合当前的用餐方式：${inputs.diningMode}`);
      }

      const timeScore = getTimeScore(restaurant, inputs.timeLimit);
      score += timeScore;
      if (timeScore >= 12) {
        reasons.push(`${restaurant.walkTime}，到达效率更好`);
      }

      if (inputs.onlyOpenNow) {
        if (isRestaurantOpen(restaurant.hours)) {
          score += 14;
          reasons.push("当前营业中，可以立刻出发");
        } else {
          score -= 30;
        }
      }

      if ((restaurant.currentOrders ?? 0) > 0) {
        score += 3 + (restaurant.currentOrders ?? 0);
      }

      score += Math.max(0, 12 - getWalkMinutes(restaurant.walkTime));
      score += restaurant.greenFlags.length;

      const summary = `${restaurant.name} 更像是一个“${inputs.diningMode}”场景下的稳妥答案，${restaurant.walkTime} 可达，${restaurant.signature} 有明确记忆点。`;

      return {
        restaurant,
        score,
        reasons: reasons.slice(0, 4),
        summary,
      } satisfies AiRestaurantScore;
    })
    .sort((left, right) => right.score - left.score);
}

export function getCouponValue(price: number) {
  if (price >= 40) {
    return "立减 ￥8";
  }

  if (price >= 25) {
    return "立减 ￥5";
  }

  return "立减 ￥3";
}
