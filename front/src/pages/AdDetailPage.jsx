import {useNavigate, useParams} from 'react-router-dom'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage } from '../features/messages/messagesSlice.js'
import { removeWerbung } from '../features/werbung/werbungSlice'
import { toggleFavorite } from '../features/favorites/favoritesSlice'

const currentUser = {
    id: 'user_1',
    name: 'Ivan'
}

function AdDetailsPage() {
    const { id } = useParams()
    const [showChat, setShowChat] = useState(false)
    const [message, setMessage] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const dispatch = useDispatch()

    const allWerbungen = useSelector((state) => state.werbung.werbungen)

    const user = useSelector((state) => state.user)
    const navigate = useNavigate()



    const werbung = allWerbungen.find(
        (item) => String(item.id) === id
    )

    const allMessages = useSelector((state) => state.messages.messages)

    const messages = werbung
        ? allMessages.filter((m) => m.adId === werbung.id)
        : []

    const isOwner =
        user.isAuth &&
        werbung &&
        user.id === werbung.ownerId

    const favorites = useSelector((state) => state.favorites.favorites)

    const isFavorite = favorites.includes(werbung.id)

    const handleSend = () => {
        if (!message.trim()) return

        const newMessage = {
            id: Date.now(),
            adId: werbung.id,
            fromUser: currentUser.id,
            fromName: currentUser.name,
            text: message,
            createdAt: new Date().toISOString(),
        }


        dispatch(addMessage(newMessage))
        setMessage('')
    }
    const handleToggleFavorite = () => {

        if (!user.isAuth) {
            alert('Bitte zuerst einloggen')
            return
        }

        dispatch(toggleFavorite(werbung.id))
    }


    if (!werbung) return null

    return (
        <div className="px-4 py-6">

            <div className="max-w-xl mx-auto flex flex-col gap-4">


                {/* IMAGE */}
                {werbung.photos?.length > 0 && (
                    <img
                        src={werbung.photos[0]}
                        alt="ad"
                        className="w-full h-64 object-cover rounded-3xl border border-white/10"
                    />
                )}

                {/* CARD */}
                <div className="
          bg-white/5 border border-white/10
          rounded-3xl p-5 backdrop-blur-md
        ">

                    <h1 className="text-2xl font-bold text-gray-300 mb-2">
                        {werbung.title}
                    </h1>

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

                    {isOwner && (
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
                    )}
                    {isOwner && (
                        <button
                            className="
                flex-1 py-3 rounded-2xl font-bold text-white
                bg-gradient-to-br from-gray-500 to-gray-700
                shadow-lg shadow-cyan-500/20
                active:scale-95 transition
            "

                            onClick={() => navigate(`/edit/${werbung.id}`)}
                        >
                            ✏️ Bearbeiten
                        </button>)}
                    <button
                        onClick={handleToggleFavorite}
                        // disabled={!user.isAuth}
                        className={`
        flex-1 py-3 rounded-2xl font-bold
        transition active:scale-95
        ${isFavorite
                            ? 'bg-gray-500 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }
    `}
                    >

                        {isFavorite ? '❤️ Gespeichert' : '🤍 Merken'}
                    </button>

                    <button
                        onClick={() => setShowChat((prev) => !prev)}
                        className="
            flex-1 py-4 rounded-2xl font-bold text-black text-lg
            bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600
            shadow-lg shadow-pink-500/40
            active:scale-95 transition
        "
                    >
                        💬 Kontaktieren
                    </button>

                </div>

                {showChat && (
                    <div className="mt-4 bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-md">

                        <div className="max-h-60 overflow-y-auto flex flex-col gap-2 mb-3">

                            {messages.length === 0 ? (
                                <p className="text-gray-400 text-sm">Noch keine Nachrichten</p>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className="bg-cyan-500/20 text-gray-300 p-2 rounded-xl text-sm self-start"
                                    >
                                        {msg.text}
                                    </div>
                                ))
                            )}

                        </div>

                        <div className="flex gap-2">
                            <input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Nachricht..."
                                className="flex-1 bg-black/40 text-white p-3 rounded-xl border border-white/10 outline-none"
                            />

                            <button
                                onClick={handleSend}
                                className="px-4 rounded-xl bg-cyan-400 text-black font-bold"
                            >
                                →
                            </button>


                        </div>

                    </div>
                )}

            </div>
            {/*modalka*/}
            {showDeleteModal && (
                <div className="
        fixed inset-0 bg-black/70
        flex items-center justify-center z-50
    ">

                    <div className="
            w-full max-w-sm mx-4
            bg-zinc-900 border border-white/10
            rounded-3xl p-6 text-center
        ">

                        <h2 className="text-white text-xl font-bold mb-4">
                            Anzeige löschen?
                        </h2>

                        <p className="text-gray-400 mb-6">
                            Diese Aktion kann nicht rückgängig gemacht werden.
                        </p>

                        <div className="flex gap-3">

                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="
                        flex-1 py-3 rounded-2xl
                        bg-white/10 text-white
                    "
                            >
                                Abbrechen
                            </button>

                            <button
                                onClick={() => {
                                    dispatch(removeWerbung(werbung.id))
                                    navigate('/my-ads')
                                }}
                                className="
                        flex-1 py-3 rounded-2xl
                        bg-red-500 text-white font-bold
                    "
                            >
                                Löschen
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </div>
    )
}

export default AdDetailsPage