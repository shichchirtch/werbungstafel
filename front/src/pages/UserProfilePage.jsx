import {useEffect, useState} from "react"
import {useNavigate, useParams} from "react-router-dom"
import {useSelector} from "react-redux"

function UserProfilePage() {

    const {userId} = useParams()

    const user = useSelector((state) => state.user)

    const navigate = useNavigate()

    const [profile, setProfile] = useState(null)

    useEffect(() => {

        async function loadProfile() {

            const response = await fetch(
                `/api/user-profile/${userId}`
            )

            if (!response.ok) {
                return
            }

            const data = await response.json()

            if (!data.ok) {
                return
            }

            setProfile(data)

        }

        loadProfile()

    }, [userId])

    const handleBanUser = async () => {

        const response = await fetch(
            `/api/users/${profile.id}/ban`,
            {
                method: "PUT",
            }
        )

        const data = await response.json()

        if (!data.ok) {
            alert(data.error)
            return
        }

        setProfile(prev => ({
            ...prev,
            is_banned: data.is_banned,
        }))

    }

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

                <div
                    className="
                        bg-white/5
                        border border-white/10
                        rounded-3xl
                        p-6
                        backdrop-blur-md
                        flex
                        flex-col
                        items-center
                        text-center
                    "
                >

                    <div
                        className="
                            w-24
                            h-24
                            rounded-full
                            shadow-[0_0_20px_rgba(34,211,238,0.5),0_0_35px_rgba(236,72,153,0.5)]
                        "
                    >

                        <div
                            className="
                                w-full
                                h-full
                                rounded-full
                                overflow-hidden
                                border-4 border-white/10
                                bg-black/40
                                flex
                                items-center
                                justify-center
                            "
                        >

                            {profile.avatar ? (

                                <img
                                    src={profile.avatar}
                                    alt={profile.name}
                                    className="w-full h-full object-cover"
                                />

                            ) : (

                                <span className="text-white text-2xl">
                                    {profile.name?.[0]}
                                </span>

                            )}

                        </div>

                    </div>

                    <h1 className="text-2xl font-bold text-slate-200 mt-4 mb-2">
                        {profile.name}
                    </h1>

                    <p className="text-gray-400 mb-3">
                        {profile.bio || "Noch keine Beschreibung"}
                    </p>

                    <p className="text-cyan-300 text-sm">
                        📍 {profile.location || "Deutschland"}
                    </p>

                    <p className="text-gray-500 text-sm mt-2">
                        🗓 Auf Werbungstafel seit {profile.first_start}
                    </p>

                </div>

                <div
                    className="
                        bg-white/5
                        border border-white/10
                        rounded-3xl
                        p-4
                        backdrop-blur-md
                        flex
                        justify-around
                        text-center
                    "
                >

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

                <button
                    onClick={() => navigate(-1)}
                    className="
                        py-3
                        rounded-2xl
                        font-bold
                        text-black
                        bg-gradient-to-br
                        from-cyan-300
                        to-blue-500
                    "
                >
                    ← Zurück
                </button>

                {user.role === "admin" && (

                    <button
                        onClick={handleBanUser}
                        className="
                            py-3
                            rounded-2xl
                            font-bold
                            text-white
                            bg-gradient-to-br
                            from-red-500
                            to-red-700
                        "
                    >

                        {profile.is_banned
                            ? "✅ Benutzer entsperren"
                            : "🚫 Benutzer sperren"
                        }

                    </button>

                )}

            </div>

        </div>

    )

}

export default UserProfilePage