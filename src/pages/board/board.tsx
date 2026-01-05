import instance from '../../api/request';
import { Link, useParams } from 'react-router-dom';
import { CardList } from '../components/List/List';
import { useEffect, useState } from 'react';
import './Board.css';
import { Settings } from './modalWindows/settings/settings';
import { ICard } from '../components/interfaces/ICard';

interface ListType {
  id: number;
  title: string;
  cards: ICard[]; 
}

interface Responce {
  title: string;
  lists: ListType[];
}

export const Board = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [tables, setTables] = useState<ListType[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [titleClick, isTitleClick] = useState(false);
  const [buttonClick, isButtonClick] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fetchBoardDetails = async () => {
    try {
      setLoading(true);
      const responce: Responce = await instance.get(`/board/${id}`);
      setTitle(responce.title);

      const sortedLists = responce.lists.map(list => ({
        ...list,
        cards: list.cards.sort((a, b) => a.position - b.position)
      })).sort((a, b) => a.id - b.id);
      
      setTables(sortedLists);
    } catch (error) {
      console.error('Error fetching board details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedColor = localStorage.getItem(`color-board-${id}`);
    document.body.style.backgroundColor = savedColor ? savedColor : '#ffffff';
    fetchBoardDetails();
  }, [id]);

  const handleCardMove = async (cardId: number, sourceListId: number, targetListId: number, newIndex: number) => {
    const newTables = JSON.parse(JSON.stringify(tables)) as ListType[];
    const sourceList = newTables.find(l => l.id === sourceListId);
    const targetList = newTables.find(l => l.id === targetListId);

    if (!sourceList || !targetList) return;

    const cardIndex = sourceList.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const [movedCard] = sourceList.cards.splice(cardIndex, 1);

    movedCard.list_id = targetListId;
    
    targetList.cards.splice(newIndex, 0, movedCard);
    targetList.cards.forEach((c, idx) => c.position = idx + 1);

    setTables(newTables);

    try {
      await instance.put(`/board/${id}/card`, [{
        id: cardId,
        position: newIndex + 1,
        list_id: targetListId
      }]);
    } catch (error) {
      console.error("Failed to sync move with server", error)
    }
  };

  const handleCardAdd = async (listId: number, title: string) => {
    const newTables = [...tables];
    const targetList = newTables.find(l => l.id === listId);
    if (!targetList) return;

    const tempId = Date.now();
    const newPos = targetList.cards.length + 1;
    const date = new Date().toISOString();

    const newCard: ICard = {
        id: tempId,
        title: title,
        position: newPos,
        list_id: listId,
        description: '',
        users: [],
        custom: { deadline: date }
    };

    targetList.cards.push(newCard);
    setTables(newTables); 

    try {
        const response = await instance.post(`/board/${id}/card`, {
            title: title,
            position: newPos,
            list_id: listId,
            description: '',
            custom: { deadline: date },
        });

        const realCardId = (response as any).id || (response as any).data?.id;

        if (realCardId) {
            setTables(prev => prev.map(list => {
                if (list.id === listId) {
                    return {
                        ...list,
                        cards: list.cards.map(c => c.id === tempId ? { ...c, id: realCardId } : c)
                    };
                }
                return list;
            }));
        }

    } catch (error) {
        console.error("Failed to add card", error);
        setTables(prev => prev.map(l => {
            if (l.id === listId) {
                return { ...l, cards: l.cards.filter(c => c.id !== tempId) };
            }
            return l;
        }));
    }
  };


  if (loading && tables.length === 0) return <div>Loading...</div>;

  return (
    <div className="container">
      <Link to="/trello">
        <button className="home-button">To home page</button>
      </Link>
      {titleClick ? (
        <input
          className="board-title-input"
          autoFocus={true}
          onBlur={(e) => {
            setTitle(e.target.value);
            isTitleClick(false);
          }}
          defaultValue={title}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setTitle(e.currentTarget.value);
              instance.put(`/board/${id}`, { title: e.currentTarget.value });
              isTitleClick(false);
            }
          }}
        />
      ) : (
        <h1 className="board-title" onClick={() => isTitleClick(true)}>
          {title}
        </h1>
      )}

      <div className="lists-wrapper">
        {tables.map((list) => (
          <CardList 
            key={list.id} 
            listId={list.id} 
            title={list.title} 
            cards={list.cards} 
            onCardMove={handleCardMove}
            onCardAdd={handleCardAdd}
          />
        ))}

        <button className="settings" onClick={() => setSettingsOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-gear-fill" viewBox="0 0 16 16">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
          </svg>
        </button>

        {settingsOpen && <Settings settingsOpen={() => setSettingsOpen(false)} />}

        {buttonClick && (
          <input
            className="add-list-input"
            autoFocus={true}
            onBlur={() => isButtonClick(false)}
            placeholder="Put your column title..."
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                const title = e.currentTarget.value;
                if (!title.trim()) return;

                const pos = tables.length + 1;
                const tempListId = Date.now(); // Тимчасовий ID

                const newList = {
                  id: tempListId, 
                  title: title,
                  position: pos,
                  cards: [] 
                };

                // 1. Оптимістично додаємо в UI
                setTables([...tables, newList]); 
                isButtonClick(false);

                try {
                  // 2. Робимо запит на сервер
                  const res = await instance.post(`/board/${id}/list`, { title: title, position: pos });
                  
                  // 3. 🔥 ВАЖЛИВО: Отримуємо реальний ID від сервера
                  // Перевір, що повертає твій бекенд: res.data.id чи просто res.id
                  const realListId = (res as any).id || (res as any).data?.id;

                  if (realListId) {
                    // 4. Підміняємо тимчасовий ID на реальний у стейті
                    setTables((prevTables) => 
                      prevTables.map((list) => 
                        list.id === tempListId ? { ...list, id: realListId } : list
                      )
                    );
                  }
                } catch (error) {
                  console.error("Failed to create list", error);
                  // Видаляємо список, якщо помилка
                  setTables(prev => prev.filter(l => l.id !== tempListId));
                }
              }
            }}
          />
        )}

        <button className="add-list-button" onClick={() => isButtonClick(true)}>
          + Add list
        </button>
      </div>
    </div>
  );
};