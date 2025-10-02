import React, { useState } from 'react';
import { Paper, Text, Group, Badge, ActionIcon, Collapse, Stack, Button } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconPlus } from '@tabler/icons-react';
import { OrderedCSVItem } from '../types';

interface CategoryGroupViewProps {
  items: any[];
  onAddToOrder: (item: any, quantity?: number) => void;
}

const CategoryGroupView: React.FC<CategoryGroupViewProps> = ({ items, onAddToOrder }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categories = Object.keys(groupedItems).sort();

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

  return (
    <Stack gap="sm" p="md">
      {categories.map(category => {
        const isExpanded = expandedCategories.has(category);
        const categoryItems = groupedItems[category];

        return (
          <Paper key={category} shadow="xs" p="md" withBorder>
            <Group justify="space-between" style={{ cursor: 'pointer' }} onClick={() => toggleCategory(category)}>
              <Group gap="sm">
                <ActionIcon variant="subtle" size="sm">
                  {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                </ActionIcon>
                <Badge color={getCategoryColor(category)} size="lg">
                  {category}
                </Badge>
                <Text size="sm" c="dimmed">
                  {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                </Text>
              </Group>
            </Group>

            <Collapse in={isExpanded}>
              <Stack gap="xs" mt="md">
                {categoryItems.map((item, index) => (
                  <Paper key={index} p="sm" withBorder style={{ backgroundColor: '#f8f9fa' }}>
                    <Group justify="space-between">
                      <div>
                        <Text fw={500} size="sm" style={{ color: '#000' }}>
                          {item.Item_name}
                        </Text>
                        {item.default_supplier && (
                          <Text size="xs" c="dimmed">
                            Supplier: {item.default_supplier}
                          </Text>
                        )}
                        {item.measure_unit && (
                          <Text size="xs" c="dimmed">
                            Unit: {item.measure_unit}
                          </Text>
                        )}
                      </div>
                      <Button
                        size="xs"
                        leftSection={<IconPlus size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToOrder(item, 1);
                        }}
                      >
                        Add
                      </Button>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Collapse>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default CategoryGroupView;
