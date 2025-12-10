import './settings.css'

export const Settings = () => {
    return (
        <div className="settingsWindow">
            <h3 className='settingsTitle'>Settings</h3>
            <button className="changeColorButton">Change color</button>
            <button className="deleteBoard">Delete board</button>
        </div>
    )
}