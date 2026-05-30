import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function MyAdsPage() {
    const navigate = useNavigate()

    const user = useSelector((state) => state.user)
    const allWerbungen = useSelector((state) => state.werbung.werbungen)

    const myAds = allWerbungen.filter(
        (item) => item.ownerId === user.id
    )

    return (
        <div className="px-4 py-6">

            <h1 className="text-3xl text-white font-bold text-center mb-6">
                Meine Anzeigen
            </h1>
            {myAds.length === 0 ? (
                <p className="text-center text-gray-400">
                    Du hast noch keine Anzeigen erstellt
                </p>
            ) : (
                <div className="max-w-xl mx-auto flex flex-col gap-4">
                    {myAds.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-md"
                        >
                            <h2 className="text-gray-300 font-bold text-lg mb-2">
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
                  shadow-lg shadow-cyan-400/30
                  active:scale-95 transition
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

            export default MyAdsPage