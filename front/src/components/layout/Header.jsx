import {useNavigate, useLocation} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {setUser, logout} from '../../features/user/userSlice'
import {useState, useRef, useEffect} from 'react'


function Header() {

    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const [showLoginModal, setShowLoginModal] = useState(false)
    const [loginToken, setLoginToken] = useState(null)

    const user = useSelector((state) => state.user)
    // новая модалка со смартфоном
    const [showCodeModal, setShowCodeModal] = useState(false)

    // код, который показываем пользователю
    const [codeToken, setCodeToken] = useState(null)

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
    // обработака интервала на залогиненость

    useEffect(() => {

        if (!loginToken) return
        console.log("CHECK LOGIN =", loginToken)

        const interval = setInterval(async () => {

            const response = await fetch(
                `/api/login-status/${loginToken}`
            )

            const data = await response.json()
            console.log("LOGIN STATUS =", data)
            if (data.confirmed) {

                clearInterval(interval)

                dispatch(
                    setUser({
                        id: data.telegram_id,
                        name: data.first_name,
                    })
                )

                setShowLoginModal(false)
                setShowCodeModal(false)
                setCodeToken(null)
                setLoginToken(null)
                setShowMenu(false)
                console.log("LOGIN SUCCESS")
            }

        }, 2000)

        return () => clearInterval(interval)

    }, [loginToken, dispatch])


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

                            onClick={() => setShowLoginModal(true)}

                            className="
            px-4 py-2 rounded-xl
            font-semibold text-sm text-gray-300
            bg-gradient-to-br
            from-gray-700 to-gray-900
            shadow-lg shadow-gray-500/20
            active:scale-95 transition
        "
                        >
                            📲 Telegram Login
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
                                        onClick={async () => {

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

            {showLoginModal && (
                <div className="
        fixed inset-0
        bg-black/70
        flex items-center justify-center
        z-50
    "
                     onClick={() => setShowLoginModal(false)}

                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="
                w-full max-w-md
                mx-4
                bg-zinc-900
                rounded-3xl
                p-6
                border border-white/10
            "
                    >
                        <h2 className="text-xl font-bold text-white mb-4">
                            Anmeldung erforderlich
                        </h2>

                        <p className="text-gray-300 mb-6">
                            Um Anzeigen zu veröffentlichen und Nachrichten
                            zu senden, melden Sie sich bitte über Telegram an.
                        </p>
                        <div className="space-y-3">
                            <div className="flex gap-3">

                                    <button
                                        className="
    flex-1
    py-3
    rounded-2xl
    bg-green-600
    text-white
    font-bold
"
                                        onClick={async () => {

                                            const response =
                                                await fetch('/api/login')

                                            const data =
                                                await response.json()

                                            setLoginToken(data.token)

                                            setCodeToken(data.token)

                                            setShowLoginModal(false)

                                            setShowCodeModal(true)
                                        }}
                                    >
                                        📱 Smartphone
                                    </button>
                                    <button
                                        onClick={() => setShowLoginModal(false)}
                                        className="
                        flex-1 py-3 rounded-2xl
                        bg-white/10 text-white
                    "
                                    >
                                        Schließen
                                    </button>
                                </div>

                                <button
                                    onClick={async () => {

                                        const response =
                                            await fetch('/api/login')

                                        const data =
                                            await response.json()

                                        setLoginToken(data.token)

                                        window.open(
                                            data.telegram_url,
                                            '_blank'
                                        )
                                    }}
                                    className="
                        flex-1 py-3 rounded-2xl
                        bg-blue-500 text-white
                        font-bold
                    "
                                >
                                    📲 Telegram öffnen
                                </button>

                            </div>
                        </div>
                    </div>

            )}

            {showCodeModal && (

                <div className="
        fixed inset-0
        bg-black/70
        flex items-center justify-center
        z-[60]
    ">

                    <div className="
            bg-zinc-900
            rounded-3xl
            p-6
            max-w-sm
            mx-4
        ">

                        <h2 className="
                text-xl font-bold text-white mb-4
            ">
                            Anmeldung per Smartphone
                        </h2>

                        <p className="
                text-gray-300 mb-4
            ">
                            Öffnen Sie Telegram auf Ihrem Smartphone,
                            senden Sie dem Bot den Befehl:
                        </p>

                        <p className="text-xs text-gray-500 mt-4 text-center">
    Der Code ist nur wenige Minuten gültig.
</p>

                        <div className="
    text-center
    text-4xl
    font-bold
    text-cyan-300
    mb-2
    tracking-[0.3em]
">
                            {codeToken}
                        </div>

                        <p className="
    text-center
    text-gray-400
    mb-6
">
                            Senden Sie dem Bot:

                            <br/>

                            <span className="font-semibold text-white">
        /login {codeToken}
    </span>
                        </p>

                        <button
                            onClick={() => {
                                setShowCodeModal(false)

                            }}
                            className="
                    w-full py-3
                    rounded-2xl
                    bg-blue-500
                    text-white
                "
                        >
                            OK
                        </button>

                    </div>

                </div>
            )}

        </div>


    )
}


export default Header