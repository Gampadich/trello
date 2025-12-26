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
  const [loading, setLoading] = useState(false); // За замовчуванням false, вмикаємо тільки при запиті
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState(false);

  // Функція завантаження даних
  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null); // Скидаємо помилки перед новим запитом
      
      const response = await instance.get<ApiBoardsResponse>('/board');
      
      // @ts-ignore
      const data = response.boards ? response.boards : response;
      setCards(data);

    } catch (err: any) {
      console.error('Error fetching cards:', err);
      // Якщо помилка 401, то це не "Unknown error", а проблема авторизації
      if (err.response && err.response.status === 401) {
        setAuth(false);
        setCards([]);
        localStorage.removeItem('token'); // Чистимо поганий токен
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
      fetchCards(); // Вантажимо тільки якщо є токен
    } else {
      setAuth(false);
      setCards([]); // Якщо токена немає - карток бути не може
    }

    document.body.style.backgroundColor = '#ffffff';
  }, []); // Цей ефект спрацює при завантаженні сторінки

  const handleLogout = () => {
    // 1. Видаляємо дані з браузера
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    
    // 2. Оновлюємо інтерфейс
    setAuth(false);
    
    // 3. ВАЖЛИВО: Очищаємо масив карток, щоб наступний юзер не бачив старих
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