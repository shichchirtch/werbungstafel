import {useEffect, useState} from 'react'

function Chat({
    adId,
    senderId,
    receiverId,
}) {

    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")

    useEffect(() => {

        async function loadMessages() {

            const response = await fetch(
                `/api/messages/${adId}/${senderId}/${receiverId}`
            )

            if (!response.ok) {
                return
            }

            const data = await response.json()

            if (!data.ok) {
                return
            }

            setMessages(data.nachrichten)
        }

        loadMessages()

    }, [adId, senderId, receiverId])


    const handleSend = async () => {

        if (!message.trim()) {
            return
        }

        try {

            const response = await fetch(
                "/api/messages",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        ad_id: adId,
                        sender_id: senderId,
                        receiver_id: receiverId,
                        text: message,
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

            setMessages(prev => [
                ...prev,
                data.nachricht,
            ])

            setMessage("")

        } catch (err) {

            console.error(err)

        }

    }


    return (

        <div
            className="
                mt-4
                bg-white/5
                border
                border-white/10
                rounded-3xl
                p-4
                backdrop-blur-md
            "
        >

            <div className="max-h-60 overflow-y-auto flex flex-col gap-2 mb-3">

                {messages.length === 0 ? (

                    <p className="text-gray-400 text-sm">
                        Noch keine Nachrichten
                    </p>

                ) : (

                    messages.map((msg) => (

                        <div
                            key={msg.id}
                            className={`flex mb-2 ${
                                msg.sender_id === senderId
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >

                            <div
                                className={`
                                    inline-flex
                                    flex-col
                                    max-w-[75%]
                                    px-3
                                    py-2
                                    rounded-2xl
                                    shadow

                                    ${
                                        msg.sender_id === senderId
                                            ? "bg-cyan-400 text-black rounded-br-md"
                                            : "bg-white/10 text-white rounded-bl-md"
                                    }
                                `}
                            >

                                <div className="break-words">
                                    {msg.text}
                                </div>

                                <div
                                    className="
                                        self-end
                                        mt-1
                                        text-[11px]
                                        opacity-60
                                    "
                                >
                                    {new Date(
                                        msg.created_at
                                    ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>

                            </div>

                        </div>

                    ))

                )}

            </div>

            <div className="flex gap-2">

                <input
                    value={message}
                    onChange={(e) =>
                        setMessage(e.target.value)
                    }
                    maxLength={400}
                    placeholder="Nachricht..."
                    className="
                        flex-1
                        bg-black/40
                        text-white
                        p-3
                        rounded-xl
                        border
                        border-white/10
                        outline-none
                    "
                />

                <button
                    onClick={handleSend}
                    className="
                        px-4
                        rounded-xl
                        bg-cyan-400
                        text-black
                        font-bold
                    "
                >
                    →
                </button>

            </div>

            <div className="text-right text-xs text-gray-500 mt-1">
                {message.length}/400
            </div>

        </div>

    )
}

export default Chat