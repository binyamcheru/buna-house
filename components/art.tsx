"use client";

import type { ArtType } from "@/lib/data";

const svgProps = {
  viewBox: "0 0 120 90",
  "aria-hidden": true as const,
  className: "art-svg",
  focusable: "false" as const,
};

type ArtComponent = (props: { className?: string }) => React.ReactNode;

/**
 * Flat two-tone SVG illustrations used across product cards and the
 * product detail sheet. All of them share the caramel/brown palette so
 * the menu reads as one consistent visual system.
 */

const Espresso: ArtComponent = ({ className }) => (
  <svg {...svgProps} className={`${className ?? ""} art-espresso`}>
    <g transform="translate(47 30)">
      <ellipse cx="13" cy="3" rx="15" ry="4" fill="var(--cream)" opacity="0.25" />
      <path
        d="M15 8c0 5 8 6 8 15 0 6-3 11-8 13"
        fill="none"
        stroke="var(--caramel-deep)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path d="M14 20c0 8 7 9 7 17" fill="none" stroke="var(--caramel)" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
    </g>
    <g transform="translate(48 20)">
      <path
        d="M6 20 C6 10 18 6 22 14"
        fill="none"
        stroke="var(--brown)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </g>
    <g transform="translate(8 26)">
      <rect x="2" y="12" width="17" height="3" rx="1.5" fill="var(--caramel-deep)" />
      <ellipse cx="10.5" cy="11" rx="11" ry="4" fill="var(--caramel)" />
      <rect x="11" y="1" width="13" height="8" rx="3" fill="var(--caramel-deep)" />
      <rect x="21" y="3" width="9" height="3" rx="1.5" fill="var(--caramel)" transform="rotate(18 25.5 4.5)" />
      <ellipse cx="10.5" cy="11" rx="5" ry="1.7" fill="var(--brown)" opacity="0.35" />
    </g>
    <g transform="translate(96 36)" fill="var(--caramel)">
      <circle cx="0" cy="0" r="4.5" opacity="0.8" />
      <circle cx="12" cy="9" r="3.5" opacity="0.5" />
      <circle cx="9" cy="-9" r="2.6" opacity="0.7" />
    </g>
  </svg>
);

const Cappuccino: ArtComponent = ({ className }) => (
  <svg {...svgProps} className={`${className ?? ""} art-cappuccino`}>
    <g transform="translate(26 14)">
      <ellipse cx="30" cy="54" rx="30" ry="6" fill="var(--brown)" opacity="0.12" />
      <path d="M4 30 a26 14 0 0 0 52 0" fill="var(--caramel)" />
      <path d="M4 30 a26 14 0 0 1 52 0" fill="var(--brown)" />
      <ellipse cx="30" cy="30" rx="26" ry="11" fill="var(--cream)" />
      <g transform="translate(0 -18)" fill="none" stroke="var(--cream)" strokeWidth="3" strokeLinecap="round">
        <circle cx="40" cy="20" r="5" opacity="0.55" />
        <circle cx="26" cy="22" r="4" opacity="0.4" />
        <circle cx="14" cy="16" r="3.6" opacity="0.5" />
      </g>
      <g transform="translate(8 -26)" fill="none" stroke="var(--cream)" strokeWidth="2.8" strokeLinecap="round" opacity="0.4">
        <path d="M4 12 q4 -8 12 -10" />
        <path d="M8 6 q3 -6 9 -8" />
      </g>
      <path d="M14 28 a17 7 0 0 0 32 0" fill="none" stroke="var(--caramel-deep)" strokeWidth="3" strokeLinecap="round" opacity="0.7" transform="translate(0 -6)" />
    </g>
    <g transform="translate(16 56)" fill="var(--caramel)">
      <circle cx="4" cy="4" r="3" opacity="0.75" />
      <circle cx="20" cy="0" r="3.4" opacity="0.55" />
      <circle cx="90" cy="-12" r="4" opacity="0.7" />
      <circle cx="78" cy="4" r="2.6" opacity="0.45" />
    </g>
  </svg>
);

const Latte: ArtComponent = ({ className }) => (
  <svg {...svgProps} className={`${className ?? ""} art-latte`}>
    <g transform="translate(10 52)">
      <ellipse cx="50" cy="34" rx="40" ry="5" fill="var(--brown)" opacity="0.12" />
      <path d="M6 20 a46 26 -14 0 0 88 6 L22 13 Z" fill="var(--brown)" />
      <path d="M6 20 a40 20 0 0 1 84 4 l-8 4 a34 16 0 0 0 -68 -4 Z" fill="var(--cream)" />
      <path d="M7 19 a35 15 -18 0 1 70 4" fill="none" stroke="var(--cream)" strokeWidth="2" opacity="0.6" />
      <ellipse cx="50" cy="17" rx="33" ry="8.5" fill="var(--caramel)" />
      <g transform="rotate(-18 50 17)">
        <g fill="var(--caramel)">
          <path d="M34 17 q6 -7 14 -7 q-4 1 -4 5 q0 2 2 3 q-6 0 -12 0 Z" />
          <path d="M60 17 q-6 -7 -14 -7 q4 1 4 5 q0 2 -2 3 q6 0 12 0 Z" />
          <path d="M66 21 A18 18 0 0 0 26 24 L22 22 A24 24 0 0 1 72 18 Z" fill="var(--brown)" />
        </g>
      </g>
      <ellipse cx="50" cy="17" rx="3" ry="2" fill="var(--cream)" opacity="0.85" />
    </g>
    <g transform="translate(92 34)" fill="var(--caramel-deep)">
      <circle cx="2" cy="4" r="4.5" opacity="0.8" transform="rotate(20 2 4)" />
      <circle cx="-6" cy="-6" r="3" opacity="0.5" />
    </g>
  </svg>
);

const Iced: ArtComponent = ({ className }) => (
  <svg {...svgProps} className={`${className ?? ""} art-iced`}>
    <g transform="translate(42 12)">
      <path d="M0 4 L34 4 L54 76 L0 76 Z" fill="var(--caramel)" />
      <ellipse cx="27" cy="4" rx="18" ry="4.4" fill="var(--cream)" />
      <ellipse cx="27" cy="4" rx="18" ry="4.4" fill="var(--brown)" opacity="0.18" />
      <g fill="none" stroke="var(--cream)" strokeWidth="2" opacity="0.3">
        <path d="M12 8 L20 46 L30 58 L44 60" />
        <path d="M26 12 C20 90 60 90 52 12" />
      </g>
      <g fill="var(--cream)" stroke="var(--brown)" strokeWidth="1.5" opacity="0.9">
        <rect x="16" y="20" width="7" height="8" rx="1.6" transform="rotate(14 19.5 24)" />
        <rect x="26" y="16" width="7" height="8" rx="1.6" transform="rotate(-10 29.5 20)" />
        <rect x="36" y="22" width="7" height="8" rx="1.6" transform="rotate(8 39.5 26)" />
      </g>
      <path d="M34 2 C44 -2 44 2 54 2" fill="none" stroke="var(--cream)" strokeWidth="3.4" strokeLinecap="round" transform="translate(0 -6)" />
      <path d="M52 8 C56 8 56 12 60 12" fill="none" stroke="var(--cream)" strokeWidth="3" strokeLinecap="round" />
      <path d="M6 -4 C2 2 -6 2 -4 8" fill="none" stroke="var(--cream)" strokeWidth="2.6" strokeLinecap="round" />
    </g>
    <g transform="translate(10 38)" fill="var(--caramel-deep)" opacity="0.9">
      <circle cx="6" cy="6" r="4" />
      <circle cx="0" cy="-8" r="3" opacity="0.7" />
      <circle cx="16" cy="-4" r="2.6" opacity="0.8" />
    </g>
    <g transform="translate(88 50)" fill="var(--caramel)">
      <circle cx="3" cy="4" r="4.2" />
      <circle cx="-5" cy="-2" r="2.8" opacity="0.7" />
    </g>
  </svg>
);

const Mocktail: ArtComponent = ({ className }) => (
  <svg {...svgProps} className={`${className ?? ""} art-mocktail`}>
    <g transform="translate(30 12)">
      <g fill="#F7BFD4">
        <circle cx="0" cy="0" r="7" opacity="0.85" />
        <circle cx="14" cy="10" r="8" opacity="0.6" />
        <circle cx="30" cy="2" r="6" opacity="0.75" />
        <circle cx="48" cy="11" r="7" opacity="0.65" />
        <circle cx="2" cy="18" r="5" opacity="0.5" />
        <circle cx="22" cy="18" r="6" opacity="0.7" />
        <circle cx="40" cy="20" r="5" opacity="0.55" />
      </g>
      <path
        d="M6 12 C14 -6 40 -10 60 6"
        fill="none"
        stroke="var(--cream)"
        strokeWidth="9"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M16 12 C22 6 40 4 52 8"
        fill="none"
        stroke="var(--caramel-deep)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="44" cy="2" r="5" fill="var(--cream)" />
      <circle cx="49" cy="-1" r="1.6" fill="var(--caramel)" />
    </g>
    <g transform="translate(88 48)" fill="var(--caramel)">
      <circle cx="0" cy="0" r="4" />
      <circle cx="7" cy="-8" r="2.6" opacity="0.6" />
    </g>
    <g transform="translate(14 60)" fill="#F7BFD4" opacity="0.9">
      <circle cx="0" cy="0" r="3.2" />
      <circle cx="7" cy="-6" r="2.4" opacity="0.7" />
    </g>
  </svg>
);

const Tea: ArtComponent = ({ className }) => (
  <svg {...svgProps} className={`${className ?? ""} art-tea`}>
    <g transform="translate(22 16)">
      <ellipse cx="34" cy="58" rx="30" ry="5" fill="var(--brown)" opacity="0.12" />
      <rect x="6" y="20" width="56" height="42" rx="6" fill="var(--caramel)" />
      <ellipse cx="34" cy="20" rx="28" ry="8" fill="var(--cream)" />
      <ellipse cx="34" cy="20" rx="28" ry="8" fill="var(--brown)" opacity="0.15" />
      <path d="M20 28 q14 22 28 0" fill="var(--cream)" opacity="0.85" />
      <g transform="translate(0 -20)" fill="none" stroke="var(--cream)" strokeWidth="3" strokeLinecap="round">
        <circle cx="48" cy="16" r="4" opacity="0.5" />
        <circle cx="36" cy="19" r="3.4" opacity="0.4" />
        <circle cx="24" cy="14" r="3" opacity="0.5" />
      </g>
      <g fill="var(--caramel-deep)">
        <g transform="translate(4 48) rotate(-14)">
          <rect x="0" y="0" width="3.4" height="16" rx="1.7" />
        </g>
        <g transform="translate(9 48) rotate(10)">
          <rect x="0" y="0" width="3.4" height="16" rx="1.7" />
        </g>
        <g transform="translate(56 48) rotate(12)">
          <rect x="0" y="0" width="3.4" height="16" rx="1.7" />
        </g>
        <g transform="translate(61 48) rotate(-8)">
          <rect x="0" y="0" width="3.4" height="16" rx="1.7" />
        </g>
      </g>
    </g>
    <g transform="translate(92 44)" fill="var(--caramel)">
      <circle cx="0" cy="0" r="4.6" />
      <circle cx="8" cy="-6" r="3" opacity="0.65" />
    </g>
  </svg>
);

const Shake: ArtComponent = ({ className }) => (
  <svg {...svgProps} className={`${className ?? ""} art-shake`}>
    <g transform="translate(44 10)">
      <path d="M4 18 C14 2 38 2 46 18 L58 70 L0 70 Z" fill="var(--caramel)" />
      <path d="M10 22 q14 -6 30 0 l4 42 L10 64 Z" fill="var(--brown)" opacity="0.65" />
      <path d="M8 34 q16 8 34 0" fill="none" stroke="var(--cream)" strokeWidth="2.4" opacity="0.4" />
      <path d="M6 46 q18 9 38 0" fill="none" stroke="var(--cream)" strokeWidth="2.4" opacity="0.35" />
      <g transform="translate(22 6) rotate(2)">
        <g fill="var(--caramel)">
          <path d="M4 10 Q10 -2 20 0 Q14 1 14 5 Q14 8 17 9 Z" />
          <path d="M24 10 Q18 -2 8 0 Q14 1 14 5 Q14 8 11 9 Z" />
          <circle cx="14" cy="12" r="3" fill="var(--cream)" opacity="0.9" />
        </g>
      </g>
      <g transform="translate(2 -4)" fill="none" stroke="var(--cream)" strokeWidth="2.6" strokeLinecap="round">
        <path d="M4 10 q6 12 14 14" />
        <path d="M40 8 q-5 12 -12 14" />
      </g>
      <path d="M16 56 h20 M16 62 h14" stroke="var(--cream)" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
    </g>
    <g transform="translate(96 26)" fill="var(--caramel)">
      <circle cx="0" cy="0" r="4" opacity="0.7" />
      <circle cx="-8" cy="-8" r="2.6" opacity="0.5" />
    </g>
  </svg>
);

const Dessert: ArtComponent = ({ className }) => (
  <svg {...svgProps} className={`${className ?? ""} art-dessert`}>
    <g transform="translate(6 20)">
      <g fill="none" stroke="var(--caramel)" strokeWidth="4" strokeLinecap="round" opacity="0.9">
        <path d="M24 0 q-4 -10 4 -16 q-4 3 -3 8" />
        <path d="M30 -2 q2 -12 12 -14 q-6 2 -8 8" />
        <circle cx="14" cy="-10" r="3" />
      </g>
      <ellipse cx="68" cy="64" rx="58" ry="7" fill="var(--brown)" opacity="0.12" />
      <path d="M16 26 C16 50 30 62 54 62 C78 62 92 50 92 26 Z" fill="var(--brown)" />
      <path d="M20 22 C20 46 32 58 54 58 C76 58 88 46 88 22 C88 14 82 8 72 6 C70 14 62 18 54 18 C46 18 38 14 36 6 C26 8 20 14 20 22 Z" fill="var(--caramel)" />
      <ellipse cx="54" cy="28" rx="26" ry="9" fill="var(--cream)" opacity="0.9" />
      <g fill="var(--caramel-deep)">
        <circle cx="42" cy="30" r="1.8" opacity="0.85" />
        <circle cx="54" cy="34" r="1.8" opacity="0.85" />
        <circle cx="66" cy="30" r="1.8" opacity="0.85" />
        <circle cx="48" cy="26" r="1.4" opacity="0.6" />
        <circle cx="60" cy="26" r="1.4" opacity="0.6" />
      </g>
      <path d="M18 30 C10 34 6 40 8 46" fill="none" stroke="var(--caramel-deep)" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M90 28 C97 32 100 38 98 44" fill="none" stroke="var(--caramel-deep)" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
    </g>
    <g transform="translate(86 62)" fill="var(--caramel)">
      <circle cx="2" cy="3" r="3.6" opacity="0.75" />
      <circle cx="10" cy="-4" r="2.4" opacity="0.55" />
    </g>
  </svg>
);

const Snack: ArtComponent = ({ className }) => (
  <svg {...svgProps} className={`${className ?? ""} art-snack`}>
    <g transform="translate(8 10)">
      <g fill="var(--caramel-deep)">
        <circle cx="34" cy="16" r="16" opacity="0.9" />
        <circle cx="64" cy="34" r="16" opacity="0.75" />
        <circle cx="76" cy="14" r="12" opacity="0.6" />
      </g>
      <g transform="translate(46 50)">
        <rect x="4" y="0" width="20" height="3.4" rx="1.7" fill="var(--brown)" />
        <rect x="8" y="8" width="34" height="3.4" rx="1.7" fill="var(--brown)" />
        <circle cx="22" cy="16" r="3" fill="var(--brown)" opacity="0.8" />
        <circle cx="10" cy="-6" r="2.4" fill="var(--brown)" opacity="0.5" />
        <circle cx="36" cy="-8" r="2.4" fill="var(--brown)" opacity="0.7" />
      </g>
    </g>
    <g transform="translate(96 26)" fill="var(--caramel)">
      <circle cx="0" cy="0" r="4" />
      <circle cx="-8" cy="-7" r="2.6" opacity="0.6" />
    </g>
    <g transform="translate(18 70)" fill="var(--caramel-deep)" opacity="0.7">
      <circle cx="0" cy="0" r="3" />
      <circle cx="8" cy="-4" r="2.2" />
    </g>
  </svg>
);

const Combo: ArtComponent = ({ className }) => (
  <svg {...svgProps} className={`${className ?? ""} art-combo`}>
    <g transform="translate(20 14)">
      <g transform="translate(0 -6)">
        <path d="M6 22 C6 10 16 6 20 14" fill="none" stroke="var(--cream)" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
        <ellipse cx="13" cy="22" rx="8" ry="7" fill="var(--caramel)" />
        <path d="M9 20 a5 4 0 0 1 8 0" fill="var(--cream)" opacity="0.8" />
        <circle cx="12" cy="22" r="1.6" fill="var(--brown)" opacity="0.5" />
      </g>
      <g transform="translate(52 0)">
        <path d="M6 14 C6 6 12 3 15 9" fill="none" stroke="var(--cream)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <ellipse cx="11" cy="14" rx="7" ry="6" fill="var(--brown)" />
        <ellipse cx="11" cy="14" rx="7" ry="6" fill="none" stroke="var(--cream)" strokeWidth="1.6" opacity="0.5" />
        <circle cx="11" cy="14" r="1.5" fill="var(--cream)" />
      </g>
      <g transform="translate(30 18)">
        <rect x="2" y="2" width="6" height="8" rx="2" fill="var(--caramel-deep)" />
        <rect x="0" y="9" width="6" height="8" rx="2" fill="var(--caramel)" />
        <rect x="2" y="18" width="6" height="8" rx="2" fill="var(--brown)" />
      </g>
    </g>
    <g transform="translate(96 52)" fill="var(--caramel)">
      <circle cx="0" cy="0" r="4.4" />
      <circle cx="8" cy="-8" r="3" opacity="0.65" />
    </g>
  </svg>
);

const HeroEspresso: ArtComponent = ({ className }) => (
  <svg {...svgProps} className={`${className ?? ""} art-hero-espresso`}>
    <g transform="translate(25 26)">
      <ellipse cx="35" cy="56" rx="34" ry="9" fill="var(--cream)" opacity="0.1" />
      <path d="M6 28 C6 12 20 6 30 14" fill="none" stroke="var(--caramel)" strokeWidth="8" strokeLinecap="round" opacity="0.75" />
      <circle cx="18" cy="30" r="10" fill="var(--caramel)" opacity="0.9" />
      <g transform="translate(6 36)">
        <rect x="2" y="16" width="26" height="5" rx="2.5" fill="var(--caramel-deep)" />
        <ellipse cx="15" cy="15" rx="18" ry="7" fill="var(--caramel)" />
        <rect x="16" y="1" width="22" height="12" rx="5" fill="var(--caramel-deep)" />
        <rect x="34" y="4" width="16" height="5" rx="2.5" fill="var(--caramel)" transform="rotate(18 42 6)" />
        <ellipse cx="15" cy="15" rx="8" ry="3" fill="var(--brown)" opacity="0.4" />
      </g>
      <g transform="translate(54 10)" fill="none" stroke="var(--cream)" strokeWidth="6" strokeLinecap="round" opacity="0.55">
        <path d="M2 14 q8 12 18 12" />
        <path d="M10 8 q7 10 16 10" />
      </g>
      <g transform="translate(96 38)" fill="var(--caramel)">
        <circle cx="0" cy="0" r="7" opacity="0.85" />
        <circle cx="14" cy="14" r="5.5" opacity="0.6" />
        <circle cx="18" cy="-12" r="4" opacity="0.7" />
      </g>
    </g>
  </svg>
);

const HeroLatte: ArtComponent = ({ className }) => (
  <svg {...svgProps} className={`${className ?? ""} art-hero-latte`}>
    <g transform="translate(40 30)">
      <ellipse cx="60" cy="58" rx="58" ry="8" fill="var(--cream)" opacity="0.08" />
      <path d="M6 34 a54 34 0 0 0 108 0 " fill="var(--brown)" />
      <path d="M6 34 a46 26 0 0 1 96 -2 l-14 6 a34 18 0 0 0 -66 2 Z" fill="var(--cream)" opacity="0.95" />
      <ellipse cx="60" cy="28" rx="46" ry="13" fill="var(--caramel)" />
      <g transform="rotate(-20 60 28)" opacity="0.95">
        <g fill="var(--caramel-deep)">
          <path d="M36 26 q10 -12 22 -12 q-7 1 -7 9 q0 3 4 5 q-11 0 -19 0 Z" />
          <path d="M78 26 q-10 -12 -22 -12 q7 1 7 9 q0 3 -4 5 q11 0 19 0 Z" />
          <path
            d="M84 32 A30 30 0 0 0 28 36 L20 34 A42 42 0 0 1 92 28 Z"
            fill="var(--brown)"
          />
        </g>
      </g>
      <ellipse cx="60" cy="30" rx="4.5" ry="3" fill="var(--cream)" opacity="0.9" />
      <g transform="translate(98 6)" fill="var(--cream)" opacity="0.4">
        <circle cx="0" cy="0" r="3.4" />
        <circle cx="10" cy="-10" r="2.6" />
        <circle cx="-10" cy="-8" r="2" />
      </g>
    </g>
  </svg>
);

const HeroIced: ArtComponent = ({ className }) => (
  <svg {...svgProps} className={`${className ?? ""} art-hero-iced`}>
    <g transform="translate(48 20)">
      <path d="M0 6 L40 6 L64 88 L0 88 Z" fill="var(--caramel-deep)" />
      <ellipse cx="32" cy="6" rx="24" ry="6" fill="var(--cream)" opacity="0.9" />
      <g fill="none" stroke="var(--cream)" strokeWidth="2.4" opacity="0.4">
        <path d="M16 34 L28 74 L40 88" />
        <path d="M44 30 C36 70 50 84 50 44" />
      </g>
      <g fill="var(--cream)" stroke="var(--caramel-deep)" strokeWidth="2" opacity="0.95">
        <rect x="18" y="24" width="9" height="10" rx="2" transform="rotate(14 22.5 29)" />
        <rect x="30" y="20" width="9" height="10" rx="2" transform="rotate(-9 34.5 25)" />
        <rect x="42" y="28" width="9" height="10" rx="2" transform="rotate(9 46.5 33)" />
      </g>
      <g transform="translate(40 -10)" fill="none" stroke="var(--cream)" strokeWidth="5" strokeLinecap="round" opacity="0.6">
        <path d="M0 4 C12 0 12 -8 24 -6" />
      </g>
      <path d="M50 8 C56 6 60 4 68 5" fill="none" stroke="var(--cream)" strokeWidth="4.4" strokeLinecap="round" opacity="0.6" />
      <g fill="var(--caramel)">
        <circle cx="52" cy="18" r="7" opacity="0.9" />
        <circle cx="44" cy="4" r="5" opacity="0.6" />
      </g>
    </g>
  </svg>
);

const HeroBeans: ArtComponent = ({ className }) => (
  <svg {...svgProps} className={`${className ?? ""} art-hero-beans`}>
    <g transform="translate(20 22)" fill="var(--caramel)">
      <g transform="rotate(24 30 30)">
        <ellipse cx="30" cy="30" rx="15" ry="10" fill="var(--caramel)" />
        <path d="M30 20 a15 10 0 0 1 0 20" fill="none" stroke="var(--caramel-deep)" strokeWidth="2.6" opacity="0.85" />
      </g>
      <g transform="rotate(-18 70 34)">
        <ellipse cx="70" cy="34" rx="16" ry="11" fill="var(--cream)" />
        <path d="M70 23 a16 11 0 0 1 0 22" fill="none" stroke="var(--caramel-deep)" strokeWidth="2.6" opacity="0.7" />
      </g>
      <g transform="rotate(40 96 18)">
        <ellipse cx="96" cy="18" rx="12" ry="8" fill="var(--caramel)" opacity="0.85" />
        <path d="M96 10 a12 8 0 0 1 0 16" fill="none" stroke="var(--brown)" strokeWidth="2.2" opacity="0.7" />
      </g>
      <g transform="rotate(-30 48 16)">
        <circle cx="14" cy="12" r="12" fill="var(--caramel-deep)" opacity="0.85" />
        <circle cx="14" cy="12" r="4.5" fill="var(--cream)" opacity="0.9" />
      </g>
      <circle cx="110" cy="60" r="7" fill="var(--cream)" opacity="0.8" />
      <circle cx="60" cy="66" r="5" fill="var(--caramel)" opacity="0.7" />
      <path
        d="M12 46 q-6 14 -2 28 M30 50 q-4 18 2 30 M66 44 q2 12 0 22"
        fill="none"
        stroke="var(--cream)"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.45"
      />
    </g>
  </svg>
);

const art: Record<ArtType, ArtComponent> = {
  espresso: Espresso,
  cappuccino: Cappuccino,
  latte: Latte,
  iced: Iced,
  mocktail: Mocktail,
  tea: Tea,
  shake: Shake,
  dessert: Dessert,
  snack: Snack,
  combo: Combo,
  "hero-espresso": HeroEspresso,
  "hero-latte": HeroLatte,
  "hero-iced": HeroIced,
  "hero-beans": HeroBeans,
};

export function ProductArt({
  art: artKey,
  className,
}: {
  art: ArtType;
  className?: string;
}) {
  const ArtTree = art[artKey];
  return <ArtTree className={className} />;
}