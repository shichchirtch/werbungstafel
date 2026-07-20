import {useNavigate, useParams} from 'react-router-dom'
import {useEffect, useState} from 'react'


function EditAdPage() {
    const {id} = useParams()
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [plz, setPlz] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [photos, setPhotos] = useState([])
    const [werbung, setWerbung] = useState(null)
    const [anbieter, setAnbieter] = useState('')
    const [successModal, setSuccessModal] = useState(false)

    useEffect(() => {
        async function loadAd() {
            const response = await fetch(`/api/ad/${id}`)
            const data = await response.json()
            console.log("EDIT AD =", data)
            setWerbung(data)
        }

        loadAd()
    }, [id])

    useEffect(() => {

        if (!werbung) return
        setTitle(werbung.title)
        setPlz(werbung.plz)
        setDescription(werbung.description)
        setPrice(werbung.price || '')
        setAnbieter(werbung.anbieter)

        setPhotos(
            werbung.photos?.map((photo) => ({

                id: photo.id,
                preview: photo.url,

            })) || []
        )

    }, [werbung])

    if (!werbung) {

        return (

            <div className="px-4 py-6 text-center text-white">
                Anzeige wird geladen...
            </div>

        )

    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch(
                `/api/ad/${werbung.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },

                    body: JSON.stringify({
                        title,
                        plz,
                        description,
                        price,
                        anbieter
                    }),
                }
            )

            if (!response.ok) {
                alert("Serverfehler1")
                return
            }

            const data = await response.json()

            if (!data.ok) {
                alert(data.error || "Fehler")
                return
            }

            const newPhotos = photos.filter(
                (photo) => photo.file
            )

            if (newPhotos.length > 0) {

                const formData = new FormData()

                formData.append(
                    'ad_id',
                    werbung.id
                )

                newPhotos.forEach((photo) => {

                    formData.append(
                        'photos',
                        photo.file
                    )

                })

                const uploadResponse = await fetch(
                    '/api/upload-photo',
                    {
                        method: 'POST',
                        body: formData,
                    }
                )

                if (!uploadResponse.ok) {
                    alert("Serverfehler2")
                    return
                }

                const uploadData =
                    await uploadResponse.json()

                if (!uploadData.ok) {

                    alert(
                        uploadData.error ||
                        'Fehler beim Hochladen'
                    )
                    return
                }

            }

            setWerbung({
                ...werbung,
                title,
                description,
                price,
                plz,
                anbieter
            })
            setSuccessModal(true)
        } catch
            (error) {
            console.error(error)
            alert("Serverfehler3")
        }
    }

    const handlePhotoChange = (e) => {

        const files = Array.from(e.target.files)

        if (photos.length + files.length > 5) {
            alert("Можно загрузить не более 5 фотографий")
            return
        }

        const selectedSize = photos.reduce(
            (sum, photo) => sum + photo.file.size,
            0
        )

        const newSize = files.reduce(
            (sum, file) => sum + file.size,
            0
        )

        if (selectedSize + newSize > 20 * 1024 * 1024) {
            alert("Общий размер фотографий не должен превышать 20 МБ")
            return
        }

        const newPhotos = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }))

        setPhotos((prev) => [...prev, ...newPhotos])
    }

    const removePhoto = async (index) => {

        const photo = photos[index]

        console.log("DELETE PHOTO =", photo)

        try {

            if (!photo.file) {

                const response = await fetch(
                    `/api/photo/${photo.id}`,
                    {
                        method: 'DELETE',
                    }
                )

                const data = await response.json()

                if (!data.ok) {
                    alert(data.error || 'Fehler')
                    return
                }

            }

            setPhotos((prev) =>
                prev.filter((_, i) => i !== index)
            )

        } catch (error) {

            console.error(error)
            alert("Serverfehler")

        }

    }

    return (
        <div className="px-4 py-6">

            <h1
                className="text-3xl font-black text-center mb-6 text-black"
                style={{
                    WebkitTextStroke: '0.5px white',
                    textShadow: '0 0 8px rgba(255,255,255,0.6)',
                }}
            >
                Anzeige bearbeiten
            </h1>

            <form
                onSubmit={handleSubmit}
                className="
                    max-w-xl mx-auto
                    bg-white/5 border border-white/10
                    rounded-3xl p-6
                    backdrop-blur-xl shadow-2xl
                    flex flex-col gap-4
                "
            >
                <div className="flex gap-6 mb-2">

                    <label className="flex items-center gap-2 text-gray-300 cursor-pointer">

                        <input
                            type="radio"
                            name="anbieter"
                            checked={anbieter}
                            onChange={() => setAnbieter(true)}
                            className="w-4 h-4 accent-cyan-400"
                        />

                        <span>Ich biete</span>

                    </label>

                    <label className="flex items-center gap-2 text-gray-300 cursor-pointer">

                        <input
                            type="radio"
                            name="anbieter"
                            checked={!anbieter}
                            onChange={() => setAnbieter(false)}
                            className="w-4 h-4 accent-pink-500"
                        />

                        <span>Ich suche</span>

                    </label>

                </div>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="
                        bg-black/40 text-gray-300
                        p-4 rounded-2xl
                        border border-white/10
                        outline-none
                    "
                />

                <input
                    type="text"
                    value={plz}
                    onChange={(e) => setPlz(e.target.value)}
                    className="
                        bg-black/40 text-gray-300
                        p-4 rounded-2xl
                        border border-white/10
                        outline-none
                    "
                />

                <textarea
                    rows="5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="
                        bg-black/40 text-gray-300
                        p-4 rounded-2xl
                        border border-white/10
                        outline-none resize-none
                    "
                />

                <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="
                        bg-black/40 text-gray-300
                        p-4 rounded-2xl
                        border border-white/10
                        outline-none
                    "
                />

                {/* upload */}

                <label
                    className="
                        bg-black/40 text-gray-400
                        p-4 rounded-2xl
                        border border-white/10
                        cursor-pointer text-center
                    "
                >
                    Fotos hinzufügen

                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                    />
                </label>

                {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">

                        {photos.map((photo, index) => (

                            <div
                                key={index}
                                className="
                                    relative rounded-2xl
                                    overflow-hidden
                                    border border-white/10
                                "
                            >

                                <img
                                    src={photo.preview}
                                    alt="preview"
                                    className="
                                        w-full h-24 object-cover
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="
                                        absolute top-1 right-1
                                        bg-black/70 text-white
                                        w-6 h-6 rounded-full text-sm
                                    "
                                >
                                    ×
                                </button>

                            </div>

                        ))}

                    </div>
                )}

                <button
                    type="submit"
                    className="
                        mt-2 py-4 rounded-2xl
                        font-bold text-black text-lg
                        bg-gradient-to-br
                        from-cyan-300 via-cyan-400 to-blue-500
                        shadow-lg shadow-cyan-400/30
                    "
                >
                    Änderungen speichern
                </button>

            </form>

            {/* SUCCESS MODAL */}

            {successModal && (

                <div className="
                    fixed inset-0 bg-black/70
                    flex items-center justify-center
                    px-4 z-50
                ">

                    <div className="
                        w-full max-w-sm
                        rounded-3xl
                        bg-zinc-900
                        border border-white/10
                        p-6 text-center
                    ">

                        <div className="text-5xl mb-3">
                            ✅
                        </div>

                        <h2 className="
                            text-2xl font-bold
                            text-white mb-3
                        ">
                            Änderungen gespeichert
                        </h2>

                        <button
                            onClick={() =>
                                navigate(`/ad/${werbung.id}`)
                            }
                            className="
                                w-full py-4 rounded-2xl
                                font-bold text-black
                                bg-gradient-to-br
                                from-cyan-300 to-blue-500
                            "
                        >
                            Weiter
                        </button>

                    </div>

                </div>

            )}

        </div>
    )
}

export default EditAdPage