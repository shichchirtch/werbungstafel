import { Outlet } from 'react-router-dom'
import Header from './Header'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { setUser } from '../../features/user/userSlice'

function Layout() {

    const dispatch = useDispatch()

    const wa = window.Telegram?.WebApp
    const tgUser = wa?.initDataUnsafe?.user

    console.log('User = ', tgUser)

    useEffect(() => {

        if (!wa || !tgUser) return

        wa.ready()
        wa.expand()

        wa.setHeaderColor('#18181b')
        wa.setBackgroundColor('#18181b')

        async function initUser() {

            try {

                const response = await fetch(
                    '/api/auth/telegram',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },

                        body: JSON.stringify({
                            telegram_id: tgUser.id,
                            first_name: tgUser.first_name,
                            username: tgUser.username,
                        }),
                    }
                )

                const user = await response.json()

                dispatch(
                    setUser({
                        id: user.telegram_id,
                        name: user.first_name,
                        isAuth: true,
                    })
                )

            } catch (error) {
                console.error(error)
            }
        }

        initUser()

    }, [dispatch, tgUser, wa])

    return (
        <div className="
            min-h-screen
            bg-gradient-to-b
            from-zinc-900
            to-black
            px-4 py-4
        ">

            <div className="max-w-xl mx-auto">

                <Header />

                <Outlet />

            </div>

        </div>
    )
}

export default Layout