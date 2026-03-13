import { Link, useLocation } from "react-router";
import { Map, Sparkles, User } from "lucide-react";

export function BottomNav() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="pointer-events-none fixed bottom-4 left-0 right-0 z-50 px-4 safe-area-inset-bottom">
      <div className="pointer-events-auto mx-auto flex h-16 max-w-md items-center justify-around rounded-full border border-white/80 bg-white/88 px-4 shadow-[0_18px_50px_rgba(118,93,43,0.15)] backdrop-blur-xl">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 transition-all ${
            isActive('/') ? 'text-[#d58d36]' : 'text-[#8c7041] hover:text-[#241b0e]'
          }`}
        >
          <Map className={`w-6 h-6 ${isActive('/') ? 'scale-110' : ''} transition-transform`} />
          <span className={`text-xs ${isActive('/') ? 'font-bold' : ''}`}>首页</span>
        </Link>
        
        <Link 
          to="/lucky-draw" 
          className={`flex flex-col items-center gap-1 relative transition-all ${
            isActive('/lucky-draw') ? 'text-[#d58d36]' : 'text-[#8c7041] hover:text-[#241b0e]'
          }`}
        >
          <div className={`relative ${isActive('/lucky-draw') ? 'scale-110' : ''} transition-transform`}>
            <Sparkles className="w-6 h-6" />
            {!isActive('/lucky-draw') && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <span className={`text-xs ${isActive('/lucky-draw') ? 'font-bold' : ''}`}>转盘</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center gap-1 transition-all ${
            isActive('/profile') ? 'text-[#d58d36]' : 'text-[#8c7041] hover:text-[#241b0e]'
          }`}
        >
          <User className={`w-6 h-6 ${isActive('/profile') ? 'scale-110' : ''} transition-transform`} />
          <span className={`text-xs ${isActive('/profile') ? 'font-bold' : ''}`}>我的</span>
        </Link>
      </div>
    </nav>
  );
}
