import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  AlertCircle,
  ShieldCheck,
  Info
} from 'lucide-react';
import { PaymentDetails, PaymentMethodType } from '../types';
import { DEFAULT_BUSINESS_UPI_ID, BUSINESS_UPI_NAME } from '../data/foodData';

interface PaymentMethodSectionProps {
  paymentDetails: PaymentDetails;
  onPaymentChange: (details: PaymentDetails) => void;
  totalAmount: number;
  orderId: string;
  error?: string;
}

export const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  paymentDetails,
  onPaymentChange,
  totalAmount,
  orderId,
  error,
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Business UPI ID (Configurable by business owner or defaults)
  const businessUpiId = paymentDetails.upiId || DEFAULT_BUSINESS_UPI_ID;

  // Handle Copy UPI ID
  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(businessUpiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  // UPI deep link for Android / iOS UPI app opening
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(businessUpiId)}&pn=${encodeURIComponent(BUSINESS_UPI_NAME)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;

  // Quick UPI app handler
  const handlePayViaUpi = () => {
    window.location.href = upiDeepLink;
  };

  const handleSelectMethod = (method: PaymentMethodType) => {
    let methodLabel = 'Cash on Delivery';
    if (method === 'upi') methodLabel = 'UPI (GPay / PhonePe / Paytm)';
    if (method === 'pay-after-confirmation') methodLabel = 'Pay After Confirmation';

    onPaymentChange({
      ...paymentDetails,
      method,
      methodLabel,
      upiId: businessUpiId,
    });
  };

  return (
    <div className="space-y-3.5" id="payment-method-section">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#0F2A1D] uppercase tracking-wider flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-emerald-700" />
          <span>Payment Method <span className="text-rose-500">*</span></span>
        </label>
        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          Amount: ₹{totalAmount.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Payment Options Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        
        {/* 1. CASH ON DELIVERY */}
        <div
          id="payment-opt-cod"
          onClick={() => handleSelectMethod('cod')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
            paymentDetails.method === 'cod'
              ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/30 shadow-xs'
              : 'bg-[#FAF9F5] border-stone-200/80 hover:border-stone-300 hover:bg-white'
          }`}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              paymentDetails.method === 'cod' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
            }`}>
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#0F2A1D]">
                  Cash on Delivery
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-stone-100 text-stone-700">
                  COD
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5 font-medium">
                Pay when your order is delivered.
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                Pay in cash or scan delivery partner's UPI QR upon doorstep arrival.
              </p>
            </div>
          </div>

          <div className="shrink-0 pt-1">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              paymentDetails.method === 'cod' ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300'
            }`}>
              {paymentDetails.method === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </div>
        </div>

        {/* 2. UPI (GPay / PhonePe / Paytm / QR) */}
        <div
          id="payment-opt-upi"
          onClick={() => handleSelectMethod('upi')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
            paymentDetails.method === 'upi'
              ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/30 shadow-xs'
              : 'bg-[#FAF9F5] border-stone-200/80 hover:border-stone-300 hover:bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                paymentDetails.method === 'upi' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
              }`}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#0F2A1D]">
                    UPI
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                    GPay • PhonePe • Paytm
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5 font-medium">
                  Direct UPI transfer to business account.
                </p>
              </div>
            </div>

            <div className="shrink-0 pt-1">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                paymentDetails.method === 'upi' ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300'
              }`}>
                {paymentDetails.method === 'upi' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
          </div>

          {/* Expanded UPI Interface (When UPI is selected) */}
          {paymentDetails.method === 'upi' && (
            <div
              className="pt-3 border-t border-emerald-200/80 space-y-3 animate-in fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Business UPI ID Display & Copy */}
              <div className="bg-white p-3 rounded-xl border border-emerald-200/90 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-500 font-semibold uppercase tracking-wider">
                    Business UPI ID:
                  </span>
                  <span className="text-emerald-800 font-bold">
                    {BUSINESS_UPI_NAME}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 p-2 bg-[#FAF9F5] rounded-lg border border-stone-200">
                  <span className="font-mono text-xs font-bold text-[#0F2A1D] truncate">
                    {businessUpiId}
                  </span>
                  <button
                    type="button"
                    id="btn-copy-upi-id"
                    onClick={handleCopyUpi}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-md border border-stone-200 flex items-center gap-1 shrink-0 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Optional UPI ID override field for business owner configuration */}
                <div className="pt-1">
                  <details className="text-[11px] text-stone-500 cursor-pointer">
                    <summary className="hover:text-stone-800 transition-colors font-medium">
                      Configure custom business UPI ID (Optional)
                    </summary>
                    <div className="mt-2 space-y-1">
                      <input
                        type="text"
                        placeholder="e.g. yourname@okaxis"
                        value={paymentDetails.upiId || ''}
                        onChange={(e) =>
                          onPaymentChange({
                            ...paymentDetails,
                            upiId: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </details>
                </div>
              </div>

              {/* Pay via UPI Action Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-pay-via-upi-intent"
                  onClick={handlePayViaUpi}
                  className="w-full py-2.5 px-3 bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#7BF587]" />
                  <span>Pay via UPI (₹{totalAmount})</span>
                </button>

                <button
                  type="button"
                  id="btn-open-upi-qr"
                  onClick={() => setShowQrModal(!showQrModal)}
                  className="w-full py-2.5 px-3 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{showQrModal ? 'Hide UPI QR' : 'Show UPI QR Code'}</span>
                </button>
              </div>

              {/* UPI QR Display Card (if toggled) */}
              {showQrModal && (
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-center space-y-2 animate-in zoom-in-95">
                  <p className="text-xs font-bold text-stone-800">Scan using any UPI App</p>
                  <div className="w-40 h-40 mx-auto bg-white p-2 border border-stone-300 rounded-xl flex items-center justify-center shadow-inner">
                    {/* Clean QR code renderer via reliable quickchart QR endpoint */}
                    <img
                      src={`https://quickchart.io/qr?text=${encodeURIComponent(upiDeepLink)}&size=160&margin=1`}
                      alt="UPI Payment QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 font-mono">
                    {businessUpiId} • ₹{totalAmount}
                  </p>
                </div>
              )}

              {/* "I have completed payment" Checkbox */}
              <label
                htmlFor="chk-completed-upi-payment"
                className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-stone-200 cursor-pointer hover:bg-emerald-50/50 transition-colors"
              >
                <input
                  type="checkbox"
                  id="chk-completed-upi-payment"
                  checked={!!paymentDetails.isPaymentMarkedDone}
                  onChange={(e) =>
                    onPaymentChange({
                      ...paymentDetails,
                      isPaymentMarkedDone: e.target.checked,
                    })
                  }
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#0F2A1D] block">
                    I have completed payment
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Check this once you've sent ₹{totalAmount} via your UPI app.
                  </span>
                </div>
              </label>

              {/* Optional UTR / Transaction ID field */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-stone-700">
                  UTR / Transaction Reference ID <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="input-utr-transaction-id"
                  placeholder="e.g. 340912384912 or UPI Ref No."
                  value={paymentDetails.utrTransactionId || ''}
                  onChange={(e) =>
                    onPaymentChange({
                      ...paymentDetails,
                      utrTransactionId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs font-mono border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-stone-900"
                />
                <p className="text-[10px] text-stone-500">
                  Entering the 12-digit UTR helps our kitchen staff cross-verify faster.
                </p>
              </div>

              {/* Notice regarding verification */}
              <div className="flex items-start gap-1.5 p-2 bg-stone-100 rounded-lg text-[10px] text-stone-600 font-medium">
                <Info className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                <span>
                  Payment verification will be checked by our kitchen team upon WhatsApp order confirmation.
                </span>
              </div>

            </div>
          )}
        </div>

        {/* 3. PAY AFTER CONFIRMATION */}
        <div
          id="payment-opt-after-confirmation"
          onClick={() => handleSelectMethod('pay-after-confirmation')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
            paymentDetails.method === 'pay-after-confirmation'
              ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/30 shadow-xs'
              : 'bg-[#FAF9F5] border-stone-200/80 hover:border-stone-300 hover:bg-white'
          }`}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              paymentDetails.method === 'pay-after-confirmation' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#0F2A1D]">
                  Pay after confirmation
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Flexible
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5 font-medium">
                Pay online or cash after kitchen confirms availability.
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                Our kitchen will verify today's fresh cut ingredients & ETA, then send the payment QR via WhatsApp.
              </p>
            </div>
          </div>

          <div className="shrink-0 pt-1">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              paymentDetails.method === 'pay-after-confirmation' ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300'
            }`}>
              {paymentDetails.method === 'pay-after-confirmation' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </div>
        </div>

      </div>

      {error && (
        <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
