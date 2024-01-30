import { addToGoogleCalendar } from "./addToGoogleCalendar";

export const saveTheDate = (text: string, description: string) => {
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const formattedDate = new Date().toISOString().split('.')[0] + 'Z';

    if (isiOS) {
        const calendarLink = `calendario://x-callback-url/add?alarm=30&title=Cumpleaños%20Tomas%20Gomez&date=${formattedDate}`;
        window.open(calendarLink, '_blank');
    } else {
        addToGoogleCalendar(new Date(), text, description);
    }
};