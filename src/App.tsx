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
import { useCart } from './hooks/useCart';
import { useTelegramWebApp } from './hooks/useTelegramWebApp';
import SideMenu from './components/SideMenu';
import MasterTable from './components/MasterTable';
import ShoppingCart from './components/ShoppingCart';
import OrderTable from './components/OrderTable';
import CartManagement from './components/CartManagement';
import TagManagement from './components/TagManagement/TagManagement';
import { notifications } from '@mantine/notifications';
import { supabase } from './lib/supabase';
import Papa from 'papaparse';

const App: React.FC = () => {
  const [opened, { toggle }] = useDisclosure();
  const [cartOpened, setCartOpened] = useState(false);
  const [saveCartModalOpened, setSaveCartModalOpened] = useState(false);
  const [cartName, setCartName] = useState('');
  const [currentPage, setCurrentPage] = useState('items');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  const { items, loading, error, refetch } = useItems();
  const { items: cartItems, addItem, updateQuantity, removeItem, clearCart, saveCart, totalQuantity, itemCount } = useCart();
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

    if (!user) {
      notifications.show({
        title: 'Error',
        message: 'Telegram user not found',
        color: 'red'
      });
      return;
    }

    const cartId = await saveCart(cartName, user.id, false);
    if (cartId) {
      notifications.show({
        title: 'Cart Saved',
        message: `Cart "${cartName}" saved successfully`,
        color: 'green'
      });
    }

    setSaveCartModalOpened(false);
    setCartName('');
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      notifications.show({
        title: 'Empty Cart',
        message: 'Add items to cart before placing an order',
        color: 'orange'
      });
      return;
    }

    // Use user ID if available, otherwise use a default for testing
    const userId = user?.id || 123456789;

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          telegram_user_id: userId,
          status: 'New',
          team_tags: []
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        item_name: item.item_name,
        quantity: item.quantity,
        category: item.category || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send order to Telegram
      if (user) {
        try {
          const telegramMessage = formatOrderForTelegram(orderData.order_number, cartItems);
          await sendOrderToTelegram(user.id, telegramMessage, cartItems);
        } catch (telegramError) {
          console.error('Failed to send to Telegram:', telegramError);
          // Don't fail the order if Telegram fails
        }
      }

      setCartOpened(false);
      clearCart();
      notifications.show({
        title: 'Order Created',
        message: `Order ${orderData.order_number} placed successfully with ${cartItems.length} items`,
        color: 'green'
      });
    } catch (err) {
      console.error('Error creating order:', err);
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to create order',
        color: 'red'
      });
    }
  };

  const formatOrderForTelegram = (orderNumber: string, items: any[]) => {
    const itemsList = items.map(item => `• ${item.item_name} x ${item.quantity}`).join('\n');
    return `🛒 New Order: ${orderNumber}\n\n${itemsList}\n\nTotal Items: ${items.length}`;
  };

  const sendOrderToTelegram = async (userId: number, message: string, items: any[]) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase environment variables not configured');
      return;
    }
    
    const webhookUrl = `${supabaseUrl}/functions/v1/telegram-webhook`;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        type: 'order',
        telegram_user_id: userId,
        message: message,
        items: items
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telegram webhook error:', errorText);
      throw new Error('Failed to send order to Telegram');
    }
  };

  const handleExport = () => {
    if (cartItems.length === 0) {
      notifications.show({
        title: 'No Items',
        message: 'Add items to cart before exporting',
        color: 'orange',
      });
      return;
    }

    // Convert cart items to CSV format
    const csvData = cartItems.map(item => ({
      Item_name: item.item_name,
      category: item.category || '',
      quantity: item.quantity
    }));

    const csv = Papa.unparse(csvData, {
      header: true,
      columns: ['Item_name', 'category', 'quantity']
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `cart-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    notifications.show({
      title: 'Export Successful',
      message: `Exported ${cartItems.length} items`,
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
            cartItems={cartItems}
            addItem={addItem}
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
        return <TagManagement initialView="users" />;
      case 'categories':
        return <TagManagement initialView="categories" />;
      case 'suppliers':
        return <TagManagement initialView="suppliers" />;
      default:
        return (
          <MasterTable
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
            cartItems={cartItems}
            addItem={addItem}
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
              cartItems={cartItems}
              itemCount={itemCount}
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
            cartItems={cartItems}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            clearCart={clearCart}
            totalQuantity={totalQuantity}
            itemCount={itemCount}
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
