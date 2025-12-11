import instance from '../../api/request';
import { Link, useParams } from 'react-router-dom';
import { CardList } from '../components/List/List';
import { useEffect, useState } from 'react';
import './Board.css';
import { Settings } from './modalWindows/settings/settings';

interface CardType {
  id: number;
  title: string;
  color: string;
  description: string;
  custom: {
    deadline: string;
  };
}

interface ListType {
  id: number;
  title: string;
  cards: CardType[];
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
  useEffect(() => {
    const savedColor = localStorage.getItem(`color-board-${id}`);
    document.body.style.backgroundColor = savedColor ? savedColor : '#ffffff';
    setLoading(true);
    const fetchBoardDetails = async () => {
      try {
        const responce: Responce = await instance.get(`/board/${id}`);
        console.log('lists data:', responce.lists);
        console.log('Board details:', responce);
        setTitle(responce.title);
        setTables(responce.lists);
      } catch (error) {
        console.error('Error fetching board details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoardDetails();
  }, [id]);
  if (loading) return <div>Loading...</div>;
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
          <CardList listId={list.id} key={list.id} title={list.title} cards={list.cards} />
        ))}
        <button className="settings" onClick={() => setSettingsOpen(true)}>
          {' '}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-gear-fill"
            viewBox="0 0 16 16"
          >
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
          </svg>
        </button>
        {settingsOpen && <Settings settingsOpen={() => setSettingsOpen(false)}/>}
        {buttonClick && (
          <input
            className="add-list-input"
            autoFocus={true}
            onBlur={() => isButtonClick(false)}
            placeholder="Put your column title..."
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                let pos = tables.length + 1;
                const newList = {
                  id: pos,
                  title: e.currentTarget.value,
                  position: pos,
                };
                console.log('New List:', newList);
                await instance.post(`/board/${id}/list`, newList);
                window.location.reload();
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
