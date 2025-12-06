import instance from '../../api/request';
import { Link, useParams } from 'react-router-dom';
import { CardList } from '../components/List/List';
import { useEffect, useState } from 'react';
import './Board.css';

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
  let position = 0
  useEffect(() => {
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
          <CardList key={list.id} title={list.title} cards={list.cards} />
        ))}
        {buttonClick && (
          <input
            className="add-list-input"
            autoFocus={true}
            onBlur={() => isButtonClick(false)}
            placeholder="Put your column title..."
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                position += 1
                const newList = {
                  title: e.currentTarget.value,
                  position : position
                };
                console.log('New List:', newList);
                await instance.post(`/board/${id}/list`, newList);
                isButtonClick(false);
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
