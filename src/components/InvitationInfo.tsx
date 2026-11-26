import React, { FC } from 'react'
import LocationButton from './LocationButton'
import Badge from './Badge';
import RequirementList from './RequirementList';
import Button from './ui/Button';
import { FaCalendar } from 'react-icons/fa6';
import { saveTheDate } from '@/lib/saveTheDate';
import { eventDateTime } from '@/lib/eventDate';
import type { GuestEvent } from '@/lib/config/schema';
import { useParty } from './ConfigProvider';

interface InvitationInfoProps {
    event: GuestEvent;
    loading: boolean;
}

/** One event card's content; every part but the title and text is optional and only shows when filled in. */
const InvitationInfo: FC<InvitationInfoProps> = ({ event, loading }) => {
    const { eventDate: partyDate } = useParty();
    // No date of its own means the event is the birthday itself.
    const when = event.date && event.time ? eventDateTime(event.date, event.time) : partyDate;
    const summary = event.paragraphs.join(' ');

    return (
        <div className="flex h-full flex-col gap-4 sm:gap-6">
            <h2 className="text-section text-ink">{event.title}</h2>

            <div className="space-y-3 text-ink-2">
                {event.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>

            {event.ps && <p className="font-display text-title text-spot-deep">{event.ps}</p>}

            {event.food.length > 0 && (
                <ul aria-label="Qué hay para comer" className="flex flex-wrap gap-2">
                    {event.food.map(f => <li key={f}><Badge text={f} /></li>)}
                </ul>
            )}

            {event.requirements.length > 0 && <RequirementList items={event.requirements} />}

            <div>
                <Button
                    variant="secondary"
                    icon={<FaCalendar />}
                    onClick={() => saveTheDate(event.title, summary, when)}
                >
                    Agendar en calendario
                </Button>
            </div>

            {event.location && (
                <div className="mt-auto">
                    <LocationButton
                        latitude={event.location.lat}
                        longitude={event.location.lng}
                        mapsUrl={event.location.url}
                        loading={loading}
                        locationTitle={event.title}
                    />
                </div>
            )}
        </div>
    )
}

export default InvitationInfo
