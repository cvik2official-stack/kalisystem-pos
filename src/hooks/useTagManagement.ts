import { useState } from 'react';
import { TagManagement, User, Team, Supplier, Category, Tag } from '../types';
import { defaultUsers, defaultTeams, defaultSuppliers, defaultCategories } from '../data/defaultData';

const defaultBrandTags: Tag[] = [
  { id: '1', name: 'Premium', color: '#e74c3c' },
  { id: '2', name: 'Organic', color: '#27ae60' },
  { id: '3', name: 'Local', color: '#3498db' },
  { id: '4', name: 'Imported', color: '#9b59b6' },
];


export const useTagManagement = () => {
  const [tagData, setTagData] = useState<TagManagement>({
    users: defaultUsers,
    teams: defaultTeams,
    suppliers: defaultSuppliers,
    categories: defaultCategories,
  });

  const [brandTags, setBrandTags] = useState<Tag[]>(defaultBrandTags);

  const updateUsers = (users: User[]) => {
    setTagData(prev => ({ ...prev, users }));
  };

  const updateTeams = (teams: Team[]) => {
    setTagData(prev => ({ ...prev, teams }));
  };

  const updateSuppliers = (suppliers: Supplier[]) => {
    setTagData(prev => ({ ...prev, suppliers }));
  };

  const updateCategories = (categories: Category[]) => {
    setTagData(prev => ({ ...prev, categories }));
  };


  const addUser = (user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
    };
    updateUsers([...tagData.users, newUser]);
  };

  const addTeam = (team: Omit<Team, 'id'>) => {
    const newTeam: Team = {
      ...team,
      id: Date.now().toString(),
    };
    updateTeams([...tagData.teams, newTeam]);
  };

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
    };
    updateSuppliers([...tagData.suppliers, newSupplier]);
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    updateCategories([...tagData.categories, newCategory]);
  };


  const updateBrandTags = (tags: Tag[]) => {
    setBrandTags(tags);
  };


  return {
    tagData,
    brandTags,
    updateUsers,
    updateTeams,
    updateSuppliers,
    updateCategories,
    updateBrandTags,
    addUser,
    addTeam,
    addSupplier,
    addCategory,
  };
};