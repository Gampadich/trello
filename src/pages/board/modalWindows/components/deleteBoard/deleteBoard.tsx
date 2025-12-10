import './deleteBoard.css';

export const DeleteBoard = () => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Are you sure?</h2>
        <div className="modal-buttons">
          <button className="modal-button modal-button-cancel" >
            No
          </button>
          <button className="modal-button modal-button-delete">
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};
