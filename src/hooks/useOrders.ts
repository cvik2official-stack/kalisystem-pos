import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  telegram_user_id: string;
  order_id: string;
  item_name: string;
  quantity: number;
  category: string | null;
  created_at: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          telegram_user_id,
          created_at,
          order_items (
            item_name,
            quantity,
            category
          )
        `)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      const flattenedOrders: Order[] = [];
      (data || []).forEach((order: any) => {
        (order.order_items || []).forEach((item: any) => {
          flattenedOrders.push({
            id: crypto.randomUUID(),
            telegram_user_id: order.telegram_user_id.toString(),
            order_id: order.order_number,
            item_name: item.item_name,
            quantity: item.quantity,
            category: item.category,
            created_at: order.created_at
          });
        });
      });

      setOrders(flattenedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders
  };
};
