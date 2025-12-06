// components/button/LoginButton.tsx
import React from "react";

interface LoginButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
}

const LoginButton: React.FC<LoginButtonProps> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="
        bg-white
        text-black 
        text-lg font-bold
        py-4 px-8
        rounded-full
        shadow-lg shadow-gray-300
        hover:scale-105 hover:shadow-xl hover:shadow-gray-400
        transition-transform transition-shadow duration-300
      "
    >
      {children || "Login"}
    </button>
  );
};

export default LoginButton;
