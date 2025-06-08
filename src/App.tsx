import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import SelectedData from './SelectedData';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/selected" element={<SelectedData />} />
      </Routes>
    </Router>
  );
}

export default App;
