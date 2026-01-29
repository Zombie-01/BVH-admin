'use client';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useEffect } from 'react';
import { Store as StoreIcon, CheckCircle, XCircle, Star } from 'lucide-react';

// Live Store type (backed by Supabase `stores` table)
interface Store {
  id: string;
  name: string;
  categories: string[];
  location?: string | null;
  phone?: string | null;
  is_open?: boolean;
  rating?: number;
  review_count?: number;
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StoreModal } from '@/components/modals/StoreModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function Stores() {
  const [search, setSearch] = useState('');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);

  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? `${cat.icon || ''} ${cat.name}`.trim() : catId;
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/operation/stores');
        const body = await res.json();
        if (!mounted) return;
        if (res.ok) {
          setStores(body.stores || []);
          setCategories(body.categories || []);
        } else console.error('Failed to load stores', body);
      } catch (err) {
        console.error(err);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredStores = stores.filter(
    (store) =>
      (store.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (store.categories || []).some((catId: string) => {
        const cat = categories.find((c) => c.id === catId);
        return (cat?.name || '').toLowerCase().includes(search.toLowerCase());
      })
  );

  const handleView = (store: Store) => {
    setSelectedStore(store);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (store: Store) => {
    setSelectedStore(store);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedStore(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDelete = (store: Store) => {
    setStoreToDelete(store);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!storeToDelete) return;
    try {
      const res = await fetch(`/api/operation/stores/${storeToDelete.id}`, { method: 'DELETE' });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Delete failed');
      setStores((prev) => prev.filter((s) => s.id !== storeToDelete.id));
      toast({
        title: 'Дэлгүүр устгагдлаа',
        description: `${storeToDelete?.name} амжилттай устгагдлаа`,
      });
    } catch (err: any) {
      toast({ title: 'Алдаа', description: err?.message || 'Устгах үед алдаа гарлаа' });
    } finally {
      setIsDeleteOpen(false);
      setStoreToDelete(null);
    }
  };

  const handleSave = async (store: Partial<Store>) => {
    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/operation/stores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(store),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || 'Create failed');
        setStores((prev) => [body.store, ...prev]);
        toast({
          title: 'Дэлгүүр нэмэгдлээ',
          description: `${body.store.name} амжилттай нэмэгдлээ`,
        });
      } else if (selectedStore) {
        const res = await fetch(`/api/operation/stores/${selectedStore.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(store),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || 'Update failed');
        setStores((prev) => prev.map((s) => (s.id === body.store.id ? body.store : s)));
        toast({
          title: 'Дэлгүүр шинэчлэгдлээ',
          description: `${body.store.name} амжилттай шинэчлэгдлээ`,
        });
      }
    } catch (err: any) {
      toast({ title: 'Алдаа', description: err?.message || 'Хадгалах үед алдаа гарлаа' });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Дэлгүүрийн нэр',
      render: (store: Store) => (
        <div>
          <p className="font-medium text-foreground">{store.name}</p>
          <div className="flex gap-1 mt-1 flex-wrap">
            {store.categories.slice(0, 2).map((catId) => (
              <Badge key={catId} variant="outline" className="text-xs">
                {getCategoryName(catId)}
              </Badge>
            ))}
            {store.categories.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{store.categories.length - 2}
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Байршил',
    },
    {
      key: 'rating',
      header: 'Үнэлгээ',
      render: (store: Store) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span>{store.rating}</span>
          <span className="text-muted-foreground">({store.review_count})</span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Утас',
    },
    {
      key: 'is_open',
      header: 'Төлөв',
      render: (store: Store) => (
        <StatusBadge status={store.is_open ? 'true' : ''} type="availability" />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Дэлгүүрүүд</h2>
            <p className="text-muted-foreground">Бүх дэлгүүрүүдийг удирдах</p>
          </div>
          <Button onClick={handleCreate}>+ Шинэ дэлгүүр</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Нийт дэлгүүр"
            value={stores.length}
            icon={<StoreIcon className="w-5 h-5 text-muted-foreground" />}
          />
          <StatsCard
            title="Идэвхтэй"
            value={stores.filter((s) => s.is_open).length}
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          />
          <StatsCard
            title="Идэвхгүй"
            value={stores.filter((s) => !s.is_open).length}
            icon={<XCircle className="w-5 h-5 text-muted-foreground" />}
          />
        </div>

        <div className="flex items-center gap-4">
          <Input
            placeholder="Дэлгүүр хайх..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <DataTable
          data={filteredStores}
          columns={columns}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <StoreModal
        store={selectedStore}
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        categories={categories}
      />

      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Дэлгүүр устгах уу?"
        description={`"${storeToDelete?.name}" дэлгүүрийг устгахдаа итгэлтэй байна уу?`}
      />
    </DashboardLayout>
  );
}
