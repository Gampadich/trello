import { ICard } from "../interfaces/ICard"

interface CardProps {
    title : string
    cards : ICard[]
}

export const CardList = (props : CardProps) => {
    return (
        <>
            <h2>{props.title}</h2>
        </>
    )
}