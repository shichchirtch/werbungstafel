import {useEffect, useState} from 'react'
import {MapContainer, TileLayer, Marker, Popup,} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'


function MapPage() {

    const [places, setPlaces] = useState([])

    useEffect(() => {

        async function loadMap() {

            try {

                const response =
                    await fetch('/api/map')

                const data =
                    await response.json()

                console.log("MAP =", data)

                setPlaces(data)

            } catch (err) {

                console.error(err)

            }

        }

        loadMap()

    }, [])

    return (

        <div className="h-screen">

            <MapContainer
                center={[51.1657, 10.4515]}
                zoom={6}
                scrollWheelZoom={true}
                style={{
                    height: '100%',
                    width: '100%',
                }}
            >

                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {places.map((item) => (

                    <Marker
                        key={item.place}
                        position={[
                            item.latitude,
                            item.longitude,
                        ]}
                    >

                        <Popup>

                            <b>{item.place}</b>

                            <br/>

                            Anzeigen: {item.count}

                        </Popup>

                    </Marker>

                ))}

            </MapContainer>

        </div>

    )

}

export default MapPage