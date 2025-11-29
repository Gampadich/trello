import { Board } from './pages/board/board';
import "./styles/App.css"
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/board' element={<Board/>}/>
        <Route path='/'/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
