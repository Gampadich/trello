import { useState } from "react"
import { ModalWindow } from "../ModalWindow/ModalWindow"
import { CardProps } from "../interfaces/CardProps"
import { Link } from "react-router-dom"

interface BoardProps {
    cards : CardProps[]
}

export const Board = (props : BoardProps) => {
    const [isClick, setClick] = useState(false)
    const cards = props.cards
    const listCards = cards.map((card) => <Link className="text-decoration-none" key={card.id} to={`/board/${card.id}`} state={{card}}><div className="card-item" style={card.custom}>{card.title}</div></Link>)
    return (
        <div className="cards-container">
            {listCards}
            <button className="add-board-button" onClick={() => setClick(true)}>+ Add Board</button>
            {isClick && <ModalWindow onClose={() => setClick(false)}/>}
        </div>
    )
}