import { Link } from 'react-router-dom';
import { CardList } from '../components/List/List';
import { useState } from 'react';
import './Board.css';

export const Board = () => {
  const [title, setTitle] = useState('Моя тестова дошка');
  const [tables, setTable] = useState({
    lists: [
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
    ],
  });
  return (
    <div className="container">
      <Link to='/trello'><button className='home-button'>To home page</button></Link>
      <h1 className="board-title">{title}</h1>
      <div className="lists-wrapper">
        {tables.lists.map((list) => (
          <CardList key={list.id} title={list.title} cards={list.cards} />
        ))}
        <button className='add-list-button'>+ Add list</button>
      </div>
    </div>
  );
};
