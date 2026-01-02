import { useParams, Link } from 'react-router-dom';
import { useState, DragEvent, Fragment } from 'react';
import { ICard } from '../interfaces/ICard';
import './List.css';

interface CardProps {
  title: string;
  cards: ICard[];
  listId: number;
  onCardMove: (cardId: number, sourceListId: number, targetListId: number, newIndex: number) => void;
  onCardAdd: (listId: number, title: string) => void;
}

export const CardList = (props: CardProps) => {
  const { id } = useParams<{ id: string }>();
  const [clickButton, setClickButton] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState<number | null>(null);

  const sortedCards = [...props.cards].sort((a, b) => a.position - b.position);

  const handleDragStart = (e: DragEvent<HTMLLIElement>, card: ICard) => {
    e.dataTransfer.setData('cardId', card.id.toString());
    e.dataTransfer.setData('sourceListId', props.listId.toString());
    e.dataTransfer.effectAllowed = 'move';

    const target = e.currentTarget;
    setTimeout(() => {
      target.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e: DragEvent<HTMLLIElement>) => {
    e.currentTarget.classList.remove('dragging');
    setPlaceholderIndex(null);
  };

  const getDragAfterElement = (container: HTMLElement, y: number): Element | null => {
    const draggableElements = Array.from(container.querySelectorAll('.card:not(.dragging)'));
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY, element: null as Element | null }
    ).element;
  };

  const handleDragOver = (e: DragEvent<HTMLUListElement>) => {
    e.preventDefault();
    const list = e.currentTarget;
    const afterElement = getDragAfterElement(list, e.clientY);

    let newIndex;
    if (afterElement == null) {
      newIndex = sortedCards.length;
    } else {
      const domCards = Array.from(list.querySelectorAll('.card:not(.dragging)'));
      const indexInDom = domCards.indexOf(afterElement);
      newIndex = indexInDom;
    }

    if (newIndex !== placeholderIndex) {
      setPlaceholderIndex(newIndex);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLUListElement>) => {
    if (e.clientX === 0 && e.clientY === 0) return;

    const list = e.currentTarget;
    const rect = list.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return; 
    }

    setPlaceholderIndex(null);
  };

  const handleDrop = (e: DragEvent<HTMLUListElement>) => {
    e.preventDefault();
    const cardIdString = e.dataTransfer.getData('cardId');
    const sourceListIdString = e.dataTransfer.getData('sourceListId');
    const finalIndex = placeholderIndex;

    setPlaceholderIndex(null);
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));

    if (!cardIdString || finalIndex === null || !sourceListIdString) return;

    const cardId = Number(cardIdString);
    const sourceListId = Number(sourceListIdString);

    props.onCardMove(cardId, sourceListId, props.listId, finalIndex);
  };

  const listCardsRender = sortedCards.map((card, index) => (
    <Fragment key={card.id}>
      {placeholderIndex === index && <div className="slot"></div>}
      <li
        className="card"
        draggable={true}
        onDragStart={(e) => handleDragStart(e, card)}
        onDragEnd={handleDragEnd}
        style={{ listStyle: 'none', padding: 0 }}
      >
        <Link
          to={`/board/${id}/card/${card.id}`}
          className="link-content"
          draggable={false}
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
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ minHeight: '50px', paddingBottom: '10px' }}
        >
          {listCardsRender}
          {placeholderIndex === sortedCards.length && <div className="slot"></div>}
        </ul>

        <div className="add-card-container">
          {clickButton ? (
            <input
              type="text"
              autoFocus={true}
              onBlur={() => setClickButton(false)}
              placeholder="Enter title..."
              className="card-input"
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                if (!e.currentTarget.value.trim()) return;
                
                props.onCardAdd(props.listId, e.currentTarget.value);
                e.currentTarget.value = "";
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