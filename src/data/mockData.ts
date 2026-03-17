// Mock data based on the provided schema

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  store_count: number;
  created_at: string;
}

export interface BadgeType {
  id: string;
  name: string;
  description: string | null;
  color: string;
  worker_count: number;
  created_at: string;
}

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  image: string | null;
  rating: number;
  review_count: number;
  categories: string[]; // Changed to array for multi-select
  location: string | null;
  phone: string | null;
  is_open: boolean;
  created_at: string;
}

export interface ServiceWorker {
  id: string;
  profile_id: string;
  profile_name: string;
  specialty: string;
  description: string | null;
  hourly_rate: number | null;
  rating: number;
  completed_jobs: number;
  badges: string[];
  is_available: boolean;
  created_at: string;
  // Location data for map
  lat?: number;
  lng?: number;
  current_task?: string;
}

export interface Order {
  id: string;
  user_id: string;
  user_name: string;
  store_id: string | null;
  store_name: string | null;
  worker_id: string | null;
  worker_name: string | null;
  type: 'delivery' | 'service';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  delivery_address: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  created_at: string;
}

export interface ReportData {
  date: string;
  orders: number;
  revenue: number;
  deliveries: number;
  services: number;
}

export interface ProductSalesData {
  name: string;
  sales: number;
  revenue: number;
}

// Mock data removed - using real data from API endpoints
// Fetch data using: /api/admin/categories, /api/admin/badges, /api/admin/stores, /api/operation/workers, /api/v1/orders, etc.
