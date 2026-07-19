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

        <div
    className="relative"
    style={{
        height: "100dvh",
    }}
>

            {/* Панель поверх карты */}

            <div
                className="
                    absolute
                    top-8
                    left-4
                    right-4

                    z-[1000]

                    flex
                    justify-between
                    items-center
                    pointer-events-none
                "
            >

                <button

                    onClick={() => navigate(-1)}

                    className="
    w-12
    h-12

    rounded-full

    bg-gradient-to-br
    from-cyan-500
    to-blue-600

    text-white
    text-2xl

    border
    border-white/20

    shadow-lg
    shadow-cyan-500/40
    pointer-events-auto
    hover:scale-110
    transition
"
                >
                    ←
                </button>

                <p
                    className="
        px-5
        py-2

        rounded-full

        bg-black/55
        backdrop-blur-md

        border
        border-white/10

        text-white
        text-lg
        font-bold

        shadow-lg
        shadow-cyan-500/20
        pointer-events-auto

        select-none
    "
                >Deutschland</p>

                <button

                    onClick={() => navigate('/')}

                    className="
    w-12
    h-12

    rounded-full

    bg-gradient-to-br
    from-cyan-500
    to-blue-600

    text-white
    text-2xl

    border
    border-white/20

    shadow-lg
    shadow-cyan-500/40
    pointer-events-auto

    hover:scale-110
    transition
"

                >
                    🏠
                </button>

            </div>

            <MapContainer
                center={[51.1657, 10.4515]}
                zoom={6}
                zoomControl={false}
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