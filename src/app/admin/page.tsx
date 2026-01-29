import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import {
  Store,
  Users,
  ShoppingCart,
  DollarSign,
  Activity,
  Shield,
  Database,
  Server,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import supabaseServer from '@/lib/supabaseServer';

export default async function Admin() {
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat('mn-MN', {
        maximumFractionDigits: 0,
      }).format(amount) + '₮'
    );
  };

  // fetch stats from DB + auth
  let stats = {
    totalStores: 0,
    activeStores: 0,
    totalWorkers: 0,
    availableWorkers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
  };

  try {
    const usersList = await supabaseServer.auth.admin.listUsers();
    // workers are stored in 'workers' table maybe
    const { data: stores } = await supabaseServer.from('stores').select('id,is_open');
    const { data: workers } = await supabaseServer.from('workers').select('id,is_available');
    const { data: orders } = await supabaseServer
      .from('orders')
      .select('id,total_amount,status,created_at');

    if (stores) {
      stats.totalStores = stores.length;
      stats.activeStores = stores.filter((s: any) => s.is_open).length;
    }
    if (workers) {
      stats.totalWorkers = workers.length;
      stats.availableWorkers = workers.filter((w: any) => w.is_available).length;
    }
    if (orders) {
      stats.totalOrders = orders.length;
      stats.pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
      // monthly revenue sum for current month
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      stats.monthlyRevenue = orders
        .filter((o: any) => {
          const d = new Date(o.created_at);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((s: number, o: any) => s + (Number(o.total_amount) || 0), 0);
    }

    // fallback user counts if needed
    if (usersList?.data?.users) {
      // not used here but could be
    }
  } catch (e) {
    // if any table missing, we keep defaults
    console.warn('Failed to fetch some admin stats:', e);
  }

  const systemHealth = [
    { name: 'API сервер', status: 'healthy', uptime: 99.9 },
    { name: 'Өгөгдлийн сан', status: 'healthy', uptime: 99.8 },
    { name: 'Кэш сервер', status: 'healthy', uptime: 99.7 },
    { name: 'Файл хадгалалт', status: 'healthy', uptime: 99.9 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Админ хяналтын самбар</h2>
          <p className="text-muted-foreground">Системийн ерөнхий тойм</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Нийт дэлгүүр"
            value={stats.totalStores}
            subtitle={`${stats.activeStores} идэвхтэй`}
            icon={<Store className="w-5 h-5 text-muted-foreground" />}
          />
          <StatsCard
            title="Нийт ажилчид"
            value={stats.totalWorkers}
            subtitle={`${stats.availableWorkers} боломжтой`}
            icon={<Users className="w-5 h-5 text-muted-foreground" />}
          />
          <StatsCard
            title="Нийт захиалга"
            value={stats.totalOrders}
            subtitle={`${stats.pendingOrders} хүлээгдэж байна`}
            icon={<ShoppingCart className="w-5 h-5 text-muted-foreground" />}
          />
          <StatsCard
            title="Сарын орлого"
            value={formatCurrency(stats.monthlyRevenue)}
            icon={<DollarSign className="w-5 h-5 text-green-500" />}
            trend={{ value: 15.2, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Activity className="w-5 h-5" />
                Системийн төлөв
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemHealth.map((service) => (
                  <div key={service.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-foreground">{service.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {service.uptime}% uptime
                      </span>
                    </div>
                    <Progress value={service.uptime} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5" />
                Аюулгүй байдал
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">SSL сертификат</span>
                    <span className="text-xs text-green-500 font-medium">Хүчинтэй</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Дуусах хугацаа: 2025-12-31</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Firewall</span>
                    <span className="text-xs text-green-500 font-medium">Идэвхтэй</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Сүүлийн 24 цагт 0 халдлага хаагдсан
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Backup</span>
                    <span className="text-xs text-green-500 font-medium">Шинэчлэгдсэн</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Сүүлийн backup: 2 цагийн өмнө</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Database className="w-5 h-5" />
                Өгөгдлийн сан
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Ашиглалт</span>
                    <span className="text-sm font-medium text-foreground">45.2 GB / 100 GB</span>
                  </div>
                  <Progress value={45.2} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-2xl font-bold text-foreground">12.5K</p>
                    <p className="text-xs text-muted-foreground">Хэрэглэгчид</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">45.8K</p>
                    <p className="text-xs text-muted-foreground">Захиалгууд</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Server className="w-5 h-5" />
                API хүсэлтүүд
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-foreground">2.4M</p>
                  <p className="text-sm text-muted-foreground">Энэ сарын хүсэлтүүд</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-lg font-semibold text-foreground">45ms</p>
                    <p className="text-xs text-muted-foreground">Дундаж хариу</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-500">99.9%</p>
                    <p className="text-xs text-muted-foreground">Амжилттай</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Хурдан үйлдлүүд</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full p-3 text-left rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-medium text-foreground">Кэш цэвэрлэх</p>
                  <p className="text-xs text-muted-foreground">Системийн кэш устгах</p>
                </button>
                <button className="w-full p-3 text-left rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-medium text-foreground">Backup үүсгэх</p>
                  <p className="text-xs text-muted-foreground">Шинэ backup үүсгэх</p>
                </button>
                <button className="w-full p-3 text-left rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-medium text-foreground">Логууд харах</p>
                  <p className="text-xs text-muted-foreground">Системийн логууд</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
