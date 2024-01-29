export const addToGoogleCalendar = (date: Date, text: string, details: string) => {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Sumar 1 al mes
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    const formattedDate = `${year}/${day}/${month}T${hours}:${minutes}:${seconds}`;

    // Formatea el texto y los detalles para la URL
    const formattedText = encodeURIComponent(text);
    const formattedDetails = encodeURIComponent(details);

    // Construye el enlace para agregar el evento a Google Calendar
    const googleCalendarLink = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${formattedText}&dates=${formattedDate}/${formattedDate}&details=${formattedDetails}`;

    // Abre el enlace en una nueva ventana
    window.open(googleCalendarLink, '_blank');
};
