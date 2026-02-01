'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import type { Chat } from '@/data/mockChatData';
import { MessageSquare, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatDetailModal } from '@/components/modals/ChatDetailModal';

export default function ChatLogs() {
  const [search, setSearch] = useState('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  // Normalize server chat -> UI-friendly shape (safe fallbacks)
  function normalizeChat(raw: any): Chat {
    return {
      id: String(raw.id),
      order_id: raw.order_id ?? null,
      user_id: raw.user_id ?? null,
      user_name:
        (raw.user_name ??
          raw.user_name_full ??
          raw.user?.name ??
          String(raw.user_id ?? '').slice(0, 8)) ||
        'Хэрэглэгч',
      store_id: raw.store_id ?? null,
      store_name: raw.store_name ?? raw.store?.name ?? null,
      worker_id: raw.worker_id ?? null,
      worker_name: raw.worker_name ?? raw.worker?.name ?? null,
      type: (raw.type === 'store' ? ('delivery' as const) : (raw.type as any)) ?? 'delivery',
      status: (raw.status as any) ?? 'negotiating',
      expected_price: raw.expected_price ?? null,
      agreed_price: raw.agreed_price ?? null,
      service_description: raw.service_description ?? null,
      last_message: raw.last_message ?? '',
      unread_count: Number(raw.unread_count ?? 0),
      created_at: raw.created_at ?? raw.updated_at ?? new Date().toISOString(),
      messages: Array.isArray(raw.messages) ? raw.messages : [],
    } as Chat;
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/chats?limit=200');
        const json = await res.json();
        if (!mounted) return;
        const normalized = (json?.chats ?? []).map(normalizeChat);
        setChats(normalized);
      } catch (err) {
        console.error('Failed to load chats', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredChats = chats.filter((chat) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      chat.id.toLowerCase().includes(q) ||
      String(chat.user_id ?? '')
        .toLowerCase()
        .includes(q) ||
      String(chat.store_id ?? '')
        .toLowerCase()
        .includes(q) ||
      chat.user_name.toLowerCase().includes(q) ||
      (chat.store_name ?? '').toLowerCase().includes(q) ||
      (chat.worker_name ?? '').toLowerCase().includes(q) ||
      (chat.last_message ?? '').toLowerCase().includes(q)
    );
  });

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('mn-MN', {
      style: 'currency',
      currency: 'MNT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: Chat['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Дууссан</Badge>
        );
      case 'agreed':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Тохирсон</Badge>;
      case 'negotiating':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Хэлэлцэж буй
          </Badge>
        );
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Цуцлагдсан</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: Chat['type']) => {
    switch (type) {
      case 'delivery':
        return (
          <Badge variant="outline" className="text-xs">
            Хүргэлт
          </Badge>
        );
      case 'service':
        return (
          <Badge variant="outline" className="text-xs">
            Үйлчилгээ
          </Badge>
        );
      case 'negotiation':
        return (
          <Badge variant="outline" className="text-xs">
            Хэлэлцээр
          </Badge>
        );
      // API may return `store` — treat as store/merchant chat
      case 'store' as any:
        return (
          <Badge variant="outline" className="text-xs">
            Дэлгүүр
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleViewChat = async (chat: Chat) => {
    // optimistic: open modal immediately with minimal data, then load messages
    setSelectedChat({ ...chat, messages: chat.messages ?? [] });
    setIsModalOpen(true);

    try {
      const res = await fetch(`/api/v1/chats/${chat.id}/messages?limit=200`);
      if (!res.ok) return;
      const json = await res.json();
      const messages = (json?.messages ?? []).map((m: any) => ({
        id: String(m.id ?? `${chat.id}-m-${Math.random().toString(36).slice(2, 8)}`),
        sender_id: m.sender_id ?? null,
        sender_name:
          (m.sender_name ?? m.sender?.name ?? String(m.sender_id ?? '').slice(0, 8)) || 'Нэргүй',
        sender_role: (m.sender_role as any) ?? 'user',
        content: typeof m.content === 'string' ? m.content : String(m.content ?? ''),
        message_type: (m.message_type as any) ?? 'text',
        deal_amount: m.deal_amount ?? null,
        created_at: m.created_at ?? m.created_at ?? new Date().toISOString(),
        read: !!m.read,
      }));

      setSelectedChat((prev) => (prev ? { ...prev, messages } : { ...chat, messages }));
    } catch (err) {
      console.error('Failed to load chat messages', err);
    }
  };

  const stats = {
    total: chats.length,
    completed: chats.filter((c) => c.status === 'completed').length,
    negotiating: chats.filter((c) => c.status === 'negotiating').length,
    cancelled: chats.filter((c) => c.status === 'cancelled').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Чат түүх</h2>
            <p className="text-muted-foreground">Бүх харилцан яриаг харах</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Нийт чат"
            value={stats.total}
            icon={<MessageSquare className="w-5 h-5 text-muted-foreground" />}
          />
          <StatsCard
            title="Дууссан"
            value={stats.completed}
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          />
          <StatsCard
            title="Хэлэлцэж буй"
            value={stats.negotiating}
            icon={<Clock className="w-5 h-5 text-yellow-500" />}
          />
          <StatsCard
            title="Цуцлагдсан"
            value={stats.cancelled}
            icon={<XCircle className="w-5 h-5 text-red-500" />}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Чат хайх..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <ScrollArea className="h-[500px]">
            <div className="divide-y divide-border">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleViewChat(chat)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{chat.user_name}</span>
                        {chat.unread_count > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5">
                            {chat.unread_count}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        {chat.store_name && <span>{chat.store_name}</span>}
                        {chat.worker_name && <span>{chat.worker_name}</span>}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{chat.last_message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {getTypeBadge(chat.type)}
                        {getStatusBadge(chat.status)}
                      </div>
                      {chat.agreed_price && (
                        <span className="text-sm font-medium text-green-400">
                          {formatCurrency(chat.agreed_price)}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(chat.created_at).toLocaleDateString('mn-MN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <ChatDetailModal chat={selectedChat} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </DashboardLayout>
  );
}
