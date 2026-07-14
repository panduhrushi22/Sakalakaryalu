'use client';

import React, { useState, useEffect } from 'react';
import { X, Flame, CheckCircle2, AlertCircle } from 'lucide-react';

interface Puja {
  id: string;
  name: string;
}

interface Pujari {
  id: string;
  name: string;
  specialization: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  pujari: Pujari | null;
  pujas: Puja[];
}

export default function PujariBookingModal({ isOpen, onClose, pujari, pujas }: ModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [address, setAddress] = useState('');
  const [selectedPujaId, setSelectedPujaId] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Set default selected puja if priest specialty matches
  useEffect(() => {
    if (pujas.length > 0) {
      setSelectedPujaId(pujas[0].id);
    }
  }, [pujas]);

  if (!isOpen || !pujari) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          bookingDate,
          bookingTime,
          address,
          pujariId: pujari.id,
          pujaId: selectedPujaId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      setSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border-2 border-amber-300 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-950 text-amber-50 p-5 flex items-center justify-between border-b-2 border-amber-500">
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-amber-400 fill-amber-500 animate-pulse" />
            <span className="font-cinzel text-base sm:text-lg font-bold tracking-wide">
              Book Pujari: {pujari.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-amber-100 hover:text-red-400 hover:bg-stone-900 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {success ? (
            <div className="text-center space-y-6 py-8">
              <div className="inline-flex p-4 bg-amber-50 rounded-full text-amber-600 shadow-inner border border-amber-200">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h3 className="font-cinzel text-xl font-bold text-amber-800">Booking Submitted!</h3>
                <p className="font-lora text-xs sm:text-sm text-stone-600 leading-relaxed px-4">
                  Swasthi! Your request has been successfully registered. Priest <strong>{pujari.name}</strong> will receive your details and coordinate the ritual requirements with you shortly.
                </p>
              </div>
              <button
                onClick={() => {
                  setSuccess(false);
                  onClose();
                }}
                className="bg-stone-900 hover:bg-amber-600 text-amber-100 hover:text-stone-950 text-xs font-outfit font-bold px-8 py-3 rounded-xl shadow-md transition-all"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
                  <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Grid 1: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider font-outfit">Your Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="E.g. Rama Rao"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider font-outfit">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="E.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Grid 2: Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider font-outfit">Email Address</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="E.g. customer@example.com"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs sm:text-sm"
                />
              </div>

              {/* Grid 3: Select Puja */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider font-outfit">Select Puja Ceremony</label>
                <select
                  value={selectedPujaId}
                  onChange={(e) => setSelectedPujaId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs sm:text-sm"
                >
                  {pujas.map((puja) => (
                    <option key={puja.id} value={puja.id}>
                      {puja.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid 4: Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider font-outfit">Puja Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider font-outfit">Auspicious Hour / Time</label>
                  <input
                    type="text"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    placeholder="E.g. 06:45 AM (Sunrise)"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Grid 5: Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider font-outfit">Puja Location Address</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter house, plot no, street, neighborhood where puja will occur..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs sm:text-sm resize-none"
                />
              </div>

              {/* Submit trigger */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-outfit font-bold text-xs tracking-wider py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:hover:bg-amber-500 uppercase mt-4"
              >
                {isLoading ? 'Submitting Sacred Request...' : 'Confirm and Request Priest'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
