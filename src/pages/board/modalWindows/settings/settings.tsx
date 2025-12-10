import { useState } from 'react';
import './settings.css';
import { ChangeColor } from '../components/changeColor/changeColor';
import { DeleteBoard } from '../components/deleteBoard/deleteBoard';

interface SettingsProps {
  settingsOpen: () => void;
}

export const Settings = ({ settingsOpen }: SettingsProps) => {
  const [changeColor, setChangeColor] = useState(false);
  const [deleteBoard, setDeleteBoard] = useState(false);

  return (
    <div className='settings-overlay' onClick={() => settingsOpen()}>
      <div className="settingsWindow" onClick={(e) => e.stopPropagation()}>
        <h3 className="settingsTitle">Settings</h3>
        <button className="changeColorButton" onClick={() => setChangeColor(true)}>
          Change color
        </button>
        {changeColor && <ChangeColor />}
        <button className="deleteBoard" onClick={() => setDeleteBoard(true)}>
          Delete board
        </button>
        {deleteBoard && <DeleteBoard />}
      </div>
    </div>
  );
};
