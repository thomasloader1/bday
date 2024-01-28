import React, { FC } from 'react'
import InvitationInfo from './InvitationInfo'
import { Guest } from '@/types/Guest';
import InvitationPersonalInfo from './InvitationPersonalInfo';
import workInvitationJson from "../data/__workInvitation.json";
import familyInvitationJson from "../data/__familyInvitation.json";

interface GuestIntitationsProps {
    guestData: Guest;
    guestLoaded: boolean;
}

const GuestInvitations: FC<GuestIntitationsProps> = ({ guestData, guestLoaded }) => {

    return (
        <>
            {guestData.group.map((gdg,index) => {
                const isCommon = gdg.includes("family") || gdg.includes("work");
                const invitationTitle = gdg.includes("family") ? familyInvitationJson.title : workInvitationJson.title;

                if (isCommon) {
                    return (
                        <InvitationInfo key={`${guestData.id}_${index}`}
                            text={invitationTitle}
                            lat={guestData?.lunch?._lat}
                            long={guestData?.lunch?._long}
                            loading={guestLoaded}
                        />
                    )
                } else {
                    return (<InvitationPersonalInfo key={`${guestData.id}_${index}`} />)
                }

            })}
        </>
    )
}

export default GuestInvitations