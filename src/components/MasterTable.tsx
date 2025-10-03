import React, { useState, useEffect } from 'react';
import { Table, Badge, ActionIcon, Group, LoadingOverlay, Alert, Paper, Text, TextInput, Button, Flex, Menu, Modal, Select, Checkbox, Tooltip, Autocomplete, NumberInput } from '@mantine/core';
import { IconEdit, IconTrash, IconAlertCircle, IconSearch, IconMenu2, IconX, IconColumns, IconPlus, IconSettings, IconCategory, IconSquareCheck, IconMinus, IconShoppingCartPlus } from '@tabler/icons-react';
import { OrderedCSVItem } from '../types';
import ItemForm from './ItemForm';
import { notifications } from '@mantine/notifications';
import CategoryGroupView from './CategoryGroupView';
import CategoryFilter from './CategoryFilter';

interface MasterTableProps {
  colorScheme: 'light' | 'dark';
  toggleColorScheme: () => void;
  cartItems: any[];
  addItem: (item: any) => void;
  items: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const MasterTable: React.FC<MasterTableProps> = ({
  colorScheme,
  toggleColorScheme,
  cartItems,
  addItem,
  items,
  loading,
  error,
  refetch
}) => {
  const [displayItems, setDisplayItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpened, setFilterOpened] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number>(-1);
  const [showActions, setShowActions] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'category'>('table');
  const [columnMenuOpened, setColumnMenuOpened] = useState(false);
  const [multiselectMode, setMultiselectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [rowQuantities, setRowQuantities] = useState<Map<number, number>>(new Map());
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [longPressItem, setLongPressItem] = useState<{item: any, index: number} | null>(null);
  const [numpadModalOpened, setNumpadModalOpened] = useState(false);
  const [customQuantity, setCustomQuantity] = useState<number>(1);
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
  const [searchFocused, setSearchFocused] = useState(false);

  // Category filter state with localStorage persistence
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedCategories');
    return saved ? JSON.parse(saved) : [];
  });

  // Get unique categories
  const uniqueCategories = [...new Set(displayItems.map(item => item.category).filter(cat => cat && cat.trim()))].sort();

  // Initialize selectedCategories with all categories on first load
  useEffect(() => {
    if (uniqueCategories.length > 0 && selectedCategories.length === 0) {
      const allCategories = uniqueCategories;
      setSelectedCategories(allCategories);
      localStorage.setItem('selectedCategories', JSON.stringify(allCategories));
    }
  }, [uniqueCategories.length]);

  // Save category filter to localStorage
  useEffect(() => {
    if (selectedCategories.length > 0) {
      localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
    }
  }, [selectedCategories]);

  useEffect(() => {
    if (items) {
      setDisplayItems(items);
    }
  }, [items]);

  // Custom default actions when search is empty
  const defaultSearchActions = [
    '💾 Save cart',
    '📦 Create order',
    '➕ Create item'
  ];

  // Create autocomplete data from display items or default actions
  const autocompleteData = searchQuery.trim() === '' && searchFocused
    ? defaultSearchActions
    : displayItems.reduce((acc: string[], item) => {
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

    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
    const matchesSupplier = !selectedSupplier || item.default_supplier === selectedSupplier;

    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      const query = searchQuery.trim().toLowerCase();

      // Check for special commands
      if (query.startsWith('save+')) {
        const cartName = searchQuery.trim().substring(5).trim();
        if (cartName) {
          handleSaveCartWithName(cartName);
        } else {
          notifications.show({
            title: 'Invalid Command',
            message: 'Please specify a cart name: save+MyCart',
            color: 'orange',
          });
        }
        setSearchQuery('');
        return;
      }

      if (query === 'create order' || query === 'createorder') {
        handleCreateOrder();
        setSearchQuery('');
        return;
      }

      // Find exact match first, then fallback to filtered items
      const exactMatch = displayItems.find(item =>
        item.Item_name?.toLowerCase() === query
      );

      const itemToAdd = exactMatch || filteredItems[0];

      if (itemToAdd) {
        // Add item to cart with quantity 1
        addItem({
          item_name: itemToAdd.Item_name,
          category: itemToAdd.category,
          quantity: 1
        });
        notifications.show({
          title: 'Item Added to Order',
          message: `"${itemToAdd.Item_name}" added with quantity 1`,
          color: 'green',
        });
      } else if (searchQuery.trim()) {
        // Create new item and add to cart
        addItem({
          item_name: searchQuery.trim(),
          category: 'New Item',
          quantity: 1
        });
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
      addItem({
        item_name: itemToAdd.Item_name,
        category: itemToAdd.category,
        quantity
      });
      notifications.show({
        title: 'Item Added to Order',
        message: `"${itemToAdd.Item_name}" added with quantity ${quantity}`,
        color: 'green',
      });
      setSearchQuery('');
    }
  };

  const handleSaveCartWithName = (cartName: string) => {
    if (cartItems.length === 0) {
      notifications.show({
        title: 'Empty Cart',
        message: 'Cannot save an empty cart',
        color: 'orange',
      });
      return;
    }

    // TODO: Implement actual cart save with custom name
    notifications.show({
      title: 'Cart Saved',
      message: `Cart "${cartName}" saved successfully`,
      color: 'green',
    });
  };

  const handleCreateOrder = () => {
    if (cartItems.length === 0) {
      notifications.show({
        title: 'Empty Cart',
        message: 'Add items to cart before creating an order',
        color: 'orange',
      });
      return;
    }

    // TODO: Implement actual order creation
    notifications.show({
      title: 'Order Created',
      message: `Order created with ${cartItems.length} items`,
      color: 'green',
    });
  };

  const handleAutocompleteSelect = (value: string) => {
    // Handle default action selections
    if (value === '💾 Save cart') {
      setSearchQuery('');
      setSearchFocused(false);
      if (cartItems.length === 0) {
        notifications.show({
          title: 'Empty Cart',
          message: 'Add items to cart before saving',
          color: 'orange',
        });
        return;
      }
      // TODO: Implement save cart functionality
      notifications.show({
        title: 'Save Cart',
        message: 'Cart save functionality coming soon',
        color: 'blue',
      });
      return;
    }

    if (value === '📦 Create order') {
      setSearchQuery('');
      setSearchFocused(false);
      handleCreateOrder();
      return;
    }

    if (value === '➕ Create item') {
      setSearchQuery('');
      setSearchFocused(false);
      setEditingItem({ Item_name: '', category: '', default_supplier: '' });
      return;
    }

    setSearchQuery(value);

    // Auto-add item when selected from autocomplete
    const selectedItem = displayItems.find(item =>
      item.Item_name === value ||
      item.category === value ||
      item.default_supplier === value
    );

    if (selectedItem) {
      addItem({
        item_name: selectedItem.Item_name,
        category: selectedItem.category,
        quantity: 1
      });
      notifications.show({
        title: 'Item Added to Order',
        message: `"${selectedItem.Item_name}" added with quantity 1`,
        color: 'green',
      });
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

  // Get unique suppliers for filter options
  const uniqueSuppliers = [...new Set(displayItems.map(item => item.default_supplier).filter(sup => sup && sup.trim()))];

  const clearFilters = () => {
    setSelectedCategories(uniqueCategories);
    setSelectedSupplier('');
    setSearchQuery('');
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === uniqueCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(uniqueCategories);
    }
  };

  const handleResetCategoryFilter = () => {
    setSelectedCategories(uniqueCategories);
  };

  const toggleItemSelection = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const handleAddItemToOrder = (item: any, index: number) => {
    const quantity = rowQuantities.get(index) || 1;
    addItem({
      item_name: item.Item_name,
      category: item.category,
      quantity
    });
    notifications.show({
      title: 'Item Added',
      message: `"${item.Item_name}" added with quantity ${quantity}`,
      color: 'green',
    });
  };

  const updateRowQuantity = (index: number, delta: number) => {
    setRowQuantities(prev => {
      const newMap = new Map(prev);
      const currentQty = newMap.get(index) || 1;
      const newQty = Math.max(1, currentQty + delta);
      newMap.set(index, newQty);
      return newMap;
    });
  };

  const setRowQuantity = (index: number, value: number) => {
    setRowQuantities(prev => {
      const newMap = new Map(prev);
      newMap.set(index, Math.max(1, value));
      return newMap;
    });
  };

  const handleRowClick = (item: any, index: number) => {
    if (multiselectMode || showActions) return;

    addItem({
      item_name: item.Item_name,
      category: item.category,
      quantity: 1
    });
    notifications.show({
      title: 'Item Added',
      message: `"${item.Item_name}" added to cart with quantity 1`,
      color: 'green',
    });
  };

  const handleRowLongPressStart = (item: any, index: number, event: React.MouseEvent | React.TouchEvent) => {
    if (multiselectMode || showActions) return;

    event.preventDefault();
    const timer = setTimeout(() => {
      setLongPressItem({item, index});
      setCustomQuantity(1);
      setNumpadModalOpened(true);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleRowLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleCustomQuantitySubmit = () => {
    if (longPressItem && customQuantity > 0) {
      addItem({
        item_name: longPressItem.item.Item_name,
        category: longPressItem.item.category,
        quantity: customQuantity
      });
      notifications.show({
        title: 'Item Added',
        message: `"${longPressItem.item.Item_name}" added to cart with quantity ${customQuantity}`,
        color: 'green',
      });
    }
    setNumpadModalOpened(false);
    setLongPressItem(null);
    setCustomQuantity(1);
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
    <Table.Tr
      key={index}
      style={{
        height: '40px',
        backgroundColor: selectedItems.has(index) ? '#e7f5ff' : 'white',
        cursor: (!multiselectMode && !showActions) ? 'pointer' : 'default'
      }}
      onClick={() => handleRowClick(item, index)}
      onMouseDown={(e) => handleRowLongPressStart(item, index, e)}
      onMouseUp={handleRowLongPressEnd}
      onMouseLeave={handleRowLongPressEnd}
      onTouchStart={(e) => handleRowLongPressStart(item, index, e)}
      onTouchEnd={handleRowLongPressEnd}
    >
      {multiselectMode && (
        <Table.Td>
          <Checkbox
            checked={selectedItems.has(index)}
            onChange={() => toggleItemSelection(index)}
          />
        </Table.Td>
      )}
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
      {(showActions || (multiselectMode && selectedItems.has(index))) && (
        <Table.Td>
          <Group gap="xs" wrap="nowrap">
            {multiselectMode && selectedItems.has(index) ? (
              <>
                <ActionIcon
                  size="sm"
                  variant="light"
                  color="gray"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateRowQuantity(index, -1);
                  }}
                  title="Decrease quantity"
                >
                  <IconMinus size={14} />
                </ActionIcon>
                <NumberInput
                  value={rowQuantities.get(index) || 1}
                  onChange={(val) => setRowQuantity(index, typeof val === 'number' ? val : 1)}
                  min={1}
                  max={999}
                  style={{ width: '60px' }}
                  size="xs"
                  hideControls
                />
                <ActionIcon
                  size="sm"
                  variant="light"
                  color="gray"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateRowQuantity(index, 1);
                  }}
                  title="Increase quantity"
                >
                  <IconPlus size={14} />
                </ActionIcon>
                <Button
                  size="xs"
                  leftSection={<IconShoppingCartPlus size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddItemToOrder(item, index);
                  }}
                >
                  Add
                </Button>
              </>
            ) : showActions ? (
              <>
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
              </>
            ) : null}
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
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            onKeyDown={handleSearchKeyDown}
            onOptionSubmit={handleAutocompleteSelect}
            data={autocompleteData.filter(item =>
              item.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 10)}
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
            <Tooltip label={multiselectMode ? "Exit Multiselect" : "Multiselect Mode"}>
              <ActionIcon
                variant={multiselectMode ? "filled" : "subtle"}
                color="grape"
                onClick={() => {
                  setMultiselectMode(!multiselectMode);
                  if (multiselectMode) {
                    setSelectedItems(new Set());
                  }
                }}
                title="Toggle multiselect mode"
              >
                <IconSquareCheck size={16} />
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

          {/* Multiselect status */}
          {multiselectMode && selectedItems.size > 0 && (
            <Badge size="lg" color="blue">
              {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
            </Badge>
          )}
        </Flex>
      </div>

      <Modal opened={filterOpened} onClose={() => setFilterOpened(false)} title="Filter Items">
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
                {multiselectMode && (
                  <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px', width: '40px' }}>
                    <Checkbox
                      checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                      indeterminate={selectedItems.size > 0 && selectedItems.size < filteredItems.length}
                      onChange={() => {
                        if (selectedItems.size === filteredItems.length) {
                          setSelectedItems(new Set());
                        } else {
                          setSelectedItems(new Set(filteredItems.map((_, i) => i)));
                        }
                      }}
                    />
                  </Table.Th>
                )}
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
                    <CategoryFilter
                      categories={uniqueCategories}
                      selectedCategories={selectedCategories}
                      onToggleCategory={toggleCategoryFilter}
                      onSelectAll={handleSelectAllCategories}
                      onResetDefault={handleResetCategoryFilter}
                    />
                  </Table.Th>
                )}
                {visibleColumns.supplier && <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>Supplier</Table.Th>}
                {visibleColumns.measureUnit && <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>Unit</Table.Th>}
                {visibleColumns.brandTag && <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>Brand</Table.Th>}
                {visibleColumns.orderQuantity && <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>Order Qty</Table.Th>}
                {visibleColumns.defaultQuantity && <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>Default Qty</Table.Th>}
                {visibleColumns.supplierAlternative && <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>Alt Supplier</Table.Th>}
                {(showActions || multiselectMode) && <Table.Th style={{ color: '#000', fontSize: '12px', padding: '8px 12px' }}>Actions</Table.Th>}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody style={{ backgroundColor: 'white' }}>
              {rows}
            </Table.Tbody>
          </Table>
        </div>
      ) : (
        <CategoryGroupView
          items={filteredItems}
          onAddToOrder={(item, quantity = 1) => {
            addItem({
              item_name: item.Item_name,
              category: item.category,
              quantity
            });
            notifications.show({
              title: 'Item Added to Order',
              message: `"${item.Item_name}" added with quantity ${quantity}`,
              color: 'green',
            });
          }}
        />
      )}

      <Modal
        opened={numpadModalOpened}
        onClose={() => {
          setNumpadModalOpened(false);
          setLongPressItem(null);
          setCustomQuantity(1);
        }}
        title="Set Custom Quantity"
        size="sm"
        centered
      >
        <NumberInput
          label="Quantity"
          value={customQuantity}
          onChange={(val) => setCustomQuantity(typeof val === 'number' ? val : 1)}
          min={1}
          max={9999}
          step={1}
          mb="md"
        />
        <Group justify="flex-end">
          <Button variant="outline" onClick={() => {
            setNumpadModalOpened(false);
            setLongPressItem(null);
            setCustomQuantity(1);
          }}>
            Cancel
          </Button>
          <Button onClick={handleCustomQuantitySubmit}>
            Add to Cart
          </Button>
        </Group>
      </Modal>
    </Paper>
  );
};

export default MasterTable;