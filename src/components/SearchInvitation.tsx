import React, { FC } from 'react'
import SearchInvitationForm from './SearchInvitationForm';
import { useStore } from '@nanostores/react';
import { useParty } from './ConfigProvider';
import Button from './ui/Button';
import { useRouter } from 'next/navigation';
import { $fetch, setOnRequest } from '@/store/fetchingStore';
import { isInvitationWindow } from '@/lib/eventDate';

interface SearchInvitationProps{
    tryDemo: boolean;
    eventDate?: Date;
}

const SearchInvitation: FC<SearchInvitationProps> = ({ tryDemo, eventDate: eventDateProp }) => {
    const router = useRouter();
    const { party, eventDate: partyEventDate } = useParty();
    const eventDate = eventDateProp ?? partyEventDate;
    const { loading } = useStore($fetch)
    const isComing = isInvitationWindow(eventDate);
    const showDemo = tryDemo && !isComing;
    const redirectToDemo = () =>{
        setOnRequest(true)
        router.push("/1155011250");
        console.log({loading,$fetch: $fetch.get()})
    }

  return (
    <div className="flex flex-col gap-4">
      <p className="lead text-ink-2">
        {isComing ? party.homeLead : party.closedLead}
      </p>

      {isComing && (<SearchInvitationForm />)}

      {showDemo && (
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-2">
          Si te interesa saber más del proyecto
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            onClick={redirectToDemo}
          >
            {loading ? 'Cargando…' : 'Ver la demo'}
          </Button>
        </p>
      )}
    </div>
  );
}

export default SearchInvitation
