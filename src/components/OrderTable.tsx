import React, { useState, useEffect } from 'react';
import { Table, Text, Group, Paper, Badge, LoadingOverlay, Alert, Button, ActionIcon, Collapse, Box } from '@mantine/core';
import { IconAlertCircle, IconChevronDown, IconChevronRight, IconRefresh } from '@tabler/icons-react';
import { useOrders } from '../hooks/useOrders';

interface Order {
  id: string;
  telegram_user_id: string;
  order_id: string;
  item_name: string;
  quantity: number;
  category: string | null;
  created_at: string;
}

interface GroupedOrder {
  order_id: string;
  telegram_user_id: string;
  created_at: string;
  items: Order[];
  totalItems: number;
}

const OrderTable: React.FC = () => {
  const { orders, loading, error, refetch } = useOrders();
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const groupOrdersByOrderId = (ordersData: Order[]) => {
    const grouped = ordersData.reduce((acc, order) => {
      if (!acc[order.order_id]) {
        acc[order.order_id] = {
          order_id: order.order_id,
          telegram_user_id: order.telegram_user_id,
          created_at: order.created_at,
          items: [],
          totalItems: 0
        };
      }
      acc[order.order_id].items.push(order);
      acc[order.order_id].totalItems += Number(order.quantity);
      return acc;
    }, {} as Record<string, GroupedOrder>);

    // Sort items within each order by category
    Object.values(grouped).forEach(group => {
      group.items.sort((a, b) => {
        if (a.category && b.category) {
          return a.category.localeCompare(b.category);
        }
        if (a.category && !b.category) return -1;
        if (!a.category && b.category) return 1;
        return a.item_name.localeCompare(b.item_name);
      });
    });

    setGroupedOrders(Object.values(grouped));
  };

  useEffect(() => {
    groupOrdersByOrderId(orders);
  }, [orders]);

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'gray';
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('cleaning')) return 'pink';
    if (categoryLower.includes('box')) return 'orange';
    if (categoryLower.includes('ustensil')) return 'blue';
    if (categoryLower.includes('plastic bag')) return 'cyan';
    if (categoryLower.includes('kitchen roll')) return 'red';
    if (categoryLower.includes('cheese')) return 'yellow';
    return 'gray';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (error) {
    return (
      <Paper p="md">
        <Alert icon={<IconAlertCircle size={16} />} title="Error loading orders" color="red" mb="md">
          {error}
        </Alert>
        <Button onClick={refetch} leftSection={<IconRefresh size={16} />}>
          Retry
        </Button>
      </Paper>
    );
  }

  return (
    <Paper style={{ border: 'none', boxShadow: 'none' }}>
      <div style={{ padding: '12px', borderBottom: '1px solid #e9ecef' }}>
        <Group justify="space-between">
          <Text size="lg" fw={600} style={{ color: '#000' }}>
            Orders ({groupedOrders.length})
          </Text>
          <Button
            onClick={refetch}
            leftSection={<IconRefresh size={16} />}
            variant="light"
            size="sm"
          >
            Refresh
          </Button>
        </Group>
      </div>

      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        
        {groupedOrders.length === 0 && !loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Text c="dimmed">No orders found</Text>
          </div>
        ) : (
          <div style={{ padding: '12px' }}>
            {groupedOrders.map((group) => (
              <Paper key={group.order_id} mb="md" p="md" withBorder>
                <Group 
                  justify="space-between" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleOrderExpansion(group.order_id)}
                >
                  <Group>
                    <ActionIcon variant="subtle" size="sm">
                      {expandedOrders.has(group.order_id) ? 
                        <IconChevronDown size={16} /> : 
                        <IconChevronRight size={16} />
                      }
                    </ActionIcon>
                    <div>
                      <Text fw={500} style={{ color: '#000' }}>
                        User ID: {group.telegram_user_id}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {formatDate(group.created_at)}
                      </Text>
                    </div>
                  </Group>
                  <Badge variant="light" color="blue">
                    {group.items.length} items ({group.totalItems.toFixed(2)} total qty)
                  </Badge>
                </Group>

                <Collapse in={expandedOrders.has(group.order_id)}>
                  <Box mt="md">
                    <Table size="sm">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={{ color: '#000' }}>Item Name</Table.Th>
                          <Table.Th style={{ color: '#000' }}>Quantity</Table.Th>
                          <Table.Th style={{ color: '#000' }}>Category</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {group.items.map((item) => (
                          <Table.Tr key={item.id}>
                            <Table.Td>
                              <Text style={{ color: '#000' }}>{item.item_name}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Text style={{ color: '#000' }}>{Number(item.quantity).toFixed(2)}</Text>
                            </Table.Td>
                            <Table.Td>
                              {item.category ? (
                                <Badge 
                                  size="sm" 
                                  color={getCategoryColor(item.category)}
                                  variant="light"
                                >
                                  {item.category}
                                </Badge>
                              ) : (
                                <Text size="sm" c="dimmed">-</Text>
                              )}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Box>
                </Collapse>
              </Paper>
            ))}
          </div>
        )}
      </div>
    </Paper>
  );
};

export default OrderTable;