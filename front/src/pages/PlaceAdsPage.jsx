import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useTranslation} from "../features/customHoock.js";

function PlaceAdsPage() {

    const {place} = useParams()

    const navigate = useNavigate()

    const [ads, setAds] = useState([])
    const {t} = useTranslation()
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

                {t('AnzeigeWirdGeladen')}

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

                {ads.length} {t('Anzeigen')}

            </p>

            {

                ads.map((item) => (

    <div
        key={item.id}
        onClick={() => navigate(`/ad/${item.id}`)}
        className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            backdrop-blur-md
            p-4
            shadow-xl
            mb-4
            cursor-pointer
            hover:border-cyan-400
            hover:shadow-cyan-400/20
            hover:scale-[1.02]
            transition
        "
    >

        <div className="flex gap-4">

            <img
                src={item.preview || "/images/no-photo.png"}
                alt="preview"
                onError={(e) => {
                    e.currentTarget.src = "/images/no-photo.png"
                }}
                className="
                    w-36
                    h-36
                    rounded-2xl
                    object-cover
                    shrink-0
                "
            />

            <div className="flex-1 flex flex-col min-w-0">

                <h2
                    className="
                        text-xl
                        font-bold
                        text-white
                        line-clamp-2
                        mb-2
                    "
                >
                    {item.title}
                </h2>

                <p className="text-gray-400 text-sm mb-2">
                    {t('PLZ')}: {item.plz}
                </p>

                {item.price && (
                    <p className="text-cyan-300 font-semibold mb-2">
                        {item.price}
                    </p>
                )}

                <p
                    className="
                        text-gray-300
                        text-sm
                        line-clamp-3
                        flex-1
                    "
                >
                    {item.description}
                </p>

            </div>

        </div>

    </div>

))}
        </div>
    )
}

export default PlaceAdsPage