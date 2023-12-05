import React, { FC } from "react";

interface InvitationButtonProps {
  onClick: () => void;
  onDisabled: boolean;
  colorClass: string;
  emoji: string;
  label: string;
}

const InvitationButton: FC<InvitationButtonProps> = ({
  onClick,
  onDisabled,
  colorClass,
  emoji,
  label,
}) => {
  return (
    <button
      onClick={onClick}
      className={`transition-transform transform hover:scale-105 duration-300 ease-in-out ${colorClass}-300 hover:${colorClass}-400 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline`}
      disabled={onDisabled}
    >
      <span
        className={`absolute left-0 top-0 w-full h-full ${colorClass}-600 rounded-full ${onDisabled ? "animate-pulse" : "hidden"}`}
      ></span>
      <span className={`relative z-10 ${onDisabled ? "text-3xl" : "text-sm"}`}>
        {onDisabled ? emoji : label}
      </span>
    </button>
  );
};

export default InvitationButton;
