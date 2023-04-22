import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

function CenterAtUserLocation() {
  const map = useMap();
  map.locate().on("locationfound", (e) => {
    map.setView(e.latlng, 12);
  });
}

function AddMarkerToClick() {
  const [marker, setMarker] = useState([0, 0]);

  const map = useMapEvents({
    click(e) {
      const newMarker = e.latlng;
      setMarker(newMarker);
    },
  });

  useEffect(() => {
    map.locate().on("locationfound", (e) => setMarker(e.latlng));
  }, []);

  return (
    <Marker position={marker}>
      <Popup>Marker is at {marker}</Popup>
    </Marker>
  );
}

export default function Map() {
  return (
    <MapContainer center={[0, 0]} zoom={12} style={{ height: "100vh" }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CenterAtUserLocation />
      <AddMarkerToClick />
    </MapContainer>
  );
}
