import { useState } from "react"
import { Card } from "../components/Board/Board"
import './Home.css'

export const Home = () => {
    const [cards, setCards] = useState([
        {id: 1, title: "покупки", custom: {background: "red"}},
        {id: 2, title: "підготовка до весілля", custom: {background: "green"}},
        {id: 3, title: "розробка інтернет-магазину", custom: {background: "blue"}},
        {id: 4, title: "курс по просуванню у соцмережах", custom: {background: "grey"}}
    ])
    return(
        <>
            <h1>My tables</h1>
            <Card cards={cards}/>
        </>
    )
}