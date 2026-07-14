import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'


function CategoryAdsPage() {
    const {slug} = useParams()
    const navigate = useNavigate()
    const user = useSelector(state => state.user)

    const categoryNames = {
        altenpflege: 'Altenpflege',
        autoservice: 'Autoservice',
        handwerk: 'Handwerk',
        cleaning: 'Cleaning',
        'events-training': 'Events / Training',
        studio: 'Studio',
        'umzug-transport': 'Umzug / Transport',
        'makeup-friseur': 'MakeUp / Friseur',
        babysitting: 'Babysitting',
        'foto-video-kunst': 'Foto / Video / Kunst',
        'it-computer-electronics': 'IT / Computer / Electronics',
        translators: 'Translators',
        rechtsdienstleistungen: 'Rechtsdienstleistungen',
        'physio-spa': 'Physio / Spa',
        haustiere: 'Haustiere',
        weitere: 'Weitere',
    }

    const title = categoryNames[slug] || 'Kategorie'

    const [loading, setLoading] = useState(true)

    const [allWerbungen, setAllWerbungen] = useState([])
    const [filter, setFilter] = useState("all")

    const [radius, setRadius] = useState("Deutschland")
    const [showLocationModal, setShowLocationModal] = useState(false)


    useEffect(() => {

        async function loadAds() {
            setLoading(true)
            try {
                const response = await fetch(`/api/ads/${slug}`)
                const data = await response.json()
                console.log('ADS = ', data)
                setAllWerbungen(data)
                setLoading(false)

            } catch (error) {
                console.error(error)
                setLoading(false)
            }
        }

        loadAds()
    }, [slug])

    const werbungen = allWerbungen.filter(item => {

        if (filter === "all") {
            return true
        }

        if (filter === "anbieter") {
            return item.anbieter
        }

        return !item.anbieter

    })

    return (
        <div className="px-4 py-6">

            <h1
                className="text-4xl font-black text-center mb-3 text-black"
                style={{
                    WebkitTextStroke: '0.5px white',
                    textShadow: '0 0 8px rgba(255,255,255,0.6)',
                }}
            >
                {title}
            </h1>

            <p className="text-center text-gray-400 mb-6">
                Neueste Anzeigen zuerst
            </p>

            <div className="flex justify-center gap-3 mb-6">

                <div
                    className="
        max-w-xl
        mx-auto
        mb-6
        rounded-2xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-md
        p-4
    "
                >

                    <div className="text-gray-300 font-semibold mb-3">
                        Radius
                    </div>

                    <div className="grid grid-cols-2 gap-3">

                        {[
                            "Deutschland",
                            "5 km",
                            "10 km",
                            "20 km",
                            "50 km",
                        ].map(item => (

                            <label
                                key={item}
                                className="
                    flex
                    items-center
                    gap-2
                    cursor-pointer
                    text-gray-300
                "
                            >

                                <input
                                    type="radio"
                                    name="radius"
                                    checked={radius === item}
                                    onChange={() => {

                                        if (item === "Deutschland") {
                                            setRadius(item)
                                            return
                                        }

                                        if (!user.latitude || !user.longitude) {
                                            setShowLocationModal(true)
                                            return
                                        }

                                        setRadius(item)

                                    }}
                                    className="accent-cyan-400"
                                />

                                {item}

                            </label>

                        ))}

                    </div>

                </div>

                <button
                    onClick={() => setFilter("all")}
                    className={`
            px-4 py-2 rounded-xl text-sm font-semibold transition

            ${
                        filter === "all"
                            ? "bg-cyan-400 text-black"
                            : "bg-white/5 text-gray-300"
                    }
        `}
                >
                    Alle
                </button>

                <button
                    onClick={() => setFilter("anbieter")}
                    className={`
            px-4 py-2 rounded-xl text-sm font-semibold transition

            ${
                        filter === "anbieter"
                            ? "bg-cyan-400 text-black"
                            : "bg-white/5 text-gray-300"
                    }
        `}
                >
                    Ich biete
                </button>

                <button
                    onClick={() => setFilter("suche")}
                    className={`
            px-4 py-2 rounded-xl text-sm font-semibold transition

            ${
                        filter === "suche"
                            ? "bg-cyan-400 text-black"
                            : "bg-white/5 text-gray-300"
                    }
        `}
                >
                    Ich suche
                </button>

            </div>

            {loading ? (

                <div className="text-center text-gray-400 py-12">
                    Anzeige wird geladen...
                </div>

            ) : werbungen.length === 0 ? (

                <div
                    className="max-w-xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-center shadow-2xl">

                    <div className="text-6xl mb-4">📭</div>

                    <h2 className="text-2xl font-bold text-white mb-3">
                        Noch keine Anzeigen
                    </h2>

                    <p className="text-gray-400 mb-6">
                        Sei der Erste und veröffentliche dein Angebot.
                    </p>

                    <button
                        onClick={() => navigate(`/create/${slug}`)}
                        className="
                        px-6 py-4 rounded-2xl font-bold text-black text-lg
                        bg-gradient-to-br from-cyan-300 to-blue-500
                        shadow-lg shadow-cyan-400/30
                        active:scale-95 transition
                        "
                    >
                        Anzeige erstellen
                    </button>

                </div>

            ) : (

                <div className="max-w-xl mx-auto flex flex-col gap-4">

                    {werbungen.map((item) => (
                        <div
                            key={item.id}
                            className="
                            rounded-3xl border border-white/10
                            bg-white/5 backdrop-blur-md
                            p-4 shadow-xl
                            "
                        >

                            {item.photos?.length > 0 && (
                                <img
                                    src={item.photos[0].url}
                                    alt="preview"
                                    className="w-full h-48 object-cover rounded-2xl mb-4"
                                />
                            )}

                            <h2 className="text-xl font-bold text-white mb-2">
                                {item.title}
                            </h2>

                            <p className="text-gray-400 text-sm mb-2">
                                PLZ: {item.plz}
                            </p>

                            {item.price && (
                                <p className="text-cyan-300 font-semibold mb-2">
                                    {item.price}
                                </p>
                            )}

                            <p className="text-gray-300 line-clamp-3 mb-4">
                                {item.description}
                            </p>

                            <button
                                onClick={() => navigate(`/ad/${item.id}`)}
                                className="
                                w-full py-3 rounded-2xl
                                font-bold text-black
                                bg-gradient-to-br from-cyan-300 to-blue-500
                                shadow-lg shadow-cyan-400/30
                                active:scale-95 transition
                                "
                            >
                                Öffnen
                            </button>

                        </div>
                    ))}

                </div>

            )}

            {showLocationModal && (

                <div
                    className="
            fixed inset-0
            bg-black/70
            flex
            items-center
            justify-center
            z-50
        "
                >

                    <div
                        className="
                w-[90%]
                max-w-md
                rounded-3xl
                bg-zinc-900
                border
                border-white/10
                p-6
            "
                    >

                        <h2 className="text-xl font-bold text-white mb-3">
                            📍 Standort erforderlich
                        </h2>

                        <p className="text-gray-400 mb-6">
                            Um Anzeigen im Umkreis zu finden,
                            vervollständigen Sie bitte zuerst Ihr Profil.
                        </p>

                        <div className="flex gap-3">

                            <button
                                onClick={() => setShowLocationModal(false)}
                                className="
                        flex-1
                        py-3
                        rounded-2xl
                        bg-zinc-700
                        text-white
                    "
                            >
                                Abbrechen
                            </button>

                            <button
                                onClick={() => {
                                    setShowLocationModal(false)
                                    navigate("/edit-profile")
                                }}
                                className="
                        flex-1
                        py-3
                        rounded-2xl
                        bg-cyan-400
                        text-black
                        font-bold
                    "
                            >
                                Profil öffnen
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    )
}

export default CategoryAdsPage