import React, { FC } from 'react'
import InvitationInfo from './InvitationInfo'
import { Guest } from '@/types/Guest';
import InvitationPersonalInfo from './InvitationPersonalInfo';
import workInvitationJson from "../data/__workInvitation.json";
import familyInvitationJson from "../data/__familyInvitation.json";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';
import Button from './Button';

interface GuestIntitationsProps {
    guestData: Guest;
    guestLoaded: boolean;
}

const GuestInvitations: FC<GuestIntitationsProps> = ({ guestData, guestLoaded }) => {

    return (
        <Swiper
            effect={'cards'}
            grabCursor={true}
            modules={[EffectCards]}
            className="my-4 w-full md:max-w-sm"
        >
            {guestData.group.map((gdg, index) => {
                const isCommon = gdg.includes("family") || gdg.includes("work");
                const invitationTitle = gdg.includes("family") ? familyInvitationJson.title : workInvitationJson.title;
                const invitationDescription = gdg.includes("family") ? familyInvitationJson.description : workInvitationJson.description;
                const invitationFood = gdg.includes("family") ? familyInvitationJson.food : undefined;
                if (isCommon) {
                    return (
                        <SwiperSlide className='bg-white relative' key={`${guestData.id}_${index}`}>
                            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
                            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#F9EFDB,transparent)]"></div>
                            </div>
                            <InvitationInfo 
                                text={invitationTitle}
                                description={invitationDescription}
                                food={invitationFood}
                                lat={guestData?.lunch?._lat}
                                long={guestData?.lunch?._long}
                                loading={guestLoaded}
                            />
                        </SwiperSlide>
                    )
                } else {
                    return (<SwiperSlide className='bg-white relative' key={`${guestData.id}_${index}`}>
                        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
                            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#FFEAA7,transparent)]"></div>
                            </div>

                        <InvitationPersonalInfo />
                    </SwiperSlide>
                    )
                }

            })}
        </Swiper>
    )
}

export default GuestInvitations