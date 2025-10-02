import React, { useState, useEffect } from 'react';
import { Table, Badge, ActionIcon, Group, LoadingOverlay, Alert, Paper, Text, TextInput, Button, Flex, Menu, Modal, Select, Checkbox, Tooltip, Autocomplete } from '@mantine/core';
import { IconEdit, IconTrash, IconAlertCircle, IconSearch, IconMenu2, IconX, IconColumns, IconPlus, IconSettings, IconCategory } from '@tabler/icons-react';
import { OrderedCSVItem } from '../types';
import ItemForm from './ItemForm';
import { notifications } from '@mantine/notifications';
import CategoryView from './CategoryView';

interface MasterTableProps {
  colorScheme: 'light' | 'dark';
  toggleColorScheme: () => void;
  orderedItems: OrderedCSVItem[];
  setOrderedItems: React.Dispatch<React.SetStateAction<OrderedCSVItem[]>>;
  items: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const MasterTable: React.FC<MasterTableProps> = ({
  colorScheme,
  toggleColorScheme,
  orderedItems,
  setOrderedItems,
  items,
  loading,
  error,
  refetch
}) => {
  const [displayItems, setDisplayItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpened, setFilterOpened] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number>(-1);
  const [showActions, setShowActions] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'category'>('table');
  const [columnMenuOpened, setColumnMenuOpened] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    itemName: true,
    category: true,
    supplier: false,
    measureUnit: false,
    brandTag: false,
    orderQuantity: false,
    defaultQuantity: false,
    supplierAlternative: false
  });

  useEffect(() => {
    if (items) {
      setDisplayItems(items);
    }
  }, [items]);

  // Create autocomplete data from display items
  const autocompleteData = displayItems.reduce((acc: string[], item) => {
    if (item.Item_name && !acc.includes(item.Item_name)) {
      acc.push(item.Item_name);
    }
    if (item.category && !acc.includes(item.category)) {
      acc.push(item.category);
    }
    if (item.default_supplier && !acc.includes(item.default_supplier)) {
      acc.push(item.default_supplier);
    }
    return acc;
  }, []);

  const handleEdit = (item: any, index: number) => {
    setEditingItem(item);
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    setItemToDelete(index);
    setDeleteModalOpened(true);
  };

  const confirmDelete = () => {
    // Update local state to remove the item
    const updatedItems = displayItems.filter((_, index) => index !== itemToDelete);
    setDisplayItems(updatedItems);
    
    notifications.show({
      title: 'Item Deleted',
      message: `Item "${displayItems[itemToDelete]?.Item_name}" has been deleted (session only - not saved to CSV).`,
      color: 'red',
    });
    setDeleteModalOpened(false);
    setItemToDelete(-1);
  };

  const handleEditSubmit = (formData: any) => {
    // Update local state with the edited item
    const updatedItems = [...displayItems];
    updatedItems[editingIndex] = formData;
    setDisplayItems(updatedItems);
    
    notifications.show({
      title: 'Item Updated',
      message: `Item "${formData.Item_name}" has been updated successfully (session only - not saved to CSV).`,
      color: 'green',
    });
    setEditingItem(null);
    setEditingIndex(-1);
  };

  const handleEditCancel = () => {
    setEditingItem(null);
    setEditingIndex(-1);
  };

  const getCategoryIcon = (category: string) => {
    const categoryLower = (category || '').toLowerCase();
    if (categoryLower.includes('cleaning')) return '🧽';
    if (categoryLower.includes('box')) return '📦';
    if (categoryLower.includes('ustensil')) return '🍴';
    if (categoryLower.includes('plastic bag')) return '👜';
    if (categoryLower.includes('kitchen roll')) return '🧻';
    if (categoryLower.includes('cheese')) return '🧀';
    return '📋';
  };

  const getCategoryColor = (category: string) => {
    const categoryLower = (category || '').toLowerCase();
    if (categoryLower.includes('cleaning')) return 'pink';
    if (categoryLower.includes('box')) return 'orange';
    if (categoryLower.includes('ustensil')) return 'blue';
    if (categoryLower.includes('plastic bag')) return 'cyan';
    if (categoryLower.includes('kitchen roll')) return 'red';
    if (categoryLower.includes('cheese')) return 'yellow';
    return 'gray';
  };

  // Filter items based on search and filters
  const filteredItems = displayItems.filter(item => {
    const matchesSearch = !searchQuery || 
      (item.Item_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.default_supplier?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSupplier = !selectedSupplier || item.default_supplier === selectedSupplier;
    
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      // Find exact match first, then fallback to filtered items
      const exactMatch = displayItems.find(item => 
        item.Item_name?.toLowerCase() === searchQuery.toLowerCase()
      );
      
      const itemToAdd = exactMatch || filteredItems[0];
      
      if (itemToAdd) {
        // Add first filtered item to order with quantity 1
        const orderItem: OrderedCSVItem = {
          ...itemToAdd,
          quantity: 1
        };
        setOrderedItems(prev => [...prev, orderItem]);
        notifications.show({
          title: 'Item Added to Order',
          message: `"${itemToAdd.Item_name}" added with quantity 1`,
          color: 'green',
        });
      } else if (searchQuery.trim()) {
        // Create new item with search query
        const newItem: OrderedCSVItem = {
          Item_name: searchQuery.trim(),
          category: 'New Item',
          default_supplier: 'Unknown',
          quantity: 1
        };
        setOrderedItems(prev => [...prev, newItem]);
        notifications.show({
          title: 'New Item Created',
          message: `"${searchQuery.trim()}" created and added to order`,
          color: 'blue',
        });
      }
      setSearchQuery('');
    } else if (/^[1-9]$/.test(event.key) && searchQuery && filteredItems.length > 0) {
      event.preventDefault();
      const quantity = parseInt(event.key);
      
      // Find exact match first, then fallback to filtered items
      const exactMatch = displayItems.find(item => 
        item.Item_name?.toLowerCase() === searchQuery.toLowerCase()
      );
      
      const itemToAdd = exactMatch || filteredItems[0];
      const orderItem: OrderedCSVItem = {
        ...itemToAdd,
        quantity
      };
      setOrderedItems(prev => [...prev, orderItem]);
      notifications.show({
        title: 'Item Added to Order',
        message: `"${itemToAdd.Item_name}" added with quantity ${quantity}`,
        color: 'green',
      });
      setSearchQuery('');
    }
  };

  const handleAutocompleteSelect = (value: string) => {
    setSearchQuery(value);
    
    // Auto-add item when selected from autocomplete
    const selectedItem = displayItems.find(item => 
      item.Item_name === value || 
      item.category === value || 
      item.default_supplier === value
    );
    
    if (selectedItem) {
      const orderItem: OrderedCSVItem = {
        ...selectedItem,
        quantity: 1
      };
      setOrderedItems(prev => [...prev, orderItem]);
      notifications.show({
        title: 'Item Added to Order',
        message: `"${selectedItem.Item_name}" added with quantity 1`,
        color: 'green',
      });
      setSearchQuery('');
    }
  };

  // Get unique categories and suppliers for filter options
  const uniqueCategories = [...new Set(displayItems.map(item => item.category).filter(cat => cat && cat.trim()))];
  const uniqueSuppliers = [...new Set(displayItems.map(item => item.default_supplier).filter(sup => sup && sup.trim()))];

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSupplier('');
    setSearchQuery('');
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  if (error) {
    return (
      <Paper p="md">
        <Alert icon={<IconAlertCircle size={16} />} title="Error loading data" color="red" mb="md">
          {error}
        </Alert>
      </Paper>
    );
  }

  const rows = filteredItems.map((item, index) => (
    <Table.Tr key={index} style={{ height: '40px' }}>
      {visibleColumns.itemName && (
        <Table.Td>
          <Text 
            style={{ 
              color: '#000', 
              fontSize: '13px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '200px'
            }}
            title={item.Item_name || '-'}
          >
            {item.Item_name || '-'}
          </Text>
        </Table.Td>
      )}
      {visibleColumns.category && (
        <Table.Td>
          {item.category ? (
            <Text 
              style={{ 
                color: '#000', 
                fontSize: '13px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '150px'
              }}
              title={item.category}
            >
              {item.category}
            </Text>
          ) : (
            <Text style={{ color: '#666', fontSize: '13px' }}>-</Text>
          )}
        </Table.Td>
      )}
      {visibleColumns.supplier && (
        <Table.Td>
          <Text 
            style={{ 
              color: '#000', 
              fontSize: '13px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '120px'
            }}
            title={item.default_supplier || '-'}
          >
            {item.default_supplier || '-'}
          </Text>
        </Table.Td>
      )}
      {visibleColumns.measureUnit && (
        <Table.Td>
          <Text style={{ color: '#000', fontSize: '13px' }}>{item.measure_unit || '-'}</Text>
        </Table.Td>
      )}
      {visibleColumns.brandTag && (
        <Table.Td>
          <Text 
            style={{ 
              color: '#000', 
              fontSize: '13px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100px'
            }}
            title={item.brand_tag || '-'}
          >
            {item.brand_tag || '-'}
          </Text>
        </Table.Td>
      )}
      {visibleColumns.orderQuantity && (
        <Table.Td>
          <Text style={{ color: '#000', fontSize: '13px' }}>{item.order_quantity || '-'}</Text>
        </Table.Td>
      )}
      {visibleColumns.defaultQuantity && (
        <Table.Td>
          <Text style={{ color: '#000', fontSize: '13px' }}>{item.default_quantity || '-'}</Text>
        </Table.Td>
      )}
      {visibleColumns.supplierAlternative && (
        <Table.Td>
          <Text 
            style={{ 
              color: '#000', 
              fontSize: '13px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '120px'
            }}
            title={item.supplier_alternative || '-'}
          >
            {item.supplier_alternative || '-'}
          </Text>
        </Table.Td>
      )}
      {showActions && (
        <Table.Td>
          <Group gap="xs">
            <ActionIcon 
              variant="subtle" 
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(item, index);
              }}
              title="Edit item"
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon 
              variant="subtle" 
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(index);
              }}
              title="Delete item"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Table.Td>
      )}
    </Table.Tr>
  ));

  return (
    <Paper style={{ border: 'none', boxShadow: 'none' }}>
      <div style={{ padding: '12px', borderBottom: '1px solid #e9ecef' }}>
        {/* Search bar - full width on mobile, part of flex on desktop */}
        <div style={{ marginBottom: '8px' }}>
          <Autocomplete
            placeholder="Search items... (Enter to add, 1-9 for quantity)"
            value={searchQuery}
            onChange={setSearchQuery}
            onKeyDown={handleSearchKeyDown}
            onOptionSubmit={handleAutocompleteSelect}
            data={autocompleteData.filter(item => 
              item.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 10)} // Limit to 10 suggestions
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery && (
                <ActionIcon variant="subtle" onClick={() => setSearchQuery('')}>
                  <IconX size={16} />
                </ActionIcon>
              )
            }
            style={{ width: '100%' }}
            limit={10}
            maxDropdownHeight={200}
            comboboxProps={{ withinPortal: false }}
          />
        </div>
        
        {/* Action buttons and status - responsive flex layout */}
        <Flex gap="xs" align="center" justify="space-between" wrap="wrap">
          <Group gap="xs">
            <ActionIcon 
              variant="subtle" 
              color="blue"
              onClick={() => setEditingItem({ Item_name: '', category: '', default_supplier: '' })}
              title="Add new item"
            >
              <IconPlus size={16} />
            </ActionIcon>
            <Tooltip label={showActions ? "Hide Actions" : "Show Actions"}>
              <ActionIcon 
                variant={showActions ? "filled" : "subtle"}
                color="gray"
                onClick={() => setShowActions(!showActions)}
                title="Toggle action column"
              >
                <IconSettings size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={viewMode === 'category' ? "Table View" : "Category View"}>
              <ActionIcon 
                variant={viewMode === 'category' ? "filled" : "subtle"}
                color="blue"
                onClick={() => setViewMode(viewMode === 'table' ? 'category' : 'table')}
                title="Toggle category view"
              >
                <IconCategory size={16} />
              </ActionIcon>
            </Tooltip>
            <Menu>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" title="More options">
                  <IconMenu2 size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => refetch()}>
                  Refresh Data
                </Menu.Item>
                <Menu.Item onClick={() => console.log('Export CSV')}>
                  Export CSV
                </Menu.Item>
                <Menu.Item onClick={() => setFilterOpened(true)}>
                  Filter Items
                </Menu.Item>
                <Menu.Item onClick={clearFilters}>
                  Clear Filters
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
          
          {/* Status text */}
        </Flex>
      </div>

      <Modal opened={filterOpened} onClose={() => setFilterOpened(false)} title="Filter Items">
        <Select
          label="Category"
          placeholder="Select category"
          value={selectedCategory}
          onChange={(value) => setSelectedCategory(value || '')}
          data={uniqueCategories.map(cat => ({ value: cat, label: cat }))}
          clearable
          mb="md"
        />
        <Select
          label="Supplier"
          placeholder="Select supplier"
          value={selectedSupplier}
          onChange={(value) => setSelectedSupplier(value || '')}
          data={uniqueSuppliers.map(sup => ({ value: sup, label: sup }))}
          clearable
          mb="md"
        />
        <Group justify="flex-end">
          <Button variant="outline" onClick={clearFilters}>
            Clear All
          </Button>
          <Button onClick={() => setFilterOpened(false)}>
            Apply Filters
          </Button>
        </Group>
      </Modal>

      <Modal 
        opened={deleteModalOpened} 
        onClose={() => setDeleteModalOpened(false)} 
        title="Confirm Delete"
        centered
      >
        <Text mb="md">
          Are you sure you want to delete "{filteredItems[itemToDelete]?.Item_name}"? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="outline" onClick={() => setDeleteModalOpened(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>

      {editingItem && (
        <ItemForm
          item={editingItem}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
        />
      )}

      {viewMode === 'table' ? (
        <div style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          
          <Table striped highlightOnHover verticalSpacing="xs" style={{ backgroundColor: 'white', fontSize: '14px' }}>
            <Table.Thead>
              <Table.Tr>
                {visibleColumns.itemName && (
                  <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>
                    <Menu opened={columnMenuOpened} onChange={setColumnMenuOpened}>
                      <Menu.Target>
                        <Button variant="subtle" size="xs" rightSection={<IconColumns size={12} />} style={{ color: '#000', fontSize: '11px' }}>
                          Item Name
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Label>Show/Hide Columns</Menu.Label>
                        <Menu.Item>
                          <Checkbox
                            label="Item Name"
                            checked={visibleColumns.itemName}
                            onChange={() => toggleColumn('itemName')}
                          />
                        </Menu.Item>
                        <Menu.Item>
                          <Checkbox
                            label="Category"
                            checked={visibleColumns.category}
                            onChange={() => toggleColumn('category')}
                          />
                        </Menu.Item>
                        <Menu.Item>
                          <Checkbox
                            label="Supplier"
                            checked={visibleColumns.supplier}
                            onChange={() => toggleColumn('supplier')}
                          />
                        </Menu.Item>
                        <Menu.Item>
                          <Checkbox
                            label="Measure Unit"
                            checked={visibleColumns.measureUnit}
                            onChange={() => toggleColumn('measureUnit')}
                          />
                        </Menu.Item>
                        <Menu.Item>
                          <Checkbox
                            label="Brand Tag"
                            checked={visibleColumns.brandTag}
                            onChange={() => toggleColumn('brandTag')}
                          />
                        </Menu.Item>
                        <Menu.Item>
                          <Checkbox
                            label="Order Quantity"
                            checked={visibleColumns.orderQuantity}
                            onChange={() => toggleColumn('orderQuantity')}
                          />
                        </Menu.Item>
                        <Menu.Item>
                          <Checkbox
                            label="Default Quantity"
                            checked={visibleColumns.defaultQuantity}
                            onChange={() => toggleColumn('defaultQuantity')}
                          />
                        </Menu.Item>
                        <Menu.Item>
                          <Checkbox
                            label="Alternative Supplier"
                            checked={visibleColumns.supplierAlternative}
                            onChange={() => toggleColumn('supplierAlternative')}
                          />
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Th>
                )}
                {visibleColumns.category && (
                  <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>
                    <Menu>
                      <Menu.Target>
                        <Button variant="subtle" size="xs" style={{ color: '#000', fontSize: '11px' }}>
                          Category
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Label>Filter by Category</Menu.Label>
                        <Menu.Item onClick={() => setSelectedCategory('')}>
                          All Categories
                        </Menu.Item>
                        {uniqueCategories.map(category => (
                          <Menu.Item 
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </Menu.Item>
                        ))}
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Th>
                )}
                {visibleColumns.supplier && <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>Supplier</Table.Th>}
                {visibleColumns.measureUnit && <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>Unit</Table.Th>}
                {visibleColumns.brandTag && <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>Brand</Table.Th>}
                {visibleColumns.orderQuantity && <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>Order Qty</Table.Th>}
                {visibleColumns.defaultQuantity && <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>Default Qty</Table.Th>}
                {visibleColumns.supplierAlternative && <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>Alt Supplier</Table.Th>}
                {showActions && <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>Actions</Table.Th>}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody style={{ backgroundColor: 'white' }}>
              {rows}
            </Table.Tbody>
          </Table>
        </div>
      ) : (
        <CategoryView 
          items={filteredItems}
          onAddToOrder={(item, quantity = 1) => {
            const orderItem: OrderedCSVItem = { ...item, quantity };
            setOrderedItems(prev => [...prev, orderItem]);
            notifications.show({
              title: 'Item Added to Order',
              message: `"${item.Item_name}" added with quantity ${quantity}`,
              color: 'green',
            });
          }}
        />
      )}
    </Paper>
  );
};

export default MasterTable;