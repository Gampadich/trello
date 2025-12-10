import './deleteBoard.css';
import { useParams } from 'react-router-dom';
import instance from '../../../../../api/request';

interface DeleteBoardProps {
  setDeleteBoard: () => void;
}

export const DeleteBoard = ({setDeleteBoard} : DeleteBoardProps) => {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="modal-overlay">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Are you sure?</h2>
        <div className="modal-buttons">
          <button className="modal-button modal-button-cancel" onClick={() => setDeleteBoard()}>
            No
          </button>
          <button className="modal-button modal-button-delete" onClick={async () => {
            await instance.delete(`/board/${id}`)
            window.location.href = '/trello';
          }}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};
