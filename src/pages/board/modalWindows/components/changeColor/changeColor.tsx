import './changeColor.css'

interface ChangeColorProps {
  setChangeColor: () => void;
}

export const ChangeColor = ({setChangeColor} : ChangeColorProps) => {
    return (
        <div className="modal-overlay">
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Change color</h2>
                <input type="color" className="modal-color-input" />
                <div className="modal-buttons">
                    <button className="modal-button modal-button-cancel" onClick={() => setChangeColor()}>Cancel</button>
                    <button className="modal-button modal-button-create">Change</button>
                </div>
            </div>
        </div>
    )
}