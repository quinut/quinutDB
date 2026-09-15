import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { TabNavigation, MainTabType } from './components/TabNavigation';
import { ItemCard } from './components/ItemCard';
import { DetailModal } from './components/DetailModal';
import {
  SidebarFilter,
  FilterState,
  initialFilterState,
  countActiveFilters,
} from './components/SidebarFilter';
import { FrontendItem, OSFirmwareItem, ProjectStatus, ItemRatings } from './types';
import { useCatalog } from './hooks/useCatalog';
import { SlidersHorizontal, Search, RotateCcw, ChevronDown, Database, PlusCircle, Layers } from 'lucide-react';
import EditPage from './app/edit/page';
import { useAllRatingStats } from './hooks/useItemCommunity';
import { useLanguage } from './contexts/LanguageContext';

type SortOption =
  | 'adoption-desc'
  | 'ease-desc'
  | 'activity-desc'
  | 'userscore-desc'
  | 'status'
  | 'name-asc'
  | 'name-desc';

export default function App() {
  const { language, t } = useLanguage();
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  const [activeTab, setActiveTab] = useState<MainTabType>('all');
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [sortBy, setSortBy] = useState<SortOption>('adoption-desc');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const {
    frontends,
    osFirmwares,
    loading: catalogLoading,
    isFromDatabase,
  } = useCatalog();
  const { statsMap } = useAllRatingStats();
  const [selectedItemState, setSelectedItemState] = useState<{
    item: FrontendItem | OSFirmwareItem;
    type: 'frontend' | 'cfw';
  } | null>(null);

  const handleTabChange = (tab: MainTabType) => {
    setActiveTab(tab);
    setSelectedItemState(null);
  };

  const handleResetFilters = () => {
    setFilters(initialFilterState);
  };

  // 1. Filter Frontends with 0ms useMemo calculation
  const filteredFrontends = useMemo(() => {
    let list = [...frontends];

    // Search query: name, description, supportedPlatforms
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.shortDesc.toLowerCase().includes(q) ||
          item.supportedPlatforms.some((p) => p.toLowerCase().includes(q))
      );
    }

    // Pricing filter
    if (filters.pricing.length > 0) {
      list = list.filter((item) => filters.pricing.includes(item.pricing));
    }

    // Curation Ratings filter
    if (filters.minAdoption > 0) {
      list = list.filter((item) => item.ratings.adoption >= filters.minAdoption);
    }
    if (filters.minEaseOfUse > 0) {
      list = list.filter((item) => item.ratings.easeOfUse >= filters.minEaseOfUse);
    }

    // Platform filter
    if (filters.platforms.length > 0) {
      list = list.filter((item) =>
        item.supportedPlatforms.some((p) => filters.platforms.includes(p))
      );
    }

    // Feature toggles (only items where flag is true)
    if (filters.hasBuiltInScraper) {
      list = list.filter((item) => item.hasBuiltInScraper === true);
    }
    if (filters.touchOptimized) {
      list = list.filter((item) => item.touchOptimized === true);
    }
    if (filters.gamepadOptimized) {
      list = list.filter((item) => item.gamepadOptimized === true);
    }
    if (filters.canReplaceHomeLauncher) {
      list = list.filter((item) => item.canReplaceHomeLauncher === true);
    }

    return list;
  }, [filters, frontends]);

  // 2. Filter CFW & OS with 0ms useMemo calculation
  const filteredOSFirmwares = useMemo(() => {
    let list = [...osFirmwares];

    // Search query: name, description, category, targetDevices
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.shortDesc.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.targetDevices.some((d) => d.toLowerCase().includes(q))
      );
    }

    // Pricing filter
    if (filters.pricing.length > 0) {
      list = list.filter((item) => filters.pricing.includes(item.pricing));
    }

    // Curation Ratings filter
    if (filters.minAdoption > 0) {
      list = list.filter((item) => item.ratings.adoption >= filters.minAdoption);
    }
    if (filters.minEaseOfUse > 0) {
      list = list.filter((item) => item.ratings.easeOfUse >= filters.minEaseOfUse);
    }

    // Device Category filter
    if (filters.categories.length > 0) {
      list = list.filter((item) => filters.categories.includes(item.category));
    }

    return list;
  }, [filters, osFirmwares]);

  // 3. Sorting helper
  const sortItems = <T extends { id: string; name: string; status: ProjectStatus; ratings: ItemRatings }>(items: T[]): T[] => {
    const sorted = [...items];
    if (sortBy === 'userscore-desc') {
      return sorted.sort((a, b) => {
        const statA = statsMap[a.id];
        const statB = statsMap[b.id];
        const scoreA = statA?.avgUserScore || 0;
        const scoreB = statB?.avgUserScore || 0;
        const diff = scoreB - scoreA;
        if (diff !== 0) return diff;
        const countA = statA?.totalRatings || 0;
        const countB = statB?.totalRatings || 0;
        return countB - countA;
      });
    }
    if (sortBy === 'adoption-desc') {
      return sorted.sort((a, b) => {
        const diff = b.ratings.adoption - a.ratings.adoption;
        if (diff !== 0) return diff;
        const actDiff = b.ratings.activity - a.ratings.activity;
        if (actDiff !== 0) return actDiff;
        const easeDiff = b.ratings.easeOfUse - a.ratings.easeOfUse;
        if (easeDiff !== 0) return easeDiff;
        return a.name.localeCompare(b.name);
      });
    }
    if (sortBy === 'ease-desc') {
      return sorted.sort((a, b) => {
        const diff = b.ratings.easeOfUse - a.ratings.easeOfUse;
        if (diff !== 0) return diff;
        const adoptDiff = b.ratings.adoption - a.ratings.adoption;
        if (adoptDiff !== 0) return adoptDiff;
        return a.name.localeCompare(b.name);
      });
    }
    if (sortBy === 'activity-desc') {
      return sorted.sort((a, b) => {
        const diff = b.ratings.activity - a.ratings.activity;
        if (diff !== 0) return diff;
        const adoptDiff = b.ratings.adoption - a.ratings.adoption;
        if (adoptDiff !== 0) return adoptDiff;
        return a.name.localeCompare(b.name);
      });
    }
    if (sortBy === 'name-asc') {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'name-desc') {
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    if (sortBy === 'status') {
      const statusWeight: Record<ProjectStatus, number> = {
        Active: 1,
        Stale: 2,
        Discontinued: 3,
      };
      return sorted.sort((a, b) => {
        const diff = (statusWeight[a.status] || 99) - (statusWeight[b.status] || 99);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      });
    }
    return sorted;
  };

  const sortedFrontends = useMemo(
    () => sortItems(filteredFrontends),
    [filteredFrontends, sortBy, statsMap]
  );
  const sortedOSFirmwares = useMemo(
    () => sortItems(filteredOSFirmwares),
    [filteredOSFirmwares, sortBy, statsMap]
  );

  // Totals for current catalog (Frontends only)
  const totalCountForTab = frontends.length;
  const totalFilteredCount = sortedFrontends.length;
  const activeFilterCount = countActiveFilters(filters, activeTab);

  // If URL route is /edit, render Web Editor Page
  if (
    currentPath === '/edit' ||
    currentPath.startsWith('/edit') ||
    (typeof window !== 'undefined' && window.location.search.includes('route=edit'))
  ) {
    return <EditPage onNavigateHome={() => navigate('/')} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col antialiased">
      {/* 1. Global Header */}
      <Header onNavigateEdit={() => navigate('/edit')} />

      {/* 2. Main Content Container */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Top Control Bar: Title & Mobile Filter Trigger */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#0a0a0a] tracking-tight">
              {t.tabs.frontends}
            </h2>
            <span className="rounded-[18px] bg-[#0a0a0a] px-2.5 py-0.5 text-[11px] font-medium text-[#fafafa]">
              {totalFilteredCount}
            </span>
            {isFromDatabase ? (
              <span
                title={language === 'ko' ? 'Supabase 실시간 데이터베이스 연동됨' : 'Connected to live Supabase database'}
                className="inline-flex items-center gap-1.5 rounded-[18px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium shadow-2xs"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>DB Live</span>
              </span>
            ) : (
              <span
                title={language === 'ko' ? '로컬 정적 큐레이션 데이터' : 'Local static curated data'}
                className="inline-flex items-center gap-1.5 rounded-[18px] bg-[#ffffff] text-[#737373] border border-[#e5e5e5] px-2 py-0.5 text-[11px] font-medium shadow-2xs"
              >
                <span>Curated</span>
              </span>
            )}
          </div>

          {/* Mobile/Tablet Filter Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] px-3.5 py-1.5 text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <SlidersHorizontal size={15} />
            <span>{language === 'ko' ? '필터' : 'Filters'}</span>
            {activeFilterCount > 0 && (
              <span className="rounded-[18px] bg-[#0a0a0a] px-2 py-0.2 text-[11px] font-medium text-[#fafafa]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* 2-Column Split: Left Sidebar Filter (280px) + Right Main Grid */}
        <div className="flex items-start gap-6 lg:gap-8">
          {/* Left Desktop Sticky Sidebar */}
          <SidebarFilter
            activeTab={activeTab}
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            filteredCount={totalFilteredCount}
            totalCount={totalCountForTab}
          />

          {/* Mobile Drawer (Visible when opened) */}
          {isMobileDrawerOpen && (
            <SidebarFilter
              activeTab={activeTab}
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
              filteredCount={totalFilteredCount}
              totalCount={totalCountForTab}
            />
          )}

          {/* Right Main Grid Area */}
          <section
            className="flex-1 w-full min-w-0 flex flex-col gap-4"
            aria-live="polite"
          >
            {/* Top Utility Bar (Result Count & Sort Dropdown) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#ffffff] px-4 py-3 rounded-[18px] border border-[#e5e5e5] shadow-xs">
              <span className="text-[13px] text-[#737373]">
                <strong className="text-[#0a0a0a] font-semibold">{totalFilteredCount}</strong> / {totalCountForTab}{language === 'ko' ? '개 표시' : ' shown'}
                {activeFilterCount > 0 && (language === 'ko' ? ' (필터링됨)' : ' (filtered)')}
              </span>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[12px] font-medium text-[#737373]">{language === 'ko' ? '정렬' : 'Sort'}:</span>
                <div className="relative inline-flex items-center">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label="Sort options"
                    className="appearance-none rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] py-1 pl-3 pr-8 text-[12px] font-medium text-[#0a0a0a] hover:border-[#737373] focus:border-[#0a0a0a] focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="adoption-desc">{language === 'ko' ? 'qScore 인지도순' : 'qScore Awareness'}</option>
                    <option value="userscore-desc">{language === 'ko' ? '유저 평점순 (userScore)' : 'User Rating (userScore)'}</option>
                    <option value="ease-desc">{language === 'ko' ? 'qScore 편의성순' : 'qScore Ease of Use'}</option>
                    <option value="activity-desc">{language === 'ko' ? 'qScore 활성도순' : 'qScore Activity'}</option>
                    <option value="status">{language === 'ko' ? '상태순 (활성 우선)' : 'Status (Active first)'}</option>
                    <option value="name-asc">{language === 'ko' ? '이름순 (오름차순)' : 'Name (A–Z)'}</option>
                    <option value="name-desc">{language === 'ko' ? '이름순 (내림차순)' : 'Name (Z–A)'}</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-2.5 text-[#737373] pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Empty State: either catalog is empty or filters matched 0 */}
            {totalCountForTab === 0 ? (
              <div className="w-full rounded-[24px] border border-dashed border-[#e5e5e5] bg-[#ffffff] p-12 text-center flex flex-col items-center justify-center gap-3 shadow-2xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f5f5] text-[#737373]">
                  <Layers size={22} />
                </div>
                <h3 className="text-[16px] font-semibold text-[#0a0a0a]">
                  {language === 'ko' ? '등록된 아이템이 없습니다' : 'No items registered'}
                </h3>
                <p className="text-[13px] text-[#737373] max-w-sm">
                  {language === 'ko'
                    ? '카탈로그가 비어 있습니다. 웹 에디터에서 새로운 프론트엔드를 추가하거나 데이터베이스에 등록해 보세요.'
                    : 'The catalog is empty. Add a new item in the editor to get started.'}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/edit')}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-[18px] bg-[#0a0a0a] px-4 py-2 text-[13px] font-medium text-[#fafafa] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                >
                  <PlusCircle size={14} />
                  <span>{t.common.addFirstItem}</span>
                </button>
              </div>
            ) : totalFilteredCount === 0 ? (
              <div className="w-full rounded-[24px] border border-dashed border-[#e5e5e5] bg-[#ffffff] p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f5f5] text-[#737373]">
                  <Search size={22} />
                </div>
                <h3 className="text-[16px] font-semibold text-[#0a0a0a]">
                  {t.common.noResultsTitle}
                </h3>
                <p className="text-[13px] text-[#737373] max-w-sm">
                  {t.common.noResultsDesc}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-[18px] bg-[#0a0a0a] px-4 py-2 text-[13px] font-medium text-[#fafafa] hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>{t.common.resetFilters}</span>
                </button>
              </div>
            ) : (
              /* Responsive Card Grid: 1 col (mobile) -> 2 cols (tablet) -> 3 cols (desktop FHD) */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {/* Frontends */}
                {(activeTab === 'all' || activeTab === 'frontends') &&
                  sortedFrontends.map((item: FrontendItem) => (
                    <ItemCard
                      key={`frontend-${item.id}`}
                      item={item}
                      type="frontend"
                      communityStats={statsMap[item.id]}
                      onClick={() => setSelectedItemState({ item, type: 'frontend' })}
                    />
                  ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 4. Detail Modal Dialog */}
      {selectedItemState && (
        <DetailModal
          item={selectedItemState.item}
          type={selectedItemState.type}
          onClose={() => setSelectedItemState(null)}
        />
      )}

      {/* 5. Minimal Footer */}
      <footer className="w-full border-t border-[#e5e5e5] bg-[#ffffff] py-6 text-center text-[13px] text-[#737373]">
        <div className="mx-auto max-w-[1400px] px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} quinutDB (db.quinut.xyz) — Curated by quinut</span>
          <span className="text-[12px] text-[#737373]">{language === 'ko' ? '아크로마틱 블루프린트 디자인' : 'Achromatic Blueprint Design'}</span>
        </div>
      </footer>
    </div>
  );
}
