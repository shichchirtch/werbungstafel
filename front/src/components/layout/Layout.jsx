import {Outlet, useLocation} from 'react-router-dom'
import Header from './Header'
import {useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {setUser} from '../../features/user/userSlice'


function Layout() {

    const dispatch = useDispatch()

    const location = useLocation()

    const hideHeader =
        location.pathname === '/map'

    const wa = window.Telegram?.WebApp
    const tgUser = wa?.initDataUnsafe?.user

    useEffect(() => {

        async function initUser() {

            try {

                if (!wa || !tgUser) {
                    return
                }

                wa.ready()
                wa.expand()

                wa.setHeaderColor('#18181b')
                wa.setBackgroundColor('#18181b')

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
                            lan: tgUser.language_code,
                        }),
                    }
                )

                const user = await response.json()

                dispatch(
                    setUser({
                        id: user.telegram_id,
                        name: user.first_name,
                        dbId: user.user_id,
                        isAuth: true,
                        isTelegram: true,
                    })
                )

            } catch (error) {

                console.error(error)

            }

        }

        initUser()

    }, [])

    return (

    <div
        className={`
            min-h-screen
            bg-gradient-to-b
            from-zinc-900
            to-black

            ${hideHeader ? "" : "px-4 py-4"}
        `}
    >

        {

            !hideHeader &&

            <Header/>

        }

        <Outlet/>

    </div>

)
}

export default Layout