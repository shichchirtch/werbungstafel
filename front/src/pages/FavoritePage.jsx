import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function FavoritesPage() {

    const navigate = useNavigate()

    const favorites = useSelector((state) => state.favorites.favorites)
    const allWerbungen = useSelector((state) => state.werbung.werbungen)

    const favoriteAds = allWerbungen.filter(
        (item) => favorites.includes(item.id)
    )

    return (
        <div className="px-4 py-6">

            <h1 className="text-3xl text-gray-300 text-center font-semibold mb-6">
                Merklist
            </h1>

            {favoriteAds.length === 0 ? (

                <p className="text-center text-gray-400">
                    Noch keine Favoriten
                </p>

            ) : (

                <div className="max-w-xl mx-auto flex flex-col gap-4">

                    {favoriteAds.map((item) => (

                        <div
                            key={item.id}
                            className="
                                bg-white/5 border border-white/10
                                rounded-3xl p-4 backdrop-blur-md
                            "
                        >

                            <h2 className="text-gray-300 font-bold mb-2">
                                {item.title}
                            </h2>

                            <p className="text-gray-400 text-sm mb-2">
                                PLZ: {item.plz}
                            </p>

                            <button
                                onClick={() => navigate(`/ad/${item.id}`)}
                                className="
                                    w-full py-3 rounded-2xl font-bold text-black
                                    bg-gradient-to-br from-cyan-300 to-blue-500
                                "
                            >
                                Öffnen
                            </button>

                        </div>

                    ))}

                </div>

            )}

        </div>
    )
}

export default FavoritesPage