import React from 'react';
import { BookOpen, Calendar, LayoutGrid, HeartHandshake, User, Plus } from 'lucide-react';

export type NavTab = 'journals' | 'calendar' | 'templates' | 'spaces' | 'profile';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onNewJournal: () => void;
  unreadSpaceCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onNewJournal,
  unreadSpaceCount = 0,
}) => {
  const tabs = [
    { id: 'journals' as NavTab, label: '手账', icon: BookOpen },
    { id: 'calendar' as NavTab, label: '日历日程', icon: Calendar },
    { id: 'new' as const, label: '记手账', icon: Plus, isAction: true },
    { id: 'templates' as NavTab, label: '模板广场', icon: LayoutGrid },
    { id: 'spaces' as NavTab, label: '双人空间', icon: HeartHandshake, badge: unreadSpaceCount },
    { id: 'profile' as NavTab, label: '我的', icon: User },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E8E2D8] pb-safe"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {tabs.map((tab) => {
          if ('isAction' in tab && tab.isAction) {
            return (
              <button
                key="btn-new-journal"
                id="btn-create-new-journal"
                onClick={onNewJournal}
                className="relative -top-3 flex flex-col items-center justify-center group"
                aria-label="写一篇新手账"
              >
                <div className="w-12 h-12 rounded-full bg-[#7D6B5D] text-white shadow-md flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95 group-hover:bg-[#68584B]">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-medium text-[#7D6B5D] mt-0.5">写手账</span>
              </button>
            );
          }

          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id as NavTab)}
              className={`flex flex-col items-center justify-center py-1 px-2 relative transition-all duration-150 ${
                isActive ? 'text-[#5C4D41]' : 'text-[#A3988E] hover:text-[#736558]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-[#D9776C] rounded-full ring-2 ring-[#FAF7F2]" />
                )}
              </div>
              <span className={`text-[10px] mt-1 transition-all ${isActive ? 'font-semibold text-[#5C4D41]' : 'font-normal'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#5C4D41] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
