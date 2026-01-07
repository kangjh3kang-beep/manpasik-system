"use client";

import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-manpasik-gradient text-white font-semibold
    shadow-lg shadow-[var(--manpasik-primary)]/20
    hover:shadow-[var(--manpasik-primary)]/40 hover:scale-[1.02]
    active:scale-[0.98]
  `,
  secondary: `
    bg-[var(--manpasik-secondary)]/20 text-[var(--manpasik-secondary)]
    border border-[var(--manpasik-secondary)]/30
    hover:bg-[var(--manpasik-secondary)]/30 hover:border-[var(--manpasik-secondary)]/50
    active:bg-[var(--manpasik-secondary)]/40
  `,
  ghost: `
    bg-transparent text-gray-300
    hover:bg-white/10 hover:text-white
    active:bg-white/15
  `,
  outline: `
    bg-transparent text-white
    border border-white/20
    hover:bg-white/5 hover:border-white/40
    active:bg-white/10
  `,
  danger: `
    bg-red-500/20 text-red-400
    border border-red-500/30
    hover:bg-red-500/30 hover:border-red-500/50
    active:bg-red-500/40
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-base rounded-xl gap-2",
  lg: "px-6 py-3.5 text-lg rounded-xl gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center
          font-medium transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-[var(--manpasik-primary)]/50 focus:ring-offset-2 focus:ring-offset-[var(--manpasik-deep-ocean)]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;


