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
  telegramUsername: string;
  role: 'user' | 'admin' | 'manager' | 'driver' | 'supplier';
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
  supplierContact: string;
  active: boolean;
  categories?: string[];
  groupChatId?: number;
  location?: string;
  qrCode?: string;
  priceList?: string;
  tags?: string[];
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