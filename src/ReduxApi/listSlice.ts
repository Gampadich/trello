import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ListDetails {
    id : number
    title : string
    position ?: number
}

interface ListState {
    items : ListDetails[]
}

const initialState : ListState = {
    items : []
}

export const listSlice = createSlice({
    name : 'lists',
    initialState,
    reducers : {
        setLists : (state, action : PayloadAction<ListDetails[]>) => {
            state.items = action.payload
        },

        upsertList: (state, action: PayloadAction<ListDetails>) => {
            const index = state.items.findIndex(list => list.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = { ...state.items[index], ...action.payload };
            } else {
                state.items.push(action.payload);
            }
        },

        addList : (state, action : PayloadAction<ListDetails>) => {
            state.items.push(action.payload)
        }
    }
})

export const { setLists, addList, upsertList } = listSlice.actions
export default listSlice.reducer