import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Catalogo from './pages/public/Catalogo';
import Categorias from './pages/public/Categorias';
import Produtos from './pages/public/Produtos';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Componente para proteger rotas: se não estiver logado, joga pro Login
function PrivateRoute({ children }) {
  const { signed, loading } = useContext(AuthContext);

  if (loading) return <div>Carregando...</div>;

  return signed ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { signed } = useContext(AuthContext);

  return (
    <Routes>
      {/* Se já estiver logado, não deixa acessar o login novamente */}
      <Route path="/login" element={signed ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={signed ? <Navigate to="/" /> : <Register />} />
      
      {/* Rotas Privadas (Catálogo) */}
      <Route path="/" element={
        <PrivateRoute>
          <Catalogo />
        </PrivateRoute>
      } />
      
      <Route path="/area/:id/categorias" element={
        <PrivateRoute>
          <Categorias />
        </PrivateRoute>
      } />

      <Route path="/categoria/:id/produtos" element={
        <PrivateRoute>
          <Produtos />
        </PrivateRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
