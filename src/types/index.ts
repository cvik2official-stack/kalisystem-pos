export interface Item {
  id: string;
  name: string;
  category: string;
  supplier: string;
  createdAt: Date;
  measureUnit?: string;
  formula?: string;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  parentId?: string;
  level: 'parent' | 'main' | 'category' | 'subcategory';
  children?: Category[];
  order: number;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'driver' | 'supplier' | 'owner';
  team?: string;
  color: string;
  active: boolean;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  members: string[];
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  color: string;
  active: boolean;
  categories?: string[];
  groupChatId?: number;
  location?: string;
  qrCode?: string;
  priceList?: string;
  tags?: string[];
}

export interface MeasureUnit {
  id: string;
  name: string;
  symbol: string;
  type: 'weight' | 'volume' | 'length' | 'count' | 'time';
  baseUnit?: string;
  conversionFactor?: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface CSVItem {
  Item_name: string;
  category: string;
  default_supplier: string;
  supplier_alternative?: string;
  order_quantity?: string;
  measure_unit?: string;
  default_quantity?: string;
  brand_tag?: string;
}

export interface OrderedCSVItem extends CSVItem {
  quantity: number;
}

export interface TagManagement {
  users: User[];
  teams: Team[];
  suppliers: Supplier[];
  categories: Category[];
  measureUnits: MeasureUnit[];
}