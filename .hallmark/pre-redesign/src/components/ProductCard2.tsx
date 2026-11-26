import React, { FC } from 'react'
import Card from './ui/Card'
import Button from './ui/Button'


interface ProductCard2Props {
  name: string;
  image: string;
  link: string;
}

const ProductCard2: FC<ProductCard2Props> = ({ name, image, link }) => {
  return (
    <Card
      variant="elevated"
      className="flex flex-col items-center p-0 overflow-hidden md:max-w-xl md:flex-row"
    >
      <img className="object-cover w-full rounded-t-xl h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-xl" src={image} alt={name} />
      <div className="flex flex-col justify-between p-6 leading-normal">
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-neutral-900">{name}</h2>
        <Button asChild size="sm" className="self-start">
          <a href={link} aria-label={`Comprar ${name}`}>Comprar</a>
        </Button>
      </div>
    </Card>
  )
}

export default ProductCard2
