'use client';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { type ServiceWorker } from '@/data/mockData';
import { useEffect } from 'react';
import { Users, CheckCircle, Star, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { WorkerModal } from '@/components/modals/WorkerModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { toast } from '@/hooks/use-toast';

export default function Workers() {
  const [search, setSearch] = useState('');
  const [workers, setWorkers] = useState<ServiceWorker[]>([]);
  const [badges, setBadges] = useState<{ id: string; name: string; color?: string }[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<ServiceWorker | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<ServiceWorker | null>(null);

  const specialties = [
    { value: 'driver', label: 'Жолооч (Driver)' },
    { value: 'plumber', label: 'Сантехник (Plumber)' },
    { value: 'electrician', label: 'Цахилгаанчин (Electrician)' },
    { value: 'carpenter', label: 'Мод засвар (Carpenter)' },
    { value: 'cleaner', label: 'Цэвэрлэгч (Cleaner)' },
  ];

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [resW, resB] = await Promise.all([
          fetch('/api/operation/workers'),
          fetch('/api/operation/badges'),
        ]);
        const bodyW = await resW.json();
        const bodyB = await resB.json();
        if (!mounted) return;
        if (resW.ok) setWorkers(bodyW.workers || []);
        else console.error('Failed to load workers', bodyW);
        if (resB.ok) setBadges(bodyB.badges || []);
        else console.error('Failed to load badges', bodyB);
      } catch (err) {
        console.error(err);
        toast({ title: 'Алдаа', description: 'Ажилтнууд ачааллахад алдаа гарлаа' });
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredWorkers = workers.filter(
    (worker) =>
      (worker.profile_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (worker.specialty || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('mn-MN', {
      style: 'currency',
      currency: 'MNT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleView = (worker: ServiceWorker) => {
    setSelectedWorker(worker);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (worker: ServiceWorker) => {
    setSelectedWorker(worker);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedWorker(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDelete = (worker: ServiceWorker) => {
    setWorkerToDelete(worker);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!workerToDelete) return;
    try {
      const res = await fetch(`/api/operation/workers/${workerToDelete.id}`, { method: 'DELETE' });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Delete failed');
      setWorkers((prev) => prev.filter((w) => w.id !== workerToDelete.id));
      toast({
        title: 'Ажилтан устгагдлаа',
        description: `${workerToDelete?.profile_name} амжилттай устгагдлаа`,
      });
    } catch (err: any) {
      toast({ title: 'Алдаа', description: err?.message || 'Устгах үед алдаа гарлаа' });
    } finally {
      setIsDeleteOpen(false);
      setWorkerToDelete(null);
    }
  };

  const handleSave = async (worker: Partial<ServiceWorker>) => {
    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/operation/workers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(worker),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || 'Create failed');
        setWorkers((prev) => [body.worker, ...prev]);
        toast({
          title: 'Ажилтан нэмэгдлээ',
          description: `${body.worker.profile_name} амжилттай нэмэгдлээ`,
        });
      } else if (selectedWorker) {
        const res = await fetch(`/api/operation/workers/${selectedWorker.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(worker),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || 'Update failed');
        setWorkers((prev) => prev.map((w) => (w.id === body.worker.id ? body.worker : w)));
        toast({
          title: 'Ажилтан шинэчлэгдлээ',
          description: `${body.worker.profile_name} амжилттай шинэчлэгдлээ`,
        });
      }
    } catch (err: any) {
      toast({ title: 'Алдаа', description: err?.message || 'Хадгалах үед алдаа гарлаа' });
    }
  };

  const columns = [
    {
      key: 'profile_name',
      header: 'Нэр',
      render: (worker: ServiceWorker) => (
        <div>
          <p className="font-medium text-foreground">{worker.profile_name}</p>
          <p className="text-xs text-muted-foreground">{worker.specialty}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'И-мэйл',
      render: (worker: ServiceWorker) => (
        <div>
          <p className="text-sm text-foreground">
            {(worker as any).profiles?.email || (worker as any).email || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'hourly_rate',
      header: 'Цагийн хөлс',
      render: (worker: ServiceWorker) => formatCurrency(worker.hourly_rate),
    },
    {
      key: 'rating',
      header: 'Үнэлгээ',
      render: (worker: ServiceWorker) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span>{worker.rating}</span>
        </div>
      ),
    },
    {
      key: 'completed_jobs',
      header: 'Дууссан ажил',
      render: (worker: ServiceWorker) => (
        <span className="text-foreground">{worker.completed_jobs}</span>
      ),
    },
    {
      key: 'badges',
      header: 'Тэмдэглэгээ',
      render: (worker: ServiceWorker) => (
        <div className="flex gap-1 flex-wrap">
          {worker.badges.map((badge, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {badge}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'is_available',
      header: 'Төлөв',
      render: (worker: ServiceWorker) => (
        <StatusBadge status={worker.is_available ? 'true' : ''} type="availability" />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Ажилчид</h2>
            <p className="text-muted-foreground">Үйлчилгээний ажилчдыг удирдах</p>
          </div>
          <Button onClick={handleCreate}>+ Шинэ ажилтан</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Нийт ажилчид"
            value={workers.length}
            icon={<Users className="w-5 h-5 text-muted-foreground" />}
          />
          <StatsCard
            title="Боломжтой"
            value={workers.filter((w) => w.is_available).length}
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          />
          <StatsCard
            title="Дундаж үнэлгээ"
            value={
              workers.length
                ? (workers.reduce((s, w) => s + (w.rating || 0), 0) / workers.length).toFixed(1)
                : '-'
            }
            icon={<Star className="w-5 h-5 text-yellow-500" />}
          />
          <StatsCard
            title="Нийт дууссан ажил"
            value={workers.reduce((s, w) => s + (w.completed_jobs || 0), 0)}
            icon={<Briefcase className="w-5 h-5 text-muted-foreground" />}
          />
        </div>

        <div className="flex items-center gap-4">
          <Input
            placeholder="Ажилтан хайх..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <DataTable
          data={filteredWorkers}
          columns={columns}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <WorkerModal
        worker={selectedWorker}
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        badges={badges}
        specialties={specialties}
      />

      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Ажилтан устгах уу?"
        description={`"${workerToDelete?.profile_name}" ажилтныг устгахдаа итгэлтэй байна уу?`}
      />
    </DashboardLayout>
  );
}
