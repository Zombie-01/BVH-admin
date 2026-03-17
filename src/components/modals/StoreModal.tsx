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
import { Star, MapPin as MapPinIcon } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import dynamic from 'next/dynamic';

// Dynamic import for map component (client-only)
const StoreLocationMap = dynamic(
  () =>
    import('@/components/operation/StoreLocationMap').then((mod) => ({
      default: mod.StoreLocationMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">Газрын зураг ачаалж байна...</p>
      </div>
    ),
  }
);

// Local Store type (keep in sync with API)
interface Store {
  id: string;
  name: string;
  categories: string[];
  description?: string | null;
  location?: string | null;
  phone?: string | null;
  is_open?: boolean;
  rating?: number;
  review_count?: number;
  lat?: number;
  lng?: number;
}

interface StoreModalProps {
  store: Store | null;
  mode: 'view' | 'edit' | 'create';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (
    store: Partial<
      Partial<Store> & {
        owner_email?: string;
        owner_password?: string;
        owner_name?: string;
        owner_phone?: string;
      }
    >
  ) => void;
  categories?: Array<{ id: string; name: string; icon?: string }>; // pass categories to render options
}

export function StoreModal({
  store,
  mode,
  open,
  onOpenChange,
  onSave,
  categories,
}: StoreModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<
    Partial<Store> & {
      owner_email?: string;
      owner_password?: string;
      owner_name?: string;
      owner_phone?: string;
    }
  >({
    name: '',
    description: '',
    categories: [],
    location: '',
    phone: '',
    is_open: true,
    owner_email: '',
    owner_password: '',
    owner_name: '',
    owner_phone: '',
    lat: 47.9184,
    lng: 106.9177,
  });

  const categoryOptions = (categories || []).map((cat) => ({
    value: cat.id,
    label: `${cat.icon || ''} ${cat.name}`.trim(),
  }));

  useEffect(() => {
    if (store) {
      setFormData(store);
    } else {
      setFormData({
        name: '',
        description: '',
        categories: [],
        location: '',
        phone: '',
        is_open: true,
        owner_email: '',
        owner_password: '',
        owner_name: '',
        owner_phone: '',
        lat: 47.9184,
        lng: 106.9177,
      });
    }
    setStep(1);
  }, [store, open]);

  const handleSave = () => {
    onSave?.(formData);
    onOpenChange(false);
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData({
      ...formData,
      lat,
      lng,
      location: address,
    });
    setStep(1);
  };

  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds
      .map((id) => {
        const cat = (categories || []).find((c) => c.id === id);
        return cat ? `${cat.icon || ''} ${cat.name}`.trim() : id;
      })
      .join(', ');
  };

  const isViewMode = mode === 'view';
  const title =
    mode === 'create' ? 'Шинэ дэлгүүр' : mode === 'edit' ? 'Дэлгүүр засах' : 'Дэлгүүрийн мэдээлэл';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-2">
          <DialogTitle>
            {title}
            {!isViewMode && step === 2 && ' - байршил сонгох'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          // Step 1: Store Information
          <div className="space-y-4 py-2">
            {isViewMode && store && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{store.rating}</span>
                <span className="text-muted-foreground">({store.review_count} үнэлгээ)</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Нэр</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isViewMode}
                placeholder="Дэлгүүрийн нэр"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Тайлбар</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isViewMode}
                placeholder="Дэлгүүрийн тайлбар"
                rows={3}
              />
            </div>
            {mode !== 'view' && (
              <div className="space-y-2 pt-4 border-t border-muted/50">
                <h3 className="font-semibold text-lg">Дэлгүүрийн эзний мэдээлэл</h3>

                <div className="space-y-2">
                  <Label htmlFor="owner_name">Нэр</Label>
                  <Input
                    id="owner_name"
                    value={formData.owner_name || ''}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    placeholder="Езний нэр"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_email">Email</Label>
                  <Input
                    id="owner_email"
                    type="email"
                    value={formData.owner_email || ''}
                    onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                    placeholder="Езний email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_phone">Утас</Label>
                  <Input
                    id="owner_phone"
                    value={formData.owner_phone || ''}
                    onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                    placeholder="Езний утас"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_password">Нууц үг</Label>
                  <Input
                    id="owner_password"
                    type="password"
                    value={formData.owner_password || ''}
                    onChange={(e) => setFormData({ ...formData, owner_password: e.target.value })}
                    placeholder="Езний нууц үг"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Ангилал</Label>
              {isViewMode ? (
                <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                  {getCategoryNames(formData.categories || []) || '-'}
                </p>
              ) : (
                <MultiSelect
                  options={categoryOptions}
                  selected={formData.categories || []}
                  onChange={(categories) => setFormData({ ...formData, categories })}
                  placeholder="Ангилал сонгох..."
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Утас</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isViewMode}
                  placeholder="+976 ..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  Байршил
                </Label>
                {isViewMode ? (
                  <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                    {formData.location || '-'}
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="w-full"
                  >
                    Газрын зураг дээр сонгох
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label htmlFor="is_open" className="cursor-pointer">
                Нээлттэй эсэх
              </Label>
              <Switch
                id="is_open"
                checked={formData.is_open || false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_open: checked })}
                disabled={isViewMode}
              />
            </div>
          </div>
        ) : (
          // Step 2: Location Map
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Дэлгүүрийн байршилыг газрын зураг дээр сонгоно уу
            </p>
            <StoreLocationMap
              onLocationSelect={handleLocationSelect}
              initialLat={formData.lat}
              initialLng={formData.lng}
            />
            {formData.location && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-foreground">Сонгосон байршил:</p>
                <p className="text-sm text-muted-foreground mt-1">{formData.location}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="sticky bottom-0 bg-background z-10 border-t pt-4 mt-4">
          {step === 2 ? (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Өмнөх
              </Button>
              <Button onClick={() => setStep(1)}>Сонгосон байршил ашиглах</Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
