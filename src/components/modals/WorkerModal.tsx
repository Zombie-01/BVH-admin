'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { type ServiceWorker } from '@/data/mockData';
import { Star, Briefcase } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface BadgeOption {
  id: string;
  name: string;
  color?: string;
}

interface SpecialtyOption {
  value: string;
  label: string;
}

interface WorkerModalProps {
  worker: ServiceWorker | null;
  mode: 'view' | 'edit' | 'create';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (worker: Partial<ServiceWorker>) => void;
  badges?: BadgeOption[];
  specialties?: SpecialtyOption[];
}

export function WorkerModal({
  worker,
  mode,
  open,
  onOpenChange,
  onSave,
  badges: propsBadges,
  specialties: propsSpecialties,
}: WorkerModalProps) {
  const [formData, setFormData] = useState<
    Partial<ServiceWorker> & { profile_phone?: string; profile_email?: string }
  >({
    profile_name: '',
    profile_phone: '',
    profile_email: '',
    specialty: '',
    description: '',
    hourly_rate: null,
    badges: [],
    is_available: true,
  });

  const badgeOptions = (propsBadges || []).map((badge) => ({
    value: badge.id,
    label: badge.name,
  }));

  useEffect(() => {
    if (worker) {
      setFormData({
        ...worker,
        profile_phone:
          (worker as any).profile_phone ||
          (worker as any).phone ||
          (worker as any).profile?.phone ||
          (worker as any).profiles?.phone ||
          '',
        profile_email:
          (worker as any).profile_email ||
          (worker as any).email ||
          (worker as any).profile?.email ||
          (worker as any).profiles?.email ||
          '',
      } as any);
    } else {
      setFormData({
        profile_name: '',
        profile_phone: '',
        profile_email: '',
        specialty: '',
        description: '',
        hourly_rate: null,
        badges: [],
        is_available: true,
      });
    }
  }, [worker, open]);

  const handleSave = () => {
    // If profile fields provided, pass them in a `profile` object
    const payload: any = { ...formData };
    if ((formData as any).profile_phone || (formData as any).profile_email) {
      payload.profile = {
        name: formData.profile_name || undefined,
        phone: (formData as any).profile_phone || undefined,
        email: (formData as any).profile_email || undefined,
      };
    }
    onSave?.(payload);
    onOpenChange(false);
  };

  const getBadgeInfo = (badgeId: string) => {
    return (propsBadges || []).find((b) => b.id === badgeId);
  };

  const isViewMode = mode === 'view';
  const title =
    mode === 'create' ? 'Шинэ ажилтан' : mode === 'edit' ? 'Ажилтан засах' : 'Ажилтны мэдээлэл';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isViewMode && worker && (
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{worker.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <span>{worker.completed_jobs} ажил</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile_name">Нэр</Label>
              <Input
                id="profile_name"
                value={formData.profile_name || ''}
                onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
                disabled={isViewMode}
                placeholder="Ажилтны нэр"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_email">И-мэйл</Label>
              <Input
                id="profile_email"
                type="email"
                value={(formData as any).profile_email || ''}
                onChange={(e) => setFormData({ ...formData, profile_email: e.target.value })}
                disabled={isViewMode}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile_phone">Утас</Label>
              <Input
                id="profile_phone"
                value={(formData as any).profile_phone || ''}
                onChange={(e) => setFormData({ ...formData, profile_phone: e.target.value })}
                disabled={isViewMode}
                placeholder="+976 99xxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Мэргэжил</Label>
              {isViewMode ? (
                <Input id="specialty" value={formData.specialty || ''} disabled />
              ) : (
                <Select
                  value={formData.specialty || ''}
                  onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Мэргэжил сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {(propsSpecialties || []).map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Тайлбар</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isViewMode}
              placeholder="Ажилтны тайлбар"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Цагийн хөлс (₮)</Label>
              <Input
                id="hourly_rate"
                type="number"
                value={formData.hourly_rate || ''}
                onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) })}
                disabled={isViewMode}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Тэмдэглэгээ</Label>
              {isViewMode ? (
                <div className="flex gap-2 flex-wrap">
                  {(formData.badges || []).map((badgeId) => {
                    const badgeInfo = getBadgeInfo(badgeId);
                    return (
                      <Badge
                        key={badgeId}
                        variant="outline"
                        style={{ borderColor: badgeInfo?.color, color: badgeInfo?.color }}
                      >
                        {badgeInfo?.name || badgeId}
                      </Badge>
                    );
                  })}
                  {(!formData.badges || formData.badges.length === 0) && (
                    <span className="text-sm text-muted-foreground">Тэмдэг байхгүй</span>
                  )}
                </div>
              ) : (
                <MultiSelect
                  options={badgeOptions}
                  selected={formData.badges || []}
                  onChange={(badges) => setFormData({ ...formData, badges })}
                  placeholder="Тэмдэг сонгох..."
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <Label htmlFor="is_available" className="cursor-pointer">
              Боломжтой эсэх
            </Label>
            <Switch
              id="is_available"
              checked={formData.is_available || false}
              onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
              disabled={isViewMode}
            />
          </div>
        </div>

        <DialogFooter>
          {isViewMode ? (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Хаах
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Цуцлах
              </Button>
              <Button onClick={handleSave}>Хадгалах</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
