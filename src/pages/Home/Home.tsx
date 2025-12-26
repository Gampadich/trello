import { useEffect, useState } from 'react';
import { Board } from '../components/Board/Board';
import instance from '../../api/request';
import './Home.css';
import { Link } from 'react-router-dom';

interface CardType {
  id: number;
  title: string;
  custom: React.CSSProperties;
}

interface ApiBoardsResponse {
  boards: CardType[];
}

export const Home = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState(false);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null); 
      
      const response = await instance.get<ApiBoardsResponse>('/board');
      
      // @ts-ignore
      const data = response.boards ? response.boards : response;
      setCards(data);

    } catch (err: any) {
      console.error('Error fetching cards:', err);
      
      if (err.response && err.response.status === 401) {
        setAuth(false);
        setCards([]);
        localStorage.removeItem('token'); 
      } else {
        setError(err.message || 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setAuth(true);
      fetchCards(); 
    } else {
      setAuth(false);
      setCards([]);
    }

    document.body.style.backgroundColor = '#ffffff';
  }, []); 

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    
    setAuth(false);
    
    setCards([]); 
    setError(null);
  };

  return (
    <>
      {auth ? (
        <Link to='/login'><button className='loginButton' onClick={handleLogout}>
          Log out
        </button></Link>
      ) : (
        <Link to='/login' className='Link'>
          <button className='loginButton'>Log in</button>
        </Link>
      )}

      <h1>My tables</h1>
      
      {loading && <div>Loading your boards...</div>}
      
      {error && <div style={{color: 'red'}}>Error: {error}</div>}
      
      {!loading && <Board cards={cards} />}
    </>
  );
};