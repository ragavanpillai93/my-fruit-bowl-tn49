import React, { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  ShoppingBag,
  Calendar,
  IndianRupee,
  Download,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { CustomerRecord } from '../../types';

interface AdminCustomersListProps {
  customers: CustomerRecord[];
}

export const AdminCustomersList: React.FC<AdminCustomersListProps> = ({ customers }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter((cust) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      cust.customerName.toLowerCase().includes(query) ||
      cust.customerPhone.includes(query) ||
      cust.addresses.some((addr) => addr.toLowerCase().includes(query))
    );
  });

  const totalRegistered = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalOrders = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);

  const handleExportCSV = () => {
    const headers = ['Customer Name', 'Phone', 'Total Orders', 'Total Spent (INR)', 'Last Order ID', 'Last Order Date', 'Addresses'];
    const rows = filteredCustomers.map((c) => [
      `"${c.customerName.replace(/"/g, '""')}"`,
      `"${c.customerPhone}"`,
      c.totalOrders,
      c.totalSpent,
      `"${c.lastOrderId}"`,
      `"${c.lastOrderDate}"`,
      `"${(c.addresses || []).join('; ').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MFB_TN49_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWhatsAppLink = (phone: string, name: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    const recipient = clean.length === 10 ? `91${clean}` : clean;
    const text = `Hello ${name}! Greetings from My Fruit Bowl TN 49 Thanjavur kitchen. How was your recent order?`;
    return `https://wa.me/${recipient}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Customer Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Customers</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#0F2A1D] mt-2">
            {totalRegistered}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Recorded in Firestore database</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Orders Placed</span>
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#0F2A1D] mt-2">
            {totalOrders}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Thanjavur deliveries</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Customer Lifetime Value</span>
            <IndianRupee className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#0F2A1D] mt-2">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Cumulative customer spending</p>
        </div>
      </div>

      {/* Control Bar: Search & Export */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            id="input-search-customers"
            placeholder="Search by customer name, mobile or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            id="btn-export-customers-csv"
            onClick={handleExportCSV}
            disabled={filteredCustomers.length === 0}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({filteredCustomers.length})</span>
          </button>
        </div>
      </div>

      {/* Customers List Cards */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base font-bold text-stone-800">
            {searchQuery ? 'No matching customers found' : 'No customers recorded yet'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Try changing your search keywords or clear the filter.'
              : 'As customers place orders through the online store, their profiles and Thanjavur delivery addresses will automatically appear here in real-time.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Name & Spend */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 line-clamp-1">
                      {customer.customerName}
                    </h4>
                    <p className="text-xs text-stone-500 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{customer.customerPhone}</span>
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold shrink-0">
                    ₹{customer.totalSpent.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Orders & Last Activity stats */}
                <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Orders</span>
                    <strong className="text-stone-800 font-mono text-sm">{customer.totalOrders} bowls</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Last Active</span>
                    <span className="text-stone-700 text-[11px] truncate block">
                      {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>

                {/* Saved Address preview */}
                {customer.addresses && customer.addresses.length > 0 && (
                  <div className="text-xs text-stone-600 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <p className="line-clamp-2 text-[11px] leading-relaxed">
                      {customer.addresses[0]}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons: WhatsApp & Call */}
              <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                <a
                  href={getWhatsAppLink(customer.customerPhone, customer.customerName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-[#25D366]/30"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${customer.customerPhone.replace(/[^0-9+]/g, '')}`}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                  title="Call Customer"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
