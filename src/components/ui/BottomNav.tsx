'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Play, Wallet, Trophy, User } from 'lucide-react';
import clsx from 'clsx';
import { useQuizStore } from '@/store/useQuizStore';

export default function BottomNav() {
  const pathname = usePathname();
  const { matchStatus } = useQuizStore();

  // Don't show bottom nav during an active quiz to maximize screen real estate
  if (matchStatus === 'live' || matchStatus === 'finished') return null;
  if (pathname === '/quiz') return null;

  const navItems = [
    { name: 'Play', path: '/', icon: Play },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Ranks', path: '/leaderboard', icon: Trophy },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="absolute bottom-0 w-full bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 pb-6 pt-3 px-8 flex justify-between items-center z-50 rounded-b-[32px]">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link href={item.path} key={item.name} className="flex-1">
            <div className={clsx(
              "flex flex-col items-center gap-1.5 transition-all duration-200",
              isActive ? "text-neon-blue scale-110" : "text-slate-500 hover:text-slate-300"
            )}>
              <Icon className={clsx("w-6 h-6", isActive && "fill-neon-blue/20")} />
              <span className="text-[10px] font-bold tracking-widest uppercase">{item.name}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
