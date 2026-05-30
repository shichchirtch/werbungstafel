import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'



function HomePage() {
    const name = useSelector((state) => state.user.name)
    const navigate = useNavigate()

    const [showModal, setShowModal] = useState(false)

    const categories = [
        { title: 'Altenpflege', slug: 'altenpflege' },
        { title: 'Autoservice', slug: 'autoservice' },
        { title: 'Handwerk', slug: 'handwerk' },
        { title: 'Cleaning', slug: 'cleaning' },
        { title: 'Events / Training', slug: 'events-training' },
        { title: 'Studio', slug: 'studio' },
        { title: 'Umzug / Transport', slug: 'umzug-transport' },
        { title: 'MakeUp / Friseur', slug: 'makeup-friseur' },
        { title: 'Babysitting', slug: 'babysitting' },
        { title: 'Foto / Video / Kunst', slug: 'foto-video-kunst' },
        { title: 'IT / Computer / Electronics', slug: 'it-computer-electronics' },
        { title: 'Translators', slug: 'translators' },
        { title: 'Rechtsdienstleistungen', slug: 'rechtsdienstleistungen' },
        { title: 'Physio / Spa', slug: 'physio-spa' },
        { title: 'Haustiere', slug: 'haustiere' },
        { title: 'Weitere', slug: 'weitere' },
    ]

    const handleCategoryClick = (slug) => {
        setShowModal(false)
        navigate(`/create/${slug}`)
    }

    return (
        <div className="min-h-[calc(100vh-80px)]
    flex items-center justify-center">
            <div
                className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">

                <h1
                    className="text-4xl font-black text-center mb-4 text-black"
                    style={{
                        WebkitTextStroke: '0.5px white',
                        textShadow: '0 0 10px rgba(255,255,255,0.6)',
                    }}
                >
                    Привет, {name}
                </h1>

                <p className="text-gray-400 text-center mb-8">
                    Найди услугу рядом с собой
                </p>

                <div className="flex flex-col gap-4">

                    <button
                        onClick={() => setShowModal(true)}
                        className="
                        py-4 rounded-2xl font-bold text-black text-lg
                        bg-gradient-to-br from-cyan-300 via-cyan-400 to-blue-500
                        transition duration-200
                        shadow-lg shadow-cyan-400/40 active:scale-95
                        "
                    >
                        Подать объявление
                    </button>

                    <button
                        onClick={() => navigate('/categories')}
                        className="
                        py-4 rounded-2xl font-bold text-white text-lg
                        bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600
                        transition duration-200
                        shadow-lg shadow-pink-500/40 active:scale-95
                        "
                    >
                        Поиск объявлений
                    </button>

                </div>

            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 z-50">

                    <div
                        className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">

                        <div className="relative mb-5">

                            <h2
                                className="text-3xl font-black text-black text-center"
                                style={{
                                    WebkitTextStroke: '0.4px white',
                                    textShadow: '0 0 8px rgba(255,255,255,0.6)',
                                }}
                            >
                                Kategorie wählen
                            </h2>

                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute right-0 top-0 text-gray-600 text-2xl font-bold"
                            >
                                ×
                            </button>

                        </div>

                        <div className="grid grid-cols-2 gap-3">

                            {categories.map((item) => (
                                <button
                                    key={item.slug}
                                    onClick={() => handleCategoryClick(item.slug)}
                                    className="
                                    min-h-[80px] rounded-2xl px-3 py-3
                                    text-gray-300 font-semibold text-base md:text-lg leading-tight
                                    bg-gradient-to-br from-cyan-400 via-cyan-600 to-blue-800
                                    shadow-lg shadow-cyan-400/30
                                    active:scale-95 transition
                                    "
                                >
                                    {item.title}
                                </button>
                            ))}

                        </div>

                    </div>

                </div>
            )}

        </div>
    )
}

export default HomePage