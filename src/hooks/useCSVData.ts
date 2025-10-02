import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import { CSVItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxaY0FXgYSKVrYoo-1k9bkSQDjZPKwpOnvQbYWB1QW4XT9rwU0GJUq4lN0YLRMXKXS4XHi2MsTfZLM/pub?gid=917352588&single=true&output=csv';

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const useCSVData = (forceFallback: boolean = false) => {
  const [items, setItems] = useState<CSVItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchCSVFallback = async (): Promise<CSVItem[]> => {
    console.log('Using CSV fallback mode...');
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch CSV data');
    }
    
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          resolve(results.data as CSVItem[]);
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  };
  const fetchItemsData = async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(forceFallback);
    console.log('fetchItemsData called with forceFallback:', forceFallback);
    
    try {
      if (forceFallback) {
        console.log('Manual fallback mode activated - using CSV directly');
        const csvItems = await fetchCSVFallback();
        console.log('CSV items loaded:', csvItems.length);
        setItems(csvItems);
        setUsingFallback(true);
        setLoading(false);
        return;
      }

      // Try database first (only if not forced to fallback)
      if (!supabase) {
        console.warn('Supabase not configured, falling back to CSV');
        const csvItems = await fetchCSVFallback();
        setItems(csvItems);
        setUsingFallback(true);
        setLoading(false);
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.warn('Database error, falling back to CSV:', supabaseError.message);
        // Fallback to CSV
        const csvItems = await fetchCSVFallback();
        setItems(csvItems);
        setUsingFallback(true);
        setLoading(false);
        return;
      }

      // Map Supabase data to CSVItem format
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
      setLoading(false);
    } catch (err) {
      console.warn('Database failed, trying CSV fallback:', err);
      try {
        // Fallback to CSV
        const csvItems = await fetchCSVFallback();
        setItems(csvItems);
        setUsingFallback(true);
        setLoading(false);
      } catch (csvError) {
        setError(csvError instanceof Error ? csvError.message : 'Failed to fetch items from both database and CSV');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchItemsData();
  }, [forceFallback]);

  return {
    items,
    loading,
    error,
    usingFallback,
    refetch: fetchItemsData
  };
};