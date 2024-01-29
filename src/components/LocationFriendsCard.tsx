import React, { FC } from "react";

interface LocationFriendsCardProps {
  image: string;
  name: string;
}

const LocationFriendsCard: FC<LocationFriendsCardProps> = ({ image, name }) => {
  return (
    <figure className="relative max-w-sm cursor-pointer">
    <a href="#">
      <img className="rounded-lg object-fill max-h-[300px]" src={`${image}`} />
    </a>
    <figcaption className="absolute px-4 text-lg text-white bottom-6 bg-gray-800">
        <p className="font-medium">{name}</p>
    </figcaption>
    </figure>
  );
};

export default LocationFriendsCard;
