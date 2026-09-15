import React, { useEffect, useState } from 'react';
import {
  Globe,
  Download,
  X,
  Star,
  MessageSquare,
  Send,
  Trash2,
  CheckCircle2,
  LogIn,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FrontendItem, OSFirmwareItem, ScoreValue } from '../types';
import { TriStateIndicator, PricingBadge, StatusIndicator } from './ItemCard';
import { useAuth } from '../contexts/AuthContext';
import { useItemCommunity } from '../hooks/useItemCommunity';

export interface DetailModalProps {
  item: FrontendItem | OSFirmwareItem | null;
  type: 'frontend' | 'cfw';
  onClose: () => void;
}

const getAdoptionDesc = (score: number) => {
  switch (score) {
    case 5: return '사실상 표준';
    case 4: return '높은 대중성';
    case 3: return '안정적 생태계';
    case 2: return '성장/틈새';
    default: return '소수/신생';
  }
};

const getEaseOfUseDesc = (score: number) => {
  switch (score) {
    case 5: return '원클릭 완벽';
    case 4: return '간편한 GUI 설정';
    case 3: return '보통 난이도';
    case 2: return '수동 설정 필요';
    default: return '전문가 수준';
  }
};

const getActivityDesc = (score: number) => {
  switch (score) {
    case 5: return '매우 활발';
    case 4: return '정기적 업데이트';
    case 3: return '안정화 단계';
    case 2: return '업데이트 저조';
    default: return '방치 / 중단';
  }
};

export const DetailModal: React.FC<DetailModalProps> = ({ item, type, onClose }) => {
  const { user, openAuthModal } = useAuth();
  const itemId = item?.id || '';

  const {
    stats,
    myRating,
    reviews,
    submitRating,
    submitReview,
    deleteReview,
    submittingRating,
    submittingReview,
  } = useItemCommunity(itemId);

  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [voteAdoption, setVoteAdoption] = useState<ScoreValue>(5);
  const [voteEase, setVoteEase] = useState<ScoreValue>(4);
  const [voteActivity, setVoteActivity] = useState<ScoreValue>(4);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  const [reviewContent, setReviewContent] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (myRating) {
      setVoteAdoption(myRating.adoption);
      setVoteEase(myRating.easeOfUse);
      setVoteActivity(myRating.activity);
    }
  }, [myRating]);

  const handleVoteSubmit = async () => {
    if (!user) {
      openAuthModal('점수 투표에 참여하려면 로그인이 필요합니다.');
      return;
    }
    const { error } = await submitRating(voteAdoption, voteEase, voteActivity);
    if (!error) {
      setVoteSubmitted(true);
      setTimeout(() => setVoteSubmitted(false), 3000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('리뷰를 작성하려면 로그인이 필요합니다.');
      return;
    }
    if (!reviewContent.trim()) return;
    setReviewError(null);
    const { error } = await submitReview(reviewContent);
    if (error) {
      setReviewError(error.message || '리뷰 등록에 실패했습니다.');
    } else {
      setReviewContent('');
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 3000);
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
      <div className="relative w-full max-w-[1100px] max-h-[92vh] overflow-hidden rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] shadow-[0_0_0_1px_rgba(23,23,23,0.06),0_12px_40px_rgba(0,0,0,0.14)] z-10 flex flex-col">
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
        {/* 2-Column Split Content Body                                  */}
        {/* ============================================================ */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#e5e5e5]">
          {/* ---------------------------------------------------------- */}
          {/* Left Column (col-span-7): UI Showcase & Specification     */}
          {/* ---------------------------------------------------------- */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col gap-6">
            {/* 1:1 Official Boxart Showcase (Matching ItemCard Boxart) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                  공식 박스아트 & 아이덴티티
                </h4>
                <span className="text-[11px] text-[#737373]">1:1 Boxart Format</span>
              </div>

              <div className="flex justify-center w-full">
                <div
                  style={{ aspectRatio: '1 / 1' }}
                  className="relative aspect-square w-full max-w-[340px] p-3.5 flex items-center justify-center bg-[#fafafa] rounded-[22px] border border-[#e5e5e5] overflow-hidden shadow-xs group"
                >
                  {/* Top-Right Badges */}
                  <div className="absolute top-5 right-5 flex items-center gap-1.5 z-10">
                    <PricingBadge pricing={item.pricing} />
                    <StatusIndicator status={item.status} />
                  </div>

                  {/* 1:1 Boxart Image Frame */}
                  <div className="relative h-full w-full overflow-hidden rounded-[16px] border border-[#e5e5e5]/80 bg-[#ffffff] shadow-xs">
                    {item.logoUrl ? (
                      <img
                        src={item.logoUrl}
                        alt={`${item.name} boxart logo`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#f5f5f5]">
                        <span className="text-[44px] font-bold text-[#0a0a0a] select-none tracking-tight">
                          {item.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Curation & Community Ratings (3-Category 1-5 Benchmark) */}
            {item.ratings && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                      큐레이션 & 커뮤니티 평가
                    </h4>
                    {stats && stats.voteCount > 0 ? (
                      <span className="rounded-[18px] bg-[#0a0a0a] text-[#ffffff] px-2 py-0.2 text-[10px] font-medium">
                        커뮤니티 투표 {stats.voteCount}명
                      </span>
                    ) : (
                      <span className="rounded-[18px] bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5] px-2 py-0.2 text-[10px] font-medium">
                        큐레이션 기준 점수
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#737373]">1–5 표준 벤치마크</span>
                </div>

                {(() => {
                  const hasCommunity = Boolean(stats && stats.voteCount > 0);
                  const displayAdoption = hasCommunity ? stats!.avgAdoption : item.ratings.adoption;
                  const displayEase = hasCommunity ? stats!.avgEaseOfUse : item.ratings.easeOfUse;
                  const displayActivity = hasCommunity ? stats!.avgActivity : item.ratings.activity;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* 1. Adoption */}
                      <div className="flex flex-col justify-between p-3.5 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-[#737373]">대중성 & 생태계</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-[15px] font-bold text-[#0a0a0a]">
                              {hasCommunity ? displayAdoption.toFixed(1) : displayAdoption}
                            </span>
                            <span className="text-[11px] text-[#737373]">/5</span>
                          </div>
                        </div>
                        {/* 5-segment bar */}
                        <div className="grid grid-cols-5 gap-1 my-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <div
                              key={s}
                              className={`h-1.5 rounded-full ${
                                s <= Math.round(displayAdoption) ? 'bg-[#0a0a0a]' : 'bg-[#e5e5e5]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-[#171717] font-medium leading-tight">
                          {getAdoptionDesc(Math.round(displayAdoption))}
                        </span>
                      </div>

                      {/* 2. Ease of Use */}
                      <div className="flex flex-col justify-between p-3.5 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-[#737373]">설정 & 편의성</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-[15px] font-bold text-[#0a0a0a]">
                              {hasCommunity ? displayEase.toFixed(1) : displayEase}
                            </span>
                            <span className="text-[11px] text-[#737373]">/5</span>
                          </div>
                        </div>
                        {/* 5-segment bar */}
                        <div className="grid grid-cols-5 gap-1 my-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <div
                              key={s}
                              className={`h-1.5 rounded-full ${
                                s <= Math.round(displayEase) ? 'bg-[#0a0a0a]' : 'bg-[#e5e5e5]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-[#171717] font-medium leading-tight">
                          {getEaseOfUseDesc(Math.round(displayEase))}
                        </span>
                      </div>

                      {/* 3. Activity */}
                      <div className="flex flex-col justify-between p-3.5 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-[#737373]">업데이트 활성도</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-[15px] font-bold text-[#0a0a0a]">
                              {hasCommunity ? displayActivity.toFixed(1) : displayActivity}
                            </span>
                            <span className="text-[11px] text-[#737373]">/5</span>
                          </div>
                        </div>
                        {/* 5-segment bar */}
                        <div className="grid grid-cols-5 gap-1 my-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <div
                              key={s}
                              className={`h-1.5 rounded-full ${
                                s <= Math.round(displayActivity) ? 'bg-[#0a0a0a]' : 'bg-[#e5e5e5]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-[#171717] font-medium leading-tight">
                          {getActivityDesc(Math.round(displayActivity))}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Interactive Voting Panel Accordion */}
                <div className="mt-3 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsVotingOpen(!isVotingOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Star size={15} className={myRating ? "text-[#0a0a0a] fill-[#0a0a0a]" : "text-[#737373]"} />
                      <span className="text-[13px] font-semibold text-[#0a0a0a]">
                        {myRating ? '내 평가 점수 수정하기' : '이 항목 평가 참여하기 (투표)'}
                      </span>
                      {myRating && (
                        <span className="rounded-[12px] bg-[#0a0a0a] text-[#ffffff] px-2 py-0.5 text-[10px] font-medium">
                          내 투표 완료
                        </span>
                      )}
                    </div>
                    {isVotingOpen ? <ChevronUp size={16} className="text-[#737373]" /> : <ChevronDown size={16} className="text-[#737373]" />}
                  </button>

                  {isVotingOpen && (
                    <div className="p-4 border-t border-[#e5e5e5] bg-[#ffffff] flex flex-col gap-4">
                      {voteSubmitted && (
                        <div className="flex items-center gap-2 p-2.5 rounded-[12px] bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-[12px] font-medium">
                          <CheckCircle2 size={15} />
                          <span>평가가 성공적으로 저장되었습니다!</span>
                        </div>
                      )}

                      {/* 1. Adoption Selection */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-[#0a0a0a]">1. 대중성 & 생태계 규모</span>
                          <span className="text-[12px] font-semibold text-[#0a0a0a]">
                            {voteAdoption}점 - {getAdoptionDesc(voteAdoption)}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {([1, 2, 3, 4, 5] as ScoreValue[]).map((score) => (
                            <button
                              key={score}
                              type="button"
                              onClick={() => setVoteAdoption(score)}
                              className={`h-9 rounded-[12px] text-[13px] font-semibold transition-all cursor-pointer border ${
                                voteAdoption === score
                                  ? 'bg-[#0a0a0a] text-[#ffffff] border-[#0a0a0a] shadow-xs'
                                  : 'bg-[#fafafa] text-[#737373] border-[#e5e5e5] hover:border-[#0a0a0a] hover:text-[#0a0a0a]'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Ease of Use Selection */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-[#0a0a0a]">2. 설정 난이도 & 편의성</span>
                          <span className="text-[12px] font-semibold text-[#0a0a0a]">
                            {voteEase}점 - {getEaseOfUseDesc(voteEase)}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {([1, 2, 3, 4, 5] as ScoreValue[]).map((score) => (
                            <button
                              key={score}
                              type="button"
                              onClick={() => setVoteEase(score)}
                              className={`h-9 rounded-[12px] text-[13px] font-semibold transition-all cursor-pointer border ${
                                voteEase === score
                                  ? 'bg-[#0a0a0a] text-[#ffffff] border-[#0a0a0a] shadow-xs'
                                  : 'bg-[#fafafa] text-[#737373] border-[#e5e5e5] hover:border-[#0a0a0a] hover:text-[#0a0a0a]'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Activity Selection */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-[#0a0a0a]">3. 업데이트 활성도</span>
                          <span className="text-[12px] font-semibold text-[#0a0a0a]">
                            {voteActivity}점 - {getActivityDesc(voteActivity)}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {([1, 2, 3, 4, 5] as ScoreValue[]).map((score) => (
                            <button
                              key={score}
                              type="button"
                              onClick={() => setVoteActivity(score)}
                              className={`h-9 rounded-[12px] text-[13px] font-semibold transition-all cursor-pointer border ${
                                voteActivity === score
                                  ? 'bg-[#0a0a0a] text-[#ffffff] border-[#0a0a0a] shadow-xs'
                                  : 'bg-[#fafafa] text-[#737373] border-[#e5e5e5] hover:border-[#0a0a0a] hover:text-[#0a0a0a]'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {!user ? (
                          <button
                            type="button"
                            onClick={() => openAuthModal('점수 투표에 참여하려면 로그인이 필요합니다.')}
                            className="inline-flex items-center gap-2 rounded-[18px] bg-[#0a0a0a] px-4 py-2 text-[13px] font-medium text-[#ffffff] hover:opacity-90 transition-opacity cursor-pointer"
                          >
                            <LogIn size={15} />
                            <span>로그인하고 평가 저장</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleVoteSubmit}
                            disabled={submittingRating}
                            className="inline-flex items-center gap-2 rounded-[18px] bg-[#0a0a0a] px-5 py-2 text-[13px] font-medium text-[#ffffff] hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
                          >
                            {submittingRating ? '저장 중...' : myRating ? '내 평가 업데이트' : '평가 제출하기'}
                          </button>
                        )}
                        <span className="text-[11px] text-[#737373]">
                          {user ? '1인당 1개 아이템에 1개의 점수 기록이 유지됩니다' : '로그인 사용자만 투표 가능'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Specification Matrix (Frontends) */}
            {isFrontend && frontend && (
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] mb-3">
                  사양 & 기능 매트릭스
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex items-center justify-between p-3 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                    <span className="text-[13px] text-[#0a0a0a] font-medium">Built-in Scraper</span>
                    <TriStateIndicator value={frontend.hasBuiltInScraper} label="" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                    <span className="text-[13px] text-[#0a0a0a] font-medium">Touch Optimized</span>
                    <TriStateIndicator value={frontend.touchOptimized} label="" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                    <span className="text-[13px] text-[#0a0a0a] font-medium">Gamepad Optimized</span>
                    <TriStateIndicator value={frontend.gamepadOptimized} label="" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-[16px] border border-[#e5e5e5] bg-[#fafafa]">
                    <span className="text-[13px] text-[#0a0a0a] font-medium">Replace Home Launcher</span>
                    <TriStateIndicator value={frontend.canReplaceHomeLauncher} label="" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Right Column (col-span-5): Overview, Compatibility & Links */}
          {/* ---------------------------------------------------------- */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-6 bg-[#fafafa]/50">
            <div className="flex flex-col gap-6">
              {/* Overview Narrative */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] mb-2.5">
                  소개 & 개요
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
                  환경 & 호환성
                </h4>

                {isFrontend && frontend && (
                  <div className="rounded-[18px] bg-[#ffffff] p-5 border border-[#e5e5e5] flex flex-col gap-3.5 shadow-2xs">
                    <div>
                      <span className="text-[12px] text-[#737373] block mb-1.5 font-medium">
                        지원 OS / CFW
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
                      <span className="text-[12px] text-[#737373] font-medium">테마 커스터마이징</span>
                      <span className="rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] px-2.5 py-0.5 text-[12px] font-medium text-[#0a0a0a]">
                        {frontend.themeSupport} Engine
                      </span>
                    </div>
                  </div>
                )}

                {!isFrontend && cfw && (
                  <div className="rounded-[18px] bg-[#ffffff] p-5 border border-[#e5e5e5] flex flex-col gap-3.5 shadow-2xs">
                    <div>
                      <span className="text-[12px] text-[#737373] block mb-1 font-medium">기반 커널 / OS</span>
                      <span className="text-[13px] text-[#0a0a0a] font-medium">{cfw.baseSystem}</span>
                    </div>

                    {cfw.exploitType && (
                      <div className="border-t border-[#e5e5e5] pt-3">
                        <span className="text-[12px] text-[#737373] block mb-1 font-medium">익스플로잇 / 부트 방식</span>
                        <span className="text-[13px] text-[#0a0a0a] font-medium">{cfw.exploitType}</span>
                      </div>
                    )}

                    <div className="border-t border-[#e5e5e5] pt-3">
                      <span className="text-[12px] text-[#737373] block mb-1.5 font-medium">대상 기기</span>
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
              {/* Community Reviews & Feedback Section */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                      커뮤니티 리뷰
                    </h4>
                    <span className="rounded-[18px] bg-[#0a0a0a] px-2 py-0.2 text-[11px] font-medium text-[#fafafa]">
                      {reviews.length}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#737373]">유저 실사용 리뷰</span>
                </div>

                <div className="rounded-[18px] bg-[#ffffff] p-4 border border-[#e5e5e5] shadow-2xs flex flex-col gap-3.5">
                  {/* Review Write Form */}
                  <form onSubmit={handleReviewSubmit} className="flex flex-col gap-2">
                    <textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder={
                        user
                          ? '이 항목의 장단점, 실사용 팁, 세팅 노하우를 공유해 보세요...'
                          : '리뷰를 작성하려면 먼저 로그인해 주세요...'
                      }
                      rows={3}
                      maxLength={1000}
                      disabled={!user || submittingReview}
                      className="w-full resize-none rounded-[14px] border border-[#e5e5e5] bg-[#fafafa] p-3 text-[13px] text-[#0a0a0a] placeholder-[#a3a3a3] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none transition-all disabled:opacity-60"
                    />

                    {reviewError && (
                      <p className="text-[12px] text-red-600 font-medium px-1">{reviewError}</p>
                    )}
                    {reviewSubmitted && (
                      <p className="inline-flex items-center gap-1 text-[12px] text-emerald-600 font-medium px-1">
                        <CheckCircle2 size={14} />
                        <span>리뷰가 성공적으로 등록되었습니다.</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#737373]">
                        {reviewContent.length}/1000자
                      </span>
                      {!user ? (
                        <button
                          type="button"
                          onClick={() => openAuthModal('리뷰 작성을 위해 로그인이 필요합니다.')}
                          className="inline-flex items-center gap-1.5 rounded-[18px] bg-[#0a0a0a] px-3.5 py-1.5 text-[12px] font-medium text-[#fafafa] hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          <LogIn size={13} />
                          <span>로그인 후 작성</span>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={!reviewContent.trim() || submittingReview}
                          className="inline-flex items-center gap-1.5 rounded-[18px] bg-[#0a0a0a] px-4 py-1.5 text-[12px] font-medium text-[#fafafa] hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
                        >
                          <Send size={13} />
                          <span>{submittingReview ? '등록 중...' : '리뷰 등록'}</span>
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Reviews List Feed */}
                  <div className="border-t border-[#e5e5e5] pt-3 flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {reviews.length === 0 ? (
                      <div className="py-4 text-center text-[12px] text-[#737373]">
                        아직 작성된 리뷰가 없습니다. 첫 리뷰를 작성해 보세요!
                      </div>
                    ) : (
                      reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="rounded-[14px] bg-[#fafafa] p-3 border border-[#e5e5e5]/80 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full overflow-hidden bg-[#e5e5e5] flex items-center justify-center text-[11px] font-semibold text-[#0a0a0a] shrink-0">
                                {rev.avatarUrl ? (
                                  <img
                                    src={rev.avatarUrl}
                                    alt={rev.username}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  rev.username.slice(0, 1).toUpperCase()
                                )}
                              </div>
                              <span className="text-[12px] font-semibold text-[#0a0a0a] truncate max-w-[120px]">
                                {rev.username}
                              </span>
                              <span className="text-[10px] text-[#737373]">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {user && user.id === rev.userId && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm('리뷰를 삭제하시겠습니까?')) {
                                    deleteReview(rev.id);
                                  }
                                }}
                                title="내 리뷰 삭제"
                                className="p-1 rounded-[8px] text-[#737373] hover:text-red-600 hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>

                          <p className="text-[12px] text-[#171717] whitespace-pre-wrap leading-relaxed">
                            {rev.content}
                          </p>
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
                외부 리소스
              </h4>
              <div className="flex flex-col gap-2">
                {item.downloadUrl && (
                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#0a0a0a] px-5 text-[14px] font-medium text-[#fafafa] hover:opacity-90 transition-opacity"
                  >
                    <span>다운로드</span>
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
                      <span className="truncate">웹사이트</span>
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
                      <span className="truncate">깃허브</span>
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
