import {useEffect, useState} from 'react'
import {MapContainer, TileLayer, Marker, Popup,} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'


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


  function createMarker(count) {

    const size = Math.min(70, 38 + Math.sqrt(count) * 3)

    return L.divIcon({

        className: "",

        iconSize: [size, size],

        iconAnchor: [size / 2, size],

        html: `
            <div
                style="
                    width:${size}px;
                    height:${size}px;

                    background:
                        linear-gradient(
                            135deg,
                            #22d3ee,
                            #3b82f6
                        );

                    border:2px solid rgba(255,255,255,.9);

                    border-radius:18px 18px 18px 2px;

                    transform:rotate(-45deg);

                    display:flex;
                    align-items:center;
                    justify-content:center;

                    box-shadow:
                        0 0 10px #22d3ee,
                        0 0 20px #22d3ee,
                        0 0 40px rgba(34,211,238,.9);

                    transition:
                        transform .25s ease,
                        box-shadow .25s ease;
                "
            >

                <span
                    style="
                        transform:rotate(45deg);

                        color:white;

                        font-size:${size * 0.38}px;

                        font-weight:900;

                        text-shadow:
                            0 0 6px rgba(255,255,255,.8),
                            0 0 12px rgba(255,255,255,.7);

                        user-select:none;
                    "
                >
                    ${count}
                </span>

            </div>
        `,

    })

}
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
                        icon={createMarker(item.count)}
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