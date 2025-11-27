import { useState } from "react"
import "../componentStyles/Board.css"

export const Board = () => {
    const [title, setTitle] = useState('My test board')
    return (
        <header>{title}</header>
    )
}