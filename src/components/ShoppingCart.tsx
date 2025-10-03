import React, { useState, useEffect } from 'react';
import { Table, ActionIcon, Group, Text, Button, NumberInput, Modal } from '@mantine/core';
import { IconPlus, IconMinus, IconTrash, IconDeviceMobile } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';

interface ShoppingCartProps {
  cartItems: any[];
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  totalQuantity: number;
  itemCount: number;
  onSaveCart?: () => void;
  onPlaceOrder?: () => void;
  onClose: () => void;
  telegramUserId?: number;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ 
  cartItems, 
  updateQuantity, 
  removeItem, 
  clearCart, 
  totalQuantity, 
  itemCount, 
  onSaveCart, 
  onPlaceOrder, 
  onClose, 
  telegramUserId 
}) => {
  const { showMainButton, hideMainButton } = useTelegramWebApp();
  const [numpadOpened, setNumpadOpened] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [editingItemId, setEditingItemId] = useState<string>('');
  const [customQuantity, setCustomQuantity] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Show Telegram main button when cart has items
    if (cartItems.length > 0 && onPlaceOrder) {
      showMainButton('Create Order', onPlaceOrder);
    } else {
      hideMainButton();
    }

    // Cleanup on unmount
    return () => {
      hideMainButton();
    };
  }, [cartItems.length, onPlaceOrder, showMainButton, hideMainButton]);

  const incrementQuantity = (itemId: string) => {
    const item = cartItems.find(i => i.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
    }
  };

  const decrementQuantity = (itemId: string) => {
    const item = cartItems.find(i => i.id === itemId);
    if (item) {
      if (item.quantity <= 1) {
        removeItem(itemId);
        notifications.show({
          title: 'Item Removed',
          message: 'Item removed from cart',
          color: 'orange',
        });
      } else {
        updateQuantity(itemId, item.quantity - 1);
      }
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    notifications.show({
      title: 'Item Removed',
      message: 'Item removed from cart',
      color: 'orange',
    });
  };

  const openNumpad = (itemId: string, currentQuantity: number) => {
    setEditingItemId(itemId);
    setCustomQuantity(currentQuantity);
    setNumpadOpened(true);
  };

  const applyCustomQuantity = () => {
    if (editingItemId) {
      updateQuantity(editingItemId, customQuantity);
    }
    setNumpadOpened(false);
    setEditingItemId('');
  };

  const resetCart = () => {
    clearCart();
    notifications.show({
      title: 'Cart Reset',
      message: 'All items removed from cart',
      color: 'blue',
    });
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Text size="lg" c="dimmed" mb="md">Your cart is empty</Text>
        <Text size="sm" c="dimmed">Add items from the main table to get started</Text>
      </div>
    );
  }

  const rows = cartItems.map((item) => (
    <Table.Tr key={item.id} style={{ height: isMobile ? '36px' : '48px' }}>
      <Table.Td>
        <Text style={{ 
          color: '#000', 
          fontWeight: 500,
          fontSize: isMobile ? '12px' : '14px',
          padding: isMobile ? '2px 4px' : '4px 8px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: isMobile ? '120px' : '200px'
        }}>
          {item.item_name}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={isMobile ? 2 : 4} justify="center" wrap="nowrap">
          <ActionIcon
            variant="light"
            color="red"
            size={isMobile ? "xs" : "sm"}
            onClick={() => decrementQuantity(item.id)}
          >
            <IconMinus size={isMobile ? 12 : 14} />
          </ActionIcon>
          
          <Button
            variant="light"
            size={isMobile ? "xs" : "sm"}
            onClick={() => openNumpad(item.id, item.quantity)}
            style={{ 
              minWidth: isMobile ? '45px' : '60px',
              fontSize: isMobile ? '10px' : '12px',
              padding: isMobile ? '2px 6px' : '4px 8px'
            }}
          >
            {item.quantity.toFixed(2)}
          </Button>
          
          <ActionIcon
            variant="light"
            color="blue"
            size={isMobile ? "xs" : "sm"}
            onClick={() => incrementQuantity(item.id)}
          >
            <IconPlus size={isMobile ? 12 : 14} />
          </ActionIcon>
        </Group>
      </Table.Td>
      <Table.Td>
        <ActionIcon
          variant="light"
          color="red"
          size={isMobile ? "xs" : "sm"}
          onClick={() => handleRemoveItem(item.id)}
        >
          <IconTrash size={isMobile ? 14 : 16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <Text size="sm" c="dimmed">
          {itemCount} items • Total quantity: {totalQuantity.toFixed(2)}
        </Text>
      </div>

      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ color: '#000' }}>Item Name</Table.Th>
            <Table.Th style={{ color: '#000', textAlign: 'center' }}>Quantity</Table.Th>
            <Table.Th style={{ color: '#000', textAlign: 'center' }}>Remove</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Group justify="space-between" mt="lg">
        <Button
          variant="outline"
          color="red"
          onClick={resetCart}
        >
          Reset Cart
        </Button>
        <Group gap="sm">
          {onSaveCart && (
            <Button
              variant="outline"
              onClick={onSaveCart}
              disabled={cartItems.length === 0}
            >
              Save Cart
            </Button>
          )}
          {onPlaceOrder && (
            <Button
              onClick={onPlaceOrder}
              disabled={cartItems.length === 0}
            >
              Place Order
            </Button>
          )}
        </Group>
      </Group>

      {/* Custom Quantity Numpad Modal */}
      <Modal
        opened={numpadOpened}
        onClose={() => setNumpadOpened(false)}
        title="Set Quantity"
        size="sm"
        centered
      >
        <div style={{ textAlign: 'center' }}>
          <NumberInput
            value={customQuantity}
            onChange={(value) => setCustomQuantity(Number(value) || 0)}
            min={0}
            step={0.01}
            precision={2}
            size="lg"
            mb="md"
            leftSection={<IconDeviceMobile size={16} />}
          />
          <Group justify="center">
            <Button variant="outline" onClick={() => setNumpadOpened(false)}>
              Cancel
            </Button>
            <Button onClick={applyCustomQuantity}>
              Apply
            </Button>
          </Group>
        </div>
      </Modal>
    </>
  );
};

export default ShoppingCart;