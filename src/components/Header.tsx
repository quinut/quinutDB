import React, { useState, useRef, useEffect } from 'react';
import { Coffee, PlusCircle, LogIn, LogOut, User as UserIcon, ChevronDown, ExternalLink, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UserAvatar } from './UserAvatar';

export interface HeaderProps {
  onNavigateEdit?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateEdit }) => {
  const { user, profile, loading, signOut, openAuthModal, openOnboarding } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.nickname || profile?.username || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const isAdmin = Boolean(profile?.is_admin);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  return (
    <header className="w-full border-b border-[#e5e5e5] bg-[#ffffff] relative z-30">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 sm:px-8">
        {/* Brand Title & Slogan */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="flex items-center gap-2.5 text-[20px] font-semibold tracking-[-0.6px] text-[#0a0a0a] hover:opacity-90 transition-opacity"
            >
              <img
                src="/icon.png"
                alt="quinutDB"
                className="h-7 w-7 rounded-[8px] object-cover border border-[#e5e5e5] shadow-2xs shrink-0"
              />
              <span>quinutDB</span>
            </a>
            <span className="rounded-[18px] bg-[#f5f5f5] px-2 py-0.5 text-[11px] font-medium text-[#737373] border border-[#e5e5e5]">
              db.quinut.xyz
            </span>
          </div>
          <p className="text-[13px] text-[#737373] hidden sm:block tracking-[-0.2px]">
            {t.common.brandDesc}
          </p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Language Switcher Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex h-[36px] items-center gap-1.5 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] px-3 text-[12px] font-semibold text-[#0a0a0a] hover:bg-[#e5e5e5] transition-colors cursor-pointer shadow-2xs"
            title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
          >
            <Globe size={14} className="text-[#737373]" />
            <span>{language === 'ko' ? 'EN' : '한국어'}</span>
          </button>

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
            <span>{t.common.contribute}</span>
          </a>

          {/* Ko-fi Support Button */}
          <a
            href="https://ko-fi.com/quinut"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Support me on Ko-fi"
            className="group inline-flex h-[36px] items-center gap-2 rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] px-3 text-[13px] font-medium text-[#0a0a0a] transition-colors hover:bg-[#e5e5e5]"
          >
            <Coffee size={16} className="shrink-0 text-[#737373] group-hover:text-[#0a0a0a] transition-colors" />
            <span className="hidden sm:inline">{t.common.donate}</span>
          </a>

          {/* User Auth Section */}
          {loading ? (
            <div className="h-[36px] w-[90px] rounded-[18px] bg-[#f0f0f0] animate-pulse border border-[#e5e5e5]" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev: boolean) => !prev)}
                className={`flex items-center gap-2 p-1 pr-2.5 rounded-[20px] border transition-all cursor-pointer ${
                  isProfileOpen
                    ? 'border-[#0a0a0a] bg-[#f5f5f5] shadow-xs'
                    : 'border-[#e5e5e5] bg-[#fafafa] hover:bg-[#f0f0f0]'
                }`}
                title="프로필 보기"
              >
                <UserAvatar
                  userId={user?.id}
                  username={displayName}
                  avatarUrl={profile?.avatar_url}
                  size={28}
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-medium text-[#0a0a0a] max-w-[100px] truncate">
                    {displayName}
                  </span>
                  {isAdmin && (
                    <span className="rounded-[8px] bg-[#0a0a0a] px-1.5 py-0.2 text-[9px] font-bold text-[#fafafa]">
                      {t.common.admin}
                    </span>
                  )}
                  <ChevronDown
                    size={12}
                    className={`text-[#737373] transition-transform duration-200 ${
                      isProfileOpen ? 'rotate-180 text-[#0a0a0a]' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Profile Floating Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-[260px] rounded-[20px] border border-[#e5e5e5] bg-[#ffffff] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-50 animate-fade-in flex flex-col gap-3">
                  {/* User Card Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-[#f0f0f0]">
                    <UserAvatar
                      userId={user?.id}
                      username={displayName}
                      avatarUrl={profile?.avatar_url}
                      size={42}
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-semibold text-[#0a0a0a] truncate">
                          {displayName}
                        </span>
                        {isAdmin && (
                          <span className="rounded-[8px] bg-[#0a0a0a] px-1.5 py-0.2 text-[9px] font-bold text-[#fafafa]">
                            ADMIN
                          </span>
                        )}
                      </div>
                      {displayEmail && (
                        <span className="text-[11px] text-[#737373] truncate" title={displayEmail}>
                          {displayEmail}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Info / Links */}
                  <div className="flex flex-col gap-1">
                    {/* Change Nickname Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        openOnboarding();
                      }}
                      className="flex items-center gap-2 rounded-[12px] px-2.5 py-2 text-[12px] font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors cursor-pointer text-left"
                    >
                      <UserIcon size={14} className="text-[#737373]" />
                      <span>{language === 'ko' ? '닉네임 변경' : 'Edit Nickname'}</span>
                    </button>

                    {user?.user_metadata?.user_name && (
                      <a
                        href={`https://github.com/${user.user_metadata.user_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-[12px] px-2.5 py-2 text-[12px] font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors"
                      >
                        <ExternalLink size={14} className="text-[#737373]" />
                        <span>{language === 'ko' ? 'GitHub 프로필' : 'GitHub Profile'}</span>
                      </a>
                    )}
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-2 border-t border-[#f0f0f0]">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsProfileOpen(false);
                        await signOut();
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-[14px] bg-[#fef2f2] hover:bg-[#fee2e2] text-[#dc2626] py-2 text-[12px] font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>{t.common.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="inline-flex h-[36px] items-center gap-1.5 rounded-[18px] bg-[#0a0a0a] px-3.5 text-[13px] font-medium text-[#fafafa] hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <LogIn size={14} />
              <span>{t.common.login}</span>
            </button>
          )}


          {/* GitHub Repo Button */}
          <a
            href="https://github.com/quinut/quinutDB"
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
