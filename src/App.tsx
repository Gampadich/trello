import { Board } from './pages/board/Board';
import "./styles/App.css"
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { useState } from 'react';

function App() {
  const [move, isMove] = useState(false)
  return (
    <BrowserRouter>
      {move 
        ? <Link to='/board'><button onClick={() => isMove(false)}>To board page</button></Link> 
        : <Link to='/'><button onClick={() => isMove(true)}>To home page</button></Link>}
      <Routes>
        <Route path='/board' element={<Board/>}/>
        <Route path='/'/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
