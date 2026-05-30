import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/user/userSlice'
import { useNavigate } from 'react-router-dom'

function ProfilePage() {

    const user = useSelector((state) => state.user)
    const werbungen = useSelector((state) => state.werbung.werbungen)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const myAds = werbungen.filter(
        (item) => item.ownerId === user.id
    )

    return (
        <div className="px-4 py-6">

            <div className="max-w-xl mx-auto flex flex-col gap-4">

                {/* PROFILE CARD */}
                <div className="
                    bg-white/5 border border-white/10
                    rounded-3xl p-6 backdrop-blur-md
                    flex flex-col items-center text-center
                ">

                    {/* AVATAR */}
                    <div className="
    w-24 h-24 rounded-full overflow-hidden
    border-4 border-white/10
    flex items-center justify-center
    bg-black/40 hover:scale-105 transition
">

                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-white text-2xl">
            {user.name?.[0]}
        </span>
                        )}

                    </div>

                    {/* NAME */}
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {user.name}
                    </h1>

                    {/* DESCRIPTION */}
                    <p className="text-gray-400 mb-3">
                        {user.bio || 'Noch keine Beschreibung'}
                    </p>

                    {/* LOCATION */}
                    <p className="text-cyan-300 text-sm">
                        📍 Deutschland
                    </p>

                </div>

                {/* STATS */}
                <div className="
                    bg-white/5 border border-white/10
                    rounded-3xl p-4 backdrop-blur-md
                    flex justify-around text-center
                ">

                    <div>
                        <p className="text-xl font-bold text-white">
                            {myAds.length}
                        </p>
                        <p className="text-gray-400 text-sm">
                            Anzeigen
                        </p>
                    </div>

                    <div>
                        <p className="text-xl font-bold text-white">
                            0
                        </p>
                        <p className="text-gray-400 text-sm">
                            Favoriten
                        </p>
                    </div>

                </div>

                {/* ACTIONS */}
                <button  onClick={() => navigate('/edit-profile')}
                    className="
                        py-3 rounded-2xl font-bold text-black
                        bg-gradient-to-br from-cyan-300 to-blue-500
                    "
                >
                    ✏️ Profil bearbeiten
                </button>

                <button
                    onClick={() => dispatch(logout())}
                    className="
                        py-3 rounded-2xl font-bold text-white
                        bg-gradient-to-br from-gray-600 to-gray-800
                    "
                >
                    🚪 Logout
                </button>

            </div>

        </div>
    )
}

export default ProfilePage