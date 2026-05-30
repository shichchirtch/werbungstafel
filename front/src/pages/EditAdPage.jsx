import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

import { updateWerbung } from '../features/werbung/werbungSlice'

function EditAdPage() {

    const { id } = useParams()

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const allWerbungen = useSelector(
        (state) => state.werbung.werbungen
    )

    const existing = allWerbungen.find(
        (item) => String(item.id) === id
    )


    const [title, setTitle] = useState('')
    const [plz, setPlz] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [photos, setPhotos] = useState([])

    const [successModal, setSuccessModal] = useState(false)

    // заполняем форму существующими данными
    useEffect(() => {

        if (!existing) return

        setTitle(existing.title)
        setPlz(existing.plz)
        setDescription(existing.description)
        setPrice(existing.price || '')
        setPhotos(
            existing.photos.map((photo) => ({
                preview: photo
            }))
        )

    }, [existing])

    if (!existing) return null

    const handleSubmit = (e) => {

        e.preventDefault()

        const updatedWerbung = {
            ...existing,

            title,
            plz,
            description,
            price,

            photos: photos.map((p) => p.preview),
        }

        dispatch(updateWerbung(updatedWerbung))

        setSuccessModal(true)
    }

    const handlePhotoChange = (e) => {

        const files = Array.from(e.target.files)

        const newPhotos = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }))

        setPhotos((prev) =>
            [...prev, ...newPhotos].slice(0, 5)
        )
    }

    const removePhoto = (index) => {

        setPhotos((prev) =>
            prev.filter((_, i) => i !== index)
        )
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
                                navigate(`/ad/${existing.id}`)
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