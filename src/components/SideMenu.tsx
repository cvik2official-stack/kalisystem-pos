import React, { useState } from 'react';
import { Stack, Text, Button, Badge, Divider, Group, Switch } from '@mantine/core';
import {
  IconShoppingCart,
  IconTable,
  IconClipboardList,
  IconUsers,
  IconCategory,
  IconTruck,
  IconTags,
  IconFileImport,
  IconDownload,
  IconRefresh,
  IconCloud,
  IconDatabase,
  IconShoppingBag
} from '@tabler/icons-react';
import { OrderedCSVItem } from '../types';
import CSVImport from './CSVImport';
import GoogleSheetsSync from './GoogleSheetsSync';

interface SideMenuProps {
  cartItems: any[];
  itemCount: number;
  currentPage: string;
  onNavigation: (page: string) => void;
  onCreateOrder: () => void;
  onExport: () => void;
  onRefresh: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  cartItems,
  itemCount,
  currentPage,
  onNavigation,
  onCreateOrder,
  onExport,
  onRefresh
}) => {
  const [csvImportOpened, setCsvImportOpened] = useState(false);
  const [googleSyncOpened, setGoogleSyncOpened] = useState(false);

  const menuItems = [
    {
      key: 'items',
      label: 'Items',
      icon: IconTable,
      description: 'Browse and manage items'
    },
    {
      key: 'carts',
      label: 'Carts',
      icon: IconShoppingBag,
      description: 'Manage saved carts'
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: IconClipboardList,
      description: 'View order history'
    },
    {
      key: 'users',
      label: 'Users',
      icon: IconUsers,
      description: 'Manage users and roles'
    },
    {
      key: 'categories',
      label: 'Categories',
      icon: IconCategory,
      description: 'Organize item categories'
    },
    {
      key: 'suppliers',
      label: 'Suppliers',
      icon: IconTruck,
      description: 'Manage supplier information'
    },
  ];

  const handleImportClick = () => {
    setCsvImportOpened(true);
  };

  const handleGoogleSyncClick = () => {
    setGoogleSyncOpened(true);
  };

  const handleSyncComplete = () => {
    // Refresh the data after sync
    onRefresh();
  };

  return (
    <>
      <Stack gap="md">
        {/* Order Section */}
        <div>
          <Text size="sm" fw={600} mb="xs" style={{ color: '#000' }}>
            Current Order
          </Text>
          <Button
            fullWidth
            leftSection={<IconShoppingCart size={16} />}
            onClick={onCreateOrder}
            variant="filled"
            color="blue"
            rightSection={
              itemCount > 0 && (
                <Badge size="sm" color="white" c="blue">
                  {itemCount}
                </Badge>
              )
            }
          >
            View Cart
          </Button>
        </div>

        <Divider />

        {/* Navigation Section */}
        <div>
          <Text size="sm" fw={600} mb="xs" style={{ color: '#000' }}>
            Navigation
          </Text>
          <Stack gap="xs">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.key}
                  fullWidth
                  variant={currentPage === item.key ? 'filled' : 'subtle'}
                  leftSection={<Icon size={16} />}
                  onClick={() => onNavigation(item.key)}
                  justify="flex-start"
                  style={{ 
                    color: currentPage === item.key ? 'white' : '#000',
                    fontWeight: currentPage === item.key ? 600 : 400
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </div>

        <Divider />

        {/* Actions Section */}
        <div>
          <Text size="sm" fw={600} mb="xs" style={{ color: '#000' }}>
            Actions
          </Text>
          <Stack gap="xs">
            <Button
              fullWidth
              variant="subtle"
              leftSection={<IconFileImport size={16} />}
              onClick={handleImportClick}
              justify="flex-start"
              style={{ color: '#000' }}
            >
              Import CSV
            </Button>
            <Button
              fullWidth
              variant="subtle"
              leftSection={<IconCloud size={16} />}
              onClick={handleGoogleSyncClick}
              justify="flex-start"
              style={{ color: '#000' }}
            >
              Google Sheets Sync
            </Button>
            <Button
              fullWidth
              variant="subtle"
              leftSection={<IconDownload size={16} />}
              onClick={onExport}
              justify="flex-start"
              style={{ color: '#000' }}
            >
              Export Order
            </Button>
            <Button
              fullWidth
              variant="subtle"
              leftSection={<IconRefresh size={16} />}
              onClick={onRefresh}
              justify="flex-start"
              style={{ color: '#000' }}
            >
              Refresh Data
            </Button>
          </Stack>
        </div>
      </Stack>

      <CSVImport 
        opened={csvImportOpened} 
        onClose={() => setCsvImportOpened(false)} 
      />

      <GoogleSheetsSync
        opened={googleSyncOpened}
        onClose={() => setGoogleSyncOpened(false)}
        onSyncComplete={handleSyncComplete}
      />
    </>
  );
};

export default SideMenu;