import React, { FC } from 'react'
import LocationButton from './LocationButton'
import Badge from './Badge';
import Button from './Button';
import { saveTheDate } from '@/lib/saveTheDate';

interface InvitationInfoProps {
    text: string;
    lat: number  | undefined;
    long: number | undefined;
    loading: boolean;
    description: string;
    food?: string[];
}

const InvitationInfo: FC<InvitationInfoProps> = ({ text, lat, long, loading, description, food }) => {

    return (
        <div className='my-5 mb-10 px-3'>
            <h2 className="text-3xl mb-3 font-bold">{text}</h2>

            <p className='mb-8'>{description}</p>
            <div className="mb-8 flex flex-wrap gap-2">

                {food?.map(f => <Badge key={f} text={f} color='dark' />)}

            </div>
            <Button text='Agendar en calendario 📅' onClick={() => saveTheDate(text, description)} color='gray' className='w-full mb-5' />

            <LocationButton
                latitude={lat}
                longitude={long}
                loading={loading}
            />
        </div>
    )
}

export default InvitationInfo