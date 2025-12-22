import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CardEditWindowStyle.css';
import { updateCard, setCards } from '../../../ReduxApi/cardSlice';
import { RootState } from '../../../ReduxApi/store';
import instance from '../../../api/request';

type ListIdType = number | string | { id: number | string };

interface ICard {
  id: number;
  title: string;
  description?: string;
  list_id: ListIdType;
}

interface IList {
  id: number;
  cards?: ICard[];
}

interface IBoardResponse {
  lists?: IList[];
}

export const CardEditWindow = () => {
  const { boardId, cardId } = useParams<{ boardId: string; cardId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const card = useSelector((state: RootState) => state.cards.items.find((c) => c.id === Number(cardId)));

  const [localTitle, setLocalTitle] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (card) {
      setLocalTitle(card.title);
      setLocalDescription(card.description || '');
    }
  }, [card]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(`/board/${boardId}`);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, boardId]);
  useEffect(() => {
    if (boardId && !card) {
      setIsLoading(true);
      instance
        .get<IBoardResponse>(`/board/${boardId}`)
        .then((res) => {
          const data = (res.data ? res.data : res) as IBoardResponse;
          const allCards: ICard[] = [];
          if (data.lists) {
            data.lists.forEach((list) => {
              if (list.cards) {
                allCards.push(...list.cards);
              }
            });
          }
          dispatch(setCards(allCards));
        })
        .catch((err) => console.error('Load Error:', err))
        .finally(() => setIsLoading(false));
    }
  }, [boardId, cardId, card, dispatch]);
  const saveChanges = async () => {
    if (!card) return;
    let safeListId: number | null = null;
    const rawId = card.list_id;

    if (typeof rawId === 'number') {
      safeListId = rawId;
    } else if (typeof rawId === 'string') {
      safeListId = Number(rawId);
    } else if (typeof rawId === 'object' && rawId !== null && 'id' in rawId) {
      safeListId = Number(rawId.id);
    }
    if (safeListId === null || isNaN(safeListId)) {
      console.error('Invalid List ID:', rawId);
      return;
    }

    const apiPayload = {
      title: localTitle,
      description: localDescription,
      list_id: safeListId,
    };
    dispatch(updateCard({ ...card, ...apiPayload }));

    try {
      await instance.put(`/board/${boardId}/card/${cardId}`, apiPayload);
    } catch (error) {
      console.error('API Error:', error);
    }
  };
  const handleTitleSave = () => {
    setIsEditingTitle(false);
    saveChanges();
  };
  const handleDescSave = () => {
    setIsEditingDesc(false);
    saveChanges();
  };
  const closeWindow = () => navigate(`/board/${boardId}`);

  if (isLoading) return <div className="modal-overlay">Завантаження...</div>;
  if (!card) return <div className="modal-overlay">Card not found</div>;

  return (
    <div className="modal-overlay" onClick={closeWindow}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={closeWindow}>
          x
        </button>

        {isEditingTitle ? (
          <input
            autoFocus
            className="changeTitle"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave();
            }}
          />
        ) : (
          <h2 className="title" onClick={() => setIsEditingTitle(true)}>
            {localTitle}
          </h2>
        )}

        {isEditingDesc ? (
          <div>
            <textarea
              className="descriptionTextarea"
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
            />
            <div className="edit-controls">
              <button className="saveButton" onClick={handleDescSave}>
                Save
              </button>
              <button
                className="cancelButton"
                onClick={() => {
                  setIsEditingDesc(false);
                  setLocalDescription(card.description || '');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="content" onClick={() => setIsEditingDesc(true)}>
            {localDescription || 'Click to add description...'}
          </p>
        )}
      </div>
    </div>
  );
};
