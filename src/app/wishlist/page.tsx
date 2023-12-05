import React from 'react';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

interface WishlistItem {
  name: string;
  image: string;
  link: string;
  textColor: string;
}

const Wishlist: React.FC = () => {
    const wishlistItems: WishlistItem[] = [
        {
          name: 'Meta Quest 3',
          image: 'https://http2.mlstatic.com/D_NQ_NP_845862-MLA73153129685_112023-O.webp',
          link: 'https://articulo.mercadolibre.com.ar/MLA-1397429699-meta-oculus-quest-3-128-gb-realidad-virtual-lanzamiento-_JM#position=3&search_layout=stack&type=item&tracking_id=21639911-6f31-4651-b675-fc4574a17d2f',
          textColor: '',

        },
        {
          name: 'Volkswagen Scirocco',
          image: 'https://http2.mlstatic.com/D_NQ_NP_2X_642173-MLA72939352054_112023-F.webp',
          link: 'https://auto.mercadolibre.com.ar/MLA-1396545751-volkswagen-sirocco-_JM#position=1&search_layout=grid&type=item&tracking_id=65e82502-480a-4b06-b23b-9be164b65269',
          textColor: 'text-white',
        },
        {
            name: 'Departamento en MDQ',
            image: 'https://http2.mlstatic.com/D_NQ_NP_781684-MLA73129765915_112023-O.webp',
            link: 'https://departamento.mercadolibre.com.ar/MLA-1579571974-departamento-en-venta-1-ambiente-centro-mar-del-plata-_JM#position=2&search_layout=grid&type=item&tracking_id=a7482610-72f8-4a2a-8898-3a73aeadec5d',
            textColor: '',
          },
          {
            name: 'Meta Quest 3',
            image: 'https://http2.mlstatic.com/D_NQ_NP_845862-MLA73153129685_112023-O.webp',
            link: 'https://articulo.mercadolibre.com.ar/MLA-1397429699-meta-oculus-quest-3-128-gb-realidad-virtual-lanzamiento-_JM#position=3&search_layout=stack&type=item&tracking_id=21639911-6f31-4651-b675-fc4574a17d2f',
            textColor: '',
  
          },
          {
            name: 'Volkswagen Scirocco',
            image: 'https://http2.mlstatic.com/D_NQ_NP_2X_642173-MLA72939352054_112023-F.webp',
            link: 'https://auto.mercadolibre.com.ar/MLA-1396545751-volkswagen-sirocco-_JM#position=1&search_layout=grid&type=item&tracking_id=65e82502-480a-4b06-b23b-9be164b65269',
            textColor: 'text-white',
          },
          {
              name: 'Departamento en MDQ',
              image: 'https://http2.mlstatic.com/D_NQ_NP_781684-MLA73129765915_112023-O.webp',
              link: 'https://departamento.mercadolibre.com.ar/MLA-1579571974-departamento-en-venta-1-ambiente-centro-mar-del-plata-_JM#position=2&search_layout=grid&type=item&tracking_id=a7482610-72f8-4a2a-8898-3a73aeadec5d',
              textColor: '',
            },
      ];

  return (
    <main className="flex flex-col items-center justify-center h-screen text-center bg-gray-100">
      <h1 className="text-3xl font-semibold mb-6">Detallesitos de cumple</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {wishlistItems.map((item, index) => (
          <ProductCard key={index} name={item.name} image={item.image} link={item.link} textColor={item.textColor}/>
        ))}

      </div>
      <Link href={"/"} className='mt-5 bg-orange-500 px-4 py-2 rounded-full'>Ir al inicio</Link>
    </main>
  );
};

export default Wishlist;
