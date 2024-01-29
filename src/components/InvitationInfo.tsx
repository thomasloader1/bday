import React, { FC } from 'react'
import LocationButton from './LocationButton'
import Badge from './Badge';
import Button from './Button';
import { addToGoogleCalendar } from '@/lib/addToGoogleCalendar';

interface InvitationInfoProps {
    text: string;
    lat: number  | undefined;
    long: number | undefined;
    loading: boolean;
    description: string;
    food?: string[];
}

const InvitationInfo: FC<InvitationInfoProps> = ({ text, lat, long, loading, description, food }) => {

    const saveTheDate = () => {
        // Verificar si el dispositivo es un iPhone o iPad
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Obtén la fecha formateada para el calendario (ejemplo: "2024-01-28T12:00:00")
    const formattedDate = new Date().toISOString().split('.')[0] + 'Z';

    if (isiOS) {
        // Si es un iPhone o iPad, intenta abrir en la aplicación de calendario nativa
        const calendarLink = `calendario://x-callback-url/add?alarm=30&title=Cumpleaños%20Tomas%20Gomez&date=${formattedDate}`;

        // Intenta abrir la aplicación de calendario nativa
        window.open(calendarLink, '_blank');
    } else {
       addToGoogleCalendar(new Date(), text, description);
    }
    };
    

    return (
        <div className='my-5'>
            <div className='flex flex-wrap md:flex-nowrap gap-x-2'>
            <h2 className="text-3xl mb-3 font-bold">{text}</h2>
            <Button text='Agregar al calendario 📅' onClick={saveTheDate} color='gray' />
            </div>
            <p className='mb-8'>{description}</p>
            <div className="mb-8 flex flex-wrap md:flex-nowrap gap-2">

                {food?.map(f => <Badge key={f} text={f} color='green' />)}

            </div>
            <LocationButton
                latitude={lat}
                longitude={long}
                loading={loading}
            />
        </div>
    )
}

export default InvitationInfo