import React from 'react';

interface Props {
  logoUrl?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const SaoEmblem: React.FC<Props> = ({
  logoUrl,
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  if (logoUrl) {
    return (
      <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
        <img
          src={logoUrl}
          alt="ตราสัญลักษณ์ อบต.อ่างแก้ว"
          className={`${sizeMap[size]} object-contain rounded-full shadow-sm bg-white/90 p-0.5 border border-pink-300`}
        />
        {showLabel && (
          <span className="sr-only">ตราสัญลักษณ์ อบต.อ่างแก้ว</span>
        )}
      </div>
    );
  }

  // Official Ornate Vector Crest for อบต. อ่างแก้ว โพธิ์ทอง อ่างทอง (Fuchsia-Pink, Royal Gold, Golden Rice Stalks & Lotus)
  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`} title="ตราสัญลักษณ์ องค์การบริหารส่วนตำบลอ่างแก้ว อ.โพธิ์ทอง จ.อ่างทอง">
      <svg
        className={`${sizeMap[size]} drop-shadow-md select-none transition-transform hover:scale-105`}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gold Gradient */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
          {/* Fuchsia-Pink Gradient (ชมพูบานเย็น) */}
          <linearGradient id="fuchsiaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="40%" stopColor="#DB2777" />
            <stop offset="100%" stopColor="#9D174D" />
          </linearGradient>
          {/* Deep Navy/Rose Inner Base */}
          <linearGradient id="innerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#831843" />
            <stop offset="100%" stopColor="#500724" />
          </linearGradient>
        </defs>

        {/* Outer Circular Rim with Gold Kanok Dots */}
        <circle cx="60" cy="60" r="57" fill="url(#fuchsiaGrad)" stroke="url(#goldGrad)" strokeWidth="3" />
        <circle cx="60" cy="60" r="52" fill="none" stroke="#FDE047" strokeWidth="1" strokeDasharray="3 2" />

        {/* Inner Field */}
        <circle cx="60" cy="60" r="48" fill="url(#innerGrad)" stroke="url(#goldGrad)" strokeWidth="1.5" />

        {/* Golden Aura Rays */}
        <path
          d="M60 16 L60 22 M60 98 L60 104 M16 60 L22 60 M98 60 L104 60 M28 28 L33 33 M87 87 L92 92 M28 92 L33 87 M87 33 L92 28"
          stroke="#FDE047"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Golden Rice Stalks Wreath (รวงข้าวสีทองแห่งความอุดมสมบูรณ์ - เมืองอ่างทอง) */}
        {/* Left Rice Wreath */}
        <path
          d="M32 78 C25 64 26 44 42 32 C38 42 40 58 48 68"
          stroke="url(#goldGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="28" cy="48" r="2.2" fill="#FDE047" />
        <circle cx="32" cy="40" r="2.2" fill="#FDE047" />
        <circle cx="38" cy="34" r="2.2" fill="#FDE047" />
        <circle cx="27" cy="58" r="2.2" fill="#FDE047" />
        <circle cx="30" cy="68" r="2.2" fill="#FDE047" />

        {/* Right Rice Wreath */}
        <path
          d="M88 78 C95 64 94 44 78 32 C82 42 80 58 72 68"
          stroke="url(#goldGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="92" cy="48" r="2.2" fill="#FDE047" />
        <circle cx="88" cy="40" r="2.2" fill="#FDE047" />
        <circle cx="82" cy="34" r="2.2" fill="#FDE047" />
        <circle cx="93" cy="58" r="2.2" fill="#FDE047" />
        <circle cx="90" cy="68" r="2.2" fill="#FDE047" />

        {/* Central Sacred Lotus & Thai Constitution Pedestal (พานรัฐธรรมนูญและบัวทิพย์) */}
        {/* Lotus Petals Base */}
        <path
          d="M44 80 C50 72 70 72 76 80 C70 85 50 85 44 80 Z"
          fill="url(#goldGrad)"
        />
        <path
          d="M48 76 C54 70 66 70 72 76 C66 80 54 80 48 76 Z"
          fill="#F43F5E"
        />

        {/* Pedestal (พานแว่นฟ้า) */}
        <path
          d="M42 66 L78 66 L72 74 L48 74 Z"
          fill="url(#goldGrad)"
          stroke="#B45309"
          strokeWidth="0.8"
        />
        <path
          d="M52 56 L68 56 L66 66 L54 66 Z"
          fill="url(#goldGrad)"
        />

        {/* Center Crystal / Flame of Wisdom (เปลวเทวดาอุณาโลม / อ่างแก้ว) */}
        {/* Sacred Ang Keaw (อ่างแก้วบริสุทธิ์) */}
        <ellipse cx="60" cy="54" rx="14" ry="7" fill="#FDE047" stroke="#92400E" strokeWidth="1" />
        <ellipse cx="60" cy="53" rx="11" ry="5" fill="#38BDF8" opacity="0.9" />

        {/* Spire / Thai Crown Flame Top */}
        <path
          d="M60 26 C62 34 66 42 60 50 C54 42 58 34 60 26 Z"
          fill="url(#goldGrad)"
          stroke="#CA8A04"
          strokeWidth="0.8"
        />
        <circle cx="60" cy="25" r="2.5" fill="#FEF08A" />

        {/* Ribbon Banner at Bottom */}
        <path
          d="M30 94 C44 91 76 91 90 94 L86 102 C72 100 48 100 34 102 Z"
          fill="url(#goldGrad)"
          stroke="#92400E"
          strokeWidth="0.8"
        />
        {/* Tiny Text in SVG for official beauty */}
        <text
          x="60"
          y="99.5"
          textAnchor="middle"
          fill="#500724"
          fontSize="4.5"
          fontWeight="bold"
          fontFamily="Prompt, sans-serif"
        >
          อบต.อ่างแก้ว
        </text>
      </svg>
    </div>
  );
};
