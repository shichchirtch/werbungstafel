import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {useState, useEffect} from "react";
import {useTranslation} from "../features/customHoock.js";

function MyAdsPage() {
    const navigate = useNavigate()

    const user = useSelector((state) => state.user)
    const [myAds, setMyAds] = useState([])
    const {t} = useTranslation()

    useEffect(() => {

        async function loadMyAds() {

            const response = await fetch(
                `/api/my-ads/${user.id}`
            )

            const data = await response.json()

            console.log("MY ADS =", data)

            setMyAds(data)
        }

        if (user.isAuth) {
            loadMyAds()
        }

    }, [user.id, user.isAuth])

    return (
        <div className="px-4 py-6">

            <h1 className="text-3xl text-white font-bold text-center mb-6">
                {t('MeineAnzeigen')}
            </h1>

            {myAds.length === 0 ? (

                <p className="text-center text-gray-400">
                    {t('DuHastNochKeineAnzeigenErstellt')}
                </p>

            ) : (

                <div className="max-w-xl mx-auto flex flex-col gap-4">

                    {myAds.map((item) => (

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

                            <div className="relative">

                                <div
                                    className={
                                        item.archived
                                            ? "opacity-60 grayscale"
                                            : ""
                                    }
                                >

                                    {/* ЗДЕСЬ всё содержимое объявления */}

                                    <div className="flex gap-4">

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

                                        {/* остальная разметка объявления */}

                                    </div>

                                </div>


                                {item.archived && (

                                    <div
                                        className="
                absolute
                inset-0
                z-10
                flex
                items-center
                justify-center
                pointer-events-none
            "
                                    >
                                        <div
                                            className="
                    px-5
                    py-2
                    rounded-xl
                    bg-black/70
                    border
                    border-white/20
                    text-white
                    font-bold
                    text-sm
                    uppercase
                    tracking-wider
                "
                                        >
                                            Archiviert
                                        </div>
                                    </div>

                                )}


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

                                <p className="text-gray-400 mb-2">
                                    {item.plz
                                        ? `${t('PLZ')}: ${item.plz} / ${item.city}`
                                        : `${t('PLZ')}: ${item.city}`
                                    }
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

                                <button
                                    onClick={() => navigate(`/ad/${item.id}`)}
                                    className="
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

                        </div>

                        </div>

                        ))}

                </div>

            )}

</div>
)
}

export default MyAdsPage