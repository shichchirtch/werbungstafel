import {useEffect, useState, useRef} from 'react'
import {useTranslation} from "../features/customHoock.js";

function Chat({adId, senderId, receiverId,}) {

    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")
    const [selectedPhotos, setSelectedPhotos] = useState([])
    const fileInputRef = useRef(null)
    const [isSending, setIsSending] = useState(false)
    const textareaRef = useRef(null)
    const [openedPhotoIndex, setOpenedPhotoIndex] = useState(null)
    const [isBlockedPrivate, setIsBlockedPrivate] = useState(false)
    const chatPhotos = messages.flatMap(msg =>
        (msg.attachments || []).filter(a => a.type === "photo")
    )

    const touchStartX = useRef(0)
    const {t} = useTranslation()

    useEffect(() => {

        async function loadBlockStatus() {

            const response = await fetch(
                `/api/user-block/${receiverId}?blocker_id=${senderId}`
            )

            if (!response.ok) {
                return
            }

            const data = await response.json()

            if (!data.ok) {
                return
            }

            setIsBlockedPrivate(data.blocked)
        }

        if (receiverId && senderId) {
            loadBlockStatus()
        }

    }, [receiverId, senderId])

    async function handleToggleBlock() {

        const response = await fetch(
            `/api/user-block/${receiverId}?blocker_id=${senderId}`,
            {
                method: "PATCH",
            }
        )

        if (!response.ok) {
            return
        }

        const data = await response.json()

        if (!data.ok) {
            return
        }

        setIsBlockedPrivate(data.blocked)
    }

    const handleTouchStart = (e) => {

        touchStartX.current = e.touches[0].clientX

    }

    const handleTouchEnd = (e) => {
        const delta =
            e.changedTouches[0].clientX -
            touchStartX.current
        if (delta > 60) {
            handlePrevPhoto()
        }
        if (delta < -60) {
            handleNextPhoto()
        }
    }
    const handlePrevPhoto = () => {
        if (openedPhotoIndex > 0) {
            setOpenedPhotoIndex(prev => prev - 1)
        }
    }
    const handleNextPhoto = () => {
        if (openedPhotoIndex < chatPhotos.length - 1) {
            setOpenedPhotoIndex(prev => prev + 1)
        }
    }
    const handleMessageChange = (e) => {
        setMessage(e.target.value)
        const ta = textareaRef.current
        ta.style.height = "auto"
        ta.style.height = Math.min(ta.scrollHeight, 120) + "px"
    }

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement("canvas")
                let width = img.width
                let height = img.height
                const maxSize = 900
                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width
                        width = maxSize
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height
                        height = maxSize
                    }
                }
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext("2d")
                ctx.drawImage(img, 0, 0, width, height)
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject("Compression failed")
                            return
                        }
                        resolve(
                            new File(
                                [blob],
                                file.name.replace(/\.\w+$/, ".jpg"),
                                {
                                    type: "image/jpeg",
                                }
                            )
                        )
                    },
                    "image/jpeg",
                    0.7
                )
            }
            img.onerror = reject
            img.src = URL.createObjectURL(file)
        })
    }

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

            // Помечаем входящие сообщения как прочитанные
            await fetch(
                "/api/messages/read",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ad_id: adId,
                        sender_id: receiverId,
                        receiver_id: senderId,
                    }),
                }
            )

        }

        loadMessages()

    }, [adId, senderId, receiverId])

    const removePhoto = (indexToRemove) => {

        URL.revokeObjectURL(
            selectedPhotos[indexToRemove].preview
        )

        setSelectedPhotos(prev =>
            prev.filter((_, index) =>
                index !== indexToRemove
            )
        )

        if (
            fileInputRef.current &&
            selectedPhotos.length === 1
        ) {
            fileInputRef.current.value = ""
        }
    }

    useEffect(() => {

        async function refreshMessages() {

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

            console.log(
                "POLL:",
                data.nachrichten.map(msg => ({
                    id: msg.id,
                    sender: msg.sender_id,
                    read: msg.is_read,
                }))
            )

            setMessages(data.nachrichten)

            // Новые входящие сообщения считаем прочитанными
            await fetch(
                "/api/messages/read",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ad_id: adId,
                        sender_id: receiverId,
                        receiver_id: senderId,
                    }),
                }
            )

            // После изменения is_read снова получаем сообщения
            const updatedResponse = await fetch(
                `/api/messages/${adId}/${senderId}/${receiverId}`
            )

            if (!updatedResponse.ok) {
                return
            }

            const updatedData = await updatedResponse.json()

            if (!updatedData.ok) {
                return
            }

            setMessages(updatedData.nachrichten)
        }

        const interval = setInterval(
            refreshMessages,
            2000
        )

        return () => {
            clearInterval(interval)
        }

    }, [adId, senderId, receiverId])

    const handleSend = async () => {
        if (isSending) {
            return
        }
        if (!message.trim() &&
            selectedPhotos.length === 0
        ) {
            return
        }
        setIsSending(true)
        try {

            const formData = new FormData()

            formData.append("ad_id", adId)
            formData.append("sender_id", senderId)
            formData.append("receiver_id", receiverId)
            formData.append("text", message)

            const compressedPhotos = await Promise.all(
                selectedPhotos.map(photo =>
                    compressImage(photo.file)
                )
            )

            compressedPhotos.forEach(photo => {

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

            requestAnimationFrame(() => {

                if (textareaRef.current) {
                    textareaRef.current.style.height = "auto"
                }

            })
            selectedPhotos.forEach(photo => {

                URL.revokeObjectURL(photo.preview)

            })

            setSelectedPhotos([])
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }

        } catch (err) {

            console.error(err)

        } finally {

            setIsSending(false)

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
            <div className="flex items-center justify-between mb-3">

                <div className="text-gray-400 text-sm">
                    {t('Nachrichten')}
                </div>

                <button
                    onClick={handleToggleBlock}
                    className={`
            px-3
            py-2
            rounded-xl
            text-sm
            font-semibold
            transition
            active:scale-95

            ${
                        isBlockedPrivate
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }
        `}
                >
                    {isBlockedPrivate
                        ? `🔓 ${t('Entsperren')}`
                        : `🚫 ${t('Blockieren')}`
                    }
                </button>

            </div>
            <div
                className="
        h-60
        overflow-y-auto
        custom-scrollbar
        max-h-[70vh]
        min-h-[200px]
        resize-y
        flex
        flex-col
        gap-2
        mb-3
    "
            >


                {messages.length === 0 ? (

                    <p className="text-gray-400 text-sm">
                        {t('NochKeineNachrichten')}
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
                                                    onClick={() =>
                                                        setOpenedPhotoIndex(
                                                            chatPhotos.findIndex(
                                                                p => p.file_url === attachment.file_url
                                                            )
                                                        )
                                                    }
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

                                    <div className="break-words
                                    whitespace-pre-wrap
                                    ">
                                        {msg.text}
                                    </div>

                                )}

                                <div
                                    className="
        self-end
        mt-1
        text-[11px]
        opacity-60
        flex
        items-center
        gap-1
    "
                                >
  <span>
    {msg.created_at.split("T")[1].slice(0, 5)}
</span>

                                    {msg.sender_id === senderId && (
                                        <span
                                            className={
                                                msg.is_read
                                                    ? "text-blue-400 font-bold"
                                                    : "text-gray-500"
                                            }
                                        >
            {msg.is_read ? "✓✓" : "✓"}
        </span>
                                    )}
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
                        files
                            .slice(0, 5)
                            .map(file => ({
                                file,
                                preview: URL.createObjectURL(file),
                            }))
                    )

                }}
            />

            <div className="w-full flex items-center gap-2">


                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="
        px-4
        rounded-xl
        bg-white/10
        text-white
        text-xl
        shrink-0
    "
                >
                    📎
                </button>

                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleMessageChange}
                    rows={1}
                    maxLength={400}
                    placeholder={t("Nachricht")}
                    className="
        flex-1
        bg-black/40
        text-white
        p-3
        rounded-xl
        border
        border-white/10
        outline-none
        resize-none
        overflow-y-auto custom-scrollbar
    "
                />

                <button
                    onClick={handleSend}
                    disabled={isSending}
                    className={`
        px-4
        rounded-xl
        font-bold
        shrink-0
        ${
                        isSending
                            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                            : "bg-cyan-400 text-black"
                    }
    `}
                >
                    {isSending ? "..." : "→"}
                </button>

            </div>
            {selectedPhotos.length > 0 && (

                <div className="flex gap-2 mt-3 flex-wrap">

                    {selectedPhotos.map((photo, index) => (

                        <div
                            key={index}
                            className="relative"
                        >

                            <img
                                src={photo.preview}
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

                            <button
                                onClick={() => removePhoto(index)}
                                className="
                absolute
                -top-2
                -right-2
                w-6
                h-6
                rounded-full
                bg-gray-500
                text-white
                text-xs
                flex
                items-center
                justify-center
                shadow-lg
            "
                            >
                                ✕
                            </button>

                        </div>

                    ))}

                </div>

            )}
            <div className="text-right text-xs text-gray-500 mt-1">
                {message.length}/400
            </div>

            {openedPhotoIndex !== null && (

                <div
                    onClick={() => setOpenedPhotoIndex(null)}
                    className="
            fixed
            inset-0
            bg-black/90
            z-50
            flex
            items-center
            justify-center
            p-4
        "
                >

                    {/* Закрыть */}

                    <button
                        onClick={() => setOpenedPhotoIndex(null)}
                        className="
                absolute
                top-4
                right-4
                w-10
                h-10
                rounded-full
                bg-black/40
                backdrop-blur-sm
                text-white
                text-2xl
                z-50
            "
                    >
                        ✕
                    </button>

                    {/* Предыдущая */}

                    {openedPhotoIndex > 0 && (

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handlePrevPhoto()
                            }}
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
                    text-3xl
                    hover:bg-black/70
                    transition
                    z-50
                "
                        >
                            ‹
                        </button>

                    )}

                    {/* Следующая */}

                    {openedPhotoIndex < chatPhotos.length - 1 && (

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleNextPhoto()
                            }}
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
                    text-3xl
                    hover:bg-black/70
                    transition
                    z-50
                "
                        >
                            ›
                        </button>

                    )}

                    {/* Фото */}

                    <img
                        src={chatPhotos[openedPhotoIndex]?.file_url}
                        alt=""
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        className="
                max-w-full
                max-h-full
                rounded-2xl
            "
                    />

                    {/* Индикатор */}

                    <div
                        className="
                absolute
                bottom-5
                left-1/2
                -translate-x-1/2
                text-white
                text-sm
                bg-black/40
                px-3
                py-1
                rounded-full
            "
                    >
                        {openedPhotoIndex + 1} / {chatPhotos.length}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Chat