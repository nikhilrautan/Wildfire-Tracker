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

  // Reverse geocoding on marker click with custom User-Agent and fallback
  const handleMarkerClick = async (id, title, lat, lng) => {
    // 1. Immediately show loading state with lat/lng
    setLocationInfo({ 
      id, 
      title, 
      locationName: 'Fetching location details...', 
      lat, 
      lng 
    })

    try {
      // 2. Fetch place name with explicit headers required by Nominatim
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'WildfireTrackerApp/1.0'
          }
        }
      )

      if (!res.ok) throw new Error('Network response was not ok')

      const data = await res.json()

      // 3. Extract readable address or display fallback
      const placeName = data.display_name || `Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}`

      setLocationInfo({ id, title, locationName: placeName, lat, lng })
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      // Fallback display so the box still opens even if API rate-limits
      setLocationInfo({ 
        id, 
        title, 
        locationName: `Location details unavailable (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`, 
        lat, 
        lng 
      })
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