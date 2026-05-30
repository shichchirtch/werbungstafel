import { useNavigate } from 'react-router-dom'

function HomeButton() {
    const navigate = useNavigate()

    return (
        <button
            onClick={() => navigate('/')}
            className="
                px-4 py-2 rounded-xl
font-semibold text-sm
bg-gradient-to-br from-cyan-300 via-cyan-400 to-blue-500
shadow-lg shadow-cyan-400/30
active:scale-95 transition
            "
        >
            🏠 Home
        </button>
    )
}

export default HomeButton