import {useEffect, useState} from 'react'
import {MapContainer, TileLayer, Marker} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {useNavigate} from 'react-router-dom'


function MapPage() {

    const [places, setPlaces] = useState([])
    const navigate = useNavigate()

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
    0 0 4px rgba(34,211,238,.8),
    0 0 10px rgba(34,211,238,.5),
    0 0 18px rgba(34,211,238,.25);

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
                        eventHandlers={{
                            click: () => {
                                navigate(`/place/${encodeURIComponent(item.place)}`)
                            }
                        }}
                    />

                ))}

            </MapContainer>

        </div>

    )

}

export default MapPage