import {useNavigate, useParams} from 'react-router-dom'
import {useState, useEffect, useRef} from 'react'
import {useSelector} from 'react-redux'
import {categoryNames} from '../constants/nameKategories.js'
import Chat from "../components/Chat.jsx";
import {useTranslation} from "../features/customHoock.js";

function AdDetailsPage() {
    const {id} = useParams()
    const [showChat, setShowChat] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [toast, setToast] = useState(null)
    const [currentPhoto, setCurrentPhoto] = useState(0)
    const [touchStart, setTouchStart] = useState(null)
    const [touchEnd, setTouchEnd] = useState(null)
    const [showFullscreen, setShowFullscreen] = useState(false)
    const toastRef = useRef(null)
    const user = useSelector((state) => state.user)
    const navigate = useNavigate()
    const [werbung, setWerbung] = useState(null)
    const [isFavorite, setIsFavorite] = useState(false)
    const [messages, setMessages] = useState([])
    const [showReportModal, setShowReportModal] = useState(false)
    const {t} = useTranslation()
    const [isPinned, setIsPinned] = useState(false)


    useEffect(() => {

        async function loadAd() {

            const response = await fetch(
                `/api/ad/${id}`)

            const data = await response.json()

            console.log("AD =", data)

            setWerbung(data)
            setIsPinned(data.pinned)

            await fetch(`/api/ad-view/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    telegram_id: user.id,
                }),
            })

            if (user.isAuth) {

                const responseMerkList = await fetch(
                    `/api/favorites/${user.id}/${id}`
                )

                const dataMerkList = await responseMerkList.json()

                console.log("IS FAVORITE =", dataMerkList)

                setIsFavorite(dataMerkList.isFavorite)
                if (user.dbId !== data.ownerId) {
                    const responseChat = await fetch(
                        `/api/messages/${data.id}/${user.dbId}/${data.ownerId}`
                    )

                    const dataChat = await responseChat.json()

                    setMessages(dataChat.nachrichten)
                    if (dataChat.nachrichten.length > 0) {
                        setShowChat(true)
                    }
                }
            }
        }

        loadAd()
    }, [id, user.id, user.isAuth])

    async function handleToggleShadowBan() {

        if (user.role !== 'admin') {
            return
        }

        const response = await fetch(
            `/api/ad/${werbung.id}/shadow-ban`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: user.dbId,
                }),
            }
        )

        if (!response.ok) {
            showToast("Fehler beim Shadow-Ban")
            return
        }

        const data = await response.json()

        if (!data.ok) {
            showToast(
                data.error || "Fehler beim Shadow-Ban"
            )
            return
        }

        // Обновляем локальное состояние объявления
        setWerbung((prev) => ({
            ...prev,
            sh_banned: data.sh_banned,
        }))

    }

    const handleTogglePinned = async () => {

        const response = await fetch(
            `/api/ad/${werbung.id}/pin`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.dbId,
                }),
            }
        )

        const data = await response.json()

        if (!data.ok) {
            showToast(data.error || 'Fehler')
            return
        }

        setIsPinned(data.pinned)
    }


    const isOwner = user.isAuth &&
        werbung &&
        user.dbId === werbung.ownerId

    const showToast = (text) => {
        setToast(text)
        clearTimeout(toastRef.current)
        toastRef.current = setTimeout(() => {
            setToast(null)
        }, 5000)
    }

    const handleToggleFavorite = async () => {

        const method = isFavorite
            ? 'DELETE'
            : 'POST'

        const response = await fetch(
            '/api/favorites',
            {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    telegram_id: user.id,
                    ad_id: werbung.id,
                }),
            }
        )
        const data = await response.json()
        if (!data.ok) {
            showToast(data.error || "Fehler")
            return
        }
        setIsFavorite(!isFavorite)
    }

    const handlePrevPhoto = () => {
        if (currentPhoto > 0) {
            setCurrentPhoto(currentPhoto - 1)
        }
    }

    const handleNextPhoto = () => {
        if (currentPhoto < werbung.photos.length - 1) {
            setCurrentPhoto(currentPhoto + 1)
        }
    }

    const handleTouchStart = (e) => {
        setTouchEnd(null)
        setTouchStart(
            e.targetTouches[0].clientX)
    }

    const handleTouchMove = (e) => {
        setTouchEnd(
            e.targetTouches[0].clientX
        )
    }

    const handleTouchEnd = () => {
        if (
            touchStart === null ||
            touchEnd === null
        ) {
            return
        }
        const distance = touchStart - touchEnd
        const minSwipe = 50
        if (distance > minSwipe && currentPhoto < werbung.photos.length - 1) {
            handleNextPhoto()
        }
        if (distance < -minSwipe && currentPhoto > 0) {
            handlePrevPhoto()
        }
    }

    const reportAd = async (reason) => {

        setShowReportModal(false)

        const response = await fetch(
            "/api/report-ad",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ad_id: werbung.id,
                    reason,
                    reporter_id: user.dbId,
                }),
            }
        )

        const data = await response.json()

        if (!data.ok) {
            alert(data.error)
            return
        }

        showToast(
            t("Meldung")
        )

    }

    const handleArchiveAd = async () => {

        const response = await fetch(
            `/api/ad/${werbung.id}/archive`,
            {
                method: "PATCH",
            }
        )

        if (!response.ok) {
            showToast("Fehler beim Archivieren")
            return
        }

        const data = await response.json()

        if (!data.ok) {
            showToast(data.error || "Fehler")
            return
        }

        navigate('/my-ads')
    }

    const handleDeleteAd = async () => {

        const response = await fetch(
            `/api/ad/${werbung.id}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: user.role,
                }),
            }
        )

        const data = await response.json()

        if (!data.ok) {

            showToast(data.error || 'Fehler')

            return
        }

        navigate('/my-ads')
    }
    if (!werbung) {
        return (
            <div className="px-4 py-6 text-center text-white">
                {t('AnzeigeWirdGeladen')}
            </div>
        )
    }
    console.log("CURRENT USER =", user)
    console.log("IS OWNER =", isOwner)
    console.log("ROLE =", user.role)
    return (
        <div className="px-4 py-6">
            <p className="text-cyan-300 text-sm mb-3 font-semibold text-center">

                {categoryNames[werbung.category]}

            </p>

            <div className="max-w-xl mx-auto flex flex-col gap-4">

                {/* IMAGE */}
                {werbung.photos?.length > 0 && (
                    <>
                        <div
                            className={`
        ${
                                showFullscreen
                                    ? `
                    fixed
                    inset-0
                    z-50

                    bg-black

                    flex
                    items-center
                    justify-center
                `
                                    : `
                    relative
                    w-full
                    max-w-xl
                    aspect-[3/2]
                    rounded-3xl
                    border border-white/10
                    bg-black
                    overflow-hidden
                    flex
                    items-center
                    justify-center
                `
                            }
    `}

                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <img
                                src={werbung.photos[currentPhoto].url}
                                alt="ad"
                                onClick={() => setShowFullscreen(true)}
                                className="
        max-w-full
        max-h-full
        object-contain
        cursor-pointer"
                            />

                            {showFullscreen && (

                                <button
                                    onClick={() => setShowFullscreen(false)}
                                    className="
            absolute
            top-4
            right-4
            w-10
            h-10
            rounded-full
            bg-black/40
            backdrop-blur-sm
            text-gray-500
            text-xl
            z-50
        "
                                >
                                    ✕
                                </button>

                            )}


                            {currentPhoto > 0 && (
                                <button
                                    onClick={handlePrevPhoto}
                                    className="
absolute
left-3
top-1/2
-translate-y-1/2

w-10
h-10

rounded-full

bg-black/40
backdrop-blur-sm

text-white
text-2xl

hover:bg-black/70
transition
"
                                >
                                    ‹
                                </button>
                            )}

                            {currentPhoto < werbung.photos.length - 1 && (
                                <button
                                    onClick={handleNextPhoto}
                                    className="
absolute
right-3
top-1/2
-translate-y-1/2

w-10
h-10

rounded-full

bg-black/40
backdrop-blur-sm

text-white
text-2xl

hover:bg-black/70
transition
"
                                >
                                    ›
                                </button>
                            )}

                        </div>

                        {werbung.photos.length > 1 && (

                            <div className="flex justify-center gap-2 mt-3">

                                {werbung.photos.map((_, index) => (

                                    <button
                                        key={index}
                                        onClick={() => setCurrentPhoto(index)}
                                        className={`
                            rounded-full
                            transition-all
                            ${
                                            currentPhoto === index
                                                ? 'w-3 h-3 bg-cyan-400'
                                                : 'w-2 h-2 bg-gray-600'
                                        }
                        `}
                                    />

                                ))}

                            </div>

                        )}

                    </>

                )}


                {/* CARD */}
                <div className=" relative
          bg-white/5 border border-white/10
          rounded-3xl p-5 backdrop-blur-md
        ">
                    <button
                        onClick={() =>
                            navigate(`/category/${werbung.category}`)
                        }
                        className="
            absolute top-4 right-4
            text-gray-600
            hover:text-white
            active:scale-90
            transition
            text-xl
        "
                    >
                        ✕
                    </button>

                    <div className="flex items-center gap-3 mt-2 text-sm">

                        {werbung.anbieter ? (

                            <span
                                className="
                px-3
                py-1
                rounded-full
                bg-cyan-500/20
                text-cyan-300
                text-xs
                font-bold
            "
                            >
            {t("BIETE")}
        </span>

                        ) : (

                            <span
                                className="
                px-3
                py-1
                rounded-full
                bg-pink-500/20
                text-pink-300
                text-xs
                font-bold
            "
                            >
            {t("SUCHE")}
        </span>

                        )}

                        <button
                            onClick={() => navigate(`/profile/${werbung.ownerId}`)}
                            className="
            text-cyan-300
            hover:text-cyan-200
            transition
        "
                        >
                            {werbung.ownerName}
                        </button>

                        <div className="ml-auto mr-12 flex items-center gap-4 text-gray-400">

                            <div className="flex items-center gap-1">
                                👀 {werbung.views}
                            </div>

                            <div className="flex items-center gap-1">
                                🩷 {werbung.favorites}
                            </div>

                        </div>

                    </div>

                    {/* TITLE */}
                    <h1
                        className="
        text-2xl
        font-black
        text-white
        mt-3
        mb-3
    "
                    >
                        {werbung.title}
                    </h1>

                    <p className="text-gray-400 mb-2">
                        {werbung.plz
                            ? `${t('PLZ')}: ${werbung.plz} / ${werbung.city}`
                            : `${t('PLZ')}: ${werbung.city}`
                        }
                    </p>

                    {werbung.price && (
                        <p className="text-cyan-300 font-semibold mb-3">
                            {werbung.price}
                        </p>
                    )}

                    <p className="text-gray-300 leading-relaxed">
                        {werbung.description}
                    </p>


                </div>


                {/* ACTION */}
                <div className="flex flex-row gap-4">

                    {!user.isAuth ? (

                        <button
                            onClick={() => showToast(
                                t('DurchTelegram')
                            )}
                            className="
                w-full py-3 rounded-2xl font-bold
                bg-blue-500 text-white
            "
                        >
                            {t('ZuKontact')}
                        </button>

                    ) : isOwner ? (

                        <>
                            {werbung.untouch ? (

                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="
            flex-1
            py-3
            rounded-2xl
            font-bold
            text-white
            bg-gradient-to-br
            from-gray-700
            to-gray-900
            shadow-lg
            shadow-cyan-500/20
            active:scale-95
            transition
        "
                                >
                                    {t('Loeschen')}
                                </button>

                            ) : (

                                <button
                                    onClick={handleArchiveAd}
                                    className="
            flex-1
            py-3
            rounded-2xl
            font-bold
            text-white
            bg-gradient-to-br
            from-gray-700
            to-gray-900
            shadow-lg
            shadow-cyan-500/20
            active:scale-95
            transition
        "
                                >
                                    {t('Archivieren')}
                                </button>

                            )}

                            <button
                                onClick={() => navigate(`/edit/${werbung.id}`)}
                                className="
                    flex-1 py-3 rounded-2xl font-bold text-white
                    bg-gradient-to-br from-gray-500 to-gray-700
                    shadow-lg shadow-cyan-500/20
                    active:scale-95 transition
                "
                            >
                                {t('Bearbeiten')}
                            </button>
                        </>

                    ) : user.role === "admin" ? (

                        <>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="
                    flex-1 py-3 rounded-2xl font-bold text-white
                    bg-gradient-to-br from-gray-700 to-gray-900
                    shadow-lg shadow-cyan-500/20
                    active:scale-95 transition
                "
                            >
                                {t('Loeschen')}
                            </button>

                            <button
                                onClick={handleToggleFavorite}
                                className={`
                flex-1 py-3 rounded-2xl font-bold
                transition active:scale-95
                ${
                                    isFavorite
                                        ? 'bg-gray-500 text-white'
                                        : 'bg-gray-700 text-gray-300'
                                }
            `}
                            >
                                {isFavorite
                                    ? t('Gespeichert')
                                    : t('Merken')
                                }
                            </button>

                            <button
                                onClick={handleTogglePinned}
                                className={`
                flex-1
                py-3
                rounded-2xl
                font-bold
                text-white
                transition
                active:scale-95
                ${
                                    isPinned
                                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-400/40'
                                        : 'bg-gradient-to-br from-gray-500 to-gray-700'
                                }
            `}
                            >
                                {isPinned ? '📌 TOP' : 'TOP'}
                            </button>
                            {/* SHADOW BAN */}

                            <button
                                onClick={handleToggleShadowBan}
                                className={`
                flex-1
                py-3
                rounded-2xl
                font-bold
                text-white
                transition
                active:scale-95

                ${
                                    werbung.sh_banned
                                        ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/40'
                                        : 'bg-gradient-to-br from-gray-500 to-gray-700'
                                }
            `}
                            >
                                {werbung.sh_banned
                                    ? 'UNSHADOW'
                                    : 'SHADOW BAN'
                                }
                            </button>


                            {!showChat && (

                                <button
                                    onClick={() => setShowChat(true)}
                                    className="
                        flex-1 py-4 rounded-2xl font-bold text-black text-lg
                        bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600
                        shadow-lg shadow-pink-500/40
                        active:scale-95 transition
                    "
                                >
                                    {t('Schreiben')}
                                </button>

                            )}

                        </>

                    ) : (

                        <>
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="
                flex-1 py-3 rounded-2xl font-bold
                text-yellow-300
                bg-yellow-500/10
                border border-yellow-500/20
                hover:bg-yellow-500/20
                transition active:scale-95
            "
                            >
                                {t('Melden')}
                            </button>

                            <button
                                onClick={handleToggleFavorite}
                                className={`
                flex-1 py-3 rounded-2xl font-bold
                transition active:scale-95
                ${
                                    isFavorite
                                        ? 'bg-gray-500 text-white'
                                        : 'bg-gray-700 text-gray-300'
                                }
            `}
                            >
                                {isFavorite
                                    ? t('Gespeichert')
                                    : t('Merken')}
                            </button>

                            {!showChat && (

                                <button
                                    onClick={() => setShowChat(true)}
                                    className="
                    flex-1 py-4 rounded-2xl font-bold
                    text-black text-lg
                    bg-gradient-to-br
                    from-pink-500
                    via-fuchsia-500
                    to-violet-600
                    shadow-lg shadow-pink-500/40
                    active:scale-95 transition
                "
                                >
                                    {t('Schreiben')}
                                </button>
                            )}
                        </>
                    )}

                </div>

                {showChat && (
                    <Chat
                        adId={werbung.id}
                        senderId={user.dbId}
                        receiverId={werbung.ownerId}
                    />
                )}

                {/* DELETE MODAL */}
                {showDeleteModal && (

                    <div
                        className="
            fixed inset-0
            bg-black/70
            flex items-center justify-center
            z-50
            px-4
        "
                    >

                        <div
                            className="
                w-full
                max-w-sm
                rounded-3xl
                bg-zinc-900
                border border-white/10
                p-6
            "
                        >

                            <h2
                                className="
                    text-xl
                    font-bold
                    text-white
                    text-center
                    mb-4
                "
                            >
                                🗑 {t("AnzeigeLoeschen")}
                            </h2>

                            <p
                                className="
                    text-gray-400
                    text-center
                    mb-6
                "
                            >
                                {t("AnzeigeLoeschenFrage")}
                            </p>

                            <div className="flex gap-3">

                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="
                        flex-1
                        py-3
                        rounded-2xl
                        bg-zinc-700
                        text-white
                        font-semibold
                    "
                                >
                                    {t("Abbrechen")}
                                </button>

                                <button
                                    onClick={handleDeleteAd}
                                    className="
                        flex-1
                        py-3
                        rounded-2xl
                        bg-red-600
                        text-white
                        font-bold
                        hover:bg-red-700
                        transition
                    "
                                >
                                    {t("Loeschen")}
                                </button>

                            </div>

                        </div>

                    </div>

                )}

                {toast && (
                    <div
                        className="
                            fixed bottom-6 left-1/2
                            -translate-x-1/2
                            bg-zinc-900 text-white
                            px-6 py-3 rounded-2xl
                            border border-white/10
                            shadow-2xl
                            z-50
                        "
                    >
                        {toast}
                    </div>
                )}

            </div>

            {showReportModal && (

                <div className="
fixed inset-0
bg-black/70
flex items-center justify-center
z-50
px-4
">

                    <div className="
w-full
max-w-sm
rounded-3xl
bg-zinc-900
border border-white/10
p-6
">

                        <h2 className="
text-xl
font-bold
text-white
mb-5
text-center
">
                            {t('AnzMelden')}
                        </h2>

                        <div className="flex flex-col gap-3">

                            <button
                                onClick={() => reportAd("Betrug / Scam")}
                                className="py-3 rounded-xl bg-white/5 text-white"
                            >
                                🚫 Betrug / Scam
                            </button>

                            <button
                                onClick={() => reportAd("Irreführende Anzeige")}
                                className="py-3 rounded-xl bg-white/5 text-white"
                            >
                                {t('Falsch')}
                            </button>

                            <button
                                onClick={() => reportAd("Beleidigungen")}
                                className="py-3 rounded-xl bg-white/5 text-white"
                            >
                                {t('Beleidigungen')}
                            </button>

                            <button
                                onClick={() => reportAd("Verbotene Ware")}
                                className="py-3 rounded-xl bg-white/5 text-white"
                            >
                                {t('VerbWare')}
                            </button>

                            <button
                                onClick={() => reportAd("Spam")}
                                className="py-3 rounded-xl bg-white/5 text-white"
                            >
                                🚫 Spam
                            </button>

                            <button
                                onClick={() => reportAd("Sonstiges")}
                                className="py-3 rounded-xl bg-white/5 text-white"
                            >
                                ❓ Sonstiges
                            </button>

                            <button
                                onClick={() => setShowReportModal(false)}
                                className="
mt-3
py-3
rounded-xl
bg-red-500
text-white
"
                            >
                                {t('Abbrechen')}
                            </button>

                        </div>

                    </div>

                </div>

            )}
        </div>
    )
}


export default AdDetailsPage