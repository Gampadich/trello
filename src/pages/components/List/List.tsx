import instance from '../../../api/request';
import { useParams } from 'react-router-dom';
import { useState, DragEvent, useRef } from 'react';
import { ICard } from '../interfaces/ICard';
import './List.css';
import { Link } from 'react-router-dom';

interface CardProps {
  title: string;
  cards: ICard[];
  listId: number;
}

export const CardList = (props: CardProps) => {
  const { id } = useParams<{ id: string }>();
  const [clickButton, setClickButton] = useState(false);
  const dragTimeout = useRef<NodeJS.Timeout | null>(null);

  const cards = [...props.cards].sort((a, b) => a.position - b.position);

  const handleDragStart = (e: DragEvent<HTMLLIElement>, card: ICard) => {
    e.dataTransfer.setData('cardId', card.id.toString());
    e.dataTransfer.setData('originListId', props.listId.toString());
    e.dataTransfer.effectAllowed = 'move';

    const target = e.currentTarget;
    target.style.transition = 'none';
    target.style.transform = 'rotate(5deg)';

    dragTimeout.current = setTimeout(() => {
      target.style.transition = '';
      target.style.transform = '';
      target.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e: DragEvent<HTMLLIElement>) => {
    if (dragTimeout.current) clearTimeout(dragTimeout.current);

    const target = e.currentTarget;
    target.classList.remove('dragging');
    target.style.transform = '';
    target.style.transition = '';

    document.querySelectorAll('.slot').forEach((el) => el.remove());
    document.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
  };

  const handleDragOver = (e: DragEvent<HTMLUListElement>) => {
    e.preventDefault();
    const list = e.currentTarget;
    list.classList.add('drag-over');

    const afterElement = getDragAfterElement(list, e.clientY);
    let slot = document.querySelector('.slot');
    if (!slot) {
      slot = document.createElement('div');
      slot.classList.add('slot');
    }
    if (afterElement === null) {
      list.appendChild(slot);
    } else {
      list.insertBefore(slot, afterElement);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLUListElement>) => {
    const list = e.currentTarget;
    if (!list.contains(e.relatedTarget as Node)) {
      list.classList.remove('drag-over');
    }
  };

  const handleDrop = async (e: DragEvent<HTMLUListElement>) => {
    e.preventDefault();
    const list = e.currentTarget;
    list.classList.remove('drag-over');
    const cardIdString = e.dataTransfer.getData('cardId');
    const slot = list.querySelector('.slot');
    if (slot && cardIdString) {
      const cardId = Number(cardIdString);
      const allChildren = Array.from(list.children);
      const newIndex = allChildren.indexOf(slot);
      const newPosition = newIndex + 1;
      slot.remove();
      try {
        await instance.put(`/board/${id}/card`, [{ id: cardId, position: newPosition, list_id: props.listId }]);
        window.location.reload();
      } catch (error) {
        console.error('Error moving card:', error);
      }
    }
  };

  const getDragAfterElement = (container: HTMLElement, y: number): Element | null => {
    const draggableElements = Array.from(container.querySelectorAll('.card:not(.dragging):not(.slot)'));
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

  const listCards = cards.map((card) => (
    <Link key={card.id} to={`/board/${id}/card/${card.id}`} className='link'>
      <li
        className="card"
        draggable={true}
        onDragStart={(e) => handleDragStart(e, card)}
        onDragEnd={handleDragEnd}
      >
        {card.color && <div className="card-label" style={{ background: card.color }}></div>}
        {card.title}
      </li>
    </Link>
  ));

  const listID = props.listId.toString();

  return (
    <div id={listID} className="containerCard">
      <div>
        <h2>{props.title}</h2>
        <ul
          className="card-list-ul"
          onDragOver={handleDragOver}
          onDragEnter={(e) => e.currentTarget.classList.add('drag-over')}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {listCards}
        </ul>
        <div className="add-card-container">
          {clickButton ? (
            <input
              type="text"
              autoFocus={true}
              onBlur={() => setClickButton(false)}
              placeholder="Enter a title for this card..."
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
        </div>
      </div>
    </div>
  );
};
