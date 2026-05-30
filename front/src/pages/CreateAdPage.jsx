import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {useEffect} from "react";
import { useDispatch, useSelector } from 'react-redux'
import { addWerbung } from '../features/werbung/werbungSlice'


function CreateAdPage() {
    const { slug } = useParams()
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [plz, setPlz] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')

    const [photos, setPhotos] = useState([])

    const [successModal, setSuccessModal] = useState(false)

    const dispatch = useDispatch()
    const user = useSelector((state) => state.user)

    const categoryNames = {
        altenpflege: 'Altenpflege',
        autoservice: 'Autoservice',
        handwerk: 'Handwerk',
        cleaning: 'Cleaning',
        'events-training': 'Events / Training',
        studio: 'Studio',
        'umzug-transport': 'Umzug / Transport',
        'makeup-friseur': 'MakeUp / Friseur',
        babysitting: 'Babysitting',
        'foto-video-kunst': 'Foto / Video / Kunst',
        'it-computer-electronics': 'IT / Computer / Electronics',
        translators: 'Translators',
        rechtsdienstleistungen: 'Rechtsdienstleistungen',
        'physio-spa': 'Physio / Spa',
        haustiere: 'Haustiere',
        weitere: 'Weitere',
    }

    const categoryTitle = categoryNames[slug] || 'Kategorie'

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!title || !plz || !description) {
            alert('Bitte Pflichtfelder ausfüllen')
            return
        }

        const newWerbung = {
            id: Date.now().toString(), // формируем ID  объявления
            ownerId: user.id,
            category: slug,
            title,
            plz,
            description,
            price,
            photos: photos.map((p) => p.preview),
            createdAt: new Date().toISOString(),
        }

        dispatch(addWerbung(newWerbung))

        setSuccessModal(true)
    }

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files)

        const newPhotos = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }))

        setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5))
    }

    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index))
    }

    useEffect(() => {
        if (successModal) {
            const timer = setTimeout(() => {
                navigate(`/category/${slug}`)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [successModal, navigate, slug])

    return (
        <div className="px-4 py-6">

            <h1
                className="text-3xl font-black text-center mb-2 text-black"
                style={{
                    WebkitTextStroke: '0.5px white',
                    textShadow: '0 0 8px rgba(255,255,255,0.6)',
                }}
            >
                Neue Anzeige
            </h1>

            <p className="text-center text-cyan-300 mb-6">
                {categoryTitle}
            </p>

            <form
                onSubmit={handleSubmit}
                className="max-w-xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col gap-4"
            >

                <input
                    type="text"
                    placeholder="Titel der Anzeige"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black/40 text-gray-400 p-4 rounded-2xl outline-none border border-white/10"
                />

                <input
                    type="text"
                    placeholder="PLZ / Ort"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="5"
                    minLength="5"
                    value={plz}
                    onChange={(e) => setPlz(e.target.value)}
                    className="bg-black/40 text-gray-400 p-4 rounded-2xl outline-none border border-white/10"
                />

                <textarea
                    rows="5"
                    placeholder="Beschreibung deiner Dienstleistung"
                    maxLength={2000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-black/40 text-gray-400 p-4 rounded-2xl outline-none border border-white/10 resize-none"
                />
                <div className="text-right text-sm text-gray-400 -mt-2">
                    {description.length}/2000
                </div>

                <input
                    type="text"
                    placeholder="Preisinfo (optional)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-black/40 text-gray-400 p-4 rounded-2xl outline-none border border-white/10"
                />

                {/*<select*/}
                {/*    value={radius}*/}
                {/*    onChange={(e) => setRadius(e.target.value)}*/}
                {/*    className="bg-black/40 text-white p-4 rounded-2xl outline-none border border-white/10"*/}
                {/*>*/}
                {/*    <option>5 km</option>*/}
                {/*    <option>10 km</option>*/}
                {/*    <option>20 km</option>*/}
                {/*    <option>50 km</option>*/}
                {/*    <option>Deutschlandweit</option>*/}
                {/*</select>*/}

                <div className="flex flex-col gap-3">

                    <label className="
        bg-black/40 text-gray-400 p-4 rounded-2xl
        border border-white/10 cursor-pointer text-center
    ">
                        Фото загрузить
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
                                    className="relative rounded-2xl overflow-hidden border border-white/10"
                                >
                                    <img
                                        src={photo.preview}
                                        alt="preview"
                                        className="w-full h-24 object-cover"
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

                    <div className="text-right text-sm text-gray-400">
                        {photos.length}/5 Fotos
                    </div>

                </div>

                <button
                    type="submit"
                    className="
                    mt-2 py-4 rounded-2xl font-bold text-black text-lg
                    bg-gradient-to-br from-cyan-300 via-cyan-400 to-blue-500
                    shadow-lg shadow-cyan-400/30
                    active:scale-95 transition
                    "
                >
                    Anzeige veröffentlichen
                </button>

            </form>
            {successModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">

                    <div
                        className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-white/10 p-6 text-center shadow-2xl">

                        <div className="text-5xl mb-3">✅</div>

                        <h2 className="text-2xl font-bold text-white mb-3">
                            Erfolgreich veröffentlicht
                        </h2>

                        <p className="text-gray-400 mb-6">
                            Deine Anzeige ist jetzt online.
                        </p>

                        <button
                            onClick={() => {
                                setSuccessModal(false)
                                navigate(`/category/${slug}`, {replace: true})
                            }}
                            className="
                    w-full py-4 rounded-2xl font-bold text-black
                    bg-gradient-to-br from-cyan-300 to-blue-500
                    shadow-lg shadow-cyan-400/30
                    active:scale-95 transition
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

export default CreateAdPage