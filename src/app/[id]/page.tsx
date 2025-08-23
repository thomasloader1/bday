import IconBackground from "@/components/CakeBackground";
import GroupedButtons from "@/components/GroupedButtons";
import InvitationText from "@/components/InvitationText";
import NoInvitation from "@/components/NoInvitation";
import { getGuest } from "@/services/guestService";
import { GiPartyPopper } from "react-icons/gi";

export default async function Page({ params }: { params: { id: string } }) {
  const guest = await getGuest(Number(params.id));

  if (!guest) {
    return <NoInvitation />;
  }

  return (
    <div className="relative">
      <IconBackground icon={<GiPartyPopper />} />

      <main className="container mx-auto px-8 pt-10 md:flex md:justify-center md:items-center">
        <div className="bg-white p-10 text-gray-800 rounded-lg shadow-md">
            <h1 className="font-bold text-5xl mb-10">¡Hola {guest?.name}!</h1>
            <InvitationText />
            <GroupedButtons guest={guest} />
        </div>
      </main>
    </div>
  );
}
