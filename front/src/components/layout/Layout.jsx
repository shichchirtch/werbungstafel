import { Outlet } from 'react-router-dom'
import Header from "./Header.jsx";

function Layout() {
    return (
        <div className="
            min-h-screen
            bg-gradient-to-b from-zinc-900 to-black
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