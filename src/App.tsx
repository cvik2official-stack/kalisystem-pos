import React, { useState, useEffect } from 'react';
import { MantineProvider, AppShell, Burger, Group, Title, Drawer, Modal, TextInput, Button, Stack } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import { useItems } from './hooks/useItems';
import { useTelegramWebApp } from './hooks/useTelegramWebApp';
import { OrderedCSVItem } from './types';
import SideMenu from './components/SideMenu';
import MasterTable from './components/MasterTable';
import ShoppingCart from './components/ShoppingCart';
import OrderTable from './components/OrderTable';
import CartManagement from './components/CartManagement';
import TagManagement from './components/TagManagement/TagManagement';
import { exportToCSV } from './utils/csvExport';
import { notifications } from '@mantine/notifications';

const App: React.FC = () => {
  const [opened, { toggle }] = useDisclosure();
  const [cartOpened, setCartOpened] = useState(false);
  const [saveCartModalOpened, setSaveCartModalOpened] = useState(false);
  const [cartName, setCartName] = useState('');
  const [orderedItems, setOrderedItems] = useState<OrderedCSVItem[]>([]);
  const [currentPage, setCurrentPage] = useState('items');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  const { items, loading, error, refetch } = useItems();
  const { user, isReady } = useTelegramWebApp();

  const toggleColorScheme = () => {
    setColorScheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const handleCreateOrder = () => {
    setCartOpened(true);
  };

  const handleSaveCart = () => {
    setSaveCartModalOpened(true);
  };

  const handleSaveCartConfirm = async () => {
    if (!cartName.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please enter a cart name',
        color: 'red'
      });
      return;
    }

    // TODO: Implement actual cart save to database with custom name
    // The cart name is for backend reference only, not displayed when creating orders

    setSaveCartModalOpened(false);
    setCartName('');
    notifications.show({
      title: 'Cart Saved',
      message: `Cart "${cartName}" saved successfully`,
      color: 'green'
    });
  };

  const handlePlaceOrder = async () => {
    if (orderedItems.length === 0) {
      notifications.show({
        title: 'Empty Cart',
        message: 'Add items to cart before placing an order',
        color: 'orange'
      });
      return;
    }

    if (!user) {
      notifications.show({
        title: 'Error',
        message: 'Telegram user not found',
        color: 'red'
      });
      return;
    }

    // Direct order creation without prompting for a name
    // TODO: Implement actual order creation to database

    setCartOpened(false);
    setOrderedItems([]);
    notifications.show({
      title: 'Order Created',
      message: `Order placed successfully with ${orderedItems.length} items`,
      color: 'green'
    });
  };

  const handleExport = () => {
    if (orderedItems.length === 0) {
      notifications.show({
        title: 'No Items',
        message: 'Add items to cart before exporting',
        color: 'orange',
      });
      return;
    }

    exportToCSV(orderedItems);
    notifications.show({
      title: 'Export Successful',
      message: `Exported ${orderedItems.length} items`,
      color: 'green',
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'items':
        return (
          <MasterTable
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
            orderedItems={orderedItems}
            setOrderedItems={setOrderedItems}
            items={items}
            loading={loading}
            error={error}
            refetch={refetch}
          />
        );
      case 'carts':
        return (
          <CartManagement
            telegramUserId={user?.id}
            onUseCart={(cartId) => {
              console.log('Use cart:', cartId);
              notifications.show({
                title: 'Cart Loaded',
                message: 'Cart loaded successfully',
                color: 'green'
              });
            }}
          />
        );
      case 'orders':
        return <OrderTable />;
      case 'users':
      case 'categories':
      case 'suppliers':
      case 'tags':
        return <TagManagement initialView={currentPage} />;
      default:
        return (
          <MasterTable
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
            orderedItems={orderedItems}
            setOrderedItems={setOrderedItems}
            items={items}
            loading={loading}
            error={error}
            refetch={refetch}
          />
        );
    }
  };

  return (
    <MantineProvider>
      <ModalsProvider>
        <Notifications position="top-right" />
        <AppShell
          header={{ height: 60 }}
          navbar={{
            width: 280,
            breakpoint: 'sm',
            collapsed: { mobile: !opened },
          }}
          padding="md"
        >
          <AppShell.Header>
            <Group h="100%" px="md" justify="space-between">
              <Group>
                <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                <Title order={3}>Order Management</Title>
              </Group>
            </Group>
          </AppShell.Header>

          <AppShell.Navbar p="md">
            <SideMenu
              orderedItems={orderedItems}
              currentPage={currentPage}
              onNavigation={setCurrentPage}
              onCreateOrder={handleCreateOrder}
              onExport={handleExport}
              onRefresh={refetch}
            />
          </AppShell.Navbar>

          <AppShell.Main>{renderPage()}</AppShell.Main>
        </AppShell>

        <Drawer
          opened={cartOpened}
          onClose={() => setCartOpened(false)}
          title="Shopping Cart"
          position="right"
          size="lg"
        >
          <ShoppingCart
            orderedItems={orderedItems}
            setOrderedItems={setOrderedItems}
            onSaveCart={handleSaveCart}
            onPlaceOrder={handlePlaceOrder}
            onClose={() => setCartOpened(false)}
            telegramUserId={user?.id}
          />
        </Drawer>

        <Modal
          opened={saveCartModalOpened}
          onClose={() => setSaveCartModalOpened(false)}
          title="Save Cart"
          centered
        >
          <Stack>
            <TextInput
              label="Cart Name"
              placeholder="Enter cart name"
              value={cartName}
              onChange={(e) => setCartName(e.target.value)}
            />
            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => setSaveCartModalOpened(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCartConfirm}>
                Save
              </Button>
            </Group>
          </Stack>
        </Modal>
      </ModalsProvider>
    </MantineProvider>
  );
};

export default App;
