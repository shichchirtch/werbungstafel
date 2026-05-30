import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile } from '../features/user/userSlice'
import { useNavigate } from 'react-router-dom'

function EditProfilePage() {

    const user = useSelector((state) => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [name, setName] = useState(user.name || '')
    const [bio, setBio] = useState(user.bio || '')
    const [location, setLocation] = useState(user.location || '')
    const [avatar, setAvatar] = useState(user.avatar || null)

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]

        if (!file) return

        const preview = URL.createObjectURL(file)

        setAvatar(preview)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        dispatch(updateProfile({
            name,
            bio,
            location,
            avatar
        }))

        navigate('/profile')
    }

    return (
        <div className="px-4 py-6">

            <div className="max-w-xl mx-auto flex flex-col gap-4">

                <h1 className="text-2xl text-white text-center font-bold">
                    Profil bearbeiten
                </h1>

                {/* AVATAR */}
                <div className="flex flex-col items-center gap-3">

                    <div className="
                        w-24 h-24 rounded-full overflow-hidden
                        bg-gray-700 flex items-center justify-center
                    ">
                        {avatar ? (
                            <img
                                src={avatar}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-white text-2xl">
                                {name?.[0]}
                            </span>
                        )}
                    </div>

                    <label className="
                        text-cyan-300 cursor-pointer text-sm
                    ">
                        Foto ändern
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </label>

                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >

                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-black/40 text-white p-3 rounded-xl"
                        placeholder="Name"
                    />

                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="bg-black/40 text-white p-3 rounded-xl"
                        placeholder="Über mich"
                    />

                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="bg-black/40 text-white p-3 rounded-xl"
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