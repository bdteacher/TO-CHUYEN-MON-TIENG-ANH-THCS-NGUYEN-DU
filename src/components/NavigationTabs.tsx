import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpenCheck,
  CalendarClock,
  FileText,
  Eye,
  FolderCheck,
  Award,
  HardDrive,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'teachers'
  | 'assignments'
  | 'substitutes'
  | 'meetings'
  | 'observations'
  | 'lessonPlans'
  | 'evaluation'
  | 'drive';

interface NavigationTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  counts: {
    teachers: number;
    substitutes: number;
    meetings: number;
    observations: number;
    lessonPlansPending: number;
  };
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  counts,
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Tổng quan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'teachers' as TabType,
      label: '10 Giáo viên',
      icon: Users,
      badge: counts.teachers,
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'assignments' as TabType,
      label: 'Phân công chuyên môn',
      icon: BookOpenCheck,
      badge: null,
    },
    {
      id: 'substitutes' as TabType,
      label: 'Dạy thay / Dạy bù',
      icon: CalendarClock,
      badge: counts.substitutes > 0 ? counts.substitutes : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'meetings' as TabType,
      label: 'Sinh hoạt & Biên bản',
      icon: FileText,
      badge: counts.meetings,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'observations' as TabType,
      label: 'Dự giờ & Đánh giá',
      icon: Eye,
      badge: counts.observations,
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'lessonPlans' as TabType,
      label: 'Kế hoạch bài dạy (KHBĐ)',
      icon: FolderCheck,
      badge: counts.lessonPlansPending > 0 ? `${counts.lessonPlansPending} chờ` : '10/10',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'evaluation' as TabType,
      label: 'Chuẩn nghề nghiệp & Thi đua',
      icon: Award,
      badge: null,
    },
    {
      id: 'drive' as TabType,
      label: 'Kho Hồ Sơ Drive',
      icon: HardDrive,
      badge: 'Google Drive',
      badgeColor: 'bg-blue-100 text-blue-700 font-semibold',
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs overflow-x-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 py-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs border border-indigo-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                      tab.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
