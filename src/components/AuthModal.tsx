import React, { useState } from 'react';
import { X, Mail, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reasonMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  reasonMessage,
}) => {
  const { signInWithGithub, signInWithEmail, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGithubLogin = async () => {
    setErrorMessage(null);
    setLoadingGithub(true);
    const { error } = await signInWithGithub();
    if (error) {
      setErrorMessage(error.message || 'GitHub 로그인 중 오류가 발생했습니다.');
      setLoadingGithub(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setErrorMessage(null);
    setLoadingEmail(true);
    const { error } = await signInWithEmail(email.trim());
    setLoadingEmail(false);
    if (error) {
      setErrorMessage(error.message || '로그인 이메일 발송 중 오류가 발생했습니다.');
    } else {
      setEmailSent(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      {/* Frosted Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0a0a0a]/50 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-[24px] border border-[#e5e5e5] bg-[#ffffff] shadow-[0_0_0_1px_rgba(23,23,23,0.06),0_12px_40px_rgba(0,0,0,0.14)] z-10 flex flex-col p-6 sm:p-7">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] cursor-pointer transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col gap-1.5 mb-6 pr-8">
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-semibold tracking-[-0.4px] text-[#0a0a0a]">
              QuinutDB 로그인
            </span>
            <span className="rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] px-2 py-0.5 text-[10px] font-medium text-[#737373]">
              Community
            </span>
          </div>
          <p className="text-[13px] text-[#737373] leading-relaxed">
            {reasonMessage ||
              '로그인하면 3대 평가 항목(대중성, 편의성, 활성도)에 직접 투표하고 생생한 리뷰를 남길 수 있습니다.'}
          </p>
        </div>

        {/* Supabase Unconfigured Warning Notice */}
        {!isConfigured && (
          <div className="mb-5 rounded-[18px] border border-amber-200 bg-amber-50/70 p-3.5 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 text-[12px] text-amber-900 leading-snug">
              <span className="font-semibold">Supabase 연동 안내</span>
              <span>
                <code>.env</code> 파일에 Supabase URL 및 Anon Key를 설정하면 실시간 인증 및 DB 저장이 활성화됩니다.
              </span>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 rounded-[16px] border border-rose-200 bg-rose-50/70 p-3 text-[12px] text-rose-800">
            {errorMessage}
          </div>
        )}

        {/* Success message for magic link */}
        {emailSent ? (
          <div className="rounded-[20px] border border-emerald-200 bg-emerald-50/80 p-5 flex flex-col items-center text-center gap-2">
            <CheckCircle2 size={32} className="text-emerald-600" />
            <h4 className="text-[14px] font-semibold text-emerald-950">
              로그인 링크가 발송되었습니다!
            </h4>
            <p className="text-[12px] text-emerald-800">
              <strong>{email}</strong> 메일함을 확인하여 전송된 링크를 클릭해 주세요.
            </p>
            <button
              type="button"
              onClick={() => setEmailSent(false)}
              className="mt-2 text-[12px] font-medium text-emerald-900 underline hover:opacity-80 cursor-pointer"
            >
              다른 이메일로 다시 시도
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* 1. GitHub One-Click Login */}
            <button
              type="button"
              onClick={handleGithubLogin}
              disabled={loadingGithub}
              className="inline-flex h-[42px] w-full items-center justify-center gap-2.5 rounded-[18px] bg-[#0a0a0a] px-4 text-[13px] font-medium text-[#fafafa] transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <svg
                width="16"
                height="16"
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
              <span>{loadingGithub ? 'GitHub 연결 중...' : 'GitHub 계정으로 계속하기'}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e5e5e5]" />
              </div>
              <span className="relative bg-[#ffffff] px-3 text-[11px] font-medium uppercase tracking-wider text-[#737373]">
                또는 이메일 매직 링크
              </span>
            </div>

            {/* 2. Email Magic Link Form */}
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-2.5">
              <div className="relative flex items-center">
                <Mail size={15} className="absolute left-3.5 text-[#737373] pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] py-2 pl-9 pr-4 text-[13px] text-[#0a0a0a] placeholder-[#737373] focus:border-[#0a0a0a] focus:bg-[#ffffff] focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loadingEmail || !email.trim()}
                className="inline-flex h-[40px] w-full items-center justify-center gap-2 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] px-4 text-[13px] font-medium text-[#0a0a0a] hover:bg-[#e5e5e5] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <span>{loadingEmail ? '전송 중...' : '로그인 링크 받기'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-[#e5e5e5] text-center text-[11px] text-[#737373]">
          비밀번호 없이 GitHub 또는 이메일 링크로 간편하고 안전하게 로그인됩니다.
        </div>
      </div>
    </div>
  );
};
