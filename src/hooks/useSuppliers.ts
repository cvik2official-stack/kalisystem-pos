import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Supplier } from '../types';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

      if (supabaseError) {
        throw supabaseError;
      }

      const mappedSuppliers: Supplier[] = (data || []).map(sup => ({
        id: sup.id,
        name: sup.name,
        contact: sup.supplier_contact || undefined,
        email: undefined,
        color: '#3498db',
        active: sup.active ?? true,
        categories: sup.categories || undefined,
        groupChatId: sup.group_chat_id,
        location: sup.location,
        qrCode: sup.qr_code,
        priceList: sup.price_list,
        tags: sup.tags || []
      }));

      setSuppliers(mappedSuppliers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suppliers');
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    refetch: fetchSuppliers
  };
};
