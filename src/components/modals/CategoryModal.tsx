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
import { type Category } from '@/data/mockData';

interface CategoryModalProps {
  category: Category | null;
  mode: 'view' | 'edit' | 'create';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (category: Partial<Category>) => void;
}
const emojiOptions = ['😄', '🔥', '⭐', '🏆', '👑', '💎', '⚡', '❤️', '🛡️'];

export function CategoryModal({ category, mode, open, onOpenChange, onSave }: CategoryModalProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    icon: '😄',
  });

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        name: '',
        description: '',
        icon: '',
      });
    }
  }, [category, open]);

  const handleSave = () => {
    onSave?.(formData);
    onOpenChange(false);
  };

  const isViewMode = mode === 'view';
  const title =
    mode === 'create' ? 'Шинэ ангилал' : mode === 'edit' ? 'Ангилал засах' : 'Ангилалын мэдээлэл';

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
              placeholder="Ангилалын нэр"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Дүрс (emoji)</Label>

            <div className="flex gap-2 flex-wrap">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  disabled={isViewMode}
                  onClick={
                    () => !isViewMode && setFormData({ ...formData, icon: emoji }) // ✅ STRING
                  }
                  className={`
                  w-10 h-10 text-xl rounded-lg border flex items-center justify-center transition
          ${
            formData.icon === emoji
              ? 'border-primary bg-primary/10 scale-110'
              : 'border-muted hover:bg-muted'
          }
          ${isViewMode ? 'cursor-default' : 'cursor-pointer'}
          `}
                >
                  {emoji}
                </button>
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
              placeholder="Ангилалын тайлбар"
              rows={3}
            />
          </div>

          {isViewMode && category && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">
                Энэ ангилалд: <strong>{category.store_count}</strong> дэлгүүр
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
