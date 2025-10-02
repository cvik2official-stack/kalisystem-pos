import React from 'react';
import { Tabs, Container, Title } from '@mantine/core';
import { IconCategory, IconTruck, IconRuler, IconUsers } from '@tabler/icons-react';
import { useCategories } from '../../hooks/useCategories';
import { useSuppliers } from '../../hooks/useSuppliers';
import CategoryManagement from './CategoryManagement';
import SupplierManagement from './SupplierManagement';
import UserManagement from './UserManagement';
import MeasureUnitManagement from './MeasureUnitManagement';

interface TagManagementProps {
  initialView?: string;
}

const TagManagement: React.FC<TagManagementProps> = ({ initialView = 'categories' }) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { suppliers, loading: suppliersLoading } = useSuppliers();

  const getInitialTab = () => {
    if (initialView === 'users') return 'users';
    if (initialView === 'suppliers') return 'suppliers';
    if (initialView === 'tags') return 'units';
    return 'categories';
  };

  return (
    <Container size="xl" style={{ color: '#000' }} pt="md">
      <Title order={2} mb="lg" style={{ color: '#000' }}>Management</Title>
      <Tabs defaultValue={getInitialTab()}>
        <Tabs.List>
          <Tabs.Tab value="categories" leftSection={<IconCategory size={16} />}>
            Categories
          </Tabs.Tab>
          <Tabs.Tab value="suppliers" leftSection={<IconTruck size={16} />}>
            Suppliers
          </Tabs.Tab>
          <Tabs.Tab value="units" leftSection={<IconRuler size={16} />}>
            Measure Units
          </Tabs.Tab>
          <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
            Users
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="categories" pt="md">
          {categoriesLoading ? (
            <div>Loading categories...</div>
          ) : (
            <CategoryManagement
              categories={categories}
              onUpdate={(updatedCategories) => {
                console.log('Categories updated:', updatedCategories);
              }}
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="suppliers" pt="md">
          {suppliersLoading ? (
            <div>Loading suppliers...</div>
          ) : (
            <SupplierManagement
              suppliers={suppliers}
              categories={categories}
              onUpdate={(updatedSuppliers) => {
                console.log('Suppliers updated:', updatedSuppliers);
              }}
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="units" pt="md">
          <MeasureUnitManagement />
        </Tabs.Panel>

        <Tabs.Panel value="users" pt="md">
          <UserManagement />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default TagManagement;