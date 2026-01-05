import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
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
  position: number;
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
  return typeof data === 'object' && data !== null && 'lists' in data;
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
  const params = useParams<Record<string, string>>();
  const boardId = params.boardId || params.id;
  const cardId = params.cardId;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUserId = Number(localStorage.getItem('userId')) || 1;

  const card = useSelector((state: RootState) => 
    state.cards.items.find((c) => String(c.id) === String(cardId))
  );

  const lists = useSelector((state: RootState) => state.lists?.items || []) as unknown as IList[];

  const [localTitle, setLocalTitle] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const moveMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moveMenuRef.current && !moveMenuRef.current.contains(event.target as Node)) {
        setIsMoveMenuOpen(false);
      }
    };
    if (isMoveMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoveMenuOpen]);

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
    if (boardId && (!card || lists.length === 0)) {
      setIsLoading(true);

      instance
        .get<unknown>(`/board/${boardId}`)
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
                if (list.cards) {
                  const cardsWithListId = list.cards.map((c, index) => ({
                    ...c,
                    list_id: list.id,
                    position: c.position ?? index,
                  }));
                  allCards.push(...cardsWithListId);
                }
              });
              
              dispatch(setLists(data.lists));
              dispatch(setCards(allCards)); 
            }
            dispatch(setBoardData({ id: data.id, title: data.title, users: data.users || [] }));
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [boardId, cardId, card, lists.length, dispatch]);

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

  const handleCopy = async () => {
    if (!card) return;
    const safeListId = getSafeListId(card.list_id);
    const currentList = lists.find((l) => String(l.id) === String(safeListId));
    const newPosition = currentList ? (currentList.cards ? currentList.cards.length + 1 : 1) : 65535;

    const newCardPayload = {
      title: `${card.title} (Copy)`,
      description: card.description || '',
      list_id: safeListId,
      position: newPosition,
    };

    try {
      await instance.post(`/board/${boardId}/card`, newCardPayload);
      closeWindow();
    } catch (error) {
      console.error(error);
      alert('Failed to copy card');
    }
  };

  const handleMoveCard = async (targetListId: number) => {
    if (!card) return;
    const targetList = lists.find((l) => String(l.id) === String(targetListId));
    const newPosition = targetList && targetList.cards ? targetList.cards.length + 1 : 1;

    try {
      await instance.put(`/board/${boardId}/card`, [
        {
          id: card.id,
          list_id: targetListId,
          position: newPosition,
        },
      ]);
      closeWindow();
    } catch (error) {
      console.error(error);
      alert('Failed to move card');
    }
  };

  const handleArchive = async () => {
    if (!card) return;

    const isConfirmed = window.confirm("Are you sure you want to archive (delete) this card?");
    if (!isConfirmed) return;

    try {
      await instance.delete(`/board/${boardId}/card/${cardId}`);
      closeWindow();
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to archive card");
    }
  };

  const handleJoinToggle = async () => {
    if (!card) return;
    const isMember = card.users && card.users.some((u) => u.id === currentUserId);
    const apiBody = isMember ? { remove: [currentUserId], add: [] } : { add: [currentUserId], remove: [] };
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
      console.error(error);
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
      console.error(error);
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

  if (isLoading) return <div className="modal-overlay" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white'}}>Loading data...</div>;
  
  if (!card) return <div className="modal-overlay" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white'}} onClick={closeWindow}>Card not found (Click to close)</div>;

  const isMember = card.users && card.users.some((u) => u.id === currentUserId);
  const joinButtonText = isMember ? 'Покинути' : 'Приєднатися';

  let listName = 'Loading...';
  const currentListId = card ? getSafeListId(card.list_id) : null;

  if (card && currentListId !== null) {
    const foundList = lists.find((l) => String(l.id) === String(currentListId));
    if (foundList) {
      listName = foundList.title;
    } else if (lists.length > 0) {
      listName = 'Unknown List';
    }
  }

  return (
    <div className="modal-overlay" onClick={closeWindow}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={closeWindow}>
          x
        </button>

        <div className="modal-main">
          <div className="header-section">
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
            <p className="in-list-text">
              In list <span className="list-name-highlight">{listName}</span>
            </p>
          </div>

          <div className="participants-section">
            <h3 className="section-title">Members</h3>
            <div className="participants-row">
              {card.users &&
                card.users.map((user) => (
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
              <button className={`join-btn ${isMember ? 'leave' : ''}`} onClick={handleJoinToggle}>
                {joinButtonText}
              </button>
            </div>
          </div>

          <div className="description-section">
            <h3 className="section-title">Description</h3>
            {isEditingDesc ? (
              <div>
                <textarea
                  className="descriptionTextarea"
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  placeholder="Add a more detailed description..."
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
                {renderDescriptionWithLinks(localDescription) || 'Add a more detailed description...'}
              </p>
            )}
          </div>
        </div>

        <div className="modal-sidebar">
          <h3 className="section-title">Actions</h3>

          <button className="sidebar-btn" onClick={handleCopy}>
            Copy
          </button>

          <div className="sidebar-btn-wrapper" ref={moveMenuRef}>
            <button className="sidebar-btn" onClick={() => setIsMoveMenuOpen(!isMoveMenuOpen)}>
              Move
            </button>

            {isMoveMenuOpen && (
              <div className="move-dropdown">
                <div className="move-dropdown-header">Select destination</div>
                {lists.map((list) => {
                  const isCurrent = String(list.id) === String(currentListId);
                  return (
                    <div
                      key={list.id}
                      className={`move-dropdown-item ${isCurrent ? 'current' : ''}`}
                      onClick={() => {
                        if (!isCurrent) handleMoveCard(Number(list.id));
                      }}
                    >
                      {list.title} {isCurrent && '(current)'}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button className="sidebar-btn archive-btn" onClick={handleArchive}>
            Archive
          </button>
        </div>
      </div>
    </div>
  );
};