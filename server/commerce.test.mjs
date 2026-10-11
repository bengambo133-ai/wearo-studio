import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrder } from './commerce.mjs';

const product = {
  id: 'tee', name: 'T-shirt Studio', price: 12500, stock: 2,
  variants: [{ size: 'M', color: 'Noir', stock: 2 }],
};
const customer = { name: 'Afi K.', email: 'afi@example.com', phone: '+22890123456', address: 'Rue des jardins', city: 'Lomé' };
const item = { productId: 'tee', size: 'M', color: 'Noir', quantity: 1 };

test('creates a pending Mobile Money order and decrements variant stock', () => {
  const { nextProducts, order } = createOrder([product], { customer, items: [item], paymentMethod: 'flooz' });
  assert.equal(order.paymentStatus, 'en attente');
  assert.equal(order.total, 14500);
  assert.equal(nextProducts[0].variants[0].stock, 1);
});

test('applies an active promo and free delivery at the threshold', () => {
  const promos = [{ code: 'BIENVENUE10', active: true, discountPercent: 10 }];
  const expensiveProduct = { ...product, price: 56000, variants: [{ size: 'M', color: 'Noir', stock: 2 }] };
  const { order } = createOrder([expensiveProduct], { customer, items: [item], paymentMethod: 'mixx', promoCode: 'bienvenue10' }, promos);
  assert.equal(order.discount, 5600);
  assert.equal(order.deliveryFee, 0);
  assert.equal(order.total, 50400);
});

test('rejects checkout when a requested variant is out of stock', () => {
  assert.throws(() => createOrder([product], { customer, items: [{ ...item, quantity: 3 }], paymentMethod: 'cash' }), /Stock insuffisant/);
});

test('rejects invalid payment methods before persisting an order', () => {
  assert.throws(() => createOrder([product], { customer, items: [item], paymentMethod: 'card' }), /Moyen de paiement/);
});
