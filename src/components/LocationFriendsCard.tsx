import React, { FC } from "react";

interface LocationFriendsCardProps {
  image: string;
  name: string;
}

const LocationFriendsCard: FC<LocationFriendsCardProps> = ({ image, name }) => {
  return (
    <div
      className="rounded-lg border bg-card text-card-foreground shadow-sm my-2"
      data-v0-t="card"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="flex flex-col items-center space-y-4 p-6 py-16">
        <h2 className="text-2xl font-bold text-white bg-black px-4 py-2 rounded-lg">
          {name}
        </h2>
      </div>
    </div>
  );
};

export default LocationFriendsCard;
