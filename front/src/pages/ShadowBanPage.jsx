import {useEffect, useState} from "react"
import {useSelector} from "react-redux"
import {useNavigate} from "react-router-dom"


function ShadowBanPage() {

    const user = useSelector((state) => state.user)
    const navigate = useNavigate()


    const [ads, setAds] = useState([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {

        if (!user.isAuth || user.role !== "admin") {
            navigate("/")
            return
        }

        async function loadAds() {

            const response = await fetch(
                `/api/admin/shadow-banned?user_id=${user.dbId}`
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

        loadAds()

    }, [user.isAuth, user.role, user.dbId, navigate])


    if (loading) {

        return (
            <div className="px-4 py-6 text-center text-gray-400">
                Laden...
            </div>
        )

    }


    return (

        <div className="px-4 py-6">

            <h1 className="text-3xl text-white font-bold text-center mb-6">
                Shadow Banned
            </h1>


            {ads.length === 0 ? (

                <p className="text-center text-gray-400">
                    Keine gesperrten Anzeigen
                </p>

            ) : (

                <div className="max-w-xl mx-auto flex flex-col gap-4">

                    {ads.map((item) => (

                        <div
                            key={item.id}
                            className="
                                rounded-3xl
                                border
                                border-red-500/20
                                bg-white/5
                                backdrop-blur-md
                                p-4
                                shadow-xl
                            "
                        >

                            <div className="flex gap-4">

                                <img
                                    src={
                                        item.preview ||
                                        "/images/no-photo.png"
                                    }
                                    alt={item.title}
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


                                <div className="flex-1 min-w-0">

                                    <h2
                                        className="
                                            text-xl
                                            font-bold
                                            text-white
                                            truncate
                                            mb-1
                                        "
                                    >
                                        {item.title}
                                    </h2>


                                    <p className="text-gray-400 mb-2">
                                        {item.plz
                                            ? `PLZ': ${item.plz} / ${item.city}`
                                            : `'PLZ': ${item.city}`
                                        }
                                    </p>


                                    <div
                                        className="
                                            inline-block
                                            px-3
                                            py-1
                                            rounded-lg
                                            bg-red-500/20
                                            border
                                            border-red-500/30
                                            text-red-300
                                            text-xs
                                            font-bold
                                        "
                                    >
                                        SHADOW BAN
                                    </div>

                                </div>

                            </div>


                            {item.description && (

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

                            )}


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
                                Открыть
                            </button>

                        </div>

                    ))}

                </div>

            )}

        </div>

    )
}


export default ShadowBanPage