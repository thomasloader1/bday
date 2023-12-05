import React, { FC } from 'react'

interface LocationFriendsCardProps {
    image: string;
    name: string;
}

const LocationFriendsCard: FC<LocationFriendsCardProps> = ({ image, name }) => {
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm my-2" data-v0-t="card" style={{ backgroundImage: `url(${image})` }}>
            <div className="flex flex-col items-center space-y-4 p-6">
                <h2 className='text-2xl font-bold text-white'>{name}</h2>
                <div className="flex flex-row items-center space-x-4">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-10 px-4 py-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                        Votar
                    </button>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-orange-500 text-white">
                        0
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LocationFriendsCard