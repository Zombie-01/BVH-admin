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

// Mock Categories
export const mockCategories: Category[] = [
  {
    id: 'c1',
    name: 'Хүнс',
    description: 'Хүнсний бүтээгдэхүүн',
    icon: '🍎',
    store_count: 8,
    created_at: '2024-01-01',
  },
  {
    id: 'c2',
    name: 'Электроник',
    description: 'Электроникийн бараа',
    icon: '📱',
    store_count: 5,
    created_at: '2024-01-01',
  },
  {
    id: 'c3',
    name: 'Гоо сайхан',
    description: 'Гоо сайхны бүтээгдэхүүн',
    icon: '💄',
    store_count: 4,
    created_at: '2024-01-01',
  },
  {
    id: 'c4',
    name: 'Спорт',
    description: 'Спортын хэрэгсэл',
    icon: '⚽',
    store_count: 3,
    created_at: '2024-01-01',
  },
  {
    id: 'c5',
    name: 'Хувцас',
    description: 'Хувцас хэрэглэл',
    icon: '👕',
    store_count: 6,
    created_at: '2024-01-01',
  },
];

// Mock Badges
export const mockBadges: BadgeType[] = [
  {
    id: 'b1',
    name: 'Verified',
    description: 'Баталгаажсан ажилтан',
    color: '#22c55e',
    worker_count: 45,
    created_at: '2024-01-01',
  },
  {
    id: 'b2',
    name: 'Top Rated',
    description: 'Өндөр үнэлгээтэй',
    color: '#eab308',
    worker_count: 12,
    created_at: '2024-01-01',
  },
  {
    id: 'b3',
    name: 'Expert',
    description: 'Мэргэжилтэн',
    color: '#3b82f6',
    worker_count: 8,
    created_at: '2024-01-01',
  },
  {
    id: 'b4',
    name: 'Premium',
    description: 'Премиум ажилтан',
    color: '#a855f7',
    worker_count: 5,
    created_at: '2024-01-01',
  },
  {
    id: 'b5',
    name: 'Fast',
    description: 'Хурдан үйлчилгээ',
    color: '#f97316',
    worker_count: 20,
    created_at: '2024-01-01',
  },
];

// Mock Stores
export const mockStores: Store[] = [
  {
    id: '1',
    owner_id: 'u1',
    name: 'Хүнсний Дэлгүүр №1',
    description: 'Өдөр тутмын хүнсний бараа',
    image: null,
    rating: 4.5,
    review_count: 128,
    categories: ['c1', 'c5'],
    location: 'Улаанбаатар, Баянзүрх',
    phone: '+976 9911 1234',
    is_open: true,
    created_at: '2024-01-15',
  },
  {
    id: '2',
    owner_id: 'u2',
    name: 'Электроник Шоп',
    description: 'Гар утас, компьютер',
    image: null,
    rating: 4.2,
    review_count: 89,
    categories: ['c2'],
    location: 'Улаанбаатар, Сүхбаатар',
    phone: '+976 9922 5678',
    is_open: true,
    created_at: '2024-02-20',
  },
  {
    id: '3',
    owner_id: 'u3',
    name: 'Гоо Сайхны Бутик',
    description: 'Гоо сайхны бүтээгдэхүүн',
    image: null,
    rating: 4.8,
    review_count: 256,
    categories: ['c3', 'c5'],
    location: 'Улаанбаатар, Хан-Уул',
    phone: '+976 9933 9012',
    is_open: false,
    created_at: '2024-03-10',
  },
  {
    id: '4',
    owner_id: 'u4',
    name: 'Спорт Хэрэгсэл',
    description: 'Спортын хувцас, хэрэгсэл',
    image: null,
    rating: 4.3,
    review_count: 67,
    categories: ['c4', 'c5'],
    location: 'Улаанбаатар, Чингэлтэй',
    phone: '+976 9944 3456',
    is_open: true,
    created_at: '2024-04-05',
  },
];

// Mock Product Sales Data
export const mockProductSales: ProductSalesData[] = [
  { name: 'Гар утас', sales: 245, revenue: 856000000 },
  { name: 'Хүнсний бараа', sales: 1890, revenue: 156000000 },
  { name: 'Хувцас', sales: 567, revenue: 234000000 },
  { name: 'Гоо сайхан', sales: 389, revenue: 178000000 },
  { name: 'Спорт хэрэгсэл', sales: 156, revenue: 89000000 },
  { name: 'Ахуйн бараа', sales: 423, revenue: 67000000 },
];

// Mock Service Workers
export const mockWorkers: ServiceWorker[] = [
  {
    id: 'w1',
    profile_id: 'p1',
    profile_name: 'Батбаяр Д.',
    specialty: 'Сантехник',
    description: 'Усан хангамж, халаалтын систем',
    hourly_rate: 25000,
    rating: 4.7,
    completed_jobs: 156,
    badges: ['Verified', 'Top Rated'],
    is_available: true,
    created_at: '2024-01-10',
  },
  {
    id: 'w2',
    profile_id: 'p2',
    profile_name: 'Ганбаатар С.',
    specialty: 'Цахилгаанчин',
    description: 'Цахилгаан угсралт, засвар',
    hourly_rate: 30000,
    rating: 4.9,
    completed_jobs: 203,
    badges: ['Verified', 'Expert'],
    is_available: true,
    created_at: '2024-02-15',
  },
  {
    id: 'w3',
    profile_id: 'p3',
    profile_name: 'Энхбат Т.',
    specialty: 'Тавилга угсрах',
    description: 'Гэрийн тавилга угсралт',
    hourly_rate: 20000,
    rating: 4.4,
    completed_jobs: 89,
    badges: ['Verified'],
    is_available: false,
    created_at: '2024-03-20',
  },
  {
    id: 'w4',
    profile_id: 'p4',
    profile_name: 'Мөнхбат О.',
    specialty: 'Засал чимэглэл',
    description: 'Гэрийн засал чимэглэл',
    hourly_rate: 35000,
    rating: 4.6,
    completed_jobs: 124,
    badges: ['Verified', 'Premium'],
    is_available: true,
    created_at: '2024-04-25',
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'o1',
    user_id: 'u1',
    user_name: 'Болд Б.',
    store_id: '1',
    store_name: 'Хүнсний Дэлгүүр №1',
    worker_id: null,
    worker_name: null,
    type: 'delivery',
    status: 'completed',
    total_amount: 45000,
    delivery_address: 'Баянзүрх, 3-р хороо',
    created_at: '2024-12-01',
  },
  {
    id: 'o2',
    user_id: 'u2',
    user_name: 'Сүхбат А.',
    store_id: null,
    store_name: null,
    worker_id: 'w1',
    worker_name: 'Батбаяр Д.',
    type: 'service',
    status: 'in_progress',
    total_amount: 75000,
    delivery_address: 'Сүхбаатар, 1-р хороо',
    created_at: '2024-12-05',
  },
  {
    id: 'o3',
    user_id: 'u3',
    user_name: 'Ганзориг Н.',
    store_id: '2',
    store_name: 'Электроник Шоп',
    worker_id: null,
    worker_name: null,
    type: 'delivery',
    status: 'pending',
    total_amount: 350000,
    delivery_address: 'Хан-Уул, 11-р хороо',
    created_at: '2024-12-10',
  },
  {
    id: 'o4',
    user_id: 'u4',
    user_name: 'Төмөр Э.',
    store_id: null,
    store_name: null,
    worker_id: 'w2',
    worker_name: 'Ганбаатар С.',
    type: 'service',
    status: 'confirmed',
    total_amount: 120000,
    delivery_address: 'Чингэлтэй, 5-р хороо',
    created_at: '2024-12-12',
  },
];

// Mock Report Data (last 7 days)
export const mockReportData: ReportData[] = [
  { date: '12/18', orders: 45, revenue: 2350000, deliveries: 32, services: 13 },
  { date: '12/19', orders: 52, revenue: 2780000, deliveries: 38, services: 14 },
  { date: '12/20', orders: 48, revenue: 2540000, deliveries: 35, services: 13 },
  { date: '12/21', orders: 61, revenue: 3120000, deliveries: 42, services: 19 },
  { date: '12/22', orders: 58, revenue: 2980000, deliveries: 40, services: 18 },
  { date: '12/23', orders: 67, revenue: 3450000, deliveries: 48, services: 19 },
  { date: '12/24', orders: 72, revenue: 3780000, deliveries: 52, services: 20 },
];

// Summary stats
export const mockStats = {
  totalStores: 24,
  activeStores: 21,
  totalWorkers: 48,
  availableWorkers: 35,
  totalOrders: 1247,
  pendingOrders: 23,
  totalRevenue: 45780000,
  monthlyRevenue: 12450000,
};
