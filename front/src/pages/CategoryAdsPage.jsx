import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {useTranslation} from "../features/customHoock";


function CategoryAdsPage() {
    const {slug} = useParams()
    const navigate = useNavigate()
    const user = useSelector(state => state.user)
    const {t} = useTranslation()


    const categoryNames = {
        "altenpflege": "Altenpflege",
        "autoservice": "Autoservice",
        "handwerk": "Handwerk",
        "cleaning": "Cleaning",
        "events-training": "Events / Training",
        "studio": "Studio",
        "umzug-transport": "Umzug / Transport",
        "makeup-friseur": "MakeUp / Friseur",
        "babysitting": "Babysitting",
        "foto-video-kunst": "Foto / Video / Kunst",
        "it-computer-electronics": "IT / Computer / Electronics",
        "translators": "Translators",
        "rechtsdienstleistungen": "Rechtsdienstleistungen",
        "physio-spa": "Physio / Spa",
        "haustiere": "Haustiere",
        'immobilie': 'Immobilie',
        'garten': 'Garten',
        "weitere": "Weitere",
    }

    const title = categoryNames[slug] || 'Kategorie'

    const [loading, setLoading] = useState(true)

    const [allWerbungen, setAllWerbungen] = useState([])
    const [filter, setFilter] = useState("all")

    const [hasAds, setHasAds] = useState(false)

    const [place, setPlace] = useState(user.location||"Deutschland")
    const [radius, setRadius] = useState("Alle")
    console.log("CATEGORY USER =", user)
    useEffect(() => {

        async function loadAds() {
            setLoading(true)

            let url = `/api/ads/${slug}?place=${encodeURIComponent(place)}&radius=${radius}`

            if (user.id) {
                url += `&telegram_id=${user.id}`
            }
            console.log("URL =", url)
            try {
                const response = await fetch(url)
                //.. const response = await fetch(`/api/ads/${slug}?radius=${radius}&telegram_id=${user.id}`)
                console.log("STATUS =", response.status)

                const data = await response.json()
                console.log('ADS = ', data)
                console.log("IS ARRAY =", Array.isArray(data))
                console.log("DATA.ADS =", data.ads)
                console.log("SET =", data.ads)

                setAllWerbungen(data.ads)
                setHasAds(data.all_ads_count > 0)
                setLoading(false)

            } catch (error) {
                console.error(error)
                setLoading(false)
            }
        }

        loadAds()
    }, [slug, radius, user.id])

    console.log("ALL =", allWerbungen)
    console.log("TYPE =", typeof allWerbungen)
    console.log("IS ARRAY =", Array.isArray(allWerbungen))

    const werbungen = Array.isArray(allWerbungen)

        ? allWerbungen.filter(item => {

            if (filter === "all") {
                return true
            }

            if (filter === "anbieter") {
                return item.anbieter
            }

            return !item.anbieter

        })
        : []


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
                {t('NeuesteAnzeigenZuerst')}
            </p>

            {hasAds && (

                <>

                    {/* ФИЛЬТР */}

                    <div className="flex justify-center gap-3 mb-5">

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
                            {t('Alle')}
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
                            {t('Angebot')}
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
                            {t('Gesucht')}
                        </button>

                    </div>

                    <div className="
    max-w-xl
    mx-auto
    mb-6
    flex
    gap-3
">
                        <input
                            value={place}
                            onChange={(e) => setPlace(e.target.value)}
                            placeholder={t("Deutschland")}
                            className="
        flex-1 min-w-0
        bg-white/5
        border border-white/10
        rounded-xl
        px-4
        py-3
        text-white
        placeholder:text-gray-500
        outline-none
    "
                        />

                        <select
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            className="
        w-24

        bg-white/5
        border border-white/10
        rounded-xl

        px-3
        py-3

        text-gray-300
        outline-none
    "
                        >
                            <option value="Alle">{t('Alle')}</option>
                            <option>5 km</option>
                            <option>10 km</option>
                            <option>20 km</option>
                            <option>50 km</option>
                            <option>100 km</option>
                        </select>


                    </div>


                </>

            )}

            {loading ? (

                <div className="text-center text-gray-400 py-12">
                    {t('AnzeigeWirdGeladen')}
                </div>

            ) : !hasAds ? (

                <div
                    className="
            max-w-xl mx-auto
            rounded-3xl
            border border-white/10
            bg-white/5
            backdrop-blur-md
            p-8
            text-center
            shadow-2xl
        "
                >

                    <div className="text-6xl mb-4">📭</div>

                    <h2 className="text-2xl font-bold text-white mb-3">
                        {t('NochKeineAnzeigen')}
                    </h2>

                    <p className="text-gray-400 mb-6">
                        {t('SeiErste')}
                    </p>

                    <button
                        onClick={() => navigate(`/create/${slug}`)}
                        className="
                px-6 py-4
                rounded-2xl
                font-bold
                text-black
                text-lg
                bg-gradient-to-br
                from-cyan-300
                to-blue-500
                shadow-lg
                shadow-cyan-400/30
                active:scale-95
                transition
            "
                    >
                        {t('AnzeigeErstellen')}
                    </button>

                </div>

            ) : werbungen.length === 0 ? (

                <div
                    className="
            max-w-xl mx-auto
            rounded-3xl
            border border-white/10
            bg-white/5
            backdrop-blur-md
            p-8
            text-center
            shadow-2xl
        "
                >

                    <div className="text-6xl mb-4">📍</div>

                    <h2 className="text-2xl font-bold text-white mb-3">
                        {t('KeineAnzeigenGefunden')}
                    </h2>

                    <p className="text-gray-400 mb-6">
                        {t('Suchradius')}
                    </p>

                </div>

            ) : (

                <div className="max-w-xl mx-auto flex flex-col gap-4">
                    {werbungen.map((item) => (

                        <div
                            key={item.id}
                            className={`
        relative
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-md
        p-4
        shadow-xl
        overflow-hidden
    `}
                        >
                            {item.pinned && (
                                <div
                                    className="
            absolute
            top-0
            right-0
            w-14
            h-14
            bg-gradient-to-br
            from-fuchsia-500
            to-violet-700
        "
                                    style={{
                                        clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
                                    }}
                                >

                                </div>
                            )}


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
                                        {t("Oeffnen")}
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

export default CategoryAdsPage


// Bremen 28195