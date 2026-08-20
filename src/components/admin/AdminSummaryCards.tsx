import React from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChefHat,
  Bike,
  CheckCheck,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { AdminOrder, OrderStatus } from '../../types';

interface AdminSummaryCardsProps {
  orders: AdminOrder[];
  activeStatusFilter?: string;
  onSelectStatusFilter?: (status: string) => void;
}

export const AdminSummaryCards: React.FC<AdminSummaryCardsProps> = ({
  orders,
  activeStatusFilter = 'all',
  onSelectStatusFilter,
}) => {
  // Calculations
  const todayOrders = orders; // Sample / session orders representing today's active batch
  const totalCount = todayOrders.length;
  
  const pendingCount = todayOrders.filter((o) => o.status === 'New').length;
  const confirmedCount = todayOrders.filter((o) => o.status === 'Confirmed').length;
  const preparingCount = todayOrders.filter((o) => o.status === 'Preparing').length;
  const outForDeliveryCount = todayOrders.filter((o) => o.status === 'Out for Delivery').length;
  const completedCount = todayOrders.filter((o) => o.status === 'Delivered').length;
  const cancelledCount = todayOrders.filter((o) => o.status === 'Cancelled').length;

  // Calculate Today's Revenue (sum of all orders except Cancelled)
  const todayRevenue = todayOrders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const cardConfig = [
    {
      id: 'today-orders',
      statusKey: 'all',
      title: "Today's Orders",
      value: totalCount,
      subtext: `${completedCount} delivered • ${cancelledCount} cancelled`,
      icon: ShoppingBag,
      iconBg: 'bg-emerald-100 text-emerald-800',
      borderColor: 'border-emerald-900/10',
      activeRing: 'ring-2 ring-emerald-600 bg-emerald-50/50',
    },
    {
      id: 'pending-orders',
      statusKey: 'New',
      title: 'Pending Orders',
      value: pendingCount,
      subtext: pendingCount > 0 ? 'Requires kitchen confirmation' : 'All orders reviewed',
      icon: Clock,
      iconBg: 'bg-amber-100 text-amber-900',
      borderColor: pendingCount > 0 ? 'border-amber-300' : 'border-stone-200/80',
      badge: pendingCount > 0 ? 'Action Needed' : undefined,
      badgeColor: 'bg-amber-500 text-white animate-pulse',
      activeRing: 'ring-2 ring-amber-500 bg-amber-50/40',
    },
    {
      id: 'confirmed-orders',
      statusKey: 'Confirmed',
      title: 'Confirmed Orders',
      value: confirmedCount,
      subtext: 'Verified & scheduled',
      icon: CheckCircle2,
      iconBg: 'bg-blue-100 text-blue-800',
      borderColor: 'border-blue-200/80',
      activeRing: 'ring-2 ring-blue-500 bg-blue-50/40',
    },
    {
      id: 'preparing-orders',
      statusKey: 'Preparing',
      title: 'Preparing Orders',
      value: preparingCount,
      subtext: 'Cutting & packing in kitchen',
      icon: ChefHat,
      iconBg: 'bg-purple-100 text-purple-800',
      borderColor: 'border-purple-200/80',
      activeRing: 'ring-2 ring-purple-500 bg-purple-50/40',
    },
    {
      id: 'out-for-delivery',
      statusKey: 'Out for Delivery',
      title: 'Out for Delivery',
      value: outForDeliveryCount,
      subtext: 'Riders on Thanjavur roads',
      icon: Bike,
      iconBg: 'bg-indigo-100 text-indigo-800',
      borderColor: 'border-indigo-200/80',
      activeRing: 'ring-2 ring-indigo-500 bg-indigo-50/40',
    },
    {
      id: 'completed-orders',
      statusKey: 'Delivered',
      title: 'Completed Orders',
      value: completedCount,
      subtext: 'Successfully handed over',
      icon: CheckCheck,
      iconBg: 'bg-emerald-100 text-emerald-900',
      borderColor: 'border-emerald-300/80',
      activeRing: 'ring-2 ring-emerald-600 bg-emerald-50/50',
    },
    {
      id: 'today-revenue',
      statusKey: 'revenue',
      title: "Today's Revenue",
      value: `₹${todayRevenue.toLocaleString('en-IN')}`,
      isCurrency: true,
      subtext: 'Active & delivered sales',
      icon: IndianRupee,
      iconBg: 'bg-[#0F2A1D] text-[#7BF587]',
      borderColor: 'border-emerald-900/20 bg-linear-to-br from-emerald-900/5 to-emerald-900/15',
      activeRing: 'ring-2 ring-emerald-800',
    },
  ];

  return (
    <div className="space-y-3" id="admin-summary-cards-section">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-bold text-[#0F2A1D] flex items-center gap-2">
          <span>Operational Overview</span>
          <span className="text-[11px] font-sans font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            Live Thanjavur Hub
          </span>
        </h3>
        <span className="text-xs text-stone-500 font-medium hidden sm:inline">
          Click any card to filter orders
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {cardConfig.map((card) => {
          const Icon = card.icon;
          const isSelected =
            card.statusKey !== 'revenue' &&
            activeStatusFilter === card.statusKey;

          return (
            <button
              key={card.id}
              type="button"
              id={`card-summary-${card.id}`}
              onClick={() => {
                if (onSelectStatusFilter && card.statusKey !== 'revenue') {
                  onSelectStatusFilter(card.statusKey);
                }
              }}
              className={`text-left p-3.5 sm:p-4 rounded-2xl bg-white border ${
                card.borderColor
              } ${
                isSelected ? card.activeRing : 'hover:border-emerald-600/40 hover:shadow-xs'
              } transition-all cursor-pointer shadow-2xs relative flex flex-col justify-between`}
            >
              {card.badge && (
                <span
                  className={`absolute -top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider line-clamp-1">
                  {card.title}
                </span>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#0F2A1D] tracking-tight">
                  {card.value}
                </div>
                <div className="text-[10px] text-stone-500 font-medium truncate mt-0.5">
                  {card.subtext}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
