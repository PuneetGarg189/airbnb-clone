/** Hand-drawn 3D-style icons for the navbar tabs (no external images needed). */
type P = { className?: string };

export function GlobeIcon({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="gl-sea" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#FFF6C9" /><stop offset="1" stopColor="#E3CB78" />
        </radialGradient>
        <linearGradient id="gl-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9C46A" /><stop offset="1" stopColor="#8A5A1F" />
        </linearGradient>
      </defs>
      <ellipse cx="25" cy="43" rx="10" ry="2.6" fill="url(#gl-gold)" />
      <rect x="23.6" y="36" width="2.8" height="7" rx="1.2" fill="#9A6A2A" />
      <circle cx="24" cy="21" r="15" fill="url(#gl-sea)" />
      <path d="M13 17c3-4 8-3 9 0s-3 4-2 7-5 3-6 0-3-3-1-7z" fill="#B7A24C" opacity=".85" />
      <path d="M27 12c4-2 9 1 8 5s-5 3-6 7-5 1-5-3 0-7 3-9z" fill="#C2AE55" opacity=".85" />
      <path d="M26 30c3-1 7 1 6 4s-5 3-7 1 0-4 1-5z" fill="#B7A24C" opacity=".8" />
      <path d="M8 22A16 16 0 0 1 24 5" fill="none" stroke="url(#gl-gold)" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 22a16 16 0 0 1-8 13" fill="none" stroke="url(#gl-gold)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="21" r="15" fill="none" stroke="#7A5A22" strokeOpacity=".35" />
    </svg>
  );
}

export function HouseIcon({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="hs-wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D9D9DB" /><stop offset="1" stopColor="#8E8E93" />
        </linearGradient>
        <linearGradient id="hs-tree" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5DA34A" /><stop offset="1" stopColor="#2F6B2A" />
        </linearGradient>
      </defs>
      <rect x="4" y="19" width="30" height="24" fill="url(#hs-wall)" />
      <polygon points="3,19 34,10 34,19" fill="#4A4A4F" />
      <rect x="7" y="9" width="3.5" height="8" fill="#5A5A60" />
      <rect x="7.5" y="24" width="6" height="8" rx=".5" fill="#EDEDF0" stroke="#7C7C82" strokeWidth=".6" />
      <rect x="18" y="26" width="9" height="17" rx=".8" fill="#E5195E" stroke="#fff" strokeWidth="1.2" />
      <circle cx="25" cy="35" r=".9" fill="#fff" />
      <rect x="29.5" y="24" width="3.5" height="8" fill="#EDEDF0" stroke="#7C7C82" strokeWidth=".5" />
      <rect x="38.6" y="26" width="2.8" height="17" rx="1" fill="#7A5230" />
      <circle cx="40" cy="15" r="8" fill="url(#hs-tree)" />
      <circle cx="35.5" cy="21" r="5.5" fill="url(#hs-tree)" />
      <circle cx="44" cy="22" r="5" fill="url(#hs-tree)" />
      <rect x="2" y="42.5" width="44" height="2" rx="1" fill="#2F6B2A" opacity=".55" />
    </svg>
  );
}

export function BalloonIcon({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <clipPath id="bl-clip"><path d="M24 2C13 2 8 11 9.5 19c1.2 6 6 10 9.5 12h10c3.5-2 8.3-6 9.5-12C39.5 11 35 2 24 2z" /></clipPath>
      </defs>
      <g clipPath="url(#bl-clip)">
        <rect x="0" y="0" width="48" height="40" fill="#F0723B" />
        <path d="M24 0c-6 6-9 20-5 33h-5C10 20 14 6 20 0z" fill="#D8483B" />
        <path d="M24 0c6 6 9 20 5 33h5c4-13 0-27-6-33z" fill="#D8483B" />
        <path d="M24 0c-3 8-3 22 0 33 3-11 3-25 0-33z" fill="#F5A03C" />
        <rect x="0" y="12" width="48" height="4" fill="#A9302F" opacity=".55" />
        <ellipse cx="17" cy="12" rx="3" ry="6" fill="#fff" opacity=".28" />
      </g>
      <path d="M19 31l-3 8M29 31l3 8M24 31v8" stroke="#6B4A2B" strokeWidth=".9" />
      <rect x="17" y="38.5" width="14" height="8" rx="1.2" fill="#B07A45" />
      <path d="M17 41h14M17 43.8h14" stroke="#7A5230" strokeWidth=".7" />
    </svg>
  );
}

export function BellIcon({ className }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bell-dome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6C7077" /><stop offset=".3" stopColor="#E9ECEF" />
          <stop offset=".55" stopColor="#9BA0A8" /><stop offset="1" stopColor="#3C4046" />
        </linearGradient>
      </defs>
      <rect x="22.4" y="6" width="3.2" height="6" rx="1" fill="#44484E" />
      <ellipse cx="24" cy="6" rx="5" ry="2" fill="#2C2F34" />
      <path d="M6 37c0-14 8-23 18-23s18 9 18 23z" fill="url(#bell-dome)" />
      <path d="M10 33c2-9 7-14 12-15" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="24" cy="38.5" rx="21" ry="4.2" fill="#1F2226" />
      <ellipse cx="24" cy="37.4" rx="19" ry="3" fill="#4A4F57" />
    </svg>
  );
}
