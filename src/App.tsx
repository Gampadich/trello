import { Board } from './pages/board/board';
import './styles/App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home/Home';
import { CardEditWindow } from './pages/components/CardEditWindow/CardEditWindow';
import { Provider } from 'react-redux';
import { store } from './ReduxApi/store';
import { LogIn } from './pages/Log in/logIn';
import { Register } from './pages/Register/register';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LogIn/>}/>
          <Route path='/register' element={<Register />} />
          <Route path="/board/:boardId/card/:cardId" element={<CardEditWindow />} />
          <Route path="/board/:id" element={<Board />} />
          <Route path="/trello" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
