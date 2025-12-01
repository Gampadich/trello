import { Board } from './pages/board/board';
import "./styles/App.css"
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/board/:id' element={<Board/>}/>
        <Route path='/trello' element={<Home/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
