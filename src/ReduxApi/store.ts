import {configureStore} from "@reduxjs/toolkit";
import boardReducer from "./listSlice"
import listReducer from "./listSlice"
import cardReducer from "./cardSlice";

export const store = configureStore({
    reducer : {
        cards : cardReducer,
        lists : listReducer,
        board : boardReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;