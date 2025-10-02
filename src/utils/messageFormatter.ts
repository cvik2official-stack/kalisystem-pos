import { CartItem } from '../hooks/useCart';

export interface TeamHeader {
  date: Date;
  orderNumber: string;
  teamTags: string[];
  deliveryType?: string;
  paymentMethod?: string;
}

export interface SupplierHeader {
  status: string;
  tasksCompleted: number;
  totalTasks: number;
  invoiceAmount?: number;
  invoiceFileId?: string;
}

export interface OrderItem {
  id?: string;
  item_name: string;
  quantity: number;
  category?: string;
  is_available?: boolean;
  is_confirmed?: boolean;
}

export const formatDate = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `📅 ${day} ${month}. ${hours}:${minutes}`;
};

export const formatTeamHeader = (header: TeamHeader): string => {
  const lines: string[] = [];

  lines.push(formatDate(header.date));
  lines.push(`#️⃣ ${header.orderNumber}`);

  if (header.teamTags.length > 0) {
    lines.push(`📌 ${header.teamTags.join(', ')}`);
  } else {
    lines.push('📌 Not set');
  }

  if (header.deliveryType) {
    const emoji = header.deliveryType === 'Delivery' ? '🚚' : '💴';
    lines.push(`${emoji} ${header.deliveryType}`);
  } else {
    lines.push('🚚 Not set');
  }

  if (header.paymentMethod) {
    lines.push(`💲 ${header.paymentMethod}`);
  } else {
    lines.push('💲 Not set');
  }

  return lines.join('\n');
};

export const formatSupplierHeader = (header: SupplierHeader): string => {
  const lines: string[] = [];

  lines.push(`🔄 ${header.status}`);
  lines.push(`☑️ Supplier - ${header.tasksCompleted}/${header.totalTasks} tasks`);
  lines.push('  📊 Confirm item availability');
  lines.push('  💲 Set order amount');
  lines.push('  📄 Attach invoice');

  if (header.invoiceAmount) {
    lines.push(`\n💰 Amount: $${header.invoiceAmount.toFixed(2)}`);
  }

  if (header.invoiceFileId) {
    lines.push('📄 Invoice attached');
  }

  return lines.join('\n');
};

export const formatCartItems = (items: OrderItem[]): string => {
  if (items.length === 0) {
    return 'No items in cart';
  }

  const lines: string[] = ['\n📦 Items:'];

  items.forEach(item => {
    let emoji = '🔹';

    if (item.is_confirmed) {
      emoji = '✅';
    } else if (item.is_available === false) {
      emoji = '🔸';
    }

    lines.push(`${emoji} ${item.item_name} x ${item.quantity}`);
  });

  return lines.join('\n');
};

export const formatOrderMessage = (
  teamHeader: TeamHeader,
  items: OrderItem[],
  supplierHeader?: SupplierHeader
): string => {
  const parts: string[] = [];

  parts.push(formatTeamHeader(teamHeader));

  if (supplierHeader) {
    parts.push('\n' + formatSupplierHeader(supplierHeader));
  }

  parts.push(formatCartItems(items));

  return parts.join('\n');
};

export const getDeliveryTypeEmoji = (type: string): string => {
  switch (type) {
    case 'Delivery':
      return '🚚';
    case 'Pickup':
      return '💴';
    default:
      return '📦';
  }
};

export const getPaymentMethodEmoji = (method: string): string => {
  switch (method) {
    case 'NPY+Cash':
      return '💵';
    case 'ABA':
      return '💳';
    case 'Credit':
      return '💰';
    case 'TrueMoney':
      return '🧧';
    default:
      return '💲';
  }
};

export const getStatusEmoji = (status: string): string => {
  switch (status) {
    case 'New':
      return '🆕';
    case 'Pending':
      return '⏸️';
    case 'Pending Review':
      return '⏯️';
    case 'Processing':
      return '▶️';
    case 'Completed':
      return '🆗';
    default:
      return '❓';
  }
};
