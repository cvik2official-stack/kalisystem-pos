import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CSVItem } from '../types';

export const useItems = () => {
  const [items, setItems] = useState<CSVItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      const mappedItems: CSVItem[] = (data || []).map(item => ({
        Item_name: item.item_name,
        category: item.category || '',
        default_supplier: item.default_supplier || '',
        supplier_alternative: item.supplier_alternative || '',
        order_quantity: item.order_quantity || '',
        measure_unit: item.measure_unit || '',
        default_quantity: item.default_quantity || '',
        brand_tag: item.brand_tag || ''
      }));

      setItems(mappedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    error,
    refetch: fetchItems
  };
};
