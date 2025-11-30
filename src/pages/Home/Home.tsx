import { useEffect, useState } from 'react';
import { Board } from '../components/Board/Board';
import instance from '../../api/request';
import './Home.css';

export const Home = () => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    console.log('API URL:', process.env.REACT_APP_API_URL);
    const fetchCards = async () => {
      console.log('Fetching boards...');
      const data = await instance.get('/board');
      console.log('Boards:', data);
      setCards(data.data);
    };
    fetchCards();
  }, []);
  return (
    <>
      <h1>My tables</h1>
      <Board cards={cards} />
    </>
  );
};
