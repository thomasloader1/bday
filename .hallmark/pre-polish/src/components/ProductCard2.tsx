import React, { FC } from 'react'
import Card from './ui/Card'
import Button from './ui/Button'
import { FaArrowRight } from 'react-icons/fa6'


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
      <img className="object-cover w-full rounded-t-xl h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-xl" src={image} alt="" />
      <div className="flex flex-col justify-between p-6 leading-normal">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-neutral-900">{name}</h5>
        <Button asChild size="sm" icon={<FaArrowRight />} iconPosition="right">
          <a href={link}>Comprar</a>
        </Button>
      </div>
    </Card>
  )
}

export default ProductCard2
