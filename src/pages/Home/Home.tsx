import { useEffect, useState } from 'react';
import { Board } from '../components/Board/Board';
import instance from '../../api/request';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token){
      setAuth(true)
    }
    document.body.style.backgroundColor = '#ffffff';
    const fetchCards = async () => {
      try {
        setLoading(true);
        const response: ApiBoardsResponse = await instance.get('/board');
        
        setCards(response.boards);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching cards:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCards();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  const handleLogout = () => {
    localStorage.setItem('userId', '')
    localStorage.setItem('token', '')
    setAuth(false)
  }

  return (
    <>
      {auth 
        ? <Link to='/login' className='Link'><button className='loginButton'>Log in</button></Link>
        : <button className='loginButton' onClick={handleLogout}>Log out</button>}
      <h1>My tables</h1>
      <Board cards={cards} />
    </>
  );
};