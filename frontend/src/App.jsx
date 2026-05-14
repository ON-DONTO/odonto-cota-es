import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Catalogo from './pages/public/Catalogo';
import Categorias from './pages/public/Categorias';
import Produtos from './pages/public/Produtos';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MinhasCotacoes from './pages/dentista/MinhasCotacoes';
import CotacoesAbertas from './pages/fornecedor/CotacoesAbertas';
import ResponderCotacao from './pages/fornecedor/ResponderCotacao';
import VisualizarRespostas from './pages/dentista/VisualizarRespostas';
import GerenciarUsuarios from './pages/admin/GerenciarUsuarios';

// Componente para proteger rotas: se não estiver logado, joga pro Login
function PrivateRoute({ children }) {
  const { signed, loading } = useContext(AuthContext);

  if (loading) return <div>Carregando...</div>;

  return signed ? children : <Navigate to="/login" />;
}

// Componente para proteger rotas por TIPO de usuário
function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Carregando...</div>;

  if (!user || !allowedRoles.includes(user.tipo)) {
    // Se for fornecedor tentando acessar rota de cliente, manda pro painel dele
    if (user?.tipo === 'fornecedor') return <Navigate to="/fornecedor" />;
    // Caso contrário (cliente em rota de fornecedor), manda pro catálogo
    return <Navigate to="/" />;
  }

  return children;
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
          <RoleRoute allowedRoles={['cliente', 'admin']}>
            <Catalogo />
          </RoleRoute>
        </PrivateRoute>
      } />
      
      <Route path="/area/:id/categorias" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['cliente', 'admin']}>
            <Categorias />
          </RoleRoute>
        </PrivateRoute>
      } />

      <Route path="/categoria/:id/produtos" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['cliente', 'admin']}>
            <Produtos />
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* Painel do Dentista */}
      <Route path="/minhas-cotacoes" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['cliente', 'admin']}>
            <MinhasCotacoes />
          </RoleRoute>
        </PrivateRoute>
      } />

      <Route path="/cotacao/:id/respostas" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['cliente', 'admin']}>
            <VisualizarRespostas />
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* Painel do Fornecedor */}
      <Route path="/fornecedor" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['fornecedor', 'admin']}>
            <CotacoesAbertas />
          </RoleRoute>
        </PrivateRoute>
      } />

      <Route path="/fornecedor/responder/:id" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['fornecedor', 'admin']}>
            <ResponderCotacao />
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* Painel do Administrador */}
      <Route path="/admin/usuarios" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['admin']}>
            <GerenciarUsuarios />
          </RoleRoute>
        </PrivateRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="app-container">
            <AppRoutes />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
