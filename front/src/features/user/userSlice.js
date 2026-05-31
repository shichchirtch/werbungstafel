import { createSlice } from '@reduxjs/toolkit'

const savedUser = JSON.parse(localStorage.getItem('user'))

const initialState = savedUser || {
    id: null,
    name: '',
    isAuth: false,
    avatar: null,
    bio: '',
    location: '',
    role: 'user'
}
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action) {
            state.id = action.payload.id
            state.name = action.payload.name
            state.isAuth = true

            localStorage.setItem('user', JSON.stringify(state))
        },

        logout(state) {
            state.id = null
            state.name = null
            state.isAuth = false

            localStorage.removeItem('user')
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