import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import { useState, useEffect} from "react";


function MyFavoritesPage() {

    const navigate = useNavigate()

    const user = useSelector((state) => state.user)

    const [favorites, setFavorites] = useState([])

    useEffect(() => {

        async function loadFavorites() {

            const response = await fetch(
                `/api/favorites/${user.id}`
            )

            const data = await response.json()

            console.log("FAVORITES =", data)

            setFavorites(data)
        }

        if (user.isAuth) {
            loadFavorites()
        }

    }, [user.id, user.isAuth])

    return (

        <div className="px-4 py-6">

            <h1 className="text-3xl text-white font-bold text-center mb-6">
                Merkliste
            </h1>

            {favorites.length === 0 ? (

                <p className="text-center text-gray-400">
                    Deine Merkliste ist leer
                </p>

            ) : (

                <div className="max-w-xl mx-auto flex flex-col gap-4">

                    {favorites.map((item) => (

                        <div
                            key={item.id}
                            className="
                                bg-white/5
                                border border-white/10
                                rounded-3xl
                                p-4
                                backdrop-blur-md
                            "
                        >

                            <h2 className="text-gray-300 font-bold text-lg mb-2">
                                {item.title}
                            </h2>

                            <p className="text-gray-400 text-sm mb-2">
                                PLZ: {item.plz}
                            </p>

                            <button
                                onClick={() =>
                                    navigate(`/ad/${item.id}`)
                                }
                                className="
                                    w-full py-3 rounded-2xl
                                    font-bold text-black
                                    bg-gradient-to-br
                                    from-cyan-300
                                    to-blue-500
                                    shadow-lg
                                    shadow-cyan-400/30
                                    active:scale-95
                                    transition
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

export default MyFavoritesPage