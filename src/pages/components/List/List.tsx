import instance from '../../../api/request';
import { useParams, Link } from 'react-router-dom';
import { useState, DragEvent, useRef, useEffect, Fragment } from 'react';
import { ICard } from '../interfaces/ICard';
import './List.css'; // Переконайся, що CSS підключено
import { useDispatch } from 'react-redux';
import { uppertCards } from '../../../ReduxApi/cardSlice';
import { upsertList } from '../../../ReduxApi/listSlice'; 
import { AppDispatch } from '../../../ReduxApi/store';
import { cardDetails } from '../../../ReduxApi/cardEdit';

interface CardProps {
  title: string;
  cards: ICard[];
  listId: number;
}

export const CardList = (props: CardProps) => {
  const { id } = useParams<{ id: string }>();
  const [clickButton, setClickButton] = useState(false);
  
  const dragItem = useRef<number | null>(null);
  const dragNode = useRef<HTMLElement | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (props.cards && props.cards.length > 0) {
      const cardsForRedux: cardDetails[] = props.cards.map((card) => ({
        ...card,
        list_id: props.listId,
        listId: props.listId,
        description: card.description || '',
        users : card.users || []
      }));
      dispatch(uppertCards(cardsForRedux));
    }
    dispatch(upsertList({ id: props.listId, title: props.title }));
  }, [props.cards, props.listId, props.title, dispatch]); 

  const cards = [...props.cards].sort((a, b) => a.position - b.position);

  // --- DRAG-N-DROP ---

  const handleDragStart = (e: DragEvent<HTMLElement>, index: number, card: ICard) => {
    e.dataTransfer.setData('cardId', card.id.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    dragItem.current = index;
    dragNode.current = e.target as HTMLElement;

    setTimeout(() => {
        if(dragNode.current) dragNode.current.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e: DragEvent<HTMLElement>) => {
    if(dragNode.current) dragNode.current.classList.remove('dragging');
    dragItem.current = null;
    dragNode.current = null;
    setDropIndex(null);
  };

  const handleDragEnter = (e: DragEvent<HTMLElement>, index: number) => {
    if (dragItem.current === index) return;
    setDropIndex(index);
  };

  const handleDragOverList = (e: DragEvent<HTMLUListElement>) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    // Якщо навели на сам список або порожнє місце знизу
    if (target.tagName === 'UL' || target.classList.contains('card-list-ul')) {
        setDropIndex(cards.length);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    const cardIdString = e.dataTransfer.getData('cardId');
    
    if(dragNode.current) dragNode.current.classList.remove('dragging');
    const finalIndex = dropIndex;
    setDropIndex(null);

    if (!cardIdString || finalIndex === null) return;

    const cardId = Number(cardIdString);
    const newPosition = finalIndex + 1;

    try {
      await instance.put(`/board/${id}/card`, [{ 
          id: cardId, 
          position: newPosition, 
          list_id: props.listId 
      }]);
      window.location.reload(); 
    } catch (error) {
      console.error('Error moving card:', error);
    }
  };

  // --- RENDER CARDS ---

  const listCards = cards.map((card, index) => (
    // Fragment приймає ТІЛЬКИ key. Ніяких className або cl тут не має бути!
    <Fragment key={card.id}>
      {dropIndex === index && <div className="slot"></div>}

      <li 
        className="card" 
        draggable={true} 
        onDragStart={(e) => handleDragStart(e, index, card)} 
        onDragEnter={(e) => handleDragEnter(e, index)}
        onDragEnd={handleDragEnd}
        // preventDefault тут важливий, щоб події не "проковтувалися" дітьми
        onDragOver={(e) => e.preventDefault()}
      >
        <Link 
          to={`/board/${id}/card/${card.id}`} 
          // draggable={false} критично важливий для Link!
          draggable={false}
          className="card-link"
        >
          {card.color && <div className="card-label" style={{ background: card.color }}></div>}
          <div className="card-title">{card.title}</div>
        </Link>
      </li>
    </Fragment>
  ));

  const listID = props.listId.toString();

  return (
    <div id={listID} className="containerCard">
      <div>
        <h2>{props.title}</h2>
        <ul
          className="card-list-ul"
          onDragOver={handleDragOverList} 
          onDrop={handleDrop}
        >
          {listCards}
          
          {dropIndex === cards.length && <div className="slot"></div>}
        </ul>

        <div className="add-card-container">
          {clickButton ? (
            <input
              type="text"
              autoFocus={true}
              onBlur={() => setClickButton(false)}
              placeholder="Enter title..."
              className="card-input"
              onKeyDown={async (e) => {
                if (e.key !== 'Enter') return;
                if (!e.currentTarget.value.trim()) return; 
                
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
        </div>
      </div>
    </div>
  );
};