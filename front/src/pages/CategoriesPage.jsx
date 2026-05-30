import { useNavigate } from 'react-router-dom'
import ButtonZuruck from "../components/common/ButtonZuruck.jsx";
import HomeButton from "../components/common/HomeButton.jsx";

function CategoriesPage() {
    const navigate = useNavigate()

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

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-black px-4 py-6">

            <h1
                className="text-4xl font-black text-center mb-6 text-black"
                style={{
                    WebkitTextStroke: '0.5px white',
                    textShadow: '0 0 8px rgba(255,255,255,0.6)',
                }}
            >
                Dienstleistungen
            </h1>
            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">

                {categories.map((item) => (
                    <button
                        key={item.slug}
                        onClick={() => navigate(`/category/${item.slug}`)}
                        className="
              p-4 rounded-2xl text-gray-300 font-semibold text-base md:text-lg
              bg-gradient-to-br from-cyan-500 to-pink-700
              hover:scale-105 transition duration-200
              shadow-lg shadow-cyan-500/20
              min-h-[90px]
            "
                    >
                        {item.title}
                    </button>
                ))}

            </div>

        </div>
    )
}

export default CategoriesPage