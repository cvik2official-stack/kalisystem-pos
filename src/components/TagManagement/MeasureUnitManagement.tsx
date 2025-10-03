import React, { useState, useEffect } from 'react';
import { Group, Button, Badge, ActionIcon, Modal, TextInput, Stack, Text } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconX } from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';

interface MeasureUnitTag {
  id: string;
  name: string;
  color: string;
  metadata?: {
    full_name?: string;
    type?: string;
    base_unit?: string;
    conversion_factor?: number;
  };
}

const MeasureUnitManagement: React.FC = () => {
  const [measureUnits, setMeasureUnits] = useState<MeasureUnitTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [editingUnit, setEditingUnit] = useState<MeasureUnitTag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
  });

  useEffect(() => {
    fetchMeasureUnits();
  }, []);

  const fetchMeasureUnits = async () => {
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('tag_categories')
        .select('id')
        .eq('name', 'measure_unit')
        .maybeSingle();

      if (categoryError) throw categoryError;

      if (!categoryData) {
        console.error('measure_unit category not found');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('category_id', categoryData.id)
        .order('name', { ascending: true });

      if (error) throw error;

      const mapped: MeasureUnitTag[] = (data || []).map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        metadata: tag.metadata || {}
      }));

      setMeasureUnits(mapped);
    } catch (error) {
      console.error('Error fetching measure units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('tag_categories')
        .select('id')
        .eq('name', 'measure_unit')
        .maybeSingle();

      if (categoryError) throw categoryError;

      if (!categoryData) {
        console.error('measure_unit category not found');
        return;
      }

      if (editingUnit) {
        const { error } = await supabase
          .from('tags')
          .update({
            name: formData.symbol,
            metadata: {
              ...(editingUnit.metadata || {}),
              full_name: formData.name
            }
          })
          .eq('id', editingUnit.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tags')
          .insert({
            name: formData.symbol,
            color: '#3498db',
            category_id: categoryData.id,
            metadata: {
              full_name: formData.name,
              type: 'count'
            }
          });

        if (error) throw error;
      }

      await fetchMeasureUnits();
      setOpened(false);
      resetForm();
    } catch (error) {
      console.error('Error saving measure unit:', error);
    }
  };

  const handleEdit = (unit: MeasureUnitTag) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.metadata?.full_name || unit.name,
      symbol: unit.name,
    });
    setOpened(true);
  };

  const handleDelete = async (unitId: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', unitId);

      if (error) throw error;

      await fetchMeasureUnits();
    } catch (error) {
      console.error('Error deleting measure unit:', error);
    }
  };

  const resetForm = () => {
    setEditingUnit(null);
    setFormData({
      name: '',
      symbol: '',
    });
  };

  if (loading) {
    return <div>Loading measure units...</div>;
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={600} style={{ color: '#000' }}>Measure Units</Text>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setOpened(true)}>
          Add Unit
        </Button>
      </Group>

      <Group gap="xs">
        {measureUnits.map((unit) => (
          <Badge
            key={unit.id}
            size="lg"
            variant="light"
            color="blue"
            rightSection={
              <Group gap={4} ml="xs">
                <ActionIcon
                  size="xs"
                  color="blue"
                  variant="transparent"
                  onClick={() => handleEdit(unit)}
                >
                  <IconEdit size={12} />
                </ActionIcon>
                <ActionIcon
                  size="xs"
                  color="red"
                  variant="transparent"
                  onClick={() => handleDelete(unit.id)}
                >
                  <IconX size={12} />
                </ActionIcon>
              </Group>
            }
          >
            {unit.name}
          </Badge>
        ))}
      </Group>

      <Modal opened={opened} onClose={() => { setOpened(false); resetForm(); }} title={editingUnit ? 'Edit Unit' : 'Add Unit'}>
        <Stack>
          <TextInput
            label="Name"
            placeholder="Unit name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextInput
            label="Symbol"
            placeholder="Unit symbol"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => { setOpened(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingUnit ? 'Update' : 'Add'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default MeasureUnitManagement;
