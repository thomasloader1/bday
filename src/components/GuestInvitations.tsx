import React, { FC, ReactNode, useEffect, useState } from 'react'
import InvitationInfo from './InvitationInfo'
import { Guest } from '@/types/Guest';
import InvitationPersonalInfo from './InvitationPersonalInfo';
import Card from './ui/Card';
import workInvitationJson from "../data/__workInvitation.json";
import familyInvitationJson from "../data/__familyInvitation.json";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import InvitationDeck from './mobile/InvitationDeck';

interface GuestIntitationsProps {
    guestData: Guest;
    guestLoaded: boolean;
}

const DESKTOP_QUERY = '(min-width: 640px)';

const GuestInvitations: FC<GuestIntitationsProps> = ({ guestData, guestLoaded }) => {
    // Single viewport gate: ≥640px keeps the coverflow swiper (zero regression);
    // below that the mobile deck renders and the swiper JS never mounts.
    const [isDesktop, setIsDesktop] = useState<boolean>(() =>
        typeof window !== 'undefined' ? window.matchMedia(DESKTOP_QUERY).matches : true
    );

    useEffect(() => {
        const mq = window.matchMedia(DESKTOP_QUERY);
        const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    // Shared slide renderer: one source of truth for both the swiper and the deck.
    const renderSlide = (gdg: string, index: number): ReactNode => {
        const isCommon = gdg.includes("family") || gdg.includes("work");
        const invitationTitle = gdg.includes("family") ? familyInvitationJson.title : workInvitationJson.title;
        const invitationDescription = gdg.includes("family") ? familyInvitationJson.description : workInvitationJson.description;
        const invitationFood = gdg.includes("family") ? familyInvitationJson.food : undefined;
        if (isCommon) {
            return (
                <Card variant="paper" key={`${guestData.id}_${index}`} className="relative h-full overflow-hidden">
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
            )
        } else {
            return (
                <Card variant="default" key={`${guestData.id}_${index}`} className="relative h-full overflow-hidden">
                    <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent-500/10 blur-2xl"></div>
                    <InvitationPersonalInfo />
                </Card>
            )
        }
    };

    if (!isDesktop) {
        return (
            <InvitationDeck
                slides={guestData.group.map(renderSlide)}
                total={guestData.group.length}
                guestName={guestData.name}
            />
        );
    }

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
            {guestData.group.map((gdg, index) => (
                <SwiperSlide className="h-full" key={`${guestData.id}_${index}`}>
                    {renderSlide(gdg, index)}
                </SwiperSlide>
            ))}
        </Swiper>
    )
}

export default GuestInvitations
