import './changeColor.css'
import { useState } from 'react';
import { useParams } from 'react-router-dom';
interface ChangeColorProps {
  setChangeColor: () => void;
}

export const ChangeColor = ({setChangeColor} : ChangeColorProps) => {
    const [color, setColor] = useState("#ffffff");
    const { id } = useParams<{ id: string }>();
    return (
        <div className="modal-overlay">
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Change color</h2>
                <input type="color" className="modal-color-input" onChange={(e) => {setColor(e.target.value)}}/>
                <div className="modal-buttons">
                    <button className="modal-button modal-button-cancel" onClick={() => setChangeColor()}>Cancel</button>
                    <button className="modal-button modal-button-create" onClick={() => {
                        localStorage.setItem(`color-board-${id}`, color)
                        document.body.style.backgroundColor = color;
                        setChangeColor()
                    }}>Change</button>
                </div>
            </div>
        </div>
    )
}