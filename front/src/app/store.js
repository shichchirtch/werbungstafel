import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../features/user/userSlice'
import messagesReducer from '../features/messages/messagesSlice'



export const store = configureStore({
    reducer: {
        user: userReducer,
        messages: messagesReducer
    },
})

