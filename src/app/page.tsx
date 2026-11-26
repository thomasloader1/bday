"use client";
import Countdown from "@/components/Countdown";
import SearchInvitation from "@/components/SearchInvitation";
import CurvedLoop from "@/components/CurvedLoop";
import BirthdayCandles from "@/components/BirthdayCandles";
import AgeOdometer from "@/components/AgeOdometer";
import { CakeBase, CakeIcing, CakeSprinkles } from "@/components/CakeDecor";
import { useParty } from "@/components/ConfigProvider";
import { formatPartyLine } from "@/lib/eventDate";

export default function Bday() {
  const { party, eventDate, age, roll } = useParty();

  return (
    <section className="relative grid min-h-[calc(100svh-4rem)] items-start gap-8 py-8 md:grid-cols-[5fr_7fr] md:gap-16">
      <h1 className="sr-only">{party.homeTitle}</h1>

      {/* The welcome as a wavy ink ribbon (text from the dashboard), full width. It crosses the cake (the age card)
          as its band, about 60px below the cake's flat top. Decorative: the h1 above carries the text. */}
      <div className="absolute left-1/2 top-[8.25rem] z-20 w-screen -translate-x-1/2 overflow-x-clip md:top-[11.25rem]">
        <CurvedLoop
          marqueeText={`${party.homeTitle}✦`}
          speed={1}
          direction="left"
          interactive
          wave={{ count: 2.5, amplitude: 30 }}
          viewHeight={200}
          strokeWidth={120}
          ribbonColor="var(--color-ink)"
          inkColor="var(--color-accent)"
          className="relative"
        />
      </div>

      {/* Signature: the card is the cake, the age huge on it (an odometer rolling from the last age to the next). Short plain candles stand on its flat top, their bases
          hidden behind the card's edge so they look stuck in (candles z-0 < card z-10 < ribbon z-20). */}
      <div className="w-full pt-14 md:pt-[5.5rem]">
        <div className="relative">
          <BirthdayCandles className="pointer-events-none absolute inset-x-0 bottom-[calc(100%-1rem)] z-0 h-[4.25rem] w-full md:h-[6.5rem]" />
          <div
            aria-hidden="true"
            className="relative z-10 flex h-[19.5rem] w-full items-end overflow-hidden rounded-card bg-spot px-6 pb-[3.25rem] pt-6 md:h-[max(20rem,calc(100svh-13.5rem))] md:px-10 md:pb-[6.5rem] md:pt-10"
          >
            {/* Decorated like a cake: icing on top, sprinkles, filling layers and cream at the base (behind the number). */}
            <CakeIcing />
            <CakeSprinkles />
            <CakeBase />
            <div className="relative z-10">
              <AgeOdometer party={party} age={age} />
            </div>
          </div>
        </div>
      </div>

      {/* Starts below the ribbon: its top (11.25rem) + its height (200/1440 of the viewport) + 1rem - the section's padding. */}
      <div className="flex min-w-0 flex-col gap-8 md:pt-[calc(10.25rem+13.9vw)]">
        <Countdown targetDate={eventDate} onComplete={roll} caption={formatPartyLine(party)} />
        <SearchInvitation tryDemo={true} />
      </div>
    </section>
  );
}
