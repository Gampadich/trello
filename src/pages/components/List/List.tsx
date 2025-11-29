import { ICard } from '../interfaces/ICard';
import './List.css';

interface CardProps {
  title: string;
  cards: ICard[];
}

export const CardList = (props: CardProps) => {
  const cards = props.cards;
  const listCards = cards.map((title) => <li key={title.id}>{title.title}</li>);
  return (
    <div className='containerCard'>
      <div>
        <h2>{props.title}</h2>
        <ul>
          {listCards}
          <button className="addListButton">+ Add Card</button>
        </ul>
      </div>
    </div>
  );
};
