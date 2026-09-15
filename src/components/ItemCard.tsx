import React, { useState } from 'react';
import { Globe, Download } from 'lucide-react';
import {
  FrontendItem,
  OSFirmwareItem,
  TriState,
  PricingModel,
  ProjectStatus
} from '../types';
import { ItemRatingStats } from '../hooks/useItemCommunity';

export interface ItemCardProps {
  item: FrontendItem | OSFirmwareItem;
  type: 'frontend' | 'cfw';
  communityStats?: ItemRatingStats;
  onClick?: () => void;
}

// 1. TriState Icon or Badge helper
export const TriStateIndicator: React.FC<{
  value?: TriState;
  label: string;
}> = ({ value, label }) => {
  if (value === true) {
    return (
<span
         title={`${label}: 지원됨`}
         className="inline-flex items-center gap-1 rounded-[18px] bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-0.5 text-[11px] font-medium text-[#166534]"
       >
         <svg
           className="h-3 w-3 stroke-[2.5]"
           viewBox="0 0 24 24"
           fill="none"
           stroke="currentColor"
           strokeLinecap="round"
           strokeLinejoin="round"
         >
           <polyline points="20 6 9 17 4 12" />
         </svg>
         <span>{label}</span>
       </span>
    );
  }

  if (value === false) {
    return (
<span
         title={`${label}: 지원 안 됨`}
         className="inline-flex items-center gap-1 rounded-[18px] bg-[#fef2f2] border border-[#fecaca] px-2 py-0.5 text-[11px] font-medium text-[#991b1b]"
       >
         <svg
           className="h-3 w-3 stroke-[2.5]"
           viewBox="0 0 24 24"
           fill="none"
           stroke="currentColor"
           strokeLinecap="round"
           strokeLinejoin="round"
         >
           <line x1="18" y1="6" x2="6" y2="18" />
           <line x1="6" y1="6" x2="18" y2="18" />
         </svg>
         <span>{label}</span>
       </span>
    );
  }

  return (
    <span
      title={`${label}: 알 수 없음 / 미확인`}
      className="inline-flex items-center gap-1 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] px-2 py-0.5 text-[11px] font-medium text-[#737373]"
    >
      <span className="text-[10px] font-mono leading-none">?</span>
      <span>{label}</span>
    </span>
  );
};

// 2. Pricing Badge Helper
const PRICING_LABELS: Record<PricingModel, string> = {
  'Free & Open Source': '무료 & 오픈소스',
  'Free': '무료',
  'Freemium': '프리미엄',
  'Paid': '유료',
};

export const PricingBadge: React.FC<{ pricing: PricingModel }> = ({ pricing }) => {
  const label = PRICING_LABELS[pricing] || pricing;
  switch (pricing) {
    case 'Free & Open Source':
      return (
        <span className="rounded-[18px] bg-[#0a0a0a]/80 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-medium text-[#fafafa] border border-white/10">
          {label}
        </span>
      );
    case 'Free':
      return (
        <span className="rounded-[18px] bg-[#ffffff]/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-medium text-[#0a0a0a] border border-[#e5e5e5] shadow-xs">
          {label}
        </span>
      );
    case 'Freemium':
      return (
        <span className="rounded-[18px] bg-[#fafafa]/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-medium text-[#171717] border border-[#e5e5e5]">
          {label}
        </span>
      );
    case 'Paid':
      return (
        <span className="rounded-[18px] bg-[#171717]/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-medium text-[#fafafa] border border-white/20">
          {label}
        </span>
      );
    default:
      return null;
  }
};

// 3. Status Dot Helper
export const StatusIndicator: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const STATUS_LABELS: Record<ProjectStatus, string> = {
  Active: '활성',
  Stale: '정체',
  Discontinued: '중단',
};

  const getStatusConfig = () => {
    switch (status) {
      case 'Active':
        return {
          dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
          textClass: 'text-emerald-950 bg-emerald-50/90 border-emerald-200/80',
          label: STATUS_LABELS.Active
        };
      case 'Stale':
        return {
          dotClass: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
          textClass: 'text-amber-950 bg-amber-50/90 border-amber-200/80',
          label: STATUS_LABELS.Stale
        };
      case 'Discontinued':
      default:
        return {
          dotClass: 'bg-[#737373]',
          textClass: 'text-[#171717] bg-[#f5f5f5]/90 border-[#e5e5e5]',
          label: STATUS_LABELS[status] || '알 수 없음'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[18px] backdrop-blur-md border px-2 py-0.5 text-[11px] font-medium ${config.textClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
};

export const ItemCard: React.FC<ItemCardProps> = ({ item, type, communityStats, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const isFrontend = type === 'frontend';
  const frontend = isFrontend ? (item as FrontendItem) : null;
  const cfw = !isFrontend ? (item as OSFirmwareItem) : null;

  const hasCommunity = Boolean(communityStats && communityStats.voteCount > 0);
  const displayAdoption = hasCommunity ? communityStats!.avgAdoption.toFixed(1) : item.ratings?.adoption;
  const displayEase = hasCommunity ? communityStats!.avgEaseOfUse.toFixed(1) : item.ratings?.easeOfUse;
  const displayActivity = hasCommunity ? communityStats!.avgActivity.toFixed(1) : item.ratings?.activity;

  return (
    <article
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-[20px] border border-[#e5e5e5] bg-[#ffffff] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(23,23,23,0.08),0_4px_12px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 cursor-pointer"
    >
      {/* ============================================================ */}
      {/* 1. 1:1 Boxart Identity (Square Aspect Ratio - Edge to Edge)  */}
      {/* ============================================================ */}
      <div
        style={{ aspectRatio: '1 / 1' }}
        className="relative aspect-square w-full bg-[#fafafa] border-b border-[#e5e5e5] overflow-hidden"
      >
        {/* Top Badges Overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <PricingBadge pricing={item.pricing} />
          <StatusIndicator status={item.status} />
        </div>

        {/* 1:1 Boxart Full-Bleed Image Frame */}
        {item.logoUrl && !logoError ? (
          <img
            src={item.logoUrl}
            alt={`${item.name} logo`}
            onError={() => setLogoError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f5f5f5]">
            <span className="text-[36px] font-bold text-[#0a0a0a] select-none tracking-tight">
              {item.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. Metadata Content & Specifications                         */}
      {/* ============================================================ */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title & Short Description */}
        <div className="mb-3">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-[17px] font-semibold text-[#0a0a0a] tracking-tight group-hover:text-black">
              {item.name}
            </h3>
            {hasCommunity && (
              <span
                title={`커뮤니티 투표 ${communityStats?.voteCount}명 참여`}
                className="text-[10px] font-medium text-[#737373] bg-[#f5f5f5] border border-[#e5e5e5] px-1.5 py-0.5 rounded-[8px]"
              >
                투표 {communityStats?.voteCount}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[#737373]">
            {item.shortDesc}
          </p>
        </div>

        {/* Curation / Community Ratings (3-Part Metric Strip) */}
        {item.ratings && (
          <div className="grid grid-cols-3 gap-1.5 mb-2.5 text-center">
            <div
              title={`대중성: ${displayAdoption}/5 ${hasCommunity ? '(커뮤니티 투표 평균)' : '(큐레이션 기준)'}`}
              className="flex flex-col items-center justify-center py-1.5 px-1 rounded-[12px] bg-[#fafafa] border border-[#e5e5e5] shadow-2xs"
            >
              <span className="text-[10px] font-medium text-[#737373] tracking-tight">대중성</span>
              <span className="text-[13px] font-semibold text-[#0a0a0a] leading-none mt-1">
                {displayAdoption}<span className="text-[10px] font-normal text-[#737373]">/5</span>
              </span>
            </div>
            <div
              title={`편의성: ${displayEase}/5 ${hasCommunity ? '(커뮤니티 투표 평균)' : '(큐레이션 기준)'}`}
              className="flex flex-col items-center justify-center py-1.5 px-1 rounded-[12px] bg-[#fafafa] border border-[#e5e5e5] shadow-2xs"
            >
              <span className="text-[10px] font-medium text-[#737373] tracking-tight">편의성</span>
              <span className="text-[13px] font-semibold text-[#0a0a0a] leading-none mt-1">
                {displayEase}<span className="text-[10px] font-normal text-[#737373]">/5</span>
              </span>
            </div>
            <div
              title={`활성도: ${displayActivity}/5 ${hasCommunity ? '(커뮤니티 투표 평균)' : '(큐레이션 기준)'}`}
              className="flex flex-col items-center justify-center py-1.5 px-1 rounded-[12px] bg-[#fafafa] border border-[#e5e5e5] shadow-2xs"
            >
              <span className="text-[10px] font-medium text-[#737373] tracking-tight">활성도</span>
              <span className="text-[13px] font-semibold text-[#0a0a0a] leading-none mt-1">
                {displayActivity}<span className="text-[10px] font-normal text-[#737373]">/5</span>
              </span>
            </div>
          </div>
        )}

        {/* Type-Specific Meta & Features */}
        <div className="flex flex-col gap-3 py-2 border-t border-[#e5e5e5]/80 my-auto">
          {/* FRONTEND TYPE */}
          {isFrontend && frontend && (
            <>
              {/* Supported Platforms */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-[#737373] mr-1">OS / CFW:</span>
                {frontend.supportedPlatforms.map((platform: string) => (
                  <span
                    key={platform}
                    className="rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] px-2 py-0.5 text-[11px] font-medium text-[#171717]"
                  >
                    {platform}
                  </span>
                ))}
              </div>

{/* Key Features TriState Badges */}
               <div className="flex flex-wrap items-center gap-1.5 pt-1">
                 <TriStateIndicator value={frontend.hasBuiltInScraper} label="스크래퍼" />
                 <TriStateIndicator value={frontend.touchOptimized} label="터치" />
                 <TriStateIndicator value={frontend.gamepadOptimized} label="게임패드" />
               </div>
            </>
          )}

          {/* CFW TYPE */}
          {!isFrontend && cfw && (
            <>
              {/* Category & Target Devices Row */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-[18px] bg-[#171717] px-2.5 py-0.5 text-[11px] font-medium text-[#fafafa]">
                  {cfw.category}
                </span>
                {cfw.targetDevices.map((device: string) => (
                  <span
                    key={device}
                    className="rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] px-2.5 py-0.5 text-[11px] font-medium text-[#171717]"
                  >
                    {device}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ============================================================ */}
        {/* 3. Card Bottom Action Buttons                                */}
        {/* ============================================================ */}
        <div className="mt-4 pt-3 border-t border-[#e5e5e5] flex items-center justify-between">
          <div className="text-[12px] text-[#737373]">
            {isFrontend && frontend?.themeSupport && (
              <span>테마: <strong className="text-[#0a0a0a] font-medium">{frontend.themeSupport}</strong></span>
            )}
            {!isFrontend && cfw?.defaultFrontend && (
              <span>기본 UI: <strong className="text-[#0a0a0a] font-medium">{cfw.defaultFrontend}</strong></span>
            )}
          </div>

          {/* Fast Action Buttons (Visible on mobile, fade-in/hover on desktop) */}
          <div className="flex items-center gap-1.5 opacity-100 sm:opacity-80 sm:group-hover:opacity-100 transition-opacity">
            {/* Official Website */}
            {item.officialUrl && (
              <a
                href={item.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                title="공식 웹사이트"
                aria-label="공식 웹사이트"
                className="flex h-7 w-7 items-center justify-center rounded-[14px] border border-[#e5e5e5] bg-[#ffffff] text-[#737373] transition-colors hover:border-[#0a0a0a] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]"
              >
                <Globe size={14} strokeWidth={2} className="shrink-0" />
              </a>
            )}

            {/* GitHub Repository */}
            {item.githubRepo && (
              <a
                href={`https://github.com/${item.githubRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                title={`GitHub: ${item.githubRepo}`}
                aria-label="깃허브 저장소"
                className="flex h-7 w-7 items-center justify-center rounded-[14px] border border-[#e5e5e5] bg-[#ffffff] text-[#737373] transition-colors hover:border-[#0a0a0a] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="shrink-0"
                  style={{ width: '14px', height: '14px', minWidth: '14px', minHeight: '14px' }}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>
            )}

            {/* Download Link */}
            {item.downloadUrl && (
              <a
                href={item.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                title="다운로드 / 릴리스"
                aria-label="다운로드"
                className="flex h-7 w-7 items-center justify-center rounded-[14px] bg-[#0a0a0a] text-[#fafafa] transition-opacity hover:opacity-90"
              >
                <Download size={14} strokeWidth={2} className="shrink-0" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
