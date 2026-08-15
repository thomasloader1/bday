import React, { FC } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import LoadingSpinner from "./LoadingSpinner";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import Button from "./ui/Button";

interface LocationButtonProps {
  latitude?: number;
  longitude?: number;
  loading: boolean;
}

const LocationButton: FC<LocationButtonProps> = ({
  latitude,
  longitude,
  loading,
}) => {
  if (latitude === undefined || longitude === undefined) {
    return <LoadingSpinner size="sm" label="Cargando mapa" />;
  }

  const handleOpenInMaps = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const mapUrl = isMobile
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      : `https://www.google.com/maps?q=${latitude},${longitude}`;

    window.open(mapUrl, "_blank");
  };

  const position: LatLngExpression = [latitude, longitude];

  // Inline SVG pin (icon policy: SVG for interactive, no divIcon emoji).
  // primary-700 fill + festive-yellow center, white outline, tip at bottom.
  const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32"><path d="M12 0C5.37 0 0 5.37 0 12c0 8.25 12 20 12 20s12-11.75 12-20C24 5.37 18.63 0 12 0z" fill="#C2410C" stroke="#FFFFFF" stroke-width="1.5"/><circle cx="12" cy="11" r="4.5" fill="#FFEAA7"/></svg>`;

  const customIcon = L.divIcon({
    className: "",
    html: PIN_SVG,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
  });

  return (
    <div className="flex flex-col justify-center">
      <div className="h-48 mb-3">
        <MapContainer
          center={position}
          zoom={13}
          className="rounded-lg"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position} icon={customIcon}>
            <Popup>asd</Popup>
          </Marker>
        </MapContainer>
      </div>

      <Button variant="primary" fullWidth loading={loading} onClick={handleOpenInMaps}>
        Abrir en Maps
      </Button>
    </div>
  );
};

export default LocationButton;
