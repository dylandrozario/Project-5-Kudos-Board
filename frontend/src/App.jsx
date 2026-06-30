import { useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage/HomePage';
import BoardPage from './pages/BoardPage/BoardPage';

function App() {
  const [route, setRoute] = useState({ name: 'home' });

  if (route.name === 'board') {
    return (
      <BoardPage
        boardId={route.boardId}
        onNavigateHome={() => setRoute({ name: 'home' })}
      />
    );
  }

  return <HomePage onBoardClick={(boardId) => setRoute({ name: 'board', boardId })} />;
}

export default App;
