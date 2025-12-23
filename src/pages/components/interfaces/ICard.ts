import { IUser } from "../../../ReduxApi/userSlice";

export interface ICard {
  id: number;
  title: string;
  list_id: number;
  position: number;     
  description?: string;  
  color?: string;        
  custom?: {
    deadline?: string;
  };
  users : IUser[]
}