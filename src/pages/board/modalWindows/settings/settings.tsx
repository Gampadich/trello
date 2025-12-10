import { useState } from 'react'
import './settings.css'
import { ChangeColor } from '../components/changeColor/changeColor'
import { DeleteBoard } from '../components/deleteBoard/deleteBoard'

export const Settings = () => {
    const [changeColor, setChangeColor] = useState(false)
    const [deleteBoard, setDeleteBoard] = useState(false)

    return (
        <div className="settingsWindow">
            <h3 className='settingsTitle'>Settings</h3>
            <button className="changeColorButton" onClick={() => setChangeColor(true)}>Change color</button>
            {changeColor && <ChangeColor />}
            <button className="deleteBoard" onClick={() => setDeleteBoard(true)}>Delete board</button>
            {deleteBoard && <DeleteBoard />}
        </div>
    )
}