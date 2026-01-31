import Link from 'next/link';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D2314] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#3D2314] text-white hover:bg-[#4D3324]',
    secondary: 'bg-[#6B4423] text-white hover:bg-[#8B5A33]',
    outline: 'border-2 border-[#3D2314] text-[#3D2314] hover:bg-[#3D2314] hover:text-white',
    ghost: 'text-[#6B4423] hover:text-[#3D2314] hover:bg-[#EBE4D6]',
    white: 'bg-white text-[#3D2314] hover:bg-[#EBE4D6]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const combinedStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  // Use inline styles for white variant to ensure text color works
  const isWhite = variant === 'white';
  const inlineStyles = isWhite ? { backgroundColor: 'white' } : undefined;

  // Wrap children in span with explicit color for white variant
  const content = isWhite ? (
    <span style={{ color: '#3D2314', display: 'inline-flex', alignItems: 'center' }}>
      {children}
    </span>
  ) : children;

  if (href) {
    return (
      <Link href={href} className={combinedStyles} style={inlineStyles}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedStyles}
      style={inlineStyles}
    >
      {content}
    </button>
  );
}
