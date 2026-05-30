import { useNavigate } from 'react-router-dom'

function BackButton() {
    const navigate = useNavigate()

    const goBack = () => {
        if (window.history.length > 1) {
            navigate(-1)
        } else {
            // если мы на странице объявления
            if (location.pathname.startsWith('/ad/')) {
                // можно вернуть в категории (но тут нужен slug → позже улучшим)
                navigate('/categories')
            } else {
                navigate('/categories')
            }
        }

    }

    return (
        <button
            onClick={goBack}
            className="
                px-4 py-2 rounded-xl
font-semibold text-sm
bg-gradient-to-br from-cyan-300 via-cyan-400 to-blue-500
shadow-lg shadow-cyan-400/30
active:scale-95 transition
            "
        >
            ← Zurück
        </button>
    )
}

export default BackButton



