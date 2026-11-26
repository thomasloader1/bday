import React, { FC } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination } from "swiper/modules";
import InvitationCard from "./InvitationCard";
import { Guest } from "@/types/Guest";

interface DesktopInvitationsProps {
  guestData: Guest;
  guestLoaded: boolean;
}

const DesktopInvitations: FC<DesktopInvitationsProps> = ({ guestData, guestLoaded }) => {
  return (
    <Swiper
      className="my-4"
      spaceBetween={32}
      effect="coverflow"
      grabCursor={true}
      centeredSlides={true}
      slidesPerView={2}
      coverflowEffect={{
        rotate: 0,
        stretch: 0,
        depth: 0,
        scale: 0.9,
        modifier: 1,
        slideShadows: false,
      }}
      pagination={true}
      modules={[EffectCoverflow, Pagination]}
    >
      {(guestData.events ?? []).map((event) => (
        <SwiperSlide className="h-full" key={`${guestData.id}_${event.id}`}>
          <InvitationCard event={event} guestLoaded={guestLoaded} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default DesktopInvitations;