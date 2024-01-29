import React, { FC } from 'react'

interface ButtonProps{
    text: string;
    onClick: () => void;
    className?: string;
    color?: string
}

const Button: FC<ButtonProps> = ({ text, onClick, className, color="bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"}) => {

  return (
    <button type="button" onClick={onClick} className={`focus:outline-none text-white  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ${color} ${className || ""}`}>{text}</button>

  )
}

export default Button