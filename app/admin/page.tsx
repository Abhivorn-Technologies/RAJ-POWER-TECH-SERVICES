'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
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
  LayoutDashboard,
  Sparkles,
  Users,
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
  Clock,
  Phone,
  Mail,
  MapPin,
  Printer,
  Receipt,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Search,
  TrendingUp,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionUser } from '@/types/auth';
import { Vendor, VendorStatus } from '@/types/vendor';
import { Product, SolutionCategoryItem } from '@/types/product';
import { Order, OverallOrderStatus, OrderPaymentStatus, ItemFulfilmentStatus } from '@/types/order';
import { QuotationRequest } from '@/types/quotation';
import { PlatformSettings, EligiblePincodeRule } from '@/types/settings';
import { Certification } from '@/types/certification';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'quotations' | 'certifications' | 'settings'>('overview');
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

  // Products Management State
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productErrors, setProductErrors] = useState<Record<string, string>>({});
  const [productModalError, setProductModalError] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    category: 'inverters' as 'inverters' | 'batteries' | 'ups',
    price: 15000,
    comparePrice: 18000,
    stock: 10,
    shortDescription: '',
    imageUrl: '/products/inverter-demo-1.jpg',
    sku: '',
    capacity: '1100VA / 12V',
    warrantyPeriod: '36 Months',
    features: 'Pure Sine Wave Output, Heavy Duty Inverter Support, Smart Battery Charging',
  });

  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState<number>(15);

  // New Certification Form Modal
  const [showCertModal, setShowCertModal] = useState(false);
  const [newCertData, setNewCertData] = useState({
    title: '',
    issuingAuthority: '',
    certificateNumber: '',
    description: '',
    categoryScope: 'Industrial Batteries & Power Backup',
    validFrom: '',
    validUntil: '',
    status: 'active' as const,
    isPublished: true,
    imageUrl: '/images/cert-exide-gold-2025.png',
  });

  // Edit Certification Form Modal
  const [editingCert, setEditingCert] = useState<Certification | null>(null);

  // New PIN code entry state under settings
  const [newPincode, setNewPincode] = useState('');
  const [newDistrict, setNewDistrict] = useState('Hyderabad');
  const [newFee, setNewFee] = useState(0);

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

  // Detailed Order & Vendor Dispatch Sheet Modal
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [copiedOrderDetails, setCopiedOrderDetails] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'dispatched' | 'delivered' | 'paid'>('all');
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

  // Quotations Routing View States
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<QuotationRequest | null>(null);
  const [quoteSearchQuery, setQuoteSearchQuery] = useState('');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<'all' | 'submitted' | 'under_review' | 'quoted' | 'accepted'>('all');
  const [expandedQuoteIds, setExpandedQuoteIds] = useState<Record<string, boolean>>({});

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
        // Enforce window-level session isolation: if browser window was closed or shut down, sessionStorage is cleared
        if (typeof window !== 'undefined') {
          const windowSession = sessionStorage.getItem('rps_admin_window_session');
          if (!windowSession) {
            try {
              await fetch('/api/auth/logout', { method: 'POST' });
            } catch {
              // Ignore
            }
            router.push('/admin/login');
            return;
          }
        }

        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (ignore) return;
        if (!res.ok || !data.authenticated || (data.user.role !== 'admin' && data.user.role !== 'super_admin')) {
          router.push('/admin/login');
          return;
        }
        setCurrentUser(data.user);
        if (data.sessionTimeoutMinutes) {
          setSessionTimeoutMinutes(data.sessionTimeoutMinutes);
        }
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

        if (activeTab === 'overview') {
          const [prodRes, ordersRes, quotesRes, certsRes, vendorsRes] = await Promise.all([
            fetch('/api/vendor/products'),
            fetch('/api/orders'),
            fetch('/api/quotations'),
            fetch('/api/admin/certifications'),
            fetch('/api/admin/vendors'),
          ]);
          const prodData = await prodRes.json();
          const ordersData = await ordersRes.json();
          const quotesData = await quotesRes.json();
          const certsData = await certsRes.json();
          const vendorsData = await vendorsRes.json();
          if (!ignore) {
            if (prodData.products) setProducts(prodData.products);
            if (ordersData.orders) setOrders(ordersData.orders);
            if (quotesData.quotations) setQuotations(quotesData.quotations);
            if (certsData.certifications) setCertifications(certsData.certifications);
            if (vendorsData.vendors) setVendors(vendorsData.vendors);
          }
        } else if (activeTab === 'products') {
          const res = await fetch('/api/vendor/products');
          const data = await res.json();
          if (!ignore && data.products) setProducts(data.products);
        } else if (activeTab === 'orders') {
          const [ordersRes, vendorsRes] = await Promise.all([
            fetch('/api/orders'),
            fetch('/api/admin/vendors'),
          ]);
          const ordersData = await ordersRes.json();
          const vendorsData = await vendorsRes.json();
          if (!ignore && ordersData.orders) setOrders(ordersData.orders);
          if (!ignore && vendorsData.vendors) setVendors(vendorsData.vendors);
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

  // Products CRUD Handlers
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductModalError(null);
    const errs: Record<string, string> = {};

    if (!productForm.name.trim()) errs.name = 'Product name is required';
    if (!productForm.brand.trim()) errs.brand = 'Brand name is required';
    if (!productForm.shortDescription.trim()) errs.shortDescription = 'Description is required';
    if (productForm.price <= 0) errs.price = 'Price must be greater than 0';
    if (productForm.stock < 0) errs.stock = 'Stock cannot be negative';

    if (Object.keys(errs).length > 0) {
      setProductErrors(errs);
      setProductModalError('Please complete all required fields.');
      return;
    }

    try {
      const res = await fetch('/api/vendor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          technicalSpecs: {
            category: productForm.category,
            specs:
              productForm.category === 'inverters'
                ? { vaRating: 1100, wattageCapacity: 900, nominalBatteryVoltage: '12V', waveform: 'Pure Sine Wave' }
                : productForm.category === 'batteries'
                ? { capacityAh: 150, nominalVoltage: '12V', plateTechnology: 'Tall Tubular', warrantyMonths: 36 }
                : { topology: 'Online Double Conversion', capacityVa: 1000, capacityWatts: 800, transferTimeMs: 0, powerFactor: 0.9 },
          },
          keySpecs: [
            { label: 'Category', value: productForm.category.toUpperCase() },
            { label: 'Brand', value: productForm.brand },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');

      setMessage({ type: 'success', text: `Product "${productForm.name}" created and added to catalog successfully!` });
      setShowAddProductModal(false);
      setProductErrors({});
      setProductModalError(null);
      setProductForm({
        name: '',
        brand: '',
        category: 'inverters',
        price: 15000,
        comparePrice: 18000,
        stock: 10,
        shortDescription: '',
        imageUrl: '/products/inverter-demo-1.jpg',
        sku: '',
        capacity: '',
        warrantyPeriod: '36 Months',
        features: '',
      });
      reloadData();
    } catch (err) {
      setProductModalError(err instanceof Error ? err.message : 'Failed to save product');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProductModalError(null);

    try {
      const res = await fetch('/api/vendor/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editingProduct.id,
          name: editingProduct.name,
          brand: editingProduct.brand,
          price: Number(editingProduct.price),
          comparePrice: editingProduct.comparePrice ? Number(editingProduct.comparePrice) : undefined,
          stock: Number(editingProduct.stock),
          shortDescription: editingProduct.shortDescription,
          imageUrl: editingProduct.imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update product');

      setMessage({ type: 'success', text: `Product "${editingProduct.name}" updated successfully!` });
      setEditingProduct(null);
      setProductModalError(null);
      reloadData();
    } catch (err) {
      setProductModalError(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${productName}" from the catalog?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/vendor/products?productId=${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');

      setMessage({ type: 'success', text: `Product "${productName}" deleted successfully!` });
      setProductToDelete(null);
      reloadData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete product' });
    }
  };

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
        imageUrl: '/images/cert-exide-gold-2025.png',
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
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('rps_admin_window_session');
      sessionStorage.removeItem('rps_admin_login_timestamp');
    }
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleSessionExpired = useCallback(async (reason = 'session_expired') => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('rps_admin_window_session');
      sessionStorage.removeItem('rps_admin_login_timestamp');
    }
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    router.push(`/admin/login?reason=${reason}`);
  }, [router]);


  // Order status & payment update
  const handleUpdateOrderStatus = async (orderId: string, orderStatus: OverallOrderStatus, paymentStatus: OrderPaymentStatus) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderStatus, paymentStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: `Order updated: ${orderStatus.toUpperCase()} (Payment: ${paymentStatus.toUpperCase()})` });
      reloadData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update order status' });
    }
  };

  // Order item fulfillment update
  const handleUpdateItemFulfilment = async (orderId: string, itemId: string, vendorId: string, status: ItemFulfilmentStatus) => {
    try {
      const res = await fetch('/api/vendor/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, itemId, vendorId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: `Item fulfillment status set to ${status.toUpperCase()}` });
      reloadData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update item fulfillment' });
    }
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
    overview: {
      title: 'Store Operations Overview',
      subtitle: 'Executive dashboard, active customer contact leads, orders summary, and inventory vitals.',
      category: 'Overview',
    },
    products: {
      title: 'Store Product Catalog & Inventory',
      subtitle: 'Manage power equipment catalog, pure sine inverters, tubular batteries, and live stock allocations.',
      category: 'Store & Catalog',
    },
    orders: {
      title: 'Customer Orders Management',
      subtitle: 'Track customer orders, delivery fees, payment states, and order fulfillment.',
      category: 'Operations',
    },
    quotations: {
      title: 'Customer Inquiries & Contact Leads',
      subtitle: 'Manage all leads submitted through the Contact Us form, sizing calculators, and quotation requests.',
      category: 'Contact Leads',
    },
    certifications: {
      title: 'Technical Compliance & OEM Dealerships',
      subtitle: 'Publish, manage, and verify official Exide, BPE OEM Authorised Dealerships, and technical partner awards.',
      category: 'Compliance',
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
        <div className="p-5 border-b border-slate-800 bg-[#091326] relative">
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer z-10"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center">
            <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm flex items-center justify-center w-full max-w-[210px]">
              <Image
                src="/images/rps-logo.png"
                alt="RPS Logo"
                width={180}
                height={52}
                className="h-10 sm:h-11 w-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Items with Clear Page Names */}
        <nav className="p-4 space-y-5 flex-1">
          {/* Section 0: Executive Command Center */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Command Center
            </span>

            <button
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#D52B30] text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview Dashboard</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'overview' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                LIVE
              </span>
            </button>
          </div>

          {/* Section 1: Store & Catalog */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Store &amp; Operations
            </span>

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
                <span>Product Catalog</span>
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
                <MessageSquare className="w-4 h-4" />
                <span>Contact Inquiries &amp; Leads</span>
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
        {/* Desktop Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black text-[#142B55] tracking-tight">
              {pageMeta[activeTab]?.title}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
              {pageMeta[activeTab]?.category}
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              onClick={reloadData}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#142B55]" />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#142B55] hover:bg-[#0B172F] text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Storefront</span>
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

        {/* TAB 0: EXECUTIVE STORE OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Store Operational Welcome & Quick Stats Banner */}
            <div className="bg-gradient-to-br from-[#0B172F] via-[#142B55] to-[#1A386D] text-white p-6 sm:p-7 rounded-3xl shadow-lg border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-emerald-300 border border-white/15">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Single Store Operations Active</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Raj Power Tech Services Admin Desk
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  Headquartered at Vijaya Nagar Colony, Picket, Secunderabad. Real-time control center for incoming customer contact leads, orders, equipment inventory, and OEM certifications.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 relative z-10 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddProductModal(true)}
                  icon={<Plus className="w-4 h-4" />}
                  className="bg-[#D52B30] hover:bg-[#B51E22] text-white shadow-md font-bold text-xs"
                >
                  Add Product
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('quotations')}
                  icon={<MessageSquare className="w-4 h-4 text-emerald-400" />}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs"
                >
                  View Inquiries ({quotations.length})
                </Button>
              </div>
            </div>

            {/* 4 Primary Operational Metric Cards */}
            {(() => {
              const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
              const pendingOrders = orders.filter((o) => o.orderStatus === 'placed' || o.orderStatus === 'processing').length;
              const pendingQuotes = quotations.filter((q) => q.status === 'submitted' || q.status === 'under_review').length;
              const inStockCount = products.filter((p) => (p.stock || 0) > 0).length;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Gross Orders Value */}
                  <div
                    onClick={() => setActiveTab('orders')}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Store Orders</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#142B55] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <ShoppingBag className="w-4 h-4 text-[#142B55]" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#142B55]">
                          ₹{totalRevenue.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Across <strong>{orders.length}</strong> total customer orders
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-amber-700 font-semibold">{pendingOrders} Pending Fulfillment</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Card 2: Contact Leads & Inquiries */}
                  <div
                    onClick={() => setActiveTab('quotations')}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Leads &amp; Inquiries</span>
                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#D52B30] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <MessageSquare className="w-4 h-4 text-[#D52B30]" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">
                          {quotations.length}
                        </span>
                        <span className="text-xs text-slate-500">Inquiries</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        From Contact Us &amp; product consultation requests
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[#D52B30] font-semibold">{pendingQuotes} Requiring Response</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Card 3: Product Catalog */}
                  <div
                    onClick={() => setActiveTab('products')}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Equipment Catalog</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Package className="w-4 h-4 text-emerald-700" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">
                          {products.length}
                        </span>
                        <span className="text-xs text-slate-500">Catalog SKUs</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Inverters, tall tubular batteries &amp; online UPS
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-semibold">{inStockCount} Units Ready in Stock</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Card 4: Official Dealerships */}
                  <div
                    onClick={() => setActiveTab('certifications')}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">OEM Accreditations</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Award className="w-4 h-4 text-amber-700" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">
                          {certifications.length}
                        </span>
                        <span className="text-xs text-slate-500">Verified OEM Awards</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Exide Gold Dealer (92884) &amp; BPE Platinum
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-amber-700 font-semibold">Active &amp; Published Online</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Quick Operational Shortcuts Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D52B30]" />
                <span className="font-bold text-slate-800">Quick Administrative Operations:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#D52B30] hover:bg-[#B51E22] text-white font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Product to Store</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('quotations')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#142B55]" />
                  <span>Customer Contact Inquiries</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#142B55]" />
                  <span>Customer Orders Management</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('certifications')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>OEM Certifications</span>
                </button>
              </div>
            </div>

            {/* 2-Column Split: Recent Contact Leads (Left) & Recent Orders (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Column 1: Recent Customer Inquiries & Contact Leads */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[#D52B30]">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#142B55]">Recent Customer Inquiries</h3>
                        <p className="text-[11px] text-slate-500">Direct leads from Contact Us &amp; Quotations form</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('quotations')}
                      className="text-xs font-bold text-[#D52B30] hover:underline cursor-pointer"
                    >
                      View All ({quotations.length}) &rarr;
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 pt-1">
                    {quotations.length === 0 ? (
                      <div className="py-8 text-center text-slate-400">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-60" />
                        <p className="text-xs font-medium">No contact leads submitted yet</p>
                      </div>
                    ) : (
                      quotations.slice(0, 5).map((q) => {
                        const cleanPhone = q.customerPhone.replace(/\D/g, '');
                        return (
                          <div key={q.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 truncate">{q.customerName}</span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                  {q.quotationNumber}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {q.productName || `${q.category.toUpperCase()} Inquiry`} &bull; {q.cityOrDistrict || 'Hyderabad'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge
                                variant={
                                  q.status === 'quoted'
                                    ? 'navy'
                                    : q.status === 'accepted'
                                    ? 'success'
                                    : 'warning'
                                }
                              >
                                {q.status.toUpperCase()}
                              </Badge>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                                    `Hello ${q.customerName}, this is Mr. Raja Shekar Reddy from RAJ POWER TECH SERVICES regarding your inquiry (${q.quotationNumber}). How may we assist you today?`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                  title="WhatsApp Customer"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('quotations')}
                    className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#142B55] font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    Open Lead Management &amp; Quotations &rarr;
                  </button>
                </div>
              </div>

              {/* Column 2: Recent Customer Orders */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#142B55]">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#142B55]">Recent Customer Orders</h3>
                        <p className="text-[11px] text-slate-500">Live order fulfillment and payment status</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#142B55] hover:underline cursor-pointer"
                    >
                      View All ({orders.length}) &rarr;
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 pt-1">
                    {orders.length === 0 ? (
                      <div className="py-8 text-center text-slate-400">
                        <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-60" />
                        <p className="text-xs font-medium">No customer orders placed yet</p>
                      </div>
                    ) : (
                      orders.slice(0, 5).map((ord) => (
                        <div key={ord.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[#142B55] font-mono text-xs">{ord.orderNumber}</span>
                              <span className="text-[11px] text-slate-600 truncate">{ord.customer.fullName}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {ord.items.length} item(s) &bull; {ord.customer.city}, PIN: {ord.customer.pincode}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-extrabold text-slate-900 block text-xs">
                              ₹{ord.totalAmount.toLocaleString('en-IN')}
                            </span>
                            <div className="mt-0.5">
                              <Badge
                                variant={
                                  ord.orderStatus === 'fulfilled'
                                    ? 'success'
                                    : ord.orderStatus === 'processing' || ord.orderStatus === 'partially_fulfilled'
                                    ? 'navy'
                                    : 'warning'
                                }
                              >
                                {ord.orderStatus.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#142B55] font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    Open Customer Orders Management &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: STORE PRODUCT CATALOG MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base sm:text-lg font-bold text-[#142B55]">Store Product Catalog</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {products.length} Products
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Directly manage Raj Power Tech Services equipment, selling prices, and live inventory.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  {['all', 'inverters', 'batteries', 'ups'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setProductCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                        productCategoryFilter === cat
                          ? 'bg-white text-[#142B55] shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddProductModal(true)}
                  icon={<Plus className="w-4 h-4" />}
                  className="bg-[#D52B30] hover:bg-[#B51E22] text-white cursor-pointer"
                >
                  Add New Product
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            {(() => {
              const filtered = products.filter((p) => {
                if (productCategoryFilter === 'all') return true;
                return p.category === productCategoryFilter;
              });

              if (filtered.length === 0) {
                return (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                    <Package className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">No products found in this category</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Click below to add a new equipment item directly to this category.
                    </p>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setShowAddProductModal(true)}
                      icon={<Plus className="w-4 h-4" />}
                      className="bg-[#D52B30] hover:bg-[#B51E22] text-white"
                    >
                      Add New Product
                    </Button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      {/* Product Image Header */}
                      <div className="h-44 w-full bg-slate-50 border-b border-slate-100 flex items-center justify-center p-3 relative group">
                        <img
                          src={p.imageUrl || '/products/inverter-demo-1.jpg'}
                          alt={p.name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/products/inverter-demo-1.jpg';
                          }}
                        />
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          <Badge variant={p.stock && p.stock > 0 ? 'success' : 'warning'}>
                            {p.stock && p.stock > 0 ? `Stock: ${p.stock}` : 'Out of Stock'}
                          </Badge>
                        </div>
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#142B55] text-white uppercase tracking-wider">
                            {p.category}
                          </span>
                        </div>
                      </div>

                      {/* Content & Specs */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-400 uppercase tracking-wider">{p.brand}</span>
                            {p.sku && <span className="font-mono text-[10px] text-slate-400">SKU: {p.sku}</span>}
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">{p.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.shortDescription}</p>

                          <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1.5 mt-3 border border-slate-100">
                            <div className="flex justify-between items-baseline">
                              <span className="text-slate-500">Selling Price:</span>
                              <div className="flex items-baseline gap-1.5">
                                {p.comparePrice && p.comparePrice > (p.price || 0) && (
                                  <span className="text-slate-400 line-through text-[11px]">
                                    ₹{p.comparePrice.toLocaleString('en-IN')}
                                  </span>
                                )}
                                <span className="font-extrabold text-[#D52B30] text-sm">
                                  ₹{p.price?.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Inventory Status:</span>
                              <span className="font-semibold text-slate-800">
                                {p.availability || (p.stock && p.stock > 0 ? 'In Stock' : 'Available on Order')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(p)}
                            className="flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#142B55]" />
                            <span>Edit Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            title="Delete Product"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (() => {
          const totalOrdersCount = orders.length;
          const totalGrossVolume = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
          const totalPlatformCommission = orders.reduce(
            (sum, ord) => sum + (ord.items?.reduce((iSum, item) => iSum + (item.commissionAmount || 0), 0) || 0),
            0
          );
          const pendingItemsCount = orders.reduce(
            (sum, ord) => sum + (ord.items?.filter((i) => i.fulfilmentStatus === 'pending' || i.fulfilmentStatus === 'allocated').length || 0),
            0
          );
          const dispatchedItemsCount = orders.reduce(
            (sum, ord) => sum + (ord.items?.filter((i) => i.fulfilmentStatus === 'dispatched').length || 0),
            0
          );
          const deliveredItemsCount = orders.reduce(
            (sum, ord) => sum + (ord.items?.filter((i) => i.fulfilmentStatus === 'delivered').length || 0),
            0
          );
          const paidOrdersCount = orders.filter((o) => o.paymentStatus === 'paid').length;

          const q = orderSearchQuery.toLowerCase().trim();
          const filteredOrders = orders.filter((ord) => {
            const matchesSearch =
              !q ||
              ord.orderNumber.toLowerCase().includes(q) ||
              ord.customer.fullName.toLowerCase().includes(q) ||
              ord.customer.phone.includes(q) ||
              ord.customer.city.toLowerCase().includes(q) ||
              ord.items.some(
                (i) => i.productName.toLowerCase().includes(q) || i.vendorName.toLowerCase().includes(q)
              );

            if (!matchesSearch) return false;

            if (orderStatusFilter === 'pending') {
              return ord.items.some((i) => i.fulfilmentStatus === 'pending' || i.fulfilmentStatus === 'allocated');
            }
            if (orderStatusFilter === 'dispatched') {
              return ord.items.some((i) => i.fulfilmentStatus === 'dispatched');
            }
            if (orderStatusFilter === 'delivered') {
              return ord.items.every((i) => i.fulfilmentStatus === 'delivered');
            }
            if (orderStatusFilter === 'paid') {
              return ord.paymentStatus === 'paid';
            }
            return true;
          });

          return (
            <div className="space-y-5">

              {/* Top Operational Metrics KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Customer Orders</span>
                    <ShoppingBag className="w-4 h-4 text-[#142B55]" />
                  </div>
                  <p className="text-2xl font-extrabold text-[#142B55]">{totalOrdersCount}</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {paidOrdersCount} Paid &bull; {totalOrdersCount - paidOrdersCount} Pending COD
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Order Revenue</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">₹{totalGrossVolume.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold">Total sales value from customer orders</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Fulfillment Pending</span>
                    <Award className="w-4 h-4 text-[#D52B30]" />
                  </div>
                  <p className="text-2xl font-extrabold text-[#D52B30]">₹{totalPlatformCommission.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Units awaiting allocation or dispatch</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Dispatches</span>
                    <Truck className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-blue-900">{dispatchedItemsCount + deliveredItemsCount}</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {deliveredItemsCount} Delivered &bull; {pendingItemsCount} Awaiting Vendor
                  </p>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by Order #, Customer Name, Phone, City, or Product..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#142B55] transition-all"
                  />
                  {orderSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap md:flex-nowrap overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setOrderStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        orderStatusFilter === 'all'
                          ? 'bg-[#142B55] text-white shadow-xs font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All ({orders.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderStatusFilter('pending')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        orderStatusFilter === 'pending'
                          ? 'bg-amber-600 text-white shadow-xs font-bold'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      Pending Vendor Action ({pendingItemsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderStatusFilter('dispatched')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        orderStatusFilter === 'dispatched'
                          ? 'bg-indigo-600 text-white shadow-xs font-bold'
                          : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
                      }`}
                    >
                      In Transit ({dispatchedItemsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderStatusFilter('delivered')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        orderStatusFilter === 'delivered'
                          ? 'bg-emerald-600 text-white shadow-xs font-bold'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      Delivered ({deliveredItemsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderStatusFilter('paid')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        orderStatusFilter === 'paid'
                          ? 'bg-slate-900 text-white shadow-xs font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Paid Orders ({paidOrdersCount})
                    </button>
                  </div>

                  {filteredOrders.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const allExpanded = filteredOrders.every((o) => expandedOrderIds[o.id]);
                        const next: Record<string, boolean> = {};
                        if (!allExpanded) {
                          filteredOrders.forEach((o) => {
                            next[o.id] = true;
                          });
                        }
                        setExpandedOrderIds(next);
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-[#142B55] px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer shrink-0 ml-auto"
                      title={filteredOrders.every((o) => expandedOrderIds[o.id]) ? 'Collapse all orders' : 'Expand all orders'}
                    >
                      {filteredOrders.every((o) => expandedOrderIds[o.id]) ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Collapse All</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Expand All</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Order Listing */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No matching orders found</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {orderSearchQuery
                      ? `No orders matching query "${orderSearchQuery}". Try clearing filters or searching another field.`
                      : 'No orders recorded in this development session yet. Place a test order via the public storefront or /api/orders.'}
                  </p>
                  {orderSearchQuery && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setOrderSearchQuery('');
                        setOrderStatusFilter('all');
                      }}
                    >
                      Clear Search &amp; Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((ord) => {
                    const isExpanded = !!expandedOrderIds[ord.id];
                    const isFullyDelivered = ord.items.every((i) => i.fulfilmentStatus === 'delivered');
                    const hasDispatched = ord.items.some((i) => i.fulfilmentStatus === 'dispatched');

                    return (
                      <div
                        key={ord.id}
                        className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isExpanded
                            ? 'border-[#142B55]/40 shadow-md ring-1 ring-[#142B55]/10'
                            : 'border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        {/* Compact Single-Line Order Header Row with Horizontal Scroll */}
                        <div className="overflow-x-auto">
                          <div
                            onClick={() => {
                              setExpandedOrderIds((prev) => ({
                                ...prev,
                                [ord.id]: !prev[ord.id],
                              }));
                            }}
                            className={`p-3 sm:p-3.5 min-w-[760px] flex items-center justify-between gap-2.5 sm:gap-3 cursor-pointer select-none transition-colors ${
                              isExpanded ? 'bg-slate-50/80 border-b border-slate-200/80' : 'hover:bg-slate-50/60'
                            }`}
                          >
                            {/* Col 1: Order Number, Copy & Date */}
                            <div className="flex items-center gap-2 min-w-[175px] shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedOrderIds((prev) => ({
                                    ...prev,
                                    [ord.id]: !prev[ord.id],
                                  }));
                                }}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                                  isExpanded
                                    ? 'bg-[#142B55] text-white shadow-2xs rotate-180'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                                }`}
                                aria-label={isExpanded ? 'Collapse order details' : 'Expand order details'}
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>

                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-extrabold text-xs sm:text-sm text-[#142B55] tracking-tight">
                                    {ord.orderNumber}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(ord.orderNumber);
                                      setMessage({ type: 'success', text: `Order number ${ord.orderNumber} copied!` });
                                    }}
                                    title="Copy Order Number"
                                    className="text-slate-400 hover:text-[#142B55] p-0.5 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                                <span className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{new Date(ord.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                </span>
                              </div>
                            </div>

                            {/* Col 2: Customer Name & Destination City */}
                            <div className="flex items-center gap-1.5 min-w-[150px] shrink-0">
                              <div className="w-6 h-6 rounded-full bg-[#142B55] text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                                {ord.customer.fullName.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="truncate max-w-[140px]">
                                <p className="text-xs font-bold text-slate-900 truncate">{ord.customer.fullName}</p>
                                <p className="text-[10px] text-slate-500 flex items-center gap-0.5 truncate">
                                  <MapPin className="w-2.5 h-2.5 text-[#D52B30] shrink-0" />
                                  <span className="truncate">{ord.customer.city}, {ord.customer.state}</span>
                                </p>
                              </div>
                            </div>

                            {/* Col 3: Items Count */}
                            <div className="hidden xl:flex items-center gap-1 min-w-[90px] shrink-0 text-xs text-slate-600">
                              <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-medium whitespace-nowrap text-[11px]">
                                {ord.items.length} {ord.items.length === 1 ? 'Product' : 'Products'}
                              </span>
                            </div>

                            {/* Col 4: Total Amount */}
                            <div className="text-right min-w-[80px] shrink-0">
                              <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Total</p>
                              <p className="text-xs sm:text-sm font-extrabold text-[#D52B30] whitespace-nowrap">
                                ₹{ord.totalAmount.toLocaleString('en-IN')}
                              </p>
                            </div>

                            {/* Col 5: Payment & Fulfillment Badges */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${
                                  ord.paymentStatus === 'paid'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-50 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {ord.paymentStatus === 'paid' ? (
                                  <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                                ) : (
                                  <Clock className="w-2.5 h-2.5 text-amber-600" />
                                )}
                                <span>{ord.paymentStatus === 'paid' ? 'PAID' : 'COD PENDING'}</span>
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap ${
                                  ord.orderStatus === 'fulfilled' || isFullyDelivered
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ord.orderStatus === 'partially_fulfilled' || hasDispatched
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : ord.orderStatus === 'cancelled'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {ord.orderStatus === 'fulfilled' || isFullyDelivered
                                  ? 'DELIVERED'
                                  : ord.orderStatus === 'partially_fulfilled' || hasDispatched
                                  ? 'IN TRANSIT'
                                  : ord.orderStatus.toUpperCase()}
                              </span>
                            </div>

                            {/* Col 6: Manage & Details Button */}
                            <div className="shrink-0 flex items-center pl-1 sm:pl-2 pr-3 sm:pr-4">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedOrderIds((prev) => ({
                                    ...prev,
                                    [ord.id]: !prev[ord.id],
                                  }));
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs whitespace-nowrap ${
                                  isExpanded
                                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                    : 'bg-[#142B55] hover:bg-[#0B172F] text-white hover:shadow-xs'
                                }`}
                              >
                                <span>{isExpanded ? 'Hide Details' : 'Details & Manage'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Full Order Dossier & Multi-Vendor Execution */}
                        {isExpanded && (
                          <div className="p-5 sm:p-7 space-y-6 bg-white animate-in fade-in-50 duration-200">
                            {/* Action Toolbar Inside Expanded Order: Delivery & Payment Management */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs">
                              {/* Left Controls: Delivery & Payment Status Dropdowns */}
                              <div className="flex flex-wrap items-center gap-3">
                                {/* Delivery Status Dropdown */}
                                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                                  <Truck className="w-3.5 h-3.5 text-[#142B55]" />
                                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                                    Delivery Status:
                                  </span>
                                  <select
                                    value={ord.orderStatus}
                                    onChange={(e) =>
                                      handleUpdateOrderStatus(ord.id, e.target.value as OverallOrderStatus, ord.paymentStatus)
                                    }
                                    className="font-extrabold text-xs text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
                                  >
                                    <option value="placed">Placed (Pending Dispatch)</option>
                                    <option value="processing">Processing in Warehouse</option>
                                    <option value="dispatched">Dispatched / Out for Delivery</option>
                                    <option value="delivered">Delivered to Customer</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </div>

                                {/* Payment Status Dropdown */}
                                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                                  <CreditCard className="w-3.5 h-3.5 text-[#D52B30]" />
                                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                                    Payment:
                                  </span>
                                  <select
                                    value={ord.paymentStatus}
                                    onChange={(e) =>
                                      handleUpdateOrderStatus(ord.id, ord.orderStatus, e.target.value as OrderPaymentStatus)
                                    }
                                    className="font-extrabold text-xs text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
                                  >
                                    <option value="pending">COD Pending</option>
                                    <option value="paid">Paid (Collected)</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                  </select>
                                </div>

                                {/* Quick Dispatch Shortcut */}
                                {ord.orderStatus !== 'dispatched' && ord.orderStatus !== 'delivered' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderStatus(ord.id, 'dispatched', ord.paymentStatus)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#142B55] hover:bg-[#0B172F] text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>Mark Dispatched</span>
                                  </button>
                                )}

                                {/* Quick Delivered Shortcut */}
                                {ord.orderStatus === 'dispatched' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderStatus(ord.id, 'delivered', 'paid')}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Mark Delivered</span>
                                  </button>
                                )}

                                {/* Quick Payment Collected Shortcut */}
                                {ord.paymentStatus !== 'paid' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderStatus(ord.id, ord.orderStatus, 'paid')}
                                    className="text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-300 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                    title="Confirm cash collection"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Mark Payment Collected</span>
                                  </button>
                                )}
                              </div>

                              {/* Right Actions: Print Dispatch Sheet */}
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderForModal(ord)}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                                >
                                  <Receipt className="w-3.5 h-3.5 text-[#142B55]" />
                                  <span>Print Dispatch Sheet</span>
                                </button>
                              </div>
                            </div>

                            {/* Customer Dossier & Financial Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-xs">
                              {/* Customer Contact */}
                              <div className="md:col-span-5 space-y-2 border-b md:border-b-0 md:border-r border-slate-200/80 pb-3 md:pb-0 md:pr-4">
                                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-[#142B55]" />
                                  <span>Customer Contact Dossier</span>
                                </span>
                                <div className="flex items-start gap-3">
                                  <div className="w-9 h-9 rounded-full bg-[#142B55] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
                                    {ord.customer.fullName.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="font-extrabold text-sm text-slate-900 leading-tight">
                                      {ord.customer.fullName}
                                    </p>
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <a
                                        href={`tel:${ord.customer.phone}`}
                                        className="inline-flex items-center gap-1 text-[#142B55] hover:underline font-bold"
                                      >
                                        <Phone className="w-3 h-3 text-[#D52B30]" />
                                        <span>{ord.customer.phone}</span>
                                      </a>
                                      {ord.customer.email && (
                                        <a
                                          href={`mailto:${ord.customer.email}`}
                                          className="inline-flex items-center gap-1 text-slate-500 hover:text-[#142B55]"
                                        >
                                          <Mail className="w-3 h-3 text-slate-400" />
                                          <span>{ord.customer.email}</span>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-1">
                                  <a
                                    href={`https://wa.me/91${ord.customer.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                                      `Hello ${ord.customer.fullName}, this is Raj Power Tech Services regarding your order #${ord.orderNumber}. We have verified your delivery address in ${ord.customer.city} and are coordinating equipment dispatch with our authorized equipment partners.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-colors shadow-2xs"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>WhatsApp Customer</span>
                                  </a>
                                </div>
                              </div>

                              {/* Shipping Destination */}
                              <div className="md:col-span-4 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200/80 pb-3 md:pb-0 md:pr-4">
                                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-[#D52B30]" />
                                  <span>Delivery Destination</span>
                                </span>
                                <p className="text-slate-800 leading-snug font-medium">
                                  {ord.customer.line1}
                                  {ord.customer.line2 ? `, ${ord.customer.line2}` : ''}
                                </p>
                                {ord.customer.landmark && (
                                  <p className="text-slate-500 text-[11px]">
                                    Landmark: <strong className="text-slate-700">{ord.customer.landmark}</strong>
                                  </p>
                                )}
                                <p className="font-extrabold text-slate-900 text-xs">
                                  {ord.customer.city}, {ord.customer.district}, {ord.customer.state} -{' '}
                                  <span className="font-mono text-[#D52B30]">{ord.customer.pincode}</span>
                                </p>
                              </div>

                              {/* Financial Summary */}
                              <div className="md:col-span-3 space-y-1.5 flex flex-col justify-between">
                                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1.5">
                                  <CreditCard className="w-3.5 h-3.5 text-[#142B55]" />
                                  <span>Order Settlement</span>
                                </span>
                                <div className="space-y-1 pt-0.5">
                                  <div className="flex justify-between text-slate-600">
                                    <span>Item Subtotal:</span>
                                    <span className="font-semibold text-slate-800">₹{ord.subtotal.toLocaleString('en-IN')}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-600">
                                    <span>Delivery Fee:</span>
                                    <span className="font-semibold text-slate-800">
                                      {ord.deliveryFee && ord.deliveryFee > 0 ? `₹${ord.deliveryFee}` : 'Free'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-t border-slate-200 pt-1.5 text-slate-900 font-extrabold text-sm">
                                    <span>Total Payable:</span>
                                    <span className="text-[#D52B30]">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Store Fulfillment & Items Breakdown */}
                            <div className="space-y-3 pt-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                                <div>
                                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#142B55] flex items-center gap-1.5">
                                    <Package className="w-3.5 h-3.5 text-[#D52B30]" />
                                    <span>
                                      Order Items ({ord.items.length} {ord.items.length === 1 ? 'Product' : 'Products'})
                                    </span>
                                  </h4>
                                  <p className="text-[11px] text-slate-500">
                                    Direct Store Fulfillment by Raj Power Tech Services. Admin manages packaging, dispatch, and delivery.
                                  </p>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase font-bold">
                                  Direct RPS Fulfillment
                                </span>
                              </div>

                              <div className="space-y-3.5">
                                {ord.items.map((item) => {
                                  const isDelivered = ord.orderStatus === 'delivered' || item.fulfilmentStatus === 'delivered';
                                  const isDispatched = ord.orderStatus === 'dispatched' || item.fulfilmentStatus === 'dispatched';

                                  return (
                                    <div
                                      key={item.id}
                                      className="p-4 bg-slate-50/60 hover:bg-slate-50 rounded-2xl border border-slate-200 transition-colors grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
                                    >
                                      {/* Col 1: Product Thumbnail & Specs */}
                                      <div className="lg:col-span-5 flex items-start gap-3">
                                        {item.productImage ? (
                                          <div className="relative w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1.5 shadow-2xs">
                                            <Image
                                              src={item.productImage}
                                              alt={item.productName}
                                              width={64}
                                              height={64}
                                              className="object-contain w-full h-full"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                                            <Package className="w-6 h-6" />
                                          </div>
                                        )}
                                        <div className="space-y-1 min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#142B55] text-white uppercase tracking-wider">
                                              {item.productCategory}
                                            </span>
                                            {item.productSku && (
                                              <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                                SKU: {item.productSku}
                                              </span>
                                            )}
                                          </div>
                                          <h5 className="font-extrabold text-sm text-slate-900 leading-snug">
                                            {item.productName}
                                          </h5>
                                          <p className="text-xs text-slate-600 font-medium">
                                            Quantity: <strong className="text-slate-900 font-extrabold">{item.quantity}</strong> &times; ₹{item.unitPrice.toLocaleString('en-IN')} ={' '}
                                            <strong className="text-[#142B55] font-extrabold">₹{item.totalPrice.toLocaleString('en-IN')}</strong>
                                          </p>
                                        </div>
                                      </div>

                                      {/* Col 2: Live Fulfillment Status & Direct Dispatch Actions */}
                                      <div className="lg:col-span-4 bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Fulfillment Status:
                                          </span>
                                          {isDelivered ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                              <span>Delivered &amp; Installed</span>
                                            </span>
                                          ) : isDispatched ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-300">
                                              <Truck className="w-3.5 h-3.5 text-indigo-600" />
                                              <span>Dispatched / In Transit</span>
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                                              <span>Ready for Dispatch</span>
                                            </span>
                                          )}
                                        </div>

                                        {/* Direct Admin Action Controls */}
                                        <div className="pt-1.5 border-t border-slate-100 flex items-center gap-2">
                                          {!isDispatched && !isDelivered && (
                                            <button
                                              type="button"
                                              onClick={() => handleUpdateOrderStatus(ord.id, 'dispatched', ord.paymentStatus)}
                                              className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs font-bold bg-[#142B55] hover:bg-[#0B172F] text-white transition-colors cursor-pointer shadow-2xs"
                                            >
                                              <Truck className="w-3.5 h-3.5" />
                                              <span>Mark Dispatched</span>
                                            </button>
                                          )}

                                          {isDispatched && !isDelivered && (
                                            <button
                                              type="button"
                                              onClick={() => handleUpdateOrderStatus(ord.id, 'delivered', 'paid')}
                                              className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs"
                                            >
                                              <CheckCircle2 className="w-3.5 h-3.5" />
                                              <span>Mark Delivered</span>
                                            </button>
                                          )}

                                          {isDelivered && (
                                            <div className="w-full text-center py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg">
                                              Order Completed Successfully ✓
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Col 3: Direct Order Revenue & Customer Contact */}
                                      <div className="lg:col-span-3 bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-slate-500">Store Revenue:</span>
                                          <span className="font-extrabold text-[#142B55] text-sm">
                                            ₹{item.totalPrice.toLocaleString('en-IN')}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-slate-500">Delivery:</span>
                                          <span className="font-bold text-emerald-700">FREE</span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-100">
                                          <a
                                            href={`https://wa.me/91${ord.customer.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                                              `Hello ${ord.customer.fullName},\n\nThis is Raj Power Tech Services regarding your order #${ord.orderNumber} for ${item.productName}.\n\nYour order is currently ${isDelivered ? 'DELIVERED & INSTALLED' : isDispatched ? 'OUT FOR DELIVERY' : 'CONFIRMED & PREPARING FOR DISPATCH'}.\n\nDelivery Destination: ${ord.customer.city}, ${ord.customer.state} (${ord.customer.pincode}).\nTotal Amount: ₹${ord.totalAmount.toLocaleString('en-IN')}.\n\nPlease let us know if you need any assistance!`
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
                                          >
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            <span>WhatsApp Customer</span>
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 4: QUOTATIONS ROUTING */}
        {activeTab === 'quotations' && (() => {
          const totalQuotes = quotations.length;
          const pendingQuotes = quotations.filter((q) => q.status === 'submitted' || q.status === 'under_review').length;
          const officialQuoted = quotations.filter((q) => q.status === 'quoted').length;
          const acceptedQuotes = quotations.filter((q) => q.status === 'accepted').length;

          const query = quoteSearchQuery.toLowerCase().trim();
          const filteredQuotes = quotations.filter((q) => {
            const matchesSearch =
              !query ||
              q.quotationNumber.toLowerCase().includes(query) ||
              q.customerName.toLowerCase().includes(query) ||
              q.customerPhone.includes(query) ||
              q.cityOrDistrict.toLowerCase().includes(query) ||
              (q.productName && q.productName.toLowerCase().includes(query)) ||
              q.category.toLowerCase().includes(query);

            if (!matchesSearch) return false;

            if (quoteStatusFilter === 'submitted') return q.status === 'submitted';
            if (quoteStatusFilter === 'under_review') return q.status === 'under_review';
            if (quoteStatusFilter === 'quoted') return q.status === 'quoted';
            if (quoteStatusFilter === 'accepted') return q.status === 'accepted';
            return true;
          });

          return (
            <div className="space-y-5">
              {/* Top Operational Metrics KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Inquiries</span>
                    <FileText className="w-4 h-4 text-[#142B55]" />
                  </div>
                  <p className="text-2xl font-extrabold text-[#142B55]">{totalQuotes}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Customer sizing &amp; quotes</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Awaiting Branch Quote</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-amber-700">{pendingQuotes}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Pending vendor sizing review</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Officially Quoted</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-blue-900">{officialQuoted}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Proposal submitted by branch</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Customer Accepted</span>
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-700">{acceptedQuotes}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold">Converted consultations</p>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={quoteSearchQuery}
                    onChange={(e) => setQuoteSearchQuery(e.target.value)}
                    placeholder="Search by Quote #, Customer Name, Phone, City, Category, or Product..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#142B55] transition-all"
                  />
                  {quoteSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setQuoteSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap md:flex-nowrap overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuoteStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        quoteStatusFilter === 'all'
                          ? 'bg-[#142B55] text-white shadow-xs font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All ({quotations.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuoteStatusFilter('submitted')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        quoteStatusFilter === 'submitted'
                          ? 'bg-amber-600 text-white shadow-xs font-bold'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      New ({quotations.filter((q) => q.status === 'submitted').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuoteStatusFilter('quoted')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        quoteStatusFilter === 'quoted'
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      Quoted ({officialQuoted})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuoteStatusFilter('accepted')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        quoteStatusFilter === 'accepted'
                          ? 'bg-emerald-600 text-white shadow-xs font-bold'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      Accepted ({acceptedQuotes})
                    </button>
                  </div>

                  {filteredQuotes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const allExpanded = filteredQuotes.every((q) => expandedQuoteIds[q.id]);
                        const next: Record<string, boolean> = {};
                        if (!allExpanded) {
                          filteredQuotes.forEach((q) => {
                            next[q.id] = true;
                          });
                        }
                        setExpandedQuoteIds(next);
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-[#142B55] px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer shrink-0 ml-auto"
                      title={filteredQuotes.every((q) => expandedQuoteIds[q.id]) ? 'Collapse all quotations' : 'Expand all quotations'}
                    >
                      {filteredQuotes.every((q) => expandedQuoteIds[q.id]) ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Collapse All</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Expand All</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Quotation Listings */}
              {filteredQuotes.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No quotation requests found</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {quoteSearchQuery
                      ? `No quotations matching query "${quoteSearchQuery}". Try clearing filters.`
                      : 'Customer sizing consultations and WhatsApp inquiries will be logged here and routed to branch engineers.'}
                  </p>
                  {quoteSearchQuery && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setQuoteSearchQuery('');
                        setQuoteStatusFilter('all');
                      }}
                    >
                      Clear Search &amp; Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQuotes.map((q) => {
                    const isExpanded = !!expandedQuoteIds[q.id];
                    const assignedVendorsList = vendors.filter((v) => q.assignedVendorIds.includes(v.id));

                    return (
                      <div
                        key={q.id}
                        className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isExpanded
                            ? 'border-[#142B55]/40 shadow-md ring-1 ring-[#142B55]/10'
                            : 'border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        {/* Compact Single-Line Quotation Header Row with Horizontal Scroll */}
                        <div className="overflow-x-auto">
                          <div
                            onClick={() => {
                              setExpandedQuoteIds((prev) => ({
                                ...prev,
                                [q.id]: !prev[q.id],
                              }));
                            }}
                            className={`p-3 sm:p-3.5 min-w-[760px] flex items-center justify-between gap-2.5 sm:gap-3 cursor-pointer select-none transition-colors ${
                              isExpanded ? 'bg-slate-50/80 border-b border-slate-200/80' : 'hover:bg-slate-50/60'
                            }`}
                          >
                            {/* Col 1: Quotation Number & Date */}
                            <div className="flex items-center gap-2 min-w-[175px] shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedQuoteIds((prev) => ({
                                    ...prev,
                                    [q.id]: !prev[q.id],
                                  }));
                                }}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                                  isExpanded
                                    ? 'bg-[#142B55] text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                                title={isExpanded ? 'Collapse' : 'Expand full details'}
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                              <div className="min-w-0">
                                <span className="font-extrabold text-xs text-[#142B55] tracking-tight block truncate">
                                  {q.quotationNumber}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium block">
                                  {new Date(q.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Col 2: Business & Customer Dossier */}
                            <div className="min-w-[170px] max-w-[220px] shrink-0">
                              {q.companyName ? (
                                <p className="font-extrabold text-xs text-[#142B55] truncate" title={q.companyName}>
                                  {q.companyName}
                                </p>
                              ) : null}
                              <p className={`font-bold text-xs truncate ${q.companyName ? 'text-slate-600 font-medium text-[11px]' : 'text-slate-900'}`}>
                                {q.customerName}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                <span className="font-mono text-slate-600">{q.customerPhone}</span>
                                <span>&bull;</span>
                                <span className="truncate">{q.cityOrDistrict}</span>
                                {q.gstin && (
                                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1 rounded">GST</span>
                                )}
                              </div>
                            </div>

                            {/* Col 3: Product Scope & Quantity */}
                            <div className="min-w-[170px] max-w-[240px] shrink-0">
                              <p className="font-extrabold text-xs text-slate-900 truncate" title={q.productName}>
                                {q.productName || `${q.category.toUpperCase()} Commercial Solution`}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <span className="font-extrabold text-[#D52B30] bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                  {q.quantity || 1} Units
                                </span>
                                <span>&bull;</span>
                                <span className="uppercase text-[10px] font-bold text-slate-600">{q.category}</span>
                              </div>
                            </div>

                            {/* Col 4: Assigned Vendor(s) */}
                            <div className="min-w-[140px] max-w-[190px] shrink-0">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                Assigned Vendor
                              </span>
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {assignedVendorsList.length > 0
                                  ? assignedVendorsList.map((v) => v.businessName).join(', ')
                                  : q.assignedVendorIds.join(', ')}
                              </p>
                            </div>

                            {/* Col 5: Quotation Status & Quoted Price */}
                            <div className="flex items-center gap-2 shrink-0 min-w-[140px] justify-end">
                              {q.quotedAmount ? (
                                <div className="text-right">
                                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Quoted Price</span>
                                  <span className="font-extrabold text-xs text-emerald-900">
                                    ₹{q.quotedAmount.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-medium italic">
                                  Pending Quote
                                </span>
                              )}

                              <Badge
                                variant={
                                  q.status === 'quoted'
                                    ? 'navy'
                                    : q.status === 'accepted'
                                    ? 'success'
                                    : q.status === 'under_review'
                                    ? 'navy'
                                    : 'warning'
                                }
                              >
                                {q.status.toUpperCase()}
                              </Badge>
                            </div>

                            {/* Col 6: Details Button */}
                            <div className="shrink-0 flex items-center pl-1 sm:pl-2 pr-3 sm:pr-4">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedQuoteIds((prev) => ({
                                    ...prev,
                                    [q.id]: !prev[q.id],
                                  }));
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs whitespace-nowrap ${
                                  isExpanded
                                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                    : 'bg-[#142B55] hover:bg-[#0B172F] text-white hover:shadow-xs'
                                }`}
                              >
                                <span>{isExpanded ? 'Hide Details' : 'Details & Actions'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Full Quotation Dossier */}
                        {isExpanded && (
                          <div className="p-5 sm:p-7 space-y-6 bg-white animate-in fade-in-50 duration-200 text-xs">
                            {/* Customer Dossier & Sizing Details */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                              {/* Customer Contact */}
                              <div className="md:col-span-5 space-y-2 border-b md:border-b-0 md:border-r border-slate-200/80 pb-3 md:pb-0 md:pr-4">
                                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1.5">
                                  <Building2 className="w-3.5 h-3.5 text-[#142B55]" />
                                  <span>Client &amp; Organization Dossier</span>
                                </span>
                                {q.companyName && (
                                  <p className="font-extrabold text-sm text-[#142B55]">
                                    {q.companyName}
                                  </p>
                                )}
                                <div className="space-y-1">
                                  <p className="font-bold text-slate-800">
                                    Contact: {q.customerName}
                                    {q.gstin && (
                                      <span className="ml-2 font-mono text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                                        GSTIN: {q.gstin}
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <a
                                      href={`tel:${q.customerPhone}`}
                                      className="inline-flex items-center gap-1 text-[#142B55] hover:underline font-bold"
                                    >
                                      <Phone className="w-3 h-3 text-[#D52B30]" />
                                      <span>{q.customerPhone}</span>
                                    </a>
                                    {q.customerEmail && (
                                      <a
                                        href={`mailto:${q.customerEmail}`}
                                        className="inline-flex items-center gap-1 text-slate-500 hover:text-[#142B55]"
                                      >
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        <span>{q.customerEmail}</span>
                                      </a>
                                    )}
                                  </div>
                                </div>

                                <div className="pt-2 flex items-center gap-2 flex-wrap">
                                  <a
                                    href={`https://wa.me/91${q.customerPhone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                                      `Hello ${q.customerName}, this is Raj Power Tech Services regarding your commercial quotation inquiry #${q.quotationNumber} for ${q.quantity || 1} units of ${q.productName || q.category.toUpperCase()}. We are happy to assist you with equipment sizing and warranty-backed setup.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-colors shadow-2xs"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>WhatsApp Client</span>
                                  </a>

                                  {q.quotedAmount && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedQuoteForPrint(q)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#142B55] text-white hover:bg-[#0B172F] transition-colors shadow-2xs cursor-pointer"
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                      <span>Print Official Quotation</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Destination & Location */}
                              <div className="md:col-span-4 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200/80 pb-3 md:pb-0 md:pr-4">
                                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-[#D52B30]" />
                                  <span>Site Location</span>
                                </span>
                                <p className="font-extrabold text-slate-900 text-xs">
                                  {q.cityOrDistrict}
                                </p>
                                {q.fullAddress && (
                                  <p className="text-slate-600 leading-snug">
                                    {q.fullAddress}
                                  </p>
                                )}
                              </div>

                              {/* Official Quoted Price Display */}
                              <div className="md:col-span-3 space-y-1.5 flex flex-col justify-between">
                                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1.5">
                                  <CreditCard className="w-3.5 h-3.5 text-[#142B55]" />
                                  <span>Commercial Quote</span>
                                </span>
                                <div className="space-y-1 pt-0.5">
                                  {q.quotedAmount ? (
                                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Quoted Value</span>
                                      <p className="text-xl font-black text-emerald-900">₹{q.quotedAmount.toLocaleString('en-IN')}</p>
                                      {q.unitPrice && (
                                        <p className="text-[11px] text-slate-600">
                                          ₹{q.unitPrice.toLocaleString('en-IN')} &times; {q.quantity || 1} Units
                                        </p>
                                      )}
                                      {q.quotedDetails && (
                                        <p className="text-[11px] text-emerald-700 mt-0.5">{q.quotedDetails}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
                                      <span className="text-[10px] uppercase font-bold block">Awaiting Proposal</span>
                                      <p className="text-xs font-medium mt-0.5">Assigned branch engineer has not yet submitted an official price.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Technical Sizing Specifications */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">
                                Technical Sizing &amp; Load Parameters
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
                                  <span className="font-extrabold text-slate-900 uppercase text-xs">{q.category}</span>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Running Load</span>
                                  <span className="font-extrabold text-slate-900 text-xs">
                                    {q.estimatedRunningWatts ? `${q.estimatedRunningWatts} Watts` : 'Not specified'}
                                  </span>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Required Backup</span>
                                  <span className="font-extrabold text-slate-900 text-xs">
                                    {q.expectedBackupHours ? `${q.expectedBackupHours} Hours` : 'Standard'}
                                  </span>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Targeted Product</span>
                                  <span className="font-extrabold text-slate-900 text-xs truncate block">
                                    {q.productName || 'Custom Consultation'}
                                  </span>
                                </div>
                              </div>

                              {q.notes && (
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-slate-700 text-xs">
                                  <strong>Customer Requirements Note:</strong> &ldquo;{q.notes}&rdquo;
                                </div>
                              )}
                            </div>

                            {/* Assigned Vendors Breakdown */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">
                                Assigned Equipment Partners &amp; Branches
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {assignedVendorsList.length > 0 ? (
                                  assignedVendorsList.map((v) => (
                                    <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                                      <div className="flex items-center justify-between">
                                        <p className="font-extrabold text-slate-900 text-xs">{v.businessName}</p>
                                        <Badge variant={v.status === 'active' ? 'success' : 'warning'}>
                                          {v.status.toUpperCase()}
                                        </Badge>
                                      </div>
                                      <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                                        <Phone className="w-3 h-3 text-[#D52B30]" />
                                        <span>{v.phone}</span>
                                        <span>&bull;</span>
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        <span>{v.email}</span>
                                      </p>
                                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-slate-400" />
                                        <span>
                                          {v.address.city}, {v.address.district} ({v.address.pincode})
                                        </span>
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                                    <span>Assigned Vendor IDs: {q.assignedVendorIds.join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status History Audit Trail */}
                            {q.statusHistory && q.statusHistory.length > 0 && (
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">
                                  Audit &amp; Action Timeline
                                </span>
                                <div className="space-y-1.5">
                                  {q.statusHistory.map((h, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#142B55] mt-1.5 shrink-0" />
                                      <div>
                                        <strong className="text-slate-900 uppercase">{h.status}:</strong>{' '}
                                        <span>{h.note || 'Status updated'}</span>{' '}
                                        <span className="text-slate-400">
                                          &bull; {new Date(h.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                          {h.updatedByName && ` by ${h.updatedByName}`}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

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

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Admin Session Inactivity Timeout
                  </label>
                  <select
                    value={settings.adminSessionTimeoutMinutes || 15}
                    onChange={(e) => setSettings({ ...settings, adminSessionTimeoutMinutes: parseInt(e.target.value) || 15 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white"
                  >
                    <option value={15}>15 Minutes (Strict Security - Recommended)</option>
                    <option value={30}>30 Minutes (Standard Operations)</option>
                    <option value={60}>60 Minutes (Extended Operations)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Admins automatically lock out upon inactivity and must re-enter credentials.
                  </p>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold text-[#142B55]">Verified Equipment Certifications</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {certifications.length}
                </span>
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
                  placeholder="e.g. Authorised Exide Industrial All Stars Gold Dealer"
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
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewCertData({ ...newCertData, imageUrl: '/images/cert-exide-gold-2025.png' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        newCertData.imageUrl === '/images/cert-exide-gold-2025.png'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Exide Gold 2025
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCertData({ ...newCertData, imageUrl: '/images/cert-bpe-benchmark.png' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        newCertData.imageUrl === '/images/cert-bpe-benchmark.png'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      BPE Benchmark
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCertData({ ...newCertData, imageUrl: '/images/cert-bpe-benchmark-2025.jpg' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        newCertData.imageUrl === '/images/cert-bpe-benchmark-2025.jpg'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      BPE 25Y Trophy
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCertData({ ...newCertData, imageUrl: '/images/cert-bpe-platinum-2024.png' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        newCertData.imageUrl === '/images/cert-bpe-platinum-2024.png'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      BPE Vision25
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCertData({ ...newCertData, imageUrl: '/images/cert-bpe-platinum-2022.png' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        newCertData.imageUrl === '/images/cert-bpe-platinum-2022.png'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      BPE Trophy Star
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
                    placeholder="Or enter Image URL (e.g. /images/cert-exide-gold-2025.png or https://...)"
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
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingCert({ ...editingCert, imageUrl: '/images/cert-exide-gold-2025.png' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        editingCert.imageUrl === '/images/cert-exide-gold-2025.png'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Exide Gold 2025
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCert({ ...editingCert, imageUrl: '/images/cert-bpe-benchmark.png' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        editingCert.imageUrl === '/images/cert-bpe-benchmark.png'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      BPE Benchmark
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCert({ ...editingCert, imageUrl: '/images/cert-bpe-benchmark-2025.jpg' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        editingCert.imageUrl === '/images/cert-bpe-benchmark-2025.jpg'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      BPE 25Y Trophy
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCert({ ...editingCert, imageUrl: '/images/cert-bpe-platinum-2024.png' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        editingCert.imageUrl === '/images/cert-bpe-platinum-2024.png'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      BPE Vision25
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCert({ ...editingCert, imageUrl: '/images/cert-bpe-platinum-2022.png' })}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        editingCert.imageUrl === '/images/cert-bpe-platinum-2022.png'
                          ? 'bg-[#142B55] text-white border-[#142B55]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      BPE Trophy Star
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
                    placeholder="Or enter Image URL (e.g. /images/cert-exide-gold-2025.png or https://...)"
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

            {/* ADD NEW PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#142B55]">Add New Equipment Product</h3>
                <p className="text-xs text-slate-500">Publish a new pure sine inverter, tubular battery, or UPS to catalog</p>
              </div>
              <button
                onClick={() => {
                  setShowAddProductModal(false);
                  setProductModalError(null);
                  setProductErrors({});
                }}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {productModalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{productModalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product Title / Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luminous Zelio+ 1100 Pure Sine Wave Inverter"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                  {productErrors.name && <p className="text-red-500 text-[11px] mt-0.5">{productErrors.name}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luminous, Exide, RPS, Microtek"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                  {productErrors.brand && <p className="text-red-500 text-[11px] mt-0.5">{productErrors.brand}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Equipment Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => {
                      const cat = e.target.value as 'inverters' | 'batteries' | 'ups';
                      let img = '/products/inverter-demo-1.jpg';
                      if (cat === 'batteries') img = '/products/battery-demo-1.jpg';
                      if (cat === 'ups') img = '/products/ups-demo-1.jpg';
                      setProductForm({ ...productForm, category: cat, imageUrl: img });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55] bg-white capitalize"
                  >
                    <option value="inverters">Inverters</option>
                    <option value="batteries">Batteries</option>
                    <option value="ups">Online UPS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Selling Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                  {productErrors.price && <p className="text-red-500 text-[11px] mt-0.5">{productErrors.price}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Original / MRP Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Optional original price"
                    value={productForm.comparePrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, comparePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Available Stock Units *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    SKU / Model Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RPS-INV-1100"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Capacity Rating / Sizing
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1100VA / 12V or 150Ah"
                    value={productForm.capacity}
                    onChange={(e) => setProductForm({ ...productForm, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Warranty Period
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 36 Months Replacement"
                    value={productForm.warrantyPeriod}
                    onChange={(e) => setProductForm({ ...productForm, warrantyPeriod: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                </div>

                {/* RICH PRODUCT IMAGE SELECTOR WITH LIVE PREVIEW */}
                <div className="sm:col-span-2 space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Product Photo &amp; Image Gallery *
                    </label>
                    <span className="text-[10px] text-slate-500">Pick preset photo or enter custom URL</span>
                  </div>

                  {/* Preset Photos Quick Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-500">Choose from Store Product Photos:</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[
                        { label: 'Inverter 1', url: '/products/inverter-demo-1.jpg' },
                        { label: 'Inverter 2', url: '/products/inverter-demo-2.jpg' },
                        { label: 'Battery 1', url: '/products/battery-demo-1.jpg' },
                        { label: 'Battery 2', url: '/products/battery-demo-2.jpg' },
                        { label: 'UPS Unit 1', url: '/products/ups-demo-1.jpg' },
                        { label: 'UPS Unit 2', url: '/products/ups-demo-2.jpg' },
                      ].map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setProductForm({ ...productForm, imageUrl: preset.url })}
                          className={`p-1 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            productForm.imageUrl === preset.url
                              ? 'bg-blue-50 border-[#142B55] ring-2 ring-[#142B55]/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center p-0.5">
                            <img src={preset.url} alt={preset.label} className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[9px] font-bold text-slate-700 truncate w-full text-center">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom URL Input & Live Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 items-center">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Or Custom Image URL / Path:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /products/inverter-demo-1.jpg or https://..."
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono text-[11px] focus:outline-none focus:border-[#142B55]"
                      />
                    </div>

                    <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100">
                        <img
                          src={productForm.imageUrl || '/products/inverter-demo-1.jpg'}
                          alt="Product preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/products/inverter-demo-1.jpg';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                          Preview
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block">
                          Live photo ready
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Short Description / Application *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Brief summary of capacity, backup duration, or target application..."
                    value={productForm.shortDescription}
                    onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                  {productErrors.shortDescription && (
                    <p className="text-red-500 text-[11px] mt-0.5">{productErrors.shortDescription}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Key Features / Bullet Points (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Sine Wave, Fast Charging, Overload Protection"
                    value={productForm.features}
                    onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                </div>
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
                  className="bg-[#D52B30] hover:bg-[#B51E22] text-white"
                >
                  Publish Product to Catalog
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#142B55]">Edit Product Details</h3>
                <p className="text-xs text-slate-500 truncate max-w-md">{editingProduct.name}</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Stock Units *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.stock ?? 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Selling Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Original / MRP Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.comparePrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, comparePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    SKU / Model Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RPS-INV-1100"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Warranty Term
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 36 Months Replacement"
                    value={editingProduct.warrantyPeriod || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, warrantyPeriod: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                </div>

                {/* RICH PRODUCT IMAGE SELECTOR WITH LIVE PREVIEW */}
                <div className="sm:col-span-2 space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Product Photo &amp; Image Gallery *
                    </label>
                    <span className="text-[10px] text-slate-500">Pick preset photo or enter custom URL</span>
                  </div>

                  {/* Preset Photos Quick Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-500">Choose from Store Product Photos:</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[
                        { label: 'Inverter 1', url: '/products/inverter-demo-1.jpg' },
                        { label: 'Inverter 2', url: '/products/inverter-demo-2.jpg' },
                        { label: 'Battery 1', url: '/products/battery-demo-1.jpg' },
                        { label: 'Battery 2', url: '/products/battery-demo-2.jpg' },
                        { label: 'UPS Unit 1', url: '/products/ups-demo-1.jpg' },
                        { label: 'UPS Unit 2', url: '/products/ups-demo-2.jpg' },
                      ].map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, imageUrl: preset.url })}
                          className={`p-1 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            editingProduct.imageUrl === preset.url
                              ? 'bg-blue-50 border-[#142B55] ring-2 ring-[#142B55]/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center p-0.5">
                            <img src={preset.url} alt={preset.label} className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[9px] font-bold text-slate-700 truncate w-full text-center">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom URL Input & Live Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 items-center">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Or Custom Image URL / Path:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /products/inverter-demo-1.jpg or https://..."
                        value={editingProduct.imageUrl || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono text-[11px] focus:outline-none focus:border-[#142B55]"
                      />
                    </div>

                    <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100">
                        <img
                          src={editingProduct.imageUrl || '/products/inverter-demo-1.jpg'}
                          alt="Product preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/products/inverter-demo-1.jpg';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                          Preview
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block">
                          Live photo ready
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editingProduct.shortDescription}
                    onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Order & Vendor Dispatch Sheet Modal */}
      {selectedOrderForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="bg-[#142B55] text-white p-5 sm:p-6 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#D52B30] text-white uppercase tracking-wider">
                    Official Order Dispatch Sheet
                  </span>
                  <span className="text-xs text-slate-300">RPS E-Commerce</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  Order #{selectedOrderForModal.orderNumber}
                </h3>
                <p className="text-xs text-slate-300">
                  Placed on {new Date(selectedOrderForModal.createdAt).toLocaleString('en-IN')} &bull; Status: {selectedOrderForModal.orderStatus.toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Print Dispatch Sheet"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForModal(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Customer and Delivery Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">Customer Recipient</span>
                  <p className="font-extrabold text-sm text-[#142B55]">{selectedOrderForModal.customer.fullName}</p>
                  <p className="text-slate-700">Phone: <strong className="text-slate-900">{selectedOrderForModal.customer.phone}</strong></p>
                  {selectedOrderForModal.customer.email && (
                    <p className="text-slate-600">Email: {selectedOrderForModal.customer.email}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">Doorstep Delivery Address</span>
                  <p className="text-slate-800 font-medium">
                    {selectedOrderForModal.customer.line1}
                    {selectedOrderForModal.customer.line2 ? `, ${selectedOrderForModal.customer.line2}` : ''}
                  </p>
                  {selectedOrderForModal.customer.landmark && (
                    <p className="text-slate-500">Landmark: {selectedOrderForModal.customer.landmark}</p>
                  )}
                  <p className="font-bold text-slate-900">
                    {selectedOrderForModal.customer.city}, {selectedOrderForModal.customer.district}, {selectedOrderForModal.customer.state} -{' '}
                    <span className="font-mono text-[#D52B30]">{selectedOrderForModal.customer.pincode}</span>
                  </p>
                  <p className="text-slate-600 font-semibold pt-0.5">
                    Payment Method: <span className="text-[#142B55]">{selectedOrderForModal.paymentMethod || 'Cash on Delivery (COD)'}</span> ({selectedOrderForModal.paymentStatus.toUpperCase()})
                  </p>
                </div>
              </div>

              {/* Items & Vendor Allocations Table */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase text-xs tracking-wider block">
                  Product Items &amp; Store Fulfillment Details
                </span>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {selectedOrderForModal.items.map((item, idx) => {
                    return (
                      <div key={item.id} className="p-4 bg-white space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Item #{idx + 1} &bull; {item.productCategory}</span>
                            <h4 className="font-extrabold text-sm text-[#142B55]">{item.productName}</h4>
                            <p className="text-slate-500 text-xs">
                              Quantity: <strong className="text-slate-800">{item.quantity}</strong> &bull; Unit Price: ₹{item.unitPrice.toLocaleString('en-IN')} &bull; Item Total: <strong className="text-[#142B55]">₹{item.totalPrice.toLocaleString('en-IN')}</strong>
                            </p>
                          </div>
                          <Badge variant={item.fulfilmentStatus === 'delivered' ? 'success' : 'warning'}>
                            {item.fulfilmentStatus ? item.fulfilmentStatus.toUpperCase() : 'STORE READY'}
                          </Badge>
                        </div>

                        {/* Store Dispatch Box */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Fulfillment Partner</span>
                            <span className="font-bold text-slate-900 block">Raj Power Tech Services (Secunderabad Hub)</span>
                            <span className="text-[11px] text-slate-500">Official Brand Certified Installation</span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer Delivery</span>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Item Revenue:</span>
                              <span className="font-bold text-[#142B55]">₹{item.totalPrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Delivery Fee:</span>
                              <span className="font-bold text-emerald-700">FREE</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Totals Summary */}
              <div className="bg-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="text-slate-600">Subtotal: <strong className="text-slate-900">₹{selectedOrderForModal.subtotal.toLocaleString('en-IN')}</strong></p>
                  <p className="text-slate-600">Delivery Fee: <strong className="text-slate-900">{selectedOrderForModal.deliveryFee ? `₹${selectedOrderForModal.deliveryFee}` : 'FREE'}</strong></p>
                </div>
                <div className="text-right sm:text-right">
                  <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-bold">Total Customer Charge</span>
                  <span className="text-xl font-extrabold text-[#D52B30]">₹{selectedOrderForModal.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  const summaryText = `RPS Order #${selectedOrderForModal.orderNumber}\nCustomer: ${selectedOrderForModal.customer.fullName} (${selectedOrderForModal.customer.phone})\nDestination: ${selectedOrderForModal.customer.city}, ${selectedOrderForModal.customer.state} - PIN ${selectedOrderForModal.customer.pincode}\nItems:\n${selectedOrderForModal.items.map(i => `• ${i.productName} x${i.quantity} (Vendor: ${i.vendorName})`).join('\n')}\nTotal: ₹${selectedOrderForModal.totalAmount.toLocaleString('en-IN')} (${selectedOrderForModal.paymentMethod})`;
                  navigator.clipboard.writeText(summaryText);
                  setCopiedOrderDetails(true);
                  setTimeout(() => setCopiedOrderDetails(false), 2500);
                }}
                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#142B55] font-semibold cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedOrderDetails ? 'Summary Copied to Clipboard!' : 'Copy Order & Dispatch Summary'}</span>
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrderForModal(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white"
                  icon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print Dispatch Sheet
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL BUSINESS PRODUCT QUOTATION MODAL */}
      {selectedQuoteForPrint && (() => {
        const issuingVendor = vendors.find((v) => selectedQuoteForPrint.assignedVendorIds.includes(v.id));
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in-50 duration-150 my-8">
              {/* Modal Actions */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#142B55]" />
                  <h3 className="font-black text-sm text-slate-900">Official Commercial Product Quotation</h3>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedQuoteForPrint.quotationNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#142B55] hover:bg-[#0B172F] text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Quotation Sheet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedQuoteForPrint(null)}
                    className="text-slate-400 hover:text-slate-600 p-2 text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Printable Document Body */}
              <div className="space-y-6 text-xs text-slate-800">
                {/* Document Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start pb-5 border-b-2 border-slate-900 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#142B55] text-white flex items-center justify-center font-black text-sm">
                        RPS
                      </div>
                      <div>
                        <h1 className="text-lg font-black text-[#142B55] tracking-tight">RAJ POWER TECH SERVICES</h1>
                        <p className="text-[10px] font-semibold text-slate-500">Commercial Power Backup Systems &amp; Energy Equipment</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2">
                      Plot No:12A, Vijaya Nagar Colony, Secunderabad, Telangana - 500009
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Phone: +91 9346021289 &bull; Email: info@rajpowertech.com
                    </p>
                    <p className="text-[11px] font-bold text-slate-800">
                      GSTIN: {issuingVendor?.registrationNumber || '36ABCDE1234F1Z5'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-none border-slate-200 w-full sm:w-auto">
                    <span className="text-[11px] font-black uppercase text-[#D52B30] tracking-wider block">
                      COMMERCIAL QUOTATION
                    </span>
                    <p className="font-mono font-black text-base text-slate-900">{selectedQuoteForPrint.quotationNumber}</p>
                    <p className="text-slate-500 text-[11px] mt-1">
                      Date of Issue: <strong>{new Date(selectedQuoteForPrint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Valid Until: <strong>{selectedQuoteForPrint.validUntil ? new Date(selectedQuoteForPrint.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : `${selectedQuoteForPrint.validityDays || 15} Days from issue`}</strong>
                    </p>
                  </div>
                </div>

                {/* Client & Vendor Dossier */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">QUOTATION PREPARED FOR (CLIENT):</span>
                    {selectedQuoteForPrint.companyName && (
                      <p className="font-black text-sm text-[#142B55]">{selectedQuoteForPrint.companyName}</p>
                    )}
                    <p className="font-bold text-slate-900">Attn: {selectedQuoteForPrint.customerName}</p>
                    {selectedQuoteForPrint.gstin && (
                      <p className="font-mono text-emerald-800 font-semibold text-[11px]">Client GSTIN: {selectedQuoteForPrint.gstin}</p>
                    )}
                    <p className="text-slate-600">Phone: {selectedQuoteForPrint.customerPhone}</p>
                    {selectedQuoteForPrint.customerEmail && <p className="text-slate-600">Email: {selectedQuoteForPrint.customerEmail}</p>}
                    <p className="text-slate-700 font-medium pt-1">
                      Site Location: {selectedQuoteForPrint.fullAddress || selectedQuoteForPrint.cityOrDistrict}
                    </p>
                  </div>

                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-5">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">AUTHORIZED ISSUING BRANCH:</span>
                    <p className="font-black text-sm text-slate-900">{issuingVendor?.businessName || 'RAJ POWER TECH ENTERPRISES'}</p>
                    <p className="text-slate-600">{issuingVendor?.address?.line1 || 'Plot No:12A, Vijaya Nagar Colony'}</p>
                    <p className="text-slate-600">{issuingVendor?.address?.city || 'Secunderabad'}, Telangana</p>
                    <p className="text-slate-700 font-medium">Branch Contact: {issuingVendor?.phone || '9346021289'}</p>
                    <p className="text-slate-700 font-medium">Commercial Email: {issuingVendor?.email || 'vendor@powertech.com'}</p>
                  </div>
                </div>

                {/* Itemized Commercial Scope Table */}
                <table className="w-full text-left border-collapse border border-slate-300">
                  <thead className="bg-[#142B55] text-white text-[10px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-2.5 border border-slate-400 text-center w-10">#</th>
                      <th className="p-2.5 border border-slate-400">Equipment Description &amp; Scope</th>
                      <th className="p-2.5 border border-slate-400 text-center w-16">Qty</th>
                      <th className="p-2.5 border border-slate-400 text-right w-24">Unit Price</th>
                      <th className="p-2.5 border border-slate-400 text-right w-24">Taxable Value</th>
                      <th className="p-2.5 border border-slate-400 text-center w-16">GST %</th>
                      <th className="p-2.5 border border-slate-400 text-right w-24">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 border border-slate-200 text-center font-bold text-slate-400">1</td>
                      <td className="p-2.5 border border-slate-200">
                        <p className="font-bold text-slate-900">
                          {selectedQuoteForPrint.productName || `${selectedQuoteForPrint.category.toUpperCase()} Commercial Solution`}
                        </p>
                        {selectedQuoteForPrint.quotedDetails && (
                          <p className="text-[11px] text-slate-600 mt-0.5">{selectedQuoteForPrint.quotedDetails}</p>
                        )}
                        {selectedQuoteForPrint.estimatedRunningWatts && (
                          <p className="text-[10px] text-slate-500">Rated Capacity Load: {selectedQuoteForPrint.estimatedRunningWatts}W</p>
                        )}
                      </td>
                      <td className="p-2.5 border border-slate-200 text-center font-bold text-slate-900">
                        {selectedQuoteForPrint.quantity || 1}
                      </td>
                      <td className="p-2.5 border border-slate-200 text-right font-medium text-slate-800">
                        ₹{(selectedQuoteForPrint.unitPrice || (selectedQuoteForPrint.quotedAmount ? Math.round(selectedQuoteForPrint.quotedAmount / (selectedQuoteForPrint.quantity || 1)) : 0)).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 border border-slate-200 text-right font-bold text-slate-900">
                        ₹{(selectedQuoteForPrint.subtotal || Math.round((selectedQuoteForPrint.quotedAmount || 0) * 0.78)).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 border border-slate-200 text-center font-semibold text-slate-700">
                        {selectedQuoteForPrint.gstPercent || 28}%
                      </td>
                      <td className="p-2.5 border border-slate-200 text-right font-black text-slate-900">
                        ₹{((selectedQuoteForPrint.subtotal || Math.round((selectedQuoteForPrint.quotedAmount || 0) * 0.78)) + (selectedQuoteForPrint.gstAmount || Math.round((selectedQuoteForPrint.quotedAmount || 0) * 0.22))).toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {(selectedQuoteForPrint.deliveryCharges !== undefined && selectedQuoteForPrint.deliveryCharges > 0) && (
                      <tr className="bg-slate-50/50">
                        <td className="p-2 border border-slate-200 text-center text-slate-400">2</td>
                        <td colSpan={5} className="p-2 border border-slate-200 font-medium text-slate-700">
                          Logistics, Handling &amp; Safe Branch Transit
                        </td>
                        <td className="p-2 border border-slate-200 text-right font-bold text-slate-900">
                          ₹{selectedQuoteForPrint.deliveryCharges.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}

                    {(selectedQuoteForPrint.installationCharges !== undefined && selectedQuoteForPrint.installationCharges > 0) && (
                      <tr className="bg-slate-50/50">
                        <td className="p-2 border border-slate-200 text-center text-slate-400">3</td>
                        <td colSpan={5} className="p-2 border border-slate-200 font-medium text-slate-700">
                          On-Site Installation, Battery Rack Assembly &amp; Load Commissioning
                        </td>
                        <td className="p-2 border border-slate-200 text-right font-bold text-slate-900">
                          ₹{selectedQuoteForPrint.installationCharges.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold text-slate-800">
                      <td colSpan={5} className="p-2.5 border border-slate-300 text-right">
                        Total Applicable GST ({selectedQuoteForPrint.gstPercent || 28}%):
                      </td>
                      <td colSpan={2} className="p-2.5 border border-slate-300 text-right font-black text-slate-900">
                        ₹{(selectedQuoteForPrint.gstAmount || Math.round((selectedQuoteForPrint.quotedAmount || 0) * 0.22)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className="bg-[#142B55] text-white font-black text-sm">
                      <td colSpan={5} className="p-3 border border-[#142B55] text-right uppercase tracking-wider">
                        GRAND TOTAL PAYABLE (INR):
                      </td>
                      <td colSpan={2} className="p-3 border border-[#142B55] text-right text-base text-[#D52B30] bg-[#0B172F]">
                        ₹{(selectedQuoteForPrint.quotedAmount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Commercial Terms & Conditions */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">
                    COMMERCIAL TERMS &amp; CONDITIONS
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                    <li>
                      <strong>Payment Terms:</strong> {selectedQuoteForPrint.paymentTerms || '50% Advance with Purchase Order, 50% upon installation.'}
                    </li>
                    <li>
                      <strong>Comprehensive Warranty:</strong> {selectedQuoteForPrint.warrantyTerms || '36 Months on-site replacement warranty through authorized RPS technical network.'}
                    </li>
                    <li>
                      <strong>Delivery Schedule:</strong> {selectedQuoteForPrint.deliveryLeadTime || '2 to 3 Business Days from formal order confirmation.'}
                    </li>
                    <li>
                      <strong>Quotation Validity:</strong> This official commercial quotation is valid for {selectedQuoteForPrint.validityDays || 15} days from date of issuance.
                    </li>
                  </ul>
                </div>

                {/* Signatures & Corporate Seal */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300">
                  <div className="space-y-1">
                    <p className="font-bold text-[11px] text-slate-800">For {issuingVendor?.businessName || 'RAJ POWER TECH SERVICES'}:</p>
                    <p className="text-[10px] text-slate-500">Authorized Commercial Signatory</p>
                    <div className="h-12 border-b border-dashed border-slate-400 w-48 mt-2" />
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="font-bold text-[11px] text-slate-800">Client Acceptance &amp; Purchase Confirmation:</p>
                    <p className="text-[10px] text-slate-500">Signature with Company Stamp</p>
                    <div className="h-12 border-b border-dashed border-slate-400 w-48 ml-auto mt-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      </div>
    </div>
  );
}
