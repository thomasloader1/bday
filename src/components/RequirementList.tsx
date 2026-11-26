import React, { FC } from 'react'

interface RequirementListProps{
    items: Array<{
        name: string;
        description: string ;
    }>
}

/** Requirements as label rows: the name small, the value in the display face, hairlines between. */
const RequirementList: FC<RequirementListProps> = ({items}) => {
  return (
    <div>
        <h3 className="mb-3 text-title text-ink">Requisitos</h3>
        <dl className="ruled">
           {items.map(item => (
            <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-baseline gap-4 py-3" key={item.name}>
                <dt className="text-sm font-bold text-ink">{item.name}</dt>
                <dd className="font-display text-title text-ink">{item.description}</dd>
            </div>
           ))}
        </dl>
    </div>
  )
}

export default RequirementList
