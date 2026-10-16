'use client';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  stock: number;
}

const STORAGE_KEY = 'rps_guest_cart_v1';

export function getGuestCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read cart from localStorage', e);
    return [];
  }
}

export function saveGuestCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('rps-cart-updated'));
  } catch (e) {
    console.error('Failed to save cart to localStorage', e);
  }
}

export function addToGuestCart(item: Omit<CartItem, 'quantity'>, quantity = 1): CartItem[] {
  const current = getGuestCart();
  const existingIdx = current.findIndex((i) => i.productId === item.productId);

  if (existingIdx > -1) {
    const newQty = Math.min(current[existingIdx].quantity + quantity, item.stock || 99);
    current[existingIdx].quantity = newQty;
  } else {
    current.push({
      ...item,
      quantity: Math.min(quantity, item.stock || 99),
    });
  }

  saveGuestCart(current);
  return current;
}

export function updateGuestCartQuantity(productId: string, quantity: number): CartItem[] {
  const current = getGuestCart();
  if (quantity <= 0) {
    return removeFromGuestCart(productId);
  }

  const item = current.find((i) => i.productId === productId);
  if (item) {
    item.quantity = Math.min(quantity, item.stock || 99);
    saveGuestCart(current);
  }
  return current;
}

export function removeFromGuestCart(productId: string): CartItem[] {
  const current = getGuestCart().filter((i) => i.productId !== productId);
  saveGuestCart(current);
  return current;
}

export function clearGuestCart(): void {
  saveGuestCart([]);
}

export function getCartTotalItems(items: CartItem[]): number {
  return items.reduce((acc, it) => acc + it.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((acc, it) => acc + it.price * it.quantity, 0);
}
