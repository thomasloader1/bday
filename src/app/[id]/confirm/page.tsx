"use client";
import LocationButton from "@/components/LocationButton";
import LocationFriendsCard from "@/components/LocationFriendsCard";
import useGuest from "@/hooks/useGuestData";
import Link from "next/link";
import tomiHouseImg from "../../../../public/tomihouse.png";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Page({ params }: { params: { id: string } }) {
  const { guestData, loading, error } = useGuest(params);
  const router = useRouter();

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
      image: tomiHouseImg.toString(),
      name: "Tomi House",
    },
  ];

  if (error) {
    router.push(`/${params.id}`);
  }

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <main className="flex flex-col items-center h-screen">
          <div className="bg-white p-8 text-gray-800 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-10">
              ¡Que bien que vas a venir {guestData.name} 🥳!
            </h1>
            <p className="mb-4 text-lg">
              Para hacerla corta y sencilla voy a ir directo al grano
            </p>

            {guestData.group.includes("family") && (
              <>
                <h2 className="text-xl mb-3 font-bold">
                  Estas invitado al almuerzo Familiar
                </h2>
                <LocationButton
                  latitude={guestData?.lunch?._lat}
                  longitude={guestData?.lunch?._long}
                  loading={loading}
                />
              </>
            )}

            {guestData.group.includes("work") && (
              <>
                <h2 className="text-xl mb-3 font-bold">
                  Estas invitad3 al after labor3l!
                </h2>
                <LocationButton
                  latitude={guestData?.after?._lat}
                  longitude={guestData?.after?._long}
                  loading={loading}
                />
              </>
            )}

            {guestData.group.includes("friends") &&
              friendLocations.map((fl, index) => (
                <LocationFriendsCard
                  key={index}
                  image={fl.image}
                  name={fl.name}
                />
              ))}

            <p className="mt-6 mb-4 text-lg">
              El regalo es tu presencia misma!, pero si queres hacerme un regalo
              podes ver{" "}
              <Link className="text-orange-500" href={"/wishlist"}>
                Lista de deseados
              </Link>{" "}
              👀
            </p>
          </div>
        </main>
      )}
    </>
  );
}
