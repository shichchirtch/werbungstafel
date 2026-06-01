import { Outlet } from 'react-router-dom'
import Header from './Header'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { setUser } from '../../features/user/userSlice'

function Layout() {
    console.log("LAYOUT VERSION 777")
    const dispatch = useDispatch()

    const wa = window.Telegram?.WebApp
    const tgUser = wa?.initDataUnsafe?.user

    console.log('WA = ', wa)
    console.log('TG USER = ', tgUser)

    useEffect(() => {

        async function initUser() {

            console.log('INIT USER START')

            try {

                // ==========================
                // Telegram авторизация
                // ==========================
                if (wa && tgUser) {

                    console.log('TELEGRAM BRANCH')

                    wa.ready()
                    wa.expand()

                    wa.setHeaderColor('#18181b')
                    wa.setBackgroundColor('#18181b')

                    const payload = {
                        telegram_id: tgUser.id,
                        first_name: tgUser.first_name,
                        username: tgUser.username,
                    }

                    console.log('SEND TO BACKEND = ', payload)

                    const response = await fetch(
                        '/api/auth/telegram',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify(payload),
                        }
                    )

                    console.log('AUTH STATUS = ', response.status)

                    const user = await response.json()

                    console.log('AUTH RESPONSE = ', user)

                    dispatch(
                        setUser({
                            id: user.telegram_id,
                            name: user.first_name,
                            isAuth: true,
                        })
                    )

                    console.log('USER SAVED TO REDUX')

                    return
                }

                // ==========================
                // Авторизация через cookie
                // ==========================
                console.log('COOKIE BRANCH')

                const response = await fetch(
                    '/api/me',
                    {
                        credentials: 'include'
                    }
                )

                console.log('ME STATUS = ', response.status)

                const user = await response.json()

                console.log('ME RESPONSE = ', user)

                if (user.is_auth) {

                    dispatch(
                        setUser({
                            id: user.telegram_id,
                            name: user.first_name,
                            isAuth: true,
                        })
                    )

                    console.log('USER RESTORED FROM COOKIE')
                }
                else {

                    console.log('COOKIE NOT FOUND')
                }

            }
            catch (error) {

                console.error('INIT ERROR = ', error)
            }
        }

        initUser()

    }, [])

    return (
        <div
            className="
                min-h-screen
                bg-gradient-to-b
                from-zinc-900
                to-black
                px-4 py-4
            "
        >
            <div className="max-w-xl mx-auto">

                <Header />

                <Outlet />

            </div>
        </div>
    )
}

export default Layout



// import { Outlet } from 'react-router-dom'
// import Header from './Header'
//
// import { useEffect } from 'react'
// import { useDispatch } from 'react-redux'
//
// import { setUser } from '../../features/user/userSlice'
//
// function Layout() {
//
//     const dispatch = useDispatch()
//
//     const wa = window.Telegram?.WebApp
//     const tgUser = wa?.initDataUnsafe?.user
//
//     console.log('User = ', tgUser)
//
//     useEffect(() => {
//
//     async function initUser() {
//
//         try {
//
//             // ==========================
//             // Telegram авторизация
//             // ==========================
//             if (wa && tgUser) {
//
//                 wa.ready()
//                 wa.expand()
//
//                 wa.setHeaderColor('#18181b')
//                 wa.setBackgroundColor('#18181b')
//
//                 const response = await fetch(
//                     '/api/auth/telegram',
//                     {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json',
//                         },
//                         credentials: 'include',
//                         body: JSON.stringify({
//                             telegram_id: tgUser.id,
//                             first_name: tgUser.first_name,
//                             username: tgUser.username,
//                         }),
//                     }
//                 )
//
//                 const user = await response.json()
//                 console.log("AUTH RESPONSE =", user)
//
//                 dispatch(
//                     setUser({
//                         id: user.telegram_id,
//                         name: user.first_name,
//                         isAuth: true,
//                     })
//                 )
//
//                 return
//             }
//
//             // ==========================
//             // Обычный браузер
//             // ==========================
//             const response = await fetch(
//                 '/api/me',
//                 {
//                     credentials: 'include'
//                 }
//             )
//
//             const user = await response.json()
//
//             if (user.is_auth) {
//
//                 dispatch(
//                     setUser({
//                         id: user.telegram_id,
//                         name: user.first_name,
//                         isAuth: true,
//                     })
//                 )
//             }
//
//         } catch (error) {
//             console.error(error)
//         }
//     }
//
//     initUser()
//
// }, [dispatch])
//
//     return (
//         <div className="
//             min-h-screen
//             bg-gradient-to-b
//             from-zinc-900
//             to-black
//             px-4 py-4
//         ">
//
//             <div className="max-w-xl mx-auto">
//
//                 <Header />
//
//                 <Outlet />
//
//             </div>
//
//         </div>
//     )
// }
//
// export default Layout