"use client";

import { useMemo, useState } from "react";

type ProfileAvatarProps = {
  src?: string | null;
  fullName?: string | null;
  className?: string;
  initialsClassName?: string;
  alt?: string;
};

const DEFAULT_AVATAR_PATHS = new Set([
  "/default-avatar.png",
  "/avatars/defaultAvatar.jpg",
]);

function getInitials(fullName?: string | null) {
  const parts = String(fullName ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function ProfileAvatar({
  src,
  fullName,
  className = "",
  initialsClassName = "",
  alt = "Profile",
}: ProfileAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = useMemo(() => getInitials(fullName), [fullName]);
  const normalizedSrc = (src ?? "").trim();
  const useInitials = imgFailed || !normalizedSrc || DEFAULT_AVATAR_PATHS.has(normalizedSrc);

  if (useInitials) {
    return (
      <div
        aria-label={alt}
        className={`flex items-center justify-center bg-indigo-600 text-white font-black uppercase ${className} ${initialsClassName}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={normalizedSrc}
      alt={alt}
      className={className}
      onError={() => setImgFailed(true)}
    />
  );
}
