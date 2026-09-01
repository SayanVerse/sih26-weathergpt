import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BotMessageSquare,
  Map,
  BookmarkCheck,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Navigation: React.FC = () => {
  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/assistant',
      label: 'AI Assistant',
      icon: BotMessageSquare,
      badge: 'GPT',
    },
    {
      to: '/map',
      label: 'Weather Map',
      icon: Map,
    },
    {
      to: '/locations',
      label: 'Saved Cities',
      icon: BookmarkCheck,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: SettingsIcon,
    },
  ];

  return (
    <>
      {/* Desktop / Tablet Sub-Navbar */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md hidden sm:block transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 relative cursor-pointer',
                      isActive
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold shadow-sm border border-zinc-200 dark:border-zinc-700/80'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                    )
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#09090b]/95 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_24px_rgba(0,0,0,0.05)] dark:shadow-2xl safe-area-inset-bottom transition-colors duration-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors relative min-w-[56px]',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                )
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label.split(' ')[0]}</span>
              {item.badge && (
                <span className="absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
