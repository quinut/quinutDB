import React from 'react';
import { Coffee, PlusCircle, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export interface HeaderProps {
  onNavigateEdit?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateEdit }) => {
  const { user, profile, signOut, openAuthModal } = useAuth();
  const displayName = profile?.username || user?.user_metadata?.user_name || user?.email?.split('@')[0] || 'User';
  return (
    <header className="w-full border-b border-[#e5e5e5] bg-[#ffffff]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 sm:px-8">
        {/* Brand Title & Slogan */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="text-[20px] font-semibold tracking-[-0.6px] text-[#0a0a0a] hover:opacity-90 transition-opacity"
            >
              QuinutDB
            </a>
            <span className="rounded-[18px] bg-[#f5f5f5] px-2 py-0.5 text-[11px] font-medium text-[#737373] border border-[#e5e5e5]">
              db.quinut.xyz
            </span>
          </div>
          <p className="text-[13px] text-[#737373] hidden sm:block tracking-[-0.2px]">
            The Open Directory for Emulation Frontends & Retro Launchers
          </p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Data Editor / Contribute Button */}
          <a
            href="/edit"
            onClick={(e) => {
              if (onNavigateEdit) {
                e.preventDefault();
                onNavigateEdit();
              }
            }}
            aria-label="데이터 추가 및 수정 에디터"
            className="group inline-flex h-[36px] items-center gap-1.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] px-3 text-[13px] font-medium text-[#0a0a0a] transition-colors hover:bg-[#e5e5e5]"
          >
            <PlusCircle size={15} className="shrink-0 text-[#737373] group-hover:text-[#0a0a0a]" />
            <span>데이터 기여/수정</span>
          </a>

          {/* Ko-fi Support Button */}
          <a
            href="https://ko-fi.com/quinut"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Support me on Ko-fi"
            className="group inline-flex h-[36px] items-center gap-2 rounded-[18px] border border-[#e5e5e5] bg-transparent px-3 text-[13px] font-medium text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
          >
            <Coffee size={16} className="shrink-0 text-[#737373] group-hover:text-[#0a0a0a] transition-colors" />
            <span className="hidden sm:inline">Support me</span>
          </a>

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-1.5 p-0.5 pr-2 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa]">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-7 w-7 rounded-full object-cover border border-[#e5e5e5]"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0a0a0a] text-[11px] font-bold text-[#fafafa]">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className="text-[12px] font-medium text-[#0a0a0a] max-w-[90px] truncate hidden sm:inline">
                {displayName}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                title="로그아웃"
                aria-label="로그아웃"
                className="flex h-6 w-6 items-center justify-center rounded-full text-[#737373] hover:text-[#0a0a0a] hover:bg-[#e5e5e5] transition-colors cursor-pointer"
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="inline-flex h-[36px] items-center gap-1.5 rounded-[18px] bg-[#0a0a0a] px-3.5 text-[13px] font-medium text-[#fafafa] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <LogIn size={14} />
              <span>로그인</span>
            </button>
          )}

          {/* GitHub Repo Button */}
          <a
            href="https://github.com/quinut"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="group inline-flex h-[36px] items-center gap-2 rounded-[18px] bg-[#0a0a0a] px-3.5 text-[13px] font-medium text-[#fafafa] transition-opacity hover:opacity-90"
          >
            {/* GitHub Mark Icon */}
            <svg
              width="16"
              height="16"
              style={{ width: 16, height: 16, minWidth: 16, minHeight: 16 }}
              className="shrink-0 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="hidden md:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
