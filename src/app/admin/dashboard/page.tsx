'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  Compass,
  BookOpen,
  Trash2,
  CheckCircle,
  Plus,
  LogOut,
  Settings,
  Mail,
  User,
  MapPin,
  Clock,
  Briefcase,
  Languages,
  Phone,
  Flame,
  X,
  Truck,
  ShoppingBag,
  CreditCard,
  Bell
} from 'lucide-react';

interface Stats {
  bookings: number;
  pujaris: number;
  pujas: number;
  blogs: number;
  orders: number;
}

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bookingDate: string;
  bookingTime: string;
  address: string;
  status: string;
  pujari: { name: string };
  puja: { name: string };
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  pincode: string;
  deliveryTime: string;
  paymentMethod: string;
  status: string;
  totalPrice: number;
  itemsJson: string;
  puja: { name: string };
  createdAt: string;
}

interface Puja {
  id: string;
  name: string;
  category: string;
  duration: string;
  difficulty: string;
  slug: string;
}

interface Pujari {
  id: string;
  name: string;
  experience: number;
  specialization: string;
  phone: string;
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const isTabAllowed = (tabName: string, role: string) => {
  if (role === 'super_admin') return true;
  if (role === 'admin') return ['bookings', 'orders'].includes(tabName);
  if (role === 'content_manager') return tabName === 'pujas';
  if (role === 'delivery_manager') return tabName === 'orders';
  return false;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [stats, setStats] = useState<Stats>({ bookings: 0, pujaris: 0, pujas: 0, blogs: 0, orders: 0 });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [pujaris, setPujaris] = useState<Pujari[]>([]);
  
  const [activeTab, setActiveTab] = useState<'bookings' | 'orders' | 'pujas' | 'pujaris'>('bookings');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Forms toggles and states
  const [showAddPuja, setShowAddPuja] = useState(false);
  const [showAddPujari, setShowAddPujari] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Real-Time Notification System States
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'warning' }[]>([]);
  const [knownBookingIds, setKnownBookingIds] = useState<Set<string>>(new Set());
  const [knownOrderIds, setKnownOrderIds] = useState<Set<string>>(new Set());

  const addToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  // Puja Form Fields
  const [pujaName, setPujaName] = useState('');
  const [pujaCategory, setPujaCategory] = useState('daily');
  const [pujaDuration, setPujaDuration] = useState('1 Hour');
  const [pujaDifficulty, setPujaDifficulty] = useState('Medium');
  const [pujaIntro, setPujaIntro] = useState('');
  const [pujaSignificance, setPujaSignificance] = useState('');
  const [pujaBenefits, setPujaBenefits] = useState('');
  const [pujaBestTime, setPujaBestTime] = useState('');
  const [pujaImage, setPujaImage] = useState('');
  const [pujaImageFile, setPujaImageFile] = useState<File | null>(null);
  const [pujaImagePreview, setPujaImagePreview] = useState<string>('');
  const [pujaItems, setPujaItems] = useState<{ name: string; quantity: string }[]>([{ name: '', quantity: '' }]);

  const [pujaDeityName, setPujaDeityName] = useState('');
  const [pujaHeroImage, setPujaHeroImage] = useState('');
  const [pujaThumbnailImage, setPujaThumbnailImage] = useState('');
  const [pujaBannerImage, setPujaBannerImage] = useState('');
  const [pujaThemeColors, setPujaThemeColors] = useState('gold');

  // Pujari Form Fields
  const [pujariName, setPujariName] = useState('');
  const [pujariExperience, setPujariExperience] = useState('5');
  const [pujariLanguages, setPujariLanguages] = useState('Telugu, English');
  const [pujariSpecialization, setPujariSpecialization] = useState('');
  const [pujariPhone, setPujariPhone] = useState('');
  const [pujariAddress, setPujariAddress] = useState('');
  const [pujariImageFile, setPujariImageFile] = useState<File | null>(null);
  const [pujariImagePreview, setPujariImagePreview] = useState<string>('');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkAuthAndLoad = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        if (!meData.success || meData.user.role !== 'admin') {
          router.push('/user');
          return;
        }
        
        const user = meData.user;
        setAdminUser({
          name: user.name || 'Administrator',
          email: user.email || '',
          role: user.role || 'admin',
        });

        // Set token for backwards compatibility in API fetch headers
        setToken('cookie_session_active');

        // Default active tab based on role permissions
        if (user.role === 'content_manager') {
          setActiveTab('pujas');
        } else if (user.role === 'delivery_manager') {
          setActiveTab('orders');
        } else {
          setActiveTab('bookings');
        }

        loadDashboardData('cookie_session_active', user.role);

        // Set up periodic polling for real-time notifications (every 15 seconds)
        interval = setInterval(() => {
          loadDashboardData('cookie_session_active', user.role, true);
        }, 15000);
      } catch (err) {
        router.push('/login');
      }
    };

    checkAuthAndLoad();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [router]);

  const loadDashboardData = async (jwtToken: string, userRole: string, silent = false) => {
    if (!silent) setIsLoading(true);
    setError('');

    try {
      // 1. Load Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (statsRes.status === 401) {
        localStorage.removeItem('adminToken');
        window.dispatchEvent(new Event('authChange'));
        router.push('/admin/login');
        return;
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
          
          if (isTabAllowed('bookings', userRole) && statsData.recentBookings) {
            // Process notifications for bookings
            if (knownBookingIds.size > 0) {
              statsData.recentBookings.forEach((b: Booking) => {
                if (!knownBookingIds.has(b.id)) {
                  addToast(`New Booking Request: ${b.customerName} booked ${b.puja?.name || 'Puja'}!`, 'success');
                }
              });
            }
            setKnownBookingIds(new Set(statsData.recentBookings.map((b: Booking) => b.id)));
          }
        }
      }

      // 2. Load Bookings (only super_admin and admin)
      if (isTabAllowed('bookings', userRole)) {
        const bookingsRes = await fetch('/api/bookings', {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        if (bookingsRes.status === 401) {
          localStorage.removeItem('adminToken');
          window.dispatchEvent(new Event('authChange'));
          router.push('/admin/login');
          return;
        }
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          if (Array.isArray(bookingsData)) {
            if (knownBookingIds.size > 0) {
              bookingsData.forEach((b: Booking) => {
                if (!knownBookingIds.has(b.id)) {
                  addToast(`New Booking Request: ${b.customerName} booked ${b.puja?.name || 'Puja'}!`, 'success');
                }
              });
            }
            setKnownBookingIds(new Set(bookingsData.map((b) => b.id)));
            setBookings(bookingsData);
          }
        }
      }

      // 3. Load Puja Kit Orders (only super_admin, admin, delivery_manager)
      if (isTabAllowed('orders', userRole)) {
        const ordersRes = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        if (ordersRes.status === 401) {
          localStorage.removeItem('adminToken');
          window.dispatchEvent(new Event('authChange'));
          router.push('/admin/login');
          return;
        }
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (Array.isArray(ordersData)) {
            if (knownOrderIds.size > 0) {
              ordersData.forEach((o: Order) => {
                if (!knownOrderIds.has(o.id)) {
                  addToast(`New Puja Kit Order: ${o.customerName} placed order!`, 'success');
                }
              });
            }
            setKnownOrderIds(new Set(ordersData.map((o) => o.id)));
            setOrders(ordersData);
          }
        }
      }

      // 4. Load Pujas list (only super_admin and content_manager)
      if (isTabAllowed('pujas', userRole)) {
        const pujasRes = await fetch('/api/pujas');
        if (pujasRes.ok) {
          const pujasData = await pujasRes.json();
          if (Array.isArray(pujasData)) {
            setPujas(pujasData);
          }
        }
      }

      // 5. Load Pujaris list (only super_admin and admin)
      if (isTabAllowed('pujaris', userRole)) {
        const pujarisRes = await fetch('/api/pujaris');
        if (pujarisRes.ok) {
          const pujarisData = await pujarisRes.json();
          if (Array.isArray(pujarisData)) {
            setPujaris(pujarisData);
          }
        }
      }

    } catch (e: any) {
      if (!silent) setError('Failed to fetch dashboard data. Please authenticate again.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.dispatchEvent(new Event('authChange'));
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Change Booking Status Handler
  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.dispatchEvent(new Event('authChange'));
        router.push('/admin/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to update status');

      // Refresh list
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch (e: any) {
      alert(e.message || 'Status update failed');
    }
  };

  // Change Order Delivery Status Handler
  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.dispatchEvent(new Event('authChange'));
        router.push('/admin/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to update order status');

      // Refresh list
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus.toUpperCase() } : o))
      );
    } catch (e: any) {
      alert(e.message || 'Order status update failed');
    }
  };

  // Delete Booking Handler
  const deleteBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.dispatchEvent(new Event('authChange'));
        router.push('/admin/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to delete booking');

      setBookings((prev) => prev.filter((b) => b.id !== id));
      setStats((prev) => ({ ...prev, bookings: prev.bookings - 1 }));
    } catch (e: any) {
      alert(e.message || 'Deletion failed');
    }
  };

  // Delete Order Handler
  const deleteOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.dispatchEvent(new Event('authChange'));
        router.push('/admin/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to delete order');

      setOrders((prev) => prev.filter((o) => o.id !== id));
      setStats((prev) => ({ ...prev, orders: prev.orders - 1 }));
    } catch (e: any) {
      alert(e.message || 'Deletion failed');
    }
  };

  // Delete Puja Handler
  const deletePuja = async (id: string) => {
    try {
      const response = await fetch(`/api/pujas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.dispatchEvent(new Event('authChange'));
        router.push('/admin/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to delete puja');

      setPujas((prev) => prev.filter((p) => p.id !== id));
      setStats((prev) => ({ ...prev, pujas: prev.pujas - 1 }));
    } catch (e: any) {
      alert(e.message || 'Deletion failed');
    }
  };

  // Delete Pujari Handler
  const deletePujari = async (id: string) => {
    try {
      const response = await fetch(`/api/pujaris/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.dispatchEvent(new Event('authChange'));
        router.push('/admin/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to delete pujari');

      setPujaris((prev) => prev.filter((p) => p.id !== id));
      setStats((prev) => ({ ...prev, pujaris: prev.pujaris - 1 }));
    } catch (e: any) {
      alert(e.message || 'Deletion failed');
    }
  };

  const handlePujaItemChange = (index: number, field: 'name' | 'quantity', value: string) => {
    setPujaItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addPujaItemRow = () => {
    setPujaItems(prev => [...prev, { name: '', quantity: '' }]);
  };

  const removePujaItemRow = (index: number) => {
    if (pujaItems.length > 1) {
      setPujaItems(prev => prev.filter((_, i) => i !== index));
    } else {
      setPujaItems([{ name: '', quantity: '' }]);
    }
  };

  // Create Puja Form Submission
  const handleAddPuja = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/pujas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: pujaName,
          category: pujaCategory,
          duration: pujaDuration,
          difficulty: pujaDifficulty,
          intro: pujaIntro,
          significance: pujaSignificance,
          benefits: pujaBenefits,
          bestTime: pujaBestTime,
          image: pujaImagePreview || pujaImage || '/images/general-puja.png',
          heroImage: pujaImagePreview || pujaImage || '/images/general-puja.png',
          thumbnailImage: pujaImagePreview || pujaImage || '/images/general-puja.png',
          bannerImage: pujaImagePreview || pujaImage || '/images/general-puja.png',
          themeColors: 'gold',
          items: pujaItems.filter(i => i.name.trim()).map(i => ({
            name: i.name.trim(),
            quantity: i.quantity.trim() || '1',
            isRequired: true,
          })),
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.dispatchEvent(new Event('authChange'));
        router.push('/admin/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add puja');
      }

      // Refresh data
      setPujas((prev) => [...prev, data]);
      setStats((prev) => ({ ...prev, pujas: prev.pujas + 1 }));
      setShowAddPuja(false);
      
      // Reset fields
      setPujaName('');
      setPujaIntro('');
      setPujaSignificance('');
      setPujaBenefits('');
      setPujaBestTime('');
      setPujaImage('');
      setPujaImageFile(null);
      setPujaImagePreview('');
      setPujaItems([{ name: '', quantity: '' }]);
      setPujaDeityName('');
      setPujaHeroImage('');
      setPujaThumbnailImage('');
      setPujaBannerImage('');
      setPujaThemeColors('gold');

    } catch (e: any) {
      alert(e.message || 'Error occurred');
    }
  };

  // Create Pujari Form Submission
  const handleAddPujari = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/pujaris', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: pujariName,
          experience: pujariExperience,
          rating: 5,
          languages: pujariLanguages,
          specialization: pujariSpecialization,
          phone: pujariPhone,
          whatsapp: pujariPhone,
          lat: 17.4401,
          lng: 78.3489,
          address: pujariAddress,
          image: pujariImagePreview || 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80',
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.dispatchEvent(new Event('authChange'));
        router.push('/admin/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add priest');
      }

      // Refresh data
      setPujaris((prev) => [...prev, data]);
      setStats((prev) => ({ ...prev, pujaris: prev.pujaris + 1 }));
      setShowAddPujari(false);

      // Reset fields
      setPujariName('');
      setPujariSpecialization('');
      setPujariPhone('');
      setPujariAddress('');
      setPujariImageFile(null);
      setPujariImagePreview('');

    } catch (e: any) {
      alert(e.message || 'Error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin mx-auto" />
          <p className="font-outfit text-xs font-bold text-stone-500 uppercase tracking-wider">Syncing Dashboard Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-950 border-2 border-amber-500 rounded-3xl p-6 shadow-xl text-amber-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-stone-950 rounded-2xl shadow-md flex-shrink-0 border border-amber-300">
            <Flame className="h-6 w-6 text-stone-950 fill-amber-950 animate-pulse" />
          </div>
          <div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-black tracking-wide">
              ADMIN DASHBOARD {adminUser ? `• ${adminUser.name.toUpperCase()}` : ''}
            </h1>
            <p className="font-lora text-xs text-stone-400">Control center for bookings, puja item deliveries, pujaris, and step guides.</p>
            {adminUser && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-outfit border border-amber-500/30 bg-amber-500/10 text-amber-300">
                  {adminUser.email}
                </span>
                {adminUser.role === 'super_admin' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-outfit border border-amber-400 bg-amber-500 text-stone-950 shadow-sm animate-pulse">
                    Owner (Super Admin)
                  </span>
                )}
                {adminUser.role === 'admin' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-outfit border border-emerald-500 bg-emerald-500/10 text-emerald-400">
                    Manager (Admin)
                  </span>
                )}
                {adminUser.role === 'content_manager' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-outfit border border-indigo-500 bg-indigo-500/10 text-indigo-400">
                    Content Curator
                  </span>
                )}
                {adminUser.role === 'delivery_manager' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-outfit border border-sky-500 bg-sky-500/10 text-sky-400">
                    Delivery Operations
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center bg-red-600 hover:bg-red-500 active:scale-95 text-white font-outfit font-bold text-xs tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md"
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          <span>Logout Session</span>
        </button>
      </div>

      {/* 2. Stats Grid Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] tracking-wider text-stone-400 font-outfit uppercase font-semibold">Total Pujas</span>
            <span className="text-xl font-black text-stone-850 block font-outfit">{stats.pujas}</span>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-100"><BookOpen className="h-4 w-4" /></div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] tracking-wider text-stone-400 font-outfit uppercase font-semibold">Verified Priests</span>
            <span className="text-xl font-black text-stone-850 block font-outfit">{stats.pujaris}</span>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-100"><Compass className="h-4 w-4" /></div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] tracking-wider text-stone-400 font-outfit uppercase font-semibold">Total Bookings</span>
            <span className="text-xl font-black text-stone-850 block font-outfit">{stats.bookings}</span>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-100"><Calendar className="h-4 w-4" /></div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex items-center justify-between animate-pulse">
          <div className="space-y-1">
            <span className="text-[9px] tracking-wider text-stone-400 font-outfit uppercase font-semibold">Kit Orders</span>
            <span className="text-xl font-black text-stone-850 block font-outfit">{stats.orders}</span>
          </div>
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-750 border border-amber-500/20"><ShoppingBag className="h-4 w-4" /></div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex items-center justify-between col-span-2 sm:col-span-1">
          <div className="space-y-1">
            <span className="text-[9px] tracking-wider text-stone-400 font-outfit uppercase font-semibold">Spiritual Blogs</span>
            <span className="text-xl font-black text-stone-850 block font-outfit">{stats.blogs}</span>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-100"><BarChart3 className="h-4 w-4" /></div>
        </div>
      </div>

      {/* 3. Dashboard Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-1 bg-stone-100 p-1.5 rounded-2xl max-w-lg shadow-inner overflow-x-auto">
        {(['bookings', 'orders', 'pujas', 'pujaris'] as const)
          .filter((tab) => adminUser && isTabAllowed(tab, adminUser.role))
          .map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-grow min-w-[90px] font-outfit text-xs font-semibold py-2 rounded-xl transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Manage {tab}
            </button>
          ))}
      </div>

      {/* 4. Tab Contents Panel */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-md min-h-[400px]">
        
        {/* TAB 1: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-cinzel text-base font-bold text-stone-850">Recent Booking Requests</h3>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-outfit">Action Status Update</span>
            </div>

            {bookings.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-stone-150">
                <table className="min-w-full divide-y divide-stone-200 font-outfit text-xs text-left">
                  <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3">Customer Details</th>
                      <th className="px-4 py-3">Selected Puja</th>
                      <th className="px-4 py-3">Booked Priest</th>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 bg-white">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-stone-50/50">
                        <td className="px-4 py-4">
                          <strong className="block text-stone-850 text-sm">{booking.customerName}</strong>
                          <span className="text-[10px] text-stone-400 block">{booking.customerPhone}</span>
                          <span className="text-[10px] text-stone-400 block">{booking.customerEmail}</span>
                        </td>
                        <td className="px-4 py-4 text-stone-700 font-lora font-bold text-xs">
                          {booking.puja?.name || 'Standard Puja'}
                        </td>
                        <td className="px-4 py-4 text-stone-700 text-xs">
                          {booking.pujari?.name || 'Unassigned'}
                        </td>
                        <td className="px-4 py-4">
                          <span className="block text-stone-800 font-medium">{booking.bookingDate}</span>
                          <span className="text-[10px] text-stone-400 block">{booking.bookingTime}</span>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className="bg-stone-50 border border-stone-200 rounded px-2.5 py-1 text-[11px] font-semibold text-stone-700 focus:outline-none focus:border-amber-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {confirmDeleteId === booking.id ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  deleteBooking(booking.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-stone-200 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(booking.id)}
                              className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl text-stone-400">
                No active bookings in database. Try submitting a booking from the Pujari finder!
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KIT DELIVERY ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-cinzel text-base font-bold text-stone-850">Puja Kit Delivery Orders</h3>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-outfit">Active Deliveries Grid</span>
            </div>

            {orders.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-stone-150">
                <table className="min-w-full divide-y divide-stone-200 font-outfit text-xs text-left">
                  <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3">Order Details</th>
                      <th className="px-4 py-3">Items Ordered</th>
                      <th className="px-4 py-3">Shipping Address</th>
                      <th className="px-4 py-3">Slot & Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 bg-white">
                    {orders.map((order) => {
                      let itemsArray: Array<{ name: string; quantity: string }> = [];
                      try {
                        itemsArray = JSON.parse(order.itemsJson);
                      } catch (e) {}

                      return (
                        <tr key={order.id} className="hover:bg-stone-50/50">
                          <td className="px-4 py-4">
                            <strong className="block text-stone-850 text-sm">{order.customerName}</strong>
                            <span className="text-[10px] text-stone-400 block">{order.customerPhone}</span>
                            <span className="text-[9px] text-amber-800 font-bold bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full inline-block mt-1 font-cinzel">
                              {order.puja?.name || 'Puja Kit'}
                            </span>
                          </td>
                          <td className="px-4 py-4 max-w-[200px]">
                            <div className="flex flex-wrap gap-1">
                              {itemsArray.map((it, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] bg-stone-100 border border-stone-200 text-stone-600 px-1.5 py-0.5 rounded-lg inline-block font-outfit font-medium"
                                >
                                  {it.name} (x{it.quantity.split(' ')[0]})
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs text-stone-600">
                            <p className="line-clamp-2">{order.deliveryAddress}</p>
                            <span className="text-[10px] font-bold block mt-0.5 text-stone-400">PIN: {order.pincode}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="block text-[10px] text-stone-500 font-medium">{order.deliveryTime.split(' (')[0]}</span>
                            <span className="text-[11px] font-black text-amber-850 block mt-0.5">₹{order.totalPrice} ({order.paymentMethod})</span>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="bg-stone-50 border border-stone-200 rounded px-2.5 py-1 text-[11px] font-semibold text-stone-700 focus:outline-none focus:border-amber-500"
                            >
                              <option value="PLACED">Placed</option>
                              <option value="PREPARING">Preparing Items</option>
                              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                              <option value="DELIVERED">Delivered</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {confirmDeleteId === order.id ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    deleteOrder(order.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-stone-200 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(order.id)}
                                className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl text-stone-400">
                No active delivery orders registered. Order some kits from a Puja checklist guide to test!
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PUJAS */}
        {activeTab === 'pujas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-cinzel text-base font-bold text-stone-850">Manage Puja Manuals</h3>
              <button
                onClick={() => setShowAddPuja(!showAddPuja)}
                className="inline-flex items-center bg-amber-500 hover:bg-amber-600 text-stone-950 font-outfit font-bold text-xs tracking-wider px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                {showAddPuja ? <X className="h-4 w-4 mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
                <span>{showAddPuja ? 'Cancel' : 'Create Puja'}</span>
              </button>
            </div>

            {/* A. Create Puja Form Overlay/Box */}
            {showAddPuja && (
              <form onSubmit={handleAddPuja} className="bg-stone-50 border border-stone-200 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in font-outfit text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-stone-600 uppercase">Puja Title</label>
                  <input type="text" required value={pujaName} onChange={e => setPujaName(e.target.value)} placeholder="E.g. Sri Rama Puja" className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-600 uppercase">Category</label>
                  <select value={pujaCategory} onChange={e => setPujaCategory(e.target.value)} className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl">
                    <option value="daily">Daily Puja</option>
                    <option value="festival">Festival Ceremony</option>
                    <option value="vratham">Vratham Guide</option>
                    <option value="homam">Sacred Homam</option>
                    <option value="ritual">Life Ritual</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-600 uppercase">Duration</label>
                  <input type="text" required value={pujaDuration} onChange={e => setPujaDuration(e.target.value)} placeholder="E.g. 1 Hour" className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-600 uppercase">Difficulty</label>
                  <select value={pujaDifficulty} onChange={e => setPujaDifficulty(e.target.value)} className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-stone-600 uppercase">Introduction</label>
                  <textarea rows={2} required value={pujaIntro} onChange={e => setPujaIntro(e.target.value)} placeholder="Brief introduction about this puja..." className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl resize-none" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-stone-600 uppercase">Significance</label>
                  <textarea rows={2} required value={pujaSignificance} onChange={e => setPujaSignificance(e.target.value)} placeholder="Spiritual significance and importance..." className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl resize-none" />
                </div>
                <div className="md:col-span-2 space-y-2 border-t border-dashed border-stone-200 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-stone-600 uppercase">Puja Samagri (Items List)</label>
                    <button
                      type="button"
                      onClick={addPujaItemRow}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Item Row</span>
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {pujaItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 animate-fade-in">
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handlePujaItemChange(index, 'name', e.target.value)}
                          placeholder="Item Name (e.g. Coconuts, Kumkum)"
                          className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl"
                        />
                        <input
                          type="text"
                          required
                          value={item.quantity}
                          onChange={(e) => handlePujaItemChange(index, 'quantity', e.target.value)}
                          placeholder="Qty (e.g. 2, 100 grams)"
                          className="w-32 px-3 py-2 bg-white border border-stone-200 rounded-xl"
                        />
                        {pujaItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePujaItemRow(index)}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-stone-600 uppercase">Puja Image</label>
                  <div className="flex flex-col sm:flex-row items-start gap-3">
                    {pujaImagePreview && (
                      <img src={pujaImagePreview} alt="Preview" className="w-20 h-20 rounded-xl object-cover border-2 border-amber-300 shadow-sm flex-shrink-0" />
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 border-2 border-dashed border-amber-300 hover:border-amber-500 hover:bg-amber-100 text-amber-700 font-bold rounded-xl transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="truncate">{pujaImageFile ? pujaImageFile.name : 'Choose Photo from Gallery'}</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPujaImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => setPujaImagePreview(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex-shrink-0">or paste URL:</span>
                    <input
                      type="text"
                      value={pujaImage}
                      onChange={e => { setPujaImage(e.target.value); setPujaImagePreview(''); setPujaImageFile(null); }}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-[11px]"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 pt-2">
                  <button type="submit" className="w-full bg-stone-900 hover:bg-amber-600 text-amber-100 hover:text-stone-950 font-bold py-3 rounded-xl transition-all shadow-md uppercase">
                    Confirm and Save Puja
                  </button>
                </div>
              </form>
            )}

            {/* B. List Pujas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pujas.map((p) => (
                <div key={p.id} className="border border-stone-200 p-4 rounded-2xl flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-0.5 max-w-[200px]">
                    <span className="bg-amber-50 text-amber-800 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-200">
                      {p.category}
                    </span>
                    <strong className="block text-stone-850 font-cinzel text-sm truncate">{p.name}</strong>
                    <span className="text-[10px] text-stone-400 font-outfit block">{p.duration} • {p.difficulty}</span>
                  </div>
                  {confirmDeleteId === p.id ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          deletePuja(p.id);
                          setConfirmDeleteId(null);
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(p.id)}
                      className="text-stone-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PUJARIS */}
        {activeTab === 'pujaris' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-cinzel text-base font-bold text-stone-850">Manage Priest Profiles</h3>
              <button
                onClick={() => setShowAddPujari(!showAddPujari)}
                className="inline-flex items-center bg-amber-500 hover:bg-amber-600 text-stone-950 font-outfit font-bold text-xs tracking-wider px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                {showAddPujari ? <X className="h-4 w-4 mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
                <span>{showAddPujari ? 'Cancel' : 'Register Priest'}</span>
              </button>
            </div>

            {/* A. Create Pujari Form overlay */}
            {showAddPujari && (
              <form onSubmit={handleAddPujari} className="bg-stone-50 border border-stone-200 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in font-outfit text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-stone-600 uppercase">Priest Name</label>
                  <input type="text" required value={pujariName} onChange={e => setPujariName(e.target.value)} placeholder="E.g. Dwarakanath Sastry" className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-600 uppercase">Experience (Years)</label>
                  <input type="number" required value={pujariExperience} onChange={e => setPujariExperience(e.target.value)} className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-600 uppercase">Languages</label>
                  <input type="text" required value={pujariLanguages} onChange={e => setPujariLanguages(e.target.value)} className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-stone-600 uppercase">Specialization List</label>
                  <input type="text" required value={pujariSpecialization} onChange={e => setPujariSpecialization(e.target.value)} placeholder="E.g. Vivaham, Gruhapravesam, Ganesh Puja" className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-stone-600 uppercase">Phone Number</label>
                  <input type="tel" required value={pujariPhone} onChange={e => setPujariPhone(e.target.value)} className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-stone-600 uppercase">Address Details</label>
                  <input type="text" required value={pujariAddress} onChange={e => setPujariAddress(e.target.value)} className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-stone-600 uppercase">Priest Photo</label>
                  <div className="flex items-center gap-4">
                    {pujariImagePreview && (
                      <img src={pujariImagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-amber-300 shadow-sm flex-shrink-0" />
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 border-2 border-dashed border-amber-300 hover:border-amber-500 hover:bg-amber-100 text-amber-700 font-bold rounded-xl transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>{pujariImageFile ? pujariImageFile.name : 'Choose Photo from Gallery'}</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPujariImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => setPujariImagePreview(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2 pt-2">
                  <button type="submit" className="w-full bg-stone-900 hover:bg-amber-600 text-amber-100 hover:text-stone-950 font-bold py-3 rounded-xl transition-all shadow-md uppercase">
                    Confirm and Save Pujari Profile
                  </button>
                </div>
              </form>
            )}

            {/* B. List Pujaris */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pujaris.map((p) => (
                <div key={p.id} className="border border-stone-200 p-4 rounded-2xl flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-0.5 max-w-[200px]">
                    <strong className="block text-stone-850 font-cinzel text-sm truncate">{p.name}</strong>
                    <span className="text-[10px] text-stone-400 font-outfit block">Exp: {p.experience} Years • {p.phone}</span>
                    <p className="text-[9px] text-stone-500 font-lora truncate mt-0.5">{p.specialization}</p>
                  </div>
                  {confirmDeleteId === p.id ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          deletePujari(p.id);
                          setConfirmDeleteId(null);
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(p.id)}
                      className="text-stone-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 5. Floating Toast Notifications Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border text-xs font-outfit transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-stone-900 border-amber-500 text-amber-100'
                : 'bg-white border-stone-200 text-stone-850'
            }`}
          >
            <div className="p-1.5 bg-amber-500 text-stone-950 rounded-lg shadow-inner flex-shrink-0">
              <Bell className="h-4 w-4 text-stone-950 fill-amber-950 animate-bounce" />
            </div>
            <div className="flex-grow space-y-0.5">
              <strong className="block font-bold text-amber-500 uppercase tracking-wider text-[9px]">Live Update Notification</strong>
              <p className={`text-[11px] leading-relaxed ${toast.type === 'success' ? 'text-stone-300' : 'text-stone-600'}`}>{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-stone-400 hover:text-stone-200 transition-colors p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
