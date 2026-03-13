import { Outlet } from "react-router";
import { BottomNav } from "./bottom-nav";

export function Layout() {
  return (
    <div className="min-h-screen bg-transparent">
      <Outlet />
      <BottomNav />
    </div>
  );
}
