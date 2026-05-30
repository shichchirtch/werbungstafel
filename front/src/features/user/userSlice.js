import { createSlice } from '@reduxjs/toolkit'

const savedUser = JSON.parse(localStorage.getItem('user'))

const initialState = savedUser || {
    id: 'user_1',
    name: 'Ivan',
    isAuth: true,
    avatar: null,
    bio: '',
    location: '',
    role: 'admin'
}
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action) {
            state.id = action.payload.id
            state.name = action.payload.name
            state.isAuth = true
        },

        logout(state) {
            state.id = null
            state.name = null
            state.isAuth = false
        },

        updateProfile(state, action) {
            state.name = action.payload.name
            state.bio = action.payload.bio
            state.location = action.payload.location
            state.avatar = action.payload.avatar

            localStorage.setItem('user', JSON.stringify(state))
        }
    },
})

export const { setUser, logout, updateProfile } = userSlice.actions
export default userSlice.reducer