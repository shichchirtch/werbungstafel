import {useSelector, useDispatch} from 'react-redux'
import {logout} from '../features/user/userSlice'
import {useNavigate} from 'react-router-dom'
import {useState, useEffect} from 'react'

function ProfilePage() {

    const user = useSelector((state) => state.user)
    const [profile, setProfile] = useState(null)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {

        async function loadProfile() {

            const response = await fetch(
                `/api/profile/${user.id}`
            )

            if (!response.ok) {
                return
            }

            const data = await response.json()

            if (!data.ok) {
                return
            }

            console.log("PROFILE =", data)

            setProfile(data)

        }

        loadProfile()

    }, [user.id])

    if (!profile) {

        return (

            <div className="px-4 py-6 text-center text-white">

                Profil wird geladen...

            </div>

        )

    }


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
                    <div
                        className="
        w-24 h-24
        rounded-full
        shadow-[0_0_20px_rgba(34,211,238,0.5),0_0_35px_rgba(236,72,153,0.5)]
        hover:scale-105
        transition
    "
                    >

                        <div
                            className="
            w-full h-full
            rounded-full
            overflow-hidden
            border-4 border-white/10
            bg-black/40
            flex items-center justify-center
        "
                        >

                            {profile.avatar ? (

                                <img
                                    src={profile.avatar}
                                    alt={profile.name}
                                    className="
                    w-full h-full
                    object-cover
                "
                                />

                            ) : (

                                <span className="text-white text-2xl">
                {profile.name?.[0]}
            </span>

                            )}

                        </div>

                    </div>
                    {/* NAME */}
                    <h1 className="text-2xl font-bold text-slate-200 mb-2">
                        {profile.name}
                    </h1>

                    {/* DESCRIPTION */}
                    <p className="text-gray-400 mb-3">
                        {profile.bio || 'Noch keine Beschreibung'}
                    </p>

                    {/* LOCATION */}
                    <p className="text-cyan-300 text-sm">
                        📍 {profile.location || 'Deutschland'}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        🗓 Auf Werbungstafel seit {profile.first_start}
                    </p>

                </div>

                {/* STATS */}
                <div className="
                    bg-white/5 border border-white/10
                    rounded-3xl p-4 backdrop-blur-md
                    flex justify-around text-center
                ">

                    <div>
                        <p className="text-xl font-bold text-gray-300">
                            {profile.ads_count}
                        </p>
                        <p className="text-gray-400 text-sm">
                            Anzeigen
                        </p>
                    </div>

                    <div>
                        <p className="text-xl font-bold text-gray-300">
                            {profile.favorites_count}
                        </p>
                        <p className="text-gray-400 text-sm">
                            Favoriten
                        </p>
                    </div>

                </div>

                {/* ACTIONS */}
                <button onClick={() => navigate('/edit-profile')}
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
                        py-3 rounded-2xl font-bold text-slate-400
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