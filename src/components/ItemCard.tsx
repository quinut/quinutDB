import React, { useState } from 'react';
import { Globe, Download, Star } from 'lucide-react';
import {
  FrontendItem,
  OSFirmwareItem,
  TriState,
  PricingModel,
  ProjectStatus
} from '../types';
import { ItemRatingStats } from '../hooks/useItemCommunity';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { language } = useLanguage();

  if (value === true) {
    return (
      <span
        title={`${label}: ${language === 'ko' ? '지원됨' : 'Supported'}`}
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
        title={`${label}: ${language === 'ko' ? '지원 안 됨' : 'Not supported'}`}
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
      title={`${label}: ${language === 'ko' ? '알 수 없음' : 'Unknown'}`}
      className="inline-flex items-center gap-1 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] px-2 py-0.5 text-[11px] font-medium text-[#737373]"
    >
      <span className="text-[10px] font-mono leading-none">?</span>
      <span>{label}</span>
    </span>
  );
};

// 2. Pricing Badge Helper
export const PricingBadge: React.FC<{ pricing: PricingModel }> = ({ pricing }) => {
  const { t } = useLanguage();
  const label = t.pricing[pricing] || pricing;

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
  const { language, t } = useLanguage();
  const label = t.status[status] || status;

  const getStatusConfig = () => {
    switch (status) {
      case 'Active':
        return {
          dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
          textClass: 'text-emerald-950 bg-emerald-50/90 border-emerald-200/80',
          label
        };
      case 'Stale':
        return {
          dotClass: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
          textClass: 'text-amber-950 bg-amber-50/90 border-amber-200/80',
          label
        };
      case 'Discontinued':
      default:
        return {
          dotClass: 'bg-[#737373]',
          textClass: 'text-[#171717] bg-[#f5f5f5]/90 border-[#e5e5e5]',
          label: label || (language === 'ko' ? '알 수 없음' : 'Unknown')
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
  const { language, t } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const isFrontend = type === 'frontend';
  const frontend = isFrontend ? (item as FrontendItem) : null;
  const cfw = !isFrontend ? (item as OSFirmwareItem) : null;

  const hasUserScore = Boolean(communityStats && communityStats.totalRatings > 0);
  const avgUserScore = communityStats ? communityStats.avgUserScore : 0;
  const totalUserRatings = communityStats ? communityStats.totalRatings : 0;

  return (
    <article
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-[20px] border border-[#e5e5e5] bg-[#ffffff] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(23,23,23,0.08),0_4px_12px_rgba(0,0,0,0.06),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 cursor-pointer"
    >
      {/* ============================================================ */}
      {/* 1. 1:1 Boxart Identity (Square Aspect Ratio - Padded Box)     */}
      {/* ============================================================ */}
      <div
        style={{ aspectRatio: '1 / 1' }}
        className="relative aspect-square w-full bg-[#fafafa] border-b border-[#e5e5e5] overflow-hidden flex items-center justify-center p-4 sm:p-6"
      >
        {/* Top Badges Overlay */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
          <PricingBadge pricing={item.pricing} />
          <StatusIndicator status={item.status} />
        </div>

        {/* 1:1 Boxart Padded Image Frame */}
        {item.logoUrl && !logoError ? (
          <img
            src={item.logoUrl}
            alt={`${item.name} logo`}
            onError={() => setLogoError(true)}
            className="max-h-full max-w-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105 select-none"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-6 text-center">
            <span className="text-[18px] font-bold tracking-tight text-[#a3a3a3] select-none">
              {item.name}
            </span>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. Structured Metadata Body                                  */}
      {/* ============================================================ */}
      <div className="flex flex-1 flex-col p-4">
        {/* Name & userScore Header */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-[16px] font-bold tracking-tight text-[#0a0a0a] group-hover:text-neutral-600 transition-colors">
            {item.name}
          </h3>
          {hasUserScore ? (
            <div
              title={`${t.userScore.title}: ${avgUserScore.toFixed(1)}/5 (${totalUserRatings})`}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#0a0a0a] bg-[#fafafa] border border-[#e5e5e5] rounded-[10px] px-2 py-0.5 shrink-0 shadow-2xs"
            >
              <Star size={11} className="fill-[#0a0a0a] text-[#0a0a0a]" />
              <span>{avgUserScore.toFixed(1)}</span>
              <span className="text-[9.5px] font-normal text-[#737373]">({totalUserRatings})</span>
            </div>
          ) : (
            <div
              title={t.userScore.noRatings}
              className="flex items-center gap-1 text-[10px] text-[#a3a3a3] font-medium shrink-0 pt-0.5"
            >
              <Star size={10} className="text-[#a3a3a3]" />
              <span>userScore —</span>
            </div>
          )}
        </div>

        {/* Short Description */}
        <p className="text-[12px] text-[#737373] line-clamp-2 leading-relaxed min-h-[34px] mb-3">
          {item.shortDesc}
        </p>

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

              {/* Key Features TriState Badges (hide unsupported features) */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {frontend.hasBuiltInScraper !== false && (
                  <TriStateIndicator value={frontend.hasBuiltInScraper} label={t.features.builtInScraper} />
                )}
                {frontend.touchOptimized !== false && (
                  <TriStateIndicator value={frontend.touchOptimized} label={t.features.touchOptimized} />
                )}
                {frontend.gamepadOptimized !== false && (
                  <TriStateIndicator value={frontend.gamepadOptimized} label={t.features.gamepadOptimized} />
                )}
                {frontend.dualScreenOptimized !== false && frontend.dualScreenOptimized !== null && frontend.dualScreenOptimized !== undefined && (
                  <TriStateIndicator value={frontend.dualScreenOptimized} label={t.features.dualScreenOptimized} />
                )}
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
            {!isFrontend && cfw?.defaultFrontend && (
              <span>{language === 'ko' ? '기본 UI' : 'Default UI'}: <strong className="text-[#0a0a0a] font-medium">{cfw.defaultFrontend}</strong></span>
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
                title={language === 'ko' ? '공식 웹사이트' : 'Official Website'}
                aria-label="Official Website"
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
                aria-label="GitHub Repository"
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
                title={language === 'ko' ? '다운로드' : 'Download'}
                aria-label="Download"
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
