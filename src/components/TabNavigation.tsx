import React from 'react';

export type MainTabType = 'all' | 'frontends' | 'cfw';

interface TabNavigationProps {
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
  counts?: { all: number; frontends: number; cfw: number };
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <nav className="w-full" aria-label="Main Catalogs">
      <div className="inline-flex w-full sm:w-auto items-center p-1 rounded-[24px] bg-[#fafafa] border border-[#e5e5e5]">
        {/* Tab 0: All Items */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'all'}
          onClick={() => onTabChange('all')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center px-5 py-2.5 text-[14px] font-medium transition-all rounded-[18px] select-none cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#0a0a0a] text-[#fafafa] shadow-sm'
              : 'text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]'
          }`}
        >
          전체 카탈로그
        </button>

        {/* Tab 1: Frontends & Launchers */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'frontends'}
          onClick={() => onTabChange('frontends')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center px-5 py-2.5 text-[14px] font-medium transition-all rounded-[18px] select-none cursor-pointer ${
            activeTab === 'frontends'
              ? 'bg-[#0a0a0a] text-[#fafafa] shadow-sm'
              : 'text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]'
          }`}
        >
프론트엔드 & 런처
        </button>

        {/* Tab 2: Custom Firmware & OS */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'cfw'}
          onClick={() => onTabChange('cfw')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center px-5 py-2.5 text-[14px] font-medium transition-all rounded-[18px] select-none cursor-pointer ${
            activeTab === 'cfw'
              ? 'bg-[#0a0a0a] text-[#fafafa] shadow-sm'
              : 'text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]'
          }`}
        >
커스텀 펌웨어 & OS
        </button>
      </div>
    </nav>
  );
};
