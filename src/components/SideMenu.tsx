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
  orderedItems: OrderedCSVItem[];
  currentPage: string;
  onNavigation: (page: string) => void;
  onCreateOrder: () => void;
  onExport: () => void;
  onRefresh: () => void;
  forceFallback: boolean;
  onToggleFallback: (enabled: boolean) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ 
  orderedItems, 
  currentPage, 
  onNavigation, 
  onCreateOrder, 
  onExport, 
  onRefresh,
  forceFallback,
  onToggleFallback
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
    {
      key: 'tags',
      label: 'Tags',
      icon: IconTags,
      description: 'Manage tags and labels'
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
              orderedItems.length > 0 && (
                <Badge size="sm" color="white" c="blue">
                  {orderedItems.length}
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

        {/* Data Source Section */}
        <div>
          <Text size="sm" fw={600} mb="xs" style={{ color: '#000' }}>
            Data Source
          </Text>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <IconDatabase size={16} style={{ color: forceFallback ? '#666' : '#000' }} />
              <Text size="sm" style={{ color: forceFallback ? '#666' : '#000' }}>
                {forceFallback ? 'CSV Mode' : 'Database Mode'}
              </Text>
            </Group>
            <Switch
              size="sm"
              checked={forceFallback}
              onChange={(event) => onToggleFallback(event.currentTarget.checked)}
              onLabel="CSV"
              offLabel="DB"
            />
          </Group>
          <Text size="xs" c="dimmed" mb="md">
            {forceFallback 
              ? 'Using Google Sheets CSV directly' 
              : 'Using Supabase database with CSV fallback'
            }
          </Text>
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