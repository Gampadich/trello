import { useEffect, useState } from 'react';
import { Board } from '../components/Board/Board';
import instance from '../../api/request';
import './Home.css';

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

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const response: ApiBoardsResponse = await instance.get('/board');
        
        console.log('API Response:', response);
        
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
  
  return (
    <>
      <h1>My tables</h1>
      <Board cards={cards} />
    </>
  );
};