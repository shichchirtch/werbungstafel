import {createSlice} from '@reduxjs/toolkit'

const savedUser = JSON.parse(localStorage.getItem('user'))

const initialState = savedUser || {
    id: null,
    name: '',
    dbId: null,
    isAuth: false,
    lan: "de",
    avatar: null,
    bio: '',
    location: '',
    latitude: null,
    longitude: null,
    role: 'user',
    isTelegram: false,
}
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action) {
            state.id = action.payload.id
            state.name = action.payload.name
            state.dbId = action.payload.dbId      // users.id
            state.isAuth = true
            state.lan = action.payload.lan
            state.role = action.payload.role
            state.isTelegram = action.payload.isTelegram
            localStorage.setItem('user', JSON.stringify(state))
        },

        logout(state) {

            console.log('LOGOUT')

            state.id = null
            state.name = null
            state.isAuth = false
            state.role = 'user'
            state.dbId = null
            state.location = ''
            state.isTelegram = false
            state.latitude = null
            state.longitude = null

            localStorage.removeItem('user')
        },

        updateProfile(state, action) {
            state.name = action.payload.name
            state.bio = action.payload.bio
            state.location = action.payload.location
            state.avatar = action.payload.avatar
            state.latitude = action.payload.latitude
            state.longitude = action.payload.longitude

            localStorage.setItem('user', JSON.stringify(state))
        }
    },
})

export const {setUser, logout, updateProfile} = userSlice.actions
export default userSlice.reducer