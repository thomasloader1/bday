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
      effect="coverflow"
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
      {guestData.group.map((groupType, index) => (
        <SwiperSlide className="h-full" key={`${guestData.id}_${index}`}>
          <InvitationCard
            guestData={guestData}
            groupType={groupType}
            index={index}
            guestLoaded={guestLoaded}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default DesktopInvitations;