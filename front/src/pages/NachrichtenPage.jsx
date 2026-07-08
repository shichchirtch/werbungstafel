import {useEffect, useState} from "react"
import {useSelector} from "react-redux"
import Chat from "../components/Chat"


function NachrichtenPage() {

    const user = useSelector(state => state.user)

    const [chats, setChats] = useState([])
    const [selectedChat, setSelectedChat] = useState(null)


    async function loadChats() {

        if (!user.dbId) {
            return
        }

        const response = await fetch(
            `/api/chats/${user.dbId}`
        )

        if (!response.ok) {
            return
        }

        const data = await response.json()

        if (!data.ok) {
            return
        }

        setChats(data.chats)

    }


    useEffect(() => {

        loadChats()

    }, [loadChats])


    useEffect(() => {

        async function markAsRead() {

            if (!selectedChat) {
                return
            }

            const response = await fetch(
                "/api/messages/read",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({

                        ad_id: selectedChat.ad_id,

                        sender_id: selectedChat.user_id,

                        receiver_id: user.dbId,

                    }),
                }
            )

            if (!response.ok) {
                return
            }

            const data = await response.json()

            if (!data.ok) {
                return
            }

            // перечитываем список чатов
            await loadChats()

        }

        markAsRead()

    }, [selectedChat])

    useEffect(() => {

        async function readMessages() {

            if (!selectedChat) {
                return
            }

            const response = await fetch(
                "/api/messages/read",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({

                        ad_id: selectedChat.ad_id,

                        sender_id: selectedChat.user_id,

                        receiver_id: user.dbId,

                    }),
                }
            )

            const data = await response.json()

            console.log("READ =", data)

            await loadChats()

        }

        readMessages()

    }, [selectedChat])

    //
    // ============================
    // СПИСОК ДИАЛОГОВ
    // ============================
    //

    if (!selectedChat) {

        return (

            <div className="px-4 py-6">

                <h1 className="text-2xl text-slate-200 font-bold mb-6">
                    Nachrichten
                </h1>

                <div className="flex flex-col gap-3">

                    {chats.length === 0 ? (

                        <div className="text-center text-gray-400 mt-20">
                            Noch keine Nachrichten
                        </div>

                    ) : (

                        chats.map(chat => (

                            <div
                                key={`${chat.ad_id}-${chat.user_id}`}
                                onClick={() => setSelectedChat(chat)}
                                className="
                                    p-4
                                    rounded-2xl
                                    bg-white/5
                                    border
                                    border-white/10
                                    cursor-pointer
                                    hover:bg-white/10
                                    transition
                                "
                            >

                                <div className="flex items-center gap-3">

                                    {chat.avatar ? (

                                        <img
                                            src={chat.avatar}
                                            alt={chat.name}
                                            className="
                                                w-12
                                                h-12
                                                rounded-full
                                                object-cover
                                            "
                                        />

                                    ) : (

                                        <div
                                            className="
                                                w-12
                                                h-12
                                                rounded-full
                                                bg-zinc-700
                                                flex
                                                items-center
                                                justify-center
                                                text-white
                                                font-bold
                                            "
                                        >
                                            {chat.name[0]}
                                        </div>

                                    )}

                                    <div className="flex-1">

                                        <div className="flex justify-between items-center">

                                            <div className="text-white font-semibold">
                                                {chat.name}
                                            </div>

                                            <div className="text-xs text-gray-500">

                                                {(() => {

                                                    const date = new Date(chat.created_at)
                                                    const today = new Date()

                                                    const isToday =
                                                        date.getDate() === today.getDate() &&
                                                        date.getMonth() === today.getMonth() &&
                                                        date.getFullYear() === today.getFullYear()

                                                    return isToday

                                                        ? date.toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })

                                                        : date.toLocaleDateString("de-DE", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                        })

                                                })()}

                                            </div>

                                        </div>

                                        <div className="flex justify-between items-center mt-1">

                                            <div className="text-gray-400 text-sm truncate">
                                                {chat.last_message}
                                            </div>

                                            {chat.unread > 0 && (

                                                <div
                                                    className="
    ml-3
    min-w-6
    h-6
    px-2
    rounded-full
    bg-gradient-to-br
    from-pink-500
    to-fuchsia-600
    text-white
    text-xs
    font-bold
    flex
    items-center
    justify-center
    shrink-0
"
                                                >
                                                    {chat.unread}
                                                </div>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </div>

        )

    }

    //
    // ============================
    // ОТКРЫТЫЙ ЧАТ
    // ============================
    //

    return (

        <div className="px-4 py-6">

            <button
                onClick={() => setSelectedChat(null)}
                className="
                    mb-5
                    text-cyan-300
                    font-semibold
                "
            >
                ← Alle Chats
            </button>

            <div
                className="
                    flex
                    items-center
                    gap-3
                    mb-5
                    pb-4
                    border-b
                    border-white/10
                "
            >

                {selectedChat.avatar ? (

                    <img
                        src={selectedChat.avatar}
                        alt={selectedChat.name}
                        className="
                            w-12
                            h-12
                            rounded-full
                            object-cover
                        "
                    />

                ) : (

                    <div
                        className="
                            w-12
                            h-12
                            rounded-full
                            bg-zinc-700
                            flex
                            items-center
                            justify-center
                            text-white
                            font-bold
                        "
                    >
                        {selectedChat.name[0]}
                    </div>

                )}

                <div>

                    <div className="text-white font-bold">
                        {selectedChat.name}
                    </div>

                    <div className="text-gray-500 text-sm">
                        Werbungstafel Chat
                    </div>

                </div>

            </div>

            <Chat
                adId={selectedChat.ad_id}
                senderId={user.dbId}
                receiverId={selectedChat.user_id}
            />

        </div>

    )

}

export default NachrichtenPage