import React from 'react';
import kalinaMalinaLogoPng from '../assets/kalina-malina-logo.png';

/**
 * Аутентичный логотип ООО «Волков» (КХ Волкова / ВОЛКОВ ГРУПП)
 * Воспроизведен по официальному стилю: жирный круглый строчный шрифт волковского красного цвета
 */
export const VolkovLogo = ({ className = "h-8", color = "#C8102E" }) => {
  return (
    <div className={`inline-flex items-center select-none ${className}`} title="ООО «Волков» — ВОЛКОВ ГРУПП">
      <svg viewBox="0 0 200 48" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="0" 
          y="38" 
          fill={color} 
          fontFamily="'Commissioner', 'IBM Plex Sans', sans-serif" 
          fontWeight="800" 
          fontSize="40" 
          letterSpacing="-0.5px"
        >
          волков
        </text>
        {/* Фирменная точка / ягода над стилем */}
        <circle cx="178" cy="14" r="5.5" fill="#E50046" />
      </svg>
    </div>
  );
};

/**
 * Аутентичный логотип розничной сети «Калина-Малина»
 * Натуральные фермерские продукты Сибири (официальный знак)
 */
export const KalinaMalinaLogo = ({ className = "h-8 sm:h-9", style = {} }) => {
  return (
    <div 
      className={`inline-flex items-center select-none ${className}`} 
      title="Сеть фермерских продуктов «Калина-Малина» — Фермерские продукты из Сибири"
      style={{ display: 'inline-flex', alignItems: 'center' }}
    >
      <img
        src={kalinaMalinaLogoPng}
        alt="Калина-Малина: фермерские продукты из Сибири"
        className="brand-logo-kalina"
        style={{
          height: '100%',
          width: 'auto',
          maxHeight: '42px',
          objectFit: 'contain',
          display: 'block',
          mixBlendMode: 'multiply',
          ...style
        }}
        onError={(e) => {
          // Fallback if asset bundling differs
          e.currentTarget.src = '/kalina-malina-logo.png';
        }}
      />
    </div>
  );
};

/**
 * Объединенный брендовый бейдж «Волков Групп & Калина-Малина»
 */
export const BrandBadge = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-4 ${className}`}>
      <VolkovLogo className="h-7 sm:h-8" />
      <div className="h-6 w-[1.5px] bg-[#D4C9BC]" />
      <KalinaMalinaLogo className="h-7 sm:h-8" />
    </div>
  );
};

/**
 * Маскот помощника «Навигатор по компании»
 */
export const AssistantAvatar = ({ size = 44, mood = "friendly" }) => {
  return (
    <div 
      className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#E50046] to-[#C8102E] text-white shadow-md select-none shrink-0"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg viewBox="0 0 48 48" className="w-3/4 h-3/4" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ушки волчонка / силуэт */}
        <path d="M12 18 L16 8 L22 16 Z" fill="#FFFFFF" fillOpacity="0.9" />
        <path d="M36 18 L32 8 L26 16 Z" fill="#FFFFFF" fillOpacity="0.9" />
        {/* Голова */}
        <circle cx="24" cy="26" r="16" fill="#FFFFFF" />
        {/* Глазки */}
        <circle cx="18" cy="24" r="2.5" fill="#553826" />
        <circle cx="30" cy="24" r="2.5" fill="#553826" />
        {/* Носик */}
        <ellipse cx="24" cy="28.5" rx="2.5" ry="2" fill="#E50046" />
        {/* Улыбка */}
        <path d="M21 31 Q24 34 27 31" stroke="#553826" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        {/* Ягодка-украшение */}
        <circle cx="33" cy="18" r="3" fill="#E50046" />
        <circle cx="33" cy="18" r="1" fill="#FFFFFF" opacity="0.8" />
      </svg>
      <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#909F5E] ring-2 ring-white" title="На связи" />
    </div>
  );
};
