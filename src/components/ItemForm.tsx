import React, { useState, useEffect } from 'react';
import { Modal, TextInput, Select, Button, Group, Collapse } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useTagManagement } from '../hooks/useTagManagement';
import { supabase } from '../lib/supabase';

interface ItemFormProps {
  item?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ item, onSubmit, onCancel }) => {
  const { tagData } = useTagManagement();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [measureUnits, setMeasureUnits] = useState<Array<{ value: string; label: string }>>([]);

  const form = useForm({
    initialValues: {
      Item_name: item?.Item_name || '',
      category: item?.category || '',
      default_supplier: item?.default_supplier || '',
      measure_unit: item?.measure_unit || '',
      brand_tag: item?.brand_tag || '',
      supplier_alternative: item?.supplier_alternative || '',
      order_quantity: item?.order_quantity || '',
      default_quantity: item?.default_quantity || ''
    },
    validate: {
      Item_name: (value) => (!value ? 'Item name is required' : null),
    },
  });

  useEffect(() => {
    fetchMeasureUnits();
  }, []);

  const fetchMeasureUnits = async () => {
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('tag_categories')
        .select('id')
        .eq('name', 'measure_unit')
        .maybeSingle();

      if (categoryError) throw categoryError;

      if (!categoryData) {
        console.error('measure_unit category not found');
        return;
      }

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('category_id', categoryData.id)
        .order('name', { ascending: true });

      if (error) throw error;

      const options = (data || []).map(tag => ({
        value: tag.name,
        label: tag.metadata?.full_name ? `${tag.metadata.full_name} (${tag.name})` : tag.name
      }));

      setMeasureUnits(options);
    } catch (error) {
      console.error('Error fetching measure units:', error);
    }
  };

  const handleFormSubmit = (values: any) => {
    const submitData = {
      ...values,
      category: values.category || 'new',
    };
    onSubmit(submitData);
  };

  const categoryOptions = tagData.categories
    .filter(cat => cat.level === 'category')
    .map(cat => ({
      value: cat.name,
      label: `${cat.icon} ${cat.name}`
    }));

  const supplierOptions = tagData.suppliers
    .filter(supplier => supplier.active)
    .map(supplier => ({
      value: supplier.name,
      label: supplier.name
    }));

  return (
    <Modal
      opened={true}
      onClose={onCancel}
      title={item ? 'Edit Item' : 'Create New Item'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleFormSubmit)}>
        <TextInput
          label="Item Name"
          placeholder="Enter item name"
          {...form.getInputProps('Item_name')}
          mb="md"
        />

        <Select
          label="Category"
          placeholder="Select a category"
          data={categoryOptions}
          {...form.getInputProps('category')}
          mb="md"
          searchable
        />
        
        <Select
          label="Default Supplier"
          placeholder="Select a supplier"
          data={supplierOptions}
          {...form.getInputProps('default_supplier')}
          mb="md"
          searchable
        />

        <Button
          variant="subtle"
          fullWidth
          onClick={() => setShowAdvanced(!showAdvanced)}
          rightSection={showAdvanced ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          mb="md"
        >
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </Button>

        <Collapse in={showAdvanced}>
          <Select
            label="Measure Unit"
            placeholder="Select measure unit"
            data={measureUnits}
            {...form.getInputProps('measure_unit')}
            mb="md"
            searchable
          />

          <TextInput
            label="Brand Tag"
            placeholder="Enter brand tag"
            {...form.getInputProps('brand_tag')}
            mb="md"
          />

          <TextInput
            label="Alternative Supplier"
            placeholder="Enter alternative supplier"
            {...form.getInputProps('supplier_alternative')}
            mb="md"
          />

          <TextInput
            label="Order Quantity"
            placeholder="Enter order quantity"
            {...form.getInputProps('order_quantity')}
            mb="md"
          />

          <TextInput
            label="Default Quantity"
            placeholder="Enter default quantity"
            {...form.getInputProps('default_quantity')}
            mb="md"
          />
        </Collapse>

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {item ? 'Update Item' : 'Create Item'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default ItemForm;
