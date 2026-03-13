import { createHashRouter } from "react-router";
import { Home } from "./pages/home";
import { LuckyDraw } from "./pages/lucky-draw";
import { RestaurantDetail } from "./pages/restaurant-detail";
import { Profile } from "./pages/profile";
import { Layout } from "./components/layout";

export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "lucky-draw", Component: LuckyDraw },
      { path: "restaurant/:id", Component: RestaurantDetail },
      { path: "profile", Component: Profile },
    ],
  },
]);
