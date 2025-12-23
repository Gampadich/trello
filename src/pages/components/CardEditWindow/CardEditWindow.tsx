import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CardEditWindowStyle.css';
import { updateCard, setCards } from '../../../ReduxApi/cardSlice';
import { setLists } from '../../../ReduxApi/listSlice';
import { setBoardData, IUser } from '../../../ReduxApi/userSlice';
import { RootState } from '../../../ReduxApi/store';
import instance from '../../../api/request';

type ListIdVariant = number | string | { id: number | string };

interface ICard {
  id: number;
  title: string;
  description?: string;
  list_id: ListIdVariant;
  users: IUser[];
}

interface IList {
  id: number;
  title: string;
  cards?: ICard[];
}

interface IBoardResponse {
  id: number;
  title: string;
  lists?: IList[];
  users?: IUser[];
}

function isBoardResponse(data: unknown): data is IBoardResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'lists' in data
  );
}

const getSafeListId = (rawId: ListIdVariant | undefined): number | null => {
  if (rawId === undefined || rawId === null) return null;
  if (typeof rawId === 'number') return rawId;
  if (typeof rawId === 'string') return Number(rawId);
  if (typeof rawId === 'object' && 'id' in rawId) return Number(rawId.id);
  return null;
};

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

export const CardEditWindow = () => {
  // --- ВИПРАВЛЕННЯ 1: Універсальний пошук ID ---
  // Ми читаємо всі параметри і беремо boardId, якщо він є, або id як запасний варіант.
  const params = useParams<Record<string, string>>();
  const boardId = params.boardId || params.id; 
  const cardId = params.cardId;
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Отримуємо ID поточного юзера
  const currentUserId = Number(localStorage.getItem('userId')) || 1;

  const card = useSelector((state: RootState) =>
    state.cards.items.find((c) => c.id === Number(cardId))
  );

  const lists = useSelector((state: RootState) => state.lists?.items || []);

  const renderDescriptionWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'underline', color: '#0079bf', cursor: 'pointer' }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  let listName = 'Loading...';
  if (card) {
    const safeId = getSafeListId(card.list_id);
    if (safeId !== null) {
      const foundList = lists.find((l) => l.id === safeId);
      listName = foundList ? foundList.title : 'Unknown List';
    }
  }

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

  // Завантаження даних при перезавантаженні сторінки
  useEffect(() => {
    // Додали перевірку на наявність boardId
    if (boardId && (!card || lists.length === 0)) {
      setIsLoading(true);

      instance.get<unknown>(`/board/${boardId}`)
        .then((res) => {
          let data: IBoardResponse | null = null;

          if (isBoardResponse(res)) {
            data = res;
          } else if (
            typeof res === 'object' &&
            res !== null &&
            'data' in res &&
            isBoardResponse((res as { data: unknown }).data)
          ) {
            data = (res as { data: IBoardResponse }).data;
          }

          if (data) {
            if (data.lists) {
              const allCards: ICard[] = [];
              data.lists.forEach((list) => {
                if (list.cards) allCards.push(...list.cards);
              });

              dispatch(setCards(allCards));
              dispatch(setLists(data.lists));
            }

            dispatch(setBoardData({
              id: data.id,
              title: data.title,
              users: data.users || []
            }));
          }
        })
        .catch((err) => console.error('Load Error:', err))
        .finally(() => setIsLoading(false));
    }
  }, [boardId, cardId, card, lists.length, dispatch]);

  const handleJoinToggle = async () => {
    if (!card) return;

    const isMember = card.users && card.users.some((u) => u.id === currentUserId);

    // --- ВИПРАВЛЕННЯ 2: Payload (тіло запиту) ---
    // Це виправляє помилку 400 Bad Request при додаванні учасника
    const apiBody = isMember
      ? { remove: [currentUserId], add: [] }
      : { add: [currentUserId], remove: [] };

    let newUsers = [...(card.users || [])];

    if (isMember) {
      newUsers = newUsers.filter((u) => u.id !== currentUserId);
    } else {
      newUsers.push({ id: currentUserId, username: 'Me' }); 
    }
    dispatch(updateCard({ ...card, users: newUsers }));

    try {
      await instance.put(`/board/${boardId}/card/${cardId}/users`, apiBody);
    } catch (error) {
      console.error("Join error:", error);
    }
  };

  const saveChanges = async () => {
    if (!card) return;
    const safeListId = getSafeListId(card.list_id);
    if (safeListId === null || isNaN(safeListId)) return;

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

  const handleTitleSave = () => { setIsEditingTitle(false); saveChanges(); };
  const handleDescSave = () => { setIsEditingDesc(false); saveChanges(); };
  const closeWindow = () => navigate(`/board/${boardId}`);

  if (isLoading) return <div className="modal-overlay">Завантаження...</div>;
  if (!card) return <div className="modal-overlay">Card not found</div>;

  const isMember = card.users && card.users.some((u) => u.id === currentUserId);
  const joinButtonText = isMember ? "Покинути" : "Приєднатися";

  return (
    <div className="modal-overlay" onClick={closeWindow}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={closeWindow}>x</button>

        {isEditingTitle ? (
          <input
            autoFocus
            className="changeTitle"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); }}
          />
        ) : (
          <h2 className="title" onClick={() => setIsEditingTitle(true)}>{localTitle}</h2>
        )}

        <p className="in-list-text">
          в колонці <span className="list-name-highlight">{listName}</span>
        </p>

        <div className="participants-section">
          <h3 className="section-title">Учасники</h3>
          <div className="participants-row">
            {card.users && card.users.map((user) => (
              <div
                key={user.id}
                className="user-avatar"
                title={user.username}
                style={{ backgroundColor: stringToColor(user.username || 'U') }}
              >
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>
            ))}

            <button className="add-participant-btn">+</button>

            <button
              className={`join-btn ${isMember ? 'leave' : ''}`}
              onClick={handleJoinToggle}
            >
              {joinButtonText}
            </button>
          </div>
        </div>

        <h3 className="section-title">Опис</h3>
        {isEditingDesc ? (
          <div>
            <textarea
              className="descriptionTextarea"
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
            />
            <div className="edit-controls">
              <button className="saveButton" onClick={handleDescSave}>Save</button>
              <button className="cancelButton" onClick={() => {
                setIsEditingDesc(false);
                setLocalDescription(card.description || '');
              }}>Cancel</button>
            </div>
          </div>
        ) : (
          <p className="content" onClick={() => setIsEditingDesc(true)}>
            {renderDescriptionWithLinks(localDescription) || 'Додати детальніший опис...'}
          </p>
        )}
      </div>
    </div>
  );
};