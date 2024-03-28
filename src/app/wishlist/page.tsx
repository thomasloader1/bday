import React from "react";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import ProductCard2 from "@/components/ProductCard2";

interface WishlistItem {
  name: string;
  image: string;
  link: string;
  textColor: string;
}

const Wishlist: React.FC = () => {
  const wishlistItems: WishlistItem[] = [
    {
      name: "Meta Quest 3",
      image:
        "https://http2.mlstatic.com/D_NQ_NP_845862-MLA73153129685_112023-O.webp",
      link: "https://articulo.mercadolibre.com.ar/MLA-1397429699-meta-oculus-quest-3-128-gb-realidad-virtual-lanzamiento-_JM#position=3&search_layout=stack&type=item&tracking_id=21639911-6f31-4651-b675-fc4574a17d2f",
      textColor: "",
    },
    {
      name: "Volkswagen Scirocco",
      image:
        "https://http2.mlstatic.com/D_NQ_NP_2X_642173-MLA72939352054_112023-F.webp",
      link: "https://auto.mercadolibre.com.ar/MLA-1396545751-volkswagen-sirocco-_JM#position=1&search_layout=grid&type=item&tracking_id=65e82502-480a-4b06-b23b-9be164b65269",
      textColor: "text-white",
    },
    {
      name: "Departamento en MDQ",
      image:
        "https://http2.mlstatic.com/D_NQ_NP_781684-MLA73129765915_112023-O.webp",
      link: "https://departamento.mercadolibre.com.ar/MLA-1579571974-departamento-en-venta-1-ambiente-centro-mar-del-plata-_JM#position=2&search_layout=grid&type=item&tracking_id=a7482610-72f8-4a2a-8898-3a73aeadec5d",
      textColor: "",
    },
    {
      name: "Aspiradora Robot",
      image:
        "https://http2.mlstatic.com/D_NQ_NP_2X_681007-MLU69805501159_062023-F.webp",
      link: "https://www.mercadolibre.com.ar/aspiradora-robot-gadnic-z970-inteligente-trapeadora-aspira-color-azul/p/MLA18057550?pdp_filters=category:MLA401457#searchVariation=MLA18057550&position=3&search_layout=stack&type=product&tracking_id=9de084ce-e3b7-454c-a7dd-1f16fed0d29e",
      textColor: "",
    },
    {
      name: "Monitor Gaming",
      image:
        "https://http2.mlstatic.com/D_NQ_NP_2X_712790-MLU72825479961_112023-F.webp",
      link: "https://www.mercadolibre.com.ar/monitor-gaming-samsung-ls27ag550-odyssey-g5-curvo-negro-27/p/MLA19119414#polycard_client=recommendations_home_navigation-trend-recommendations&reco_backend=machinalis-homes-pdp-boos&reco_client=home_navigation-trend-recommendations&reco_item_pos=3&reco_backend_type=function&reco_id=c3d1473d-efe8-40ea-8904-5ed9ef06c21e&wid=MLA1589732610&sid=recos",
      textColor: "text-white",
    },
    {
      name: "Juego de Sillas",
      image:
        "https://http2.mlstatic.com/D_NQ_NP_2X_913922-MLU73197682932_122023-F.webp",
      link: "https://www.mercadolibre.com.ar/set-x4-sillas-tolix-desillas-cantidad-de-sillas-por-set-4-color-de-la-estructura-de-la-silla-blanco/p/MLA18647689#polycard_client=recommendations_home_navigation-trend-recommendations&reco_backend=machinalis-homes-pdp-boos&reco_client=home_navigation-trend-recommendations&reco_item_pos=0&reco_backend_type=function&reco_id=6a43fe23-c93d-451d-8dfd-ad43d38559e4&wid=MLA1467810168&sid=recos",
      textColor: "",
    },
  ];

  return (
    <section className="py-5 text-center">
      <h1 className="text-5xl font-semibold mb-8 px-6 py-3 rounded-lg">
        ¡Regalos deseados!
      </h1>
      <div className="px-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {wishlistItems.map((item, index) => (
         /*  <ProductCard
            key={index}
            name={item.name}
            image={item.image}
            link={item.link}
            textColor={item.textColor}
          /> */
          <ProductCard2 
          key={index}
          name={item.name}
          image={item.image}
          link={item.link}
          />
        ))}
      </div>
      <div className="flex items-center justify-center">
      <Link href={"/"} className="text-xl bg-orange-500 px-4 py-2 rounded-lg">
        Ir al inicio
      </Link>
      </div>
    </section>
  );
};

export default Wishlist;
