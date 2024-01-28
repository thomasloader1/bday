import React, { FC } from 'react'
import LocationButton from './LocationButton'

interface InvitationInfoProps {
    text: string;
    lat: number  | undefined;
    long: number | undefined;
    loading: boolean;
}

const InvitationInfo: FC<InvitationInfoProps> = ({ text, lat, long, loading }) => {
    return (
        <div className='my-5 mb-48'>
            <h2 className="text-3xl mb-3 font-bold">{text}</h2>
            <LocationButton
                latitude={lat}
                longitude={long}
                loading={loading}
            />
        </div>
    )
}

export default InvitationInfo