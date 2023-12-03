export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white p-8 text-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl">
          ¡Que bien que vas a venir {guestData.name} 🥳!
        </h1>
        <p className="mb-4 text-lg">
          La cuenta regresiva ha comenzado y estoy emocionado de invitarte a mi
          fiesta de cumpleaños.
        </p>
        <p className="mb-4 text-lg">
          Este año, quiero compartir mi día especial contigo en un ambiente
          lleno de alegría y risas.
        </p>
        <p className="mb-4 text-lg">
          Tu presencia hará que esta celebración sea aún más significativa.
        </p>
        <p className="mb-4 text-lg">
          ¡Espero que puedas unirte a mí para festejar juntos!
        </p>
        <p className="mb-4 text-lg">
          ¡Hagamos que mi cumpleaños sea inolvidable!
        </p>
      </div>
    </main>
  );
}
