import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { type Chat } from "@/data/mockChatData";
import { cn } from "@/lib/utils";

interface ChatDetailModalProps {
  chat: Chat | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDetailModal({ chat, open, onOpenChange }: ChatDetailModalProps) {
  if (!chat) return null;

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('mn-MN', {
      style: 'currency',
      currency: 'MNT',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: Chat['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Дууссан</Badge>;
      case 'agreed':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Тохирсон</Badge>;
      case 'negotiating':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Хэлэлцэж буй</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Цуцлагдсан</Badge>;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-primary text-primary-foreground';
      case 'store':
        return 'bg-blue-600 text-white';
      case 'worker':
        return 'bg-green-600 text-white';
      case 'driver':
        return 'bg-orange-600 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Чатын дэлгэрэнгүй</DialogTitle>
            {getStatusBadge(chat.status)}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Chat Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Хэрэглэгч</p>
              <p className="font-medium">{chat.user_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {chat.store_name ? 'Дэлгүүр' : 'Ажилтан'}
              </p>
              <p className="font-medium">{chat.store_name || chat.worker_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Хүлээгдэж буй үнэ</p>
              <p className="font-medium">{formatCurrency(chat.expected_price)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Тохирсон үнэ</p>
              <p className="font-medium text-green-400">{formatCurrency(chat.agreed_price)}</p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {chat.messages.map((message) => {
                const isUserMessage = message.sender_role === 'user';
                
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex flex-col gap-1",
                      isUserMessage ? "items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        getRoleColor(message.sender_role)
                      )}>
                        {message.sender_name}
                      </span>
                      <span>
                        {new Date(message.created_at).toLocaleTimeString('mn-MN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    {message.message_type === 'price_offer' ? (
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm text-yellow-400 font-medium">💰 Үнийн санал</p>
                        <p className="text-lg font-bold text-yellow-300">
                          {formatCurrency(message.deal_amount)}
                        </p>
                      </div>
                    ) : message.message_type === 'deal_accepted' ? (
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm text-green-400 font-medium">✅ Тохиролцоо баталгаажсан</p>
                        <p className="text-lg font-bold text-green-300">
                          {formatCurrency(message.deal_amount)}
                        </p>
                      </div>
                    ) : (
                      <div className={cn(
                        "rounded-lg p-3 max-w-[80%]",
                        isUserMessage 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
