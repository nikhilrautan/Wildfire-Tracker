import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, LayersControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import LocationInfoBox from './LocationInfoBox'

// Custom Fire Emoji Marker Configuration
const fireIcon = L.divIcon({
  html: '<span class="fire-emoji" role="img" aria-label="fire">🔥</span>',
  className: 'custom-fire-icon',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

// Recalculates canvas size so tiles stretch cleanly across the view
const MapResize = () => {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 200)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

const Map = ({ eventData = [] }) => {
  const [locationInfo, setLocationInfo] = useState(null)

  // Reverse geocoding on marker click
  const handleMarkerClick = async (id, title, lat, lng) => {
    setLocationInfo({ id, title, locationName: 'Fetching location...', lat, lng })
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      setLocationInfo({ id, title, locationName: data.display_name || 'Location name not found', lat, lng })
    } catch {
      setLocationInfo({ id, title, locationName: 'Unable to load location', lat, lng })
    }
  }

  // Filter wildfire category events and render markers
  const renderMarkers = () => {
    return eventData
      .filter((ev) => ev.categories?.[0]?.id === 'wildfires')
      .map((ev) => {
        const coords = ev.geometry?.[0]?.coordinates
        if (!coords) return null
        const [lng, lat] = coords // EONET gives [longitude, latitude]

        return (
          <Marker
            key={ev.id}
            position={[lat, lng]}
            icon={fireIcon}
            eventHandlers={{
              click: () => handleMarkerClick(ev.id, ev.title, lat, lng),
            }}
          />
        )
      })
  }

  return (
    <div className="map-wrap">
      <MapContainer
        center={[20, 0]}
        zoom={2.5}
        minZoom={2.5}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        style={{ height: 'calc(100vh - 70px)', width: '100vw' }}
      >
        <MapResize />

        {/* Layer View Switcher (Expanded by default) */}
        <LayersControl position="topright" collapsed={false}>
          <LayersControl.BaseLayer checked name="Default View">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              noWrap={true}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite View">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
              noWrap={true}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Dynamic Markers */}
        {renderMarkers()}
      </MapContainer>

      {/* Info Popup Component */}
      {locationInfo && <LocationInfoBox info={locationInfo} />}
    </div>
  )
}

export default Map