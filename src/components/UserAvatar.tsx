import React from 'react';
import Avatar from 'boring-avatars';

export interface UserAvatarProps {
  userId?: string;
  username?: string;
  avatarUrl?: string;
  size?: number;
  className?: string;
}

// QuinutDB achromatic, high-contrast palette
const AVATAR_COLORS = ['#0a0a0a', '#262626', '#525252', '#a3a3a3', '#fafafa'];

export const UserAvatar: React.FC<UserAvatarProps> = ({
  userId,
  username,
  avatarUrl,
  size = 32,
  className = '',
}) => {
  // CRITICAL PRIVACY GUARANTEE:
  // Never pass plain-text emails to third-party or avatar components.
  // Deterministic seed is derived strictly from userId or username.
  const seed = userId || username || 'quinut_user';

  // Strictly block any Google profile picture URLs to respect user privacy
  const isGoogleAvatar =
    Boolean(avatarUrl) &&
    (avatarUrl?.includes('googleusercontent.com') || avatarUrl?.includes('google.com'));

  const showCustomAvatar = Boolean(avatarUrl) && !isGoogleAvatar;

  if (showCustomAvatar) {
    return (
      <img
        src={avatarUrl}
        alt={username || 'User'}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover border border-[#e5e5e5] shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full overflow-hidden border border-[#e5e5e5] shrink-0 inline-flex items-center justify-center bg-[#fafafa] shadow-2xs ${className}`}
    >
      <Avatar
        size={size}
        name={seed}
        variant="beam"
        colors={AVATAR_COLORS}
      />
    </div>
  );
};
