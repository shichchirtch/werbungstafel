import { useDispatch, useSelector } from 'react-redux'
import { setUser, logout } from '../../features/user/userSlice'

function AuthButton() {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.user)

    return (
        <>
            {!user.isAuth ? (
                <button
                    onClick={() =>
                        dispatch(setUser({ id: 'user_1', name: 'Ivan' }))
                    }
                    className="
                        px-4 py-2 rounded-xl text-gray-400
                        bg-gradient-to-br from-gray-600 to-gray-800
                        shadow-lg shadow-gray-500/20
                        hover:scale-105 transition
                    "
                >
                    Login
                </button>
            ) : (
                <button
                    onClick={() => dispatch(logout())}
                    className="
                        px-4 py-2 rounded-xl text-gray-500
                        bg-gradient-to-br from-gray-600 to-gray-800
                        shadow-lg shadow-gray-500/20
                        hover:scale-105 transition
                    "
                >
                    Logout
                </button>
            )}
        </>
    )
}

export default AuthButton