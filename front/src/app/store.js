import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../features/user/userSlice'
import werbungReducer from '../features/werbung/werbungSlice'
import messagesReducer from '../features/messages/messagesSlice'
import favoritesReducer from "../features/favorites/favoritesSlice.jsx";



export const store = configureStore({
    reducer: {
        user: userReducer,
        werbung: werbungReducer,
        messages: messagesReducer,
        favorites: favoritesReducer,
    },
})

