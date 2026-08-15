import React, { FC } from 'react'
import InvitationInfo from './InvitationInfo'
import { Guest } from '@/types/Guest';
import InvitationPersonalInfo from './InvitationPersonalInfo';
import Card from './ui/Card';
import workInvitationJson from "../data/__workInvitation.json";
import familyInvitationJson from "../data/__familyInvitation.json";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';

interface GuestIntitationsProps {
    guestData: Guest;
    guestLoaded: boolean;
}

const GuestInvitations: FC<GuestIntitationsProps> = ({ guestData, guestLoaded }) => {

    return (
        <Swiper
            className="my-4"
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={2}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: false,
            }}
            pagination={true}
            modules={[EffectCoverflow, Pagination]}
        >
            {guestData.group.map((gdg, index) => {
                const isCommon = gdg.includes("family") || gdg.includes("work");
                const invitationTitle = gdg.includes("family") ? familyInvitationJson.title : workInvitationJson.title;
                const invitationDescription = gdg.includes("family") ? familyInvitationJson.description : workInvitationJson.description;
                const invitationFood = gdg.includes("family") ? familyInvitationJson.food : undefined;
                if (isCommon) {
                    return (
                        <SwiperSlide className="h-full" key={`${guestData.id}_${index}`}>
                            <Card variant="paper" className="relative h-full overflow-hidden">
                                <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-festive-yellow/50 blur-2xl"></div>
                                <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-accent-500/10 blur-2xl"></div>
                                <InvitationInfo 
                                    text={invitationTitle}
                                    description={invitationDescription}
                                    food={invitationFood}
                                    lat={guestData?.lunch?._lat}
                                    long={guestData?.lunch?._long}
                                    loading={guestLoaded}
                                />
                            </Card>
                        </SwiperSlide>
                    )
                } else {
                    return (<SwiperSlide className="h-full" key={`${guestData.id}_${index}`}>
                        <Card variant="default" className="relative h-full overflow-hidden">
                            <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent-500/10 blur-2xl"></div>
                            <InvitationPersonalInfo />
                        </Card>
                    </SwiperSlide>
                    )
                }

            })}
        </Swiper>
    )
}

export default GuestInvitations
