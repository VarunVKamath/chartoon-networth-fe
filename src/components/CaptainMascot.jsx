import React from 'react';

export default function CaptainMascot({ pose = 'happy', size = 120, style = {} }) {
  // Color palette for SVG elements
  const colors = {
    wax: '#FFFFFF',
    shadowWax: '#E5DEC9',
    flameInner: '#FFD93D',
    flameOuter: '#FF6B35',
    hatDark: '#1E1E1E',
    hatAccent: '#4D96FF',
    hatGold: '#FFD93D',
    outline: '#1E1E1E',
    tongue: '#FF8E8E',
    blush: '#FF8E8E'
  };

  // Inline styling for bounce and float animations
  const keyframes = `
    @keyframes flameFlicker {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.1) rotate(-3deg) translateY(-2px); }
    }
    @keyframes mascotFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
    @keyframes eyeBlink {
      0%, 90%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }
  `;

  return (
    <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', ...style }}>
      <style>{keyframes}</style>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          animation: 'mascotFloat 3s ease-in-out infinite',
          filter: 'drop-shadow(3px 3px 0px rgba(30, 30, 30, 0.15))'
        }}
      >
        {/* Flame & Wick */}
        <g id="wick-flame">
          {/* Wick */}
          <path
            d="M100 50 L100 35"
            stroke={colors.outline}
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Flame (Flickering Animation) */}
          <g style={{ transformOrigin: '100px 35px', animation: 'flameFlicker 0.6s ease-in-out infinite' }}>
            {/* Outer Flame */}
            <path
              d="M100 5 C120 20 125 35 115 45 C105 52 95 52 85 45 C75 35 80 20 100 5 Z"
              fill={colors.flameOuter}
              stroke={colors.outline}
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            {/* Inner Flame */}
            <path
              d="M100 15 C110 25 113 32 108 38 C103 43 97 43 92 38 C87 32 90 25 100 15 Z"
              fill={colors.flameInner}
            />
          </g>
        </g>

        {/* Candle Body & Wax Drips */}
        <g id="candle-body">
          {/* Main Candle Cylinder */}
          <path
            d="M60 70 C60 60 140 60 140 70 L140 160 C140 170 60 170 60 160 Z"
            fill={colors.wax}
            stroke={colors.outline}
            strokeWidth="5"
            strokeLinejoin="round"
          />
          
          {/* Bottom shadow base */}
          <path
            d="M62 150 C70 162 130 162 138 150 L138 158 C130 167 70 167 62 158 Z"
            fill={colors.shadowWax}
          />

          {/* Drips of wax */}
          <path
            d="M60 70 Q70 85 78 72 Q86 92 94 70 Q105 82 113 72 Q122 90 130 73 Q136 82 140 70 L140 75 Q136 86 130 78 Q122 95 113 77 Q105 87 94 75 Q86 97 78 77 Q70 90 60 75 Z"
            fill={colors.shadowWax}
            stroke={colors.outline}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>

        {/* Captain Hat (Tilted on Right Side) */}
        <g id="captain-hat" transform="translate(15, -5)">
          {/* Main Hat Body */}
          <path
            d="M100 48 C120 45 130 52 135 62 L95 65 Z"
            fill={colors.hatDark}
            stroke={colors.outline}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          {/* Hat Brim */}
          <path
            d="M90 63 C110 61 130 63 145 66 C145 66 140 72 120 72 C100 72 90 63 90 63 Z"
            fill={colors.hatAccent}
            stroke={colors.outline}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Tiny Captain Emblem (Anchor logo simplified or star) */}
          <circle cx="116" cy="56" r="4" fill={colors.hatGold} stroke={colors.outline} strokeWidth="1.5" />
          <path d="M116 52 L116 57 M114 55 L118 55" stroke={colors.outline} strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Expressions based on Pose */}
        
        {/* HAPPY POSE */}
        {pose === 'happy' && (
          <g id="face-happy">
            {/* Eyes */}
            <g style={{ transformOrigin: '82px 105px' }}>
              <circle cx="82" cy="105" r="11" fill="white" stroke={colors.outline} strokeWidth="4" />
              <circle cx="84" cy="103" r="4" fill="black" />
              <circle cx="82" cy="101" r="1.5" fill="white" />
            </g>
            <g style={{ transformOrigin: '118px 105px' }}>
              <circle cx="118" cy="105" r="11" fill="white" stroke={colors.outline} strokeWidth="4" />
              <circle cx="116" cy="103" r="4" fill="black" />
              <circle cx="114" cy="101" r="1.5" fill="white" />
            </g>
            
            {/* Rosy Cheeks */}
            <circle cx="69" cy="115" r="5" fill={colors.blush} opacity="0.6" />
            <circle cx="131" cy="115" r="5" fill={colors.blush} opacity="0.6" />
            
            {/* Happy Smile */}
            <path
              d="M90 118 Q100 132 110 118"
              stroke={colors.outline}
              strokeWidth="4.5"
              strokeLinecap="round"
              fill={colors.tongue}
            />

            {/* Waving Hands */}
            {/* Left Arm Waving */}
            <path
              d="M60 120 Q35 110 25 95"
              stroke={colors.outline}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="25" cy="95" r="6" fill={colors.hatGold} stroke={colors.outline} strokeWidth="3.5" />

            {/* Right Arm on Hip */}
            <path
              d="M140 125 Q155 130 160 140"
              stroke={colors.outline}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="160" cy="140" r="6" fill={colors.hatGold} stroke={colors.outline} strokeWidth="3.5" />
          </g>
        )}

        {/* SEARCHING / ANALYZING POSE */}
        {pose === 'searching' && (
          <g id="face-searching">
            {/* Left Eye normal */}
            <circle cx="82" cy="105" r="11" fill="white" stroke={colors.outline} strokeWidth="4" />
            <circle cx="84" cy="103" r="4" fill="black" />
            
            {/* Right Eye squinting/looking through magnifying glass */}
            <circle cx="118" cy="105" r="15" fill="white" stroke={colors.outline} strokeWidth="4" />
            <path d="M110 105 Q118 95 126 105" stroke={colors.outline} strokeWidth="4" fill="none" strokeLinecap="round" />

            {/* Magnifying Glass */}
            <g transform="translate(118, 105) rotate(15)">
              <line x1="0" y1="0" x2="25" y2="25" stroke={colors.outline} strokeWidth="6" strokeLinecap="round" />
              <line x1="0" y1="0" x2="25" y2="25" stroke={colors.hatGold} strokeWidth="3" strokeLinecap="round" />
              <circle cx="0" cy="0" r="18" stroke={colors.outline} strokeWidth="5.5" fill="none" />
              <circle cx="0" cy="0" r="18" stroke={colors.hatAccent} strokeWidth="2.5" fill="none" opacity="0.4" />
            </g>

            {/* Curious Smile */}
            <path
              d="M90 122 Q100 128 108 120"
              stroke={colors.outline}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Left Arm holding paper/pointer */}
            <path
              d="M60 125 Q40 135 30 125"
              stroke={colors.outline}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M25 120 L35 130" stroke={colors.outline} strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* OOPS / ERROR POSE */}
        {pose === 'oops' && (
          <g id="face-oops">
            {/* Dizzy X Eyes */}
            <g stroke={colors.outline} strokeWidth="4.5" strokeLinecap="round">
              {/* Left X */}
              <line x1="74" y1="98" x2="88" y2="112" />
              <line x1="88" y1="98" x2="74" y2="112" />
              {/* Right X */}
              <line x1="112" y1="98" x2="126" y2="112" />
              <line x1="126" y1="98" x2="112" y2="112" />
            </g>

            {/* Worried squiggly mouth */}
            <path
              d="M86 128 Q92 120 98 128 T110 128"
              stroke={colors.outline}
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Sweating drops */}
            <path
              d="M52 95 C52 95 45 92 48 85"
              stroke={colors.hatAccent}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M148 95 C148 95 155 92 152 85"
              stroke={colors.hatAccent}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* Dizzy hands on head */}
            <path
              d="M60 130 Q45 125 50 100"
              stroke={colors.outline}
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M140 130 Q155 125 150 100"
              stroke={colors.outline}
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* EMPTY POSE */}
        {pose === 'empty' && (
          <g id="face-empty">
            {/* Sleeping/Resting Eyes */}
            <path
              d="M72 108 Q82 116 92 108"
              stroke={colors.outline}
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M108 108 Q118 116 128 108"
              stroke={colors.outline}
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Whistling/Relaxed mouth */}
            <circle cx="100" cy="125" r="4.5" fill="none" stroke={colors.outline} strokeWidth="4.5" />
            
            {/* Zzz sleeping bubbles */}
            <text x="142" y="80" fontFamily="Fredoka" fontWeight="bold" fontSize="14" fill={colors.hatAccent} stroke={colors.outline} strokeWidth="3" paintOrder="stroke" style={{ animation: 'flameFlicker 1.5s infinite' }}>Z</text>
            <text x="154" y="65" fontFamily="Fredoka" fontWeight="bold" fontSize="18" fill={colors.flameInner} stroke={colors.outline} strokeWidth="3" paintOrder="stroke" style={{ animation: 'flameFlicker 1.2s infinite' }}>Z</text>
            
            {/* Shrugging Arms */}
            <path
              d="M60 135 Q40 130 30 120"
              stroke={colors.outline}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M140 135 Q160 130 170 120"
              stroke={colors.outline}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* WARNING / COMPLIANCE POSE */}
        {pose === 'warning' && (
          <g id="face-warning">
            {/* Smart Glasses */}
            <path
              d="M72 102 L94 102 M106 102 L128 102 M94 102 Q100 97 106 102"
              stroke={colors.outline}
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Lens frames */}
            <rect x="70" y="94" width="26" height="18" rx="6" stroke={colors.outline} strokeWidth="4" fill="none" />
            <rect x="104" y="94" width="26" height="18" rx="6" stroke={colors.outline} strokeWidth="4" fill="none" />
            
            {/* Eyes behind glasses */}
            <circle cx="83" cy="103" r="3.5" fill="black" />
            <circle cx="117" cy="103" r="3.5" fill="black" />

            {/* Smart / Educational smile */}
            <path
              d="M92 124 Q100 130 108 124"
              stroke={colors.outline}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Hand explaining/pointing (speech bubble pointer) */}
            <path
              d="M140 130 Q155 125 165 110"
              stroke={colors.outline}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M165 110 L160 105 M165 110 L172 112 M165 110 L170 103" stroke={colors.outline} strokeWidth="4" strokeLinecap="round" />
            
            <path
              d="M60 130 Q45 135 40 145"
              stroke={colors.outline}
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
