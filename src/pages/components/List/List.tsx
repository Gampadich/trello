import instance from '../../../api/request';
import { useParams, Link } from 'react-router-dom';
import { useState, DragEvent, useEffect, Fragment } from 'react';
import { ICard } from '../interfaces/ICard';
import './List.css';
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
  const [localCards, setLocalCards] = useState<ICard[]>([]);
  const [placeholderIndex, setPlaceholderIndex] = useState<number | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (props.cards) {
      setLocalCards([...props.cards].sort((a, b) => a.position - b.position));
    }
  }, [props.cards]);

  useEffect(() => {
    if (props.cards && props.cards.length > 0) {
      const cardsForRedux: cardDetails[] = props.cards.map((card) => ({
        ...card,
        list_id: props.listId,
        listId: props.listId,
        description: card.description || '',
        users: card.users || []
      }));
      dispatch(uppertCards(cardsForRedux));
    }
    dispatch(upsertList({ id: props.listId, title: props.title }));
  }, [props.cards, props.listId, props.title, dispatch]);

  const handleDragStart = (e: DragEvent<HTMLLIElement>, card: ICard) => {
    e.dataTransfer.setData('cardId', card.id.toString());
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
      newIndex = localCards.length;
    } else {
      const domCards = Array.from(list.querySelectorAll('.card:not(.dragging)'));
      const indexInDom = domCards.indexOf(afterElement);
      newIndex = indexInDom;
    }

    if (newIndex !== placeholderIndex) {
      setPlaceholderIndex(newIndex);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLUListElement>) => {
    e.preventDefault();
    const cardIdString = e.dataTransfer.getData('cardId');
    const finalIndex = placeholderIndex;

    setPlaceholderIndex(null);
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));

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

  const listCardsRender = localCards.map((card, index) => (
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
          onDrop={handleDrop}
          style={{ minHeight: '50px', paddingBottom: '10px' }}
        >
          {listCardsRender}
          {placeholderIndex === localCards.length && <div className="slot"></div>}
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

                const title = e.currentTarget.value;
                const pos = localCards.length + 1;
                const date = new Date().toISOString();

                const tempCard: ICard = {
                  id: Date.now(),
                  title: title,
                  position: pos,
                  list_id: props.listId,
                  description: '',
                  users: [],
                  custom: { deadline: date }
                };
                setLocalCards([...localCards, tempCard]);
                e.currentTarget.value = "";

                try {
                  await instance.post(`/board/${id}/card`, {
                    title: title,
                    position: pos,
                    list_id: props.listId,
                    description: '',
                    custom: { deadline: date },
                  });
                  window.location.reload();
                } catch (err) {
                  console.error(err);
                }
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