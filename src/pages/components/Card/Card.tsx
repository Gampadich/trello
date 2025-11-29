interface Card{
    title : string
}

export const Card = (props : Card) => {
    return (
        <h1>{props.title}</h1>
    )
}