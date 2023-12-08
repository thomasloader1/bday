import Link from "next/link";
import React from "react";

interface ProductCardProps {
  name: string;
  image: string;
  link: string;
  textColor: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  image,
  link,
  textColor,
}) => (
  <div
    className="rounded-lg shadow-md px-6 py-6 flex flex-col items-center justify-center opacity-70 hover:opacity-100"
    style={{
      backgroundImage: `url(${image})`,
      height: 200,
      backgroundPosition: "center",
      backgroundSize: "cover",
    }}
  >
    <div className="">
      <h2
        className={`font-bold text-2xl my-4 ${textColor} bg-orange-600 px-6 py-2 rounded-lg`}
      >
        {name}
      </h2>
      <Link
        href={link}
        className={`rounded-md bg-orange-400 hover:bg-orange-600 px-3 py-1 text-md font-medium ${textColor}`}
      >
        Ir a comprar
      </Link>
    </div>
  </div>
);

export default ProductCard;
