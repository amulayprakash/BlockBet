import { Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { WalletProvider } from './contexts/WalletContext';
import { ModalProvider } from './contexts/ModalContext';

function App() {
  return (
    <WalletProvider>
      <ModalProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ModalProvider>
    </WalletProvider>
  );
}

export default App;

