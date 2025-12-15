import './CardEditWindowStyle.css';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export const CardEditWindow = () => {
  const { boardId } = useParams<{boardId: string}>();
  return (
    <Link to={`/board/${boardId}`} className='link'>
      <div className="modal-overlay">
        <div className="modal-container" onClick={(e) => e.preventDefault()}>
          <h2 className="modal-title">Add board</h2>
          <div className="modal-buttons">
            <button className="modal-button modal-button-cancel">Cancel</button>
            <button className="modal-button modal-button-create">Create</button>
          </div>
        </div>
      </div>
    </Link>
  );
};
