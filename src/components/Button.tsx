import React, { FC } from 'react'

interface ButtonProps{
    text: string;
    onClick: () => void;
    className?: string;
    color?: string
}

const Button: FC<ButtonProps> = ({ text, onClick, className, color}) => {

  const getColor = (color:string) => {
    const colorMap: any = {
      'blue': 'bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
      'gray': 'bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800',
      'green': 'bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800',
      'red': 'bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800',
      'yellow': 'bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800',
  };

  return colorMap[color] || colorMap['green'];
  }

  return (
    <button type="button" onClick={onClick} className={`focus:outline-none text-white  font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ${getColor(color || "")} ${className || ""}`}>{text}</button>

  )
}

export default Button