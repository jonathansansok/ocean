export type Product = {
  id: number;
  name: string;
  price: number;
};

export type OrderItem = {
  id: number
  product_id: number
  qty: number
  unit_price: number
  line_total: number
  product?: { id: number; name: string; price: number } | null
}

export type Order = {
  id: number;
  status: "saved" | "closed";
  total: number;
  created_at: string;
  created_by: string | null;
  assigned_to: string | null;
  created_by_profile?: { id: string; email: string; role: string } | null;
  assigned_to_profile?: { id: string; email: string; role: string } | null;
  order_items: OrderItem[];
};
