'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ShoppingBag,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  CreditCard,
  QrCode
} from 'lucide-react';
import { useLanguage } from './LanguageProvider';

interface RawItem {
  id: string;
  name: string;
  quantity: string;
  isRequired: boolean;
  price?: number;
}

interface CartItem {
  id: string;
  name: string;
  quantityString: string;
  count: number;
  isRequired: boolean;
  price: number;
}

interface PujaKitOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pujaId: string;
  pujaName: string;
  items: RawItem[];
}

export default function PujaKitOrderDrawer({
  isOpen,
  onClose,
  pujaId,
  pujaName,
  items,
}: PujaKitOrderDrawerProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  
  const { t, language } = useLanguage();

  const [extraItems, setExtraItems] = useState<Array<{ name: string; price: number; added: boolean }>>([
    { name: language === 'te' ? 'ప్యూర్ ఆవు నెయ్యి (100ml)' : language === 'hi' ? 'शुद्ध गाय का घी (100ml)' : 'Pure Cow Ghee (100ml)', price: 99, added: false },
    { name: language === 'te' ? 'సువాసన అగరుబత్తీలు (ప్యాకెట్)' : language === 'hi' ? 'सुगंधित अगरबत्ती (पैकेट)' : 'Sacred Incense Sticks (Agarbatti)', price: 40, added: false },
    { name: language === 'te' ? 'తామ్ర పంచపాత్ర చెంచా' : language === 'hi' ? 'तांबे का पंचपात्र चम्मच' : 'Panchapatra Brass Spoon', price: 150, added: false },
    { name: language === 'te' ? 'పూజ వత్తులు (ప్యాకెట్)' : language === 'hi' ? 'पूजा बत्ती (पैकेट)' : 'Cotton Puja Wicks (Packet)', price: 20, added: false },
  ]);

  // Checkout Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('Morning 06:00 AM - 09:00 AM (Auspicious)');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Hydrate cart when drawer opens
  useEffect(() => {
    if (isOpen && items.length > 0) {
      const initialCart = items.map((item) => {
        const numMatch = item.quantity.match(/^\d+/);
        const count = numMatch ? parseInt(numMatch[0]) : 1;
        return {
          id: item.id,
          name: item.name,
          quantityString: item.quantity,
          count: count > 0 ? count : 1,
          isRequired: item.isRequired,
          price: item.price || 29.0,
        };
      });
      setCartItems(initialCart);
      setStep('cart');
      setError('');
    }
  }, [isOpen, items]);

  // Adjust standard cart item count
  const updateCount = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newCount = item.count + delta;
          return { ...item, count: newCount > 0 ? newCount : 1 };
        }
        return item;
      })
    );
  };

  // Remove item completely
  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Toggle dynamic extra items
  const toggleExtra = (name: string) => {
    setExtraItems((prev) =>
      prev.map((ex) => (ex.name === name ? { ...ex, added: !ex.added } : ex))
    );
  };

  // Compute pricing totals
  const subtotal =
    cartItems.reduce((acc, item) => acc + item.price * item.count, 0) +
    extraItems.reduce((acc, ex) => (ex.added ? acc + ex.price : acc), 0);

  const packingCharge = 20.0;
  const deliveryCharge = subtotal > 499 ? 0.0 : 45.0;
  const total = subtotal + packingCharge + deliveryCharge;

  // Checkout submission handler
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const orderedItems = [
      ...cartItems.map((c) => ({
        name: c.name,
        quantity: `${c.count} Units (Ref: ${c.quantityString})`,
        price: c.price,
      })),
      ...extraItems
        .filter((ex) => ex.added)
        .map((ex) => ({
          name: ex.name,
          quantity: '1 Unit (Extra Supplement)',
          price: ex.price,
        })),
    ];

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email || 'guest@sakalakaryalu.in',
          deliveryAddress: address,
          pincode,
          deliveryTime,
          paymentMethod,
          totalPrice: total,
          itemsJson: JSON.stringify(orderedItems),
          pujaId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit order');

      setPlacedOrderId(data.order.id);
      setStep('success');
    } catch (e: any) {
      setError(e.message || 'Error occurred during checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-outfit text-stone-850">
      {/* Background overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Slide-over panel container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-amber-200">
          
          {/* Header section */}
          <div className="p-5 border-b border-stone-150 flex items-center justify-between bg-stone-50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-amber-600" />
              <div>
                <h2 className="font-cinzel text-base font-bold text-amber-850">
                  {language === 'te' ? 'పూజా కిట్ కార్ట్' : language === 'hi' ? 'पूजा किट कार्ट' : 'Sacred Puja Kit Cart'}
                </h2>
                <span className="text-[10px] text-stone-500 font-semibold block">{pujaName} {language === 'te' ? 'సామాగ్రి' : language === 'hi' ? 'सामग्री' : 'Kits'}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main scrollable body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* STEP 1: CART REVIEWS */}
            {step === 'cart' && (
              <div className="space-y-6">
                <div className="bg-amber-50/40 border border-amber-200/50 p-3 rounded-2xl text-[10px] text-stone-600 font-lora leading-relaxed">
                  🛒 <strong>{language === 'te' ? 'పవిత్ర ప్యాకింగ్:' : language === 'hi' ? 'पवित्र पैकिंग:' : 'Sacred packing:'}</strong>{' '}
                  {language === 'te'
                    ? 'పూజకు కావలసిన అన్ని సామాగ్రి శుభ్రం చేసి, పర్యావరణహిత ప్యాకెట్లలో అమర్చి, డెలివరీకి ముందు ప్యాక్ చేయబడును.'
                    : language === 'hi'
                    ? 'सभी सामग्रियां स्वच्छ रूप से साफ कर पर्यावरण-अनुकूल पैकेटों में रखी जाती हैं और शुद्धता बनाए रखने के लिए पैक की जाती हैं।'
                    : 'All ingredients are cleaned, categorized in biodegradable packages, and packed alongside fresh elements directly before dispatch to respect ritual sanity.'}
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                    {language === 'te' ? `సామాగ్రి వివరాలు (${cartItems.length} వస్తువులు)` : language === 'hi' ? `पूजा सामग्री (${cartItems.length} वस्तुएं)` : `Kit Contents (${cartItems.length} items)`}
                  </span>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-stone-150 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-amber-200 transition-colors"
                    >
                      <div className="space-y-0.5 max-w-[200px]">
                        <strong className="block text-xs font-bold text-stone-800">{item.name}</strong>
                        <span className="text-[9px] text-stone-400 block font-lora">Ref: {item.quantityString}</span>
                        <span className="text-[11px] text-amber-800 font-bold block">₹{item.price * item.count}</span>
                      </div>
                      
                      {/* Quantity Controls and Deletion */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden">
                          <button
                            onClick={() => updateCount(item.id, -1)}
                            className="p-1 px-2 text-stone-500 hover:bg-stone-200 active:bg-stone-300 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-stone-700">{item.count}</span>
                          <button
                            onClick={() => updateCount(item.id, 1)}
                            className="p-1 px-2 text-stone-500 hover:bg-stone-200 active:bg-stone-300 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        {!item.isRequired && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-stone-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Extra supplements */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">{t('supplements')}</span>
                  <div className="grid grid-cols-2 gap-3">
                    {extraItems.map((ex, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleExtra(ex.name)}
                        className={`p-3 rounded-2xl border text-left transition-all text-xs flex flex-col justify-between gap-1.5 h-20 ${
                          ex.added
                            ? 'bg-amber-500/10 border-amber-500 font-semibold'
                            : 'border-stone-200 hover:border-amber-500'
                        }`}
                      >
                        <span className="line-clamp-2 text-stone-850 font-bold leading-tight">{ex.name}</span>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-amber-800 font-bold text-[10px]">₹{ex.price}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                            ex.added ? 'bg-amber-500 text-stone-950' : 'bg-stone-100 text-stone-500'
                          }`}>
                            {ex.added ? (language === 'te' ? 'చేర్చబడింది' : language === 'hi' ? 'जोड़ा गया' : 'Added') : (language === 'te' ? '+ చేర్చు' : language === 'hi' ? '+ जोड़ें' : '+ Add')}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* STEP 2: CHECKOUT DETAIL FORMS */}
            {step === 'checkout' && (
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="flex items-center space-x-1.5 bg-stone-50 p-3 rounded-2xl border border-stone-200 mb-2">
                  <Truck className="h-4.5 w-4.5 text-amber-500" />
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    {language === 'te' ? 'వేగవంతమైన డెలివరీ సేవ' : language === 'hi' ? 'त्वरित शुभ डिलीवरी सेवा' : 'Fast Auspicious Hour Delivery'}
                  </span>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
                    <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">{t('fullName')}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'te' ? 'మీ పూర్తి పేరు వ్రాయండి' : language === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">{t('mobileNumber')}</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="E.g. 9876543210"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">{t('emailAddress')}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="address@sakalakaryalu.in"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">{t('shippingDetails')}</label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={language === 'te' ? 'ఇంటి నెంబర్, వీధి పేరు, ల్యాండ్‌మార్క్ వివరాలు...' : language === 'hi' ? 'मकान नंबर, गली का नाम, लैंडमार्क...' : 'House/Plot No, Apartment details, Neighborhood landmark...'}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-xs sm:text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">{t('pincode')}</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="E.g. 500032"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">{language === 'te' ? 'డెలివరీ సమయం' : language === 'hi' ? 'डिलीवरी समय' : 'Preferred Hours Slot'}</label>
                    <select
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-xs"
                    >
                      <option value="Morning 06:00 AM - 09:00 AM (Auspicious)">
                        {language === 'te' ? 'ఉదయం 06:00 - 09:00 (శుభ సమయం)' : language === 'hi' ? 'सुबह 06:00 - 09:00 (शुभ मुहूर्त)' : 'Morning 06:00 AM - 09:00 AM (Auspicious)'}
                      </option>
                      <option value="Afternoon 12:00 PM - 03:00 PM">
                        {language === 'te' ? 'మధ్యాహ్నం 12:00 - 03:00' : language === 'hi' ? 'दोपहर 12:00 - 03:00' : 'Afternoon 12:00 PM - 03:00 PM'}
                      </option>
                      <option value="Evening 05:00 PM - 08:00 PM">
                        {language === 'te' ? 'సాయంత్రం 05:00 - 08:00' : language === 'hi' ? 'शाम 05:00 - 08:00' : 'Evening 05:00 PM - 08:00 PM'}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Payment Option Selector */}
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">{t('paymentMethod')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                        paymentMethod === 'COD'
                          ? 'border-amber-500 bg-amber-500/10 font-bold'
                          : 'border-stone-250 hover:border-stone-400'
                      }`}
                    >
                      <span>{t('cod')}</span>
                      <Truck className="h-4 w-4 text-stone-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                        paymentMethod === 'UPI'
                          ? 'border-amber-500 bg-amber-500/10 font-bold'
                          : 'border-stone-250 hover:border-stone-400'
                      }`}
                    >
                      <span>{t('upi')}</span>
                      <QrCode className="h-4 w-4 text-stone-400" />
                    </button>
                  </div>
                </div>

                {/* Mock UPI details if UPI selected */}
                {paymentMethod === 'UPI' && (
                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center text-[10px] text-stone-500 font-lora">
                    <div className="w-24 h-24 bg-stone-200 rounded border border-stone-300 flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-stone-700" />
                    </div>
                    <span>
                      {language === 'te'
                        ? 'BHIM, GPay, లేదా PhonePe తో స్కాన్ చేయండి. చెల్లింపు ధృవీకరణ తర్వాత మీ ఆర్డర్ ఖరారు చేయబడుతుంది.'
                        : language === 'hi'
                        ? 'BHIM, GPay, या PhonePe से स्कैन करें। भुगतान की पुष्टि के बाद आपका ऑर्डर सत्यापित हो जाएगा।'
                        : 'Scan code with BHIM, GPay, or PhonePe. Order will finalize automatically on payment trace verification.'}
                    </span>
                  </div>
                )}

                {/* Form submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-stone-900 hover:bg-amber-600 text-amber-100 hover:text-stone-950 font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50 uppercase mt-4 text-xs"
                >
                  {isLoading ? (language === 'te' ? 'నమోదు చేయబడుతోంది...' : language === 'hi' ? 'दर्ज किया जा रहा है...' : 'Registering Sacred Kit Order...') : t('confirmOrder')}
                </button>
              </form>
            )}

            {/* STEP 3: SUCCESS BANNER */}
            {step === 'success' && (
              <div className="text-center py-10 space-y-6 flex flex-col items-center justify-center h-full">
                <div className="p-4 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-bounce">
                  <CheckCircle className="h-8 w-8 text-emerald-700 fill-emerald-100" />
                </div>
                <div className="space-y-2.5">
                  <h3 className="font-cinzel text-lg font-bold text-amber-800">
                    {t('orderPlaced')}
                  </h3>
                  <p className="font-lora text-[11px] sm:text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
                    {t('orderPlacedSub')}
                  </p>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 w-full text-left font-outfit text-xs space-y-2">
                  <div className="flex justify-between border-b border-stone-150 pb-1.5">
                    <span className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                      {language === 'te' ? 'ఆర్డర్ నంబర్' : language === 'hi' ? 'ऑर्डर नंबर' : 'Order Identifier'}
                    </span>
                    <strong className="text-stone-700 truncate max-w-[150px]">{placedOrderId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                      {language === 'te' ? 'కోరుకున్న సమయం' : language === 'hi' ? 'डिलीवरी समय' : 'Slot Scheduled'}
                    </span>
                    <span className="text-stone-700 font-bold">{deliveryTime.split(' (')[0]}</span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="bg-stone-900 hover:bg-amber-600 text-amber-100 hover:text-stone-950 font-bold py-3 px-8 rounded-xl transition-all shadow-md uppercase text-xs w-full"
                >
                  {language === 'te' ? 'తిరిగి పూజకు వెళ్ళండి' : language === 'hi' ? 'पूजा विधि पर वापस जाएं' : 'Return to Puja Guide'}
                </button>
              </div>
            )}

          </div>

          {/* Cart Pricing summary calculations footer */}
          {step !== 'success' && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-4">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{language === 'te' ? 'సామాగ్రి మొత్తం:' : language === 'hi' ? 'सामग्री उप-योग:' : 'Kit Items Subtotal:'}</span>
                  <span className="font-bold text-stone-850">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('packingFee')}:</span>
                  <span className="font-bold text-stone-850">₹{packingCharge}</span>
                </div>
                <div className="flex justify-between border-b border-stone-150 pb-2">
                  <span>{t('shippingFee')}:</span>
                  <span className={`font-bold ${deliveryCharge === 0 ? 'text-emerald-700 font-bold' : 'text-stone-850'}`}>
                    {deliveryCharge === 0 ? (language === 'te' ? 'ఉచితం' : language === 'hi' ? 'मुफ़्त' : 'FREE') : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-stone-900 font-bold pt-1">
                  <span className="font-cinzel">{language === 'te' ? 'మొత్తం చెల్లించవలసినది:' : language === 'hi' ? 'कुल देय राशि:' : 'Total Payable Price:'}</span>
                  <span className="text-amber-800 text-base">₹{total}</span>
                </div>
              </div>

              {step === 'cart' && (
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full bg-stone-900 hover:bg-amber-600 text-amber-100 hover:text-stone-950 font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 uppercase text-xs"
                >
                  <Truck className="h-4.5 w-4.5" />
                  <span>{language === 'te' ? 'షిప్పింగ్ వివరాలకు వెళ్ళండి' : language === 'hi' ? 'डिलीवरी विवरण दर्ज करें' : 'Proceed to Shipping'}</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
