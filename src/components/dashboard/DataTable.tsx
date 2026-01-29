import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onView,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  const getValue = (item: T, key: string): unknown => {
    const keys = key.split('.');
    let value: unknown = item;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value;
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((col) => (
              <TableHead key={String(col.key)} className="text-muted-foreground font-medium">
                {col.header}
              </TableHead>
            ))}
            {(onView || onEdit || onDelete) && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/30">
              {columns.map((col) => (
                <TableCell key={`${item.id}-${String(col.key)}`}>
                  {col.render ? col.render(item) : String(getValue(item, String(col.key)) ?? '-')}
                </TableCell>
              ))}
              {(onView || onEdit || onDelete) && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(item)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Харах
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Засах
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(item)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Устгах
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function StatusBadge({ status, type }: { status: string; type?: 'order' | 'availability' }) {
  const getVariant = () => {
    if (type === 'availability') {
      return status ? 'default' : 'secondary';
    }

    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
      case 'confirmed':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getLabel = () => {
    if (type === 'availability') {
      return status ? 'Идэвхтэй' : 'Идэвхгүй';
    }

    switch (status) {
      case 'completed':
        return 'Дууссан';
      case 'in_progress':
        return 'Явагдаж байна';
      case 'confirmed':
        return 'Баталгаажсан';
      case 'pending':
        return 'Хүлээгдэж байна';
      case 'cancelled':
        return 'Цуцалсан';
      default:
        return status;
    }
  };

  return <Badge variant={getVariant()}>{getLabel()}</Badge>;
}
