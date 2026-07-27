import {useEffect, useState, useRef} from 'react'

function Chat({adId, senderId, receiverId,}) {

    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")
    const [selectedPhotos, setSelectedPhotos] = useState([])
    const fileInputRef = useRef(null)
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

        if (
            !message.trim() &&
            selectedPhotos.length === 0
        ) {
            return
        }

        try {

            const formData = new FormData()

            formData.append("ad_id", adId)
            formData.append("sender_id", senderId)
            formData.append("receiver_id", receiverId)
            formData.append("text", message)

            selectedPhotos.forEach(photo => {

                formData.append("photos", photo)

            })
            console.log("SELECTED PHOTOS =", selectedPhotos)

            const response = await fetch(
                "/api/messages",
                {
                    method: "POST",
                    body: formData,
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
            setSelectedPhotos([])
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }

        } catch (err) {

            console.error(err)

        }

    }

    // const handleSend = async () => {
    //
    //     if (!message.trim()) {
    //         return
    //     }
    //
    //     try {
    //
    //         const response = await fetch(
    //             "/api/messages",
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //
    //                 body: JSON.stringify({
    //                     ad_id: adId,
    //                     sender_id: senderId,
    //                     receiver_id: receiverId,
    //                     text: message,
    //                 }),
    //             }
    //         )
    //
    //         if (!response.ok) {
    //             return
    //         }
    //
    //         const data = await response.json()
    //
    //         if (!data.ok) {
    //             return
    //         }
    //
    //         setMessages(prev => [
    //             ...prev,
    //             data.nachricht,
    //         ])
    //
    //         setMessage("")
    //
    //     } catch (err) {
    //
    //         console.error(err)
    //
    //     }
    //
    // }


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

                                {msg.attachments?.length > 0 && (

                                    <div className="flex flex-col gap-2 mb-2">

                                        {msg.attachments.map((attachment, index) => (

                                            attachment.type === "photo" && (

                                                <img
                                                    key={index}
                                                    src={attachment.file_url}
                                                    alt="attachment"
                                                    className="
                        rounded-xl
                        max-w-full
                        max-h-64
                        object-cover
                        cursor-pointer
                    "
                                                />

                                            )

                                        ))}

                                    </div>

                                )}

                                {msg.text && (

                                    <div className="break-words">
                                        {msg.text}
                                    </div>

                                )}

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
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {

                    const files = Array.from(e.target.files || [])

                    if (files.length > 5) {
                        alert("Sie können maximal 5 Fotos auswählen.")
                    }

                    setSelectedPhotos(
                        files.slice(0, 5)
                    )}}
            />

            <div className="flex gap-2">

                <div className="flex gap-2">

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="
        px-4
        rounded-xl
        bg-white/10
        text-white
        text-xl
    "
                    >
                        📎
                    </button>

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

            </div>
            {selectedPhotos.length > 0 && (

                <div className="flex gap-2 mt-3 flex-wrap">

                    {selectedPhotos.map((photo, index) => (

                        <img
                            key={index}
                            src={URL.createObjectURL(photo)}
                            alt=""
                            className="
                    w-20
                    h-20
                    rounded-xl
                    object-cover
                    border
                    border-white/10
                "
                        />

                    ))}

                </div>

            )}
            <div className="text-right text-xs text-gray-500 mt-1">
                {message.length}/400
            </div>

        </div>

    )
}

export default Chat