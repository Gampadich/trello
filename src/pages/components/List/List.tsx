import { ICard } from "../interfaces/ICard"

interface CardProps {
    title : string
    cards : ICard[]
}

export const CardList = (props : CardProps) => {
    const cards = props.cards
    const listCards = cards.map((title) => (
        <li key={title.id}>{title.title}</li>
    ))
    return (
        <>
            <h2>{props.title}</h2>
            <ul>
                {listCards}
                <button>+ Add Card</button>
            </ul>
        </>
    )
}