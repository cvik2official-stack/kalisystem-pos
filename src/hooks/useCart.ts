import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface CartItem {
  id?: string;
  item_name: string;
  quantity: number;
  category?: string;
}

export interface Cart {
  id?: string;
  cart_name: string;
  telegram_user_id: number;
  is_template: boolean;
  items: CartItem[];
  created_at?: string;
  updated_at?: string;
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        i => i.item_name === item.item_name && i.category === item.category
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity
        };
        return updated;
      }

      return [...prev, { ...item, id: crypto.randomUUID() }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const saveCart = async (
    cartName: string,
    telegramUserId: number,
    isTemplate: boolean = false
  ): Promise<string | null> => {
    if (!supabase) {
      setError('Supabase not configured');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: cartData, error: cartError } = await supabase
        .from('carts')
        .insert({
          cart_name: cartName,
          telegram_user_id: telegramUserId,
          is_template: isTemplate
        })
        .select()
        .single();

      if (cartError) throw cartError;

      const cartItems = items.map(item => ({
        cart_id: cartData.id,
        item_name: item.item_name,
        quantity: item.quantity,
        category: item.category
      }));

      const { error: itemsError } = await supabase
        .from('cart_items')
        .insert(cartItems);

      if (itemsError) throw itemsError;

      return cartData.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save cart');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async (cartId: string): Promise<boolean> => {
    if (!supabase) {
      setError('Supabase not configured');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId);

      if (itemsError) throw itemsError;

      setItems(
        cartItems.map(item => ({
          id: item.id,
          item_name: item.item_name,
          quantity: item.quantity,
          category: item.category
        }))
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    saveCart,
    loadCart,
    loading,
    error,
    itemCount: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0)
  };
};
