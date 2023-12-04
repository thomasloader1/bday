"use client"
import LocationButton from "@/components/LocationButton";
import useGuest from "@/hooks/useGuestData";

export default function Page({ params }: { params: { id: string } }) {
  const {guestData, loading} = useGuest(params);

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white p-8 text-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-10">
          ¡Que bien que vas a venir {guestData.name} 🥳!
        </h1>
        <p className="mb-4 text-lg">
          Para hacerla corta y sencilla voy a ir directo al grano
        </p>
       
       <LocationButton latitude={guestData.lunch._lat} longitude={guestData.lunch._long} loading={loading} />
        
        <p className="mb-4 text-lg">
          El regalo es tu presencia misma!, pero si queres hacerme un regalo podes ver el siguiente link 👀
        </p>
      </div>
    </main>
  );
}
