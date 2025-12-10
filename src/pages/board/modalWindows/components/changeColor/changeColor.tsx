import './changeColor.css'

export const ChangeColor = () => {
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h2 className="modal-title">Change color</h2>
                <input type="color" className="modal-color-input" />
                <div className="modal-buttons">
                    <button className="modal-button modal-button-cancel">Cancel</button>
                    <button className="modal-button modal-button-create">Change</button>
                </div>
            </div>
        </div>
    )
}