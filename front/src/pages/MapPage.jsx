import {MapContainer, TileLayer} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function MapPage() {

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
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

            </MapContainer>

        </div>

    )
}

export default MapPage