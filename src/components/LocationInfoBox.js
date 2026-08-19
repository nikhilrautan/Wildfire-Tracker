const LocationInfoBox = ({ info }) => {
  return (
    <div className="location-info">
      <h2>Event Info</h2>
      <ul>
        <li><strong>Title:</strong> {info.title}</li>
        <li><strong>Location:</strong> {info.locationName}</li>
        <li><strong>Coordinates:</strong> {info.lat?.toFixed(4)}, {info.lng?.toFixed(4)}</li>
      </ul>
    </div>
  )
}

export default LocationInfoBox