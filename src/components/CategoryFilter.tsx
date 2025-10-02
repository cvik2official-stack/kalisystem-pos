import React from 'react';
import { Menu, Button, Checkbox, Stack, Divider, Group } from '@mantine/core';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  onSelectAll: () => void;
  onResetDefault: () => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  onToggleCategory,
  onSelectAll,
  onResetDefault,
}) => {
  const allSelected = selectedCategories.length === categories.length;

  return (
    <Menu position="bottom-start" shadow="md" width={250}>
      <Menu.Target>
        <Button variant="subtle" size="xs" style={{ color: '#000', fontSize: '11px' }}>
          Category ({selectedCategories.length}/{categories.length})
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Filter by Category</Menu.Label>
        <Group gap="xs" px="xs" mb="xs">
          <Button size="xs" variant="light" onClick={onSelectAll} fullWidth>
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
          <Button size="xs" variant="light" color="blue" onClick={onResetDefault} fullWidth>
            Reset Default
          </Button>
        </Group>
        <Divider mb="xs" />
        <Stack gap={4} style={{ maxHeight: '400px', overflowY: 'auto' }} px="xs">
          {categories.map(category => (
            <Checkbox
              key={category}
              label={category}
              checked={selectedCategories.includes(category)}
              onChange={() => onToggleCategory(category)}
              size="sm"
            />
          ))}
        </Stack>
      </Menu.Dropdown>
    </Menu>
  );
};

export default CategoryFilter;
