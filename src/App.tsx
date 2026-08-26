import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Planner from './pages/Planner';
import ContentList from './pages/ContentList';
import ContentEditor from './pages/ContentEditor';
import Ideas from './pages/Ideas';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="planner" element={<Planner />} />
          <Route path="content" element={<ContentList />} />
          <Route path="content/:id" element={<ContentEditor />} />
          <Route path="ideas" element={<Ideas />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
