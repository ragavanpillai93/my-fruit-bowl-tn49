import React, { useState } from 'react';
import { MessageCircle, Phone, MapPin, Clock, Send, ExternalLink, Navigation } from 'lucide-react';
import { DISPLAY_PHONE, STORE_LOCATION } from '../data/foodData';
import { getWhatsAppUrl, getHeroWhatsAppUrl } from '../utils/whatsapp';

export const ContactSection: React.FC = () => {
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formMsg, setFormMsg] = useState('');

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    let text = `Hi My Fruit Bowl TN 49! I have an inquiry:\n\n`;
    if (formName.trim()) text += `👤 Name: ${formName.trim()}\n`;
    if (formPhone.trim()) text += `📞 Phone: ${formPhone.trim()}\n`;
    if (formArea.trim()) text += `📍 Area: ${formArea.trim()}, Thanjavur\n`;
    if (formMsg.trim()) text += `💬 Message: ${formMsg.trim()}\n`;
    text += `\nPlease assist me.`;

    window.open(getWhatsAppUrl(text), '_blank');
  };

  const deliveryAreas = [
    'Medical College Road',
    'New Bus Stand Area',
    'Old Bus Stand Area',
    'Karanthai',
    'MC Road',
    'Vallam',
    'Srinivasapuram',
    'Shivaji Nagar',
    'Rahman Nagar',
    'South Rampart',
    'Yagappa Nagar',
    'Serfoji College Area',
  ];

  return (
    <section id="contact" className="py-16 md:py-24 bg-[#FAF9F5] border-t border-[#1A2E26]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            Local Kitchen in Thanjavur
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F2A1D] tracking-tight">
            Get in Touch & Order
          </h2>
          <p className="mt-2 text-base text-[#1A2E26]/70">
            Have questions about customized diets, delivery slots or bulk catering? Reach out!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Contact Cards & Timing */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* WhatsApp Card */}
            <div className="p-5 rounded-2xl bg-white border border-[#1A2E26]/8 shadow-2xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-base font-bold text-[#0F2A1D]">WhatsApp Orders</h3>
                <p className="text-xs text-[#1A2E26]/70 mt-0.5">Quick order confirmation & customized menu</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    id="contact-wa-btn-1"
                    href={getHeroWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F2A1D] bg-[#E8F8EE] px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="p-5 rounded-2xl bg-white border border-[#1A2E26]/8 shadow-2xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-base font-bold text-[#0F2A1D]">Direct Phone Call</h3>
                <p className="text-xs text-[#1A2E26]/70 mt-0.5">Speak directly to our kitchen manager</p>
                <a
                  id="contact-phone-link"
                  href={`tel:${DISPLAY_PHONE.replace(/\s+/g, '')}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#0F2A1D] bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {DISPLAY_PHONE}
                </a>
              </div>
            </div>

            {/* Location & Google Maps Card */}
            <div className="p-5 rounded-2xl bg-white border border-[#1A2E26]/8 shadow-2xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-base font-bold text-[#0F2A1D]">Kitchen Location</h3>
                <p className="text-xs text-[#1A2E26]/80 mt-0.5 font-medium">{STORE_LOCATION}</p>
                <p className="text-[11px] text-[#1A2E26]/60 mt-0.5">Doorstep delivery provided throughout Thanjavur town.</p>
                
                {/* Google Maps Button */}
                <a
                  id="btn-google-maps"
                  href="https://www.google.com/maps/search/Thanjavur+Tamil+Nadu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>

            {/* Operating Hours Card */}
            <div className="p-5 rounded-2xl bg-white border border-[#1A2E26]/8 shadow-2xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1 text-xs">
                <h3 className="font-serif text-base font-bold text-[#0F2A1D] mb-1.5">Kitchen & Delivery Slots</h3>
                <div className="space-y-1 text-[#1A2E26]/80 font-medium">
                  <p className="flex justify-between">
                    <span>🌅 Morning Breakfast & Fruit Bowls:</span>
                    <strong className="text-[#0F2A1D]">7:00 AM - 11:30 AM</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>🍱 Healthy Lunch Boxes:</span>
                    <strong className="text-[#0F2A1D]">12:00 PM - 3:00 PM</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>🌙 Protein Dinners & Salads:</span>
                    <strong className="text-[#0F2A1D]">6:30 PM - 9:30 PM</strong>
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Quick Inquiry & Delivery Areas */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Quick Inquiry Form */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#1A2E26]/8 shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-[#0F2A1D] mb-1">
                Send Direct Message
              </h3>
              <p className="text-xs sm:text-sm text-[#1A2E26]/70 mb-5">
                Fill this quick form to instantly send your custom order or inquiry to our WhatsApp.
              </p>

              <form onSubmit={handleSendInquiry} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F2A1D] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ragav / Priya"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#1A2E26]/10 rounded-xl text-xs sm:text-sm text-[#0F2A1D] focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F2A1D] mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#1A2E26]/10 rounded-xl text-xs sm:text-sm text-[#0F2A1D] focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2A1D] mb-1">Your Area / Landmark in Thanjavur</label>
                  <input
                    type="text"
                    placeholder="e.g. Near New Bus Stand / Medical College Road"
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#1A2E26]/10 rounded-xl text-xs sm:text-sm text-[#0F2A1D] focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2A1D] mb-1">Your Meal Requirement / Message</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. I want to order 2 Power Protein Bowls and 1 Watermelon Bowl for dinner around 7:30 PM."
                    value={formMsg}
                    onChange={(e) => setFormMsg(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#1A2E26]/10 rounded-xl text-xs sm:text-sm text-[#0F2A1D] focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-submit-contact-whatsapp"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-sm font-bold rounded-xl shadow-md transition-all transform active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  <span>Send via WhatsApp</span>
                </button>
              </form>
            </div>

            {/* Delivery Coverage Areas in Thanjavur */}
            <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#1A2E26]/8">
              <div className="flex items-center gap-2 mb-2.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2A1D]">
                  Daily Delivery Hubs Across Thanjavur (TN 49)
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {deliveryAreas.map((area, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white text-[#1A2E26]/80 px-2.5 py-1 rounded-lg border border-[#1A2E26]/6 font-medium"
                  >
                    📍 {area}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
