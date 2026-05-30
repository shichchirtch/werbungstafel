import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    messages: JSON.parse(localStorage.getItem('messages')) || [],
}

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {

        addMessage(state, action) {
            state.messages.push(action.payload)

            localStorage.setItem(
                'messages',
                JSON.stringify(state.messages)
            )
        },

        setMessages(state, action) {
            state.messages = action.payload
        },

    },
})

export const { addMessage, setMessages } = messagesSlice.actions
export default messagesSlice.reducer