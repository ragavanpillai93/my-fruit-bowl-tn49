import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Phone,
  MapPin,
  ExternalLink,
  ChevronDown,
  ShoppingBag,
  CreditCard,
  Eye,
  CheckCircle2,
  Clock,
  Bike,
  ChefHat,
  RotateCcw,
  MessageCircle,
  Sparkles,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { AdminOrder, OrderPaymentStatus, OrderStatus } from '../../types';
import { getGoogleMapsUrl } from '../../utils/order';
import { generateCustomerStatusWhatsAppUrl } from '../../utils/adminStorage';

interface AdminOrdersListProps {
  orders: AdminOrder[];
  onSelectOrder: (order: AdminOrder) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdatePaymentStatus: (orderId: string, paymentStatus: OrderPaymentStatus) => void;
  activeStatusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export const AdminOrdersList: React.FC<AdminOrdersListProps> = ({
  orders,
  onSelectOrder,
  onUpdateStatus,
  onUpdatePaymentStatus,
  activeStatusFilter,
  onStatusFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week'>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'amount-high' | 'amount-low'>('newest');

  // Filter and Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = order.orderId.toLowerCase().includes(query);
        const matchesName = order.customerName.toLowerCase().includes(query);
        const matchesPhone = order.customerPhone.toLowerCase().includes(query);
        const matchesAddress = (order.deliveryAddress || '').toLowerCase().includes(query);
        const matchesItem = order.items.some((it) =>
          it.food.name.toLowerCase().includes(query)
        );
        if (!matchesId && !matchesName && !matchesPhone && !matchesAddress && !matchesItem) {
          return false;
        }
      }

      // 2. Status Filter
      if (activeStatusFilter !== 'all') {
        if (order.status !== activeStatusFilter) {
          return false;
        }
      }

      // 3. Payment Method Filter
      if (paymentFilter !== 'all') {
        if (order.paymentDetails.method !== paymentFilter) {
          return false;
        }
      }

      // 4. Payment Status Filter
      if (paymentStatusFilter !== 'all') {
        if (order.paymentStatus !== paymentStatusFilter) {
          return false;
        }
      }

      // 5. Date Filter
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        if (dateFilter === 'today') {
          // Check if same calendar day
          const isSameDay =
            orderDate.getDate() === now.getDate() &&
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear();
          if (!isSameDay && order.deliveryDate !== 'Today') return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'amount-high') return b.totalAmount - a.totalAmount;
      if (sortBy === 'amount-low') return a.totalAmount - b.totalAmount;
      // newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders, searchQuery, activeStatusFilter, paymentFilter, paymentStatusFilter, dateFilter, sortBy]);

  const allStatuses: OrderStatus[] = [
    'New',
    'Confirmed',
    'Preparing',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Preparing':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Out for Delivery':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-900 border-rose-300';
    }
  };

  const exportOrdersCSV = () => {
    const headers = [
      'Order ID',
      'Date Time',
      'Customer Name',
      'Customer Phone',
      'Delivery Address',
      'Items',
      'Total Amount (INR)',
      'Payment Mode',
      'Payment Status',
      'Order Status',
    ];

    const rows = filteredOrders.map((o) => [
      o.orderId,
      new Date(o.createdAt).toLocaleString('en-IN'),
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.deliveryAddress || o.deliveryLocation.address}"`,
      `"${o.items.map((i) => `${i.food.name} (x${i.quantity})`).join(', ')}"`,
      o.totalAmount,
      o.paymentDetails.methodLabel,
      o.paymentStatus,
      o.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MFB_TN49_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4" id="admin-orders-management-page">
      
      {/* Search and Filters Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3.5">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-orders-search"
              placeholder="Search by Order ID (#TN49-...), customer name, phone, item name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Export & Sort Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-[#FAF9F5] px-3 py-2 rounded-xl border border-stone-200 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
              </select>
            </div>

            <button
              type="button"
              id="btn-export-csv"
              onClick={exportOrdersCSV}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold border border-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export filtered orders to CSV"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Dropdowns & Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
          
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
            <button
              type="button"
              id="filter-status-all"
              onClick={() => onStatusFilterChange('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer border ${
                activeStatusFilter === 'all'
                  ? 'bg-[#0F2A1D] text-white border-[#0F2A1D]'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              All Statuses ({orders.length})
            </button>

            {allStatuses.map((st) => {
              const count = orders.filter((o) => o.status === st).length;
              return (
                <button
                  key={st}
                  type="button"
                  id={`filter-status-${st.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onStatusFilterChange(st)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                    activeStatusFilter === st
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span>{st}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeStatusFilter === st ? 'bg-emerald-950 text-emerald-200' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Date & Payment Dropdowns */}
          <div className="flex items-center gap-2 text-xs">
            {/* Payment Method Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-2.5 py-1 bg-[#FAF9F5] rounded-lg border border-stone-200 text-stone-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Payment Mode: All</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="upi">UPI</option>
              <option value="pay-after-confirmation">Pay After Confirmation</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-2.5 py-1 bg-[#FAF9F5] rounded-lg border border-stone-200 text-stone-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Pay Status: All</option>
              <option value="Paid">Paid</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

        </div>

      </div>

      {/* Orders Count and Active Filter Indicator */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          Showing <strong className="text-stone-800">{filteredOrders.length}</strong> of {orders.length} orders
        </span>
        {(searchQuery || activeStatusFilter !== 'all' || paymentFilter !== 'all' || paymentStatusFilter !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              onStatusFilterChange('all');
              setPaymentFilter('all');
              setPaymentStatusFilter('all');
            }}
            className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Orders List: Desktop Table & Mobile Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-lg font-bold text-stone-800">No orders match your filter</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search keyword or clearing the status and payment filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
          
          {/* DESKTOP TABLE VIEW (md and above) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-[#FAF9F5] border-b border-stone-200/80 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Delivery Location</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => {
                  const mapsUrl =
                    order.deliveryLocation.mapsUrl ||
                    getGoogleMapsUrl(order.deliveryLocation.latitude, order.deliveryLocation.longitude);

                  return (
                    <tr
                      key={order.orderId}
                      className="hover:bg-stone-50/70 transition-colors group cursor-pointer"
                      onClick={() => onSelectOrder(order)}
                    >
                      {/* 1. Order ID & Time */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-bold text-stone-900 text-xs">
                          {order.orderId}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.deliveryDate}
                        </div>
                        <div className="text-[10px] font-semibold text-emerald-800 mt-0.5">
                          Slot: {order.deliveryTime}
                        </div>
                      </td>

                      {/* 2. Customer */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-stone-900 truncate max-w-[140px]">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] font-mono text-stone-600 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{order.customerPhone}</span>
                        </div>
                      </td>

                      {/* 3. Items */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="max-w-[200px]">
                          <span className="font-bold text-stone-800 block truncate">
                            {order.items.map((i) => `${i.food.name} (×${i.quantity})`).join(', ')}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {order.items.reduce((s, i) => s + i.quantity, 0)} total items
                          </span>
                        </div>
                      </td>

                      {/* 4. Delivery Location */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="max-w-[190px]">
                          <span className="text-stone-800 line-clamp-1 font-medium">
                            {order.deliveryAddress || order.deliveryLocation.address}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 truncate">
                              {order.deliveryLocation.areaCity || 'Thanjavur'}
                            </span>
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 shrink-0"
                              title="Open in Google Maps"
                            >
                              <MapPin className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* 5. Payment */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-bold text-stone-900 block text-[11px]">
                          {order.paymentDetails.method === 'cod'
                            ? 'Cash on Delivery'
                            : order.paymentDetails.method === 'upi'
                            ? 'UPI'
                            : 'Pay Later'}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-block mt-0.5 ${
                            order.paymentStatus === 'Verified' || order.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-900'
                              : order.paymentStatus === 'Pending'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                        {order.paymentDetails.utrTransactionId && (
                          <span className="font-mono text-[9px] text-stone-500 block truncate max-w-[90px]">
                            Ref: {order.paymentDetails.utrTransactionId}
                          </span>
                        )}
                      </td>

                      {/* 6. Total Amount */}
                      <td className="py-3.5 px-4 align-top font-bold text-stone-900 text-sm font-serif">
                        ₹{order.totalAmount}
                      </td>

                      {/* 7. Status Selector Dropdown */}
                      <td className="py-3.5 px-4 align-top" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateStatus(order.orderId, e.target.value as OrderStatus)}
                          className={`text-xs font-bold py-1 px-2.5 rounded-xl border focus:outline-none cursor-pointer ${getStatusBadgeStyle(
                            order.status
                          )}`}
                        >
                          {allStatuses.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* 8. Actions */}
                      <td className="py-3.5 px-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectOrder(order)}
                            className="p-1.5 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                            title="View Full Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={generateCustomerStatusWhatsAppUrl(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                            title="Send WhatsApp Update"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW (md and below) */}
          <div className="md:hidden divide-y divide-stone-100">
            {filteredOrders.map((order) => {
              const mapsUrl =
                order.deliveryLocation.mapsUrl ||
                getGoogleMapsUrl(order.deliveryLocation.latitude, order.deliveryLocation.longitude);

              return (
                <div
                  key={order.orderId}
                  className="p-4 space-y-3 hover:bg-stone-50/70 transition-colors"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-bold text-[#0F2A1D]">
                        {order.orderId}
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.deliveryTime}
                      </span>
                    </div>

                    <select
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.orderId, e.target.value as OrderStatus)}
                      className={`text-xs font-bold py-1 px-2.5 rounded-xl border focus:outline-none cursor-pointer ${getStatusBadgeStyle(
                        order.status
                      )}`}
                    >
                      {allStatuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Customer & Amount */}
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="font-bold text-stone-900 text-sm block">
                        {order.customerName}
                      </span>
                      <span className="font-mono text-xs text-stone-600">
                        {order.customerPhone}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-base font-bold text-emerald-900">
                        ₹{order.totalAmount}
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        {order.paymentDetails.methodLabel} ({order.paymentStatus})
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-stone-700 p-2.5 bg-[#FAF9F5] rounded-xl border border-stone-200/70 space-y-1">
                    <div className="font-medium text-stone-900">
                      {order.items.map((i) => `${i.food.name} (×${i.quantity})`).join(', ')}
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center justify-between">
                      <span className="truncate max-w-[200px]">
                        📍 {order.deliveryAddress || order.deliveryLocation.address}
                      </span>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-bold hover:underline shrink-0"
                      >
                        Maps Link
                      </a>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onSelectOrder(order)}
                      className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                    >
                      <Eye className="w-3.5 h-3.5 text-stone-600" />
                      <span>View Details</span>
                    </button>

                    <a
                      href={generateCustomerStatusWhatsAppUrl(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                      <span>WhatsApp Update</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
