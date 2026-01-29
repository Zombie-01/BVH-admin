'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { type Category, type BadgeType } from '@/data/mockData';
import { Tags, Award, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryModal } from '@/components/modals/CategoryModal';
import { BadgeModal } from '@/components/modals/BadgeModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Categories() {
  const [categorySearch, setCategorySearch] = useState('');
  const [badgeSearch, setBadgeSearch] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryModalMode, setCategoryModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryDeleteOpen, setIsCategoryDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [badgeModalMode, setBadgeModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isBadgeDeleteOpen, setIsBadgeDeleteOpen] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState<BadgeType | null>(null);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredBadges = badges.filter((badge) =>
    badge.name.toLowerCase().includes(badgeSearch.toLowerCase())
  );

  useEffect(() => {
    fetchCategories();
    fetchBadges();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/operation/categories');
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to fetch categories');
      setCategories(body.categories || []);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Алдаа', description: err?.message || 'Ангилал ачааллахад алдаа гарлаа' });
    }
  };

  const fetchBadges = async () => {
    try {
      const res = await fetch('/api/operation/badges');
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to fetch badges');
      setBadges(body.badges || []);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Алдаа', description: err?.message || 'Тэмдэг ачааллахад алдаа гарлаа' });
    }
  };

  // Category handlers
  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryModalMode('view');
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryModalMode('edit');
    setIsCategoryModalOpen(true);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setCategoryModalMode('create');
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setIsCategoryDeleteOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await fetch(`/api/operation/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Delete failed');
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      toast({
        title: 'Ангилал устгагдлаа',
        description: `${categoryToDelete.name} амжилттай устгагдлаа`,
      });
    } catch (err: any) {
      toast({ title: 'Алдаа', description: err?.message || 'Устгах үед алдаа гарлаа' });
    } finally {
      setIsCategoryDeleteOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleSaveCategory = async (category: Partial<Category>) => {
    try {
      if (categoryModalMode === 'create') {
        const res = await fetch('/api/operation/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(category),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || 'Create failed');
        setCategories((prev) => [body.category, ...prev]);
        toast({
          title: 'Ангилал нэмэгдлээ',
          description: `${body.category.name} амжилттай нэмэгдлээ`,
        });
      } else if (selectedCategory) {
        const res = await fetch(`/api/operation/categories/${selectedCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(category),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || 'Update failed');
        setCategories((prev) => prev.map((c) => (c.id === body.category.id ? body.category : c)));
        toast({
          title: 'Ангилал шинэчлэгдлээ',
          description: `${body.category.name} амжилттай шинэчлэгдлээ`,
        });
      }
    } catch (err: any) {
      toast({ title: 'Алдаа', description: err?.message || 'Хадгалах үед алдаа гарлаа' });
    }
  };

  // Badge handlers
  const handleViewBadge = (badge: BadgeType) => {
    setSelectedBadge(badge);
    setBadgeModalMode('view');
    setIsBadgeModalOpen(true);
  };

  const handleEditBadge = (badge: BadgeType) => {
    setSelectedBadge(badge);
    setBadgeModalMode('edit');
    setIsBadgeModalOpen(true);
  };

  const handleCreateBadge = () => {
    setSelectedBadge(null);
    setBadgeModalMode('create');
    setIsBadgeModalOpen(true);
  };

  const handleDeleteBadge = (badge: BadgeType) => {
    setBadgeToDelete(badge);
    setIsBadgeDeleteOpen(true);
  };

  const confirmDeleteBadge = async () => {
    if (!badgeToDelete) return;
    try {
      const res = await fetch(`/api/operation/badges/${badgeToDelete.id}`, { method: 'DELETE' });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Delete failed');
      setBadges((prev) => prev.filter((b) => b.id !== badgeToDelete.id));
      toast({
        title: 'Тэмдэг устгагдлаа',
        description: `${badgeToDelete.name} амжилттай устгагдлаа`,
      });
    } catch (err: any) {
      toast({ title: 'Алдаа', description: err?.message || 'Устгах үед алдаа гарлаа' });
    } finally {
      setIsBadgeDeleteOpen(false);
      setBadgeToDelete(null);
    }
  };

  const handleSaveBadge = async (badge: Partial<BadgeType>) => {
    try {
      if (badgeModalMode === 'create') {
        const res = await fetch('/api/operation/badges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(badge),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || 'Create failed');
        setBadges((prev) => [body.badge, ...prev]);
        toast({ title: 'Тэмдэг нэмэгдлээ', description: `${body.badge.name} амжилттай нэмэгдлээ` });
      } else if (selectedBadge) {
        const res = await fetch(`/api/operation/badges/${selectedBadge.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(badge),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || 'Update failed');
        setBadges((prev) => prev.map((b) => (b.id === body.badge.id ? body.badge : b)));
        toast({
          title: 'Тэмдэг шинэчлэгдлээ',
          description: `${body.badge.name} амжилттай шинэчлэгдлээ`,
        });
      }
    } catch (err: any) {
      toast({ title: 'Алдаа', description: err?.message || 'Хадгалах үед алдаа гарлаа' });
    }
  };

  const categoryColumns = [
    {
      key: 'name',
      header: 'Нэр',
      render: (category: Category) => (
        <div className="flex items-center gap-2">
          {category.icon && <span>{category.icon}</span>}
          <span className="font-medium text-foreground">{category.name}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Тайлбар',
      render: (category: Category) => (
        <span className="text-muted-foreground">{category.description || '-'}</span>
      ),
    },
    {
      key: 'store_count',
      header: 'Дэлгүүрүүд',
      render: (category: Category) => <span>{category.store_count ?? 0}</span>,
    },
  ];

  const badgeColumns = [
    {
      key: 'name',
      header: 'Нэр',
      render: (badge: BadgeType) => (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: badge.color }} />
          <span className="font-medium text-foreground">{badge.name}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Тайлбар',
      render: (badge: BadgeType) => (
        <span className="text-muted-foreground">{badge.description || '-'}</span>
      ),
    },
    {
      key: 'worker_count',
      header: 'Ажилчид',
      render: (badge: BadgeType) => <span>{badge.worker_count ?? 0}</span>,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ангилал & Тэмдэг</h2>
          <p className="text-muted-foreground">
            Дэлгүүр болон ажилчдын ангилал, тэмдгүүдийг удирдах
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard
            title="Нийт ангилал"
            value={categories.length}
            icon={<Tags className="w-5 h-5 text-muted-foreground" />}
          />
          <StatsCard
            title="Нийт тэмдэг"
            value={badges.length}
            icon={<Award className="w-5 h-5 text-muted-foreground" />}
          />
        </div>

        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">Ангилалууд</TabsTrigger>
            <TabsTrigger value="badges">Тэмдгүүд</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Input
                placeholder="Ангилал хайх..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={handleCreateCategory}>
                <Plus className="w-4 h-4 mr-2" />
                Шинэ ангилал
              </Button>
            </div>

            <DataTable
              data={filteredCategories}
              columns={categoryColumns}
              onView={handleViewCategory}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Input
                placeholder="Тэмдэг хайх..."
                value={badgeSearch}
                onChange={(e) => setBadgeSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={handleCreateBadge}>
                <Plus className="w-4 h-4 mr-2" />
                Шинэ тэмдэг
              </Button>
            </div>

            <DataTable
              data={filteredBadges}
              columns={badgeColumns}
              onView={handleViewBadge}
              onEdit={handleEditBadge}
              onDelete={handleDeleteBadge}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CategoryModal
        category={selectedCategory}
        mode={categoryModalMode}
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        onSave={handleSaveCategory}
      />

      <DeleteConfirmModal
        open={isCategoryDeleteOpen}
        onOpenChange={setIsCategoryDeleteOpen}
        onConfirm={confirmDeleteCategory}
        title="Ангилал устгах уу?"
        description={`"${categoryToDelete?.name}" ангилалыг устгахдаа итгэлтэй байна уу?`}
      />

      <BadgeModal
        badge={selectedBadge}
        mode={badgeModalMode}
        open={isBadgeModalOpen}
        onOpenChange={setIsBadgeModalOpen}
        onSave={handleSaveBadge}
      />

      <DeleteConfirmModal
        open={isBadgeDeleteOpen}
        onOpenChange={setIsBadgeDeleteOpen}
        onConfirm={confirmDeleteBadge}
        title="Тэмдэг устгах уу?"
        description={`"${badgeToDelete?.name}" тэмдгийг устгахдаа итгэлтэй байна уу?`}
      />
    </DashboardLayout>
  );
}
