import instance from '../../api/request';
import { Link, useParams } from 'react-router-dom';
import { CardList } from '../components/List/List';
import { useEffect, useState } from 'react';
import './Board.css';

interface ApiDetailResponce {
  title: string;
  lists: [{
    id: number;
    title : string
    cards: {
      id: number;
      title: string;
      color : string
      description : string;
      custom: {
        deadline : string;
      };
    };
  }]
}

interface CardType {
  id: number;
  title: string;
  color : string;
  description : string;
  custom: {
    deadline : string;
  };
}

interface ListType {
  id: number;
  title : string
  cards : CardType[]
}

export const Board = () => {
  const { id } = useParams<{ id : string }>();
  const [title, setTitle] = useState('');
  const [tables, setTables] = useState<ListType[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const fetchBoardDetails = async () => {
      try {
        const responce : ApiDetailResponce = await instance.get(`/board/${id}`)
        console.log('Board details:', responce);
        setTitle(responce.title)
        setTables(responce.lists)
      } catch (error) {
        console.error('Error fetching board details:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBoardDetails();
  }, [id]);
  if (loading) return <div>Loading...</div>;
  return (
    <div className="container">
      <Link to='/trello'><button className='home-button'>To home page</button></Link>
      <h1 className="board-title">{title}</h1>
      <div className="lists-wrapper">
        {tables.map((list) => (
          <CardList key={list.id} title={list.title} cards={list.cards} />
        ))}
        <button className='add-list-button'>+ Add list</button>
      </div>
    </div>
  );
};
