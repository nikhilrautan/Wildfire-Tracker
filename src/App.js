import { useState, useEffect } from 'react'
import Map from './components/Map'
import Header from './components/Header'
import Loader from './components/Loader'

function App() {
  const [eventData, setEventData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        // Updated URL with query parameters for fast response times
        const res = await fetch(
          'https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&days=30&status=open'
        )
        const { events } = await res.json()

        setEventData(events)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch NASA data:', error)
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div>
      <Header />
      {!loading ? <Map eventData={eventData} /> : <Loader />}
    </div>
  )
}

export default App