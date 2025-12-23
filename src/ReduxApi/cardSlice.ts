import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cardDetails } from "./cardEdit";

interface CardState {
    items : cardDetails[]
}

const initialState : CardState = {
    items : []
}

export const cardSlice = createSlice({
    name : 'cards',
    initialState,
    reducers : {
        setCards : (state, action: PayloadAction<cardDetails[]>) => {
            state.items = action.payload
        },
        updateCard : (state, action: PayloadAction<cardDetails>) => {
            const index = state.items.findIndex(card => card.id === action.payload.id);
            if (index !== -1){
                state.items[index] = action.payload
            }
        },
        uppertCards : (state, action: PayloadAction<cardDetails[]>) => {
            action.payload.forEach(updatedCard => {
                const index = state.items.findIndex(card => card.id === updatedCard.id);
                if (index !== -1) {
                    state.items[index] = updatedCard;
                } else {
                    state.items.push(updatedCard);
                }
            })
        },
        
    }
})

export const {setCards, updateCard, uppertCards} = cardSlice.actions;
export default cardSlice.reducer;