import { createSlice } from '@reduxjs/toolkit'


const initialState = {

    selectedChat: null,

}

const messagesSlice = createSlice({

    name: 'messages',

    initialState,

    reducers: {

        selectChat(state, action) {

            state.selectedChat = action.payload

        },

        clearSelectedChat(state) {

            state.selectedChat = null

        },

    },

})

export const {

    selectChat,

    clearSelectedChat,

} = messagesSlice.actions

export default messagesSlice.reducer