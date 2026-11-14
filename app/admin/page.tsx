/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Truck,
  CreditCard,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
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
  ShieldCheck,
  KeyRound,
  Loader2,
  Briefcase,
  Star,
  Zap,
  ArrowUp,
  ArrowDown,
  ListOrdered,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionUser } from '@/types/auth';
import { Vendor } from '@/types/vendor';
import { Product, SolutionCategoryItem, CategorySortConfig } from '@/types/product';
import { Order, OverallOrderStatus, OrderPaymentStatus } from '@/types/order';
import { QuotationRequest, QuotationStatus } from '@/types/quotation';
import { PlatformSettings, EligiblePincodeRule } from '@/types/settings';
import { Certification } from '@/types/certification';
import { ClientProject, ClientSector } from '@/types/client-project';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { ImageUploader } from '@/components/admin/image-uploader';

const PROJECT_PRESET_IMAGES = [
  { label: 'BPE Online UPS Rack', url: '/products/bpe-online-ups-hq.png' },
  { label: 'BPE High-Cap 6kVA', url: '/products/bpe-mf-6kva.png' },
  { label: 'Microtek Inverter Unit', url: '/products/microtek-vturbo-clean.png' },
  { label: 'Lithium LiFePO4 Bank', url: '/products/microtek-i-lithium-1500-clean.png' },
  { label: 'Amaron Quanta SMF', url: '/products/amaron-quanta-clean.png' },
  { label: 'Exide Powersafe AGM', url: '/products/exide-powersafe-hq.png' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'quotations' | 'certifications' | 'clients' | 'settings'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [clientProjects, setClientProjects] = useState<ClientProject[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Client Projects Management State
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ClientProject | null>(null);
  const [projectModalError, setProjectModalError] = useState<string | null>(null);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [projectSectorFilter, setProjectSectorFilter] = useState<string>('all');
  const [clientProjectsPage, setClientProjectsPage] = useState<number>(1);
  const clientProjectsPerPage = 6;
  const [newProjectData, setNewProjectData] = useState({
    clientName: '',
    sector: 'Healthcare & Hospitals' as ClientSector,
    location: 'Secunderabad / Hyderabad',
    systemInstalled: '',
    imageUrl: '/products/bpe-online-ups-hq.png',
    isFeatured: true,
  });

  // Products Management State & Pagination
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productsPage, setProductsPage] = useState<number>(1);
  const productsPerPage = 6;
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<(Product & { featuresText?: string }) | null>(null);
  const [productErrors, setProductErrors] = useState<Record<string, string>>({});
  const [productModalError, setProductModalError] = useState<string | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [productSubView, setProductSubView] = useState<'catalog' | 'sorting'>('catalog');
  const [selectedSortCategory, setSelectedSortCategory] = useState<string>('ups');
  const [categorySortConfigs, setCategorySortConfigs] = useState<Record<string, CategorySortConfig>>({});
  const [activeBrandOrder, setActiveBrandOrder] = useState<string[]>([]);
  const [activeProductOrder, setActiveProductOrder] = useState<Record<string, number>>({});
  const [isSavingCategorySort, setIsSavingCategorySort] = useState(false);
  const existingBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort();
  }, [products]);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    category: 'inverters' as string,
    price: '' as unknown as number,
    comparePrice: '' as unknown as number,
    stock: '' as unknown as number,
    shortDescription: '',
    imageUrl: '',
    sku: '',
    capacity: '',
    warrantyPeriod: '',
    sortOrder: 10,
    features: '',
    keySpecs: [] as { label: string; value: string }[],
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
  const [isSubmittingVendor, setIsSubmittingVendor] = useState(false);

  // Cert Form Errors
  const [certErrors, setCertErrors] = useState<Record<string, string>>({});
  const [certModalError, setCertModalError] = useState<string | null>(null);
  const [isSubmittingCert, setIsSubmittingCert] = useState(false);

  // Edit Cert Form Errors
  const [editCertErrors, setEditCertErrors] = useState<Record<string, string>>({});
  const [editCertModalError, setEditCertModalError] = useState<string | null>(null);
  const [isUpdatingCert, setIsUpdatingCert] = useState(false);

  // Settings Errors
  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({});

  // Super Admin Password Management
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Categories / Solutions state
  const [categories, setCategories] = useState<SolutionCategoryItem[]>([]);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newCategoryError, setNewCategoryError] = useState<string | null>(null);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // Detailed Order & Vendor Dispatch Sheet Modal & Pagination
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [copiedOrderDetails, setCopiedOrderDetails] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'dispatched' | 'delivered' | 'paid'>('all');
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});
  const [ordersPage, setOrdersPage] = useState<number>(1);
  const ordersPerPage = 6;

  // Quotations Routing View States & Pagination
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<QuotationRequest | null>(null);
  const [quoteSearchQuery, setQuoteSearchQuery] = useState('');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<'all' | 'submitted' | 'under_review' | 'quoted' | 'accepted' | 'rejected'>('all');
  const [expandedQuoteIds, setExpandedQuoteIds] = useState<Record<string, boolean>>({});
  const [quotesPage, setQuotesPage] = useState<number>(1);
  const quotesPerPage = 6;
  const [quotePriceInputs, setQuotePriceInputs] = useState<Record<string, string>>({});

  // Branded In-App Deletion Confirmation Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    isProcessing?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  const [newVendorData, setNewVendorData] = useState({
    businessName: '',
    tradeName: '',
    registrationNumber: '',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    commissionRate: '' as unknown as number,
    allowedCategories: [] as string[],
    address: {
      line1: '',
      city: 'Secunderabad',
      district: 'Hyderabad',
      state: 'Telangana',
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
            router.replace('/admin/login');
            return;
          }
        }

        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (ignore) return;
        if (!res.ok || !data.authenticated || (data.user.role !== 'admin' && data.user.role !== 'super_admin')) {
          router.replace('/admin/login');
          return;
        }
        setCurrentUser(data.user);
        if (data.sessionTimeoutMinutes) {
          setSessionTimeoutMinutes(data.sessionTimeoutMinutes);
        }
        setLoading(false);
      } catch {
        if (!ignore) {
          router.replace('/admin/login');
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
          const [prodRes, ordersRes, quotesRes, certsRes, vendorsRes, clientsRes] = await Promise.all([
            fetch('/api/vendor/products'),
            fetch('/api/orders'),
            fetch('/api/quotations'),
            fetch('/api/admin/certifications'),
            fetch('/api/admin/vendors'),
            fetch('/api/admin/clients'),
          ]);
          const prodData = await prodRes.json();
          const ordersData = await ordersRes.json();
          const quotesData = await quotesRes.json();
          const certsData = await certsRes.json();
          const vendorsData = await vendorsRes.json();
          const clientsData = await clientsRes.json();
          if (!ignore) {
            if (prodData.products) setProducts(prodData.products);
            if (ordersData.orders) setOrders(ordersData.orders);
            if (quotesData.quotations) setQuotations(quotesData.quotations);
            if (certsData.certifications) setCertifications(certsData.certifications);
            if (vendorsData.vendors) setVendors(vendorsData.vendors);
            if (clientsData.projects) setClientProjects(clientsData.projects);
          }
        } else if (activeTab === 'products') {
          const [res, sortRes] = await Promise.all([
            fetch('/api/vendor/products'),
            fetch('/api/admin/categories/sorting'),
          ]);
          const data = await res.json();
          const sortData = await sortRes.json();
          if (!ignore) {
            if (data.products) setProducts(data.products);
            if (sortData.configs && Array.isArray(sortData.configs)) {
              const configMap: Record<string, CategorySortConfig> = {};
              for (const c of sortData.configs) {
                configMap[c.categoryId] = c;
              }
              setCategorySortConfigs(configMap);
            }
          }
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
        } else if (activeTab === 'clients') {
          const res = await fetch('/api/admin/clients');
          const data = await res.json();
          if (!ignore && data.projects) setClientProjects(data.projects);
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

  // Close User Profile menu on click outside
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#admin-user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('click', handleGlobalClick);
    }
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [userMenuOpen]);

  // Products CRUD Handlers
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingProduct) return;
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

    setIsSubmittingProduct(true);
    try {
      const featureList = productForm.features
        ? productForm.features.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

      // Combine user specs with category and brand
      const userSpecs = (productForm.keySpecs || []).filter((s) => s.label.trim() && s.value.trim());
      const specsList = [...userSpecs];
      if (!specsList.some((s) => s.label.toLowerCase() === 'category')) {
        specsList.unshift({ label: 'Category', value: productForm.category.toUpperCase() });
      }
      if (!specsList.some((s) => s.label.toLowerCase() === 'brand')) {
        specsList.splice(1, 0, { label: 'Brand', value: productForm.brand });
      }

      const res = await fetch('/api/vendor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          features: featureList,
          keySpecs: specsList,
          technicalSpecs: {
            category: productForm.category,
            specs:
              productForm.category === 'inverters'
                ? { vaRating: 1100, wattageCapacity: 900, nominalBatteryVoltage: '12V', waveform: 'Pure Sine Wave' }
                : productForm.category === 'batteries'
                ? { capacityAh: 150, nominalVoltage: '12V', plateTechnology: 'Tall Tubular', warrantyMonths: 36 }
                : { topology: 'Online Double Conversion', capacityVa: 1000, capacityWatts: 800, transferTimeMs: 0, powerFactor: 0.9 },
          },
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
        category: categories[0]?.id || 'inverters',
        price: '' as unknown as number,
        comparePrice: '' as unknown as number,
        stock: '' as unknown as number,
        shortDescription: '',
        imageUrl: '',
        sku: '',
        capacity: '',
        warrantyPeriod: '',
        sortOrder: 10,
        features: '',
        keySpecs: [],
      });
      reloadData();
    } catch (err) {
      setProductModalError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || isUpdatingProduct) return;
    setProductModalError(null);
    setIsUpdatingProduct(true);

    try {
      const featureList = editingProduct.features || [];
      const userSpecs = (editingProduct.keySpecs || []).filter((s) => s.label.trim() && s.value.trim());

      const res = await fetch('/api/vendor/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editingProduct.id,
          name: editingProduct.name,
          brand: editingProduct.brand,
          category: editingProduct.category,
          price: Number(editingProduct.price),
          comparePrice: editingProduct.comparePrice ? Number(editingProduct.comparePrice) : undefined,
          stock: Number(editingProduct.stock),
          sku: editingProduct.sku,
          capacity: editingProduct.capacity,
          warrantyPeriod: editingProduct.warrantyPeriod,
          shortDescription: editingProduct.shortDescription,
          imageUrl: editingProduct.imageUrl,
          sortOrder: editingProduct.sortOrder !== undefined ? Number(editingProduct.sortOrder) : 999,
          features: featureList,
          keySpecs: userSpecs,
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
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  // Synchronize category brand and product sorting state whenever selectedSortCategory, categorySortConfigs, or products change
  useEffect(() => {
    const catProducts = products.filter((p) => p.category === selectedSortCategory);
    const catBrands = Array.from(new Set(catProducts.map((p) => (p.brand || '').trim()).filter(Boolean)));

    const existingConfig = categorySortConfigs[selectedSortCategory];
    let brands = existingConfig?.brandOrder ? [...existingConfig.brandOrder] : [];
    for (const b of catBrands) {
      if (!brands.some((existing) => existing.toLowerCase() === b.toLowerCase())) {
        brands.push(b);
      }
    }
    brands = brands.filter((b) => catBrands.some((cb) => cb.toLowerCase() === b.toLowerCase()));
    if (brands.length === 0 && catBrands.length > 0) {
      brands = catBrands;
    }
    // Default BPE first in Online UPS if not previously saved
    if (selectedSortCategory === 'ups' && !existingConfig) {
      brands.sort((a, b) => {
        if (a.toLowerCase() === 'bpe') return -1;
        if (b.toLowerCase() === 'bpe') return 1;
        return a.localeCompare(b);
      });
    }

    setActiveBrandOrder(brands);

    const prodMap: Record<string, number> = {};
    for (const b of brands) {
      const bProds = catProducts.filter((p) => (p.brand || '').trim().toLowerCase() === b.toLowerCase());
      bProds.forEach((p, idx) => {
        prodMap[p.id] = existingConfig?.productOrder?.[p.id] ?? idx + 1;
      });
    }
    setActiveProductOrder(prodMap);
  }, [selectedSortCategory, categorySortConfigs, products]);

  const handleBrandRankChange = (brandName: string, newRank: number) => {
    const targetIdx = Math.max(0, Math.min(activeBrandOrder.length - 1, newRank - 1));
    const currentIdx = activeBrandOrder.indexOf(brandName);
    if (currentIdx === -1 || currentIdx === targetIdx) return;
    const updated = [...activeBrandOrder];
    updated.splice(currentIdx, 1);
    updated.splice(targetIdx, 0, brandName);
    setActiveBrandOrder(updated);
  };

  const handleSaveCategorySort = async () => {
    setIsSavingCategorySort(true);
    try {
      const res = await fetch('/api/admin/categories/sorting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedSortCategory,
          brandOrder: activeBrandOrder,
          productOrder: activeProductOrder,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save category sorting');

      if (data.config) {
        setCategorySortConfigs((prev) => ({
          ...prev,
          [selectedSortCategory]: data.config,
        }));
      }

      // Re-fetch products to update continuous sortOrders in local state
      const prodRes = await fetch('/api/vendor/products');
      const prodData = await prodRes.json();
      if (prodData.products) setProducts(prodData.products);

      const catName = categories.find((c) => c.id === selectedSortCategory)?.name || selectedSortCategory;
      setMessage({
        type: 'success',
        text: `✓ ${catName} sorting saved! ${activeBrandOrder[0] || 'Selected'} brand products will display first on the storefront in arranged sequence.`,
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save category sorting',
      });
    } finally {
      setIsSavingCategorySort(false);
    }
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      title: 'Delete Equipment Model',
      description: `Are you sure you want to permanently delete "${productName}" from the catalog? This will remove the model and all related inventory records from the store.`,
      confirmLabel: 'Permanently Delete Product',
      onConfirm: async () => {
        try {
          setDeleteConfirmation((prev) => (prev ? { ...prev, isProcessing: true } : null));
          const res = await fetch(`/api/vendor/products?productId=${productId}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to delete product');

          setMessage({ type: 'success', text: `Product "${productName}" deleted successfully!` });
          setDeleteConfirmation(null);
          reloadData();
        } catch (err) {
          setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete product' });
          setDeleteConfirmation(null);
        }
      },
    });
  };

  // Certifications CRUD Handlers
  const handleCreateCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingCert) return;
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

    setIsSubmittingCert(true);
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
    } finally {
      setIsSubmittingCert(false);
    }
  };

  const handleUpdateCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert || isUpdatingCert) return;
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

    setIsUpdatingCert(true);
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
    } finally {
      setIsUpdatingCert(false);
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

  const handleDeleteCertification = (id: string, title: string) => {
    setDeleteConfirmation({
      isOpen: true,
      title: 'Delete Certification Record',
      description: `Are you sure you want to permanently delete certification "${title}"? This record will be removed from storefront compliance badges.`,
      confirmLabel: 'Permanently Delete Certification',
      onConfirm: async () => {
        try {
          setDeleteConfirmation((prev) => (prev ? { ...prev, isProcessing: true } : null));
          const res = await fetch(`/api/admin/certifications?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setMessage({ type: 'success', text: 'Certification record deleted successfully' });
          setDeleteConfirmation(null);
          reloadData();
        } catch (err) {
          setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Delete failed' });
          setDeleteConfirmation(null);
        }
      },
    });
  };

  // Client Projects Handlers
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingProject) return;
    setProjectModalError(null);

    if (!newProjectData.clientName.trim()) {
      setProjectModalError('Client or organization name is required.');
      return;
    }
    if (!newProjectData.systemInstalled.trim()) {
      setProjectModalError('System / equipment installed is required.');
      return;
    }
    if (!newProjectData.location.trim()) {
      setProjectModalError('Installation location is required.');
      return;
    }

    setIsSubmittingProject(true);
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProjectData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save customer project');

      setMessage({ type: 'success', text: `Project "${newProjectData.clientName}" created successfully!` });
      setShowAddProjectModal(false);
      setNewProjectData({
        clientName: '',
        sector: 'Healthcare & Hospitals',
        location: 'Secunderabad / Hyderabad',
        systemInstalled: '',
        imageUrl: '/products/bpe-online-ups-hq.png',
        isFeatured: true,
      });
      reloadData();
    } catch (err) {
      setProjectModalError(err instanceof Error ? err.message : 'Failed to save customer project');
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || isSubmittingProject) return;
    setProjectModalError(null);

    if (!editingProject.clientName.trim()) {
      setProjectModalError('Client or organization name is required.');
      return;
    }
    if (!editingProject.systemInstalled.trim()) {
      setProjectModalError('System / equipment installed is required.');
      return;
    }

    setIsSubmittingProject(true);
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update customer project');

      setMessage({ type: 'success', text: `Project "${editingProject.clientName}" updated successfully!` });
      setEditingProject(null);
      reloadData();
    } catch (err) {
      setProjectModalError(err instanceof Error ? err.message : 'Failed to update customer project');
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const toggleProjectFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isFeatured: !currentFeatured }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle featured status');
      setMessage({
        type: 'success',
        text: `Project is now ${!currentFeatured ? 'Featured on Website' : 'Hidden from Website'}`,
      });
      reloadData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Action failed' });
    }
  };

  const handleDeleteProject = (id: string, clientName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      title: 'Delete Customer Project',
      description: `Are you sure you want to permanently delete "${clientName}" from customer projects? This will remove the case study and installation photos from the public showcase.`,
      confirmLabel: 'Permanently Delete Project',
      onConfirm: async () => {
        try {
          setDeleteConfirmation((prev) => (prev ? { ...prev, isProcessing: true } : null));
          const res = await fetch(`/api/admin/clients?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to delete client project');

          setMessage({ type: 'success', text: `Project "${clientName}" deleted successfully!` });
          setDeleteConfirmation(null);
          reloadData();
        } catch (err) {
          setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete client project' });
          setDeleteConfirmation(null);
        }
      },
    });
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
    setDeleteConfirmation({
      isOpen: true,
      title: 'Remove Delivery PIN Code',
      description: `Are you sure you want to remove PIN code ${pincode} from eligible delivery zones?`,
      confirmLabel: 'Remove PIN Rule',
      onConfirm: () => {
        if (!settings) return;
        const updated = (settings.eligiblePincodes || []).filter((r) => r.pincode !== pincode);
        setSettings({ ...settings, eligiblePincodes: updated });
        setMessage({ type: 'success', text: `Removed PIN ${pincode}. Remember to click "Save Platform Policies" to persist.` });
        setDeleteConfirmation(null);
      },
    });
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('rps_admin_window_session');
      sessionStorage.removeItem('rps_admin_login_timestamp');
    }
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login?reason=logged_out');
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

  // Idle Activity Session Timeout Enforcement (15 minutes default)
  useEffect(() => {
    if (!currentUser) return;

    let timeoutId: NodeJS.Timeout;
    const timeoutMs = (sessionTimeoutMinutes || 15) * 60 * 1000;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleSessionExpired('session_expired');
      }, timeoutMs);
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Start timer on initial mount
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [currentUser, sessionTimeoutMinutes, handleSessionExpired]);


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

  // Quotation status & price update
  const handleUpdateQuotationStatus = async (
    quotationId: string,
    status: QuotationStatus,
    note?: string,
    quotedAmount?: number
  ) => {
    try {
      const res = await fetch('/api/quotations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId,
          status,
          note: note || `Status updated to ${status.replace('_', ' ').toUpperCase()} by admin desk`,
          quotedAmount: quotedAmount !== undefined ? quotedAmount : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({
        type: 'success',
        text: `Quotation updated: ${status.toUpperCase()}${quotedAmount ? ` (Quoted: ₹${quotedAmount.toLocaleString('en-IN')})` : ''}`,
      });
      reloadData();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update quotation' });
    }
  };

  // Quotation deletion with branded confirmation
  const handleDeleteQuotation = (quotationId: string, quotationNumber: string) => {
    setDeleteConfirmation({
      isOpen: true,
      title: 'Delete Customer Inquiry & Quotation',
      description: `Are you sure you want to delete quotation request ${quotationNumber}? This action will permanently remove it from the system and database.`,
      confirmLabel: 'Delete Quotation',
      onConfirm: async () => {
        try {
          setDeleteConfirmation((prev) => (prev ? { ...prev, isProcessing: true } : null));
          const res = await fetch(`/api/quotations?id=${encodeURIComponent(quotationId)}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setMessage({ type: 'success', text: `Quotation ${quotationNumber} deleted successfully!` });
          setDeleteConfirmation(null);
          reloadData();
        } catch (err) {
          setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete quotation' });
          setDeleteConfirmation(null);
        }
      },
    });
  };



  // Create new solution category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingCategory) return;
    if (!newCategoryName.trim()) {
      setNewCategoryError('Category / solution name is required');
      return;
    }
    setIsSubmittingCategory(true);
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('rps-categories-updated'));
      }
    } catch (err) {
      setNewCategoryError(err instanceof Error ? err.message : 'Failed to create solution');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  // Create Vendor
  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingVendor) return;
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

    setIsSubmittingVendor(true);
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

      setMessage({
        type: 'success',
        text: `Vendor partner "${newVendorData.businessName}" created successfully!`,
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
    } finally {
      setIsSubmittingVendor(false);
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setPasswordFeedback({ type: 'success', text: 'Super Admin password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update password',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#0B172F] flex flex-col items-center justify-center text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-[#D52B30] mb-3" />
        <p className="text-xs uppercase tracking-widest font-bold text-slate-300">Verifying Admin Access...</p>
      </div>
    );
  }

  const pageMeta: Record<string, { title: string; subtitle: string; category: string }> = {
    overview: {
      title: 'Store Overview',
      subtitle: 'Real-time overview of store performance, orders, and inquiries.',
      category: 'Overview',
    },
    products: {
      title: 'Products & Inventory',
      subtitle: 'Manage equipment catalog, selling prices, and live stock.',
      category: 'Store & Catalog',
    },
    orders: {
      title: 'Customer Orders',
      subtitle: 'Review customer orders, payment status, and dispatch fulfillment.',
      category: 'Operations',
    },
    quotations: {
      title: 'Customer Inquiries & Quotes',
      subtitle: 'Review contact inquiries, price quotes, and consultation requests.',
      category: 'Quotes',
    },
    certifications: {
      title: 'Brand Certifications',
      subtitle: 'Manage official manufacturer dealer certificates and quality credentials.',
      category: 'Compliance',
    },
    clients: {
      title: 'Clients & Work Projects',
      subtitle: 'Manage client installations, commercial projects, testimonials & setup photos.',
      category: 'Showcase',
    },
    settings: {
      title: 'Settings & Security',
      subtitle: 'Update superadmin password, delivery PIN codes, and store rules.',
      category: 'Settings',
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 cursor-pointer transition-colors"
            title="Sign Out of Admin"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
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
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white/10 text-white font-semibold border-l-3 border-[#D52B30]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-300 shrink-0" />
              <span>Overview</span>
            </button>
          </div>

          {/* Section 1: Store & Catalog */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Store &amp; Operations
            </span>

            <button
              onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-white/10 text-white font-semibold border-l-3 border-[#D52B30]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
              }`}
            >
              <Package className="w-4 h-4 text-slate-300 shrink-0" />
              <span>Products &amp; Inventory</span>
            </button>

            <button
              onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-white/10 text-white font-semibold border-l-3 border-[#D52B30]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-slate-300 shrink-0" />
              <span>Customer Orders</span>
            </button>

            <button
              onClick={() => { setActiveTab('quotations'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTab === 'quotations'
                  ? 'bg-white/10 text-white font-semibold border-l-3 border-[#D52B30]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-slate-300 shrink-0" />
              <span>Inquiries &amp; Quotes</span>
            </button>

            <button
              onClick={() => { setActiveTab('clients'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-white/10 text-white font-semibold border-l-3 border-[#D52B30]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
              }`}
            >
              <Briefcase className="w-4 h-4 text-slate-300 shrink-0" />
              <span>Clients &amp; Work Projects</span>
            </button>
          </div>

          {/* Section 2: Governance & Settings */}
          <div className="space-y-1 pt-3 border-t border-slate-800/80">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Compliance &amp; Settings
            </span>

            <button
              onClick={() => { setActiveTab('certifications'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTab === 'certifications'
                  ? 'bg-white/10 text-white font-semibold border-l-3 border-[#D52B30]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
              }`}
            >
              <Award className="w-4 h-4 text-slate-300 shrink-0" />
              <span>Brand Certifications</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white/10 text-white font-semibold border-l-3 border-[#D52B30]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-300 shrink-0" />
              <span>Settings &amp; Policies</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Bar */}
        <header className="bg-white border-b border-slate-200/90 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs">
          <div>
            <h1 className="text-xl font-extrabold text-[#142B55] tracking-tight">
              {pageMeta[activeTab]?.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {pageMeta[activeTab]?.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={reloadData}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh store data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#142B55]" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Top Navbar Profile & Sign Out Dropdown */}
            <div id="admin-user-menu-container" className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-7 h-7 rounded-full bg-[#142B55] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                  {currentUser?.name ? currentUser.name.replace(/super admin/i, '').replace(/[()]/g, '').trim() || 'RPS Executive' : 'RPS Executive'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Account Summary Header */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-[#142B55] flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                      <User className="w-4 h-4 text-[#142B55]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-slate-900 truncate">
                        {currentUser?.name ? currentUser.name.replace(/super admin/i, '').replace(/[()]/g, '').trim() || 'RPS Executive' : 'RPS Executive'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                        {currentUser?.email || 'admin@rajpowertech.com'}
                      </p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1 text-xs">
                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#142B55] transition-colors"
                    >
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span>Visit RPS Storefront</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('settings');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#142B55] transition-colors cursor-pointer text-left"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings &amp; Password</span>
                    </button>
                  </div>

                  {/* Sign Out Action */}
                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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

        {/* TAB 0: STORE OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

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
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Store Revenue</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#142B55] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <ShoppingBag className="w-4 h-4 text-[#142B55]" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#142B55]">
                          ₹{totalRevenue.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Across {orders.length} customer orders
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
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Inquiries</span>
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#D52B30] flex items-center justify-center group-hover:scale-105 transition-transform">
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
                        From Contact Us &amp; Quotations form
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-rose-700 font-semibold">{pendingQuotes} Requiring Response</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Card 3: Product Catalog */}
                  <div
                    onClick={() => setActiveTab('products')}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Product Catalog</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Package className="w-4 h-4 text-emerald-700" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">
                          {products.length}
                        </span>
                        <span className="text-xs text-slate-500">Products</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Across {categories.length} store categories
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
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Certifications</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Award className="w-4 h-4 text-amber-700" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">
                          {certifications.length}
                        </span>
                        <span className="text-xs text-slate-500">Verified OEM</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Verified OEM &amp; Partner credentials
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-amber-700 font-semibold">Active &amp; Published</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })()}

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
            {/* View Mode Switcher: Catalog vs Category & Brand Sorting */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => setProductSubView('catalog')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  productSubView === 'catalog'
                    ? 'bg-[#142B55] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Catalog &amp; Inventory</span>
              </button>

              <button
                type="button"
                onClick={() => setProductSubView('sorting')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  productSubView === 'sorting'
                    ? 'bg-[#142B55] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Category &amp; Brand Display Sorting</span>
              </button>
            </div>

            {/* SUB-VIEW 1: REGULAR CATALOG & INVENTORY */}
            {productSubView === 'catalog' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#142B55]">Store Products &amp; Catalog</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage equipment items, pricing, specs, and stock levels.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Category Filter Pills (Clean, no counts) */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium overflow-x-auto max-w-full">
                      <button
                        type="button"
                        onClick={() => {
                          setProductCategoryFilter('all');
                          setProductsPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer whitespace-nowrap ${
                          productCategoryFilter === 'all'
                            ? 'bg-white text-[#142B55] shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setProductCategoryFilter(cat.id);
                            setProductsPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer whitespace-nowrap ${
                            productCategoryFilter.toLowerCase() === cat.id.toLowerCase()
                              ? 'bg-white text-[#142B55] shadow-2xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="navy"
                        size="sm"
                        onClick={() => setShowNewCategoryModal(true)}
                        icon={<Plus className="w-4 h-4 text-white" />}
                        className="bg-[#142B55] hover:bg-[#0B172F] text-white cursor-pointer font-bold whitespace-nowrap shadow-xs"
                      >
                        Create Category
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowAddProductModal(true)}
                        icon={<Plus className="w-4 h-4" />}
                        className="bg-[#D52B30] hover:bg-[#B51E22] text-white cursor-pointer font-semibold whitespace-nowrap shadow-xs"
                      >
                        Add Product
                      </Button>
                    </div>
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
                      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                        <Package className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-sm font-bold text-slate-700">No products found in this category</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Click below to add equipment directly to this category.
                        </p>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setShowAddProductModal(true)}
                          icon={<Plus className="w-4 h-4" />}
                          className="bg-[#D52B30] hover:bg-[#B51E22] text-white"
                        >
                          Add Product
                        </Button>
                      </div>
                    );
                  }

                  const paginatedProducts = filtered.slice(
                    (productsPage - 1) * productsPerPage,
                    productsPage * productsPerPage
                  );

                  return (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {paginatedProducts.map((p) => (
                          <div
                            key={p.id}
                            className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                          >
                            {/* Clean Product Image Container */}
                            <div className="h-44 w-full bg-slate-50 border-b border-slate-100 flex items-center justify-center p-3 relative">
                              <img
                                src={p.imageUrl || '/products/inverter-demo-1.jpg'}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                  const img = e.currentTarget as HTMLImageElement;
                                  if (!img.dataset.hasFailed) {
                                    img.dataset.hasFailed = 'true';
                                    img.src = '/products/inverter-demo-1.jpg';
                                  }
                                }}
                              />
                            </div>

                            {/* Content & Specs */}
                            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">{p.brand}</span>
                                    {typeof p.sortOrder === 'number' && p.sortOrder < 100 && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                                        #{p.sortOrder} on Store
                                      </span>
                                    )}
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 capitalize">
                                    {p.category?.replace(/-/g, ' ')}
                                  </span>
                                </div>

                                <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">{p.name}</h3>
                                {p.capacity && (
                                  <p className="text-[11px] font-medium text-slate-500 mt-1">
                                    Capacity: <span className="text-slate-700">{p.capacity}</span>
                                  </p>
                                )}

                                <div className="bg-slate-50/80 p-2.5 rounded-xl text-xs space-y-1 mt-2.5 border border-slate-100">
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-slate-500 text-[11px]">Price:</span>
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
                                  <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500">Stock:</span>
                                    <span className={`font-semibold ${p.stock && p.stock > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                      {p.stock && p.stock > 0 ? `${p.stock} units available` : 'Out of stock'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct({
                                      ...p,
                                      featuresText: Array.isArray(p.features) ? p.features.join(', ') : '',
                                      features: Array.isArray(p.features) ? p.features : [],
                                      keySpecs: p.keySpecs && Array.isArray(p.keySpecs) && p.keySpecs.length > 0
                                        ? p.keySpecs
                                        : [
                                            { label: 'Category', value: (p.category || 'inverters').toUpperCase() },
                                            { label: 'Brand', value: p.brand || '' },
                                            ...(p.capacity ? [{ label: 'Capacity', value: p.capacity }] : []),
                                            ...(p.warrantyPeriod ? [{ label: 'Warranty', value: p.warrantyPeriod }] : []),
                                          ],
                                    });
                                  }}
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

                      {/* Products Pagination */}
                      <AdminPagination
                        currentPage={productsPage}
                        totalItems={filtered.length}
                        itemsPerPage={productsPerPage}
                        onPageChange={setProductsPage}
                        itemLabel="products"
                      />
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SUB-VIEW 2: CATEGORY & BRAND SORTING STUDIO (ZERO ARROWS) */}
            {productSubView === 'sorting' && (
              <div className="space-y-6">
                {/* Introduction & Quick Save Bar */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-[#142B55] flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-[#D52B30]" />
                        <span>Category &amp; Brand Display Sorting</span>
                      </h2>
                      <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                        Control exactly which brand appears first for each category (e.g. show BPE first in Online UPS) and arrange model sequence. No arrows — set simple priority numbers.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={isSavingCategorySort}
                      onClick={handleSaveCategorySort}
                      className="bg-[#D52B30] hover:bg-[#b82226] text-white font-bold whitespace-nowrap self-start sm:self-auto"
                      icon={isSavingCategorySort ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    >
                      {isSavingCategorySort ? 'Saving Sorting...' : `Save ${categories.find(c => c.id === selectedSortCategory)?.name || 'Category'} Sorting`}
                    </Button>
                  </div>

                  {/* Step 1: Category Selection Tabs */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Step 1: Select Category to Organize
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                      {categories.map((cat) => {
                        const isSelected = selectedSortCategory.toLowerCase() === cat.id.toLowerCase();
                        const pCount = products.filter((p) => (p.category || '').toLowerCase() === cat.id.toLowerCase()).length;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedSortCategory(cat.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? 'bg-[#142B55] text-white shadow-sm scale-[1.02]'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            <span>{cat.name}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                              {pCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Step 2: Brand Priority for Selected Category */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#142B55] text-white text-[11px] font-mono flex items-center justify-center font-bold">1</span>
                      <span>Brand Display Priority in {categories.find(c => c.id === selectedSortCategory)?.name || selectedSortCategory}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Which brand should customers see first? (e.g. choose #1 for BPE so BPE products appear before Microtek).
                    </p>
                  </div>

                  {activeBrandOrder.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                      No products found in this category yet. Add products to configure brand sorting.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {activeBrandOrder.map((brandName, idx) => {
                        const brandProds = products.filter(
                          (p) => (p.category || '').toLowerCase() === selectedSortCategory.toLowerCase() && (p.brand || '').trim().toLowerCase() === brandName.toLowerCase()
                        );
                        return (
                          <div
                            key={brandName}
                            className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              idx === 0
                                ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                                : 'bg-slate-50/70 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                                idx === 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                #{idx + 1}
                              </span>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 uppercase truncate">{brandName}</h4>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {brandProds.length} models {idx === 0 && '• Displays First'}
                                </span>
                              </div>
                            </div>

                            {/* Dropdown to change Brand Rank: NO ARROWS */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Rank:</label>
                              <select
                                value={idx + 1}
                                onChange={(e) => handleBrandRankChange(brandName, Number(e.target.value))}
                                className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#142B55] cursor-pointer shadow-2xs focus:outline-none focus:border-[#142B55]"
                              >
                                {activeBrandOrder.map((_, rIdx) => (
                                  <option key={rIdx + 1} value={rIdx + 1}>
                                    #{rIdx + 1} {rIdx === 0 ? '(1st)' : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Step 3: Product Sequence within each Brand */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#142B55] text-white text-[11px] font-mono flex items-center justify-center font-bold">2</span>
                      <span>Product Sequence within Brands</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Set numerical display sequence for each model (e.g. 1 = 1kVA, 2 = 2kVA, 3 = 3kVA, 4 = 6kVA...).
                    </p>
                  </div>

                  {activeBrandOrder.map((brandName, bIdx) => {
                    const brandProds = products.filter(
                      (p) => (p.category || '').toLowerCase() === selectedSortCategory.toLowerCase() && (p.brand || '').trim().toLowerCase() === brandName.toLowerCase()
                    );

                    // Sort models by activeProductOrder
                    const sortedBrandProds = [...brandProds].sort((a, b) => {
                      const ordA = activeProductOrder[a.id] ?? 999;
                      const ordB = activeProductOrder[b.id] ?? 999;
                      if (ordA !== ordB) return ordA - ordB;
                      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                    });

                    return (
                      <div key={brandName} className="space-y-2.5 p-4 rounded-xl bg-slate-50/60 border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#142B55] text-white uppercase tracking-wider">
                              {brandName}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              (Brand Priority #{bIdx + 1})
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-medium">
                            {sortedBrandProds.length} models
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {sortedBrandProds.map((prod) => (
                            <div
                              key={prod.id}
                              className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                            >
                              <div className="flex items-center gap-4 min-w-0 flex-1">
                                {/* Clear, Visible Product Image (80px x 80px) */}
                                <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200/90 p-2 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                                  <img
                                    src={prod.imageUrl || '/products/inverter-demo-1.jpg'}
                                    alt={prod.name}
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                    className="max-h-full max-w-full object-contain"
                                    onError={(e) => {
                                      const img = e.currentTarget as HTMLImageElement;
                                      if (!img.dataset.hasFailed) {
                                        img.dataset.hasFailed = 'true';
                                        img.src = '/products/inverter-demo-1.jpg';
                                      }
                                    }}
                                  />
                                </div>

                                {/* Readable Product Details */}
                                <div className="min-w-0 space-y-1">
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                                    {prod.name}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                                    <span className="font-extrabold text-[#D52B30]">
                                      ₹{prod.price?.toLocaleString('en-IN') || 'Price on request'}
                                    </span>
                                    {prod.capacity && (
                                      <>
                                        <span className="text-slate-300">&bull;</span>
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                                          Capacity: {prod.capacity}
                                        </span>
                                      </>
                                    )}
                                    {prod.sku && (
                                      <>
                                        <span className="text-slate-300">&bull;</span>
                                        <span className="font-mono text-slate-400 text-[10px]">
                                          SKU: {prod.sku}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Prominent Order Number Input */}
                              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                                <div className="text-right">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Display Order
                                  </span>
                                  <span className="text-[10px] font-bold text-[#142B55]">
                                    {(activeProductOrder[prod.id] ?? 999) === 1
                                      ? '★ Shows First'
                                      : `Position #${activeProductOrder[prod.id] ?? 999}`}
                                  </span>
                                </div>

                                <input
                                  type="number"
                                  min="1"
                                  value={activeProductOrder[prod.id] ?? ''}
                                  placeholder="1"
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 1 : Number(e.target.value);
                                    setActiveProductOrder((prev) => ({
                                      ...prev,
                                      [prod.id]: val,
                                    }));
                                  }}
                                  className="w-16 h-10 px-2 bg-white border-2 border-slate-300 rounded-lg text-center text-sm font-mono font-bold text-[#142B55] focus:outline-none focus:border-[#142B55] shadow-2xs"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Save Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
                  <p className="text-xs text-slate-500">
                    Changes take effect on the customer storefront and category pages immediately upon saving.
                  </p>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    disabled={isSavingCategorySort}
                    onClick={handleSaveCategorySort}
                    className="bg-[#D52B30] hover:bg-[#b82226] text-white font-bold whitespace-nowrap px-6"
                    icon={isSavingCategorySort ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  >
                    {isSavingCategorySort ? 'Saving Sorting...' : `Save ${categories.find(c => c.id === selectedSortCategory)?.name || 'Category'} Sorting`}
                  </Button>
                </div>
              </div>
            )}
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

          const pendingOrdersCount = orders.filter((o) =>
            o.items?.some((i) => i.fulfilmentStatus === 'pending' || i.fulfilmentStatus === 'allocated')
          ).length;
          const inTransitOrdersCount = orders.filter((o) =>
            o.items?.some((i) => i.fulfilmentStatus === 'dispatched')
          ).length;
          const deliveredOrdersCount = orders.filter((o) =>
            o.items?.every((i) => i.fulfilmentStatus === 'delivered')
          ).length;

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
            <div className="space-y-6">

              {/* Top Operational Metrics KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#142B55]">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-[#142B55] tracking-tight">{totalOrdersCount}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      <strong className="text-emerald-700">{paidOrdersCount} Paid</strong> &bull; {totalOrdersCount - paidOrdersCount} Pending COD
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Order Revenue</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">₹{totalGrossVolume.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">Total sales value from customer orders</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Fulfillment</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 tracking-tight">{pendingItemsCount}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Items awaiting dispatch or delivery</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Dispatches</span>
                    <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                      <Truck className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{dispatchedItemsCount + deliveredItemsCount}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      <strong className="text-sky-700">{deliveredItemsCount} Delivered</strong> &bull; {pendingItemsCount} Awaiting Dispatch
                    </p>
                  </div>
                </div>
              </div>

              {/* Two-Tier Search & Status Filter Toolbar */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5">
                {/* Tier 1: Search Input + View Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-2xl">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => {
                        setOrderSearchQuery(e.target.value);
                        setOrdersPage(1);
                      }}
                      placeholder="Search by order #, customer name, phone, city, or product..."
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#142B55] transition-all"
                    />
                    {orderSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setOrderSearchQuery('');
                          setOrdersPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Right Actions: Showing Count & Expand/Collapse Toggle */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-semibold text-slate-500 hidden md:inline">
                      Showing <strong className="text-slate-800">{filteredOrders.length}</strong> of {orders.length} orders
                    </span>

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
                        className="text-xs font-semibold text-slate-700 hover:text-[#142B55] px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                        title={filteredOrders.every((o) => expandedOrderIds[o.id]) ? 'Collapse all orders' : 'Expand all orders'}
                      >
                        {filteredOrders.every((o) => expandedOrderIds[o.id]) ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                            <span>Collapse All</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                            <span>Expand All</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Tier 2: Status Filter Tabs with Counts */}
                <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs font-semibold [scrollbar-width:thin]">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderStatusFilter('all');
                      setOrdersPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      orderStatusFilter === 'all'
                        ? 'bg-[#142B55] text-white shadow-xs font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>All</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${orderStatusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {orders.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrderStatusFilter('pending');
                      setOrdersPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      orderStatusFilter === 'pending'
                        ? 'bg-amber-600 text-white shadow-xs font-bold'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <span>Pending Action</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${orderStatusFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-200/80 text-amber-900'}`}>
                      {pendingOrdersCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrderStatusFilter('dispatched');
                      setOrdersPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      orderStatusFilter === 'dispatched'
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                  >
                    <span>In Transit</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${orderStatusFilter === 'dispatched' ? 'bg-white/20 text-white' : 'bg-indigo-200/80 text-indigo-900'}`}>
                      {inTransitOrdersCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrderStatusFilter('delivered');
                      setOrdersPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      orderStatusFilter === 'delivered'
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <span>Delivered</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${orderStatusFilter === 'delivered' ? 'bg-white/20 text-white' : 'bg-emerald-200/80 text-emerald-900'}`}>
                      {deliveredOrdersCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrderStatusFilter('paid');
                      setOrdersPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      orderStatusFilter === 'paid'
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>Paid</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${orderStatusFilter === 'paid' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
                      {paidOrdersCount}
                    </span>
                  </button>
                </div>
              </div>

              {/* Order Listing */}
              {(() => {
                const paginatedOrders = filteredOrders.slice(
                  (ordersPage - 1) * ordersPerPage,
                  ordersPage * ordersPerPage
                );

                if (filteredOrders.length === 0) {
                  return (
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
                            setOrdersPage(1);
                          }}
                        >
                          Clear Search &amp; Filters
                        </Button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {paginatedOrders.map((ord) => {
                    const isExpanded = !!expandedOrderIds[ord.id];
                    const isFullyDelivered = ord.items.every((i) => i.fulfilmentStatus === 'delivered');
                    const hasDispatched = ord.items.some((i) => i.fulfilmentStatus === 'dispatched');

                    return (
                      <div
                        key={ord.id}
                        className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isExpanded
                            ? 'border-[#142B55] shadow-md ring-2 ring-[#142B55]/10'
                            : 'border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        {/* Precision Grid Order Header Row */}
                        <div
                          onClick={() => {
                            setExpandedOrderIds((prev) => ({
                              ...prev,
                              [ord.id]: !prev[ord.id],
                            }));
                          }}
                          className={`p-3.5 sm:p-4 transition-colors cursor-pointer select-none ${
                            isExpanded ? 'bg-slate-50/80 border-b border-slate-200/80' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4 items-center">
                            {/* Col 1: Order Number, Copy & Date (lg:col-span-3) */}
                            <div className="lg:col-span-3 min-w-0">
                              <div className="flex items-center gap-1.5">
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
                                  className="text-slate-400 hover:text-[#142B55] p-1 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{new Date(ord.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              </p>
                            </div>

                            {/* Col 2: Customer Name & Destination (lg:col-span-3) */}
                            <div className="lg:col-span-3 min-w-0 flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#142B55] text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
                                {ord.customer.fullName.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-900 truncate capitalize">
                                  {ord.customer.fullName}
                                </p>
                                <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate capitalize mt-0.5">
                                  <MapPin className="w-3 h-3 text-[#D52B30] shrink-0" />
                                  <span className="truncate">{ord.customer.city}, {ord.customer.state}</span>
                                </p>
                              </div>
                            </div>

                            {/* Col 3: Items Count & Total Price (lg:col-span-2) */}
                            <div className="lg:col-span-2 min-w-0">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                                <span className="text-xs sm:text-sm font-extrabold text-[#142B55]">
                                  ₹{ord.totalAmount.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Package className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{ord.items.length} {ord.items.length === 1 ? 'Product' : 'Products'}</span>
                              </p>
                            </div>

                            {/* Col 4: Payment & Fulfillment Status Badges (lg:col-span-2) */}
                            <div className="lg:col-span-2 flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap shadow-2xs ${
                                  ord.paymentStatus === 'paid'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {ord.paymentStatus === 'paid' ? (
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Clock className="w-3 h-3 text-amber-600" />
                                )}
                                <span>{ord.paymentStatus === 'paid' ? 'PAID' : 'COD PENDING'}</span>
                              </span>

                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap shadow-2xs ${
                                  ord.orderStatus === 'fulfilled' || isFullyDelivered
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : ord.orderStatus === 'partially_fulfilled' || hasDispatched
                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                    : ord.orderStatus === 'cancelled'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-sky-100 text-sky-800 border border-sky-200'
                                }`}
                              >
                                <span>
                                  {ord.orderStatus === 'fulfilled' || isFullyDelivered
                                    ? 'DELIVERED'
                                    : ord.orderStatus === 'partially_fulfilled' || hasDispatched
                                    ? 'IN TRANSIT'
                                    : ord.orderStatus.toUpperCase()}
                                </span>
                              </span>
                            </div>

                            {/* Col 5: Manage & Details Button (lg:col-span-2 text-right) */}
                            <div className="lg:col-span-2 flex items-center justify-end">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedOrderIds((prev) => ({
                                    ...prev,
                                    [ord.id]: !prev[ord.id],
                                  }));
                                }}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap ${
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
                                  <span>Customer Contact Information</span>
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

                  {/* Orders Pagination */}
                  <AdminPagination
                    currentPage={ordersPage}
                    totalItems={filteredOrders.length}
                    itemsPerPage={ordersPerPage}
                    onPageChange={setOrdersPage}
                    itemLabel="orders"
                  />
                </div>
              );
            })()}
          </div>
        );
      })()}

        {/* TAB 4: INQUIRIES & QUOTATIONS MANAGEMENT */}
        {activeTab === 'quotations' && (() => {
          const totalQuotes = quotations.length;
          const submittedQuotesCount = quotations.filter((q) => q.status === 'submitted').length;
          const underReviewQuotesCount = quotations.filter((q) => q.status === 'under_review').length;
          const awaitingQuotesCount = submittedQuotesCount + underReviewQuotesCount;
          const officialQuoted = quotations.filter((q) => q.status === 'quoted').length;
          const acceptedQuotes = quotations.filter((q) => q.status === 'accepted').length;
          const rejectedQuotes = quotations.filter((q) => q.status === 'rejected' || q.status === 'declined').length;

          const query = quoteSearchQuery.toLowerCase().trim();
          const filteredQuotes = quotations.filter((q) => {
            const matchesSearch =
              !query ||
              q.quotationNumber.toLowerCase().includes(query) ||
              q.customerName.toLowerCase().includes(query) ||
              q.customerPhone.includes(query) ||
              (q.companyName && q.companyName.toLowerCase().includes(query)) ||
              q.cityOrDistrict.toLowerCase().includes(query) ||
              (q.productName && q.productName.toLowerCase().includes(query)) ||
              q.category.toLowerCase().includes(query);

            if (!matchesSearch) return false;

            if (quoteStatusFilter === 'submitted') return q.status === 'submitted';
            if (quoteStatusFilter === 'under_review') return q.status === 'under_review';
            if (quoteStatusFilter === 'quoted') return q.status === 'quoted';
            if (quoteStatusFilter === 'accepted') return q.status === 'accepted';
            if (quoteStatusFilter === 'rejected') return q.status === 'rejected' || q.status === 'declined';
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
                    <span className="text-[11px] font-bold uppercase tracking-wider">Awaiting Quote</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-amber-700">{awaitingQuotesCount}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{submittedQuotesCount} New &bull; {underReviewQuotesCount} Reviewing</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Quoted Proposals</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-blue-900">{officialQuoted}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Proposals sent to clients</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Accepted Deals</span>
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-700">{acceptedQuotes}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold">Converted commercial orders</p>
                </div>
              </div>

              {/* Two-Tier Search & Filter Toolbar */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                {/* Tier 1: Search Bar & Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-2xl">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={quoteSearchQuery}
                      onChange={(e) => {
                        setQuoteSearchQuery(e.target.value);
                        setQuotesPage(1);
                      }}
                      placeholder="Search by Quote #, Customer Name, Company, Phone, City, Category, or Product..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#142B55] transition-all"
                    />
                    {quoteSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuoteSearchQuery('');
                          setQuotesPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Right Actions: Showing Count & Expand/Collapse Toggle */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-semibold text-slate-500 hidden md:inline">
                      Showing <strong className="text-slate-800">{filteredQuotes.length}</strong> of {quotations.length} inquiries
                    </span>

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
                        className="text-xs font-semibold text-slate-700 hover:text-[#142B55] px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                        title={filteredQuotes.every((q) => expandedQuoteIds[q.id]) ? 'Collapse all inquiries' : 'Expand all inquiries'}
                      >
                        {filteredQuotes.every((q) => expandedQuoteIds[q.id]) ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                            <span>Collapse All</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                            <span>Expand All</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Tier 2: Status Filter Tabs with Counts */}
                <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs font-semibold [scrollbar-width:thin]">
                  <button
                    type="button"
                    onClick={() => {
                      setQuoteStatusFilter('all');
                      setQuotesPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      quoteStatusFilter === 'all'
                        ? 'bg-[#142B55] text-white shadow-xs font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>All</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${quoteStatusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {quotations.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuoteStatusFilter('submitted');
                      setQuotesPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      quoteStatusFilter === 'submitted'
                        ? 'bg-amber-600 text-white shadow-xs font-bold'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <span>New Inquiries</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${quoteStatusFilter === 'submitted' ? 'bg-white/20 text-white' : 'bg-amber-200/80 text-amber-900'}`}>
                      {submittedQuotesCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuoteStatusFilter('under_review');
                      setQuotesPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      quoteStatusFilter === 'under_review'
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                  >
                    <span>Under Review</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${quoteStatusFilter === 'under_review' ? 'bg-white/20 text-white' : 'bg-indigo-200/80 text-indigo-900'}`}>
                      {underReviewQuotesCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuoteStatusFilter('quoted');
                      setQuotesPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      quoteStatusFilter === 'quoted'
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <span>Quoted</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${quoteStatusFilter === 'quoted' ? 'bg-white/20 text-white' : 'bg-blue-200/80 text-blue-900'}`}>
                      {officialQuoted}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuoteStatusFilter('accepted');
                      setQuotesPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      quoteStatusFilter === 'accepted'
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <span>Accepted</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${quoteStatusFilter === 'accepted' ? 'bg-white/20 text-white' : 'bg-emerald-200/80 text-emerald-900'}`}>
                      {acceptedQuotes}
                    </span>
                  </button>

                  {rejectedQuotes > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuoteStatusFilter('rejected');
                        setQuotesPage(1);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        quoteStatusFilter === 'rejected'
                          ? 'bg-rose-600 text-white shadow-xs font-bold'
                          : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      <span>Declined</span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${quoteStatusFilter === 'rejected' ? 'bg-white/20 text-white' : 'bg-rose-200/80 text-rose-900'}`}>
                        {rejectedQuotes}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quotation Listings */}
              {(() => {
                const paginatedQuotes = filteredQuotes.slice(
                  (quotesPage - 1) * quotesPerPage,
                  quotesPage * quotesPerPage
                );

                if (filteredQuotes.length === 0) {
                  return (
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
                            setQuotesPage(1);
                          }}
                        >
                          Clear Search &amp; Filters
                        </Button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {paginatedQuotes.map((q) => {
                        const isExpanded = !!expandedQuoteIds[q.id];
                        const assignedVendorsList = vendors.filter((v) => q.assignedVendorIds?.includes(v.id));

                        return (
                          <div
                            key={q.id}
                            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                              isExpanded
                                ? 'border-[#142B55] shadow-md ring-2 ring-[#142B55]/10'
                                : 'border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs'
                            }`}
                          >
                            {/* Precision Grid Quotation Header Row matching Customer Orders layout */}
                            <div
                              onClick={() => {
                                setExpandedQuoteIds((prev) => ({
                                  ...prev,
                                  [q.id]: !prev[q.id],
                                }));
                              }}
                              className={`p-3.5 sm:p-4 transition-colors cursor-pointer select-none ${
                                isExpanded ? 'bg-slate-50/80 border-b border-slate-200/80' : 'hover:bg-slate-50/50'
                              }`}
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4 items-center">
                                {/* Col 1: Quotation Number, Copy & Date (lg:col-span-3) */}
                                <div className="lg:col-span-3 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-xs sm:text-sm text-[#142B55] tracking-tight">
                                      {q.quotationNumber}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(q.quotationNumber);
                                        setMessage({ type: 'success', text: `Quotation number ${q.quotationNumber} copied!` });
                                      }}
                                      title="Copy Quotation Number"
                                      className="text-slate-400 hover:text-[#142B55] p-1 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>
                                      {new Date(q.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </span>
                                  </p>
                                </div>

                                {/* Col 2: Customer / Organization & Destination (lg:col-span-3) */}
                                <div className="lg:col-span-3 min-w-0 flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-[#142B55] text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
                                    {q.customerName.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    {q.companyName ? (
                                      <p className="text-xs font-bold text-[#142B55] truncate" title={q.companyName}>
                                        {q.companyName}
                                      </p>
                                    ) : null}
                                    <p className={`text-xs truncate ${q.companyName ? 'text-slate-600 font-medium text-[11px]' : 'font-bold text-slate-900'}`}>
                                      {q.customerName}
                                    </p>
                                    <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate capitalize mt-0.5">
                                      <MapPin className="w-3 h-3 text-[#D52B30] shrink-0" />
                                      <span className="truncate">{q.cityOrDistrict}</span>
                                      {q.gstin && (
                                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded border border-emerald-200 ml-1">
                                          GST
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* Col 3: Product Scope & Quantity (lg:col-span-2) */}
                                <div className="lg:col-span-2 min-w-0">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scope</span>
                                    <span className="text-xs font-extrabold text-slate-900 truncate" title={q.productName}>
                                      {q.productName || `${q.category.toUpperCase()} Commercial Solution`}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <span className="font-extrabold text-[#D52B30] bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 text-[10px]">
                                      {q.quantity || 1} Units
                                    </span>
                                    <span>&bull;</span>
                                    <span className="uppercase text-[10px] font-bold text-slate-600 truncate">{q.category}</span>
                                  </p>
                                </div>

                                {/* Col 4: Quoted Price & Status Badge (lg:col-span-2) */}
                                <div className="lg:col-span-2 flex flex-col justify-center">
                                  <div className="flex items-center gap-1.5">
                                    {q.quotedAmount ? (
                                      <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Quoted Price</span>
                                        <span className="text-xs sm:text-sm font-extrabold text-emerald-900">
                                          ₹{q.quotedAmount.toLocaleString('en-IN')}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-[11px] text-amber-700 font-semibold italic bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                        Awaiting Price
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap shadow-2xs ${
                                        q.status === 'accepted'
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                          : q.status === 'quoted'
                                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                          : q.status === 'under_review'
                                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                          : q.status === 'rejected' || q.status === 'declined' || q.status === 'closed'
                                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                                      }`}
                                    >
                                      {q.status === 'accepted' ? (
                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                      ) : q.status === 'quoted' ? (
                                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                      ) : q.status === 'under_review' ? (
                                        <RefreshCw className="w-3 h-3 text-indigo-600" />
                                      ) : (
                                        <Clock className="w-3 h-3 text-amber-600" />
                                      )}
                                      <span>{q.status.replace('_', ' ').toUpperCase()}</span>
                                    </span>
                                  </div>
                                </div>

                                {/* Col 5: Manage & Details Button (lg:col-span-2 text-right) */}
                                <div className="lg:col-span-2 flex items-center justify-end">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedQuoteIds((prev) => ({
                                        ...prev,
                                        [q.id]: !prev[q.id],
                                      }));
                                    }}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap ${
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

                            {/* Expanded Full Quotation Dossier */}
                            {isExpanded && (
                              <div className="p-5 sm:p-7 space-y-6 bg-white animate-in fade-in-50 duration-200 text-xs">
                                {/* Action Toolbar Inside Expanded Inquiry: Live Status, Quoted Pricing & Admin Delete */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                  {/* Left Controls: Status & Quoted Price */}
                                  <div className="flex flex-wrap items-center gap-4 flex-1">
                                    {/* Status Selector */}
                                    <div className="min-w-[180px]">
                                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                                        Quotation Status
                                      </label>
                                      <select
                                        value={q.status}
                                        onChange={(e) => {
                                          const nextStatus = e.target.value as QuotationStatus;
                                          handleUpdateQuotationStatus(
                                            q.id,
                                            nextStatus,
                                            `Status changed to ${nextStatus.replace('_', ' ').toUpperCase()} by administrator`,
                                            q.quotedAmount
                                          );
                                        }}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#142B55] transition-all cursor-pointer shadow-2xs"
                                      >
                                        <option value="submitted">New / Awaiting Review</option>
                                        <option value="under_review">Under Engineering Review</option>
                                        <option value="quoted">Proposal / Quoted</option>
                                        <option value="accepted">Accepted by Client</option>
                                        <option value="rejected">Declined / Closed</option>
                                      </select>
                                    </div>

                                    {/* Quoted Pricing Input */}
                                    <div className="min-w-[220px]">
                                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                                        Official Quoted Price (₹)
                                      </label>
                                      <div className="flex items-center gap-1.5">
                                        <div className="relative flex-1">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                                          <input
                                            type="number"
                                            min="0"
                                            placeholder="e.g. 85000"
                                            value={quotePriceInputs[q.id] ?? (q.quotedAmount ? String(q.quotedAmount) : '')}
                                            onChange={(e) =>
                                              setQuotePriceInputs((prev) => ({
                                                ...prev,
                                                [q.id]: e.target.value,
                                              }))
                                            }
                                            className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#142B55] transition-all shadow-2xs"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const rawVal = quotePriceInputs[q.id] ?? (q.quotedAmount ? String(q.quotedAmount) : '');
                                            const amount = Number(rawVal);
                                            if (isNaN(amount) || amount <= 0) {
                                              setMessage({ type: 'error', text: 'Please enter a valid quoted amount in ₹ INR' });
                                              return;
                                            }
                                            handleUpdateQuotationStatus(
                                              q.id,
                                              q.status === 'submitted' || q.status === 'under_review' ? 'quoted' : q.status,
                                              `Commercial quotation submitted with official price of ₹${amount.toLocaleString('en-IN')}`,
                                              amount
                                            );
                                          }}
                                          className="px-3 py-2 rounded-xl text-xs font-bold bg-[#142B55] hover:bg-[#0B172F] text-white transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                                        >
                                          Save Price
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Controls: WhatsApp, Print, and Delete */}
                                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                                    <a
                                      href={`https://wa.me/91${q.customerPhone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                                        `Hello ${q.customerName}, this is Mr. Raja Shekar Reddy from RAJ POWER TECH SERVICES regarding your inquiry #${q.quotationNumber} for ${q.quantity || 1} units of ${q.productName || q.category.toUpperCase()}. We are happy to assist you with equipment sizing, official GST pricing, and prompt on-site commissioning.`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-colors shadow-2xs whitespace-nowrap"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                                      <span>WhatsApp Client</span>
                                    </a>

                                    {q.quotedAmount ? (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedQuoteForPrint(q)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#142B55] text-white hover:bg-[#0B172F] transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                                      >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Print Quotation</span>
                                      </button>
                                    ) : null}

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteQuotation(q.id, q.quotationNumber)}
                                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                                      title="Delete this inquiry permanently"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete Inquiry</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Customer Dossier & Sizing Details */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                                  {/* Customer Contact */}
                                  <div className="md:col-span-5 space-y-2 border-b md:border-b-0 md:border-r border-slate-200/80 pb-3 md:pb-0 md:pr-4">
                                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1.5">
                                      <Building2 className="w-3.5 h-3.5 text-[#142B55]" />
                                      <span>Client &amp; Organization Details</span>
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
                                      <p className="text-xs font-medium mt-0.5">No price quoted yet. Set the official quote amount in the action bar above to issue a formal proposal.</p>
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

                {/* Quotations / Leads Pagination */}
                <AdminPagination
                  currentPage={quotesPage}
                  totalItems={filteredQuotes.length}
                  itemsPerPage={quotesPerPage}
                  onPageChange={setQuotesPage}
                  itemLabel="leads & inquiries"
                />
              </div>
            );
          })()}
        </div>
      );
    })()}

        {/* TAB 5: PLATFORM POLICIES & SUPER ADMIN SECURITY */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            {/* Super Admin Security & Password Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#142B55] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#D52B30]" />
                    <span>Super Admin Credentials &amp; Security</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage password for authenticated account:{' '}
                    <span className="font-semibold text-slate-800">{currentUser?.email || 'admin@rajpowertech.com'}</span>
                  </p>
                </div>
                <Badge variant="navy" className="self-start sm:self-auto text-[11px] font-mono tracking-wider">
                  {currentUser?.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMINISTRATOR'}
                </Badge>
              </div>

              {passwordFeedback && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
                    passwordFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {passwordFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{passwordFeedback.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#142B55] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      New Password (min 8 chars)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="New strong password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#142B55] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#142B55]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={passwordLoading}
                    className="bg-[#142B55] hover:bg-[#0B172F] text-white"
                    icon={passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  >
                    {passwordLoading ? 'Updating Password...' : 'Update Super Admin Password'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Platform Policies Card */}
            {settings && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#142B55]">Store Policies &amp; Delivery Rules</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure delivery fees, free delivery threshold, payment methods, and serviceable PIN codes.
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
                    variant="white"
                    onClick={handleAddPincodeRule}
                    className="text-xs font-semibold"
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
      </div>
    )}

        {/* TAB 6: CERTIFICATIONS & STANDARDS */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#142B55]">Authorized Brand Certifications</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage official manufacturer dealership credentials and quality standards.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCertModal(true)}
                icon={<Plus className="w-4 h-4" />}
                className="bg-[#D52B30] hover:bg-[#B51E22] text-white font-semibold cursor-pointer"
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
                          { }
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

        {/* TAB 7: CLIENTS & WORK PROJECTS */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#142B55] flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#D52B30]" />
                  <span>Clients &amp; Work Projects Showcase</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage commercial installations, customer site setups, engineering case studies, and live photos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <select
                  value={projectSectorFilter}
                  onChange={(e) => {
                    setProjectSectorFilter(e.target.value);
                    setClientProjectsPage(1);
                  }}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#142B55]/20"
                >
                  <option value="all">All Sectors ({clientProjects.length})</option>
                  <option value="Healthcare & Hospitals">Healthcare &amp; Hospitals</option>
                  <option value="Corporate IT & Data Rooms">Corporate IT &amp; Data Rooms</option>
                  <option value="Commercial & Retail">Commercial &amp; Retail</option>
                  <option value="Villas & Residential">Villas &amp; Residential</option>
                  <option value="Industrial & Manufacturing">Industrial &amp; Manufacturing</option>
                </select>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setProjectModalError(null);
                    setShowAddProjectModal(true);
                  }}
                  icon={<Plus className="w-4 h-4" />}
                  className="bg-[#D52B30] hover:bg-[#B51E22] text-white font-semibold cursor-pointer shrink-0"
                >
                  Add Customer Project
                </Button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Client Projects</p>
                <p className="text-xl font-extrabold text-[#142B55] mt-1">{clientProjects.length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Featured on Website</p>
                <p className="text-xl font-extrabold text-emerald-600 mt-1">
                  {clientProjects.filter((p) => p.isFeatured).length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Healthcare &amp; IT Sites</p>
                <p className="text-xl font-extrabold text-blue-600 mt-1">
                  {clientProjects.filter((p) => p.sector === 'Healthcare & Hospitals' || p.sector === 'Corporate IT & Data Rooms').length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Commercial &amp; Industrial</p>
                <p className="text-xl font-extrabold text-amber-600 mt-1">
                  {clientProjects.filter((p) => p.sector === 'Commercial & Retail' || p.sector === 'Industrial & Manufacturing' || p.sector === 'Villas & Residential').length}
                </p>
              </div>
            </div>

            {/* Project Cards Grid */}
            {(() => {
              const filteredList = clientProjects.filter(
                (p) => projectSectorFilter === 'all' || p.sector === projectSectorFilter
              );
              const totalPages = Math.ceil(filteredList.length / clientProjectsPerPage) || 1;
              const paginatedList = filteredList.slice(
                (clientProjectsPage - 1) * clientProjectsPerPage,
                clientProjectsPage * clientProjectsPerPage
              );

              if (filteredList.length === 0) {
                return (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">No client projects found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {projectSectorFilter === 'all'
                        ? 'No client projects have been recorded yet. Click "Add Customer Project" above to publish your first showcase entry.'
                        : `No projects found under the "${projectSectorFilter}" sector.`}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedList.map((project) => (
                      <div
                        key={project.id}
                        className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-3">
                          {/* Project Image Banner */}
                          <div className="rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50/70 h-44 relative flex items-center justify-center">
                            {project.imageUrl ? (
                              <img
                                src={project.imageUrl}
                                alt={project.clientName}
                                className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="text-slate-400 flex flex-col items-center gap-1">
                                <Briefcase className="w-8 h-8 stroke-1" />
                                <span className="text-[11px] font-medium">No photo uploaded</span>
                              </div>
                            )}

                            {/* Quick Badges over Image */}
                            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#142B55] text-white shadow-2xs">
                                {project.sector}
                              </span>
                            </div>

                            <div className="absolute top-2.5 right-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-2xs ${
                                  project.isFeatured
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {project.isFeatured ? '★ Featured on Site' : 'Hidden'}
                              </span>
                            </div>

                            {project.imageUrl && (
                              <a
                                href={project.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition-opacity"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Full Image</span>
                              </a>
                            )}
                          </div>

                          {/* Client Location & Business Name */}
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-[#D52B30] shrink-0" />
                              <span>{project.location}</span>
                            </p>
                            <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                              {project.clientName}
                            </h3>
                          </div>

                          {/* Installed Product Box */}
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#D52B30] flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              <span>Installed Product</span>
                            </p>
                            <p className="text-xs font-bold text-[#142B55] leading-snug">
                              {project.systemInstalled}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setProjectModalError(null);
                                setEditingProject({ ...project });
                              }}
                              className="text-xs px-2.5 py-1.5 rounded-xl bg-blue-50 text-[#142B55] hover:bg-blue-100 font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleProjectFeatured(project.id, project.isFeatured)}
                              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition-colors"
                            >
                              {project.isFeatured ? 'Hide' : 'Feature'}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteProject(project.id, project.clientName)}
                            className="text-xs text-red-600 hover:text-red-800 p-1.5 rounded-xl hover:bg-red-50 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Admin Projects Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 bg-white p-4 rounded-2xl">
                      <p className="text-xs text-slate-500 font-medium">
                        Showing <span className="font-bold text-slate-900">{(clientProjectsPage - 1) * clientProjectsPerPage + 1}</span> to{' '}
                        <span className="font-bold text-slate-900">
                          {Math.min(clientProjectsPage * clientProjectsPerPage, filteredList.length)}
                        </span>{' '}
                        of <span className="font-bold text-slate-900">{filteredList.length}</span> projects
                      </p>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={clientProjectsPage === 1}
                          onClick={() => setClientProjectsPage((p) => Math.max(p - 1, 1))}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                          <button
                            key={pg}
                            type="button"
                            onClick={() => setClientProjectsPage(pg)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              clientProjectsPage === pg
                                ? 'bg-[#142B55] text-white'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {pg}
                          </button>
                        ))}

                        <button
                          type="button"
                          disabled={clientProjectsPage === totalPages}
                          onClick={() => setClientProjectsPage((p) => Math.min(p + 1, totalPages))}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
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
                  disabled={isSubmittingVendor}
                  onClick={() => !isSubmittingVendor && setShowVendorModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingVendor}
                  icon={isSubmittingVendor ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmittingVendor ? 'Provisioning...' : 'Provision & Send Login Credentials'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CERTIFICATION MODAL */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-slate-100">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-lg font-bold text-[#142B55]">Add Equipment Certification</h3>
                <p className="text-xs text-slate-500">Add verified standard compliance record to public gallery</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCertification} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
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
              <ImageUploader
                label="Certificate Document / Badge Image"
                value={newCertData.imageUrl}
                onChange={(url) => setNewCertData({ ...newCertData, imageUrl: url })}
                required
                fallbackImage="/images/cert-exide-gold-2025.png"
                presets={[
                  { label: 'Exide Gold 2025', url: '/images/cert-exide-gold-2025.png' },
                  { label: 'BPE Benchmark', url: '/images/cert-bpe-benchmark.png' },
                  { label: 'BPE 25Y Trophy', url: '/images/cert-bpe-benchmark-2025.jpg' },
                  { label: 'BPE Vision25', url: '/images/cert-bpe-platinum-2024.png' },
                  { label: 'BPE Trophy Star', url: '/images/cert-bpe-platinum-2022.png' },
                ]}
              />


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
              </div>

              <div className="p-4 sm:p-5 border-t border-slate-100 flex justify-end gap-2.5 bg-slate-50/90 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSubmittingCert}
                  onClick={() => !isSubmittingCert && setShowCertModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingCert}
                  icon={isSubmittingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white shadow-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmittingCert ? 'Publishing...' : 'Publish Certification'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CERTIFICATION MODAL (ADMIN / SUPER ADMIN) */}
      {editingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-slate-100">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-lg font-bold text-[#142B55]">Edit Equipment Certification</h3>
                <p className="text-xs text-slate-500">Update compliance record, validity dates, and certificate image</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCert(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCertification} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
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
              <ImageUploader
                label="Certificate Document / Badge Image"
                value={editingCert.imageUrl || ''}
                onChange={(url) => setEditingCert({ ...editingCert, imageUrl: url })}
                required
                fallbackImage="/images/cert-exide-gold-2025.png"
                presets={[
                  { label: 'Exide Gold 2025', url: '/images/cert-exide-gold-2025.png' },
                  { label: 'BPE Benchmark', url: '/images/cert-bpe-benchmark.png' },
                  { label: 'BPE 25Y Trophy', url: '/images/cert-bpe-benchmark-2025.jpg' },
                  { label: 'BPE Vision25', url: '/images/cert-bpe-platinum-2024.png' },
                  { label: 'BPE Trophy Star', url: '/images/cert-bpe-platinum-2022.png' },
                ]}
              />

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
              </div>

              <div className="p-4 sm:p-5 border-t border-slate-100 flex justify-end gap-2.5 bg-slate-50/90 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isUpdatingCert}
                  onClick={() => !isUpdatingCert && setEditingCert(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isUpdatingCert}
                  icon={isUpdatingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white shadow-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isUpdatingCert ? 'Saving...' : 'Save & Update in Database'}
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
                  disabled={isSubmittingCategory}
                  onClick={() => {
                    if (!isSubmittingCategory) {
                      setShowNewCategoryModal(false);
                      setNewCategoryError(null);
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingCategory}
                  icon={isSubmittingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  className="bg-[#D52B30] hover:bg-[#B51E22] text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmittingCategory ? 'Saving...' : 'Save & Authorize Solution'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200/80">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-4 shrink-0 bg-white">
              <h3 className="text-base font-bold text-[#142B55]">Add Product</h3>
              <button
                type="button"
                disabled={isSubmittingProduct}
                onClick={() => {
                  if (isSubmittingProduct) return;
                  setShowAddProductModal(false);
                  setProductModalError(null);
                  setProductErrors({});
                }}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateProduct} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 text-xs">
                {productModalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{productModalError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BPE 1kVA Online UPS or Microtek vTURBO 1550"
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
                      placeholder="e.g. Microtek, Exide, Amaron Quanta, BPE"
                      list="admin-existing-brands"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                    />
                    <datalist id="admin-existing-brands">
                      {existingBrands.map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                    {productErrors.brand && <p className="text-red-500 text-[11px] mt-0.5">{productErrors.brand}</p>}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 uppercase tracking-wider">
                        Category / Solution *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryModal(true)}
                        className="text-[11px] text-[#142B55] hover:underline font-semibold"
                      >
                        + Create Category
                      </button>
                    </div>
                    <select
                      value={productForm.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        if (cat === '__new__') {
                          setShowNewCategoryModal(true);
                          return;
                        }
                        setProductForm({ ...productForm, category: cat });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55] bg-white capitalize"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                      <option value="__new__">+ Add New Solution / Category...</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Selling Price (₹) *
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
                      MRP Price (₹)
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
                      Stock Units *
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
                      SKU / Model Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RPS-BPE-1KVA"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Capacity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1kVA / 1000W or 150Ah"
                      value={productForm.capacity}
                      onChange={(e) => setProductForm({ ...productForm, capacity: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Warranty
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 24 Months Manufacturer"
                      value={productForm.warrantyPeriod}
                      onChange={(e) => setProductForm({ ...productForm, warrantyPeriod: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Display Priority / Sort Order</span>
                      <span className="text-[10px] text-cyan-700 font-bold lowercase">1 = Top Priority</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 1 for Top Showcase, 2, 3..."
                      value={productForm.sortOrder || ''}
                      onChange={(e) => setProductForm({ ...productForm, sortOrder: Number(e.target.value) || 999 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55] font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Lower numbers appear first on the shop page (e.g. 1 for BPE Online UPS).</p>
                  </div>

                  {/* PRODUCT IMAGE SELECTOR */}
                  <div className="sm:col-span-2">
                    <ImageUploader
                      label="Product Equipment Image"
                      value={productForm.imageUrl}
                      onChange={(url) => setProductForm({ ...productForm, imageUrl: url })}
                      required
                      fallbackImage="/products/inverter-demo-1.jpg"
                      presets={[
                        { label: 'Inverter 1', url: '/products/inverter-demo-1.jpg' },
                        { label: 'Inverter 2', url: '/products/inverter-demo-2.jpg' },
                        { label: 'Battery 1', url: '/products/battery-demo-1.jpg' },
                        { label: 'Battery 2', url: '/products/battery-demo-2.jpg' },
                        { label: 'UPS Unit 1', url: '/products/ups-demo-1.jpg' },
                        { label: 'UPS Unit 2', url: '/products/ups-demo-2.jpg' },
                      ]}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Short Description *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Capacity, backup duration, and target application..."
                      value={productForm.shortDescription}
                      onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                    />
                    {productErrors.shortDescription && (
                      <p className="text-red-500 text-[11px] mt-0.5">{productErrors.shortDescription}</p>
                    )}
                  </div>

                  {/* KEY FEATURES / HIGHLIGHTS */}
                  <div className="sm:col-span-2 space-y-2 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Key Selling Features &amp; Highlights
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pure Sine Wave, 100% Copper Transformer, Fast Multi-Stage Charging, Auto Overload Cutoff"
                      value={productForm.features}
                      onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none focus:border-[#142B55]"
                    />
                    <p className="text-[10px] text-slate-500">
                      Separate multiple features with commas. These are highlighted as key selling points on the website.
                    </p>
                    {productForm.features && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {productForm.features.split(',').map((feat, i) => {
                          const trimmed = feat.trim();
                          if (!trimmed) return null;
                          return (
                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#142B55] text-[10px] font-bold border border-blue-100">
                              <Check className="w-2.5 h-2.5 text-blue-600" />
                              {trimmed}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* CORE TECHNICAL SPECIFICATIONS MATRIX */}
                  <div className="sm:col-span-2 space-y-2.5 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                          Core Technical Specifications Matrix
                        </label>
                        <p className="text-[10px] text-slate-500">
                          Displayed on product cards &amp; technical specifications section
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProductForm({
                            ...productForm,
                            keySpecs: [...(productForm.keySpecs || []), { label: '', value: '' }],
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#142B55] hover:bg-[#0B172F] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Spec</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(productForm.keySpecs || []).map((spec, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Spec Label (e.g. Capacity)"
                            value={spec.label}
                            onChange={(e) => {
                              const updated = [...(productForm.keySpecs || [])];
                              updated[sIdx].label = e.target.value;
                              setProductForm({ ...productForm, keySpecs: updated });
                            }}
                            className="w-1/3 px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:border-[#142B55]"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g. 1100VA / 900W)"
                            value={spec.value}
                            onChange={(e) => {
                              const updated = [...(productForm.keySpecs || [])];
                              updated[sIdx].value = e.target.value;
                              setProductForm({ ...productForm, keySpecs: updated });
                            }}
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none focus:border-[#142B55]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (productForm.keySpecs || []).filter((_, idx) => idx !== sIdx);
                              setProductForm({ ...productForm, keySpecs: updated });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Remove specification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick add spec pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Add:</span>
                      {['Technology', 'Voltage', 'Backup Time', 'Efficiency', 'Waveform'].map((presetLabel) => (
                        <button
                          key={presetLabel}
                          type="button"
                          onClick={() => {
                            const current = productForm.keySpecs || [];
                            if (!current.some((s) => s.label.toLowerCase() === presetLabel.toLowerCase())) {
                              setProductForm({
                                ...productForm,
                                keySpecs: [...current, { label: presetLabel, value: '' }],
                              });
                            }
                          }}
                          className="px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-[10px] font-semibold text-slate-600 cursor-pointer transition-colors"
                        >
                          + {presetLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0 bg-slate-50/90">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSubmittingProduct}
                  onClick={() => {
                    if (!isSubmittingProduct) {
                      setShowAddProductModal(false);
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingProduct}
                  icon={isSubmittingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  className="bg-[#D52B30] hover:bg-[#B51E22] text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmittingProduct ? 'Publishing Product...' : 'Publish Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200/80">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-4 shrink-0 bg-white">
              <h3 className="text-base font-bold text-[#142B55]">Edit Product</h3>
              <button
                type="button"
                disabled={isUpdatingProduct}
                onClick={() => {
                  if (!isUpdatingProduct) {
                    setEditingProduct(null);
                  }
                }}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleUpdateProduct} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 text-xs">
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
                      list="admin-existing-brands"
                      value={editingProduct.brand}
                      onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 uppercase tracking-wider">
                        Category / Solution *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryModal(true)}
                        className="text-[11px] text-[#142B55] hover:underline font-semibold"
                      >
                        + Create Category
                      </button>
                    </div>
                    <select
                      value={editingProduct.category || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__new__') {
                          setShowNewCategoryModal(true);
                          return;
                        }
                        setEditingProduct({ ...editingProduct, category: val });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55] bg-white capitalize"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                      <option value="__new__">+ Add New Solution / Category...</option>
                    </select>
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
                      Selling Price (₹) *
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
                      MRP Price (₹)
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
                      Capacity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1100VA / 900W or 150Ah"
                      value={editingProduct.capacity || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, capacity: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Warranty
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 36 Months Replacement"
                      value={editingProduct.warrantyPeriod || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, warrantyPeriod: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Display Priority / Sort Order</span>
                      <span className="text-[10px] text-cyan-700 font-bold lowercase">1 = Top Priority</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 1 for Top Showcase, 2, 3..."
                      value={editingProduct.sortOrder ?? ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sortOrder: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55] font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Lower numbers appear first on the shop page.</p>
                  </div>

                  {/* PRODUCT IMAGE SELECTOR */}
                  <div className="sm:col-span-2">
                    <ImageUploader
                      label="Product Equipment Image"
                      value={editingProduct.imageUrl || ''}
                      onChange={(url) => setEditingProduct({ ...editingProduct, imageUrl: url })}
                      required
                      fallbackImage="/products/inverter-demo-1.jpg"
                      presets={[
                        { label: 'Inverter 1', url: '/products/inverter-demo-1.jpg' },
                        { label: 'Inverter 2', url: '/products/inverter-demo-2.jpg' },
                        { label: 'Battery 1', url: '/products/battery-demo-1.jpg' },
                        { label: 'Battery 2', url: '/products/battery-demo-2.jpg' },
                        { label: 'UPS Unit 1', url: '/products/ups-demo-1.jpg' },
                        { label: 'UPS Unit 2', url: '/products/ups-demo-2.jpg' },
                      ]}
                    />
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

                  {/* KEY FEATURES / HIGHLIGHTS (EDIT) */}
                  <div className="sm:col-span-2 space-y-2 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Key Selling Features &amp; Highlights
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pure Sine Wave, 100% Copper Transformer, Fast Multi-Stage Charging, Auto Overload Cutoff"
                      value={editingProduct.featuresText ?? (Array.isArray(editingProduct.features) ? editingProduct.features.join(', ') : '')}
                      onChange={(e) => {
                        const txt = e.target.value;
                        const parsed = txt.split(',').map((s) => s.trim()).filter(Boolean);
                        setEditingProduct({ ...editingProduct, featuresText: txt, features: parsed });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none focus:border-[#142B55]"
                    />
                    <p className="text-[10px] text-slate-500">
                      Separate multiple features with commas. These are highlighted as key selling bullet points.
                    </p>
                    {editingProduct.features && editingProduct.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {editingProduct.features.map((feat: string, i: number) => {
                          const trimmed = feat.trim();
                          if (!trimmed) return null;
                          return (
                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#142B55] text-[10px] font-bold border border-blue-100">
                              <Check className="w-2.5 h-2.5 text-blue-600" />
                              {trimmed}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* CORE TECHNICAL SPECIFICATIONS MATRIX (EDIT) */}
                  <div className="sm:col-span-2 space-y-2.5 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                          Core Technical Specifications Matrix
                        </label>
                        <p className="text-[10px] text-slate-500">
                          Displayed on product cards &amp; technical specifications section
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct({
                            ...editingProduct,
                            keySpecs: [...(editingProduct.keySpecs || []), { label: '', value: '' }],
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#142B55] hover:bg-[#0B172F] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Spec</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(editingProduct.keySpecs || []).map((spec, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Spec Label (e.g. Capacity)"
                            value={spec.label}
                            onChange={(e) => {
                              const updated = [...(editingProduct.keySpecs || [])];
                              updated[sIdx].label = e.target.value;
                              setEditingProduct({ ...editingProduct, keySpecs: updated });
                            }}
                            className="w-1/3 px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:border-[#142B55]"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g. 1100VA / 900W)"
                            value={spec.value}
                            onChange={(e) => {
                              const updated = [...(editingProduct.keySpecs || [])];
                              updated[sIdx].value = e.target.value;
                              setEditingProduct({ ...editingProduct, keySpecs: updated });
                            }}
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs focus:outline-none focus:border-[#142B55]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (editingProduct.keySpecs || []).filter((_, idx) => idx !== sIdx);
                              setEditingProduct({ ...editingProduct, keySpecs: updated });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Remove specification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick add spec pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Add:</span>
                      {['Technology', 'Voltage', 'Backup Time', 'Efficiency', 'Waveform'].map((presetLabel) => (
                        <button
                          key={presetLabel}
                          type="button"
                          onClick={() => {
                            const current = editingProduct.keySpecs || [];
                            if (!current.some((s) => s.label.toLowerCase() === presetLabel.toLowerCase())) {
                              setEditingProduct({
                                ...editingProduct,
                                keySpecs: [...current, { label: presetLabel, value: '' }],
                              });
                            }
                          }}
                          className="px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-[10px] font-semibold text-slate-600 cursor-pointer transition-colors"
                        >
                          + {presetLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0 bg-slate-50/90">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isUpdatingProduct}
                  onClick={() => {
                    if (!isUpdatingProduct) {
                      setEditingProduct(null);
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isUpdatingProduct}
                  icon={isUpdatingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isUpdatingProduct ? 'Saving Changes...' : 'Save Changes'}
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
                    <p className="text-slate-700 font-medium">Commercial Email: {issuingVendor?.email || 'info@rajpowertech.com'}</p>
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

      {/* ADD CUSTOMER PROJECT MODAL */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-slate-100">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-lg font-bold text-[#142B55] flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#D52B30]" />
                  <span>Add Customer Project</span>
                </h3>
                <p className="text-xs text-slate-500">Publish installation case study and photos to public /services showcase</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProjectModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                {projectModalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{projectModalError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Client / Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Yashoda Hospitals Diagnostic Wing"
                      value={newProjectData.clientName}
                      onChange={(e) => setNewProjectData({ ...newProjectData, clientName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#142B55]/20 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Client Industry / Sector *
                    </label>
                    <select
                      value={newProjectData.sector}
                      onChange={(e) => setNewProjectData({ ...newProjectData, sector: e.target.value as ClientSector })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#142B55]/20 font-medium bg-white"
                    >
                      <option value="Healthcare & Hospitals">Healthcare &amp; Hospitals</option>
                      <option value="Corporate IT & Data Rooms">Corporate IT &amp; Data Rooms</option>
                      <option value="Commercial & Retail">Commercial &amp; Retail</option>
                      <option value="Villas & Residential">Villas &amp; Residential</option>
                      <option value="Industrial & Manufacturing">Industrial &amp; Manufacturing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Installation Location *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Somajiguda, Hyderabad"
                      value={newProjectData.location}
                      onChange={(e) => setNewProjectData({ ...newProjectData, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#142B55]/20 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newProjectData.isFeatured}
                        onChange={(e) => setNewProjectData({ ...newProjectData, isFeatured: e.target.checked })}
                        className="w-4 h-4 text-[#D52B30] rounded focus:ring-[#D52B30] accent-[#D52B30]"
                      />
                      <span className="font-bold text-slate-800 text-xs">Featured on Website Showcase</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    System / Equipment Installed *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 30kVA BPE 3:3 True Online UPS + 120V Amaron SMF Bank"
                    value={newProjectData.systemInstalled}
                    onChange={(e) => setNewProjectData({ ...newProjectData, systemInstalled: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#142B55]/20 font-medium"
                  />
                </div>

                {/* Setup Image Upload / Presets */}
                <div className="pt-2 border-t border-slate-100">
                  <ImageUploader
                    value={newProjectData.imageUrl}
                    onChange={(url) => setNewProjectData({ ...newProjectData, imageUrl: url })}
                    label="Installation / Equipment Setup Photo"
                    presets={PROJECT_PRESET_IMAGES}
                    fallbackImage="/products/bpe-online-ups-hq.png"
                  />
                </div>
              </div>

              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddProjectModal(false)}
                  disabled={isSubmittingProject}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingProject}
                  icon={isSubmittingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white shadow-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmittingProject ? 'Publishing...' : 'Publish Customer Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER PROJECT MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-slate-100">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-lg font-bold text-[#142B55] flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#142B55]" />
                  <span>Edit Customer Project</span>
                </h3>
                <p className="text-xs text-slate-500">Update installation specs, photos, review, or featured visibility</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProject} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                {projectModalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{projectModalError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Client / Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.clientName}
                      onChange={(e) => setEditingProject({ ...editingProject, clientName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#142B55]/20 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Client Industry / Sector *
                    </label>
                    <select
                      value={editingProject.sector}
                      onChange={(e) => setEditingProject({ ...editingProject, sector: e.target.value as ClientSector })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#142B55]/20 font-medium bg-white"
                    >
                      <option value="Healthcare & Hospitals">Healthcare &amp; Hospitals</option>
                      <option value="Corporate IT & Data Rooms">Corporate IT &amp; Data Rooms</option>
                      <option value="Commercial & Retail">Commercial &amp; Retail</option>
                      <option value="Villas & Residential">Villas &amp; Residential</option>
                      <option value="Industrial & Manufacturing">Industrial &amp; Manufacturing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Installation Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.location}
                      onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#142B55]/20 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editingProject.isFeatured}
                        onChange={(e) => setEditingProject({ ...editingProject, isFeatured: e.target.checked })}
                        className="w-4 h-4 text-[#D52B30] rounded focus:ring-[#D52B30] accent-[#D52B30]"
                      />
                      <span className="font-bold text-slate-800 text-xs">Featured on Website Showcase</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    System / Equipment Installed *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.systemInstalled}
                    onChange={(e) => setEditingProject({ ...editingProject, systemInstalled: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#142B55]/20 font-medium"
                  />
                </div>

                {/* Setup Image Upload / Presets */}
                <div className="pt-2 border-t border-slate-100">
                  <ImageUploader
                    value={editingProject.imageUrl}
                    onChange={(url) => setEditingProject({ ...editingProject, imageUrl: url })}
                    label="Installation / Equipment Setup Photo"
                    presets={PROJECT_PRESET_IMAGES}
                    fallbackImage="/products/bpe-online-ups-hq.png"
                  />
                </div>
              </div>

              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProject(null)}
                  disabled={isSubmittingProject}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingProject}
                  icon={isSubmittingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white shadow-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmittingProject ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BRANDED IN-APP DELETION CONFIRMATION MODAL */}
      {deleteConfirmation && deleteConfirmation.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleteConfirmation.isProcessing) {
              setDeleteConfirmation(null);
            }
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 relative">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => !deleteConfirmation.isProcessing && setDeleteConfirmation(null)}
              disabled={deleteConfirmation.isProcessing}
              className="absolute right-5 top-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#D52B30] flex items-center justify-center border border-red-100 shadow-2xs">
              <Trash2 className="w-7 h-7" />
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {deleteConfirmation.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {deleteConfirmation.description}
              </p>
            </div>

            {/* Irreversible Action Warning Box */}
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-medium">
                This operation is immediate and permanently removes data from the store database.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                disabled={deleteConfirmation.isProcessing}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => deleteConfirmation.onConfirm()}
                disabled={deleteConfirmation.isProcessing}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#D52B30] hover:bg-[#b82226] shadow-md shadow-[#D52B30]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {deleteConfirmation.isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deleteConfirmation.confirmLabel || 'Yes, Delete Permanently'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
