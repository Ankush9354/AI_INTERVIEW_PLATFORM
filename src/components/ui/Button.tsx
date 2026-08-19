import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) => {
  const baseClasses =
    "rounded-xl px-6 py-3 font-semibold transition duration-300";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700",
    secondary:
      "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100",
  };

  return (
<button
  {...props}
  className={`${baseClasses} ${variants[variant]} ${className}`}
>
  {children}
</button>
  );
};

export default Button;