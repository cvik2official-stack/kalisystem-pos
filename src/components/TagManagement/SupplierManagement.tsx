import React, { useState } from 'react';
import { Table, Badge, Button, Group, ActionIcon, Modal, TextInput, Switch, MultiSelect, NumberInput } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { Supplier, Category } from '../../types';
import { supabase } from '../../lib/supabase';
import { notifications } from '@mantine/notifications';

interface SupplierManagementProps {
  suppliers: Supplier[];
  categories: Category[];
  onUpdate: () => void;
}

const SupplierManagement: React.FC<SupplierManagementProps> = ({ suppliers, categories, onUpdate }) => {
  const [opened, setOpened] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    groupChatId: undefined as number | undefined,
    location: '',
    qrCode: '',
    priceList: '',
    tags: [] as string[],
    active: true,
    categories: [] as string[],
  });

  const handleSubmit = async () => {
    try {
      if (editingSupplier) {
        const { error } = await supabase
          .from('suppliers')
          .update({
            name: formData.name,
            supplier_contact: formData.contact || null,
            group_chat_id: formData.groupChatId || null,
            location: formData.location || null,
            qr_code: formData.qrCode || null,
            price_list: formData.priceList || null,
            tags: formData.tags,
            active: formData.active,
            categories: formData.categories
          })
          .eq('id', editingSupplier.id);

        if (error) throw error;
        notifications.show({
          title: 'Success',
          message: 'Supplier updated successfully',
          color: 'green'
        });
      } else {
        const { error } = await supabase
          .from('suppliers')
          .insert({
            name: formData.name,
            supplier_contact: formData.contact || null,
            group_chat_id: formData.groupChatId || null,
            location: formData.location || null,
            qr_code: formData.qrCode || null,
            price_list: formData.priceList || null,
            tags: formData.tags,
            active: formData.active,
            categories: formData.categories
          });

        if (error) throw error;
        notifications.show({
          title: 'Success',
          message: 'Supplier added successfully',
          color: 'green'
        });
      }
      onUpdate();
      setOpened(false);
      resetForm();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to save supplier',
        color: 'red'
      });
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact || '',
      groupChatId: supplier.groupChatId,
      location: supplier.location || '',
      qrCode: supplier.qrCode || '',
      priceList: supplier.priceList || '',
      tags: supplier.tags || [],
      active: supplier.active,
      categories: supplier.categories || [],
    });
    setOpened(true);
  };

  const handleDelete = async (supplierId: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

      if (error) throw error;
      notifications.show({
        title: 'Success',
        message: 'Supplier deleted successfully',
        color: 'green'
      });
      onUpdate();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to delete supplier',
        color: 'red'
      });
    }
  };

  const resetForm = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contact: '',
      groupChatId: undefined,
      location: '',
      qrCode: '',
      priceList: '',
      tags: [],
      active: true,
      categories: [],
    });
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: `${cat.icon} ${cat.name}`
  }));

  const handleToggleActive = async (supplier: Supplier, checked: boolean) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ active: checked })
        .eq('id', supplier.id);

      if (error) throw error;
      onUpdate();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update supplier status',
        color: 'red'
      });
    }
  };

  const rows = suppliers.map((supplier) => (
    <Table.Tr key={supplier.id}>
      <Table.Td>
        <Switch
          checked={supplier.active}
          onChange={(e) => handleToggleActive(supplier, e.currentTarget.checked)}
          size="sm"
        />
      </Table.Td>
      <Table.Td style={{ color: '#000' }}>{supplier.name}</Table.Td>
      <Table.Td style={{ color: '#000' }}>{supplier.contact || '-'}</Table.Td>
      <Table.Td style={{ color: '#000' }}>{supplier.groupChatId || '-'}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          {supplier.categories?.map(catId => {
            const category = categories.find(c => c.id === catId);
            return category ? (
              <Badge key={catId} size="sm" color={category.color}>
                {category.icon}
              </Badge>
            ) : null;
          })}
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => handleEdit(supplier)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(supplier.id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Group justify="space-between" mb="md">
        <h3 style={{ color: '#000' }}>Supplier Management</h3>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setOpened(true)}>
          Add Supplier
        </Button>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ color: '#000' }}>Active</Table.Th>
            <Table.Th style={{ color: '#000' }}>Name</Table.Th>
            <Table.Th style={{ color: '#000' }}>Contact</Table.Th>
            <Table.Th style={{ color: '#000' }}>Group Chat ID</Table.Th>
            <Table.Th style={{ color: '#000' }}>Categories</Table.Th>
            <Table.Th style={{ color: '#000' }}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={() => { setOpened(false); resetForm(); }} title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'} size="lg">
        <TextInput
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          mb="md"
          required
        />
        <TextInput
          label="Supplier Contact (Telegram Username)"
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          placeholder="@username"
          mb="md"
        />
        <NumberInput
          label="Group Chat ID"
          value={formData.groupChatId}
          onChange={(val) => setFormData({ ...formData, groupChatId: typeof val === 'number' ? val : undefined })}
          placeholder="Enter Telegram group chat ID"
          mb="md"
        />
        <TextInput
          label="Location URL"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="https://maps.google.com/..."
          mb="md"
        />
        <TextInput
          label="QR Code URL"
          value={formData.qrCode}
          onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
          placeholder="URL to QR code image"
          mb="md"
        />
        <TextInput
          label="Price List URL"
          value={formData.priceList}
          onChange={(e) => setFormData({ ...formData, priceList: e.target.value })}
          placeholder="URL to price list"
          mb="md"
        />
        <MultiSelect
          label="Categories"
          value={formData.categories}
          onChange={(value) => setFormData({ ...formData, categories: value })}
          data={categoryOptions}
          mb="md"
        />
        <Switch
          label="Active"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.currentTarget.checked })}
          mb="md"
        />
        <Group justify="flex-end">
          <Button variant="outline" onClick={() => { setOpened(false); resetForm(); }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingSupplier ? 'Update' : 'Add'}
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default SupplierManagement;
