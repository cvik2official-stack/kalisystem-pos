import React, { useState } from 'react';
import { Modal, Button, Group, Text, FileInput, Alert, Progress, Table } from '@mantine/core';
import { IconUpload, IconFileSpreadsheet, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

interface CSVImportProps {
  opened: boolean;
  onClose: () => void;
}

interface ImportItem {
  Item_name: string;
  category: string;
  default_supplier: string;
  supplier_alternative?: string;
  order_quantity?: string;
  measure_unit?: string;
  default_quantity?: string;
  brand_tag?: string;
}

const CSVImport: React.FC<CSVImportProps> = ({ opened, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<ImportItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  React.useEffect(() => {
    setDebugInfo(`Supabase URL: ${supabaseUrl ? 'Set' : 'Missing'}, Key: ${supabaseKey ? 'Set' : 'Missing'}`);
  }, []);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setPreviewData([]);
    setShowPreview(false);
    
    if (selectedFile) {
      // Parse CSV for preview
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        preview: 10, // Show first 10 rows for preview
        complete: (results) => {
          if (results.errors.length > 0) {
            notifications.show({
              title: '⚠️ CSV Parse Warning',
              message: 'Some rows may have formatting issues',
              color: 'orange',
            });
          }
          setPreviewData(results.data as ImportItem[]);
          setShowPreview(true);
        },
        error: (error) => {
          notifications.show({
            title: '❌ CSV Parse Error',
            message: error.message,
            color: 'red',
          });
        }
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;

    if (!supabase) {
      notifications.show({
        title: 'Error',
        message: 'Supabase is not configured. Please check environment variables.',
        color: 'red',
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const items = results.data as ImportItem[];
          const totalItems = items.length;

          if (totalItems === 0) {
            notifications.show({
              title: '⚠️ No Data',
              message: 'The CSV file contains no valid data',
              color: 'orange',
            });
            setImporting(false);
            return;
          }

          let successful = 0;
          let skipped = 0;
          let errors = 0;

          // Process items one by one to avoid batch conflicts
          for (let i = 0; i < items.length; i++) {
            const item = items[i];

            console.log(`Processing item ${i + 1}/${totalItems}:`, item.Item_name);

            // Skip items with missing required fields
            if (!item.Item_name || !item.category || !item.default_supplier) {
              console.log('Skipping item - missing required fields');
              skipped++;
              setProgress(((i + 1) / totalItems) * 100);
              continue;
            }

            try {
              console.log('Checking if item exists...');
              // Check if item already exists
              const { data: existingItem, error: selectError } = await supabase!
                .from('items')
                .select('id')
                .eq('item_name', item.Item_name)
                .eq('default_supplier', item.default_supplier)
                .single();

              if (selectError && selectError.code !== 'PGRST116') {
                console.error('Select error:', selectError);
                errors++;
                setProgress(((i + 1) / totalItems) * 100);
                continue;
              }

              const dbItem = {
                item_name: item.Item_name,
                category: item.category,
                default_supplier: item.default_supplier,
                supplier_alternative: item.supplier_alternative || null,
                order_quantity: item.order_quantity || null,
                measure_unit: item.measure_unit || null,
                default_quantity: item.default_quantity || null,
                brand_tag: item.brand_tag || null,
              };

              if (existingItem) {
                console.log('Updating existing item...');
                // Update existing item
                const { error: updateError } = await supabase!
                  .from('items')
                  .update(dbItem)
                  .eq('id', existingItem.id);

                if (!updateError) {
                  successful++;
                } else {
                  console.error('Update error:', updateError);
                  errors++;
                }
              } else {
                console.log('Inserting new item...');
                // Insert new item
                const { error: insertError } = await supabase!
                  .from('items')
                  .insert([dbItem]);

                if (!insertError) {
                  successful++;
                } else {
                  console.error('Insert error:', insertError);
                  errors++;
                }
              }
            } catch (error) {
              console.error(`Error processing item ${item.Item_name}:`, error);
              errors++;
            }

            setProgress(((i + 1) / totalItems) * 100);
          }

          const message = `Successfully processed ${successful} items, skipped ${skipped} items, ${errors} errors`;

          notifications.show({
            title: '✅ Import Complete',
            message,
            color: 'green',
          });

          setImporting(false);
          setProgress(0);
          onClose();
        },
        error: (error) => {
          notifications.show({
            title: '❌ Import Error',
            message: error.message,
            color: 'red',
          });
          setImporting(false);
          setProgress(0);
        }
      });
    } catch (error) {
      notifications.show({
        title: '❌ Import Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        color: 'red',
      });
      setImporting(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    if (!importing) {
      setFile(null);
      setPreviewData([]);
      setShowPreview(false);
      setProgress(0);
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Import Items from CSV"
      size="xl"
      closeOnClickOutside={!importing}
      closeOnEscape={!importing}
    >
      <div className="space-y-4">
        <Alert icon={<IconFileSpreadsheet size={16} />} color="blue">
          <Text size="sm">
            Upload a CSV file with columns: Item_name, category, default_supplier, supplier_alternative, 
            order_quantity, measure_unit, default_quantity, brand_tag
          </Text>
        </Alert>

        {debugInfo && (
          <Alert color="gray">
            <Text size="xs">{debugInfo}</Text>
          </Alert>
        )}

        <FileInput
          label="Select CSV File"
          placeholder="Choose a CSV file to import"
          accept=".csv"
          value={file}
          onChange={handleFileSelect}
          leftSection={<IconUpload size={16} />}
          disabled={importing}
        />

        {showPreview && previewData.length > 0 && (
          <div>
            <Text size="sm" fw={500} mb="xs">
              Preview (first {previewData.length} rows):
            </Text>
            <div className="max-h-60 overflow-auto border rounded">
              <Table size="xs" striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Item Name</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Supplier</Table.Th>
                    <Table.Th>Unit</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {previewData.map((item, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>{item.Item_name}</Table.Td>
                      <Table.Td>{item.category}</Table.Td>
                      <Table.Td>{item.default_supplier}</Table.Td>
                      <Table.Td>{item.measure_unit || '-'}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          </div>
        )}

        {importing && (
          <div>
            <Text size="sm" mb="xs">
              Importing items... {Math.round(progress)}%
            </Text>
            <Progress value={progress} animated />
          </div>
        )}

        <Group justify="flex-end">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || importing}
            loading={importing}
            leftSection={<IconCheck size={16} />}
          >
            Import Items
          </Button>
        </Group>
      </div>
    </Modal>
  );
};

export default CSVImport;