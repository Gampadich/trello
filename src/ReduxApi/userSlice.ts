import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { stat } from "fs";

export interface IUser {
    id : number
    username : string
    email ?: string
}

interface BoardSlice {
    id : number | null
    title : string
    users : IUser[]
}

const initialState : BoardSlice = {
    id : null,
    title : 'Loading...',
    users : []
}

export const BoardSlice = createSlice({
    name : 'board',
    initialState,
    reducers : {
        setBoardData : ( state, action : PayloadAction<{id : number; title : string; users : IUser[] }>) => {
            state.id = action.payload.id
            state.title = action.payload.title
            state.users = action.payload.users
        },
        setBoardUsers : (state, action : PayloadAction<IUser[]>) => {
            state.users = action.payload
        }
    }
})

export const { setBoardData, setBoardUsers } = BoardSlice.actions
export default BoardSlice.reducer