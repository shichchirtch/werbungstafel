import {useEffect, useState} from "react"
import {useNavigate, useParams} from "react-router-dom"
import {useTranslation} from "../features/customHoock.js"


function UserAdsPage() {

    const {userId} = useParams()

    const navigate = useNavigate()

    const {t} = useTranslation()

    const [ads, setAds] = useState([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {

        async function loadUserAds() {

            const response = await fetch(
                `/api/user/${userId}/ads`
            )

            if (!response.ok) {
                setLoading(false)
                return
            }

            const data = await response.json()

            if (!data.ok) {
                setLoading(false)
                return
            }

            setAds(data.ads)

            setLoading(false)
        }

        loadUserAds()

    }, [userId])


    if (loading) {

        return (
            <div className="px-4 py-6">

                <p className="text-center text-gray-400">
                    Laden...
                </p>

            </div>
        )

    }


    return (

        <div className="px-4 py-6">

            <h1 className="text-3xl text-white font-bold text-center mb-6">
                {t('Anzeigen')}
            </h1>


            {ads.length === 0 ? (

                <p className="text-center text-gray-400">
                    {t('KeineAnzeigen')}
                </p>

            ) : (

                <div className="max-w-xl mx-auto flex flex-col gap-4">

                    {ads.map((item) => (

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
                            "
                        >

                            <div className="flex gap-4">

                                {/* PHOTO */}

                                <img
                                    src={
                                        item.preview ||
                                        "/images/no-photo.png"
                                    }
                                    alt="preview"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            "/images/no-photo.png"
                                    }}
                                    className="
                                        w-36
                                        h-36
                                        rounded-2xl
                                        object-cover
                                        shrink-0
                                    "
                                />


                                {/* TITLE + LOCATION + PRICE */}

                                <div className="flex-1 min-w-0">

                                    <h2
                                        className="
                                            text-xl
                                            font-bold
                                            text-white
                                            line-clamp-2
                                            mb-1
                                        "
                                    >
                                        {item.title}
                                    </h2>


                                    <p className="text-gray-400 mb-1">
                                        {item.plz
                                            ? `${t('PLZ')}: ${item.plz} / ${item.city}`
                                            : `${t('PLZ')}: ${item.city}`
                                        }
                                    </p>


                                    {item.price && (

                                        <p
                                            className="
                                                text-cyan-300
                                                font-semibold
                                            "
                                        >
                                            {item.price}
                                        </p>

                                    )}

                                </div>

                            </div>


                            {/* DESCRIPTION */}

                            <p
                                className="
                                    text-gray-300
                                    text-sm
                                    line-clamp-3
                                    mt-4
                                "
                            >
                                {item.description}
                            </p>


                            {/* OPEN */}

                            <button
                                onClick={() =>
                                    navigate(`/ad/${item.id}`)
                                }
                                className="
                                    w-full
                                    mt-4
                                    py-3
                                    rounded-2xl
                                    font-bold
                                    text-black
                                    bg-gradient-to-br
                                    from-cyan-300
                                    to-blue-500
                                    shadow-lg
                                    shadow-cyan-400/30
                                    active:scale-95
                                    transition
                                "
                            >
                                {t('Oeffnen')}
                            </button>

                        </div>

                    ))}

                </div>

            )}

        </div>

    )
}


export default UserAdsPage