import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from './UserAvatar';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, profile, updateNickname } = useAuth();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNickname(profile?.nickname || profile?.username || '');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();

    if (trimmed.length < 2) {
      setError('닉네임은 최소 2자 이상이어야 합니다.');
      return;
    }
    if (trimmed.length > 20) {
      setError('닉네임은 최대 20자까지 가능합니다.');
      return;
    }

    // Disallow pure whitespace or special control chars
    if (!/^[\w\s\uAC00-\uD7A3\u3040-\u30FF\u4E00-\u9FFF.-]+$/i.test(trimmed)) {
      setError('닉네임에는 한글, 영문, 숫자 및 기본 특수문자(-, _, .)만 사용할 수 있습니다.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error: updateError } = await updateNickname(trimmed);
    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message || '닉네임 저장에 실패했습니다. 다시 시도해 주세요.');
    } else {
      onClose();
    }
  };

  const currentSeed = nickname.trim() || user?.id || 'quinut_user';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      {/* Frosted Backdrop */}
      <div
        onClick={profile?.needs_onboarding ? undefined : onClose}
        className="fixed inset-0 bg-[#0a0a0a]/50 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] shadow-[0_0_0_1px_rgba(23,23,23,0.06),0_16px_44px_rgba(0,0,0,0.16)] z-10 flex flex-col p-6 sm:p-7">
        {/* Close button (only if not strictly initial onboarding or user already has nickname) */}
        {!profile?.needs_onboarding && (
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        )}

        {/* Privacy Highlight Badge */}
        <div className="flex items-center gap-1.5 self-start rounded-full bg-[#fafafa] border border-[#e5e5e5] px-2.5 py-1 mb-4 text-[11px] font-medium text-[#0a0a0a]">
          <ShieldCheck size={14} className="text-[#0a0a0a]" />
          <span>프라이버시 보호 계정</span>
        </div>

        {/* Modal Header */}
        <div className="flex flex-col gap-1.5 mb-5">
          <h3 className="text-[18px] font-bold tracking-[-0.4px] text-[#0a0a0a]">
            {profile?.needs_onboarding
              ? '활동 닉네임을 설정해 주세요'
              : '닉네임 변경'}
          </h3>
          <p className="text-[12.5px] text-[#737373] leading-relaxed">
            quinutDB는 사용자의 개인정보 보호를 위해 Google 실명과 프로필 사진을 일절 수집하거나 저장하지 않습니다.
          </p>
        </div>

        {/* Avatar Interactive Preview */}
        <div className="flex flex-col items-center justify-center py-4 mb-5 rounded-[20px] bg-[#fafafa] border border-[#e5e5e5]">
          <div className="relative">
            <UserAvatar
              userId={user?.id}
              username={currentSeed}
              size={68}
              className="shadow-sm"
            />
          </div>
          <span className="mt-2.5 text-[12px] font-semibold text-[#0a0a0a]">
            {nickname.trim() || 'User'}
          </span>
          <span className="text-[11px] text-[#737373] flex items-center gap-1 mt-0.5">
            <Sparkles size={11} />
            Boring Avatars 자동 생성 아바타
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="nickname-input"
              className="text-[12px] font-semibold text-[#0a0a0a] flex items-center justify-between"
            >
              <span>닉네임</span>
              <span className="text-[11px] font-normal text-[#737373]">
                {nickname.length}/20
              </span>
            </label>
            <input
              id="nickname-input"
              type="text"
              required
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="커뮤니티에서 사용할 닉네임"
              autoFocus
              className="w-full rounded-[16px] border border-[#e5e5e5] bg-[#fafafa] px-3.5 py-2.5 text-[13px] text-[#0a0a0a] placeholder-[#737373] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="rounded-[14px] border border-rose-200 bg-rose-50/70 p-2.5 text-[11.5px] text-rose-800">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            {!profile?.needs_onboarding && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-[40px] rounded-[16px] border border-[#e5e5e5] bg-[#ffffff] text-[13px] font-medium text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || nickname.trim().length < 2}
              className="flex-1 inline-flex h-[40px] items-center justify-center gap-1.5 rounded-[16px] bg-[#0a0a0a] px-4 text-[13px] font-semibold text-[#fafafa] hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
            >
              <Check size={14} />
              <span>{isSubmitting ? '저장 중...' : '확인 및 적용'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
