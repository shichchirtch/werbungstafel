import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import HomePage from './pages/HomePage'
import CategoriesPage from "./pages/CategoriesPage.jsx";
import CategoryAdsPage from './pages/CategoryAdsPage'
import CreateAdPage from "./pages/CreateAdPage.jsx";
import AdDetailsPage from "./pages/AdDetailPage.jsx";
import MyAdsPage from './pages/MyAdsPage';
import EditAdPage from "./pages/EditAdPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import EditProfilePage from "./pages/EditProfilePage.jsx";
import MyFavoritesPage from "./pages/MyFavoritePage.jsx";
import NachrichtenPage from "./pages/NachrichtenPage.jsx";
import MapPage from './pages/MapPage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout/>,
        children: [
            {
                index: true,
                element: <HomePage/>,
            },
            {
                path: 'categories',
                element: <CategoriesPage/>,
            },
            {
                path: 'category/:slug',
                element: <CategoryAdsPage/>,
            },
            {
                path: 'create/:slug',
                element: <CreateAdPage/>,
            },
            {
                path: 'ad/:id',
                element: <AdDetailsPage/>,
            },
            {
                path: 'my-ads',
                element: <MyAdsPage/>,
            },
            {
                path: 'edit/:id',
                element: <EditAdPage/>,
            },
            {
                path: 'profile',
                element: <ProfilePage/>,
            },
            {
                path: 'edit-profile',
                element: <EditProfilePage/>,
            },
            {
                path: 'favorites',
                element: <MyFavoritesPage/>,
            },
            {
                path: 'nachrichten',
                element: <NachrichtenPage/>,
            },
            {
                path: 'map',
                element: <MapPage/>,
            },

        ],
    },
])

function App() {
    return <RouterProvider router={router}/>
}

export default App

