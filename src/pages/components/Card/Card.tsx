interface Card{
    title : string
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Card = (props : Card) => {
    return (
        <h1>{props.title}</h1>
    )
}