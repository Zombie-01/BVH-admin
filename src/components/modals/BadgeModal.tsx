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
import { type BadgeType } from '@/data/mockData';


interface BadgeModalProps {
  badge: BadgeType | null;
  mode: 'view' | 'edit' | 'create';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (badge: Partial<BadgeType>) => void;
}

const colorOptions = [
  { value: '#22c55e', label: 'Ногоон' },
  { value: '#3b82f6', label: 'Цэнхэр' },
  { value: '#eab308', label: 'Шар' },
  { value: '#ef4444', label: 'Улаан' },
  { value: '#a855f7', label: 'Ягаан' },
  { value: '#f97316', label: 'Улбар шар' },
];

export function BadgeModal({ badge, mode, open, onOpenChange, onSave }: BadgeModalProps) {
  const [formData, setFormData] = useState<Partial<BadgeType>>({
    name: '',
    description: '',
    color: '#22c55e',
  });

  useEffect(() => {
    if (badge) {
      setFormData(badge);
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#22c55e',
      });
    }
  }, [badge, open]);

  const handleSave = () => {
    onSave?.(formData);
    onOpenChange(false);
  };

  const isViewMode = mode === 'view';
  const title =
    mode === 'create' ? 'Шинэ тэмдэг' : mode === 'edit' ? 'Тэмдэг засах' : 'Тэмдгийн мэдээлэл';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Нэр</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isViewMode}
              placeholder="Тэмдгийн нэр"
            />
          </div>

          <div className="space-y-2">
            <Label>Өнгө</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => !isViewMode && setFormData({ ...formData, color: color.value })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color.value
                      ? 'border-foreground scale-110'
                      : 'border-transparent'
                  } ${isViewMode ? 'cursor-default' : 'cursor-pointer hover:scale-105'}`}
                  style={{ backgroundColor: color.value }}
                  disabled={isViewMode}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Тайлбар</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isViewMode}
              placeholder="Тэмдгийн тайлбар"
              rows={3}
            />
          </div>

          {isViewMode && badge && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">
                Энэ тэмдэгтэй: <strong>{badge.worker_count}</strong> ажилтан
              </span>
            </div>
          )}
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
