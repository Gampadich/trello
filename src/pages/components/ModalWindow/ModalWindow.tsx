import "./Modal.css";

interface ModalWindowProps {
    onClose : () => void;
}

export const ModalWindow = ({ onClose } : ModalWindowProps) => {
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h2 className="modal-title">Add board</h2>
                <input type="text" placeholder="Card title..." className="modal-input"/>
                <input type="color" className="modal-color-input"/>
                <div className="modal-buttons">
                    <button className="modal-button modal-button-cancel" onClick={onClose}>Cancel</button>
                    <button className="modal-button modal-button-create">Create</button>
                </div>
            </div>
        </div>
    )
}