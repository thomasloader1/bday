
import React, { FC } from 'react'

interface BadgeProps{
    text: string;
    color?: string;
}

const Badge: FC<BadgeProps> = ({ text, color}) => {

    const getColor = (color: string) =>{
        switch(color){
        case 'yellow':
            return "bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-yellow-400 border border-yellow-400";
        case 'green':
            return "bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-green-400 border border-green-400";
        default:
            return "bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-blue-400 border border-blue-400";
        }
    }

  return (
    <span className={getColor(color || 'default')}>{text}</span>
  )
}

export default Badge