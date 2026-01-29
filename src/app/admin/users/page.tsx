'use client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Users as UsersIcon, UserCheck, UserX, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operation' | 'user';
  status: 'active' | 'inactive';
  created_at: string | null;
  last_login: string | null;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/admin/users');
        if (!mounted) return;
        const body = await res.json();
        if (res.ok) setUsers(body.users || []);
        else console.error('Failed to load users', body);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default">Админ</Badge>;
      case 'operation':
        return <Badge variant="secondary">Үйл ажиллагаа</Badge>;
      default:
        return <Badge variant="outline">Хэрэглэгч</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default">Идэвхтэй</Badge>
    ) : (
      <Badge variant="secondary">Идэвхгүй</Badge>
    );
  };

  const columns = [
    {
      key: 'name',
      header: 'Нэр',
      render: (user: User) => (
        <div>
          <p className="font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Эрх',
      render: (user: User) => getRoleBadge(user.role),
    },
    {
      key: 'status',
      header: 'Төлөв',
      render: (user: User) => getStatusBadge(user.status),
    },
    {
      key: 'created_at',
      header: 'Бүртгүүлсэн',
    },
    {
      key: 'last_login',
      header: 'Сүүлийн нэвтрэлт',
    },
  ];

  const activeUsers = users.filter((u) => u.status === 'active').length;
  const adminUsers = users.filter((u) => u.role === 'admin').length;
  const operationUsers = users.filter((u) => u.role === 'operation').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Хэрэглэгчид</h2>
            <p className="text-muted-foreground">Системийн хэрэглэгчдийг удирдах</p>
          </div>
          <Button>+ Шинэ хэрэглэгч</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Нийт хэрэглэгч"
            value={users.length}
            icon={<UsersIcon className="w-5 h-5 text-muted-foreground" />}
          />
          <StatsCard
            title="Идэвхтэй"
            value={activeUsers}
            icon={<UserCheck className="w-5 h-5 text-green-500" />}
          />
          <StatsCard
            title="Админ"
            value={adminUsers}
            icon={<Shield className="w-5 h-5 text-muted-foreground" />}
          />
          <StatsCard
            title="Үйл ажиллагаа"
            value={operationUsers}
            icon={<UserX className="w-5 h-5 text-muted-foreground" />}
          />
        </div>

        <div className="flex items-center gap-4">
          <Input
            placeholder="Хэрэглэгч хайх..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <DataTable
          data={filteredUsers}
          columns={columns}
          onView={(user) => console.log('View', user)}
          onEdit={(user) => console.log('Edit', user)}
          onDelete={(user) => console.log('Delete', user)}
        />

        {loading && <p className="text-sm text-muted-foreground">Ачааллаж байна…</p>}
      </div>
    </DashboardLayout>
  );
}
