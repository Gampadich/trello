import "./Modal.css";
import { useState } from "react";
import instance from "../../../api/request";

interface ModalWindowProps {
    onClose : () => void;
}

interface CardDataInterface {
    id? : number;
    title : string;
    custom : React.CSSProperties;
}

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const getContrastColor = (hexColor: string) => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    return (yiq >= 128) ? 'black' : 'white';
};

export const ModalWindow = ({ onClose } : ModalWindowProps) => {
    const [,setSend] = useState(false)
    const [title, setTitle] = useState("")
    
    const [color, setColor] = useState(getRandomColor()) 

    const createCard = async () => {
        if (title.trim() === "") {
            alert("Title cannot be empty");
            return;
        }
        setSend(true);

        const textColor = getContrastColor(color);

        const cardData : CardDataInterface = {
            title: title,
            custom: { 
                backgroundColor: color,
                color: textColor 
            }
        };

        try{
            const response = await instance.post<CardDataInterface>('/board', cardData);
            console.log('Card created:', response);
            onClose();
            window.location.reload();            
        } catch (error) {
            console.error('Error creating card:', error);
            setSend(false);
        } finally {
            setSend(false);
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h2 className="modal-title">Add board</h2>
                <input 
                    type="text" 
                    placeholder="Board title..." 
                    className="modal-input" 
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input 
                    type="color" 
                    className="modal-color-input" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)}
                />
                <div className="modal-buttons">
                    <button className="modal-button modal-button-cancel" onClick={onClose}>Cancel</button>
                    <button className="modal-button modal-button-create" onClick={() => createCard()}>Create</button>
                </div>
            </div>
        </div>
    )
}