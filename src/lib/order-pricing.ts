import { z } from 'zod';

type Queryable = {
  query: (sql: string, values?: any[]) => Promise<any>;
};

type CakeRow = {
  id: string;
  name: string;
  base_price: number | string;
  customizable: number | boolean;
};

type OptionRow = {
  id: number | string;
  name: string;
  price: number | string;
};

export const OrderItemSchema = z.object({
  cakeId: z.string().trim().min(1).max(100),
  quantity: z.number().int().min(1).max(20),
  customizationSelectionIds: z.object({
    flavorId: z.string().trim().min(1).max(50).nullable(),
    sizeId: z.string().trim().min(1).max(50).nullable(),
    colorId: z.string().trim().min(1).max(50).nullable(),
    toppingIds: z.array(z.string().trim().min(1).max(50)).max(20),
  }).optional(),
});

export const DeliveryInfoSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(30),
  delivery_method: z.enum(['delivery', 'pickup']),
  address: z.string().trim().max(500).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  date: z.string().min(8).max(20),
}).superRefine((value, ctx) => {
  if (value.delivery_method === 'delivery' && !value.address?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['address'],
      message: 'Delivery address is required for deliveries',
    });
  }

  const deliveryDate = new Date(`${value.date}T00:00:00`);
  if (Number.isNaN(deliveryDate.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['date'],
      message: 'Delivery date is invalid',
    });
    return;
  }

  const minimumDate = new Date();
  minimumDate.setHours(0, 0, 0, 0);
  minimumDate.setDate(minimumDate.getDate() + 2);

  if (deliveryDate < minimumDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['date'],
      message: 'Delivery date must be at least 48 hours from today',
    });
  }
});

export const OrderRequestSchema = z.object({
  items: z.array(OrderItemSchema).min(1).max(10),
  deliveryInfo: DeliveryInfoSchema,
  paymentMethod: z.enum(['paystack', 'mpesa_paybill']).optional(),
  paymentConfirmed: z.boolean().optional(),
  paymentReference: z.string().trim().min(1).max(120).nullable().optional(),
});

export type OrderRequestData = z.infer<typeof OrderRequestSchema>;

type ResolvedCustomizationOption = {
  id: string;
  name: string;
  price: number;
};

type PricedOrderItem = {
  cakeId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  customizations: {
    flavor: ResolvedCustomizationOption | null;
    size: ResolvedCustomizationOption | null;
    color: ResolvedCustomizationOption | null;
    toppings: ResolvedCustomizationOption[];
  } | null;
};

export type PricedOrder = {
  items: PricedOrderItem[];
  totalAmount: number;
  depositAmount: number;
};

export class OrderPricingError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'OrderPricingError';
    this.status = status;
  }
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function parseSelectionId(rawValue: string | null | undefined, label: string) {
  if (!rawValue) {
    return null;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new OrderPricingError(`Invalid ${label} selection`);
  }

  return parsed;
}

async function loadOptionMap(
  queryable: Queryable,
  tableName: 'flavors' | 'sizes' | 'colors' | 'toppings',
  ids: number[]
) {
  if (ids.length === 0) {
    return new Map<number, ResolvedCustomizationOption>();
  }

  const [rows]: [OptionRow[], any] = await queryable.query(
    `SELECT id, name, price FROM ${tableName} WHERE id IN (?)`,
    [ids]
  );

  return new Map(
    rows.map((row) => [
      Number(row.id),
      {
        id: String(row.id),
        name: row.name,
        price: Number(row.price) || 0,
      },
    ])
  );
}

export async function priceOrder(queryable: Queryable, items: OrderRequestData['items']): Promise<PricedOrder> {
  const cakeIds = [...new Set(items.map((item) => item.cakeId))];
  const [cakeRows]: [CakeRow[], any] = await queryable.query(
    'SELECT id, name, base_price, customizable FROM cakes WHERE id IN (?)',
    [cakeIds]
  );

  const cakeMap = new Map(
    cakeRows.map((row) => [
      row.id,
      {
        id: row.id,
        name: row.name,
        basePrice: Number(row.base_price) || 0,
        customizable: Boolean(row.customizable),
      },
    ])
  );

  if (cakeMap.size !== cakeIds.length) {
    throw new OrderPricingError('One or more cake items are invalid');
  }

  const flavorIds = new Set<number>();
  const sizeIds = new Set<number>();
  const colorIds = new Set<number>();
  const toppingIds = new Set<number>();

  for (const item of items) {
    const selections = item.customizationSelectionIds;

    const flavorId = parseSelectionId(selections?.flavorId, 'flavor');
    const sizeId = parseSelectionId(selections?.sizeId, 'size');
    const colorId = parseSelectionId(selections?.colorId, 'color');
    const toppingSelectionIds = selections?.toppingIds ?? [];

    if (new Set(toppingSelectionIds).size !== toppingSelectionIds.length) {
      throw new OrderPricingError('Duplicate topping selections are not allowed');
    }

    if (flavorId) flavorIds.add(flavorId);
    if (sizeId) sizeIds.add(sizeId);
    if (colorId) colorIds.add(colorId);

    for (const toppingId of toppingSelectionIds) {
      toppingIds.add(parseSelectionId(toppingId, 'topping') as number);
    }
  }

  const flavors = await loadOptionMap(queryable, 'flavors', [...flavorIds]);
  const sizes = await loadOptionMap(queryable, 'sizes', [...sizeIds]);
  const colors = await loadOptionMap(queryable, 'colors', [...colorIds]);
  const toppings = await loadOptionMap(queryable, 'toppings', [...toppingIds]);

  const pricedItems: PricedOrderItem[] = [];

  for (const item of items) {
    const cake = cakeMap.get(item.cakeId);
    if (!cake) {
      throw new OrderPricingError('One or more cake items are invalid');
    }

    const selections = item.customizationSelectionIds;
    const toppingSelectionIds = selections?.toppingIds ?? [];
    let unitPrice = cake.basePrice;
    let customizations: PricedOrderItem['customizations'] = null;

    if (cake.customizable) {
      const flavorId = parseSelectionId(selections?.flavorId, 'flavor');
      const sizeId = parseSelectionId(selections?.sizeId, 'size');
      const colorId = parseSelectionId(selections?.colorId, 'color');

      if (!flavorId || !sizeId || !colorId) {
        throw new OrderPricingError(`Missing required customization for ${cake.name}`);
      }

      const flavor = flavors.get(flavorId);
      const size = sizes.get(sizeId);
      const color = colors.get(colorId);

      if (!flavor || !size || !color) {
        throw new OrderPricingError(`Invalid customization selected for ${cake.name}`);
      }

      const resolvedToppings = toppingSelectionIds.map((toppingId) => {
        const parsedId = parseSelectionId(toppingId, 'topping') as number;
        const topping = toppings.get(parsedId);

        if (!topping) {
          throw new OrderPricingError(`Invalid topping selected for ${cake.name}`);
        }

        return topping;
      });

      unitPrice += flavor.price + size.price + color.price + resolvedToppings.reduce((sum, topping) => sum + topping.price, 0);
      customizations = {
        flavor,
        size,
        color,
        toppings: resolvedToppings,
      };
    }

    const normalizedUnitPrice = roundCurrency(unitPrice);
    pricedItems.push({
      cakeId: cake.id,
      name: cake.name,
      quantity: item.quantity,
      unitPrice: normalizedUnitPrice,
      lineTotal: roundCurrency(normalizedUnitPrice * item.quantity),
      customizations,
    });
  }

  const totalAmount = roundCurrency(pricedItems.reduce((sum, item) => sum + item.lineTotal, 0));

  return {
    items: pricedItems,
    totalAmount,
    depositAmount: roundCurrency(totalAmount * 0.8),
  };
}
