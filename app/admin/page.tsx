'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
  Package,
  ShoppingBag,
  FileText,
  Settings,
  LogOut,
  Plus,
  RefreshCw,
  Home,
  Check,
  Award,
  Trash2,
  Globe,
  Truck,
  CreditCard,
  Menu,
  X,
  ChevronRight,
  User,
  Edit3,
  Upload,
  Eye,
  EyeOff,
  AlertCircle,
  Copy,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionUser } from '@/types/auth';
import { Vendor, VendorStatus } from '@/types/vendor';
import { Product, SolutionCategoryItem } from '@/types/product';
import { Order } from '@/types/order';
import { QuotationRequest } from '@/types/quotation';
import { PlatformSettings, EligiblePincodeRule } from '@/types/settings';
import { Certification } from '@/types/certification';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [activeTab, setActiveTab] = useState<'vendors' | 'products' | 'orders' | 'quotations' | 'settings' | 'certifications'>('vendors');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Certification Form Modal
  const [showCertModal, setShowCertModal] = useState(false);
  const [newCertData, setNewCertData] = useState({
    title: '',
    issuingAuthority: '',
    certificateNumber: '',
    description: '',
    categoryScope: 'General Power Backup Standards',
    validFrom: '',
    validUntil: '',
    status: 'active' as const,
    isPublished: true,
    imageUrl: '/images/cert-iso.jpg',
  });

  // Edit Certification Form Modal
  const [editingCert, setEditingCert] = useState<Certification | null>(null);

  // New PIN code entry state under settings
  const [newPincode, setNewPincode] = useState('');
  const [newDistrict, setNewDistrict] = useState('Hyderabad');
  const [newFee, setNewFee] = useState(350);

  // New Vendor Form Modal
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showVendorPassword, setShowVendorPassword] = useState(false);
  const [vendorErrors, setVendorErrors] = useState<Record<string, string>>({});
  const [vendorModalError, setVendorModalError] = useState<string | null>(null);

  // Cert Form Errors
  const [certErrors, setCertErrors] = useState<Record<string, string>>({});
  const [certModalError, setCertModalError] = useState<string | null>(null);

  // Edit Cert Form Errors
  const [editCertErrors, setEditCertErrors] = useState<Record<string, string>>({});
  const [editCertModalError, setEditCertModalError] = useState<string | null>(null);

  // Settings Errors
  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({});

  // Categories / Solutions state
  const [categories, setCategories] = useState<SolutionCategoryItem[]>([]);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newCategoryError, setNewCategoryError] = useState<string | null>(null);

  // Vendor Credentials Dispatch Modal
  const [createdCredentials, setCreatedCredentials] = useState<{
    businessName: string;
    email: string;
    temporaryPassword: string;
    allowedCategories: string[];
    commissionRate: number;
    loginUrl: string;
  } | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // Vendor Delete Confirmation Modal
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  // Vendor Commission Edit Modal
  const [editingVendorCommission, setEditingVendorCommission] = useState<Vendor | null>(null);
  const [editCommissionValue, setEditCommissionValue] = useState<string>('');

  const [newVendorData, setNewVendorData] = useState({
    businessName: '',
    tradeName: '',
    registrationNumber: '',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    commissionRate: '' as unknown as number,
    allowedCategories: ['inverters', 'batteries'] as string[],
    address: {
      line1: '',
      city: 'Secunderabad',
      district: 'Hyderabad',
      state: 'India',
      pincode: '500009',
    },
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const reloadData = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Verify auth session on mount
  useEffect(() => {
    let ignore = false;
    async function verifySession() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (ignore) return;
        if (!res.ok || !data.authenticated || (data.user.role !== 'super_admin' && data.user.role !== 'admin')) {
          router.push('/admin/login');
          return;
        }
        setCurrentUser(data.user);
      } catch {
        if (!ignore) {
          router.push('/admin/login');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    verifySession();
    return () => {
      ignore = true;
    };
  }, [router]);

  // Synchronize Tab Data
  useEffect(() => {
    if (!currentUser) return;
    let ignore = false;

    async function fetchTabData() {
      try {
        // Always load solution categories
        const catRes = await fetch('/api/admin/categories');
        const catData = await catRes.json();
        if (!ignore && catData.categories) setCategories(catData.categories);

        if (activeTab === 'vendors') {
          const res = await fetch('/api/admin/vendors');
          const data = await res.json();
          if (!ignore && data.vendors) setVendors(data.vendors);
        } else if (activeTab === 'products') {
          const res = await fetch('/api/vendor/products');
          const data = await res.json();
          if (!ignore && data.products) setProducts(data.products);
        } else if (activeTab === 'orders') {
          const res = await fetch('/api/orders');
          const data = await res.json();
          if (!ignore && data.orders) setOrders(data.orders);
        } else if (activeTab === 'quotations') {
          const res = await fetch('/api/quotations');
          const data = await res.json();
          if (!ignore && data.quotations) setQuotations(data.quotations);
        } else if (activeTab === 'settings') {
          const res = await fetch('/api/admin/settings');
          const data = await res.json();
          if (!ignore && data.settings) setSettings(data.settings);
        } else if (activeTab === 'certifications') {
          const res = await fetch('/api/admin/certifications');
          const data = await res.json();
          if (!ignore && data.certifications) setCertifications(data.certifications);
        }
      } catch (e) {
        console.error('Data load error:', e);
      }
    }

    fetchTabData();
    return () => {
      ignore = true;
    };
  }, [currentUser, activeTab, refreshKey]);

  // Certifications CRUD Handlers
  const handleCreateCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertModalError(null);
    const errs: Record<string, string> = {};

    if (!newCertData.title.trim()) {
      errs.title = 'Certification title is required';
    }
    if (!newCertData.issuingAuthority.trim()) {
      errs.issuingAuthority = 'Issuing authority is required';
    }
    if (!newCertData.certificateNumber.trim()) {
      errs.certificateNumber = 'Certificate number is required';
    }
    if (!newCertData.validFrom) {
      errs.validFrom = 'Valid From date is required';
    }

    if (Object.keys(errs).length > 0) {
      setCertErrors(errs);
      setCertModalError('Please fill in all required certification fields.');
      return;
    }

    try {
      const res = await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCertData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: 'Equipment certification added and published successfully!' });
      setShowCertModal(false);
      setCertErrors({});
      setCertModalError(null);
      setNewCertData({
        title: '',
        issuingAuthority: '',
        certificateNumber: '',
        description: '',
        categoryScope: 'General Power Backup Standards',
        validFrom: '',
        validUntil: '',
        status: 'active',
        isPublished: true,
        imageUrl: '/images/cert-iso.jpg',
      });
      reloadData();
    } catch (err) {
      setCertModalError(err instanceof Error ? err.message : 'Failed to add certification');
    }
  };

  const handleUpdateCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;
    setEditCertModalError(null);
    const errs: Record<string, string> = {};

    if (!editingCert.title.trim()) {
      errs.title = 'Certification title is required';
    }
    if (!editingCert.issuingAuthority.trim()) {
      errs.issuingAuthority = 'Issuing authority is required';
    }
    if (!editingCert.certificateNumber.trim()) {
      errs.certificateNumber = 'Certificate number is required';
    }
    if (!editingCert.validFrom) {
      errs.validFrom = 'Valid From date is required';
    }

    if (Object.keys(errs).length > 0) {
      setEditCertErrors(errs);
      setEditCertModalError('Please fill in all required fields.');
      return;
    }

    try {
      const res = await fetch('/api/admin/certifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCert),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: `Certification "${editingCert.title}" updated successfully in database!` });
      setEditingCert(null);
      setEditCertErrors({});
      setEditCertModalError(null);
      reloadData();
    } catch (err) {
      setEditCertModalError(err instanceof Error ? err.message : 'Failed to update certification');
    }
  };

  const toggleCertificationPublish = async (id: string, currentPublished: boolean) => {
    try {
      const res = await fetch('/api/admin/certifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPublished: !currentPublished }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: `Certification is now ${!currentPublished ? 'Published' : 'Unpublished'}` });
      reloadData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Action failed' });
    }
  };

  const handleDeleteCertification = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete certification "${title}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/certifications?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: 'Certification record deleted successfully' });
      reloadData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Delete failed' });
    }
  };

  // PIN Code Serviceability Rule Handlers
  const handleAddPincodeRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !newPincode || newPincode.trim().length !== 6) {
      setMessage({ type: 'error', text: 'Valid 6-digit PIN code is required' });
      return;
    }

    const pin = newPincode.trim();
    const existing = settings.eligiblePincodes || [];
    if (existing.some((r) => r.pincode === pin)) {
      setMessage({ type: 'error', text: `PIN code ${pin} is already configured.` });
      return;
    }

    const newRule: EligiblePincodeRule = {
      pincode: pin,
      district: newDistrict.trim() || 'Secunderabad',
      state: 'India',
      deliveryFeeINR: Number(newFee) || 0,
      active: true,
      notes: 'Added via Administration Desk',
    };

    setSettings({
      ...settings,
      eligiblePincodes: [...existing, newRule],
    });
    setNewPincode('');
    setMessage({ type: 'success', text: `Added PIN ${pin}. Click "Save Platform Policies" to persist changes.` });
  };

  const handleTogglePincodeRule = (pincode: string) => {
    if (!settings) return;
    const updated = (settings.eligiblePincodes || []).map((r) =>
      r.pincode === pincode ? { ...r, active: !r.active } : r
    );
    setSettings({ ...settings, eligiblePincodes: updated });
  };

  const handleDeletePincodeRule = (pincode: string) => {
    if (!settings) return;
    const updated = (settings.eligiblePincodes || []).filter((r) => r.pincode !== pincode);
    setSettings({ ...settings, eligiblePincodes: updated });
    setMessage({ type: 'success', text: `Removed PIN ${pincode}. Remember to save policies.` });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // Vendor status update ('active' | 'inactive' | 'suspended' | 'blocked')
  const handleUpdateVendorStatus = async (vendorId: string, status: VendorStatus) => {
    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: `Vendor status updated to ${status.toUpperCase()}` });
      reloadData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Action failed' });
    }
  };

  // Delete vendor account and credentials
  const handleDeleteVendor = async (vendorId: string) => {
    try {
      const res = await fetch(`/api/admin/vendors?vendorId=${vendorId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: 'Vendor account and credentials successfully deleted' });
      setVendorToDelete(null);
      reloadData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Delete failed' });
    }
  };

  // Create new solution category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setNewCategoryError('Category / solution name is required');
      return;
    }
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDesc.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCategories((prev) => [...prev, data.category]);
      setNewVendorData((prev) => ({
        ...prev,
        allowedCategories: [...prev.allowedCategories, data.category.id],
      }));
      setShowNewCategoryModal(false);
      setNewCategoryName('');
      setNewCategoryDesc('');
      setNewCategoryError(null);
      setMessage({ type: 'success', text: `Solution "${data.category.name}" created and assigned!` });
    } catch (err) {
      setNewCategoryError(err instanceof Error ? err.message : 'Failed to create solution');
    }
  };

  // Create Vendor
  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setVendorModalError(null);
    const errs: Record<string, string> = {};

    if (!newVendorData.businessName.trim() || newVendorData.businessName.trim().length < 2) {
      errs.businessName = 'Business legal name is required (min 2 characters)';
    }
    if (!newVendorData.contactPerson.trim() || newVendorData.contactPerson.trim().length < 2) {
      errs.contactPerson = 'Contact person name is required';
    }
    const cleanPhone = newVendorData.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      errs.phone = 'Phone must be exactly 10 digits';
    } else if (!/^[6-9]/.test(cleanPhone)) {
      errs.phone = 'Phone must start with 6, 7, 8, or 9';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newVendorData.email.trim()) {
      errs.email = 'Login email is required';
    } else if (!emailRegex.test(newVendorData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!newVendorData.password) {
      errs.password = 'Initial password is required';
    } else if (newVendorData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!newVendorData.allowedCategories || newVendorData.allowedCategories.length === 0) {
      errs.allowedCategories = 'Please select at least one authorized solution category';
    }

    if (!newVendorData.address.city.trim()) {
      errs.city = 'City is required';
    }

    const cleanPin = newVendorData.address.pincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      errs.pincode = 'PIN code must be exactly 6 digits';
    }

    if (newVendorData.commissionRate === ('' as unknown) || newVendorData.commissionRate === undefined || isNaN(Number(newVendorData.commissionRate))) {
      errs.commissionRate = 'Commission rate % is required (enter 0 for 0%)';
    } else if (Number(newVendorData.commissionRate) < 0 || Number(newVendorData.commissionRate) > 100) {
      errs.commissionRate = 'Commission rate must be between 0% and 100%';
    }

    if (Object.keys(errs).length > 0) {
      setVendorErrors(errs);
      setVendorModalError('Please correct the highlighted validation errors below.');
      return;
    }

    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newVendorData,
          commissionRate: Number(newVendorData.commissionRate),
          phone: cleanPhone,
          address: {
            ...newVendorData.address,
            pincode: cleanPin,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      setCreatedCredentials({
        businessName: newVendorData.businessName,
        email: newVendorData.email,
        temporaryPassword: newVendorData.password,
        allowedCategories: newVendorData.allowedCategories,
        commissionRate: Number(newVendorData.commissionRate),
        loginUrl: `${origin}/vendor/login`,
      });

      setShowVendorModal(false);
      setShowVendorPassword(false);
      setVendorErrors({});
      setVendorModalError(null);
      setNewVendorData({
        businessName: '',
        tradeName: '',
        registrationNumber: '',
        contactPerson: '',
        email: '',
        phone: '',
        password: '',
        commissionRate: '' as unknown as number,
        allowedCategories: ['inverters', 'batteries'],
        address: {
          line1: '',
          city: 'Secunderabad',
          district: 'Hyderabad',
          state: 'India',
          pincode: '500009',
        },
      });
      reloadData();
    } catch (err) {
      setVendorModalError(err instanceof Error ? err.message : 'Failed to create vendor');
    }
  };

  // Update existing vendor commission rate
  const handleUpdateVendorCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendorCommission) return;
    const num = Number(editCommissionValue);
    if (isNaN(num) || num < 0 || num > 100) {
      alert('Please enter a valid commission percentage between 0% and 100%');
      return;
    }
    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: editingVendorCommission.id,
          commissionRate: num,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({
        type: 'success',
        text: `Commission rate updated to ${num}% for ${editingVendorCommission.businessName}`,
      });
      setEditingVendorCommission(null);
      reloadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update commission rate');
    }
  };

  // Update Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const errs: Record<string, string> = {};

    if (settings.defaultVendorCommissionPercent < 0 || settings.defaultVendorCommissionPercent > 100) {
      errs.commission = 'Commission rate must be between 0% and 100%';
    }
    if (settings.flatDeliveryFeeINR < 0) {
      errs.deliveryFee = 'Delivery fee cannot be negative';
    }
    if (settings.minimumOrderValueForFreeDeliveryINR < 0) {
      errs.freeDelivery = 'Free delivery threshold cannot be negative';
    }
    if (settings.settlementHoldPeriodDays < 0) {
      errs.holdPeriod = 'Settlement hold period cannot be negative';
    }
    if (settings.customerCancellationWindowMinutes < 0) {
      errs.cancelWindow = 'Cancellation window cannot be negative';
    }

    if (Object.keys(errs).length > 0) {
      setSettingsErrors(errs);
      setMessage({ type: 'error', text: 'Please correct the highlighted policy configuration errors.' });
      return;
    }
    setSettingsErrors({});

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: 'Platform policies successfully updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Save failed' });
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#142B55] mb-2" />
        <p className="text-sm font-semibold">Loading Admin Dashboard...</p>
      </div>
    );
  }

  const pageMeta: Record<string, { title: string; subtitle: string; category: string }> = {
    vendors: {
      title: 'Vendors Directory & Provisioning',
      subtitle: 'Manage authorized vendor accounts, commission rates, and operational statuses across all regions.',
      category: 'Operations',
    },
    products: {
      title: 'Products Oversight & Stock',
      subtitle: 'Review cross-vendor catalog inventory, pure sine inverters, tubular batteries, and live stock allocations.',
      category: 'Operations',
    },
    orders: {
      title: 'Customer Orders Management',
      subtitle: 'Track guest & customer orders, delivery fees, payment states, and vendor-isolated order fulfillment.',
      category: 'Operations',
    },
    quotations: {
      title: 'WhatsApp Quotations & Sizing',
      subtitle: 'Review incoming customer load calculations, technical inquiries, and assigned vendor quote statuses.',
      category: 'Operations',
    },
    certifications: {
      title: 'Technical Compliance & Standards',
      subtitle: 'Publish, manage, and verify official BIS, ISO 9001, and environmental compliance credentials for equipment.',
      category: 'Governance',
    },
    settings: {
      title: 'Platform Policies & Delivery PINs',
      subtitle: 'Configure regional delivery serviceability, district dispatch fees, and platform-wide inventory thresholds.',
      category: 'Governance',
    },
  };

  return (
    <div className="bg-[#F3F5F8] min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Top App Bar */}
      <div className="lg:hidden bg-[#0B172F] text-white px-4 py-3.5 border-b border-[#142B55] flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="bg-white p-1 rounded-lg shrink-0">
            <Image
              src="/images/rps-logo.png"
              alt="RPS Logo"
              width={80}
              height={24}
              className="h-6 w-auto object-contain"
              priority
            />
          </div>
          <div>
            <span className="font-extrabold text-xs tracking-wider uppercase text-white block">
              RPS Admin
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              {pageMeta[activeTab]?.title}
            </span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen max-h-screen self-start w-72 bg-[#0B172F] text-white border-r border-[#142B55] flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out shrink-0 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-slate-800 bg-[#091326]">
          <div className="flex items-center justify-between">
            <div className="bg-white p-2 rounded-xl shadow-xs inline-block">
              <Image
                src="/images/rps-logo.png"
                alt="RPS Logo"
                width={130}
                height={38}
                className="h-7 w-auto object-contain"
                priority
              />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                Administrative Desk
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Operations Network
              </span>
            </div>
            <Badge variant={currentUser?.role === 'super_admin' ? 'red' : 'navy'}>
              {currentUser?.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
            </Badge>
          </div>
        </div>

        {/* Sidebar Navigation Items with Clear Page Names */}
        <nav className="p-4 space-y-6 flex-1">
          {/* Section 1: Operations */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Operations &amp; Sales
            </span>

            <button
              onClick={() => { setActiveTab('vendors'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'vendors'
                  ? 'bg-[#D52B30] text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4" />
                <span>Vendors Directory</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'vendors' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {vendors.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#D52B30] text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Products Oversight</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#D52B30] text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Customer Orders</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('quotations'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'quotations'
                  ? 'bg-[#D52B30] text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Quotations Routing</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'quotations' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {quotations.length}
              </span>
            </button>
          </div>

          {/* Section 2: Governance & Settings */}
          <div className="space-y-1 pt-3 border-t border-slate-800/80">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Compliance &amp; Settings
            </span>

            <button
              onClick={() => { setActiveTab('certifications'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'certifications'
                  ? 'bg-[#D52B30] text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4" />
                <span>Certifications &amp; BIS</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'certifications' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {certifications.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#D52B30] text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Policies &amp; Delivery PINs</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'settings' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {settings?.eligiblePincodes?.length || 0}
              </span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer: User Details, Storefront link, and Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-[#081122]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-4 h-4 text-slate-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate font-mono">
                {currentUser?.email}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <Link
              href="/"
              target="_blank"
              className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Bar with Breadcrumbs & Current Page Info */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Admin Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-[#142B55] uppercase tracking-wide">
                {pageMeta[activeTab]?.category}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#D52B30] font-bold">
                {pageMeta[activeTab]?.title}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-[#142B55] mt-1">
              {pageMeta[activeTab]?.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {pageMeta[activeTab]?.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={reloadData}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#142B55]" />
              <span>Refresh Data</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#142B55] hover:bg-[#0B172F] text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </Link>
          </div>
        </header>

        {/* Content Container */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {/* Flash notification */}
          {message && (
            <div
              className={`p-4 rounded-xl mb-6 flex items-center justify-between text-xs sm:text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="font-bold underline ml-4 cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

        {/* TAB 1: VENDORS MANAGEMENT */}
        {activeTab === 'vendors' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-[#142B55]">Registered Vendors</h2>
                <p className="text-xs text-slate-500">
                  Vendors must be explicitly provisioned by Super Admin / Admin. Public self-registration is disabled.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowVendorModal(true)}
                icon={<Plus className="w-4 h-4" />}
                className="bg-[#D52B30] hover:bg-[#B51E22] text-white"
              >
                Provision New Vendor
              </Button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Business &amp; Trade Name</th>
                      <th className="py-3.5 px-4">Authorized Solutions</th>
                      <th className="py-3.5 px-4">Contact Person</th>
                      <th className="py-3.5 px-4">Email &amp; Phone</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Commission %</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {vendors.map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-[#142B55] block">{vendor.businessName}</span>
                          <span className="text-[11px] text-slate-400">ID: {vendor.id}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {vendor.allowedCategories && vendor.allowedCategories.length > 0 ? (
                              vendor.allowedCategories.map((catId) => (
                                <span
                                  key={catId}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-[#142B55] border border-blue-200 capitalize"
                                >
                                  {catId}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">All Solutions</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium">{vendor.contactPerson}</td>
                        <td className="py-3.5 px-4">
                          <span className="block">{vendor.email}</span>
                          <span className="text-slate-400">{vendor.phone}</span>
                        </td>
                        <td className="py-3.5 px-4">{vendor.address.city}, {vendor.address.state}</td>
                        <td className="py-3.5 px-4 font-semibold text-[#142B55]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs">{vendor.commissionRate !== undefined ? `${vendor.commissionRate}%` : 'Not Set'}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingVendorCommission(vendor);
                                setEditCommissionValue(vendor.commissionRate !== undefined ? String(vendor.commissionRate) : '');
                              }}
                              title="Edit Commission %"
                              className="text-slate-400 hover:text-[#142B55] hover:bg-slate-200 p-1 rounded-md transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {vendor.status === 'active' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              Active
                            </span>
                          )}
                          {vendor.status === 'inactive' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                              Inactive
                            </span>
                          )}
                          {(vendor.status === 'suspended' || vendor.status === 'blocked') && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                              Blocked
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {vendor.status === 'active' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateVendorStatus(vendor.id, 'inactive')}
                                  title="Mark Inactive"
                                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                                >
                                  Deactivate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateVendorStatus(vendor.id, 'blocked')}
                                  title="Block Access"
                                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                                >
                                  Block
                                </button>
                              </>
                            ) : vendor.status === 'inactive' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateVendorStatus(vendor.id, 'active')}
                                  title="Activate Vendor"
                                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                                >
                                  Activate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateVendorStatus(vendor.id, 'blocked')}
                                  title="Block Access"
                                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                                >
                                  Block
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUpdateVendorStatus(vendor.id, 'active')}
                                title="Unblock & Activate"
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                              >
                                Unblock
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setVendorToDelete(vendor)}
                              title="Delete Vendor Account"
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS OVERSIGHT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#142B55]">Catalog Products Across All Vendors</h2>
                <p className="text-xs text-slate-500">
                  Products are published immediately upon server validation. Note: Editing vendor price requires `edit_vendor_prices` permission.
                </p>
              </div>
              <Badge variant="navy">Total: {products.length} Products</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider">{p.brand}</span>
                    <Badge variant={p.stock && p.stock > 0 ? 'success' : 'warning'}>
                      Stock: {p.stock ?? 0}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{p.name}</h3>

                  <div className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Category:</span>
                      <span className="font-medium text-slate-800">{p.categoryName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vendor:</span>
                      <span className="font-bold text-[#142B55]">{p.vendorName || p.vendorId}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-500 font-semibold">Vendor Price:</span>
                      <span className="font-extrabold text-[#D52B30]">₹{p.price?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-[#142B55]">Multi-Vendor Customer Orders</h2>
              <p className="text-xs text-slate-500">
                Each order contains items fulfilled by individual vendors. Historical prices and commissions are permanently frozen on each item.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                No orders recorded in this development session yet. You can place an order via `/api/orders` to verify atomic multi-vendor fulfillment!
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div>
                        <span className="font-bold text-sm text-[#142B55] block">{ord.orderNumber}</span>
                        <span className="text-xs text-slate-400">Placed on: {new Date(ord.createdAt).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="navy">{ord.orderStatus.toUpperCase()}</Badge>
                        <Badge variant={ord.paymentStatus === 'paid' ? 'success' : 'warning'}>
                          PAYMENT: {ord.paymentStatus.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      <strong>Customer:</strong> {ord.customer.fullName} • {ord.customer.phone} • {ord.customer.city}, {ord.customer.state}
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Multi-Vendor Order Items:</span>
                      {ord.items.map((item) => (
                        <div key={item.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block">{item.productName} (x{item.quantity})</span>
                            <span className="text-slate-500">Vendor: {item.vendorName} • Unit Price: ₹{item.unitPrice.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-[#142B55] block">₹{item.totalPrice.toLocaleString('en-IN')}</span>
                            <Badge variant={item.fulfilmentStatus === 'delivered' ? 'success' : 'warning'}>
                              {item.fulfilmentStatus}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-right text-xs pt-2 border-t border-slate-100">
                      Total Order Value: <strong className="text-base text-[#D52B30] font-extrabold">₹{ord.totalAmount.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: QUOTATIONS ROUTING */}
        {activeTab === 'quotations' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-[#142B55]">Customer Quotation Requests</h2>
              <p className="text-xs text-slate-500">
                Quotation enquiries are routed to assigned vendors based on equipment category and customer delivery location.
              </p>
            </div>

            {quotations.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                No quotation requests logged yet. Use the homepage WhatsApp Formulator or POST to `/api/quotations`.
              </div>
            ) : (
              <div className="space-y-4">
                {quotations.map((q) => (
                  <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="font-bold text-sm text-[#142B55]">{q.quotationNumber}</span>
                      <Badge variant="navy">{q.status.toUpperCase()}</Badge>
                    </div>
                    <div>
                      <strong>Customer:</strong> {q.customerName} ({q.customerPhone}) • Location: {q.cityOrDistrict}
                    </div>
                    <div>
                      <strong>Category:</strong> {q.category} {q.productName && `• Product: ${q.productName}`}
                    </div>
                    <div className="text-slate-500">
                      <strong>Assigned Vendors:</strong> {q.assignedVendorIds.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PLATFORM POLICIES */}
        {activeTab === 'settings' && settings && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#142B55]">Configurable Platform Policies &amp; Fees</h2>
              <p className="text-xs text-slate-500">
                All business policies are kept fully configurable per Phase 2 requirements (no hardcoded rates).
              </p>
            </div>

            <form onSubmit={handleSaveSettings} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Default Vendor Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.defaultVendorCommissionPercent}
                    onChange={(e) => {
                      setSettings({ ...settings, defaultVendorCommissionPercent: parseFloat(e.target.value) || 0 });
                      if (settingsErrors.commission) setSettingsErrors((p) => ({ ...p, commission: '' }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-sm transition-colors ${
                      settingsErrors.commission ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white'
                    }`}
                  />
                  {settingsErrors.commission && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{settingsErrors.commission}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Flat Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.flatDeliveryFeeINR || 0}
                    onChange={(e) => {
                      setSettings({ ...settings, flatDeliveryFeeINR: parseInt(e.target.value) || 0 });
                      if (settingsErrors.deliveryFee) setSettingsErrors((p) => ({ ...p, deliveryFee: '' }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-sm transition-colors ${
                      settingsErrors.deliveryFee ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white'
                    }`}
                  />
                  {settingsErrors.deliveryFee && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{settingsErrors.deliveryFee}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Free Delivery Threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.minimumOrderValueForFreeDeliveryINR || 0}
                    onChange={(e) => {
                      setSettings({ ...settings, minimumOrderValueForFreeDeliveryINR: parseInt(e.target.value) || 0 });
                      if (settingsErrors.freeDelivery) setSettingsErrors((p) => ({ ...p, freeDelivery: '' }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-sm transition-colors ${
                      settingsErrors.freeDelivery ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white'
                    }`}
                  />
                  {settingsErrors.freeDelivery && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{settingsErrors.freeDelivery}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Settlement Hold Period (Days)
                  </label>
                  <input
                    type="number"
                    value={settings.settlementHoldPeriodDays}
                    onChange={(e) => {
                      setSettings({ ...settings, settlementHoldPeriodDays: parseInt(e.target.value) || 0 });
                      if (settingsErrors.holdPeriod) setSettingsErrors((p) => ({ ...p, holdPeriod: '' }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-sm transition-colors ${
                      settingsErrors.holdPeriod ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white'
                    }`}
                  />
                  {settingsErrors.holdPeriod && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{settingsErrors.holdPeriod}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Customer Cancellation Window (Minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.customerCancellationWindowMinutes}
                    onChange={(e) => {
                      setSettings({ ...settings, customerCancellationWindowMinutes: parseInt(e.target.value) || 0 });
                      if (settingsErrors.cancelWindow) setSettingsErrors((p) => ({ ...p, cancelWindow: '' }));
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-sm transition-colors ${
                      settingsErrors.cancelWindow ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white'
                    }`}
                  />
                  {settingsErrors.cancelWindow && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{settingsErrors.cancelWindow}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Return Window (Days)
                  </label>
                  <input
                    type="number"
                    value={settings.returnWindowDays}
                    onChange={(e) => setSettings({ ...settings, returnWindowDays: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Payment Methods Configuration */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#142B55]" />
                  <span>Customer Payment Method Eligibility</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.codEnabled}
                      onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                      className="w-4 h-4 text-[#142B55] rounded"
                    />
                    <span className="font-semibold text-slate-800">Allow Cash on Delivery (COD)</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.onlinePaymentEnabled}
                      onChange={(e) => setSettings({ ...settings, onlinePaymentEnabled: e.target.checked })}
                      className="w-4 h-4 text-[#142B55] rounded"
                    />
                    <span className="font-semibold text-slate-800">Allow Online Payment Gateway</span>
                  </label>
                </div>
              </div>

              {/* Serviceable Eligible Delivery PIN Codes Manager */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#D52B30]" />
                      <span>Eligible Delivery PIN Codes (Serviceable Regions)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Super Admin retains platform control over serviceable PIN codes and custom zone delivery fees.
                    </p>
                  </div>
                  <Badge variant="navy">{(settings.eligiblePincodes || []).length} PINs Configured</Badge>
                </div>

                {/* Add PIN Rule Inline Form */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="6-digit PIN"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="District (e.g. Hyderabad)"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-36 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Fee (₹):</span>
                    <input
                      type="number"
                      value={newFee}
                      onChange={(e) => setNewFee(Number(e.target.value))}
                      className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddPincodeRule}
                    className="text-xs font-semibold bg-white"
                  >
                    Add PIN Rule
                  </Button>
                </div>

                {/* List of Configured PIN Codes */}
                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                  {(settings.eligiblePincodes || []).map((rule) => (
                    <div key={rule.pincode} className="p-2.5 flex items-center justify-between bg-white hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <code className="font-bold text-[#142B55] bg-slate-100 px-1.5 py-0.5 rounded">
                          {rule.pincode}
                        </code>
                        <span className="text-slate-700 font-medium">{rule.district}, {rule.state}</span>
                        <span className="text-slate-500">• Fee: ₹{rule.deliveryFeeINR}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePincodeRule(rule.pincode)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                            rule.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {rule.active ? 'ACTIVE' : 'SUSPENDED'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePincodeRule(rule.pincode)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          aria-label="Remove PIN rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white"
                  icon={<Check className="w-4 h-4" />}
                >
                  Save Platform Policies
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: CERTIFICATIONS & STANDARDS */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-[#142B55]">Verified Equipment Certifications</h2>
                <p className="text-xs text-slate-500">
                  Manage official ISO, BIS, and TSPCB compliance credentials displayed in the public storefront gallery.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCertModal(true)}
                icon={<Plus className="w-4 h-4" />}
                className="bg-[#D52B30] hover:bg-[#B51E22] text-white"
              >
                Add Certification
              </Button>
            </div>

            {certifications.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                No equipment certifications recorded yet. Click &quot;Add Certification&quot; to publish verified credentials.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div>
                      {/* Certificate Image Banner */}
                      {cert.imageUrl ? (
                        <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center h-32 relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cert.imageUrl}
                            alt={cert.title}
                            className="w-full h-full object-contain p-2"
                          />
                          <a
                            href={cert.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition-opacity"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Full Image</span>
                          </a>
                        </div>
                      ) : (
                        <div className="mb-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center h-24 text-slate-400 text-xs">
                          <Award className="w-5 h-5 mr-1.5 text-slate-400" />
                          <span>No Image Attached</span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D52B30]">
                          {cert.categoryScope}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cert.isPublished
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {cert.isPublished ? 'PUBLISHED' : 'DRAFT'}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{cert.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{cert.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                      <div>
                        <strong>Authority:</strong> {cert.issuingAuthority}
                      </div>
                      <div>
                        <strong>Cert No:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-[#142B55]">{cert.certificateNumber}</code>
                      </div>
                      <div>
                        <strong>Valid:</strong> {cert.validFrom} to {cert.validUntil || 'Indefinite'}
                      </div>

                      <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingCert({ ...cert })}
                            className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-[#142B55] hover:bg-blue-100 font-semibold cursor-pointer flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleCertificationPublish(cert.id, cert.isPublished)}
                            className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 font-semibold cursor-pointer"
                          >
                            {cert.isPublished ? 'Unpublish' : 'Publish'}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCertification(cert.id, cert.title)}
                          className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* PROVISION VENDOR MODAL */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#142B55]">Provision New Vendor Account</h3>
                <p className="text-xs text-slate-500">Creates vendor record &amp; initial portal access credentials</p>
              </div>
              <button
                onClick={() => setShowVendorModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVendor} noValidate className="space-y-3.5 text-xs">
              {vendorModalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{vendorModalError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Legal Name *
                </label>
                <input
                  type="text"
                  placeholder="E.g. Apex Power Systems Pvt Ltd"
                  value={newVendorData.businessName}
                  onChange={(e) => {
                    setNewVendorData({ ...newVendorData, businessName: e.target.value });
                    if (vendorErrors.businessName) setVendorErrors((p) => ({ ...p, businessName: '' }));
                  }}
                  className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                    vendorErrors.businessName ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                  }`}
                />
                {vendorErrors.businessName && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{vendorErrors.businessName}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={newVendorData.contactPerson}
                    onChange={(e) => {
                      setNewVendorData({ ...newVendorData, contactPerson: e.target.value });
                      if (vendorErrors.contactPerson) setVendorErrors((p) => ({ ...p, contactPerson: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                      vendorErrors.contactPerson ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {vendorErrors.contactPerson && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{vendorErrors.contactPerson}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone * (10 Digits)
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="93460XXXXX"
                    value={newVendorData.phone}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setNewVendorData({ ...newVendorData, phone: clean });
                      if (vendorErrors.phone) setVendorErrors((p) => ({ ...p, phone: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                      vendorErrors.phone ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {vendorErrors.phone && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{vendorErrors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Login Email *
                  </label>
                  <input
                    type="email"
                    placeholder="vendor@company.com"
                    value={newVendorData.email}
                    onChange={(e) => {
                      setNewVendorData({ ...newVendorData, email: e.target.value });
                      if (vendorErrors.email) setVendorErrors((p) => ({ ...p, email: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                      vendorErrors.email ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {vendorErrors.email && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{vendorErrors.email}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Initial Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showVendorPassword ? 'text' : 'password'}
                      minLength={6}
                      placeholder="Min 6 chars"
                      value={newVendorData.password}
                      onChange={(e) => {
                        setNewVendorData({ ...newVendorData, password: e.target.value });
                        if (vendorErrors.password) setVendorErrors((p) => ({ ...p, password: '' }));
                      }}
                      className={`w-full pl-3 pr-10 py-2 border rounded-xl text-xs transition-colors ${
                        vendorErrors.password ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowVendorPassword(!showVendorPassword)}
                      aria-label={showVendorPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer transition-colors"
                    >
                      {showVendorPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                  {vendorErrors.password && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{vendorErrors.password}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={newVendorData.address.city}
                    onChange={(e) => {
                      setNewVendorData({
                        ...newVendorData,
                        address: { ...newVendorData.address, city: e.target.value },
                      });
                      if (vendorErrors.city) setVendorErrors((p) => ({ ...p, city: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                      vendorErrors.city ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {vendorErrors.city && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{vendorErrors.city}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Andhra Pradesh, Karnataka, Maharashtra..."
                    value={newVendorData.address.state}
                    onChange={(e) => {
                      setNewVendorData({
                        ...newVendorData,
                        address: { ...newVendorData.address, state: e.target.value },
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pincode * (6 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newVendorData.address.pincode}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setNewVendorData({
                        ...newVendorData,
                        address: { ...newVendorData.address, pincode: clean },
                      });
                      if (vendorErrors.pincode) setVendorErrors((p) => ({ ...p, pincode: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl font-mono transition-colors ${
                      vendorErrors.pincode ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {vendorErrors.pincode && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{vendorErrors.pincode}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Platform Commission % *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Enter agreed % (e.g. 8, enter 0 for 0%)"
                    value={newVendorData.commissionRate === ('' as unknown) ? '' : newVendorData.commissionRate}
                    onChange={(e) => {
                      const val = e.target.value === '' ? ('' as unknown as number) : parseFloat(e.target.value);
                      setNewVendorData({ ...newVendorData, commissionRate: val });
                      if (vendorErrors.commissionRate) setVendorErrors((p) => ({ ...p, commissionRate: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl font-mono text-xs transition-colors ${
                      vendorErrors.commissionRate ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {vendorErrors.commissionRate && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{vendorErrors.commissionRate}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    GSTIN / Registration No (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="36ABCDE1234F1Z5"
                    value={newVendorData.registrationNumber}
                    onChange={(e) => setNewVendorData({ ...newVendorData, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Authorized Solutions to Sell */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Authorized Product Solutions *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryModal(true)}
                    className="text-[11px] font-bold text-[#D52B30] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Solution</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Select which solutions/categories this vendor is authorized to list and sell.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {categories.map((cat) => {
                    const isChecked = newVendorData.allowedCategories.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-blue-50/80 border-[#142B55] text-[#142B55] font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewVendorData((prev) => ({
                                ...prev,
                                allowedCategories: [...prev.allowedCategories, cat.id],
                              }));
                            } else {
                              setNewVendorData((prev) => ({
                                ...prev,
                                allowedCategories: prev.allowedCategories.filter((id) => id !== cat.id),
                              }));
                            }
                            if (vendorErrors.allowedCategories) {
                              setVendorErrors((p) => ({ ...p, allowedCategories: '' }));
                            }
                          }}
                          className="w-4 h-4 text-[#142B55] rounded"
                        />
                        <span className="capitalize">{cat.name}</span>
                      </label>
                    );
                  })}
                </div>
                {vendorErrors.allowedCategories && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{vendorErrors.allowedCategories}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVendorModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white"
                >
                  Provision &amp; Send Login Credentials
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CERTIFICATION MODAL */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#142B55]">Add Equipment Certification</h3>
                <p className="text-xs text-slate-500">Add verified standard compliance record to public gallery</p>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCertification} noValidate className="space-y-4 text-xs">
              {certModalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{certModalError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Certification Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. ISO 9001:2015 Quality Management"
                  value={newCertData.title}
                  onChange={(e) => {
                    setNewCertData({ ...newCertData, title: e.target.value });
                    if (certErrors.title) setCertErrors((p) => ({ ...p, title: '' }));
                  }}
                  className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                    certErrors.title ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                  }`}
                />
                {certErrors.title && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{certErrors.title}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Issuing Authority *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bureau Veritas / BIS"
                    value={newCertData.issuingAuthority}
                    onChange={(e) => {
                      setNewCertData({ ...newCertData, issuingAuthority: e.target.value });
                      if (certErrors.issuingAuthority) setCertErrors((p) => ({ ...p, issuingAuthority: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                      certErrors.issuingAuthority ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {certErrors.issuingAuthority && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{certErrors.issuingAuthority}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Certificate Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BIS-IS-16221"
                    value={newCertData.certificateNumber}
                    onChange={(e) => {
                      setNewCertData({ ...newCertData, certificateNumber: e.target.value });
                      if (certErrors.certificateNumber) setCertErrors((p) => ({ ...p, certificateNumber: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl font-mono transition-colors ${
                      certErrors.certificateNumber ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {certErrors.certificateNumber && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{certErrors.certificateNumber}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category / Scope
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pure Sine Wave Inverters, High Tubular Batteries"
                  value={newCertData.categoryScope}
                  onChange={(e) => setNewCertData({ ...newCertData, categoryScope: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Valid From *
                  </label>
                  <input
                    type="date"
                    value={newCertData.validFrom}
                    onChange={(e) => {
                      setNewCertData({ ...newCertData, validFrom: e.target.value });
                      if (certErrors.validFrom) setCertErrors((p) => ({ ...p, validFrom: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                      certErrors.validFrom ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {certErrors.validFrom && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{certErrors.validFrom}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Valid Until (Optional)
                  </label>
                  <input
                    type="date"
                    value={newCertData.validUntil}
                    onChange={(e) => setNewCertData({ ...newCertData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description &amp; Engineering Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe standard parameters, safety tests passed, and power backup equipment applications..."
                  value={newCertData.description}
                  onChange={(e) => setNewCertData({ ...newCertData, description: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
              </div>

              {/* CERTIFICATE IMAGE / BADGE ATTACHMENT */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Certificate Document / Badge Image *
                  </label>
                  <span className="text-[10px] text-slate-500">Preset, Upload, or URL</span>
                </div>

                {/* Preset Fast Selectors */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1.5 font-medium">Quick Standards Presets:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewCertData({ ...newCertData, imageUrl: '/images/cert-iso.jpg' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        newCertData.imageUrl === '/images/cert-iso.jpg'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ISO 9001 Seal
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCertData({ ...newCertData, imageUrl: '/images/cert-bis.jpg' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        newCertData.imageUrl === '/images/cert-bis.jpg'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      BIS IS 16221
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCertData({ ...newCertData, imageUrl: '/images/cert-tspcb.jpg' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        newCertData.imageUrl === '/images/cert-tspcb.jpg'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      TSPCB Battery
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCertData({ ...newCertData, imageUrl: '/images/cert-iec.jpg' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        newCertData.imageUrl === '/images/cert-iec.jpg'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      IEC 62040 UPS
                    </button>
                  </div>
                </div>

                {/* Upload from Computer / Device */}
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-colors text-slate-700 text-xs font-semibold">
                      <Upload className="w-4 h-4 text-[#142B55]" />
                      <span>Upload Certificate File (PNG, JPG, SVG)</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 3 * 1024 * 1024) {
                          alert('Image file size must be under 3MB');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setNewCertData({ ...newCertData, imageUrl: reader.result });
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>

                {/* Or Custom URL */}
                <div>
                  <input
                    type="text"
                    placeholder="Or enter Image URL (e.g. /images/cert-iso.jpg or https://...)"
                    value={newCertData.imageUrl}
                    onChange={(e) => setNewCertData({ ...newCertData, imageUrl: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
                  />
                </div>

                {/* Live Preview Box */}
                {newCertData.imageUrl && (
                  <div className="mt-2 p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={newCertData.imageUrl}
                        alt="Certificate Preview"
                        className="w-16 h-12 object-contain rounded border border-slate-100 bg-slate-50"
                      />
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">Certificate Preview Attached</span>
                        <span className="text-[10px] text-slate-500">Saves in database and displays in public gallery</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewCertData({ ...newCertData, imageUrl: '' })}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer px-2 py-1"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCertData.isPublished}
                  onChange={(e) => setNewCertData({ ...newCertData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-[#142B55] rounded"
                />
                <span className="font-semibold text-slate-800">
                  Publish to Public Certifications Gallery immediately
                </span>
              </label>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCertModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white"
                >
                  Publish Certification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CERTIFICATION MODAL (ADMIN / SUPER ADMIN) */}
      {editingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#142B55]">Edit Equipment Certification</h3>
                <p className="text-xs text-slate-500">Update compliance record, validity dates, and certificate image</p>
              </div>
              <button
                onClick={() => setEditingCert(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCertification} noValidate className="space-y-4 text-xs">
              {editCertModalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{editCertModalError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Certification Title *
                </label>
                <input
                  type="text"
                  value={editingCert.title}
                  onChange={(e) => {
                    setEditingCert({ ...editingCert, title: e.target.value });
                    if (editCertErrors.title) setEditCertErrors((p) => ({ ...p, title: '' }));
                  }}
                  className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                    editCertErrors.title ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                  }`}
                />
                {editCertErrors.title && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{editCertErrors.title}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Issuing Authority *
                  </label>
                  <input
                    type="text"
                    value={editingCert.issuingAuthority}
                    onChange={(e) => {
                      setEditingCert({ ...editingCert, issuingAuthority: e.target.value });
                      if (editCertErrors.issuingAuthority) setEditCertErrors((p) => ({ ...p, issuingAuthority: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                      editCertErrors.issuingAuthority ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {editCertErrors.issuingAuthority && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{editCertErrors.issuingAuthority}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Certificate Number *
                  </label>
                  <input
                    type="text"
                    value={editingCert.certificateNumber}
                    onChange={(e) => {
                      setEditingCert({ ...editingCert, certificateNumber: e.target.value });
                      if (editCertErrors.certificateNumber) setEditCertErrors((p) => ({ ...p, certificateNumber: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl font-mono transition-colors ${
                      editCertErrors.certificateNumber ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {editCertErrors.certificateNumber && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{editCertErrors.certificateNumber}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category / Scope
                </label>
                <input
                  type="text"
                  value={editingCert.categoryScope || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, categoryScope: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Valid From *
                  </label>
                  <input
                    type="date"
                    value={editingCert.validFrom ? editingCert.validFrom.split('T')[0] : ''}
                    onChange={(e) => {
                      setEditingCert({ ...editingCert, validFrom: e.target.value });
                      if (editCertErrors.validFrom) setEditCertErrors((p) => ({ ...p, validFrom: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                      editCertErrors.validFrom ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {editCertErrors.validFrom && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{editCertErrors.validFrom}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Valid Until (Optional)
                  </label>
                  <input
                    type="date"
                    value={editingCert.validUntil ? editingCert.validUntil.split('T')[0] : ''}
                    onChange={(e) => setEditingCert({ ...editingCert, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description &amp; Engineering Scope
                </label>
                <textarea
                  rows={3}
                  value={editingCert.description || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, description: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
              </div>

              {/* CERTIFICATE IMAGE / BADGE ATTACHMENT */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Certificate Document / Badge Image
                  </label>
                  <span className="text-[10px] text-slate-500">Preset, Upload, or URL</span>
                </div>

                {/* Preset Fast Selectors */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1.5 font-medium">Quick Standards Presets:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingCert({ ...editingCert, imageUrl: '/images/cert-iso.jpg' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        editingCert.imageUrl === '/images/cert-iso.jpg'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ISO 9001 Seal
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCert({ ...editingCert, imageUrl: '/images/cert-bis.jpg' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        editingCert.imageUrl === '/images/cert-bis.jpg'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      BIS IS 16221
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCert({ ...editingCert, imageUrl: '/images/cert-tspcb.jpg' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        editingCert.imageUrl === '/images/cert-tspcb.jpg'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      TSPCB Battery
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCert({ ...editingCert, imageUrl: '/images/cert-iec.jpg' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        editingCert.imageUrl === '/images/cert-iec.jpg'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      IEC 62040 UPS
                    </button>
                  </div>
                </div>

                {/* Upload from Computer / Device */}
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-colors text-slate-700 text-xs font-semibold">
                      <Upload className="w-4 h-4 text-[#142B55]" />
                      <span>Upload New Certificate File (PNG, JPG, SVG)</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 3 * 1024 * 1024) {
                          alert('Image file size must be under 3MB');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setEditingCert({ ...editingCert, imageUrl: reader.result });
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>

                {/* Or Custom URL */}
                <div>
                  <input
                    type="text"
                    placeholder="Or enter Image URL (e.g. /images/cert-iso.jpg or https://...)"
                    value={editingCert.imageUrl || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, imageUrl: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
                  />
                </div>

                {/* Live Preview Box */}
                {editingCert.imageUrl && (
                  <div className="mt-2 p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editingCert.imageUrl}
                        alt="Certificate Preview"
                        className="w-16 h-12 object-contain rounded border border-slate-100 bg-slate-50"
                      />
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">Certificate Image Attached</span>
                        <span className="text-[10px] text-slate-500">Will update in database when saved</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingCert({ ...editingCert, imageUrl: '' })}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer px-2 py-1"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingCert.isPublished}
                  onChange={(e) => setEditingCert({ ...editingCert, isPublished: e.target.checked })}
                  className="w-4 h-4 text-[#142B55] rounded"
                />
                <span className="font-semibold text-slate-800">
                  Published in Public Certifications Gallery
                </span>
              </label>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCert(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white"
                >
                  Save &amp; Update in Database
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW SOLUTION / CATEGORY MODAL */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#142B55]">Create New Product Solution</h3>
                <p className="text-xs text-slate-500">Define a new equipment solution category in platform catalog</p>
              </div>
              <button
                onClick={() => {
                  setShowNewCategoryModal(false);
                  setNewCategoryError(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
              {newCategoryError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{newCategoryError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Solution Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Solar Power Systems, EV Chargers, Servo Stabilizers"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Scope &amp; Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Engineering purpose and application for this product solution..."
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNewCategoryModal(false);
                    setNewCategoryError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#D52B30] hover:bg-[#B51E22] text-white"
                >
                  Save &amp; Authorize Solution
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENDOR ACCOUNT PROVISIONED & CREDENTIALS DISPATCH MODAL */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#142B55]">Vendor Account Provisioned</h3>
                <p className="text-xs text-slate-500">
                  Login invitation &amp; first-time access credentials dispatched
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-[#142B55]">Production Security Process:</p>
              <p className="text-slate-600 leading-relaxed">
                An invitation email has been dispatched to <strong>{createdCredentials.email}</strong>. When the vendor signs into their portal with this temporary password, the system will immediately require them to <strong>create a new permanent password</strong> before granting dashboard access.
              </p>
            </div>

            {/* Credential Details Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Business Name:</span>
                <span className="font-bold text-[#142B55]">{createdCredentials.businessName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Login Email:</span>
                <span className="font-mono font-bold text-slate-800">{createdCredentials.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Temporary Password:</span>
                <code className="bg-white px-2 py-1 rounded-lg border border-slate-200 font-mono font-bold text-[#D52B30]">
                  {createdCredentials.temporaryPassword}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Portal URL:</span>
                <a
                  href={createdCredentials.loginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-blue-600 underline font-semibold text-[11px]"
                >
                  {createdCredentials.loginUrl}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Agreed Commission %:</span>
                <span className="font-bold text-[#142B55]">{createdCredentials.commissionRate}%</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Authorized Solutions:</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[240px]">
                  {createdCredentials.allowedCategories.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800 capitalize">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const emailBody = `Welcome to RPS Power Solutions Vendor Portal!\n\nDear ${createdCredentials.businessName},\n\nYour vendor account has been provisioned.\n\nLogin URL: ${createdCredentials.loginUrl}\nEmail: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.temporaryPassword}\nAgreed Commission: ${createdCredentials.commissionRate}%\nAuthorized Solutions to Sell: ${createdCredentials.allowedCategories.join(', ')}\n\nUpon your first login, you will be prompted to set your confidential permanent password.\n\nBest Regards,\nSuper Admin Team\nRPS Power Solutions`;
                  navigator.clipboard.writeText(emailBody);
                  setCopiedCredentials(true);
                  setTimeout(() => setCopiedCredentials(false), 3000);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copiedCredentials ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>Copy Welcome Email &amp; Details</span>
                  </>
                )}
              </button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setCreatedCredentials(null)}
                className="w-full sm:w-auto bg-[#142B55] hover:bg-[#0B172F] text-white"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR DELETE CONFIRMATION MODAL */}
      {vendorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Vendor Account?</h3>
                <p className="text-xs text-slate-500">Irreversible platform action</p>
              </div>
            </div>

            <div className="p-3 bg-red-50/70 border border-red-200 rounded-2xl text-xs text-slate-700 space-y-1.5">
              <p>
                Are you sure you want to permanently delete <strong>{vendorToDelete.businessName}</strong> (ID: {vendorToDelete.id})?
              </p>
              <ul className="list-disc pl-4 text-slate-600 space-y-0.5 text-[11px]">
                <li>Vendor records will be permanently erased.</li>
                <li>Vendor login account will be terminated immediately.</li>
                <li>All products listed by this vendor will be unpublished from the public storefront.</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setVendorToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleDeleteVendor(vendorToDelete.id)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Delete Vendor
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VENDOR COMMISSION MODAL */}
      {editingVendorCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#142B55]">Update Commission %</h3>
                <p className="text-xs text-slate-500">{editingVendorCommission.businessName}</p>
              </div>
              <button
                onClick={() => setEditingVendorCommission(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateVendorCommission} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Commission Percentage (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Enter percentage (e.g. 7.5)"
                    value={editCommissionValue}
                    onChange={(e) => setEditCommissionValue(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-sm font-bold text-[#142B55] focus:outline-none focus:border-[#142B55]"
                    required
                  />
                  <span className="absolute right-3 top-2.5 font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  This custom rate applies to all future orders placed with this vendor.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingVendorCommission(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white"
                >
                  Save Commission Rate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
