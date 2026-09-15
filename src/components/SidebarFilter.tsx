import React from 'react';
import { Search, X, RotateCcw, Check, SlidersHorizontal } from 'lucide-react';
import { PricingModel, DeviceCategory } from '../types';
import { MainTabType } from './TabNavigation';

export interface FilterState {
  search: string;
  pricing: PricingModel[];
  minAdoption: number; // 0: All, 3: 3+, 4: 4+, 5: 5
  minEaseOfUse: number; // 0: All, 3: 3+, 4: 4+, 5: 5
  
  // Frontend specific
  platforms: string[];
  hasBuiltInScraper: boolean;
  touchOptimized: boolean;
  gamepadOptimized: boolean;
  canReplaceHomeLauncher: boolean;

  // CFW specific
  categories: DeviceCategory[];
}

export const initialFilterState: FilterState = {
  search: '',
  pricing: [],
  minAdoption: 0,
  minEaseOfUse: 0,
  platforms: [],
  hasBuiltInScraper: false,
  touchOptimized: false,
  gamepadOptimized: false,
  canReplaceHomeLauncher: false,
  categories: [],
};

export function countActiveFilters(filters: FilterState, _activeTab?: MainTabType): number {
  let count = 0;
  if (filters.search.trim()) count++;
  count += filters.pricing.length;
  if (filters.minAdoption > 0) count++;
  if (filters.minEaseOfUse > 0) count++;

  count += filters.platforms.length;
  if (filters.hasBuiltInScraper) count++;
  if (filters.touchOptimized) count++;
  if (filters.gamepadOptimized) count++;
  if (filters.canReplaceHomeLauncher) count++;

  return count;
}

export interface SidebarFilterProps {
  activeTab: MainTabType;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
  filteredCount: number;
  totalCount: number;
}

const PLATFORM_OPTIONS = ['Android', 'iOS', 'Linux', 'Windows', 'macOS'];
const PRICING_OPTIONS: PricingModel[] = ['Free & Open Source', 'Free', 'Freemium', 'Paid'];
const CATEGORY_OPTIONS: DeviceCategory[] = ['First-Party', 'Retro Handheld', 'PC-Handheld'];

const PRICING_LABELS: Record<PricingModel, string> = {
  'Free & Open Source': '무료 & 오픈소스',
  'Free': '무료',
  'Freemium': '프리미엄',
  'Paid': '유료',
};

const CATEGORY_LABELS: Record<DeviceCategory, string> = {
  'First-Party': '자사 기기',
  'Retro Handheld': '레트로 핸드헬드',
  'PC-Handheld': 'PC 핸드헬드',
};

export const SidebarFilter: React.FC<SidebarFilterProps> = ({
  activeTab,
  filters,
  onChange,
  onReset,
  isMobileDrawer = false,
  onCloseMobileDrawer,
  filteredCount,
}) => {
  const activeCount = countActiveFilters(filters, activeTab);

  const handleSearchChange = (val: string) => {
    onChange({ ...filters, search: val });
  };

  const handleToggleArray = <T extends string>(
    current: T[],
    value: T,
    key: keyof FilterState
  ) => {
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated });
  };

  const handleToggleBoolean = (key: keyof FilterState) => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  const showFrontendFilters = true;
  const showCFWFilters = false;

  const content = (
    <div className="flex flex-col gap-6">
      {/* 1. Header & Reset Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#0a0a0a]" />
<h2 className="text-[14px] font-semibold text-[#0a0a0a] tracking-tight">
            필터
          </h2>
          {activeCount > 0 && (
            <span className="rounded-[18px] bg-[#0a0a0a] px-2 py-0.5 text-[11px] font-medium text-[#fafafa]">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] px-2.5 py-1 text-[11px] font-medium text-[#737373] transition-colors hover:border-[#0a0a0a] hover:text-[#0a0a0a] cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>초기화</span>
            </button>
          )}

          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="flex h-8 w-8 items-center justify-center rounded-[18px] border border-[#e5e5e5] bg-[#f5f5f5] text-[#0a0a0a] hover:bg-[#e5e5e5] cursor-pointer"
              aria-label="Close filters"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Real-time Search Input */}
      <div className="relative flex items-center">
        <Search
          size={14}
          className="absolute left-3.5 text-[#737373] pointer-events-none"
        />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="이름, 설명 검색..."
          className="w-full rounded-[18px] border border-[#e5e5e5] bg-[#f5f5f5] py-2 pl-9 pr-9 text-[13px] text-[#0a0a0a] placeholder-[#737373] transition-colors focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => handleSearchChange('')}
            className="absolute right-2.5 flex h-5 w-5 items-center justify-center rounded-full text-[#737373] hover:text-[#0a0a0a] hover:bg-[#e5e5e5]/60 transition-colors"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* 3. Pricing Tier Filter (Common) */}
      <div className="flex flex-col gap-2.5">
<span className="text-[12px] font-semibold text-[#737373] uppercase tracking-wider">
          가격 정책
        </span>
        <div className="flex flex-wrap gap-1.5">
{PRICING_OPTIONS.map((price) => {
            const isSelected = filters.pricing.includes(price);
            return (
              <button
                key={price}
                type="button"
                onClick={() => handleToggleArray(filters.pricing, price, 'pricing')}
                className={`rounded-[18px] px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0a0a0a] text-[#fafafa] border border-[#0a0a0a] shadow-xs'
                    : 'bg-[#ffffff] text-[#171717] border border-[#e5e5e5] hover:border-[#737373]'
                }`}
              >
                {PRICING_LABELS[price] || price}
              </button>
            );
          })}
        </div>
      </div>

      {/* Curation Ratings Filter (Common) */}
      <div className="flex flex-col gap-3 border-t border-[#e5e5e5] pt-4">
        <span className="text-[12px] font-semibold text-[#737373] uppercase tracking-wider">
          큐레이션 점수 (Ratings)
        </span>

        {/* Min Adoption */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#737373] font-medium">대중성 (Adoption)</span>
            {filters.minAdoption > 0 && (
              <span className="text-[10px] font-semibold text-[#0a0a0a]">{filters.minAdoption}점 이상</span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[
              { label: '전체', value: 0 },
              { label: '3+ 점', value: 3 },
              { label: '4+ 점', value: 4 },
              { label: '5점', value: 5 },
            ].map((opt) => {
              const isSelected = filters.minAdoption === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ ...filters, minAdoption: opt.value })}
                  className={`rounded-[18px] py-1 text-[11px] font-medium transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-[#0a0a0a] text-[#fafafa] border border-[#0a0a0a] shadow-xs'
                      : 'bg-[#ffffff] text-[#171717] border border-[#e5e5e5] hover:border-[#737373]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Min Ease of Use */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#737373] font-medium">설정 편의성 (Ease of Use)</span>
            {filters.minEaseOfUse > 0 && (
              <span className="text-[10px] font-semibold text-[#0a0a0a]">{filters.minEaseOfUse}점 이상</span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[
              { label: '전체', value: 0 },
              { label: '3+ 점', value: 3 },
              { label: '4+ 점', value: 4 },
              { label: '5점', value: 5 },
            ].map((opt) => {
              const isSelected = filters.minEaseOfUse === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ ...filters, minEaseOfUse: opt.value })}
                  className={`rounded-[18px] py-1 text-[11px] font-medium transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-[#0a0a0a] text-[#fafafa] border border-[#0a0a0a] shadow-xs'
                      : 'bg-[#ffffff] text-[#171717] border border-[#e5e5e5] hover:border-[#737373]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Frontend Filters Section */}
      {showFrontendFilters && (
        <div className="flex flex-col gap-4 border-t border-[#e5e5e5] pt-4">
<div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#737373] uppercase tracking-wider">
              플랫폼
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORM_OPTIONS.map((plat) => {
              const isSelected = filters.platforms.includes(plat);
              return (
                <button
                  key={plat}
                  type="button"
                  onClick={() => handleToggleArray(filters.platforms, plat, 'platforms')}
                  className={`rounded-[18px] px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0a0a0a] text-[#fafafa] border border-[#0a0a0a] shadow-xs'
                      : 'bg-[#ffffff] text-[#171717] border border-[#e5e5e5] hover:border-[#737373]'
                  }`}
                >
                  {plat}
                </button>
              );
            })}
          </div>

          {/* Frontend Feature Toggles */}
          <div className="flex flex-col gap-2 pt-1">
<span className="text-[12px] font-semibold text-[#737373] uppercase tracking-wider">
              프론트엔드 기능
            </span>

            <div className="flex flex-col gap-2">
<label className="group flex items-center gap-2.5 text-[13px] text-[#171717] cursor-pointer select-none">
                <div
                  onClick={() => handleToggleBoolean('hasBuiltInScraper')}
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                    filters.hasBuiltInScraper
                      ? 'bg-[#0a0a0a] border-[#0a0a0a] text-[#ffffff]'
                      : 'border-[#e5e5e5] bg-[#ffffff] group-hover:border-[#737373]'
                  }`}
                >
                  {filters.hasBuiltInScraper && <Check size={11} strokeWidth={3} />}
                </div>
                <span onClick={() => handleToggleBoolean('hasBuiltInScraper')}>
                  내장 스크래퍼
                </span>
              </label>

<label className="group flex items-center gap-2.5 text-[13px] text-[#171717] cursor-pointer select-none">
                <div
                  onClick={() => handleToggleBoolean('touchOptimized')}
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                    filters.touchOptimized
                      ? 'bg-[#0a0a0a] border-[#0a0a0a] text-[#ffffff]'
                      : 'border-[#e5e5e5] bg-[#ffffff] group-hover:border-[#737373]'
                  }`}
                >
                  {filters.touchOptimized && <Check size={11} strokeWidth={3} />}
                </div>
                <span onClick={() => handleToggleBoolean('touchOptimized')}>
                  터치 최적화
                </span>
              </label>

<label className="group flex items-center gap-2.5 text-[13px] text-[#171717] cursor-pointer select-none">
                <div
                  onClick={() => handleToggleBoolean('gamepadOptimized')}
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                    filters.gamepadOptimized
                      ? 'bg-[#0a0a0a] border-[#0a0a0a] text-[#ffffff]'
                      : 'border-[#e5e5e5] bg-[#ffffff] group-hover:border-[#737373]'
                  }`}
                >
                  {filters.gamepadOptimized && <Check size={11} strokeWidth={3} />}
                </div>
                <span onClick={() => handleToggleBoolean('gamepadOptimized')}>
                  게임패드 최적화
                </span>
              </label>

<label className="group flex items-center gap-2.5 text-[13px] text-[#171717] cursor-pointer select-none">
                <div
                  onClick={() => handleToggleBoolean('canReplaceHomeLauncher')}
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                    filters.canReplaceHomeLauncher
                      ? 'bg-[#0a0a0a] border-[#0a0a0a] text-[#ffffff]'
                      : 'border-[#e5e5e5] bg-[#ffffff] group-hover:border-[#737373]'
                  }`}
                >
                  {filters.canReplaceHomeLauncher && <Check size={11} strokeWidth={3} />}
                </div>
                <span onClick={() => handleToggleBoolean('canReplaceHomeLauncher')}>
                  홈 런처 대체 가능
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 5. CFW / OS Filters Section */}
      {showCFWFilters && (
        <div className="flex flex-col gap-4 border-t border-[#e5e5e5] pt-4">
<span className="text-[12px] font-semibold text-[#737373] uppercase tracking-wider">
            기기 카테고리
          </span>
          <div className="flex flex-wrap gap-1.5">
{CATEGORY_OPTIONS.map((cat) => {
              const isSelected = filters.categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleToggleArray(filters.categories, cat, 'categories')}
                  className={`rounded-[18px] px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0a0a0a] text-[#fafafa] border border-[#0a0a0a] shadow-xs'
                      : 'bg-[#ffffff] text-[#171717] border border-[#e5e5e5] hover:border-[#737373]'
                  }`}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Mobile Drawer Overlay Mode
  if (isMobileDrawer) {
    return (
      <div className="fixed inset-0 z-50 flex lg:hidden">
        {/* Backdrop overlay */}
        <div
          onClick={onCloseMobileDrawer}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-in Drawer panel */}
        <div className="relative z-50 ml-auto flex h-full w-[310px] max-w-[85vw] flex-col bg-[#ffffff] p-6 shadow-2xl overflow-y-auto">
          {content}

          {/* Mobile Apply Button */}
          <div className="mt-8 pt-4 border-t border-[#e5e5e5]">
<button
              type="button"
              onClick={onCloseMobileDrawer}
              className="w-full rounded-[18px] bg-[#0a0a0a] py-2.5 text-[13px] font-medium text-[#fafafa] transition-opacity hover:opacity-90 cursor-pointer"
            >
              결과 {filteredCount}개 보기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Sticky Sidebar
  return (
    <aside className="hidden lg:flex w-[280px] shrink-0 flex-col rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] p-5 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
      {content}
    </aside>
  );
};
