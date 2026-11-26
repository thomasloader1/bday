
import React, { FC } from 'react'
import SearchInvitationForm from './SearchInvitationForm';
import { useStore } from '@nanostores/react';
import { $time } from '@/store/timeStore';
import Button from './ui/Button';
import { useRouter } from 'next/navigation';
import { $fetch, setOnRequest } from '@/store/fetchingStore';

interface SearchInvitationProps{
    tryDemo: boolean;
}

const SearchInvitation: FC<SearchInvitationProps> = ({ tryDemo}) => {
    const router = useRouter();
    const { eventDate } = useStore($time)
    const { loading } = useStore($fetch)
    const isComing = eventDate.getTime() - Date.now() <= 30 * 86400000;
    const redirectToDemo = () =>{
        setOnRequest(true)
        router.push("/1155011250");
        console.log({loading,$fetch: $fetch.get()})
    }

  return (
    <>
    
    <p className="text-lg mb-3 px-3">
    {isComing ? 'Ingresa tu número de telefono y podras ver la invitación al cumpleaños.' : 'Aun no estan disponibles las entradas de este año'}
        
    </p>
        
    {isComing && (<SearchInvitationForm />)}

    {tryDemo && (
        <>
            <p className="text-base mb-3 mt-8">
                Si te interesa saber mas del proyecto
            </p>

            <Button
                variant="primary"
                size="lg"
                loading={loading}
                onClick={redirectToDemo}
                className="text-xl font-bold"
            >
                {loading ? 'Cargando ...' : 'Demo'}
            </Button>
        </>
    )}
        
    </>
  );
}

export default SearchInvitation
