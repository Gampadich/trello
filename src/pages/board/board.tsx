import { CardList } from '../components/List/List';
import { useState } from 'react';
import '../componentStyles/Board.css';
import { ListFormat } from 'typescript';

export const Board = () => {
  const [title, setTitle] = useState('Моя тестова дошка')
  const [tables, setTable] = useState([
    {
      id: 1,
      title: 'Плани',
      cards: [
        { id: 1, title: 'помити кота' },
        { id: 2, title: 'приготувати суп' },
        { id: 3, title: 'сходити в магазин' },
      ],
    },
    {
      id: 2,
      title: 'В процесі',
      cards: [{ id: 4, title: 'подивитися серіал' }],
    },
    {
      id: 3,
      title: 'Зроблено',
      cards: [
        { id: 5, title: 'зробити домашку' },
        { id: 6, title: 'погуляти з собакой' },
      ],
    },
  ]);
  return (
  <div className='container'>
    <h1>{title}</h1>
  </div>);
}