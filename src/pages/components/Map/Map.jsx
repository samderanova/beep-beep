import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

export function ChangeView() {
  const map = useMap();
  map.locate().on("locationfound", (e) => {
    map.setView(e.latlng, 12);
  });
}

function AddMarkerToClick({ setHideModal, setResults }) {
  const [marker, setMarker] = useState([0, 0]);

  const map = useMapEvents({
    async click(e) {
      const newMarker = e.latlng;
      setMarker(newMarker);
      const fetchedResults = await getResults(e.latlng.lat, e.latlng.lng);
      setResults(fetchedResults.businesses);
      setHideModal(false);
    },
  });

  async function getResults(lat, lon) {
    const response = await fetch(
      `/api/location?latitude=${lat}&longitude=${lon}`
    );
    const data = await response.json();
    return data;
  }

  useEffect(() => {
    map.locate().on("locationfound", async (e) => {
      setMarker(e.latlng);
    });
  }, []);

  return (
    <>
      <Marker position={marker}>
        <Popup>
          ({marker.lat.toFixed(2)}, {marker.lng.toFixed(2)})
        </Popup>
      </Marker>
    </>
  );
}

export default function Map() {
  const [geoData, setGeoData] = useState({
    lat: 34.0740036,
    lng: -118.2610305,
  });

  const center = [geoData.lat, geoData.lng];

  return (
    <MapContainer center={center} zoom={12} style={{ height: "100vh" }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geoData.lat && geoData.lng && (
        <Marker position={[geoData.lat, geoData.lng]} />
      )}
      <ChangeView coords={center} />
    </MapContainer>
  );
}
