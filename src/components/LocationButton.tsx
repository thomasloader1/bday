import React, { FC } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LoadingSpinner from './LoadingSpinner';

interface LocationButtonProps {
  latitude: number;
  longitude: number;
  loading: boolean;
}

const LocationButton: FC<LocationButtonProps> = ({ latitude, longitude, loading }) => {

    if(latitude === undefined || longitude === undefined){
       return <LoadingSpinner text='Cargando Mapa' isComponent={true}/>
    }


  const handleOpenInMaps = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const mapUrl = isMobile
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      : `https://www.google.com/maps?q=${latitude},${longitude}`;

    window.open(mapUrl, '_blank');
  };

  return (
    <div>
      <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
         <Marker position={[latitude, longitude]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>

      <button onClick={handleOpenInMaps}>Abrir en Maps</button>
    </div>
  );
};

export default LocationButton;
