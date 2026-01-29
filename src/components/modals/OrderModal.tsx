import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Order } from "@/data/mockData";
import { Package, User, Store, Wrench, MapPin, Calendar } from "lucide-react";

interface OrderModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderModal({ order, open, onOpenChange }: OrderModalProps) {
  if (!order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('mn-MN', {
      style: 'currency',
      currency: 'MNT',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Дууссан</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Явагдаж буй</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Хүлээгдэж буй</Badge>;
      case 'confirmed':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Баталгаажсан</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Цуцлагдсан</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: Order['type']) => {
    switch (type) {
      case 'delivery':
        return <Badge variant="outline"><Package className="w-3 h-3 mr-1" />Хүргэлт</Badge>;
      case 'service':
        return <Badge variant="outline"><Wrench className="w-3 h-3 mr-1" />Үйлчилгээ</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Захиалгын дэлгэрэнгүй</DialogTitle>
            <div className="flex items-center gap-2">
              {getTypeBadge(order.type)}
              {getStatusBadge(order.status)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Order ID and Date */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Захиалгын ID:</span>
              <span className="font-mono text-sm">{order.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {new Date(order.created_at).toLocaleDateString('mn-MN')}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Захиалагч
            </h4>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">{order.user_name}</p>
            </div>
          </div>

          {/* Store or Worker Info */}
          {order.store_name && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Store className="w-4 h-4" />
                Дэлгүүр
              </h4>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">{order.store_name}</p>
              </div>
            </div>
          )}

          {order.worker_name && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Ажилтан
              </h4>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">{order.worker_name}</p>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {order.delivery_address && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Хүргэлтийн хаяг
              </h4>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p>{order.delivery_address}</p>
              </div>
            </div>
          )}

          {/* Total Amount */}
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
            <span className="font-medium">Нийт дүн</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Хаах
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
