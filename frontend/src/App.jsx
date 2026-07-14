import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { AlertProvider } from './contexts/AlertContext';
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

// Novas Páginas Acadêmicas
import ListasAcademicas from './pages/professor/ListasAcademicas';
import CriarLista from './pages/professor/CriarLista';
import ListasProfessor from './pages/aluno/ListasProfessor';

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
    // Redireciona dependendo do tipo do usuário logado
    if (user?.tipo === 'fornecedor') return <Navigate to="/fornecedor" />;
    if (user?.tipo === 'professor') return <Navigate to="/professor" />;
    if (user?.tipo === 'aluno') return <Navigate to="/aluno/listas" />;
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
      
      {/* Rotas Privadas (Catálogo) - Acessíveis para Dentistas, Alunos e Admins */}
      <Route path="/" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['cliente', 'aluno', 'admin']}>
            <Catalogo />
          </RoleRoute>
        </PrivateRoute>
      } />
      
      <Route path="/area/:id/categorias" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['cliente', 'aluno', 'admin']}>
            <Categorias />
          </RoleRoute>
        </PrivateRoute>
      } />

      <Route path="/categoria/:id/produtos" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['cliente', 'aluno', 'admin']}>
            <Produtos />
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* Painel do Dentista e do Aluno (Carrinho e Histórico) */}
      <Route path="/minhas-cotacoes" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['cliente', 'aluno', 'admin']}>
            <MinhasCotacoes />
          </RoleRoute>
        </PrivateRoute>
      } />

      <Route path="/cotacao/:id/respostas" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['cliente', 'aluno', 'admin']}>
            <VisualizarRespostas />
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* Painel do Professor */}
      <Route path="/professor" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['professor', 'admin']}>
            <ListasAcademicas />
          </RoleRoute>
        </PrivateRoute>
      } />

      <Route path="/professor/criar-lista" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['professor', 'admin']}>
            <CriarLista />
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* Painel do Aluno (Visualizar Listas) */}
      <Route path="/aluno/listas" element={
        <PrivateRoute>
          <RoleRoute allowedRoles={['aluno', 'admin']}>
            <ListasProfessor />
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
      <AlertProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="app-container">
              <AppRoutes />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;
