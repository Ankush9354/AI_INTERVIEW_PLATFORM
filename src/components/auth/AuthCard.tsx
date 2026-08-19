import type { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
}

const AuthCard = ({ children }: AuthCardProps) => {
  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
      {children}
    </div>
  );
};

export default AuthCard;