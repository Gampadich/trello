import instance from '../../../api/request';
import { useParams } from 'react-router-dom';  
import { useState } from 'react';
import { ICard } from '../interfaces/ICard';
import './List.css';

interface CardProps {
  key: number;
  title: string;
  cards: ICard[];
  listId: number;
}

export const CardList = (props: CardProps) => {
  const { id } = useParams<{ id: string }>();  
  const [clickButton, setClickButton] = useState(false);
  const cards = props.cards;
  const listCards = cards.map((card) => <li key={card.id}>{card.title}</li>);
  const listID = props.listId.toString();
  
  return (
    <div id={listID} className="containerCard">
      <div>
        <h2>{props.title}</h2>
        <ul>
          {listCards}
          {clickButton ? (
            <input
              type="text"
              autoFocus={true}
              onBlur={() => setClickButton(false)}
              placeholder="Insert your card name..."
              className="card-input"
              onKeyDown={async (e) => {
                if (e.key !== 'Enter') return;
                
                const pos = cards.length + 1;
                const date = new Date().toISOString();
                const cardData = {
                  title: e.currentTarget.value,
                  position: pos,
                  list_id: props.listId,  
                  description: '',
                  custom: { deadline: date },
                };
                await instance.post(`/board/${id}/card`, cardData);
                window.location.reload();
              }}
            />
          ) : (
            <button className="addListButton" onClick={() => setClickButton(true)}>
              + Add a card
            </button>
          )}
        </ul>
      </div>
    </div>
  );
};