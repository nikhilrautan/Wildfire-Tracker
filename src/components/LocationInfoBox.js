const LocationInfoBox = ({ info }) => {
  return (
    <div className="location-info">
      <h2>Wildfire Event Info</h2>
      <p><strong>Title:</strong> {info.title}</p>
      <p><strong>Location:</strong> {info.locationName}</p>
      <p><strong>Coordinates:</strong> {info.lat.toFixed(2)}, {info.lng.toFixed(2)}</p>
    </div>
  )
}

export default LocationInfoBox