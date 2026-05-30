import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    favorites: JSON.parse(localStorage.getItem('favorites')) || []
}

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {

        toggleFavorite(state, action) {

            const id = action.payload

            if (state.favorites.includes(id)) {
                state.favorites = state.favorites.filter(
                    (item) => item !== id
                )
            } else {
                state.favorites.push(id)
            }

            localStorage.setItem(
                'favorites',
                JSON.stringify(state.favorites)
            )
        }

    }
})

export const { toggleFavorite } = favoritesSlice.actions
export default favoritesSlice.reducer