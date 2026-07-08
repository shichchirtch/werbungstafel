import {useEffect, useState} from "react"
import {useSelector} from "react-redux"
import Chat from "../components/Chat"

function NachrichtenPage() {

    const user = useSelector(state => state.user)

    const [chats, setChats] = useState([])
    const [selectedChat, setSelectedChat] = useState(null)

    useEffect(() => {

        async function loadChats() {

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

        if (user.dbId) {
            loadChats()
        }

    }, [user.dbId])


    // ==========================
    // СПИСОК ЧАТОВ
    // ==========================

    if (!selectedChat) {

        return (

            <div className="px-4 py-6">

                <h1 className="text-2xl text-slate-200 font-bold mb-6">
                    Nachrichten
                </h1>

                <div className="flex flex-col gap-3">

                    {chats.map(chat => (

                        <div
                            key={`${chat.ad_id}-${chat.user_id}`}
                            onClick={() => setSelectedChat(chat)}
                            className="
                                p-4
                                rounded-2xl
                                bg-white/5
                                border border-white/10
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

                                    <div className="text-white font-semibold">
                                        {chat.name}
                                    </div>

                                    <div className="text-gray-400 text-sm truncate">
                                        {chat.last_message}
                                    </div>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        )

    }


    // ==========================
    // ОТКРЫТЫЙ ЧАТ
    // ==========================

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

            <div className="flex items-center gap-3 mb-5">

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