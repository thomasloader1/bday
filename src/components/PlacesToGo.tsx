import React from 'react'
import LocationFriendsCard from './LocationFriendsCard';

const PlacesToGo = () => {
    const friendLocations = [
        {
            image:
                "https://www.fondodeolla.com/files/image/27/27400/5b088bc20cc6b_798_448!.jpg?s=2a6f0f5287fdfc147b9e41e1837e3bac&d=1563018173",
            name: "D'oro Italian Bar",
        },
        {
            image:
                "https://th.bing.com/th/id/R.61d48d593649b399458698603b787fb7?rik=D%2fu%2fRh0jcQjLaw&pid=ImgRaw&r=0",
            name: "Kansas Leloir",
        },
        {
            image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/content/content-gallery-3.png",
            name: "Tomi House",
        },
    ];

    return (
        <div>
            <h2 className="font-bold text-3xl mb-3">Opciones que messirven:</h2>
            <div className='flex flex-col gap-2'>
                {friendLocations.map((fl, index) => (
                    <LocationFriendsCard
                        key={index}
                        image={fl.image}
                        name={fl.name}
                    />
                ))}
            </div>
            </div>
    )
}

export default PlacesToGo