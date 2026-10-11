import { randomUUID } from 'node:crypto';

const PAYMENT_METHODS = new Set(['flooz', 'mixx', 'cash']);

export function createOrder(products, orderInput, promotions = []) {
  const { customer, items, paymentMethod, promoCode = '' } = orderInput ?? {};
  if (!customer || !String(customer.name ?? '').trim() || !String(customer.email ?? '').includes('@')) {
    throw new Error('Renseignez un nom et une adresse e-mail valides.');
  }
  const phoneDigits = String(customer.phone ?? '').replace(/\D/g, '');
  if (phoneDigits.length < 8 || phoneDigits.length > 15) throw new Error('Le numéro de téléphone n’est pas valide.');
  if (!String(customer.address ?? '').trim() || !String(customer.city ?? '').trim()) {
    throw new Error('Renseignez une adresse de livraison et une ville.');
  }
  if (!PAYMENT_METHODS.has(paymentMethod)) throw new Error('Moyen de paiement inconnu.');
  if (!Array.isArray(items) || items.length < 1 || items.length > 40) throw new Error('Le panier est vide ou contient trop d’articles.');

  const nextProducts = structuredClone(products);
  const orderItems = [];
  for (const item of items) {
    const product = nextProducts.find((entry) => entry.id === item.productId);
    const variant = product?.variants?.find((entry) => entry.size === item.size && entry.color === item.color);
    const quantity = Number(item.quantity);
    if (!product || !variant) throw new Error('Un article du panier n’est plus disponible.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new Error('Quantité invalide.');
    if (variant.stock < quantity) throw new Error(`Stock insuffisant pour ${product.name} (${item.size}, ${item.color}).`);
    variant.stock -= quantity;
    product.stock = product.variants.reduce((sum, choice) => sum + choice.stock, 0);
    orderItems.push({ productId: product.id, name: product.name, size: item.size, color: item.color, quantity, unitPrice: product.price });
  }
  const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const promotion = promotions.find((entry) => entry.code.toUpperCase() === String(promoCode).trim().toUpperCase() && entry.active && (!entry.expiresAt || new Date(entry.expiresAt).getTime() >= Date.now()));
  const discount = promotion ? Math.round(subtotal * promotion.discountPercent / 100) : 0;
  const deliveryFee = subtotal - discount >= 50000 ? 0 : 2000;
  const order = {
    id: randomUUID(), number: `WR-${Date.now().toString().slice(-7)}`,
    createdAt: new Date().toISOString(),
    customer: { name: String(customer.name).trim(), email: String(customer.email).trim().toLowerCase(), phone: String(customer.phone).trim(), address: String(customer.address).trim(), city: String(customer.city).trim(), note: String(customer.note ?? '').trim().slice(0, 220) },
    items: orderItems, paymentMethod, paymentStatus: paymentMethod === 'cash' ? 'à régler à la livraison' : 'en attente',
    status: 'reçue', subtotal, discount, promotionCode: promotion?.code ?? '', deliveryFee, total: Math.max(0, subtotal - discount) + deliveryFee,
  };
  return { nextProducts, order };
}
