import pool from '@/lib/db';
import type { Cake, Color, CustomizationOptions, Flavor, Size, Topping } from '@/lib/types';

function normalizeCake(row: any): Cake {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description || ''),
    base_price: Number(row.base_price) || 0,
    image_data_uri: row.image_data_uri ? String(row.image_data_uri) : null,
    rating: Number(row.rating) || 0,
    category: String(row.category || ''),
    orders_count: Number(row.orders_count) || 0,
    ready_time: String(row.ready_time || ''),
    customizable: Boolean(row.customizable),
  };
}

function normalizeFlavor(row: any): Flavor {
  return {
    id: String(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : undefined,
    price: Number(row.price) || 0,
  };
}

function normalizeSize(row: any): Size {
  return {
    id: String(row.id),
    name: String(row.name),
    serves: String(row.serves || ''),
    price: Number(row.price) || 0,
  };
}

function normalizeColor(row: any): Color {
  return {
    id: String(row.id),
    name: String(row.name),
    hex_value: String(row.hex_value || '#FFFFFF'),
    price: Number(row.price) || 0,
  };
}

function normalizeTopping(row: any): Topping {
  return {
    id: String(row.id),
    name: String(row.name),
    price: Number(row.price) || 0,
  };
}

export async function getCakeByIdFromDb(id: string): Promise<Cake | null> {
  const [rows]: any = await pool.query('SELECT * FROM cakes WHERE id = ? LIMIT 1', [id]);
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return normalizeCake(rows[0]);
}

export async function getCustomizationOptionsFromDb(): Promise<CustomizationOptions> {
  const [flavors]: any = await pool.query('SELECT * FROM flavors ORDER BY name ASC');
  const [sizes]: any = await pool.query('SELECT * FROM sizes ORDER BY price ASC');
  const [colors]: any = await pool.query('SELECT * FROM colors ORDER BY name ASC');
  const [toppings]: any = await pool.query('SELECT * FROM toppings ORDER BY name ASC');

  return {
    flavors: Array.isArray(flavors) ? flavors.map(normalizeFlavor) : [],
    sizes: Array.isArray(sizes) ? sizes.map(normalizeSize) : [],
    colors: Array.isArray(colors) ? colors.map(normalizeColor) : [],
    toppings: Array.isArray(toppings) ? toppings.map(normalizeTopping) : [],
  };
}

export async function listCakesForSitemap(): Promise<Array<Pick<Cake, 'id' | 'name' | 'image_data_uri'>>> {
  const [rows]: any = await pool.query('SELECT id, name, image_data_uri FROM cakes ORDER BY name ASC');
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    image_data_uri: row.image_data_uri ? String(row.image_data_uri) : null,
  }));
}
