import React, { useState } from 'react';
import { Modal, TextInput, Select, Button, Group, Collapse } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useTagManagement } from '../hooks/useTagManagement';

interface ItemFormProps {
  item?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ item, onSubmit, onCancel }) => {
  const { tagData } = useTagManagement();
  const [showAdvanced, setShowAdvanced] = useState(!!item);
  
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

  const handleFormSubmit = (values: any) => {
    onSubmit(values);
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

  const unitOptions = tagData.measureUnits.map(unit => ({
    value: unit.symbol,
    label: `${unit.name} (${unit.symbol})`
  }));

  return (
    <Modal
      opened={true}
      onClose={onCancel}
      title={item ? 'Edit Item' : 'Add New Item'}
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
          label="Measure Unit"
          placeholder="Select measure unit"
          data={unitOptions}
          {...form.getInputProps('measure_unit')}
          mb="md"
          searchable
        />

        <Select
          label="Category"
          placeholder="Select a category"
          data={categoryOptions}
          {...form.getInputProps('category')}
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
          {showAdvanced ? 'Show Less' : 'Show More'}
        </Button>

        <Collapse in={showAdvanced}>
          <Select
            label="Default Supplier"
            placeholder="Select a supplier"
            data={supplierOptions}
            {...form.getInputProps('default_supplier')}
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
            {item ? 'Update' : 'Add'} Item
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default ItemForm;