import { User, Team, Supplier, Category } from '../types';

export const defaultUsers: User[] = [
  { id: '1', name: 'Admin User', role: 'admin', color: '#e74c3c', active: true },
  { id: '2', name: 'Manager', role: 'manager', team: 'operations', color: '#3498db', active: true },
  { id: '3', name: 'Driver 1', role: 'driver', team: 'delivery', color: '#2ecc71', active: true },
  { id: '4', name: 'Supplier Rep', role: 'supplier', color: '#f39c12', active: true },
];

export const defaultTeams: Team[] = [
  { id: '1', name: 'Operations', color: '#3498db', members: ['2'], description: 'Main operations team' },
  { id: '2', name: 'Delivery', color: '#2ecc71', members: ['3'], description: 'Delivery and logistics' },
  { id: '3', name: 'Management', color: '#9b59b6', members: ['1'], description: 'Administrative team' },
];

export const defaultSuppliers: Supplier[] = [
  { id: '1', name: 'pisey', contact: '+855 12 345 678', email: 'pisey@supplier.com', color: '#e74c3c', active: true, categories: ['10', '11'] },
  { id: '2', name: 'hong kong shop', contact: '+852 9876 5432', email: 'contact@hkshop.com', color: '#3498db', active: true, categories: ['10'] },
  { id: '3', name: 'pp distributor', contact: '+855 77 888 999', email: 'orders@ppdist.com', color: '#2ecc71', active: true, categories: ['11'] },
  { id: '4', name: 'Takaway shop', contact: '+855 96 123 456', email: 'info@takaway.com', color: '#f39c12', active: true, categories: ['11', '12'] },
  { id: '5', name: 'pizza+', contact: '+855 88 777 666', email: 'supply@pizzaplus.com', color: '#9b59b6', active: true, categories: ['14'] },
  { id: '6', name: 'Metro Wholesale', contact: '+855 23 456 789', email: 'wholesale@metro.com', color: '#1abc9c', active: true, categories: ['15'] },
  { id: '7', name: 'Fresh Market Co', contact: '+855 17 234 567', email: 'fresh@market.com', color: '#34495e', active: true, categories: ['15', '10'] },
  { id: '8', name: 'Kitchen Pro Supply', contact: '+855 70 987 654', email: 'pro@kitchen.com', color: '#8e44ad', active: false, categories: ['12', '14'] },
];

export const defaultCategories: Category[] = [
  // Parent categories
  { id: '1', name: 'Kitchen Supplies', color: '#e74c3c', icon: '🍳', level: 'parent', order: 1 },
  { id: '2', name: 'Packaging', color: '#3498db', icon: '📦', level: 'parent', order: 2 },
  { id: '3', name: 'Food Items', color: '#2ecc71', icon: '🍕', level: 'parent', order: 3 },
  
  // Main categories
  { id: '4', name: 'Cleaning', color: '#ec4899', icon: '🧽', level: 'main', parentId: '1', order: 1 },
  { id: '5', name: 'Utensils', color: '#3b82f6', icon: '🍴', level: 'main', parentId: '1', order: 2 },
  { id: '6', name: 'Paper Products', color: '#ef4444', icon: '🧻', level: 'main', parentId: '1', order: 3 },
  { id: '7', name: 'Containers', color: '#f97316', icon: '📦', level: 'main', parentId: '2', order: 1 },
  { id: '8', name: 'Bags', color: '#06b6d4', icon: '👜', level: 'main', parentId: '2', order: 2 },
  { id: '9', name: 'Dairy', color: '#eab308', icon: '🧀', level: 'main', parentId: '3', order: 1 },
  
  // Categories
  { id: '10', name: 'Cleaning for kitchen', color: '#ec4899', icon: '🧽', level: 'category', parentId: '4', order: 1 },
  { id: '11', name: 'Box', color: '#f97316', icon: '📦', level: 'category', parentId: '7', order: 1 },
  { id: '12', name: 'Ustensil', color: '#3b82f6', icon: '🍴', level: 'category', parentId: '5', order: 1 },
  { id: '13', name: 'Plastic bag', color: '#06b6d4', icon: '👜', level: 'category', parentId: '8', order: 1 },
  { id: '14', name: 'kitchen roll', color: '#ef4444', icon: '🧻', level: 'category', parentId: '6', order: 1 },
  { id: '15', name: 'Cheese', color: '#eab308', icon: '🧀', level: 'category', parentId: '9', order: 1 },
];

