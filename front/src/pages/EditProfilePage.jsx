import {useState, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'

function EditProfilePage() {

    const user = useSelector((state) => state.user)
    const telegram_id = user.id
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [name, setName] = useState(user.name || '')
    const [bio, setBio] = useState(user.bio || '')
    const [location, setLocation] = useState(user.location || '')

    useEffect(() => {

        async function loadProfile() {

            const response = await fetch(
                `/api/profile/${user.id}`
            )

            const data = await response.json()

            if (!data.ok) {
                return
            }
            setProfile(data)
            setBio(data.bio)
            setLocation(data.location)

        }

        loadProfile()
    }, [user.id])

    if (!profile) {
        return (
            <div className="text-white text-center py-6">
                Profil wird geladen...
            </div>
        )
    }

    const handleSubmit = async (e) => {

        e.preventDefault()

        try {

            const response = await fetch(
                `/api/profile/${user.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },

                    body: JSON.stringify({telegram_id,  bio, location}),
                }

            )
            if (!response.ok) {
                return
            }
            const data = await response.json()
            if (!data.ok) {
                alert(data.error)
                return
            }
            navigate('/profile')
        } catch (err) {
            console.error(err)

        }
    }

    return (
        <div className="px-4 py-6">

            <div className="max-w-xl mx-auto flex flex-col gap-4">

                <h1 className="text-2xl text-gray-500 text-center font-bold">
                    Profil bearbeiten
                </h1>

                {/* AVATAR */}
                <div className="flex flex-col items-center gap-3">

                    <div className="
                        w-24 h-24 rounded-full overflow-hidden
                        bg-gray-700 flex items-center justify-center
                    ">
                        {profile.avatar ? (
                            <img
                                src={profile.avatar}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-white text-2xl">
                                {name?.[0]}
                            </span>
                        )}
                    </div>


                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >

                    <input
                        value={name}
                        readOnly
                        onChange={(e) => setName(e.target.value)}
                        className="bg-black/40 text-gray-400 p-3 rounded-xl"
                        placeholder="Name"
                    />

                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="bg-black/40 text-gray-400 p-3 rounded-xl"
                        placeholder="Über mich"
                    />

                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="bg-black/40 text-gray-400 p-3 rounded-xl"
                        placeholder="Ort"
                    />

                    <button
                        type="submit"
                        className="
                            py-3 rounded-2xl font-bold text-black
                            bg-gradient-to-br from-cyan-300 to-blue-500
                        "
                    >
                        Speichern
                    </button>
                </form>
            </div>
        </div>
    )
}

export default EditProfilePage