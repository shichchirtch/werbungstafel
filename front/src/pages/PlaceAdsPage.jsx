import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'

function PlaceAdsPage() {

    const {place} = useParams()

    const navigate = useNavigate()

    const [ads, setAds] = useState([])

    const [loading, setLoading] = useState(true)

    useEffect(() => {

        async function loadAds() {

            try {

                const response = await fetch(
                    `/api/place/${encodeURIComponent(place)}`
                )

                const data = await response.json()

                console.log("PLACE ADS =", data)

                setAds(data)

            } catch (err) {

                console.error(err)

            }

            setLoading(false)

        }

        loadAds()

    }, [place])

    if (loading) {

        return (

            <div className="text-center text-gray-400 py-12">

                Anzeige wird geladen...

            </div>

        )

    }

    return (

        <div className="px-4 py-6 max-w-xl mx-auto">

            <h1
                className="text-4xl font-black text-center mb-2 text-black"
                style={{
                    WebkitTextStroke: '0.5px white',
                    textShadow: '0 0 8px rgba(255,255,255,0.6)',
                }}
            >
                📍 {decodeURIComponent(place)}
            </h1>

            <p className="text-center text-gray-400 mb-8">

                {ads.length} Anzeigen

            </p>

            {

                ads.map(item => (

                    <div

                        key={item.id}

                        className="
                            rounded-3xl
                            border
                            border-white/10
                            bg-white/5
                            backdrop-blur-md
                            p-4
                            shadow-xl
                            mb-4
                        "

                    >

                        <h2 className="text-white font-bold text-xl mb-2">

                            {item.title}

                        </h2>

                        <div className="text-cyan-300 mb-2">

                            {item.price} €

                        </div>

                        <p className="text-gray-300">

                            {item.description}

                        </p>

                    </div>

                ))

            }

        </div>

    )

}

export default PlaceAdsPage