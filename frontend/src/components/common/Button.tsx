import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = variant !== 'primary' ? `btn-${variant}` : 'btn-primary';
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = [baseClass, variantClass, sizeClass, widthClass, className].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={isLoading || disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
