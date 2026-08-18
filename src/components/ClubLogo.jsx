import React from 'react';

export const ClubLogo = ({ logo, name = 'Club', className = 'w-10 h-10', fallbackEmoji = '⚽' }) => {
  const isImage = logo && (
    logo.startsWith('data:image') ||
    logo.startsWith('http://') ||
    logo.startsWith('https://') ||
    logo.startsWith('blob:') ||
    /\.(png|jpg|jpeg|webp|svg)/i.test(logo)
  );

  if (isImage) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden shrink-0 ${className}`}>
        <img
          src={logo}
          alt={name}
          className="w-full h-full object-contain filter drop-shadow-md"
          onError={(e) => {
            // Fallback to emoji if image URL fails to load
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<span class="text-xl font-bold">${fallbackEmoji}</span>`;
          }}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center shrink-0 ${className}`}>
      <span className="text-xl font-bold select-none">{logo || fallbackEmoji}</span>
    </div>
  );
};
