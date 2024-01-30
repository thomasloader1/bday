
import React, { FC } from 'react'

interface BadgeProps{
    text: string;
    color?: string;
    className?: string;
}

const Badge: FC<BadgeProps> = ({ text, color, className}) => {

    const getColor = (color: string) =>{
        switch(color){
        case 'yellow':
            return "bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-yellow-400 border border-yellow-400";
         case 'orange':
            return "bg-orange-100 text-orange-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-orange-400 border border-orange-400";
        case 'green':
            return "bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-green-400 border border-green-400";
        case 'dark':
            return "bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded gray:bg-gray-700 gray:text-gray-400 border border-gray-400";
        default:
            return "bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-blue-400 border border-blue-400";
        }
    }

  return (
    <span className={`${getColor(color || 'default')} ${className || ''}`}>{text}</span>
  )
}

export default Badge