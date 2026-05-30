import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    werbungen: JSON.parse(localStorage.getItem('werbungen')) || [],
}

const werbungSlice = createSlice({
    name: 'werbung',
    initialState,
    reducers: {

        addWerbung(state, action) {
            state.werbungen.push(action.payload)

            localStorage.setItem(
                'werbungen',
                JSON.stringify(state.werbungen)
            )
        },

        removeWerbung(state, action) {
            state.werbungen = state.werbungen.filter(
                (item) => item.id !== action.payload
            )

            localStorage.setItem(
                'werbungen',
                JSON.stringify(state.werbungen)
            )
        },

        updateWerbung(state, action) {
            const index = state.werbungen.findIndex(
                (item) => item.id === action.payload.id
            )

            if (index !== -1) {
                state.werbungen[index] = action.payload

                localStorage.setItem(
                    'werbungen',
                    JSON.stringify(state.werbungen)
                )
            }
        },

        setWerbungen(state, action) {
            state.werbungen = action.payload
        },

    },
})

export const {
    addWerbung,
    removeWerbung,
    updateWerbung,
    setWerbungen
} = werbungSlice.actions

export default werbungSlice.reducer