'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  Compass,
  BookOpen,
  Trash2,
  Plus,
  LogOut,
  Clock,
  Phone,
  Flame,
  X,
  ShoppingBag,
  Pencil,
  Search,
  Sun,
  Sparkles,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Stats {
  bookings: number;
  pujaris: number;
  pujas: number;
  blogs: number;
  orders: number;
  panchangam?: number;
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

interface PujaItem {
  name: string;
  quantity: string;
  isRequired?: boolean;
}

interface Puja {
  id: string;
  name: string;
  category: string;
  duration: string;
  difficulty: string;
  slug: string;
  intro?: string;
  significance?: string;
  benefits?: string;
  bestTime?: string;
  image?: string;
  deityName?: string;
  items?: PujaItem[];
}

interface Pujari {
  id: string;
  name: string;
  experience: number;
  rating?: number;
  languages: string;
  specialization: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  image?: string;
  lat?: number;
  lng?: number;
}

interface PanchangamEntry {
  id: string;
  date: string;
  dayName: string;
  tithi: string;
  nakshatram: string;
  yogam?: string | null;
  karanam?: string | null;
  rahuKalam: string;
  yamagandam: string;
  gulikaKalam?: string | null;
  abhijitMuhurtham?: string | null;
  sunrise: string;
  sunset: string;
  specialEvent?: string | null;
  description?: string | null;
}

type TabType = 'bookings' | 'orders' | 'pujas' | 'pujaris' | 'panchangam';

const isTabAllowed = (tabName: TabType, role: string) => {
  if (role === 'super_admin' || role === 'admin') return true;
  if (role === 'content_manager') return ['pujas', 'panchangam'].includes(tabName);
  if (role === 'delivery_manager') return tabName === 'orders';
  return false;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [stats, setStats] = useState<Stats>({ bookings: 0, pujaris: 0, pujas: 0, blogs: 0, orders: 0, panchangam: 0 });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [pujaris, setPujaris] = useState<Pujari[]>([]);
  const [panchangamList, setPanchangamList] = useState<PanchangamEntry[]>([]);
  
  const [activeTab, setActiveTab] = useState<TabType>('pujas');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter States
  const [pujaSearch, setPujaSearch] = useState('');
  const [pujaCategoryFilter, setPujaCategoryFilter] = useState('all');
  const [pujariSearch, setPujariSearch] = useState('');
  const [panchangamSearch, setPanchangamSearch] = useState('');

  // Modal / Form Toggles
  const [showAddPuja, setShowAddPuja] = useState(false);
  const [editingPuja, setEditingPuja] = useState<Puja | null>(null);

  const [showAddPujari, setShowAddPujari] = useState(false);
  const [editingPujari, setEditingPujari] = useState<Pujari | null>(null);

  const [showAddPanchangam, setShowAddPanchangam] = useState(false);
  const [editingPanchangam, setEditingPanchangam] = useState<PanchangamEntry | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'booking' | 'order' | 'puja' | 'pujari' | 'panchangam' | null>(null);

  // Toasts Notification System
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
  const [pujaDeityName, setPujaDeityName] = useState('Deity');
  const [pujaItems, setPujaItems] = useState<{ name: string; quantity: string }[]>([{ name: '', quantity: '' }]);

  // Pujari Form Fields
  const [pujariName, setPujariName] = useState('');
  const [pujariExperience, setPujariExperience] = useState('5');
  const [pujariRating, setPujariRating] = useState('5.0');
  const [pujariLanguages, setPujariLanguages] = useState('Telugu, English, Sanskrit');
  const [pujariSpecialization, setPujariSpecialization] = useState('');
  const [pujariPhone, setPujariPhone] = useState('');
  const [pujariWhatsapp, setPujariWhatsapp] = useState('');
  const [pujariAddress, setPujariAddress] = useState('');
  const [pujariImage, setPujariImage] = useState('');
  const [pujariImageFile, setPujariImageFile] = useState<File | null>(null);
  const [pujariImagePreview, setPujariImagePreview] = useState<string>('');

  // Panchangam Form Fields
  const [pDate, setPDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pDayName, setPDayName] = useState('Thursday / గురువారం');
  const [pTithi, setPTithi] = useState('Shukla Navami');
  const [pNakshatram, setPNakshatram] = useState('Uttara Ashadha');
  const [pYogam, setPYogam] = useState('Siddha');
  const [pKaranam, setPKaranam] = useState('Kaulava');
  const [pRahu, setPRahu] = useState('01:30 PM - 03:00 PM');
  const [pYama, setPYama] = useState('06:00 AM - 07:30 AM');
  const [pGulika, setPGulika] = useState('09:00 AM - 10:30 AM');
  const [pAbhijit, setPAbhijit] = useState('11:45 AM - 12:35 PM');
  const [pSunrise, setPSunrise] = useState('06:05 AM');
  const [pSunset, setPSunset] = useState('06:12 PM');
  const [pSpecialEvent, setPSpecialEvent] = useState('');
  const [pDescription, setPDescription] = useState('');

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

        setToken('cookie_session_active');

        // Set default active tab
        if (user.role === 'content_manager') {
          setActiveTab('pujas');
        } else if (user.role === 'delivery_manager') {
          setActiveTab('orders');
        } else {
          setActiveTab('pujas');
        }

        loadDashboardData('cookie_session_active', user.role);

        // Polling for real-time updates every 15 seconds
        interval = setInterval(() => {
          loadDashboardData('cookie_session_active', user.role, true);
        }, 15000);
      } catch {
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

      // 2. Load Bookings
      if (isTabAllowed('bookings', userRole)) {
        const bookingsRes = await fetch('/api/bookings', {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          if (Array.isArray(bookingsData)) {
            setBookings(bookingsData);
          }
        }
      }

      // 3. Load Puja Kit Orders
      if (isTabAllowed('orders', userRole)) {
        const ordersRes = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (Array.isArray(ordersData)) {
            setOrders(ordersData);
          }
        }
      }

      // 4. Load Pujas
      if (isTabAllowed('pujas', userRole)) {
        const pujasRes = await fetch('/api/pujas?full=true');
        if (pujasRes.ok) {
          const pujasData = await pujasRes.json();
          if (Array.isArray(pujasData)) {
            setPujas(pujasData);
          }
        }
      }

      // 5. Load Pujaris
      if (isTabAllowed('pujaris', userRole)) {
        const pujarisRes = await fetch('/api/pujaris');
        if (pujarisRes.ok) {
          const pujarisData = await pujarisRes.json();
          if (Array.isArray(pujarisData)) {
            setPujaris(pujarisData);
          }
        }
      }

      // 6. Load Panchangam
      if (isTabAllowed('panchangam', userRole)) {
        const pRes = await fetch('/api/panchangam');
        if (pRes.ok) {
          const pData = await pRes.json();
          if (Array.isArray(pData)) {
            setPanchangamList(pData);
          }
        }
      }

    } catch {
      if (!silent) setError('Failed to fetch dashboard data.');
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

  // ----------------------------------------------------
  // PUJA HANDLERS (Create / Edit / Delete)
  // ----------------------------------------------------
  const openAddPuja = () => {
    setEditingPuja(null);
    setPujaName('');
    setPujaCategory('daily');
    setPujaDuration('1 Hour');
    setPujaDifficulty('Medium');
    setPujaIntro('');
    setPujaSignificance('');
    setPujaBenefits('');
    setPujaBestTime('');
    setPujaImage('');
    setPujaImageFile(null);
    setPujaImagePreview('');
    setPujaDeityName('Deity');
    setPujaItems([{ name: '', quantity: '' }]);
    setShowAddPuja(true);
  };

  const openEditPuja = (puja: Puja) => {
    setEditingPuja(puja);
    setPujaName(puja.name);
    setPujaCategory(puja.category || 'daily');
    setPujaDuration(puja.duration || '1 Hour');
    setPujaDifficulty(puja.difficulty || 'Medium');
    setPujaIntro(puja.intro || '');
    setPujaSignificance(puja.significance || '');
    setPujaBenefits(puja.benefits || '');
    setPujaBestTime(puja.bestTime || '');
    setPujaImage(puja.image || '');
    setPujaImageFile(null);
    setPujaImagePreview(puja.image || '');
    setPujaDeityName(puja.deityName || 'Deity');
    if (puja.items && puja.items.length > 0) {
      setPujaItems(puja.items.map(i => ({ name: i.name, quantity: i.quantity })));
    } else {
      setPujaItems([{ name: '', quantity: '' }]);
    }
    setShowAddPuja(true);
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

  const handleSavePuja = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!editingPuja;
      const url = isEditing ? `/api/pujas/${editingPuja.id}` : '/api/pujas';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        name: pujaName,
        category: pujaCategory,
        duration: pujaDuration,
        difficulty: pujaDifficulty,
        intro: pujaIntro,
        significance: pujaSignificance,
        benefits: pujaBenefits,
        bestTime: pujaBestTime,
        deityName: pujaDeityName,
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
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save puja');
      }

      const savedPuja = await response.json();

      if (isEditing) {
        setPujas(prev => prev.map(p => p.id === editingPuja.id ? { ...p, ...savedPuja } : p));
        addToast(`Puja "${pujaName}" updated successfully!`, 'success');
      } else {
        setPujas(prev => [savedPuja, ...prev]);
        setStats(prev => ({ ...prev, pujas: prev.pujas + 1 }));
        addToast(`Puja "${pujaName}" created successfully!`, 'success');
      }

      setShowAddPuja(false);
      setEditingPuja(null);
    } catch (err: any) {
      alert(err.message || 'Error saving puja');
    }
  };

  const deletePuja = async (id: string) => {
    try {
      const response = await fetch(`/api/pujas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete puja');

      setPujas((prev) => prev.filter((p) => p.id !== id));
      setStats((prev) => ({ ...prev, pujas: prev.pujas - 1 }));
      addToast('Puja deleted successfully', 'info');
    } catch (e: any) {
      alert(e.message || 'Deletion failed');
    } finally {
      setConfirmDeleteId(null);
      setDeleteType(null);
    }
  };

  // ----------------------------------------------------
  // PUJARI HANDLERS (Create / Edit / Delete)
  // ----------------------------------------------------
  const openAddPujari = () => {
    setEditingPujari(null);
    setPujariName('');
    setPujariExperience('5');
    setPujariRating('5.0');
    setPujariLanguages('Telugu, English, Sanskrit');
    setPujariSpecialization('');
    setPujariPhone('');
    setPujariWhatsapp('');
    setPujariAddress('');
    setPujariImage('');
    setPujariImageFile(null);
    setPujariImagePreview('');
    setShowAddPujari(true);
  };

  const openEditPujari = (pujari: Pujari) => {
    setEditingPujari(pujari);
    setPujariName(pujari.name);
    setPujariExperience(pujari.experience.toString());
    setPujariRating(pujari.rating ? pujari.rating.toString() : '5.0');
    setPujariLanguages(pujari.languages || 'Telugu, English');
    setPujariSpecialization(pujari.specialization || '');
    setPujariPhone(pujari.phone || '');
    setPujariWhatsapp(pujari.whatsapp || pujari.phone || '');
    setPujariAddress(pujari.address || '');
    setPujariImage(pujari.image || '');
    setPujariImageFile(null);
    setPujariImagePreview(pujari.image || '');
    setShowAddPujari(true);
  };

  const handleSavePujari = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!editingPujari;
      const url = isEditing ? `/api/pujaris/${editingPujari.id}` : '/api/pujaris';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        name: pujariName,
        experience: pujariExperience,
        rating: parseFloat(pujariRating) || 5.0,
        languages: pujariLanguages,
        specialization: pujariSpecialization,
        phone: pujariPhone,
        whatsapp: pujariWhatsapp || pujariPhone,
        lat: editingPujari?.lat || 17.4401,
        lng: editingPujari?.lng || 78.3489,
        address: pujariAddress,
        image: pujariImagePreview || pujariImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80',
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save priest profile');
      }

      const savedPujari = await response.json();

      if (isEditing) {
        setPujaris(prev => prev.map(p => p.id === editingPujari.id ? { ...p, ...savedPujari } : p));
        addToast(`Priest "${pujariName}" profile updated!`, 'success');
      } else {
        setPujaris(prev => [savedPujari, ...prev]);
        setStats(prev => ({ ...prev, pujaris: prev.pujaris + 1 }));
        addToast(`Priest "${pujariName}" registered successfully!`, 'success');
      }

      setShowAddPujari(false);
      setEditingPujari(null);
    } catch (err: any) {
      alert(err.message || 'Error saving priest');
    }
  };

  const deletePujari = async (id: string) => {
    try {
      const response = await fetch(`/api/pujaris/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete pujari');

      setPujaris((prev) => prev.filter((p) => p.id !== id));
      setStats((prev) => ({ ...prev, pujaris: prev.pujaris - 1 }));
      addToast('Priest profile removed successfully', 'info');
    } catch (e: any) {
      alert(e.message || 'Deletion failed');
    } finally {
      setConfirmDeleteId(null);
      setDeleteType(null);
    }
  };

  // ----------------------------------------------------
  // PANCHANGAM HANDLERS (Create / Edit / Delete)
  // ----------------------------------------------------
  const openAddPanchangam = () => {
    setEditingPanchangam(null);
    setPDate(new Date().toISOString().split('T')[0]);
    setPDayName('Today / నేడు');
    setPTithi('Shukla Navami');
    setPNakshatram('Uttara Ashadha');
    setPYogam('Siddha');
    setPKaranam('Kaulava');
    setPRahu('01:30 PM - 03:00 PM');
    setPYama('06:00 AM - 07:30 AM');
    setPGulika('09:00 AM - 10:30 AM');
    setPAbhijit('11:45 AM - 12:35 PM');
    setPSunrise('06:05 AM');
    setPSunset('06:12 PM');
    setPSpecialEvent('');
    setPDescription('');
    setShowAddPanchangam(true);
  };

  const openEditPanchangam = (entry: PanchangamEntry) => {
    setEditingPanchangam(entry);
    setPDate(entry.date);
    setPDayName(entry.dayName || '');
    setPTithi(entry.tithi || '');
    setPNakshatram(entry.nakshatram || '');
    setPYogam(entry.yogam || '');
    setPKaranam(entry.karanam || '');
    setPRahu(entry.rahuKalam || '');
    setPYama(entry.yamagandam || '');
    setPGulika(entry.gulikaKalam || '');
    setPAbhijit(entry.abhijitMuhurtham || '');
    setPSunrise(entry.sunrise || '06:05 AM');
    setPSunset(entry.sunset || '06:12 PM');
    setPSpecialEvent(entry.specialEvent || '');
    setPDescription(entry.description || '');
    setShowAddPanchangam(true);
  };

  const handleSavePanchangam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!editingPanchangam;
      const url = isEditing ? `/api/panchangam/${editingPanchangam.id}` : '/api/panchangam';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        date: pDate,
        dayName: pDayName,
        tithi: pTithi,
        nakshatram: pNakshatram,
        yogam: pYogam,
        karanam: pKaranam,
        rahuKalam: pRahu,
        yamagandam: pYama,
        gulikaKalam: pGulika,
        abhijitMuhurtham: pAbhijit,
        sunrise: pSunrise,
        sunset: pSunset,
        specialEvent: pSpecialEvent,
        description: pDescription,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save panchangam');
      }

      const saved = await response.json();

      if (isEditing) {
        setPanchangamList(prev => prev.map(item => item.id === editingPanchangam.id ? saved : item));
        addToast(`Panchangam for ${pDate} updated!`, 'success');
      } else {
        setPanchangamList(prev => [saved, ...prev]);
        setStats(prev => ({ ...prev, panchangam: (prev.panchangam || 0) + 1 }));
        addToast(`Panchangam for ${pDate} created!`, 'success');
      }

      setShowAddPanchangam(false);
      setEditingPanchangam(null);
    } catch (err: any) {
      alert(err.message || 'Error saving panchangam entry');
    }
  };

  const deletePanchangam = async (id: string) => {
    try {
      const response = await fetch(`/api/panchangam/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete panchangam entry');

      setPanchangamList((prev) => prev.filter((item) => item.id !== id));
      setStats((prev) => ({ ...prev, panchangam: Math.max(0, (prev.panchangam || 1) - 1) }));
      addToast('Panchangam date entry deleted', 'info');
    } catch (e: any) {
      alert(e.message || 'Deletion failed');
    } finally {
      setConfirmDeleteId(null);
      setDeleteType(null);
    }
  };

  // Filtered lists
  const filteredPujas = pujas.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(pujaSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(pujaSearch.toLowerCase()) ||
                          (p.intro && p.intro.toLowerCase().includes(pujaSearch.toLowerCase()));
    const matchesCategory = pujaCategoryFilter === 'all' || p.category.toLowerCase() === pujaCategoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const filteredPujaris = pujaris.filter(p => {
    return p.name.toLowerCase().includes(pujariSearch.toLowerCase()) ||
           p.specialization.toLowerCase().includes(pujariSearch.toLowerCase()) ||
           p.languages.toLowerCase().includes(pujariSearch.toLowerCase());
  });

  const filteredPanchangam = panchangamList.filter(p => {
    return p.date.includes(panchangamSearch) ||
           p.tithi.toLowerCase().includes(panchangamSearch.toLowerCase()) ||
           p.nakshatram.toLowerCase().includes(panchangamSearch.toLowerCase()) ||
           (p.specialEvent && p.specialEvent.toLowerCase().includes(panchangamSearch.toLowerCase()));
  });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin mx-auto" />
          <p className="font-outfit text-xs font-bold text-stone-500 uppercase tracking-wider">Syncing Admin Dashboard Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-2xl shadow-xl border text-xs font-outfit font-semibold flex items-center gap-3 pointer-events-auto transform transition-all duration-300 animate-slide-left ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500 text-amber-200'
                : 'bg-stone-900/90 border-stone-600 text-stone-200'
            }`}
          >
            <Sparkles className="h-4 w-4 flex-shrink-0 text-amber-400" />
            <span className="flex-1">{toast.message}</span>
          </div>
        ))}
      </div>

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
            <p className="font-lora text-xs text-stone-400">Complete control center to add, edit, and manage Pujas, Verified Priests, Panchangam, Bookings, and Kit Orders.</p>
            {adminUser && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-outfit border border-amber-500/30 bg-amber-500/10 text-amber-300">
                  {adminUser.email}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-outfit border border-emerald-500 bg-emerald-500/10 text-emerald-400">
                  Manager (Full Admin)
                </span>
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
        <button
          onClick={() => setActiveTab('pujas')}
          className={`p-4 rounded-2xl border text-left transition-all ${activeTab === 'pujas' ? 'bg-amber-50 border-amber-400 shadow-md' : 'bg-white border-stone-200 hover:shadow-sm'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-wider text-stone-400 font-outfit uppercase font-semibold">Total Pujas</span>
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700"><BookOpen className="h-4 w-4" /></div>
          </div>
          <span className="text-2xl font-black text-stone-850 block font-outfit mt-1">{stats.pujas}</span>
        </button>

        <button
          onClick={() => setActiveTab('pujaris')}
          className={`p-4 rounded-2xl border text-left transition-all ${activeTab === 'pujaris' ? 'bg-amber-50 border-amber-400 shadow-md' : 'bg-white border-stone-200 hover:shadow-sm'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-wider text-stone-400 font-outfit uppercase font-semibold">Verified Priests</span>
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700"><Compass className="h-4 w-4" /></div>
          </div>
          <span className="text-2xl font-black text-stone-850 block font-outfit mt-1">{stats.pujaris}</span>
        </button>

        <button
          onClick={() => setActiveTab('panchangam')}
          className={`p-4 rounded-2xl border text-left transition-all ${activeTab === 'panchangam' ? 'bg-amber-50 border-amber-400 shadow-md' : 'bg-white border-stone-200 hover:shadow-sm'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-wider text-stone-400 font-outfit uppercase font-semibold">Panchangam Records</span>
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700"><Sun className="h-4 w-4" /></div>
          </div>
          <span className="text-2xl font-black text-stone-850 block font-outfit mt-1">{stats.panchangam || panchangamList.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`p-4 rounded-2xl border text-left transition-all ${activeTab === 'bookings' ? 'bg-amber-50 border-amber-400 shadow-md' : 'bg-white border-stone-200 hover:shadow-sm'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-wider text-stone-400 font-outfit uppercase font-semibold">Total Bookings</span>
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700"><Calendar className="h-4 w-4" /></div>
          </div>
          <span className="text-2xl font-black text-stone-850 block font-outfit mt-1">{stats.bookings}</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`p-4 rounded-2xl border text-left transition-all ${activeTab === 'orders' ? 'bg-amber-50 border-amber-400 shadow-md' : 'bg-white border-stone-200 hover:shadow-sm'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-wider text-stone-400 font-outfit uppercase font-semibold">Kit Orders</span>
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700"><ShoppingBag className="h-4 w-4" /></div>
          </div>
          <span className="text-2xl font-black text-stone-850 block font-outfit mt-1">{stats.orders}</span>
        </button>
      </div>

      {/* 3. Dashboard Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-1.5 bg-stone-100 p-1.5 rounded-2xl max-w-2xl shadow-inner overflow-x-auto">
        {(['pujas', 'pujaris', 'panchangam', 'bookings', 'orders'] as const)
          .filter((tab) => adminUser && isTabAllowed(tab, adminUser.role))
          .map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-grow min-w-[110px] font-outfit text-xs font-bold py-2.5 px-3 rounded-xl transition-all capitalize flex items-center justify-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              {tab === 'pujas' && <BookOpen className="h-3.5 w-3.5" />}
              {tab === 'pujaris' && <Compass className="h-3.5 w-3.5" />}
              {tab === 'panchangam' && <Sun className="h-3.5 w-3.5" />}
              {tab === 'bookings' && <Calendar className="h-3.5 w-3.5" />}
              {tab === 'orders' && <ShoppingBag className="h-3.5 w-3.5" />}
              <span>Manage {tab === 'pujaris' ? 'Priests' : tab}</span>
            </button>
          ))}
      </div>

      {/* 4. Tab Contents Panel */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-md min-h-[450px]">

        {/* ======================================================== */}
        {/* TAB: PUJAS (View / Add / Edit / Delete)                  */}
        {/* ======================================================== */}
        {activeTab === 'pujas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-stone-850">All Spiritual Pujas ({filteredPujas.length})</h3>
                <p className="font-outfit text-xs text-stone-500">Explore, edit details, adjust samagri checklist, or create a brand new puja.</p>
              </div>
              <button
                onClick={openAddPuja}
                className="inline-flex items-center bg-amber-500 hover:bg-amber-600 text-stone-950 font-outfit font-bold text-xs tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-sm flex-shrink-0"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Add New Puja</span>
              </button>
            </div>

            {/* Search and Category Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={pujaSearch}
                  onChange={(e) => setPujaSearch(e.target.value)}
                  placeholder="Search pujas by name or description..."
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-outfit focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {['all', 'daily', 'festival', 'vratham', 'homam', 'ritual'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPujaCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-outfit font-bold uppercase transition-all whitespace-nowrap ${
                      pujaCategoryFilter === cat
                        ? 'bg-stone-900 text-amber-300'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Puja Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPujas.map((p) => (
                <div
                  key={p.id}
                  className="border border-stone-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col bg-white"
                >
                  <div className="h-36 bg-stone-100 relative overflow-hidden">
                    <img
                      src={p.image || '/images/general-puja.png'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/general-puja.png';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="bg-stone-900/85 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-sm border border-amber-500/30">
                        {p.category}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="bg-amber-500 text-stone-950 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                        {p.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-cinzel font-bold text-stone-900 text-base line-clamp-1">{p.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 font-outfit mt-1">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        <span>{p.duration}</span>
                        {p.deityName && (
                          <>
                            <span>•</span>
                            <span className="text-amber-800 font-semibold">{p.deityName}</span>
                          </>
                        )}
                      </div>
                      {p.intro && (
                        <p className="text-stone-600 text-xs font-lora line-clamp-2 mt-2">{p.intro}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openEditPuja(p)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-outfit font-bold text-xs py-2 px-3 rounded-xl transition-all"
                      >
                        <Pencil className="h-3.5 w-3.5 text-amber-700" />
                        <span>Edit Puja</span>
                      </button>

                      {confirmDeleteId === p.id && deleteType === 'puja' ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deletePuja(p.id)}
                            className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2.5 py-2 rounded-xl transition-all"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setConfirmDeleteId(null);
                              setDeleteType(null);
                            }}
                            className="bg-stone-200 text-stone-700 text-[10px] font-bold px-2 py-2 rounded-xl"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setConfirmDeleteId(p.id);
                            setDeleteType('puja');
                          }}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                          title="Delete Puja"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPujas.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 space-y-2">
                <BookOpen className="h-8 w-8 mx-auto text-stone-300" />
                <p className="font-outfit text-sm font-semibold">No pujas matched your criteria.</p>
                <button onClick={openAddPuja} className="text-amber-600 font-bold text-xs underline">Create a new puja</button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: PUJARIS (View / Add / Edit / Delete)                 */}
        {/* ======================================================== */}
        {activeTab === 'pujaris' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-stone-850">Verified Priests (Pujaris) ({filteredPujaris.length})</h3>
                <p className="font-outfit text-xs text-stone-500">Manage registered Vedic scholars, adjust contact numbers, expertise, and verified ratings.</p>
              </div>
              <button
                onClick={openAddPujari}
                className="inline-flex items-center bg-amber-500 hover:bg-amber-600 text-stone-950 font-outfit font-bold text-xs tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-sm flex-shrink-0"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Register New Priest</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={pujariSearch}
                onChange={(e) => setPujariSearch(e.target.value)}
                placeholder="Search priests by name, language, or specialization..."
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-outfit focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Priests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPujaris.map((p) => (
                <div
                  key={p.id}
                  className="border border-stone-200 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col justify-between bg-white space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80'}
                      alt={p.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300 shadow-sm flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80';
                      }}
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <strong className="block text-stone-900 font-cinzel text-base truncate">{p.name}</strong>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-outfit text-amber-700 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>{p.rating || '5.0'}</span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-600">{p.experience} Years Exp</span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-outfit truncate">{p.languages}</p>
                    </div>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-150 space-y-1.5 text-xs font-outfit">
                    <div className="flex items-center gap-2 text-stone-700">
                      <Phone className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                      <span className="font-semibold">{p.phone}</span>
                    </div>
                    {p.address && (
                      <div className="flex items-center gap-2 text-stone-500 text-[11px]">
                        <MapPin className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                        <span className="truncate">{p.address}</span>
                      </div>
                    )}
                    <div className="pt-1 text-[11px] text-amber-900 font-medium">
                      <span className="font-bold">Speciality:</span> {p.specialization}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditPujari(p)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-outfit font-bold text-xs py-2 px-3 rounded-xl transition-all"
                    >
                      <Pencil className="h-3.5 w-3.5 text-amber-700" />
                      <span>Edit Priest</span>
                    </button>

                    {confirmDeleteId === p.id && deleteType === 'pujari' ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deletePujari(p.id)}
                          className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2.5 py-2 rounded-xl transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDeleteId(null);
                            setDeleteType(null);
                          }}
                          className="bg-stone-200 text-stone-700 text-[10px] font-bold px-2 py-2 rounded-xl"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setConfirmDeleteId(p.id);
                          setDeleteType('pujari');
                        }}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                        title="Remove Priest"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredPujaris.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 space-y-2">
                <Compass className="h-8 w-8 mx-auto text-stone-300" />
                <p className="font-outfit text-sm font-semibold">No priests found.</p>
                <button onClick={openAddPujari} className="text-amber-600 font-bold text-xs underline">Register a priest</button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: PANCHANGAM (View / Add / Edit / Delete)              */}
        {/* ======================================================== */}
        {activeTab === 'panchangam' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-stone-850">Daily Vedic Panchangam Records ({filteredPanchangam.length})</h3>
                <p className="font-outfit text-xs text-stone-500">Maintain daily Tithi, Nakshatram, Rahu Kalam, Yamagandam, and festival announcements.</p>
              </div>
              <button
                onClick={openAddPanchangam}
                className="inline-flex items-center bg-amber-500 hover:bg-amber-600 text-stone-950 font-outfit font-bold text-xs tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-sm flex-shrink-0"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Add Panchangam Date</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={panchangamSearch}
                onChange={(e) => setPanchangamSearch(e.target.value)}
                placeholder="Search by date (YYYY-MM-DD), tithi, nakshatram, or festival..."
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-outfit focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Panchangam Entries List */}
            {filteredPanchangam.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPanchangam.map((p) => (
                  <div
                    key={p.id}
                    className="border border-stone-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-cinzel font-bold text-stone-900 text-lg">{p.date}</span>
                          <span className="text-xs font-outfit font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            {p.dayName}
                          </span>
                        </div>
                        {p.specialEvent && (
                          <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <span>{p.specialEvent}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right text-[11px] font-outfit text-stone-500 space-y-0.5">
                        <div>🌅 Sunrise: <strong className="text-stone-800">{p.sunrise}</strong></div>
                        <div>🌇 Sunset: <strong className="text-stone-800">{p.sunset}</strong></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-outfit bg-stone-50 p-3 rounded-xl border border-stone-150">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-bold block">Tithi</span>
                        <strong className="text-stone-850 font-semibold">{p.tithi}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-bold block">Nakshatram</span>
                        <strong className="text-stone-850 font-semibold">{p.nakshatram}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-red-500 uppercase font-bold block">Rahu Kalam</span>
                        <span className="text-red-700 font-medium">{p.rahuKalam}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-600 uppercase font-bold block">Yamagandam</span>
                        <span className="text-amber-800 font-medium">{p.yamagandam}</span>
                      </div>
                    </div>

                    {p.description && (
                      <p className="text-xs font-lora text-stone-600 italic">{p.description}</p>
                    )}

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openEditPanchangam(p)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-outfit font-bold text-xs py-2 px-3 rounded-xl transition-all"
                      >
                        <Pencil className="h-3.5 w-3.5 text-amber-700" />
                        <span>Edit Panchangam</span>
                      </button>

                      {confirmDeleteId === p.id && deleteType === 'panchangam' ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deletePanchangam(p.id)}
                            className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2.5 py-2 rounded-xl transition-all"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setConfirmDeleteId(null);
                              setDeleteType(null);
                            }}
                            className="bg-stone-200 text-stone-700 text-[10px] font-bold px-2 py-2 rounded-xl"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setConfirmDeleteId(p.id);
                            setDeleteType('panchangam');
                          }}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                          title="Delete Panchangam Date"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 space-y-2">
                <Sun className="h-8 w-8 mx-auto text-stone-300" />
                <p className="font-outfit text-sm font-semibold">No custom Panchangam entries recorded yet.</p>
                <p className="font-lora text-xs text-stone-500">The public website uses the live algorithm. Add entries here to customize specific festival dates!</p>
                <button onClick={openAddPanchangam} className="text-amber-600 font-bold text-xs underline">Add first date record</button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: BOOKINGS                                            */}
        {/* ======================================================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-cinzel text-base font-bold text-stone-850">Recent Booking Requests ({bookings.length})</h3>
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
                        <td className="px-4 py-4 font-semibold text-stone-850">{booking.puja?.name || 'Vedic Puja'}</td>
                        <td className="px-4 py-4 text-stone-600">{booking.pujari?.name || 'Assigned Priest'}</td>
                        <td className="px-4 py-4 text-stone-500">{booking.bookingDate} at {booking.bookingTime}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            booking.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-stone-200 rounded-2xl text-stone-400">
                No active booking requests registered yet.
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: ORDERS                                              */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-cinzel text-base font-bold text-stone-850">Puja Kit Delivery Orders ({orders.length})</h3>
            </div>

            {orders.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-stone-150">
                <table className="min-w-full divide-y divide-stone-200 font-outfit text-xs text-left">
                  <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3">Order ID / Date</th>
                      <th className="px-4 py-3">Customer Details</th>
                      <th className="px-4 py-3">Delivery Address</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 bg-white">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-stone-50/50">
                        <td className="px-4 py-4">
                          <span className="font-mono text-xs font-bold text-stone-700">#{order.id.slice(-6)}</span>
                          <span className="text-[10px] text-stone-400 block">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="px-4 py-4">
                          <strong className="block text-stone-850">{order.customerName}</strong>
                          <span className="text-[10px] text-stone-400">{order.customerPhone}</span>
                        </td>
                        <td className="px-4 py-4 text-stone-600 max-w-xs truncate">{order.deliveryAddress} - {order.pincode}</td>
                        <td className="px-4 py-4 font-bold text-emerald-700">₹{order.totalPrice}</td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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

      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT PUJA                                   */}
      {/* ======================================================== */}
      {showAddPuja && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-cinzel text-xl font-bold text-stone-900">
                  {editingPuja ? `Edit Puja: ${editingPuja.name}` : 'Create New Puja Manual'}
                </h3>
                <p className="font-outfit text-xs text-stone-500">Provide full ritual details and custom samagri checklist items.</p>
              </div>
              <button
                onClick={() => {
                  setShowAddPuja(false);
                  setEditingPuja(null);
                }}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePuja} className="space-y-4 font-outfit text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Puja Name *</label>
                  <input
                    type="text"
                    required
                    value={pujaName}
                    onChange={(e) => setPujaName(e.target.value)}
                    placeholder="E.g. Sri Satyanarayana Swamy Vratham"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Category *</label>
                  <select
                    value={pujaCategory}
                    onChange={(e) => setPujaCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  >
                    <option value="daily">Daily Puja</option>
                    <option value="festival">Festival Ceremony</option>
                    <option value="vratham">Vratham Guide</option>
                    <option value="homam">Sacred Homam</option>
                    <option value="ritual">Life Ritual</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Duration *</label>
                  <input
                    type="text"
                    required
                    value={pujaDuration}
                    onChange={(e) => setPujaDuration(e.target.value)}
                    placeholder="E.g. 1.5 Hours"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Difficulty *</label>
                  <select
                    value={pujaDifficulty}
                    onChange={(e) => setPujaDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  >
                    <option value="Simple">Simple</option>
                    <option value="Medium">Medium</option>
                    <option value="Complex">Complex</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Deity Name</label>
                  <input
                    type="text"
                    value={pujaDeityName}
                    onChange={(e) => setPujaDeityName(e.target.value)}
                    placeholder="E.g. Lord Ganesha, Lord Shiva"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Best Auspicious Time</label>
                  <input
                    type="text"
                    value={pujaBestTime}
                    onChange={(e) => setPujaBestTime(e.target.value)}
                    placeholder="E.g. Fridays, Karthika Masam"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase">Introduction</label>
                <textarea
                  rows={2}
                  value={pujaIntro}
                  onChange={(e) => setPujaIntro(e.target.value)}
                  placeholder="Short introductory overview of the ceremony..."
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl resize-none focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase">Significance & Benefits</label>
                <textarea
                  rows={2}
                  value={pujaSignificance}
                  onChange={(e) => setPujaSignificance(e.target.value)}
                  placeholder="Spiritual significance, mythological background, and blessings..."
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl resize-none focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              {/* Samagri Checklist */}
              <div className="space-y-2 border-t border-stone-200 pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-700 uppercase">Puja Samagri (Required Items)</label>
                  <button
                    type="button"
                    onClick={addPujaItemRow}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {pujaItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handlePujaItemChange(index, 'name', e.target.value)}
                        placeholder="Item name (e.g. Coconuts, Kumkum)"
                        className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                      />
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => handlePujaItemChange(index, 'quantity', e.target.value)}
                        placeholder="Qty (e.g. 2 pcs)"
                        className="w-28 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removePujaItemRow(index)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Input */}
              <div className="space-y-1 border-t border-stone-200 pt-3">
                <label className="font-bold text-stone-700 uppercase">Image URL or Local Path</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pujaImage}
                    onChange={(e) => {
                      setPujaImage(e.target.value);
                      setPujaImagePreview(e.target.value);
                    }}
                    placeholder="/images/general-puja.png or https://..."
                    className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                  {pujaImagePreview && (
                    <img src={pujaImagePreview} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-amber-300" />
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPuja(false);
                    setEditingPuja(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold shadow-md uppercase tracking-wider"
                >
                  {editingPuja ? 'Update Puja Details' : 'Publish Puja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT PUJARI                                 */}
      {/* ======================================================== */}
      {showAddPujari && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-cinzel text-xl font-bold text-stone-900">
                  {editingPujari ? `Edit Priest: ${editingPujari.name}` : 'Register New Priest'}
                </h3>
                <p className="font-outfit text-xs text-stone-500">Update verified contact details, years of experience, and ritual specializations.</p>
              </div>
              <button
                onClick={() => {
                  setShowAddPujari(false);
                  setEditingPujari(null);
                }}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePujari} className="space-y-4 font-outfit text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase">Priest Name *</label>
                <input
                  type="text"
                  required
                  value={pujariName}
                  onChange={(e) => setPujariName(e.target.value)}
                  placeholder="E.g. Sri Dwarakanath Sastry"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Experience (Years) *</label>
                  <input
                    type="number"
                    required
                    value={pujariExperience}
                    onChange={(e) => setPujariExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Rating (Out of 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={pujariRating}
                    onChange={(e) => setPujariRating(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase">Languages *</label>
                <input
                  type="text"
                  required
                  value={pujariLanguages}
                  onChange={(e) => setPujariLanguages(e.target.value)}
                  placeholder="Telugu, English, Sanskrit"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase">Specializations *</label>
                <input
                  type="text"
                  required
                  value={pujariSpecialization}
                  onChange={(e) => setPujariSpecialization(e.target.value)}
                  placeholder="E.g. Vivaham, Gruhapravesam, Satyanarayana Vratham"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={pujariPhone}
                    onChange={(e) => setPujariPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={pujariWhatsapp}
                    onChange={(e) => setPujariWhatsapp(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase">Temple / Residential Address *</label>
                <input
                  type="text"
                  required
                  value={pujariAddress}
                  onChange={(e) => setPujariAddress(e.target.value)}
                  placeholder="E.g. Near Shiva Temple, Madhapur, Hyderabad"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase">Profile Photo URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pujariImage}
                    onChange={(e) => {
                      setPujariImage(e.target.value);
                      setPujariImagePreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                  {pujariImagePreview && (
                    <img src={pujariImagePreview} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-amber-300" />
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPujari(false);
                    setEditingPujari(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold shadow-md uppercase tracking-wider"
                >
                  {editingPujari ? 'Save Priest Profile' : 'Register Priest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT PANCHANGAM                             */}
      {/* ======================================================== */}
      {showAddPanchangam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-cinzel text-xl font-bold text-stone-900">
                  {editingPanchangam ? `Edit Panchangam: ${editingPanchangam.date}` : 'Add Daily Panchangam Record'}
                </h3>
                <p className="font-outfit text-xs text-stone-500">Configure Tithi, Nakshatram, Rahu Kalam, and festival highlights.</p>
              </div>
              <button
                onClick={() => {
                  setShowAddPanchangam(false);
                  setEditingPanchangam(null);
                }}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePanchangam} className="space-y-4 font-outfit text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Calendar Date *</label>
                  <input
                    type="date"
                    required
                    value={pDate}
                    onChange={(e) => setPDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Day of Week *</label>
                  <input
                    type="text"
                    required
                    value={pDayName}
                    onChange={(e) => setPDayName(e.target.value)}
                    placeholder="Thursday / గురువారం"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Tithi *</label>
                  <input
                    type="text"
                    required
                    value={pTithi}
                    onChange={(e) => setPTithi(e.target.value)}
                    placeholder="Shukla Navami / శుక్ల నవమి"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Nakshatram *</label>
                  <input
                    type="text"
                    required
                    value={pNakshatram}
                    onChange={(e) => setPNakshatram(e.target.value)}
                    placeholder="Uttara Ashadha / ఉత్తరాషాఢ"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Yogam</label>
                  <input
                    type="text"
                    value={pYogam}
                    onChange={(e) => setPYogam(e.target.value)}
                    placeholder="Siddha / సిద్ధ"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Karanam</label>
                  <input
                    type="text"
                    value={pKaranam}
                    onChange={(e) => setPKaranam(e.target.value)}
                    placeholder="Kaulava / కౌలవ"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-red-600 uppercase">Rahu Kalam *</label>
                  <input
                    type="text"
                    required
                    value={pRahu}
                    onChange={(e) => setPRahu(e.target.value)}
                    placeholder="01:30 PM - 03:00 PM"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-amber-700 uppercase">Yamagandam *</label>
                  <input
                    type="text"
                    required
                    value={pYama}
                    onChange={(e) => setPYama(e.target.value)}
                    placeholder="06:00 AM - 07:30 AM"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-emerald-700 uppercase">Abhijit Muhurtham (Auspicious)</label>
                  <input
                    type="text"
                    value={pAbhijit}
                    onChange={(e) => setPAbhijit(e.target.value)}
                    placeholder="11:45 AM - 12:35 PM"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Gulika Kalam</label>
                  <input
                    type="text"
                    value={pGulika}
                    onChange={(e) => setPGulika(e.target.value)}
                    placeholder="09:00 AM - 10:30 AM"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Sunrise</label>
                  <input
                    type="text"
                    value={pSunrise}
                    onChange={(e) => setPSunrise(e.target.value)}
                    placeholder="06:05 AM"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase">Sunset</label>
                  <input
                    type="text"
                    value={pSunset}
                    onChange={(e) => setPSunset(e.target.value)}
                    placeholder="06:12 PM"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-amber-800 uppercase">Special Festival or Event Highlight</label>
                <input
                  type="text"
                  value={pSpecialEvent}
                  onChange={(e) => setPSpecialEvent(e.target.value)}
                  placeholder="E.g. Vijaya Dashami / Maha Shivaratri / Ekadashi"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase">Spiritual Significance / Description</label>
                <textarea
                  rows={2}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  placeholder="Special rituals, deities to worship, or fasting guidance for this day..."
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl resize-none focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPanchangam(false);
                    setEditingPanchangam(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold shadow-md uppercase tracking-wider"
                >
                  {editingPanchangam ? 'Update Panchangam' : 'Save Panchangam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
