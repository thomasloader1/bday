import React, { FC } from 'react'

interface RequirementListProps{
    items: Array<{
        name: string;
        description: string ;
    }>
}

const RequirementList: FC<RequirementListProps> = ({items}) => {
  return (
    <div className='my-10'>
        <h2 className="text-3xl font-bold mb-3">Requisitos</h2>
        <dl className="max-w-md text-gray-900 divide-x divide-gray-200 flex">
           {items.map(item => ( <div className="flex flex-col px-3" key={item.name}>
                <dt className="mb-1 text-gray-500 md:text-lg ">{item.name}</dt>
                <dd className="text-lg font-semibold">{item.description}</dd>
            </div>))}
        </dl>
    </div>
  )
}

export default RequirementList