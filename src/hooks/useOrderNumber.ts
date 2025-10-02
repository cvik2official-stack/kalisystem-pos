import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const useOrderNumber = () => {
  const [nextOrderNumber, setNextOrderNumber] = useState<string>('0001');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNextOrderNumber = async () => {
    if (!supabase) {
      setError('Supabase not configured');
      return '0001';
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('generate_order_number');

      if (error) throw error;

      const orderNumber = data || '0001';
      setNextOrderNumber(orderNumber);
      return orderNumber;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order number');
      return '0001';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextOrderNumber();
  }, []);

  return {
    nextOrderNumber,
    fetchNextOrderNumber,
    loading,
    error
  };
};
