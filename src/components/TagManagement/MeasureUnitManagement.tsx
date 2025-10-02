import React, { useState, useEffect } from 'react';
import { Group, Button, Badge, ActionIcon, Modal, TextInput, Stack, Text } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconX } from '@tabler/icons-react';
import { MeasureUnit } from '../../types';
import { supabase } from '../../lib/supabase';

const MeasureUnitManagement: React.FC = () => {
  const [measureUnits, setMeasureUnits] = useState<MeasureUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeasureUnits();
  }, []);

  const fetchMeasureUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('measure_units')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const mapped: MeasureUnit[] = (data || []).map(unit => ({
        id: unit.id,
        name: unit.name,
        symbol: unit.symbol,
        type: unit.type,
        baseUnit: unit.base_unit,
        conversionFactor: unit.conversion_factor
      }));

      setMeasureUnits(mapped);
    } catch (error) {
      console.error('Error fetching measure units:', error);
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async (units: MeasureUnit[]) => {
    setMeasureUnits(units);
    await fetchMeasureUnits();
  };
  const [opened, setOpened] = useState(false);
  const [editingUnit, setEditingUnit] = useState<MeasureUnit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
  });

  const handleSubmit = () => {
    if (editingUnit) {
      const updatedUnits = measureUnits.map(unit =>
        unit.id === editingUnit.id ? { ...unit, name: formData.name, symbol: formData.symbol } : unit
      );
      onUpdate(updatedUnits);
    } else {
      const newUnit: MeasureUnit = {
        id: Date.now().toString(),
        name: formData.name,
        symbol: formData.symbol,
        type: 'count',
      };
      onUpdate([...measureUnits, newUnit]);
    }
    setOpened(false);
    resetForm();
  };

  const handleEdit = (unit: MeasureUnit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      symbol: unit.symbol,
    });
    setOpened(true);
  };

  const handleDelete = (unitId: string) => {
    onUpdate(measureUnits.filter(unit => unit.id !== unitId));
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
            {unit.symbol}
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