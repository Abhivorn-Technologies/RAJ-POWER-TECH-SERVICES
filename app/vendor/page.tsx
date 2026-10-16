'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  ShoppingBag,
  FileText,
  LogOut,
  Plus,
  CheckCircle,
  Truck,
  AlertCircle,
  RefreshCw,
  Menu,
  X,
  ChevronRight,
  Globe,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionUser } from '@/types/auth';
import { Vendor } from '@/types/vendor';
import { Product, ProductCategory, CreateProductInput, SolutionCategoryItem } from '@/types/product';
import { OrderItem } from '@/types/order';
import { QuotationRequest } from '@/types/quotation';

export default function VendorDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'quotations'>('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Vendor Profile and Solution Categories
  const [vendorProfile, setVendorProfile] = useState<Vendor | null>(null);
  const [availableCategories, setAvailableCategories] = useState<SolutionCategoryItem[]>([]);

  // Forced Password Change State (First-time login)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Add Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productErrors, setProductErrors] = useState<Record<string, string>>({});
  const [productModalError, setProductModalError] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<CreateProductInput>({
    name: '',
    brand: '',
    category: 'inverters',
    price: 15000,
    stock: 10,
    shortDescription: '',
    imageUrl: '/products/inverter-demo-1.svg',
    technicalSpecs: {
      category: 'inverters',
      specs: {
        vaRating: 1100,
        wattageCapacity: 900,
        nominalBatteryVoltage: '12V',
        waveform: 'Pure Sine Wave',
      },
    },
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const reloadVendorData = useCallback(() => {
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
        if (!res.ok || !data.authenticated || data.user.role !== 'vendor') {
          router.push('/vendor/login');
          return;
        }
        setCurrentUser(data.user);
      } catch {
        if (!ignore) {
          router.push('/vendor/login');
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

  // Synchronize Vendor isolated data and authorized solutions
  useEffect(() => {
    if (!currentUser) return;
    let ignore = false;

    async function fetchVendorData() {
      try {
        // Load profile and allowed categories
        const profileRes = await fetch('/api/vendor/profile');
        const profileData = await profileRes.json();
        if (!ignore && profileData.success) {
          setVendorProfile(profileData.vendor);
          setAvailableCategories(profileData.categories || []);
          if (profileData.allowedCategories && profileData.allowedCategories.length > 0) {
            setProductForm((prev) => ({
              ...prev,
              category: profileData.allowedCategories[0] as ProductCategory,
            }));
          }
        }

        if (activeTab === 'products') {
          const res = await fetch('/api/vendor/products');
          const data = await res.json();
          if (!ignore && data.products) setProducts(data.products);
        } else if (activeTab === 'orders') {
          const res = await fetch('/api/vendor/orders');
          const data = await res.json();
          if (!ignore && data.items) setOrderItems(data.items);
        } else if (activeTab === 'quotations') {
          const res = await fetch('/api/quotations');
          const data = await res.json();
          if (!ignore && data.quotations) setQuotations(data.quotations);
        }
      } catch (e) {
        console.error('Failed to load vendor data:', e);
      }
    }

    fetchVendorData();
    return () => {
      ignore = true;
    };
  }, [currentUser, activeTab, refreshKey]);

  // First-Time Login Password Update Handler
  const handleSetPermanentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New permanent password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const res = await fetch('/api/vendor/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentUser((prev) => (prev ? { ...prev, requiresPasswordChange: false } : null));
      setMessage({
        type: 'success',
        text: 'Your permanent password has been established! You now have full access to your Vendor Portal.',
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/vendor/login');
  };

  // Create Product handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductModalError(null);
    const errs: Record<string, string> = {};

    if (!productForm.name.trim() || productForm.name.trim().length < 3) {
      errs.name = 'Product name is required (min 3 characters)';
    }
    if (!productForm.brand.trim() || productForm.brand.trim().length < 2) {
      errs.brand = 'Brand name is required (min 2 characters)';
    }
    if (!productForm.price || productForm.price <= 0) {
      errs.price = 'Selling price must be greater than ₹0';
    }
    if (productForm.stock === undefined || productForm.stock === null || productForm.stock < 0) {
      errs.stock = 'Available stock cannot be negative';
    }
    if (!productForm.shortDescription.trim() || productForm.shortDescription.trim().length < 10) {
      errs.shortDescription = 'Description is required (min 10 characters)';
    }

    if (Object.keys(errs).length > 0) {
      setProductErrors(errs);
      setProductModalError('Please correct the highlighted validation errors below.');
      return;
    }

    try {
      const res = await fetch('/api/vendor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: 'Product created and published immediately!' });
      setShowAddProductModal(false);
      setProductErrors({});
      setProductModalError(null);
      reloadVendorData();
    } catch (err) {
      setProductModalError(err instanceof Error ? err.message : 'Product creation failed');
    }
  };

  // Fulfilment status advancement
  const handleUpdateFulfilment = async (orderId: string, itemId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/vendor/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, itemId, fulfilmentStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: `Item fulfilment updated to ${newStatus}` });
      reloadVendorData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Update failed' });
    }
  };

  const pageMeta: Record<'products' | 'orders' | 'quotations', { title: string; subtitle: string }> = {
    products: {
      title: 'Power Equipment Catalog',
      subtitle: 'Manage and update your active inventory, selling prices & stock levels',
    },
    orders: {
      title: 'Allocated Order Items',
      subtitle: 'Advance order fulfilment, packing and delivery tracking',
    },
    quotations: {
      title: 'Assigned Quotations',
      subtitle: 'Customer sizing requests, consultations, and quotations assigned to your branch',
    },
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 min-h-screen flex flex-col items-center justify-center bg-[#F3F5F8]">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
        <p className="text-sm font-semibold text-slate-700">Loading Vendor Dashboard...</p>
      </div>
    );
  }

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
              Vendor Portal
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

      {/* Left Sticky Sidebar Navigation */}
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block truncate max-w-[150px]" title={currentUser?.name}>
                {currentUser?.name || 'Vendor Workspace'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentUser?.vendorId || 'AUTHORIZED'}
              </span>
            </div>
            <Badge variant="success">VENDOR</Badge>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="p-4 space-y-6 flex-1">
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Vendor Management
            </span>

            <button
              onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>My Products Catalog</span>
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
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Order Dispatch</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {orderItems.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('quotations'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'quotations'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Customer Quotations</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'quotations' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {quotations.length}
              </span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-slate-800 bg-[#091326] space-y-3">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>View Public Storefront</span>
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="min-w-0 pr-2">
              <span className="text-xs font-bold text-white block truncate">{currentUser?.name}</span>
              <span className="text-[10px] text-slate-400 block truncate">{currentUser?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
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
              <span>Vendor Workspace</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-emerald-700 font-bold">
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
              onClick={reloadVendorData}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Refresh Data</span>
            </button>

            {activeTab === 'products' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddProductModal(true)}
                icon={<Plus className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Add New Product
              </Button>
            )}
          </div>
        </header>

        {/* Content Container */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {/* Flash message */}
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

          {/* TAB 1: MY PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h2 className="text-lg font-bold text-[#142B55]">My Power Equipment Catalog</h2>
                  <p className="text-xs text-slate-500">
                    Products are published immediately upon server validation. You can manage prices and inventory for your own products only.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddProductModal(true)}
                  icon={<Plus className="w-4 h-4" />}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Add New Product
                </Button>
              </div>

              {products.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                  No power equipment registered under your vendor account yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-semibold text-slate-400 uppercase tracking-wider">{p.brand}</span>
                          <Badge variant={p.stock && p.stock > 0 ? 'success' : 'warning'}>
                            Stock: {p.stock ?? 0} units
                          </Badge>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base leading-snug">{p.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.shortDescription}</p>

                        <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1.5 mt-3 border border-slate-100">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Category:</span>
                            <span className="font-medium text-slate-800">{p.categoryName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">SKU:</span>
                            <span className="font-mono text-slate-700">{p.sku || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-200">
                            <span className="text-slate-700 font-bold">Selling Price:</span>
                            <span className="font-extrabold text-[#D52B30] text-sm">₹{p.price?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Live &amp; Active on Storefront</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY ORDER ITEMS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h2 className="text-lg font-bold text-[#142B55]">My Allocated Order Items</h2>
                <p className="text-xs text-slate-500">
                  You only see order items containing your products. Advance fulfilment status and track customer delivery.
                </p>
              </div>

              {orderItems.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                  No orders assigned to your vendor account yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                          <span className="font-bold text-sm text-[#142B55] block">Order #{item.orderNumber}</span>
                          <span className="text-xs text-slate-400">Item ID: {item.id} • Placed: {new Date(item.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                        <Badge variant={item.fulfilmentStatus === 'delivered' ? 'success' : 'warning'}>
                          {item.fulfilmentStatus.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{item.productName}</h4>
                          <p className="text-xs text-slate-500">
                            Quantity: <strong>{item.quantity}</strong> • Unit Price (Frozen): ₹{item.unitPrice.toLocaleString('en-IN')}
                          </p>
                          {item.trackingNumber && (
                            <p className="text-xs text-slate-600 mt-1">
                              Tracking: <strong className="font-mono text-emerald-700">{item.trackingNumber}</strong>
                            </p>
                          )}
                        </div>

                        <div className="text-right sm:text-right">
                          <span className="text-xs text-slate-400 block">Total Item Value:</span>
                          <span className="font-bold text-sm text-slate-800">₹{item.totalPrice.toLocaleString('en-IN')}</span>
                          <span className="text-xs text-emerald-700 font-extrabold block">
                            Net Earnings: ₹{item.vendorEarnings?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Fulfilment Controls */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-end">
                        {item.fulfilmentStatus === 'pending' && (
                          <button
                            onClick={() => handleUpdateFulfilment(item.orderId, item.id, 'allocated')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                          >
                            Mark Allocated / Preparing
                          </button>
                        )}

                        {(item.fulfilmentStatus === 'pending' || item.fulfilmentStatus === 'allocated') && (
                          <button
                            onClick={() => handleUpdateFulfilment(item.orderId, item.id, 'dispatched')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer flex items-center gap-1"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Dispatch / Out for Delivery</span>
                          </button>
                        )}

                        {item.fulfilmentStatus === 'dispatched' && (
                          <button
                            onClick={() => handleUpdateFulfilment(item.orderId, item.id, 'delivered')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}

                        {item.fulfilmentStatus !== 'delivered' && item.fulfilmentStatus !== 'cancelled' && (
                          <button
                            onClick={() => {
                              if (confirm('Cancel this item? Its quantity will be automatically returned to your available stock.')) {
                                handleUpdateFulfilment(item.orderId, item.id, 'cancelled');
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            Cancel Item
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ASSIGNED QUOTATIONS */}
          {activeTab === 'quotations' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h2 className="text-lg font-bold text-[#142B55]">Quotation Requests Assigned to You</h2>
                <p className="text-xs text-slate-500">
                  Customer power backup sizing inquiries in your category or area.
                </p>
              </div>

              {quotations.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                  No quotation inquiries currently assigned to your vendor account.
                </div>
              ) : (
                <div className="space-y-4">
                  {quotations.map((q) => (
                    <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="font-bold text-sm text-[#142B55]">{q.quotationNumber}</span>
                        <Badge variant="navy">{q.status.toUpperCase()}</Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                        <div>
                          <strong>Customer:</strong> {q.customerName} ({q.customerPhone})
                        </div>
                        <div>
                          <strong>Location:</strong> {q.cityOrDistrict}
                        </div>
                        <div>
                          <strong>Category:</strong> {q.category.toUpperCase()}
                        </div>
                        {q.estimatedRunningWatts && (
                          <div>
                            <strong>Est. Watts:</strong> {q.estimatedRunningWatts}W
                          </div>
                        )}
                      </div>

                      {q.quotedAmount && (
                        <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-800 font-bold">
                          Quoted Price: ₹{q.quotedAmount.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#142B55]">Add New Power Backup Product</h3>
                <p className="text-xs text-slate-500">Immediate publishing upon server validation</p>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} noValidate className="space-y-3.5 text-xs">
              {productModalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{productModalError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="E.g. Pure Sine Wave 1500VA Inverter"
                  value={productForm.name}
                  onChange={(e) => {
                    setProductForm({ ...productForm, name: e.target.value });
                    if (productErrors.name) setProductErrors((p) => ({ ...p, name: '' }));
                  }}
                  className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                    productErrors.name ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                  }`}
                />
                {productErrors.name && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{productErrors.name}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    placeholder="Brand Name"
                    value={productForm.brand}
                    onChange={(e) => {
                      setProductForm({ ...productForm, brand: e.target.value });
                      if (productErrors.brand) setProductErrors((p) => ({ ...p, brand: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                      productErrors.brand ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {productErrors.brand && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{productErrors.brand}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white capitalize"
                  >
                    {availableCategories.length > 0 ? (
                      availableCategories
                        .filter((cat) =>
                          vendorProfile?.allowedCategories && vendorProfile.allowedCategories.length > 0
                            ? vendorProfile.allowedCategories.includes(cat.id) || vendorProfile.allowedCategories.includes(cat.slug)
                            : true
                        )
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))
                    ) : (
                      <>
                        <option value="inverters">Inverters</option>
                        <option value="batteries">Batteries</option>
                        <option value="ups">UPS Systems</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.price}
                    onChange={(e) => {
                      setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 });
                      if (productErrors.price) setProductErrors((p) => ({ ...p, price: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                      productErrors.price ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {productErrors.price && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{productErrors.price}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => {
                      setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 });
                      if (productErrors.stock) setProductErrors((p) => ({ ...p, stock: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                      productErrors.stock ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {productErrors.stock && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{productErrors.stock}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Short Description *
                </label>
                <textarea
                  rows={2}
                  placeholder="Key electrical attributes and recommended home/office load"
                  value={productForm.shortDescription}
                  onChange={(e) => {
                    setProductForm({ ...productForm, shortDescription: e.target.value });
                    if (productErrors.shortDescription) setProductErrors((p) => ({ ...p, shortDescription: '' }));
                  }}
                  className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                    productErrors.shortDescription ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500' : 'border-slate-200'
                  }`}
                />
                {productErrors.shortDescription && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{productErrors.shortDescription}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddProductModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Publish Product Immediately
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORCED FIRST-TIME LOGIN: SET PERMANENT PASSWORD MODAL */}
      {currentUser?.requiresPasswordChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#142B55] text-white flex items-center justify-center shrink-0 shadow-md">
                <KeyRound className="w-6 h-6 text-[#D52B30]" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#142B55]">Set Permanent Password</h3>
                <p className="text-xs text-slate-500">Security requirement for first-time vendor portal access</p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                Temporary Onboarding Password Active
              </p>
              <p className="text-amber-800 leading-relaxed">
                You logged in using an initial password assigned by Super Admin. For security, please establish your confidential permanent password before continuing to your dashboard.
              </p>
            </div>

            <form onSubmit={handleSetPermanentPassword} className="space-y-4 text-xs">
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-semibold">{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Permanent Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#142B55]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Permanent Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    minLength={6}
                    placeholder="Re-enter same password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#142B55]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={passwordSubmitting}
                  className="w-full bg-[#142B55] hover:bg-[#0B172F] text-white flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{passwordSubmitting ? 'Securing Account...' : 'Set Password & Enter Portal'}</span>
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold underline cursor-pointer"
                >
                  Sign Out of Temporary Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
