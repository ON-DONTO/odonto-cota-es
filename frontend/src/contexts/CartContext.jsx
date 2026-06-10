import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);

  // Chave única para cada usuário
  const cartKey = user ? `on_donto_cart_${user.id}` : 'on_donto_cart_guest';

  // Carrega do localStorage ao iniciar ou ao trocar de usuário
  useEffect(() => {
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      setCart([]);
    }
  }, [cartKey]);

  // Salva no localStorage sempre que o cart mudar
  useEffect(() => {
    if (user) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, cartKey, user]);

  function addToCart(produto) {
    setCart(prev => {
      const exists = prev.find(item => item.id === produto.id);
      if (exists) {
        return prev.map(item => 
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
  }

  function removeFromCart(produtoId) {
    setCart(prev => prev.filter(item => item.id !== produtoId));
  }

  function updateQuantity(produtoId, quantidade) {
    if (quantidade < 1) return;
    setCart(prev => prev.map(item => 
      item.id === produtoId ? { ...item, quantidade } : item
    ));
  }

  function importListToCart(produtosLista) {
    // produtosLista: Array de { id, nome, marca, quantidade }
    setCart(prev => {
      const newCart = [...prev];
      for (const item of produtosLista) {
        const existIndex = newCart.findIndex(cItem => cItem.id === item.id);
        if (existIndex > -1) {
          newCart[existIndex].quantidade += item.quantidade;
        } else {
          newCart.push({
            id: item.id,
            nome: item.nome,
            marca: item.marca,
            quantidade: item.quantidade
          });
        }
      }
      return newCart;
    });
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, importListToCart }}>
      {children}
    </CartContext.Provider>
  );
}
