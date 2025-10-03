import React, { useState, useEffect } from 'react';
import { Tabs, Container, Title } from '@mantine/core';
import { IconCategory, IconTruck, IconRuler, IconUsers } from '@tabler/icons-react';
import { useCategories } from '../../hooks/useCategories';
import { useSuppliers } from '../../hooks/useSuppliers';
import CategoryManagement from './CategoryManagement';
import SupplierManagement from './SupplierManagement';
import UserManagement from './UserManagement';

interface TagManagementProps {
  initialView?: string;
}

const TagManagement: React.FC<TagManagementProps> = ({ initialView = 'categories' }) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { suppliers, loading: suppliersLoading, refetch: refetchSuppliers } = useSuppliers();

  const getTabValue = (view: string) => {
    if (view === 'users') return 'users';
    if (view === 'suppliers') return 'suppliers';
    if (view === 'categories') return 'categories';
    return 'categories';
  };

  const [activeTab, setActiveTab] = useState<string>(getTabValue(initialView));

  useEffect(() => {
    setActiveTab(getTabValue(initialView));
  }, [initialView]);

  // Render the appropriate component based on initialView
  const renderComponent = () => {
    switch (initialView) {
      case 'categories':
        return categoriesLoading ? (
          <div>Loading categories...</div>
        ) : (
          <CategoryManagement
            categories={categories}
            onUpdate={(updatedCategories) => {
              console.log('Categories updated:', updatedCategories);
            }}
          />
        );
      case 'suppliers':
        return suppliersLoading ? (
          <div>Loading suppliers...</div>
        ) : (
          <SupplierManagement
            suppliers={suppliers}
            categories={categories}
            onUpdate={refetchSuppliers}
          />
        );
      case 'users':
        return <UserManagement />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <Container size="xl" style={{ color: '#000' }} pt="md">
      {renderComponent()}
    </Container>
  );
};

export default TagManagement;