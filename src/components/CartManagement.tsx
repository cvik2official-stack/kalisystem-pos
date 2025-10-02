import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Button,
  Card,
  Text,
  Group,
  Stack,
  Badge,
  ActionIcon,
  TextInput,
  Modal,
  Grid,
  LoadingOverlay
} from '@mantine/core';
import {
  IconShoppingBag,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCopy,
  IconShoppingCart,
  IconSearch,
  IconStar,
  IconStarFilled
} from '@tabler/icons-react';
import { supabase } from '../lib/supabase';
import { notifications } from '@mantine/notifications';

interface Cart {
  id: string;
  cart_name: string;
  telegram_user_id: number;
  is_template: boolean;
  created_at: string;
  updated_at: string;
  item_count?: number;
  total_quantity?: number;
}

interface CartManagementProps {
  onUseCart?: (cartId: string) => void;
  telegramUserId?: number;
}

const CartManagement: React.FC<CartManagementProps> = ({
  onUseCart,
  telegramUserId = 0
}) => {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [cartToDelete, setCartToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadCarts();
  }, []);

  const loadCarts = async () => {
    setLoading(true);

    try {
      const { data: cartsData, error: cartsError } = await supabase
        .from('carts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (cartsError) throw cartsError;

      const cartsWithCounts = await Promise.all(
        (cartsData || []).map(async (cart) => {
          const { data: items, error: itemsError } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('cart_id', cart.id);

          if (itemsError) {
            return {
              ...cart,
              item_count: 0,
              total_quantity: 0
            };
          }

          const itemCount = items?.length || 0;
          const totalQuantity = items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

          return {
            ...cart,
            item_count: itemCount,
            total_quantity: totalQuantity
          };
        })
      );

      setCarts(cartsWithCounts);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to load carts',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCart = async () => {
    if (!cartToDelete) return;

    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', cartToDelete);

      if (error) throw error;

      notifications.show({
        title: 'Success',
        message: 'Cart deleted successfully',
        color: 'green'
      });

      loadCarts();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete cart',
        color: 'red'
      });
    } finally {
      setDeleteModalOpened(false);
      setCartToDelete(null);
    }
  };

  const handleDuplicateCart = async (cartId: string) => {

    try {
      const { data: originalCart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('id', cartId)
        .single();

      if (cartError) throw cartError;

      const { data: newCart, error: newCartError } = await supabase
        .from('carts')
        .insert({
          cart_name: `${originalCart.cart_name} (Copy)`,
          telegram_user_id: telegramUserId,
          is_template: false
        })
        .select()
        .single();

      if (newCartError) throw newCartError;

      const { data: originalItems, error: itemsError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId);

      if (itemsError) throw itemsError;

      if (originalItems && originalItems.length > 0) {
        const newItems = originalItems.map(item => ({
          cart_id: newCart.id,
          item_name: item.item_name,
          quantity: item.quantity,
          category: item.category
        }));

        const { error: insertError } = await supabase
          .from('cart_items')
          .insert(newItems);

        if (insertError) throw insertError;
      }

      notifications.show({
        title: 'Success',
        message: 'Cart duplicated successfully',
        color: 'green'
      });

      loadCarts();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to duplicate cart',
        color: 'red'
      });
    }
  };

  const handleToggleTemplate = async (cartId: string, currentValue: boolean) => {

    try {
      const { error } = await supabase
        .from('carts')
        .update({ is_template: !currentValue })
        .eq('id', cartId);

      if (error) throw error;

      notifications.show({
        title: 'Success',
        message: currentValue ? 'Removed from templates' : 'Added to templates',
        color: 'green'
      });

      loadCarts();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update cart',
        color: 'red'
      });
    }
  };

  const filteredCarts = carts.filter(cart =>
    cart.cart_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Saved Carts</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => onUseCart?.('new')}
          >
            New Cart
          </Button>
        </Group>

        <TextInput
          placeholder="Search carts..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <LoadingOverlay visible={loading} />

        {filteredCarts.length === 0 && !loading && (
          <Card withBorder p="xl">
            <Stack align="center" gap="md">
              <IconShoppingBag size={48} style={{ opacity: 0.5 }} />
              <Text c="dimmed" size="lg">
                {searchQuery ? 'No carts found' : 'No saved carts yet'}
              </Text>
              {!searchQuery && (
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => onUseCart?.('new')}
                >
                  Create Your First Cart
                </Button>
              )}
            </Stack>
          </Card>
        )}

        <Grid>
          {filteredCarts.map((cart) => (
            <Grid.Col key={cart.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card withBorder shadow="sm" padding="lg" h="100%">
                <Stack justify="space-between" h="100%">
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Group gap="xs">
                        <IconShoppingBag size={20} />
                        <Text fw={600} size="lg">
                          {cart.cart_name}
                        </Text>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        color={cart.is_template ? 'yellow' : 'gray'}
                        onClick={() => handleToggleTemplate(cart.id, cart.is_template)}
                      >
                        {cart.is_template ? (
                          <IconStarFilled size={18} />
                        ) : (
                          <IconStar size={18} />
                        )}
                      </ActionIcon>
                    </Group>

                    {cart.is_template && (
                      <Badge color="yellow" size="sm" mb="xs">
                        Template
                      </Badge>
                    )}

                    <Group gap="xs" mb="sm">
                      <Badge variant="light" color="blue">
                        {cart.item_count || 0} items
                      </Badge>
                      <Badge variant="light" color="green">
                        {cart.total_quantity || 0} total
                      </Badge>
                    </Group>

                    <Text size="xs" c="dimmed">
                      Last modified: {formatDate(cart.updated_at)}
                    </Text>
                  </div>

                  <Group gap="xs" mt="md">
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconShoppingCart size={14} />}
                      onClick={() => onUseCart?.(cart.id)}
                      flex={1}
                    >
                      Use
                    </Button>
                    <ActionIcon
                      variant="light"
                      color="blue"
                      size="lg"
                      onClick={() => handleDuplicateCart(cart.id)}
                    >
                      <IconCopy size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="lg"
                      onClick={() => {
                        setCartToDelete(cart.id);
                        setDeleteModalOpened(true);
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>

      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Delete Cart"
        centered
      >
        <Text mb="md">
          Are you sure you want to delete this cart? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeleteModalOpened(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteCart}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default CartManagement;
