import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setUser, logout} from '../../features/user/userSlice'
import { useState, useRef, useEffect  } from 'react'


function Header() {

    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const user = useSelector((state) => state.user)

    const [showMenu, setShowMenu] = useState(false)

    const isHome = location.pathname === '/'

    const menuRef = useRef()

    useEffect(() => {

        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setShowMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }

    }, [])

    return (

        <div className="
            max-w-xl mx-auto
            flex items-center justify-between
            mb-4
        ">

            {/* LEFT */}

            <div className="flex gap-2">

                {!isHome && (

                    <button
                        onClick={() => navigate(-1)}
                        className="
                            px-4 py-2 rounded-xl
                            font-semibold text-sm text-black
                            bg-gradient-to-br
                            from-cyan-300 via-cyan-400 to-blue-500
                            shadow-lg shadow-cyan-400/30
                        "
                    >
                        ←
                    </button>

                )}

                <button
                    onClick={() => navigate('/')}
                    className="
                        px-4 py-2 rounded-xl
                        font-semibold text-sm text-black
                        bg-gradient-to-br
                        from-cyan-300 via-cyan-400 to-blue-500
                        shadow-lg shadow-cyan-400/30
                    "
                >
                    🏠
                </button>

            </div>

            {/* RIGHT */}
            <div ref={menuRef} className="relative">
                <div className="relative">

                    {!user.isAuth ? (

                        <button
                            onClick={() =>
                                dispatch(
                                    setUser({
                                        id: 'user_1',
                                        name: 'Ivan',
                                    })
                                )
                            }
                            className="
                px-4 py-2 rounded-xl
                font-semibold text-sm text-gray-300
                bg-gradient-to-br
                from-gray-700 to-gray-900
                shadow-lg shadow-gray-500/20
                active:scale-95 transition
            "
                        >
                            Login
                        </button>

                    ) : (

                        <>
                            <button
                                onClick={() =>
                                    setShowMenu((prev) => !prev)
                                }
                                className="
                    px-4 py-2 rounded-xl
                    font-semibold text-sm text-white
                    bg-gradient-to-br
                    from-purple-500 to-indigo-600
                    shadow-lg shadow-purple-500/30
                    active:scale-95 transition
                "
                            >
                                👤 {user.name}
                            </button>

                            {showMenu && (

                                <div className="
                    absolute right-0 mt-2 w-56
                    bg-zinc-900 border border-white/10
                    rounded-2xl overflow-hidden
                    shadow-2xl z-50
                ">
                                    <button
                                        onClick={() => {
                                            navigate('/profile')
                                            setShowMenu(false)
                                        }}
                                        className="
                                w-full text-left px-4 py-3
                                text-gray-300
                                hover:bg-white/5
                            "
                                    >
                                        👤 Profil
                                    </button>

                                    <button
                                        onClick={() => {
                                            navigate('/my-ads')
                                            setShowMenu(false)
                                        }}
                                        className="
                            w-full text-left px-4 py-3
                            text-gray-300
                            hover:bg-white/5
                        "
                                    >
                                        📦 Meine Anzeigen
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate('/favorites')
                                            setShowMenu(false)
                                        }}
                                        className="
                                w-full text-left px-4 py-3
                                text-gray-300
                                hover:bg-white/5
                            "
                                    >
                                        ❤️ Merklist
                                    </button>

                                    <button
                                        onClick={() => {
                                            navigate('/messages')
                                            setShowMenu(false)
                                        }}
                                        className="
                                w-full text-left px-4 py-3
                                text-gray-300
                                hover:bg-white/5
                            "
                                    >
                                        💬 Nachrichten
                                    </button>
                                    <button
                                        onClick={() => {
                                            dispatch(logout())
                                            setShowMenu(false)
                                        }}
                                        className="
                            w-full text-left px-4 py-3
                            text-red-400
                            hover:bg-red-500/10
                        "
                                    >
                                        🚪 Logout
                                    </button>

                                </div>

                            )}

                        </>

                    )}

                </div>
            </div>

            </div>
            )
            }

            export default Header