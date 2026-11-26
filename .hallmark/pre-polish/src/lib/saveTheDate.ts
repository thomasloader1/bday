import { addToGoogleCalendar } from "./addToGoogleCalendar";
import { getNextBirthday } from "./eventDate";

const pad = (n: number) => n.toString().padStart(2, '0');

const toLocalISO = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

export const saveTheDate = (text: string, description: string) => {
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const eventDate = getNextBirthday();
    const formattedDate = toLocalISO(eventDate);

    if (isiOS) {
        const calendarLink = `calendario://x-callback-url/add?alarm=30&title=Cumpleaños%20Tomas%20Gomez&date=${formattedDate}`;
        window.open(calendarLink, '_blank');
    } else {
        addToGoogleCalendar(eventDate, text, description);
    }
};
