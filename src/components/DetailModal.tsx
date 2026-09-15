import React, { useEffect, useState, useMemo } from 'react';
import {
  Globe,
  Download,
  X,
  Star,
  Send,
  Trash2,
  CheckCircle2,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import { FrontendItem, OSFirmwareItem, ScoreValue } from '../types';
import { TriStateIndicator, PricingBadge, StatusIndicator } from './ItemCard';
import { useAuth } from '../contexts/AuthContext';
import { useItemCommunity } from '../hooks/useItemCommunity';
import { useLanguage } from '../contexts/LanguageContext';
import { UserAvatar } from './UserAvatar';

export interface DetailModalProps {
  item: FrontendItem | OSFirmwareItem | null;
  type: 'frontend' | 'cfw';
  onClose: () => void;
}


const getStarScoreLabel = (score: number, lang: 'ko' | 'en') => {
  if (lang === 'en') {
    switch (score) {
      case 5: return '5★ Excellent';
      case 4: return '4★ Good';
      case 3: return '3★ Average';
      case 2: return '2★ Poor';
      case 1: return '1★ Terrible';
      default: return `${score}★`;
    }
  }
  switch (score) {
    case 5: return '5점 (최고예요)';
    case 4: return '4점 (좋아요)';
    case 3: return '3점 (보통이에요)';
    case 2: return '2점 (아쉬워요)';
    case 1: return '1점 (별로예요)';
    default: return `${score}점`;
  }
};

const getAdoptionDesc = (score: number, lang: 'ko' | 'en') => {
  if (lang === 'en') {
    switch (score) {
      case 5: return 'Industry Standard';
      case 4: return 'Widely Adopted';
      case 3: return 'Established Base';
      case 2: return 'Emerging & Niche';
      default: return 'Specialized / Early Stage';
    }
  }
  switch (score) {
    case 5: return '사실상 표준';
    case 4: return '높은 인지도';
    case 3: return '안정적 생태계';
    case 2: return '성장 및 틈새';
    default: return '소수 및 신생';
  }
};

const getEaseOfUseDesc = (score: number, lang: 'ko' | 'en') => {
  if (lang === 'en') {
    switch (score) {
      case 5: return 'Zero Setup';
      case 4: return 'Simple GUI Setup';
      case 3: return 'Standard Setup';
      case 2: return 'Manual Configuration';
      default: return 'Advanced Level';
    }
  }
  switch (score) {
    case 5: return '원클릭 완벽';
    case 4: return '간편한 GUI 설정';
    case 3: return '보통 난이도';
    case 2: return '수동 설정 필요';
    default: return '전문가 수준';
  }
};

const getActivityDesc = (score: number, lang: 'ko' | 'en') => {
  if (lang === 'en') {
    switch (score) {
      case 5: return 'Very Active';
      case 4: return 'Regular Updates';
      case 3: return 'Mature Stage';
      case 2: return 'Infrequent Updates';
      default: return 'Dormant / Discontinued';
    }
  }
  switch (score) {
    case 5: return '매우 활발';
    case 4: return '정기 업데이트';
    case 3: return '안정적 운영';
    case 2: return '업데이트 드묾';
    default: return '방치 및 중단';
  }
};

export const DetailModal: React.FC<DetailModalProps> = ({ item, type, onClose }) => {
  const { user, openAuthModal } = useAuth();
  const { language, t } = useLanguage();
  const itemId = item?.id || '';

  const {
    stats,
    myReview,
    reviews,
    submitting,
    submitUserScore,
    deleteMyReview,
  } = useItemCommunity(itemId);

  const [selectedRating, setSelectedRating] = useState<ScoreValue>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewContent, setReviewContent] = useState('');
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState(0);

  const galleryImages = useMemo(() => {
    if (!item) return [];
    if (item.screenshots && item.screenshots.length > 0) {
      return item.screenshots.filter(Boolean);
    }
    return [item.coverImageUrl || item.logoUrl].filter(Boolean) as string[];
  }, [item]);

  useEffect(() => {
    setActiveScreenshotIdx(0);
  }, [item?.id]);

  useEffect(() => {
    if (myReview) {
      setSelectedRating(myReview.rating);
      setReviewContent(myReview.content || '');
    } else {
      setSelectedRating(5);
      setReviewContent('');
    }
  }, [myReview]);

  const handleSubmitReview = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      openAuthModal(t.userScore.loginToRate);
      return;
    }
    setSubmitFeedback(null);
    const { error } = await submitUserScore(selectedRating, reviewContent);
    if (error) {
      setSubmitFeedback({ type: 'error', text: error.message || 'Error submitting review' });
    } else {
      setSubmitFeedback({ type: 'success', text: t.userScore.successSubmit });
      setTimeout(() => setSubmitFeedback(null), 3500);
    }
  };

  const handleDeleteReview = async () => {
    if (!user) return;
    setSubmitFeedback(null);
    const { error } = await deleteMyReview();
    if (error) {
      setSubmitFeedback({ type: 'error', text: error.message || 'Error deleting review' });
    } else {
      setSelectedRating(5);
      setReviewContent('');
      setSubmitFeedback({ type: 'success', text: t.userScore.successDelete });
      setTimeout(() => setSubmitFeedback(null), 3500);
    }
  };

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [item]);

  if (!item) return null;

  const isFrontend = type === 'frontend';
  const frontend = isFrontend ? (item as FrontendItem) : null;
  const cfw = !isFrontend ? (item as OSFirmwareItem) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 animate-fade-in"
    >
      {/* Frosted Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0a0a0a]/50 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Surface Container (2-Column Wide Blueprint, max-w-[1100px]) */}
      <div className="relative w-full max-w-[1100px] max-h-[92vh] lg:h-[88vh] overflow-hidden rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] shadow-[0_0_0_1px_rgba(23,23,23,0.06),0_12px_40px_rgba(0,0,0,0.14)] z-10 flex flex-col">
        {/* ============================================================ */}
        {/* Top Header Bar with Big Accessible Close Button             */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-4 sm:px-8 bg-[#ffffff] shrink-0">
          <div className="flex items-center gap-3">
            {/* Boxart-styled mini avatar */}
            <div
              style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
              className="p-1 flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#fafafa] border border-[#e5e5e5] shadow-xs shrink-0 overflow-hidden"
            >
              <div className="h-full w-full rounded-[8px] overflow-hidden border border-[#e5e5e5]/80 bg-[#ffffff] flex items-center justify-center">
                {item.logoUrl ? (
                  <img src={item.logoUrl} alt={`${item.name} logo`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[13px] font-bold text-[#0a0a0a]">
                    {item.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-semibold text-[#0a0a0a] tracking-[-0.5px]">
                  {item.name}
                </h2>
                <span className="rounded-[18px] bg-[#f5f5f5] px-2.5 py-0.5 text-[11px] font-medium text-[#171717] border border-[#e5e5e5]">
                  {item.pricing}
                </span>
              </div>
              <span className="text-[12px] text-[#737373]">
                {isFrontend ? '에뮬레이션 프론트엔드 & 런처' : '커스텀 펌웨어 & OS'}
              </span>
            </div>
          </div>

          {/* Big, Clear Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[#e5e5e5] bg-[#f5f5f5] text-[#0a0a0a] transition-all hover:bg-[#e5e5e5] hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* ============================================================ */}
        {/* 2-Column Split Content Body (Independent Column Scrolls)      */}
        {/* ============================================================ */}
        <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#e5e5e5]">
          {/* ---------------------------------------------------------- */}
          {/* Left Column (col-span-7): UI Showcase & Specification     */}
          {/* ---------------------------------------------------------- */}
          <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto p-6 sm:p-8 flex flex-col gap-6">
            {/* Real UI Screenshot Gallery */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                    {t.detail.galleryTitle}
                  </h4>
                  {galleryImages.length > 1 && (
                    <span className="rounded-[18px] bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5] px-2 py-0.5 text-[10px] font-medium tabular-nums">
                      {activeScreenshotIdx + 1} / {galleryImages.length}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#737373]">{t.detail.galleryFormat}</span>
              </div>

              {/* Main Screenshot Container */}
              <div className="relative w-full aspect-[16/9] rounded-[22px] border border-[#e5e5e5] bg-[#0a0a0a] overflow-hidden shadow-xs group flex items-center justify-center">
                {/* Top-Right Badges */}
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
                  <PricingBadge pricing={item.pricing} />
                  <StatusIndicator status={item.status} />
                </div>

                {galleryImages.length > 0 ? (
                  <img
                    src={galleryImages[activeScreenshotIdx] || galleryImages[0]}
                    alt={`${item.name} screenshot ${activeScreenshotIdx + 1}`}
                    className="h-full w-full object-contain rounded-xl select-none transition-opacity duration-200"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-[#737373] p-6 text-center">
                    <ImageIcon size={32} strokeWidth={1.5} className="text-[#a3a3a3]" />
                    <span className="text-[12px]">{t.detail.noScreenshots}</span>
                  </div>
                )}

                {/* Left/Right Navigation Arrows if > 1 images */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveScreenshotIdx((prev) =>
                          prev > 0 ? prev - 1 : galleryImages.length - 1
                        );
                      }}
                      aria-label="Previous screenshot"
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0a]/70 hover:bg-[#0a0a0a] text-[#ffffff] border border-[#ffffff]/20 backdrop-blur-xs transition-all opacity-80 group-hover:opacity-100 active:scale-95 cursor-pointer z-10"
                    >
                      <ChevronLeft size={18} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveScreenshotIdx((prev) =>
                          prev < galleryImages.length - 1 ? prev + 1 : 0
                        );
                      }}
                      aria-label="Next screenshot"
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0a]/70 hover:bg-[#0a0a0a] text-[#ffffff] border border-[#ffffff]/20 backdrop-blur-xs transition-all opacity-80 group-hover:opacity-100 active:scale-95 cursor-pointer z-10"
                    >
                      <ChevronRight size={18} strokeWidth={2.5} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Strip if > 1 images */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-2.5 scrollbar-thin">
                  {galleryImages.map((imgUrl, idx) => {
                    const isActive = idx === activeScreenshotIdx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveScreenshotIdx(idx)}
                        className={`relative h-12 w-20 shrink-0 rounded-[10px] overflow-hidden border transition-all cursor-pointer bg-[#0a0a0a] ${
                          isActive
                            ? 'border-[#0a0a0a] ring-2 ring-[#0a0a0a]/30 scale-[1.03] shadow-xs'
                            : 'border-[#e5e5e5] opacity-60 hover:opacity-100 hover:border-[#737373]'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* qScore Curation Benchmark (3-Category 1-5 Benchmark) */}
            {item.ratings && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-[8px] bg-[#0a0a0a] text-[#ffffff] px-2 py-0.5 text-[10px] font-bold tracking-wide">
                      qScore
                    </span>
                    <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#0a0a0a]">
                      {t.qscore.title}
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#737373]">
                    {t.qscore.scale}
                  </span>
                </div>
                <p className="text-[11px] text-[#737373] mb-2.5">
                  {t.qscore.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* 1. Adoption */}
                  <div className="flex flex-col justify-between p-3.5 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-[#737373]">{t.ratings.adoption}</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-[15px] font-bold text-[#0a0a0a]">
                          {item.ratings.adoption}
                        </span>
                        <span className="text-[11px] text-[#737373]">/5</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1 my-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div
                          key={s}
                          className={`h-1.5 rounded-full ${
                            s <= item.ratings.adoption ? 'bg-[#0a0a0a]' : 'bg-[#e5e5e5]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#171717] font-medium leading-tight">
                      {getAdoptionDesc(item.ratings.adoption, language)}
                    </span>
                  </div>

                  {/* 2. Ease of Use */}
                  <div className="flex flex-col justify-between p-3.5 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-[#737373]">{t.ratings.easeOfUse}</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-[15px] font-bold text-[#0a0a0a]">
                          {item.ratings.easeOfUse}
                        </span>
                        <span className="text-[11px] text-[#737373]">/5</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1 my-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div
                          key={s}
                          className={`h-1.5 rounded-full ${
                            s <= item.ratings.easeOfUse ? 'bg-[#0a0a0a]' : 'bg-[#e5e5e5]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#171717] font-medium leading-tight">
                      {getEaseOfUseDesc(item.ratings.easeOfUse, language)}
                    </span>
                  </div>

                  {/* 3. Activity */}
                  <div className="flex flex-col justify-between p-3.5 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-[#737373]">{t.ratings.activity}</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-[15px] font-bold text-[#0a0a0a]">
                          {item.ratings.activity}
                        </span>
                        <span className="text-[11px] text-[#737373]">/5</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1 my-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div
                          key={s}
                          className={`h-1.5 rounded-full ${
                            s <= item.ratings.activity ? 'bg-[#0a0a0a]' : 'bg-[#e5e5e5]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#171717] font-medium leading-tight">
                      {getActivityDesc(item.ratings.activity, language)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Specification Matrix (Frontends) */}
            {isFrontend && frontend && (
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] mb-3">
                  {language === 'ko' ? '기능 및 사양' : 'Feature Matrix'}
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex items-center justify-between p-3 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                    <span className="text-[13px] text-[#0a0a0a] font-medium">{t.features.builtInScraper}</span>
                    <TriStateIndicator value={frontend.hasBuiltInScraper} label="" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                    <span className="text-[13px] text-[#0a0a0a] font-medium">{t.features.touchOptimized}</span>
                    <TriStateIndicator value={frontend.touchOptimized} label="" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                    <span className="text-[13px] text-[#0a0a0a] font-medium">{t.features.gamepadOptimized}</span>
                    <TriStateIndicator value={frontend.gamepadOptimized} label="" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                    <span className="text-[13px] text-[#0a0a0a] font-medium">{t.features.canReplaceHomeLauncher}</span>
                    <TriStateIndicator value={frontend.canReplaceHomeLauncher} label="" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Right Column (col-span-5): Overview, Compatibility & Links */}
          {/* ---------------------------------------------------------- */}
          <div className="lg:col-span-5 lg:h-full lg:overflow-y-auto p-6 sm:p-8 flex flex-col justify-between gap-6 bg-[#fafafa]/50">
            <div className="flex flex-col gap-6">
              {/* Overview Narrative */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] mb-2.5">
                  {t.detail.overview}
                </h4>
                <div className="rounded-[18px] bg-[#ffffff] p-5 border border-[#e5e5e5] shadow-2xs">
                  <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#171717]">
                    {item.shortDesc}
                  </p>
                </div>
              </div>

              {/* Compatibility & Platform Specs */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] mb-2.5">
                  {language === 'ko' ? '호환성 및 환경' : 'Compatibility & Environment'}
                </h4>

                {isFrontend && frontend && (
                  <div className="rounded-[18px] bg-[#ffffff] p-5 border border-[#e5e5e5] flex flex-col gap-3.5 shadow-2xs">
                    <div>
                      <span className="text-[12px] text-[#737373] block mb-1.5 font-medium">
                        {t.detail.supportedPlatforms}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {frontend.supportedPlatforms.map((platform: string) => (
                          <span
                            key={platform}
                            className="rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] px-2.5 py-0.5 text-[12px] font-medium text-[#0a0a0a]"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-[#e5e5e5] pt-3 flex items-center justify-between">
                      <span className="text-[12px] text-[#737373] font-medium">{t.detail.themeSupport}</span>
                      <span className="rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] px-2.5 py-0.5 text-[12px] font-medium text-[#0a0a0a]">
                        {frontend.themeSupport}
                      </span>
                    </div>
                  </div>
                )}

                {!isFrontend && cfw && (
                  <div className="rounded-[18px] bg-[#ffffff] p-5 border border-[#e5e5e5] flex flex-col gap-3.5 shadow-2xs">
                    <div>
                      <span className="text-[12px] text-[#737373] block mb-1 font-medium">{t.detail.baseSystem}</span>
                      <span className="text-[13px] text-[#0a0a0a] font-medium">{cfw.baseSystem}</span>
                    </div>

                    {cfw.exploitType && (
                      <div className="border-t border-[#e5e5e5] pt-3">
                        <span className="text-[12px] text-[#737373] block mb-1 font-medium">{t.detail.exploitType}</span>
                        <span className="text-[13px] text-[#0a0a0a] font-medium">{cfw.exploitType}</span>
                      </div>
                    )}

                    <div className="border-t border-[#e5e5e5] pt-3">
                      <span className="text-[12px] text-[#737373] block mb-1.5 font-medium">{t.detail.targetDevices}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {cfw.targetDevices.map((device: string) => (
                          <span
                            key={device}
                            className="rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] px-2.5 py-0.5 text-[12px] font-medium text-[#0a0a0a]"
                          >
                            {device}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* userScore & Google Play Style Reviews Section */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-[8px] bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5] px-2 py-0.5 text-[10px] font-bold tracking-wide">
                      userScore
                    </span>
                    <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#0a0a0a]">
                      {t.userScore.title}
                    </h4>
                  </div>
                  {stats && stats.totalRatings > 0 && (
                    <span className="text-[11px] text-[#737373]">
                      {t.userScore.ratingsCount.replace('{count}', String(stats.totalRatings))}
                    </span>
                  )}
                </div>

                {/* Overall userScore Summary Hero Card */}
                <div className="rounded-[18px] bg-[#ffffff] p-4 border border-[#e5e5e5] shadow-2xs mb-3 flex items-center justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[32px] font-bold text-[#0a0a0a] leading-none tracking-tight">
                      {stats && stats.totalRatings > 0 ? stats.avgUserScore.toFixed(1) : '—'}
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-0.5 text-[#0a0a0a]">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const score = stats && stats.totalRatings > 0 ? stats.avgUserScore : 0;
                          return (
                            <Star
                              key={star}
                              size={14}
                              className={
                                star <= Math.round(score)
                                  ? 'fill-[#0a0a0a] text-[#0a0a0a]'
                                  : 'text-[#d4d4d4]'
                              }
                            />
                          );
                        })}
                      </div>
                      <span className="text-[11px] text-[#737373] mt-0.5">
                        {stats && stats.totalRatings > 0
                          ? `${stats.totalRatings} ratings · ${stats.textReviewCount} reviews`
                          : t.userScore.noRatings}
                      </span>
                    </div>
                  </div>

                  {myReview && (
                    <span className="rounded-[12px] bg-[#0a0a0a] text-[#ffffff] px-2.5 py-1 text-[11px] font-medium shrink-0">
                      ★ {myReview.rating}점 평가 완료
                    </span>
                  )}
                </div>

                {/* Rate & Review Form (Google Play Style) */}
                <div className="rounded-[18px] bg-[#ffffff] p-4 border border-[#e5e5e5] shadow-2xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#0a0a0a]">
                      {myReview ? t.userScore.updateReview : t.userScore.ratePrompt}
                    </span>
                    <span className="text-[11px] font-medium text-[#737373]">
                      {getStarScoreLabel(hoverRating || selectedRating, language)}
                    </span>
                  </div>

                  {/* 5-Star Interactive Selector */}
                  <div className="flex items-center gap-1.5 py-0.5">
                    {([1, 2, 3, 4, 5] as ScoreValue[]).map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          if (!user) {
                            openAuthModal(t.userScore.loginToRate);
                            return;
                          }
                          setSelectedRating(star);
                        }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        aria-label={`${star} stars`}
                        className="p-1 text-[#0a0a0a] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <Star
                          size={24}
                          strokeWidth={2}
                          className={
                            star <= (hoverRating || selectedRating)
                              ? 'fill-[#0a0a0a] text-[#0a0a0a]'
                              : 'text-[#d4d4d4]'
                          }
                        />
                      </button>
                    ))}
                  </div>

                  {/* Optional Comment Textarea */}
                  <form onSubmit={handleSubmitReview} className="flex flex-col gap-2">
                    <textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder={
                        user
                          ? t.userScore.reviewOptionalPlaceholder
                          : t.userScore.loginToRate
                      }
                      rows={2}
                      maxLength={1000}
                      disabled={!user || submitting}
                      className="w-full resize-none rounded-[14px] border border-[#e5e5e5] bg-[#fafafa] p-3 text-[12px] text-[#0a0a0a] placeholder-[#a3a3a3] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none transition-all disabled:opacity-60"
                    />

                    {submitFeedback && (
                      <p
                        className={`inline-flex items-center gap-1 text-[12px] font-medium px-1 ${
                          submitFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {submitFeedback.type === 'success' && <CheckCircle2 size={13} />}
                        <span>{submitFeedback.text}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        {myReview && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(language === 'ko' ? '평가를 삭제하시겠습니까?' : 'Delete your review?')) {
                                handleDeleteReview();
                              }
                            }}
                            disabled={submitting}
                            title={t.userScore.deleteReview}
                            className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 hover:underline cursor-pointer disabled:opacity-40"
                          >
                            <Trash2 size={12} />
                            <span>{t.userScore.deleteReview}</span>
                          </button>
                        )}
                      </div>

                      {!user ? (
                        <button
                          type="button"
                          onClick={() => openAuthModal(t.userScore.loginToRate)}
                          className="inline-flex items-center gap-1.5 rounded-[18px] bg-[#0a0a0a] px-3.5 py-1.5 text-[12px] font-medium text-[#fafafa] hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          <LogIn size={13} />
                          <span>{language === 'ko' ? '로그인 후 평가' : 'Sign in to rate'}</span>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={submitting}
                          className="inline-flex items-center gap-1.5 rounded-[18px] bg-[#0a0a0a] px-4 py-1.5 text-[12px] font-medium text-[#fafafa] hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shadow-xs"
                        >
                          <Send size={12} />
                          <span>
                            {submitting
                              ? (language === 'ko' ? '저장 중...' : 'Saving...')
                              : myReview
                              ? t.userScore.updateReview
                              : reviewContent.trim()
                              ? t.userScore.submitReview
                              : t.userScore.submitRatingOnly.replace('{rating}', String(selectedRating))}
                          </span>
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Reviews List Feed */}
                  <div className="border-t border-[#e5e5e5] pt-3 flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {reviews.length === 0 ? (
                      <div className="py-4 text-center text-[12px] text-[#737373]">
                        {t.userScore.noRatings}
                      </div>
                    ) : (
                      reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="rounded-[14px] bg-[#fafafa] p-3 border border-[#e5e5e5]/80 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <UserAvatar
                                userId={rev.userId}
                                username={rev.username}
                                avatarUrl={rev.avatarUrl}
                                size={24}
                              />
                              <span className="text-[12px] font-semibold text-[#0a0a0a] truncate max-w-[120px]">
                                {rev.username}
                              </span>
                              {user && user.id === rev.userId && (
                                <span className="rounded-[8px] bg-[#0a0a0a] text-[#ffffff] px-1.5 py-0.2 text-[9.5px] font-semibold">
                                  {t.userScore.myRatingBadge}
                                </span>
                              )}
                              <span className="text-[10px] text-[#737373]">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-0.5 text-[#0a0a0a]">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={11}
                                  className={
                                    s <= rev.rating
                                      ? 'fill-[#0a0a0a] text-[#0a0a0a]'
                                      : 'text-[#d4d4d4]'
                                  }
                                />
                              ))}
                            </div>
                          </div>

                          {rev.content && rev.content.trim() ? (
                            <p className="text-[12px] text-[#171717] whitespace-pre-wrap leading-relaxed">
                              {rev.content}
                            </p>
                          ) : (
                            <span className="text-[11px] text-[#a3a3a3] italic">
                              {t.userScore.ratingOnlyNote}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Links Footer */}
            <div className="border-t border-[#e5e5e5] pt-5 flex flex-col gap-2.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                {language === 'ko' ? '외부 링크' : 'External Links'}
              </h4>
              <div className="flex flex-col gap-2">
                {item.downloadUrl && (
                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#0a0a0a] px-5 text-[14px] font-medium text-[#fafafa] hover:opacity-90 transition-opacity"
                  >
                    <span>{language === 'ko' ? '다운로드' : 'Download'}</span>
                    <Download size={16} strokeWidth={2} className="shrink-0" />
                  </a>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {item.officialUrl && (
                    <a
                      href={item.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] px-3 text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors"
                    >
                      <Globe size={15} strokeWidth={2} className="shrink-0" />
                      <span className="truncate">{language === 'ko' ? '공식 웹사이트' : 'Website'}</span>
                    </a>
                  )}

                  {item.githubRepo && (
                    <a
                      href={`https://github.com/${item.githubRepo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] px-3 text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="shrink-0"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        />
                      </svg>
                      <span className="truncate">GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
