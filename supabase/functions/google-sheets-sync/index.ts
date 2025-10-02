import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// The CSV URL for direct fetching without Google API authentication
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxaY0FXgYSKVrYoo-1k9bkSQDjZPKwpOnvQbYWB1QW4XT9rwU0GJUq4lN0YLRMXKXS4XHi2MsTfZLM/pub?gid=917352588&single=true&output=csv';

// Parse CSV text into array of objects
function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const items = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const item: any = {};
    headers.forEach((header, index) => {
      item[header] = values[index] || '';
    });
    items.push(item);
  }

  return items;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'sync-from-sheets':
      case 'sync-from-csv':
        // Fetch CSV directly from Google Sheets public URL
        const csvResponse = await fetch(CSV_URL);
        if (!csvResponse.ok) {
          throw new Error(`Failed to fetch CSV: ${csvResponse.statusText}`);
        }

        const csvText = await csvResponse.text();
        const parsedItems = parseCSV(csvText);

        if (parsedItems.length === 0) {
          return new Response(JSON.stringify({ error: 'No data found in CSV' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          });
        }

        // Map CSV data to database format
        const items = parsedItems.map((row: any) => ({
          item_name: row.Item_name || row.item_name || '',
          category: row.category || '',
          default_supplier: row.default_supplier || '',
          supplier_alternative: row.supplier_alternative || null,
          order_quantity: row.order_quantity || null,
          measure_unit: row.measure_unit || null,
          default_quantity: row.default_quantity || null,
          brand_tag: row.brand_tag || null
        }));

        // Clear existing items and insert new ones
        await supabaseClient.from('items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const { error: insertError } = await supabaseClient.from('items').insert(items);

        if (insertError) {
          throw new Error(`Failed to insert items: ${insertError.message}`);
        }

        return new Response(JSON.stringify({
          success: true,
          message: `Synced ${items.length} items from Google CSV to Supabase`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'sync-to-sheets':
        return new Response(JSON.stringify({
          error: 'Sync to Google Sheets requires API credentials. Please use the Google Sheets API sync method or export as CSV manually.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });

      case 'two-way-sync':
        // For now, just sync from CSV to Supabase (one-way)
        const twoWayResponse = await fetch(CSV_URL);
        if (!twoWayResponse.ok) {
          throw new Error(`Failed to fetch CSV: ${twoWayResponse.statusText}`);
        }

        const twoWayCsvText = await twoWayResponse.text();
        const twoWayItems = parseCSV(twoWayCsvText);

        if (twoWayItems.length === 0) {
          return new Response(JSON.stringify({ error: 'No data found in CSV' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          });
        }

        const dbItems = twoWayItems.map((row: any) => ({
          item_name: row.Item_name || row.item_name || '',
          category: row.category || '',
          default_supplier: row.default_supplier || '',
          supplier_alternative: row.supplier_alternative || null,
          order_quantity: row.order_quantity || null,
          measure_unit: row.measure_unit || null,
          default_quantity: row.default_quantity || null,
          brand_tag: row.brand_tag || null
        }));

        await supabaseClient.from('items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const { error: twoWayError } = await supabaseClient.from('items').insert(dbItems);

        if (twoWayError) {
          throw new Error(`Failed to sync items: ${twoWayError.message}`);
        }

        return new Response(JSON.stringify({
          success: true,
          message: `Synced ${dbItems.length} items from Google CSV to Supabase`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({
          error: 'Invalid action. Use: sync-from-sheets, sync-from-csv, or two-way-sync'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
    }

  } catch (error) {
    console.error('Error in google-sheets-sync:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});