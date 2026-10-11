import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { demoProducts, demoPromotions } from './seed.mjs';
import { createOrder } from './commerce.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(here, 'data');
const distDir = path.resolve(here, '..', 'dist');
const adminKey = process.env.ADMIN_API_KEY ?? (process.env.NODE_ENV === 'production' ? '' : 'wearo-demo-admin-key');
let mutationQueue = Promise.resolve();

async function readCollection(name, fallback) {
  const location = path.join(dataDir, name);
  try { return JSON.parse(await fs.readFile(location, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(location, JSON.stringify(fallback, null, 2), 'utf8');
    return structuredClone(fallback);
  }
}

async function writeCollection(name, value) {
  await fs.mkdir(dataDir, { recursive: true });
  const destination = path.join(dataDir, name);
  const temporary = `${destination}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(value, null, 2), 'utf8');
  await fs.rename(temporary, destination);
}

function mutate(task) {
  const run = mutationQueue.then(task, task);
  mutationQueue = run.catch(() => {});
  return run;
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 100_000) throw Object.assign(new Error('La requête est trop volumineuse.'), { status: 413 });
  }
  try { return JSON.parse(body || '{}'); }
  catch { throw Object.assign(new Error('Le format JSON est invalide.'), { status: 400 }); }
}

function send(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  response.end(JSON.stringify(payload));
}

function requireAdmin(request) {
  if (!adminKey) throw Object.assign(new Error('Le tableau de bord doit être relié à une authentification administrateur avant déploiement.'), { status: 503 });
  if (request.headers['x-admin-key'] !== adminKey) throw Object.assign(new Error('Accès administrateur requis.'), { status: 401 });
}

function cleanProduct(input, previous = {}) {
  const product = { ...previous, ...input };
  product.id = String(product.id || `${Date.now()}`).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60);
  product.name = String(product.name || '').trim().slice(0, 80);
  product.category = String(product.category || '').trim().slice(0, 40);
  product.price = Number(product.price);
  product.description = String(product.description || '').trim().slice(0, 500);
  product.image = String(product.image || '').trim().slice(0, 500);
  product.sizes = Array.isArray(product.sizes) ? product.sizes.map(String).slice(0, 12) : [];
  product.colors = Array.isArray(product.colors) ? product.colors.slice(0, 12) : [];
  product.variants = Array.isArray(product.variants) ? product.variants.map((variant) => ({
    size: String(variant.size), color: String(variant.color), stock: Math.max(0, Math.floor(Number(variant.stock) || 0)),
  })) : [];
  product.stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  if (!product.name || !product.category || !Number.isFinite(product.price) || product.price < 1 || !product.variants.length) {
    throw Object.assign(new Error('Vérifiez le nom, la catégorie, le prix et les variantes du produit.'), { status: 400 });
  }
  return product;
}

async function api(request, response, url) {
  const { pathname } = url;
  if (request.method === 'GET' && pathname === '/api/health') return send(response, 200, { ok: true, paymentMode: 'demo' });
  if (request.method === 'GET' && pathname === '/api/products') return send(response, 200, await readCollection('products.json', demoProducts));
  if (request.method === 'GET' && pathname === '/api/promotions') return send(response, 200, await readCollection('promotions.json', demoPromotions));
  if (request.method === 'POST' && pathname === '/api/orders') {
    if ((process.env.PAYMENT_MODE || 'demo') !== 'demo') throw Object.assign(new Error('Le connecteur de paiement réel n’est pas configuré. Laissez PAYMENT_MODE=demo jusqu’à la réception des identifiants et de la documentation marchand.'), { status: 503 });
    const body = await readJson(request);
    const order = await mutate(async () => {
      const products = await readCollection('products.json', demoProducts);
      const promotions = await readCollection('promotions.json', demoPromotions);
      const result = createOrder(products, body, promotions);
      const orders = await readCollection('orders.json', []);
      await writeCollection('products.json', result.nextProducts);
      await writeCollection('orders.json', [result.order, ...orders]);
      return result.order;
    });
    return send(response, 201, { order, payment: { mode: 'demo', status: order.paymentStatus } });
  }
  if (request.method === 'POST' && pathname === '/api/contact') {
    const body = await readJson(request);
    const { name, email, message } = body;
    if (!String(name || '').trim() || !String(email || '').includes('@') || String(message || '').trim().length < 8) {
      throw Object.assign(new Error('Renseignez un nom, un e-mail valide et un message.'), { status: 400 });
    }
    const inquiry = { id: crypto.randomUUID(), name: String(name).trim().slice(0, 100), email: String(email).trim().toLowerCase().slice(0, 150), message: String(message).trim().slice(0, 2000), createdAt: new Date().toISOString() };
    await mutate(async () => {
      const messages = await readCollection('messages.json', []);
      await writeCollection('messages.json', [inquiry, ...messages]);
    });
    return send(response, 201, { ok: true, message: 'Votre message a bien été reçu.' });
  }

  if (pathname === '/api/orders' && request.method === 'GET') {
    requireAdmin(request);
    return send(response, 200, await readCollection('orders.json', []));
  }
  const orderStatus = pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (orderStatus && request.method === 'PATCH') {
    requireAdmin(request);
    const { status } = await readJson(request);
    if (!['reçue', 'en préparation', 'expédiée', 'livrée', 'annulée'].includes(status)) throw Object.assign(new Error('Statut de commande invalide.'), { status: 400 });
    const order = await mutate(async () => {
      const orders = await readCollection('orders.json', []);
      const entry = orders.find((value) => value.id === decodeURIComponent(orderStatus[1]));
      if (!entry) throw Object.assign(new Error('Commande introuvable.'), { status: 404 });
      if (entry.status === 'annulée' && status !== 'annulée') throw Object.assign(new Error('Une commande annulée ne peut pas être réactivée.'), { status: 409 });
      if (status === 'annulée' && entry.status !== 'annulée') {
        const products = await readCollection('products.json', demoProducts);
        for (const item of entry.items) {
          const product = products.find((value) => value.id === item.productId);
          const variant = product?.variants?.find((value) => value.size === item.size && value.color === item.color);
          if (variant) { variant.stock += item.quantity; product.stock = product.variants.reduce((sum, value) => sum + value.stock, 0); }
        }
        await writeCollection('products.json', products);
      }
      entry.status = status;
      await writeCollection('orders.json', orders);
      return entry;
    });
    return send(response, 200, order);
  }
  if (pathname === '/api/products' && request.method === 'POST') {
    requireAdmin(request);
    const body = await readJson(request);
    const product = await mutate(async () => {
      const products = await readCollection('products.json', demoProducts);
      const entry = cleanProduct(body);
      if (products.some((value) => value.id === entry.id)) throw Object.assign(new Error('Cet identifiant de produit existe déjà.'), { status: 409 });
      await writeCollection('products.json', [entry, ...products]);
      return entry;
    });
    return send(response, 201, product);
  }
  const productRoute = pathname.match(/^\/api\/products\/([^/]+)$/);
  if (productRoute && ['PATCH', 'DELETE'].includes(request.method)) {
    requireAdmin(request);
    const id = decodeURIComponent(productRoute[1]);
    const product = await mutate(async () => {
      const products = await readCollection('products.json', demoProducts);
      const index = products.findIndex((value) => value.id === id);
      if (index < 0) throw Object.assign(new Error('Produit introuvable.'), { status: 404 });
      if (request.method === 'DELETE') {
        const [removed] = products.splice(index, 1);
        await writeCollection('products.json', products);
        return removed;
      }
      products[index] = cleanProduct(await readJson(request), products[index]);
      await writeCollection('products.json', products);
      return products[index];
    });
    return send(response, 200, product);
  }
  if (pathname === '/api/promotions' && request.method === 'POST') {
    requireAdmin(request);
    const body = await readJson(request);
    const promo = await mutate(async () => {
      const promotions = await readCollection('promotions.json', demoPromotions);
      const code = String(body.code || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24);
      const discountPercent = Math.floor(Number(body.discountPercent));
      if (!code || discountPercent < 1 || discountPercent > 80) throw Object.assign(new Error('Code invalide : remise comprise entre 1 % et 80 %.'), { status: 400 });
      if (promotions.some((entry) => entry.code === code)) throw Object.assign(new Error('Ce code promotionnel existe déjà.'), { status: 409 });
      const entry = { id: code.toLowerCase(), code, label: String(body.label || code).trim().slice(0, 80), discountPercent, active: true, expiresAt: String(body.expiresAt || '') };
      await writeCollection('promotions.json', [entry, ...promotions]);
      return entry;
    });
    return send(response, 201, promo);
  }
  const promoRoute = pathname.match(/^\/api\/promotions\/([^/]+)$/);
  if (promoRoute && request.method === 'PATCH') {
    requireAdmin(request);
    const promos = await mutate(async () => {
      const promotions = await readCollection('promotions.json', demoPromotions);
      const entry = promotions.find((value) => value.id === decodeURIComponent(promoRoute[1]));
      if (!entry) throw Object.assign(new Error('Promotion introuvable.'), { status: 404 });
      entry.active = Boolean((await readJson(request)).active);
      await writeCollection('promotions.json', promotions);
      return promotions;
    });
    return send(response, 200, promos);
  }
  if (pathname === '/api/messages' && request.method === 'GET') {
    requireAdmin(request);
    return send(response, 200, await readCollection('messages.json', []));
  }
  return send(response, 404, { error: 'Route introuvable.' });
}

const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };

async function staticFile(request, response, url) {
  if (!['GET', 'HEAD'].includes(request.method)) return send(response, 405, { error: 'Méthode non autorisée.' });
  if (url.pathname.startsWith('/api/')) return send(response, 404, { error: 'Route introuvable.' });
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { return send(response, 400, { error: 'Adresse invalide.' }); }
  const requested = path.resolve(distDir, `.${pathname}`);
  if (requested !== distDir && !requested.startsWith(`${distDir}${path.sep}`)) return send(response, 403, { error: 'Accès refusé.' });
  let location = requested;
  try {
    const stat = await fs.stat(location);
    if (stat.isDirectory()) location = path.join(location, 'index.html');
  } catch {
    location = path.join(distDir, 'index.html');
  }
  try {
    const data = await fs.readFile(location);
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(location)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https://images.unsplash.com; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
    });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch {
    send(response, 404, { error: 'Page introuvable. Lancez d’abord npm run build.' });
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) await api(request, response, url);
    else await staticFile(request, response, url);
  } catch (error) {
    send(response, error.status || 500, { error: error.message || 'Une erreur est survenue.' });
  }
});

const port = Number(process.env.PORT || 4174);
const host = process.env.HOST || '127.0.0.1';
server.listen(port, host, () => console.log(`WEARO server: http://${host}:${port}`));
