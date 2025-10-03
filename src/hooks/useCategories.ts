import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('categories')
        .select('*')
        .order('order_number', { ascending: true });

      if (supabaseError) {
        throw supabaseError;
      }

      const mappedCategories: Category[] = (data || []).map(cat => {
        const nameStr = cat.name || '';
        const emojiMatch = nameStr.match(/^([\u{1F300}-\u{1F9FF}])/u);
        const icon = emojiMatch ? emojiMatch[1] : '📋';

        return {
          id: cat.id,
          name: nameStr,
          color: cat.color,
          icon: icon,
          parentId: cat.parent_id || undefined,
          level: cat.level as 'parent' | 'main' | 'category' | 'subcategory',
          order: cat.order_number
        };
      });

      setCategories(mappedCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};
