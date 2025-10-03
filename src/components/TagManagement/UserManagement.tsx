import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Group, ActionIcon, Modal, TextInput, Select, Switch, ColorInput } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { User } from '../../types';
import { useTagManagement } from '../../hooks/useTagManagement';

const UserManagement: React.FC = () => {
  const { tagData, updateUsers, addUser } = useTagManagement();
  const users = tagData.users;
  const loading = false;

  const [opened, setOpened] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'driver' as User['role'],
    team: '',
    color: '#3498db',
    active: true,
  });

  const handleSubmit = () => {
    if (editingUser) {
      const updatedUsers = users.map(user =>
        user.id === editingUser.id ? { ...user, ...formData } : user
      );
      updateUsers(updatedUsers);
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
      };
      addUser(newUser);
    }
    setOpened(false);
    resetForm();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      role: user.role,
      team: user.team || '',
      color: user.color,
      active: user.active,
    });
    setOpened(true);
  };

  const handleDelete = (userId: string) => {
    updateUsers(users.filter(user => user.id !== userId));
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      role: 'driver',
      team: '',
      color: '#3498db',
      active: true,
    });
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  const rows = users.map((user) => (
    <Table.Tr key={user.id}>
      <Table.Td style={{ color: '#000' }}>{user.name}</Table.Td>
      <Table.Td>
        <Badge color={user.color} variant="filled">
          {user.role}
        </Badge>
      </Table.Td>
      <Table.Td style={{ color: '#000' }}>{user.team || '-'}</Table.Td>
      <Table.Td>
        <Switch checked={user.active} readOnly size="sm" />
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => handleEdit(user)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(user.id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Group justify="space-between" mb="md">
        <h3 style={{ color: '#000' }}>User Management</h3>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setOpened(true)}>
          Add User
        </Button>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Team</Table.Th>
            <Table.Th>Active</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={() => { setOpened(false); resetForm(); }} title={editingUser ? 'Edit User' : 'Add User'}>
        <TextInput
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          mb="md"
        />
        <Select
          label="Role"
          value={formData.role}
          onChange={(value) => setFormData({ ...formData, role: value as User['role'] })}
          data={[
            { value: 'admin', label: 'Admin' },
            { value: 'manager', label: 'Manager' },
            { value: 'driver', label: 'Driver' },
            { value: 'supplier', label: 'Supplier' },
            { value: 'owner', label: 'Owner' },
          ]}
          mb="md"
        />
        <TextInput
          label="Team"
          value={formData.team}
          onChange={(e) => setFormData({ ...formData, team: e.target.value })}
          mb="md"
        />
        <ColorInput
          label="Color"
          value={formData.color}
          onChange={(color) => setFormData({ ...formData, color })}
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
            {editingUser ? 'Update' : 'Add'}
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default UserManagement;