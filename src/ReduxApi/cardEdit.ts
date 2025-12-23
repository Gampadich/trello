import { IUser } from "./userSlice";
export interface cardDetails {
    id ?: number;
    list_id ?: number | string | {id : number | string};
    listId ?: number | string
    title : string;
    description ?: string;
    users : IUser[]
}