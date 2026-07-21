import {useNavigate, useParams} from 'react-router-dom'
import {useState, useEffect, useRef} from 'react'
import {useSelector} from 'react-redux'
import {categoryNames} from '../constants/nameKategories.js'
import Chat from "../components/Chat.jsx";

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



    useEffect(() => {

        async function loadAd() {

            const response = await fetch(
                `/api/ad/${id}`)

            const data = await response.json()

            console.log("AD =", data)

            setWerbung(data)

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

    const handleDeleteAd = async () => {

        const response = await fetch(
            `/api/ad/${werbung.id}`,
            {
                method: 'DELETE',
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
                Anzeige wird geladen...
            </div>
        )
    }

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

                    <h1 className="text-2xl font-bold text-gray-300 mb-2">
                        {werbung.title}
                    </h1>

                    <div className="mb-4">

                        <div className="flex items-center gap-2 mt-2">

                            {werbung.anbieter ? (
                                <span className="
            inline-block
            px-3 py-1
            rounded-full
            bg-cyan-500/20
            text-cyan-300
            text-xs
            font-bold
        ">
            BIETE
        </span>
                            ) : (
                                <span className="
            inline-block
            px-3 py-1
            rounded-full
            bg-pink-500/20
            text-pink-300
            text-xs
            font-bold
        ">
            SUCHE
        </span>
                            )}

                            <button
                                onClick={() => navigate(`/profile/${werbung.ownerId}`)}
                                className="
            text-cyan-300
            hover:text-cyan-200
            transition
            text-sm
        "
                            >
                                von{" "}
                                <span className="font-semibold">
                                {werbung.ownerName}
                                </span>
                            </button>

                        </div>
                    </div>


                    <p className="text-gray-400 mb-2">
                        PLZ: {werbung.plz}
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
                                '🔐 Bitte melden Sie sich über Telegram an.'
                            )}
                            className="
                w-full py-3 rounded-2xl font-bold
                bg-blue-500 text-white
            "
                        >
                            🔐 Anmelden, um zu kontaktieren
                        </button>

                    ) : isOwner ? (

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
                                🗑 Löschen
                            </button>

                            <button
                                onClick={() => navigate(`/edit/${werbung.id}`)}
                                className="
                    flex-1 py-3 rounded-2xl font-bold text-white
                    bg-gradient-to-br from-gray-500 to-gray-700
                    shadow-lg shadow-cyan-500/20
                    active:scale-95 transition
                "
                            >
                                ✏️ Bearbeiten
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
                                🗑 Löschen
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
                                    💬 Kontaktieren
                                </button>

                            )}

                        </>

                    ) : (

                        <>
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
                                    ? '❤️ Gespeichert'
                                    : '🤍 Merken'}
                            </button>

                            {!showChat && (

                                <button
                                    onClick={() => setShowChat(prev => !prev)}
                                    className="
                        flex-1 py-4 rounded-2xl font-bold text-black text-lg
                        bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600
                        shadow-lg shadow-pink-500/40
                        active:scale-95 transition
                    "
                                >
                                    💬 Kontaktieren
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

                {/*modalka*/}
                                {showDeleteModal && (
                    <div>
                        ...
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
        </div>
    )
}

export default AdDetailsPage