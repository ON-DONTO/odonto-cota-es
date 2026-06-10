import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { ArrowLeft, Plus, Trash2, Search, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

export default function CriarLista() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [semestre, setSemestre] = useState('');
  const [produtosCatalogo, setProdutosCatalogo] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itensEscolhidos, setItensEscolhidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProdutos() {
      try {
        const res = await api.get('/produtos?ativo=true');
        setProdutosCatalogo(res.data);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        setError('Não foi possível carregar os produtos do catálogo.');
      } finally {
        setLoadingProdutos(false);
      }
    }
    loadProdutos();
  }, []);

  function handleAddProduto(prod) {
    // Verifica se já está na lista
    const existIndex = itensEscolhidos.findIndex(item => item.produto_id === prod.id);
    if (existIndex > -1) {
      // Se existe, apenas incrementa a quantidade
      const novosItens = [...itensEscolhidos];
      novosItens[existIndex].quantidade += 1;
      setItensEscolhidos(novosItens);
    } else {
      // Se não, adiciona
      setItensEscolhidos([
        ...itensEscolhidos,
        {
          produto_id: prod.id,
          nome: prod.nome,
          marca: prod.marca || 'Sem Marca',
          quantidade: 1,
          observacao: ''
        }
      ]);
    }
  }

  function handleRemoveItem(prodId) {
    setItensEscolhidos(itensEscolhidos.filter(item => item.produto_id !== prodId));
  }

  function handleUpdateQuantity(prodId, qty) {
    const value = Math.max(1, parseInt(qty) || 1);
    setItensEscolhidos(
      itensEscolhidos.map(item => item.produto_id === prodId ? { ...item, quantidade: value } : item)
    );
  }

  function handleUpdateObservacao(prodId, obs) {
    setItensEscolhidos(
      itensEscolhidos.map(item => item.produto_id === prodId ? { ...item, observacao: obs } : item)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (itensEscolhidos.length === 0) {
      setError('Sua lista de materiais precisa de pelo menos 1 produto.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome,
        descricao,
        semestre,
        itens: itensEscolhidos.map(i => ({
          produto_id: i.produto_id,
          quantidade: i.quantidade,
          observacao: i.observacao
        }))
      };

      await api.post('/listas', payload);
      alert('Lista acadêmica criada com sucesso!');
      navigate('/professor');
    } catch (err) {
      console.error('Erro ao salvar lista acadêmica:', err);
      setError(err.response?.data?.error || 'Erro ao salvar a lista. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // Filtrar produtos pelo termo de busca
  const filteredProducts = produtosCatalogo.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.marca && p.marca.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Navbar />
      <main className="page-container">
        
        {/* Botão de voltar */}
        <button 
          onClick={() => navigate('/professor')} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--primary)', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '2rem', 
            fontWeight: '600' 
          }}
        >
          <ArrowLeft size={20} /> Voltar para o Painel
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '1rem' }}>
            <BookOpen size={32} />
          </div>
          <div>
            <h1 style={{ margin: 0, color: 'var(--text-h)' }}>Criar Lista de Materiais</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Adicione os materiais específicos para sua aula prática.</p>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', alignItems: 'start' }}>
            
            {/* Lado Esquerdo: Formulário e Escolha de Itens */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', color: 'var(--text-h)' }}>Informações Básicas</h3>
                
                <div className="input-group">
                  <label htmlFor="nome">Nome da Lista *</label>
                  <input 
                    type="text" 
                    id="nome" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Materiais Clínicos de Dentística I"
                    required 
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="semestre">Semestre / Período</label>
                  <input 
                    type="text" 
                    id="semestre" 
                    value={semestre}
                    onChange={(e) => setSemestre(e.target.value)}
                    placeholder="Ex: 2026.1, 4º Período"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="descricao">Descrição ou Recomendações</label>
                  <textarea 
                    id="descricao" 
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Recomendações de marcas ou informações sobre onde usar esses materiais nas aulas."
                    style={{ minHeight: '100px', width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              {/* Tabela de Itens Escolhidos */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-h)' }}>Produtos na Lista ({itensEscolhidos.length})</h3>
                
                {itensEscolhidos.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                    Nenhum produto adicionado ainda. Escolha produtos no painel à direita.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {itensEscolhidos.map(item => (
                      <div key={item.produto_id} style={{ padding: '1rem', background: 'var(--accent-bg)', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', width: '100%' }}>
                          <div style={{ flex: 1 }}>
                            <strong style={{ color: 'var(--text-h)' }}>{item.nome}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>{item.marca}</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input 
                              type="number" 
                              value={item.quantidade} 
                              min="1"
                              onChange={(e) => handleUpdateQuantity(item.produto_id, e.target.value)}
                              style={{ width: '60px', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                            />
                            <button 
                              type="button" 
                              onClick={() => handleRemoveItem(item.produto_id)} 
                              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <input 
                            type="text" 
                            value={item.observacao}
                            onChange={(e) => handleUpdateObservacao(item.produto_id, e.target.value)}
                            placeholder="Obs específica (ex: marca preferencial ou tamanho)"
                            style={{ 
                              width: '100%', 
                              fontSize: '0.8rem', 
                              padding: '0.4rem 0.6rem', 
                              borderRadius: '4px', 
                              border: '1px solid var(--border)',
                              background: 'white'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ padding: '1rem', width: '100%', fontSize: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Salvando Lista...' : 'Salvar Lista e Compartilhar'}
              </button>

            </div>

            {/* Lado Direito: Seletor de Produtos */}
            <div className="card" style={{ padding: '1.5rem', maxHeight: '720px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Sparkles size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, color: 'var(--text-h)' }}>Catálogo de Insumos</h3>
              </div>
              
              {/* Barra de Pesquisa */}
              <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  type="text" 
                  placeholder="Pesquise por resina, adesivo, luva..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Lista com scroll */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
                {loadingProdutos ? <p>Carregando catálogo...</p> : (
                  filteredProducts.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Nenhum produto correspondente.</p>
                  ) : (
                    filteredProducts.map(prod => (
                      <div 
                        key={prod.id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '0.75rem 1rem', 
                          border: '1px solid var(--border)', 
                          borderRadius: '0.75rem',
                          background: 'white',
                          transition: '0.2s',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: '1rem' }}>
                          <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-h)' }}>{prod.nome}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.categoria_nome} • {prod.marca || 'Sem Marca'}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleAddProduto(prod)}
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                        >
                          <Plus size={14} /> Adicionar
                        </button>
                      </div>
                    ))
                  )
                )}
              </div>

            </div>

          </div>
        </form>

      </main>
    </>
  );
}
