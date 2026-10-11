import React, { useEffect, useMemo, useState } from 'react';
import { demoProducts, demoPromotions, formatPrice } from './data.js';

const API = '/api';
const initialAdminKey = import.meta.env.DEV ? 'wearo-demo-admin-key' : '';
const CATEGORIES = ['Tout voir', 'Nouveautés', 'Bestsellers', 'Vestes', 'Hauts', 'Pantalons', 'Robes', 'Accessoires'];
const LEGAL = {
  about: ['Un vestiaire qui vous ressemble', 'WEARO Studio sélectionne des pièces à porter longtemps, avec des coupes justes, des matières agréables et des détails qui font la différence. Notre boutique est basée à Lomé et expédie partout au Togo.'],
  contact: ['Parlons de votre commande', 'Une question sur une taille, une livraison ou une pièce ? Écrivez-nous, notre équipe vous répond du lundi au samedi.'],
  faq: ['Questions fréquentes', 'Les réponses aux petites questions avant de choisir votre prochaine pièce.'],
  terms: ['Conditions générales de vente', 'Les commandes sont confirmées après validation du panier. Les stocks sont mis à jour au moment de la commande. Les prix affichés sont en francs CFA (XOF), toutes taxes comprises pour cette démonstration. La commande ne vaut pas confirmation de paiement Mobile Money tant que le prestataire n’a pas validé la transaction.'],
  privacy: ['Confidentialité', 'Les informations saisies servent uniquement à traiter la commande ou répondre à votre message. Cette version de démonstration conserve les données sur le serveur local au format JSON. Aucun numéro de carte bancaire ni code secret Mobile Money n’est demandé ou stocké.'],
  delivery: ['Livraison', 'Livraison à Lomé et dans les principales villes du Togo. Les frais de démonstration sont de 2 000 F CFA et offerts à partir de 50 000 F CFA d’achat après remise. Le délai réel sera précisé à la confirmation de votre commande.'],
  returns: ['Échanges & retours', 'Pour un échange de taille ou un article qui ne vous convient pas, contactez-nous sous 7 jours après réception, avec votre numéro de commande. Les pièces doivent être non portées et dans leur état d’origine. Cette politique doit être validée et complétée avant le lancement commercial.'],
};
const FAQS = [
  ['Comment choisir ma taille ?', 'Les articles taillent normalement. Si vous hésitez entre deux tailles, choisissez la plus grande pour une coupe plus ample. Écrivez-nous pour un conseil personnalisé.'],
  ['Livrez-vous en dehors de Lomé ?', 'Oui, nous livrons dans tout le Togo. Les délais sont confirmés au moment de la commande selon votre ville.'],
  ['Quels paiements sont acceptés ?', 'La démonstration permet de choisir Flooz ou Mixx by Yas. Le règlement ne sera réellement déclenché qu’après la configuration d’un compte marchand Mobile Money.'],
  ['Puis-je échanger une pièce ?', 'Contactez-nous dans les 7 jours suivant la livraison pour organiser un échange, sous réserve que l’article soit non porté et que la taille soit disponible.'],
];

async function api(path, options = {}) {
  const { adminKey, ...requestOptions } = options;
  const response = await fetch(`${API}${path}`, {
    ...requestOptions,
    headers: { 'Content-Type': 'application/json', ...(adminKey ? { 'X-Admin-Key': adminKey } : {}), ...requestOptions.headers },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Erreur ${response.status}`);
  return payload;
}

function Icon({ name, size = 19 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    user: <><circle cx="12" cy="8" r="3.2" /><path d="M5 20c.7-3.1 3.1-4.8 7-4.8s6.3 1.7 7 4.8" /></>,
    bag: <><path d="M5 8h14l1 12H4L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    arrow: <><path d="M4 12h15M13 6l6 6-6 6" /></>,
    heart: <path d="M20.8 8.7c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10a4.6 4.6 0 0 1 8.8-1.9 4.6 4.6 0 0 1 8.8 1.9Z" />,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    check: <path d="m5 12 4.3 4L19 6" />,
  };
  return <svg {...common}>{paths[name] || paths.arrow}</svg>;
}

function Logo({ onClick }) {
  return <button className="brand" onClick={onClick} aria-label="WEARO Studio — accueil"><span className="brand-mark">W</span><span>WEARO<span className="brand-studio"> STUDIO</span></span></button>;
}

function Header({ view, go, cartCount, openCart, openAccount, setSearchOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [view]);
  return <>
    <div className="announcement">L’élégance au quotidien, pensée à Lomé <span aria-hidden="true">✦</span> Livraison offerte dès 50 000 F CFA</div>
    <header className="site-header">
      <button className="mobile-menu icon-button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
      <Logo onClick={() => go('home')} />
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navigation principale">
        {[['home', 'Accueil'], ['shop', 'Boutique'], ['collection', 'Collections'], ['about', 'Notre histoire']].map(([target, label]) => <button key={target} className={view === target ? 'active' : ''} onClick={() => go(target)}>{label}</button>)}
      </nav>
      <div className="header-actions">
        <button className="icon-button" aria-label="Rechercher" onClick={() => setSearchOpen(true)}><Icon name="search" /></button>
        <button className="icon-button account-icon" aria-label="Mon compte" onClick={openAccount}><Icon name="user" /></button>
        <button className="icon-button bag-button" aria-label={`Ouvrir le panier (${cartCount} article${cartCount > 1 ? 's' : ''})`} onClick={openCart}><Icon name="bag" />{cartCount > 0 && <span className="bag-count">{cartCount}</span>}</button>
      </div>
    </header>
  </>;
}

function ProductCard({ product, onOpen, onFavorite, favorite }) {
  return <article className="product-card">
    <button className="product-image-button" onClick={() => onOpen(product)} aria-label={`Voir ${product.name}`}>
      <img src={product.image} alt={product.name} loading="lazy" />
      {product.badge && <span className={`product-badge ${product.badge === 'Bestseller' ? 'badge-gold' : ''}`}>{product.badge}</span>}
    </button>
    <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={() => onFavorite(product.id)} aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={favorite}><Icon name="heart" size={18} /></button>
    <div className="product-info">
      <div><p className="product-category">{product.category}</p><button className="product-name" onClick={() => onOpen(product)}>{product.name}</button></div>
      <div className="product-prices"><strong>{formatPrice(product.price)}</strong>{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</div>
    </div>
    <div className="product-card-footer"><span className="swatch-row" aria-label={`Couleurs disponibles : ${product.colors.map((color) => color.name).join(', ')}`}>{product.colors.slice(0, 4).map((color) => <span key={color.name} className="swatch" style={{ '--swatch': color.hex }} title={color.name} />)}</span><button className="quick-add" onClick={() => onOpen(product)} aria-label={`Choisir la taille et la couleur de ${product.name}`}><Icon name="plus" size={17} /></button></div>
  </article>;
}

function ProductModal({ product, close, addToCart }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]?.name ?? '');
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState('');
  const stock = product.variants.find((entry) => entry.size === size && entry.color === color)?.stock ?? 0;
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKeyDown);
    document.body.classList.add('modal-open');
    return () => { window.removeEventListener('keydown', onKeyDown); document.body.classList.remove('modal-open'); };
  }, [close]);
  return <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
      <button className="dialog-close icon-button" onClick={close} aria-label="Fermer"><Icon name="close" /></button>
      <div className="dialog-image"><img src={product.image} alt={product.name} /></div>
      <div className="dialog-details"><p className="eyebrow">{product.category}</p><h2 id="product-dialog-title">{product.name}</h2><div className="dialog-price">{formatPrice(product.price)} {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</div><p className="dialog-description">{product.description}</p>
        <fieldset className="choice-field"><legend>Couleur — <strong>{color}</strong></legend><div className="color-choices">{product.colors.map((entry) => <button key={entry.name} className={`color-choice ${color === entry.name ? 'selected' : ''}`} onClick={() => setColor(entry.name)} aria-label={entry.name} aria-pressed={color === entry.name}><span style={{ '--swatch': entry.hex }} /></button>)}</div></fieldset>
        <fieldset className="choice-field"><legend>Taille</legend><div className="size-choices">{product.sizes.map((entry) => { const available = product.variants.some((variant) => variant.size === entry && variant.color === color && variant.stock > 0); return <button key={entry} disabled={!available} className={size === entry ? 'selected' : ''} onClick={() => setSize(entry)}>{entry}</button>; })}</div></fieldset>
        <div className="availability">{stock > 0 ? <><span className="availability-dot" />{stock <= 3 ? `Plus que ${stock} en stock` : 'Disponible en stock'}</> : 'Épuisé pour cette taille et couleur'}</div>
        <div className="dialog-cta"><div className="quantity-control"><button disabled={quantity <= 1} aria-label="Diminuer la quantité" onClick={() => setQuantity((value) => value - 1)}><Icon name="minus" size={15} /></button><span>{quantity}</span><button disabled={quantity >= stock || quantity >= 10} aria-label="Augmenter la quantité" onClick={() => setQuantity((value) => value + 1)}><Icon name="plus" size={15} /></button></div><button className="button button-dark grow" disabled={!stock} onClick={() => { if (addToCart(product, size, color, quantity)) { setNotice('Ajouté à votre panier.'); } }}>{stock > 0 ? 'Ajouter au panier' : 'Indisponible'}</button></div>
        {notice && <p className="inline-success" role="status"><Icon name="check" size={15} />{notice}</p>}
        <p className="shipping-note">Livraison à Lomé et partout au Togo. Retours sous 7 jours.</p>
      </div>
    </section>
  </div>;
}

function HomePage({ products, onOpen, onFavorite, favorites, goShop }) {
  const featured = products.slice(0, 4);
  const categories = [
    { name: 'Vestes & mailles', filter: 'Vestes', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85', number: '01' },
    { name: 'Les essentiels', filter: 'Hauts', img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85', number: '02' },
    { name: 'Silhouettes fluides', filter: 'Robes', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85', number: '03' },
  ];
  return <>
    <section className="hero" aria-labelledby="hero-heading">
      <img className="hero-image" src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2200&q=90" alt="Silhouette contemporaine dans une lumière douce" />
      <div className="hero-shade" />
      <div className="hero-copy"><p className="eyebrow eyebrow-light">La collection — 2026</p><h1 id="hero-heading">Le style,<br /><em>en toute</em><br />simplicité.</h1><p>Des pièces choisies avec soin.<br />Une allure qui n’appartient qu’à vous.</p><button className="button button-light" onClick={() => goShop('Tout voir')}>Explorer la collection <Icon name="arrow" size={17} /></button><span className="hero-note">UNE ÉLÉGANCE SANS EFFORT</span></div>
      <div className="hero-index"><span>01</span><i /><span>03</span></div>
    </section>
    <section className="benefit-strip" aria-label="Nos engagements"><div><span className="benefit-icon">✳</span><span><strong>Pièces choisies</strong><small>Une sélection intentionnelle</small></span></div><div><span className="benefit-icon">◌</span><span><strong>Beau, longtemps</strong><small>Des essentiels qui durent</small></span></div><div><span className="benefit-icon">↗</span><span><strong>Livraison soignée</strong><small>À Lomé et partout au Togo</small></span></div></section>
    <section className="section collection-section" id="collections"><div className="section-heading"><div><p className="eyebrow">Nos univers</p><h2>Choisir son <em>allure.</em></h2></div><button className="text-link" onClick={() => goShop('Tout voir')}>Voir toutes les collections <Icon name="arrow" size={16} /></button></div><div className="collection-grid">{categories.map((category) => <button key={category.number} className="collection-card" onClick={() => goShop(category.filter)}><img src={category.img} alt="" loading="lazy" /><span className="collection-scrim" /><span className="collection-number">{category.number} / 03</span><span className="collection-name">{category.name}</span><span className="collection-arrow"><Icon name="arrow" size={17} /></span></button>)}</div></section>
    <section className="section arrivals-section"><div className="section-heading"><div><p className="eyebrow">À découvrir maintenant</p><h2>Les pièces <em>du moment.</em></h2></div><button className="text-link" onClick={() => goShop('Nouveautés')}>Toutes les nouveautés <Icon name="arrow" size={16} /></button></div><div className="product-grid">{featured.map((product) => <ProductCard key={product.id} product={product} onOpen={onOpen} onFavorite={onFavorite} favorite={favorites.includes(product.id)} />)}</div></section>
    <section className="campaign"><img src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=2200&q=85" alt="Une silhouette, des matières et des tons naturels" loading="lazy" /><div className="campaign-panel"><p className="eyebrow">Chapitre II — La lumière</p><h2>La beauté<br />des <em>essentiels.</em></h2><p>Des matières douces, des lignes nettes.<br />Le plaisir simple de bien s’habiller.</p><button className="button button-dark" onClick={() => goShop('Tout voir')}>Voir la sélection <Icon name="arrow" size={17} /></button></div><span className="campaign-caption">WEARO STUDIO · LOMÉ, TOGO</span></section>
    <section className="section offer-section"><div className="offer-box"><div><p className="eyebrow">Un petit mot de bienvenue</p><h2>10 % sur votre<br /><em>première commande.</em></h2><p>Utilisez le code <strong>BIENVENUE10</strong> au moment de régler.</p></div><button className="button button-dark" onClick={() => goShop('Tout voir')}>Découvrir la boutique <Icon name="arrow" size={17} /></button><span className="offer-stamp">VOTRE PREMIER<br />COUP DE CŒUR</span></div></section>
  </>;
}

function ShopPage({ products, onOpen, onFavorite, favorites, initialFilter = 'Tout voir' }) {
  const [category, setCategory] = useState(initialFilter);
  const [sort, setSort] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => setCategory(initialFilter), [initialFilter]);
  const list = useMemo(() => {
    let result = products.filter((product) => product.price <= maxPrice);
    if (category === 'Nouveautés') result = result.filter((product) => product.badge === 'Nouveau');
    else if (category === 'Bestsellers') result = result.filter((product) => product.badge === 'Bestseller');
    else if (category !== 'Tout voir') result = result.filter((product) => product.category === category);
    if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    return result;
  }, [products, category, sort, maxPrice]);
  return <main className="shop-page"><div className="page-intro"><p className="eyebrow">Le vestiaire WEARO</p><h1>La boutique.</h1><p>Des pièces pensées pour vous accompagner, jour après jour.</p></div><div className="shop-toolbar"><button className={`filter-toggle ${filtersOpen ? 'selected' : ''}`} onClick={() => setFiltersOpen((value) => !value)}>Filtres & catégories <span>＋</span></button><div className="category-tabs">{CATEGORIES.map((entry) => <button key={entry} className={category === entry ? 'selected' : ''} onClick={() => setCategory(entry)}>{entry}</button>)}</div><label className="sort-select"><span>Trier par</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Notre sélection</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option><option value="name">Nom</option></select></label></div>
    {filtersOpen && <div className="filter-panel"><fieldset><legend>Catégorie</legend><div className="filter-categories">{CATEGORIES.map((entry) => <button key={entry} className={category === entry ? 'selected' : ''} onClick={() => setCategory(entry)}>{entry}</button>)}</div></fieldset><label className="price-filter">Prix maximum <strong>{formatPrice(maxPrice)}</strong><input type="range" min="10000" max="100000" step="5000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /></label></div>}
    <div className="shop-result-line"><span>{list.length} pièce{list.length !== 1 ? 's' : ''}</span><span>{category}</span></div>{list.length ? <div className="product-grid shop-products">{list.map((product) => <ProductCard key={product.id} product={product} onOpen={onOpen} onFavorite={onFavorite} favorite={favorites.includes(product.id)} />)}</div> : <div className="empty-state"><span>✳</span><h2>Aucune pièce trouvée</h2><p>Essayez une autre catégorie ou ajustez le prix maximum.</p><button className="button button-dark" onClick={() => { setCategory('Tout voir'); setMaxPrice(100000); }}>Réinitialiser les filtres</button></div>}</main>;
}

function CartDrawer({ cart, products, promotions, changeQuantity, removeItem, close, checkout, promoCode, setPromoCode }) {
  const [promoMessage, setPromoMessage] = useState('');
  const lines = cart.map((line) => ({ ...line, product: products.find((product) => product.id === line.productId) })).filter((line) => line.product);
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const promo = promotions.find((entry) => entry.code === promoCode.toUpperCase() && entry.active && (!entry.expiresAt || new Date(entry.expiresAt) >= new Date()));
  const discount = promo ? Math.round(subtotal * promo.discountPercent / 100) : 0;
  const delivery = subtotal - discount >= 50000 ? 0 : 2000;
  return <div className="overlay drawer-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title"><div className="drawer-heading"><div><p className="eyebrow">Votre sélection</p><h2 id="cart-title">Le panier <span>({lines.reduce((sum, line) => sum + line.quantity, 0)})</span></h2></div><button className="icon-button" onClick={close} aria-label="Fermer le panier"><Icon name="close" /></button></div>
    {!lines.length ? <div className="cart-empty"><span className="empty-bag"><Icon name="bag" size={26} /></span><h3>Votre panier est encore vide.</h3><p>Il est temps de trouver la pièce qui vous ressemble.</p><button className="button button-dark" onClick={close}>Continuer mes achats</button></div> : <><div className="cart-lines">{lines.map((line) => <article className="cart-line" key={line.key}><img src={line.product.image} alt="" /><div className="cart-line-info"><strong>{line.product.name}</strong><span>{line.color} · {line.size}</span><b>{formatPrice(line.product.price)}</b><div className="cart-quantity"><button onClick={() => changeQuantity(line, -1)} aria-label="Retirer un article">−</button><span>{line.quantity}</span><button onClick={() => changeQuantity(line, 1)} aria-label="Ajouter un article">＋</button><button className="remove-link" onClick={() => removeItem(line.key)}>Supprimer</button></div></div></article>)}</div>
    <div className="cart-footer"><div className="promo-entry"><label htmlFor="promo-code">Code de bienvenue</label><div><input id="promo-code" value={promoCode} onChange={(event) => { setPromoCode(event.target.value.toUpperCase()); setPromoMessage(''); }} placeholder="Votre code" /><button onClick={() => setPromoMessage(promo ? 'Code appliqué.' : 'Code non reconnu.')}>Appliquer</button></div>{promoMessage && <span className={promo ? 'inline-success' : 'inline-error'}>{promoMessage}</span>}</div><div className="cart-total-row"><span>Sous-total</span><strong>{formatPrice(subtotal)}</strong></div>{discount > 0 && <div className="cart-total-row discount-row"><span>Remise {promo.code}</span><strong>− {formatPrice(discount)}</strong></div>}<div className="cart-total-row"><span>Livraison</span><strong>{delivery ? formatPrice(delivery) : 'Offerte'}</strong></div><div className="cart-total-row total-row"><span>Total estimé</span><strong>{formatPrice(subtotal - discount + delivery)}</strong></div><button className="button button-dark full-button" onClick={checkout}>Passer à la commande <Icon name="arrow" size={17} /></button><p className="secure-caption">Paiement Mobile Money disponible au Togo · Paiement réel à configurer</p></div></>}
    </aside></div>;
}

function CheckoutModal({ cart, products, promotions, promoCode, customer, onCustomerChange, onOrder, close, isSending }) {
  const [values, setValues] = useState({ name: customer?.name || '', email: customer?.email || '', phone: customer?.phone || '', address: '', city: 'Lomé', paymentMethod: 'flooz', note: '' });
  const [error, setError] = useState('');
  const lines = cart.map((line) => ({ ...line, product: products.find((product) => product.id === line.productId) })).filter((line) => line.product);
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const promo = promotions.find((entry) => entry.code === promoCode.toUpperCase() && entry.active && (!entry.expiresAt || new Date(entry.expiresAt) >= new Date()));
  const discount = promo ? Math.round(subtotal * promo.discountPercent / 100) : 0;
  const deliveryFee = subtotal - discount >= 50000 ? 0 : 2000;
  const total = subtotal - discount + deliveryFee;
  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setError('');
    try {
      await onOrder({ customer: values, paymentMethod: values.paymentMethod, promoCode, items: lines.map(({ productId, size, color, quantity }) => ({ productId, size, color, quantity })) });
      onCustomerChange({ name: values.name, email: values.email, phone: values.phone });
    } catch (reason) { setError(reason.message); }
  };
  return <div className="overlay checkout-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><section className="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title"><div className="checkout-top"><button className="back-link" onClick={close}>← <span>Retour au panier</span></button><button className="icon-button" onClick={close} aria-label="Fermer"><Icon name="close" /></button></div><div className="checkout-columns"><form className="checkout-form" onSubmit={submit}><p className="eyebrow">Dernière étape</p><h2 id="checkout-title">Votre commande.</h2><p className="checkout-intro">Vos informations servent à préparer la livraison et à vous tenir au courant.</p><div className="form-grid"><label className="span-two">Nom complet<input name="name" required autoComplete="name" maxLength="100" value={values.name} onChange={update} placeholder="Votre nom" /></label><label>E-mail<input name="email" type="email" required autoComplete="email" maxLength="150" value={values.email} onChange={update} placeholder="vous@exemple.com" /></label><label>Téléphone<input name="phone" type="tel" required autoComplete="tel" pattern="[0-9+ .()-]{8,18}" value={values.phone} onChange={update} placeholder="+228 90 00 00 00" /></label><label className="span-two">Adresse de livraison<input name="address" required autoComplete="street-address" maxLength="180" value={values.address} onChange={update} placeholder="Quartier, rue, repère…" /></label><label>Ville<input name="city" required autoComplete="address-level2" maxLength="80" value={values.city} onChange={update} /></label><label>Note (facultatif)<input name="note" maxLength="220" value={values.note} onChange={update} placeholder="Un repère pour le livreur" /></label></div><div className="payment-heading"><h3>Mode de paiement</h3><span>Paiement sécurisé</span></div><div className="payment-options"><label className={values.paymentMethod === 'flooz' ? 'payment-option selected' : 'payment-option'}><input type="radio" name="paymentMethod" value="flooz" checked={values.paymentMethod === 'flooz'} onChange={update} /><span className="payment-symbol flooz-symbol">F</span><span><strong>Flooz</strong><small>Moov Africa · Mobile Money</small></span><i /></label><label className={values.paymentMethod === 'mixx' ? 'payment-option selected' : 'payment-option'}><input type="radio" name="paymentMethod" value="mixx" checked={values.paymentMethod === 'mixx'} onChange={update} /><span className="payment-symbol mixx-symbol">M</span><span><strong>Mixx by Yas</strong><small>Mobile Money</small></span><i /></label><label className={values.paymentMethod === 'cash' ? 'payment-option selected' : 'payment-option'}><input type="radio" name="paymentMethod" value="cash" checked={values.paymentMethod === 'cash'} onChange={update} /><span className="payment-symbol cash-symbol">₣</span><span><strong>Paiement à la livraison</strong><small>En espèces, au livreur</small></span><i /></label></div><p className="payment-demo-note">Mode démonstration : aucun débit ni demande de code secret ne sera effectué.</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark full-button submit-order" disabled={isSending}>{isSending ? 'Validation…' : `Confirmer la commande · ${formatPrice(total)}`}</button><p className="legal-consent">En confirmant, vous acceptez nos <a href="#terms" onClick={close}>conditions de vente</a> et notre <a href="#privacy" onClick={close}>politique de confidentialité</a>.</p></form><aside className="order-summary"><p className="eyebrow">Votre sélection</p><h3>{lines.reduce((sum, line) => sum + line.quantity, 0)} article{lines.length !== 1 ? 's' : ''}</h3>{lines.map((line) => <div className="summary-item" key={line.key}><img src={line.product.image} alt="" /><div><strong>{line.product.name}</strong><span>{line.color} · {line.size} × {line.quantity}</span></div><b>{formatPrice(line.product.price * line.quantity)}</b></div>)}<div className="summary-totals"><div><span>Sous-total</span><b>{formatPrice(subtotal)}</b></div>{discount > 0 && <div><span>Remise</span><b>− {formatPrice(discount)}</b></div>}<div><span>Livraison</span><b>{deliveryFee ? formatPrice(deliveryFee) : 'Offerte'}</b></div><div className="summary-grand-total"><span>Total</span><b>{formatPrice(total)}</b></div></div><p className="summary-help">Une question ? <a href="#contact" onClick={close}>Nous contacter</a></p></aside></div></section></div>;
}

function AccountPanel({ customer, setCustomer, orders, close, onManageOrders }) {
  const [email, setEmail] = useState(customer?.email || '');
  const [name, setName] = useState(customer?.name || '');
  const [message, setMessage] = useState('');
  const submit = (event) => { event.preventDefault(); const next = { email: email.trim().toLowerCase(), name: name.trim() }; setCustomer(next); setMessage('Votre espace client est prêt sur cet appareil.'); };
  return <div className="overlay drawer-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><aside className="account-drawer" role="dialog" aria-modal="true" aria-labelledby="account-title"><div className="drawer-heading"><div><p className="eyebrow">Bonjour</p><h2 id="account-title">Mon espace.</h2></div><button className="icon-button" onClick={close} aria-label="Fermer"><Icon name="close" /></button></div>{customer ? <div className="account-welcome"><div className="account-avatar">{customer.name?.[0]?.toUpperCase() || 'W'}</div><h3>{customer.name || 'Bienvenue chez WEARO'}</h3><p>{customer.email}</p><button className="text-link" onClick={() => { setCustomer(null); setMessage(''); }}>Se déconnecter de cet appareil</button></div> : <form className="account-form" onSubmit={submit}><p>Retrouvez vos commandes et recevez nos nouvelles. Démonstration : aucun mot de passe n’est demandé.</p><label>Votre nom<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom et prénom" /></label><label>Votre adresse e-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" /></label><button className="button button-dark full-button">Continuer</button>{message && <p className="inline-success" role="status">{message}</p>}</form>}{customer && <section className="account-orders"><h3>Mes commandes <span>{orders.length}</span></h3>{orders.length ? orders.map((order) => <article className="account-order" key={order.id}><div><strong>{order.number}</strong><span>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span></div><b>{formatPrice(order.total)}</b><small>Statut : {order.status} · Paiement {order.paymentStatus}</small></article>) : <div className="account-no-orders"><p>Vos commandes passées sur cet appareil apparaîtront ici.</p><button className="text-link" onClick={onManageOrders}>Gérer mes commandes <Icon name="arrow" size={15} /></button></div>}</section>}<p className="account-demo-note">Cet espace est local à cette démonstration. Reliez un service d’authentification avant de mettre la boutique en ligne.</p></aside></div>;
}

function SuccessDialog({ order, close, continueShopping }) {
  if (!order) return null;
  return <div className="overlay" role="presentation"><section className="success-dialog" role="dialog" aria-modal="true" aria-labelledby="success-title"><div className="success-check"><Icon name="check" size={26} /></div><p className="eyebrow">C’est noté</p><h2 id="success-title">Merci, {order.customer.name.split(' ')[0]}.</h2><p>Votre commande est bien enregistrée.</p><div className="success-order-number"><span>Numéro de commande</span><strong>{order.number}</strong></div><div className="success-order-info"><span>Montant</span><strong>{formatPrice(order.total)}</strong><span>Paiement</span><strong>{order.paymentMethod === 'flooz' ? 'Flooz' : order.paymentMethod === 'mixx' ? 'Mixx by Yas' : 'À la livraison'} · {order.paymentStatus}</strong></div><p className="payment-demo-note">Démonstration : aucune transaction réelle n’a été réalisée. L’équipe vous recontactera pour confirmer la commande.</p><button className="button button-dark full-button" onClick={() => { close(); continueShopping(); }}>Continuer la visite</button></section></div>;
}

function Footer({ go }) {
  const groups = [
    { label: 'Boutique', links: [['shop', 'Tous les produits'], ['shop-new', 'Nouveautés'], ['shop-sales', 'Promotions'], ['collection', 'Collections']] },
    { label: 'WEARO', links: [['about', 'Notre histoire'], ['contact', 'Contact'], ['faq', 'FAQ']] },
    { label: 'Informations', links: [['delivery', 'Livraison'], ['returns', 'Échanges & retours'], ['terms', 'Conditions de vente'], ['privacy', 'Confidentialité']] },
  ];
  const click = (target) => { if (target === 'shop-new') go('shop', 'Nouveautés'); else if (target === 'shop-sales') go('shop', 'Tout voir'); else go(target); };
  return <footer className="site-footer"><div className="footer-top"><div className="footer-brand"><Logo onClick={() => go('home')} /><p>Moins, mais mieux.<br />Le plaisir de bien s’habiller.</p><span className="footer-location">LOMÉ, TOGO · DEPUIS TOUJOURS</span></div>{groups.map((group) => <div className="footer-group" key={group.label}><h3>{group.label}</h3>{group.links.map(([target, label]) => <button key={label} onClick={() => click(target)}>{label}</button>)}</div>)}<div className="footer-contact"><p className="eyebrow">Une question ?</p><button className="footer-email" onClick={() => go('contact')}>Écrivons-nous <Icon name="arrow" size={15} /></button><p>Du lundi au samedi<br />Lomé, Togo</p></div></div><div className="footer-bottom"><span>© 2026 WEARO Studio · Tous droits réservés</span><span>Des essentiels, choisis avec intention.</span><button onClick={() => go('privacy')}>Confidentialité</button></div></footer>;
}

function ContactPage() {
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [state, setState] = useState({ busy: false, message: '', error: '' });
  const submit = async (event) => { event.preventDefault(); setState({ busy: true, message: '', error: '' }); try { const result = await api('/contact', { method: 'POST', body: values }); setState({ busy: false, message: result.message, error: '' }); setValues({ name: '', email: '', message: '' }); } catch (error) { setState({ busy: false, message: '', error: error.message }); } };
  return <main className="editorial-page contact-page"><div className="editorial-intro"><p className="eyebrow">Nous sommes à votre écoute</p><h1>Un mot suffit.</h1><p>Une question sur une pièce ou une commande ? Notre équipe à Lomé est là pour vous aider.</p><div className="contact-details"><div><span>E-mail</span><strong>bonjour@wearo.studio</strong></div><div><span>Instagram</span><strong>@wearo.studio</strong></div><div><span>Horaires</span><strong>Lun. – Sam. · 9 h – 18 h</strong></div></div></div><form className="contact-form" onSubmit={submit}><p className="eyebrow">Votre message</p><label>Nom<input required maxLength="100" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} /></label><label>E-mail<input type="email" required maxLength="150" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} /></label><label>Comment pouvons-nous vous aider ?<textarea required minLength="8" maxLength="2000" rows="5" value={values.message} onChange={(event) => setValues({ ...values, message: event.target.value })} /></label>{state.error && <p className="form-error" role="alert">{state.error}</p>}{state.message && <p className="inline-success" role="status">{state.message}</p>}<button className="button button-dark" disabled={state.busy}>{state.busy ? 'Envoi…' : 'Envoyer le message'} <Icon name="arrow" size={16} /></button></form></main>;
}

function InformationPage({ view, go }) {
  if (view === 'contact') return <ContactPage />;
  if (view === 'collection') return <main className="editorial-page collections-page"><div className="editorial-intro"><p className="eyebrow">À chacun son essentiel</p><h1>Des lignes<br /><em>qui vous suivent.</em></h1><p>Nos collections racontent un vestiaire fait de belles matières, de pièces faciles à vivre et de silhouettes qui traversent les saisons.</p><button className="button button-dark" onClick={() => go('shop')}>Voir la boutique <Icon name="arrow" size={16} /></button></div><div className="collections-editorial-grid">{[['Vestes', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85'], ['Hauts', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85'], ['Robes', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85']].map(([category, img]) => <button key={category} onClick={() => go('shop', category)}><img src={img} alt="" loading="lazy" /><span>{category} <Icon name="arrow" size={15} /></span></button>)}</div></main>;
  const [title, copy] = LEGAL[view] || LEGAL.about;
  if (view === 'faq') return <main className="editorial-page faq-page"><div className="editorial-intro"><p className="eyebrow">Tout simplement</p><h1>Vos questions.</h1><p>Nous avons rassemblé ici les réponses les plus utiles.</p><button className="text-link" onClick={() => go('contact')}>Une autre question ? Écrivez-nous <Icon name="arrow" size={16} /></button></div><div className="faq-list">{FAQS.map(([question, answer]) => <details key={question}><summary>{question}<span>＋</span></summary><p>{answer}</p></details>)}</div></main>;
  return <main className="editorial-page legal-page"><p className="eyebrow">WEARO Studio · Lomé, Togo</p><h1>{title}</h1><div className="legal-copy"><p>{copy}</p>{view === 'about' && <><p>Nous croyons qu’un beau vestiaire ne demande pas d’en faire trop. Il suffit de quelques vêtements bien choisis, agréables à porter et faciles à associer.</p><p>De Lomé, nous réunissons des pièces contemporaines et des créateurs qui partagent notre goût pour les formes simples, la qualité au quotidien et le sens du détail.</p><button className="text-link" onClick={() => go('shop')}>Découvrir la sélection <Icon name="arrow" size={16} /></button></>}{view === 'privacy' && <><h2>Vos données</h2><p>Les informations enregistrées comprennent les coordonnées de livraison et le détail de la commande. Un déploiement réel devra intégrer une politique de conservation, de suppression et d’exercice des droits conforme aux règles applicables.</p><h2>Paiement</h2><p>Ne communiquez jamais de code secret Mobile Money dans un formulaire de boutique. Le prestataire de paiement doit gérer directement la validation de chaque transaction.</p></>}</div><div className="legal-note"><span>✳</span><p>Une question sur ces informations ? <button className="text-link" onClick={() => go('contact')}>Contactez notre équipe.</button></p></div></main>;
}

function AdminPage({ products, setProducts, setPromotions, go }) {
  const [key, setKey] = useState(initialAdminKey);
  const [section, setSection] = useState('overview');
  const [data, setData] = useState({ orders: [], promotions: demoPromotions, messages: [] });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [newPromoOpen, setNewPromoOpen] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', category: 'Hauts', price: '', image: '', description: '', sizes: 'S, M, L, XL', colors: 'Noir, Sable', stockEach: '3' });
  const [promoForm, setPromoForm] = useState({ code: '', label: '', discountPercent: '10' });
  const admin = (path, options = {}) => api(path, { ...options, adminKey: key });
  const refresh = async () => { if (!key) return; setBusy(true); setError(''); try { const [orders, promotions, messages] = await Promise.all([admin('/orders'), admin('/promotions'), admin('/messages')]); setData({ orders, promotions, messages }); } catch (reason) { setError(reason.message); } finally { setBusy(false); } };
  useEffect(() => { refresh(); }, [key]);
  const updateStock = async (product, variant, delta) => { const next = { ...product, variants: product.variants.map((entry) => entry === variant ? { ...entry, stock: Math.max(0, entry.stock + delta) } : entry) }; try { const saved = await admin(`/products/${product.id}`, { method: 'PATCH', body: next }); setProducts((current) => current.map((entry) => entry.id === saved.id ? saved : entry)); setNotice('Stock mis à jour.'); } catch (reason) { setError(reason.message); } };
  const changeOrder = async (order, status) => { try { const saved = await admin(`/orders/${order.id}`, { method: 'PATCH', body: { status } }); setData((current) => ({ ...current, orders: current.orders.map((entry) => entry.id === order.id ? saved : entry) })); } catch (reason) { setError(reason.message); } };
  const deleteProduct = async (product) => { try { await admin(`/products/${product.id}`, { method: 'DELETE' }); setProducts((current) => current.filter((entry) => entry.id !== product.id)); setNotice(`${product.name} supprimé.`); } catch (reason) { setError(reason.message); } };
  const openProductEditor = (product) => {
    setError(''); setEditProductId(product.id);
    setProductForm({ name: product.name, category: product.category, price: String(product.price), image: product.image, description: product.description, sizes: product.sizes.join(', '), colors: product.colors.map((color) => color.name).join(', '), stockEach: '0' });
    setNewProductOpen(true);
  };
  const openNewProduct = () => {
    setError(''); setEditProductId(null);
    setProductForm({ name: '', category: 'Hauts', price: '', image: '', description: '', sizes: 'S, M, L, XL', colors: 'Noir, Sable', stockEach: '3' });
    setNewProductOpen(true);
  };
  const saveProduct = async (event) => {
    event.preventDefault();
    try {
      if (editProductId) {
        const current = products.find((product) => product.id === editProductId);
        const saved = await admin(`/products/${editProductId}`, { method: 'PATCH', body: { ...current, name: productForm.name, category: productForm.category, price: Number(productForm.price), image: productForm.image, description: productForm.description } });
        setProducts((items) => items.map((item) => item.id === saved.id ? saved : item)); setNewProductOpen(false); setEditProductId(null); setNotice('Produit mis à jour.');
      } else {
        const sizes = productForm.sizes.split(',').map((value) => value.trim()).filter(Boolean); const colorNames = productForm.colors.split(',').map((value) => value.trim()).filter(Boolean); const stock = Math.max(0, Number(productForm.stockEach) || 0); const variants = sizes.flatMap((size) => colorNames.map((color) => ({ size, color, stock }))); const colors = colorNames.map((name, index) => ({ name, hex: ['#292622', '#c9b99f', '#e8dfd0', '#74745b'][index % 4] }));
        const saved = await admin('/products', { method: 'POST', body: { ...productForm, id: productForm.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), price: Number(productForm.price), oldPrice: null, stock: variants.reduce((sum, item) => sum + item.stock, 0), sizes, colors, variants, badge: 'Nouveau' } });
        setProducts((items) => [saved, ...items]); setNewProductOpen(false); setProductForm({ name: '', category: 'Hauts', price: '', image: '', description: '', sizes: 'S, M, L, XL', colors: 'Noir, Sable', stockEach: '3' }); setNotice('Produit ajouté à la boutique.');
      }
    } catch (reason) { setError(reason.message); }
  };
  const savePromo = async (event) => { event.preventDefault(); try { const saved = await admin('/promotions', { method: 'POST', body: { ...promoForm, discountPercent: Number(promoForm.discountPercent) } }); setData((current) => ({ ...current, promotions: [saved, ...current.promotions] })); setPromotions((current) => [saved, ...current]); setNewPromoOpen(false); setPromoForm({ code: '', label: '', discountPercent: '10' }); setNotice('Code promotionnel créé.'); } catch (reason) { setError(reason.message); } };
  const togglePromo = async (promo) => { try { const saved = await admin(`/promotions/${promo.id}`, { method: 'PATCH', body: { active: !promo.active } }); setData((current) => ({ ...current, promotions: saved })); setPromotions(saved); } catch (reason) { setError(reason.message); } };
  const customers = [...new Map(data.orders.map((order) => [order.customer.email, { ...order.customer, orderCount: data.orders.filter((item) => item.customer.email === order.customer.email).length }])).values()];
  if (!key || (error.includes('Accès administrateur') || error.includes('authentification administrateur'))) return <main className="admin-gate"><div className="admin-gate-card"><div className="admin-gate-mark">W</div><p className="eyebrow">Accès réservé</p><h1>Tableau de bord.</h1><p>Saisissez la clé administrateur configurée sur le serveur pour gérer la boutique.</p><form onSubmit={(event) => { event.preventDefault(); setError(''); refresh(); }}><label>Clé administrateur<input type="password" value={key} onChange={(event) => setKey(event.target.value)} placeholder="Clé du serveur" autoComplete="current-password" /></label><button className="button button-dark full-button">Ouvrir le tableau de bord</button></form>{error && <p className="form-error" role="alert">{error}</p>}<button className="back-link" onClick={() => go('home')}>← Retour à la boutique</button></div></main>;
  return <main className="admin-page"><aside className="admin-sidebar"><div className="admin-side-brand"><span className="brand-mark">W</span><span>WEARO <small>ADMIN</small></span></div><p className="admin-nav-label">GESTION DE LA BOUTIQUE</p>{[['overview', 'Vue d’ensemble', '◫'], ['products', 'Produits & stock', '◧'], ['orders', 'Commandes', '⌑'], ['clients', 'Clients', '♙'], ['promotions', 'Promotions', '✳'], ['messages', 'Messages', '✉']].map(([target, label, icon]) => <button key={target} className={section === target ? 'active' : ''} onClick={() => setSection(target)}><span>{icon}</span>{label}{target === 'orders' && data.orders.length > 0 && <b>{data.orders.filter((order) => order.status !== 'livrée').length}</b>}</button>)}<button className="admin-back" onClick={() => go('home')}>↗ Voir la boutique</button></aside><section className="admin-main"><div className="admin-topbar"><div><p className="eyebrow">WEARO Studio · Lomé</p><h1>{({ overview: 'Vue d’ensemble', products: 'Produits & stock', orders: 'Commandes', clients: 'Clients', promotions: 'Promotions', messages: 'Messages' })[section]}</h1></div><div className="admin-top-actions"><span className="admin-status"><i /> Boutique démo</span><button className="icon-button" onClick={refresh} aria-label="Actualiser" disabled={busy}>↻</button></div></div>{error && <p className="admin-alert" role="alert">{error}</p>}{notice && <p className="admin-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Fermer">×</button></p>}
    {section === 'overview' && <><div className="admin-metrics"><article><span>Commandes reçues</span><strong>{data.orders.length}</strong><small>Toutes périodes</small></article><article><span>Chiffre d’affaires</span><strong>{formatPrice(data.orders.reduce((sum, order) => sum + order.total, 0))}</strong><small>Commandes enregistrées</small></article><article><span>Produits en boutique</span><strong>{products.length}</strong><small>{products.reduce((sum, product) => sum + product.stock, 0)} pièces en stock</small></article><article><span>Clients</span><strong>{customers.length}</strong><small>Clients enregistrés</small></article></div><div className="admin-content-card"><div className="admin-card-heading"><div><h2>Commandes récentes</h2><p>Suivez les dernières commandes de la boutique.</p></div><button className="text-link" onClick={() => setSection('orders')}>Toutes les commandes <Icon name="arrow" size={15} /></button></div><OrdersTable orders={data.orders.slice(0, 5)} onStatus={changeOrder} /></div><div className="admin-content-card stock-summary"><div className="admin-card-heading"><div><h2>À surveiller</h2><p>Les articles avec peu de stock.</p></div><button className="text-link" onClick={() => setSection('products')}>Gérer le stock <Icon name="arrow" size={15} /></button></div>{products.filter((product) => product.stock <= 6).map((product) => <div className="low-stock-row" key={product.id}><img src={product.image} alt="" /><strong>{product.name}</strong><span>{product.stock} restant{product.stock > 1 ? 's' : ''}</span><i className={product.stock === 0 ? 'out-stock' : ''} /></div>)}</div></>}
    {section === 'products' && <div className="admin-content-card"><div className="admin-card-heading"><div><h2>Catalogue</h2><p>{products.length} produits · Stock ajusté par taille et couleur</p></div><button className="button button-dark" onClick={openNewProduct}><Icon name="plus" size={16} /> Ajouter un produit</button></div><div className="admin-products-list">{products.map((product) => <article className="admin-product-row" key={product.id}><img src={product.image} alt="" /><div className="admin-product-name"><strong>{product.name}</strong><span>{product.category} · {formatPrice(product.price)}</span><button className="edit-product" onClick={() => openProductEditor(product)}>Modifier les détails</button></div><div className="admin-variants">{product.variants.map((variant) => <div key={`${variant.size}-${variant.color}`}><span>{variant.size} · {variant.color}</span><button onClick={() => updateStock(product, variant, -1)} aria-label={`Retirer une unité, ${variant.size}, ${variant.color}`}>−</button><strong>{variant.stock}</strong><button onClick={() => updateStock(product, variant, 1)} aria-label={`Ajouter une unité, ${variant.size}, ${variant.color}`}>＋</button></div>)}</div><button className="remove-product" onClick={() => deleteProduct(product)}>Supprimer</button></article>)}</div></div>}
    {section === 'orders' && <div className="admin-content-card"><div className="admin-card-heading"><div><h2>Toutes les commandes</h2><p>Statut, coordonnées et mode de paiement.</p></div><span className="admin-count-chip">{data.orders.length} commande{data.orders.length !== 1 ? 's' : ''}</span></div><OrdersTable orders={data.orders} onStatus={changeOrder} /></div>}
    {section === 'clients' && <div className="admin-content-card"><div className="admin-card-heading"><div><h2>Vos clients</h2><p>Coordonnées recueillies au moment de la commande.</p></div></div><div className="table-wrap"><table className="admin-table"><thead><tr><th>Nom</th><th>E-mail</th><th>Téléphone</th><th>Ville</th><th>Commandes</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.email}><td>{customer.name}</td><td>{customer.email}</td><td>{customer.phone}</td><td>{customer.city}</td><td>{customer.orderCount}</td></tr>)}</tbody></table>{!customers.length && <p className="table-empty">Vos clients apparaîtront ici après la première commande.</p>}</div></div>}
    {section === 'promotions' && <div className="admin-content-card"><div className="admin-card-heading"><div><h2>Codes promotionnels</h2><p>Créez et activez les offres de la boutique.</p></div><button className="button button-dark" onClick={() => setNewPromoOpen(true)}><Icon name="plus" size={16} /> Nouvelle offre</button></div><div className="promo-admin-list">{data.promotions.map((promo) => <article key={promo.id}><div className="promo-code-block"><span>CODE</span><strong>{promo.code}</strong></div><div><strong>{promo.label}</strong><span>{promo.discountPercent} % de remise</span></div><span className={promo.active ? 'status-chip active-chip' : 'status-chip'}>{promo.active ? 'Active' : 'Inactive'}</span><button className="button button-outline" onClick={() => togglePromo(promo)}>{promo.active ? 'Désactiver' : 'Activer'}</button></article>)}</div></div>}
    {section === 'messages' && <div className="admin-content-card"><div className="admin-card-heading"><div><h2>Messages reçus</h2><p>Demandes envoyées depuis le formulaire de contact.</p></div></div>{data.messages.length ? <div className="message-list">{data.messages.map((message) => <article key={message.id}><div><strong>{message.name}</strong><a href={`mailto:${message.email}`}>{message.email}</a><time>{new Date(message.createdAt).toLocaleString('fr-FR')}</time></div><p>{message.message}</p></article>)}</div> : <p className="table-empty">Aucun message reçu.</p>}</div>}
    {busy && <div className="admin-busy" aria-live="polite">Mise à jour du tableau de bord…</div>}
    </section>
    {newProductOpen && <div className="overlay"><form className="admin-form-dialog" onSubmit={saveProduct}><button type="button" className="dialog-close icon-button" onClick={() => { setNewProductOpen(false); setEditProductId(null); }} aria-label="Fermer"><Icon name="close" /></button><p className="eyebrow">Catalogue</p><h2>{editProductId ? 'Modifier une pièce.' : 'Ajouter une pièce.'}</h2><label>Nom<input required maxLength="80" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} /></label><div className="form-grid"><label>Catégorie<select value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}>{['Vestes', 'Hauts', 'Pantalons', 'Robes', 'Accessoires'].map((value) => <option key={value}>{value}</option>)}</select></label><label>Prix en F CFA<input type="number" min="1" required value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} /></label><label className="span-two">URL de la photo<input type="url" required value={productForm.image} onChange={(event) => setProductForm({ ...productForm, image: event.target.value })} placeholder="https://…" /></label><label className="span-two">Description<input maxLength="500" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} /></label>{!editProductId && <><label>Tailles (séparées par des virgules)<input value={productForm.sizes} onChange={(event) => setProductForm({ ...productForm, sizes: event.target.value })} /></label><label>Couleurs (séparées par des virgules)<input value={productForm.colors} onChange={(event) => setProductForm({ ...productForm, colors: event.target.value })} /></label><label className="span-two">Stock par variante<input type="number" min="0" value={productForm.stockEach} onChange={(event) => setProductForm({ ...productForm, stockEach: event.target.value })} /></label></>}</div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark full-button">{editProductId ? 'Enregistrer les modifications' : 'Ajouter à la boutique'}</button></form></div>}
    {newPromoOpen && <div className="overlay"><form className="admin-form-dialog narrow-dialog" onSubmit={savePromo}><button type="button" className="dialog-close icon-button" onClick={() => setNewPromoOpen(false)} aria-label="Fermer"><Icon name="close" /></button><p className="eyebrow">Promotions</p><h2>Nouvelle offre.</h2><label>Code promotionnel<input required maxLength="24" value={promoForm.code} onChange={(event) => setPromoForm({ ...promoForm, code: event.target.value.toUpperCase() })} placeholder="EXEMPLE10" /></label><label>Nom de l’offre<input required maxLength="80" value={promoForm.label} onChange={(event) => setPromoForm({ ...promoForm, label: event.target.value })} placeholder="Bienvenue chez WEARO" /></label><label>Remise (%)<input type="number" min="1" max="80" value={promoForm.discountPercent} onChange={(event) => setPromoForm({ ...promoForm, discountPercent: event.target.value })} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark full-button">Créer l’offre</button></form></div>}
  </main>;
}

function OrdersTable({ orders, onStatus }) {
  return <div className="table-wrap"><table className="admin-table"><thead><tr><th>Commande</th><th>Client</th><th>Date</th><th>Paiement</th><th>Total</th><th>Statut</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.number}</strong><small>{order.items.reduce((sum, item) => sum + item.quantity, 0)} article{order.items.length !== 1 ? 's' : ''}</small></td><td>{order.customer.name}<small>{order.customer.email}</small></td><td>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td><td>{order.paymentMethod === 'flooz' ? 'Flooz' : order.paymentMethod === 'mixx' ? 'Mixx' : 'À la livraison'}<small>{order.paymentStatus}</small></td><td><strong>{formatPrice(order.total)}</strong></td><td><select className={`status-select ${order.status === 'livrée' ? 'delivered' : ''}`} value={order.status} onChange={(event) => onStatus(order, event.target.value)} aria-label={`Statut de la commande ${order.number}`}>{['reçue', 'en préparation', 'expédiée', 'livrée', 'annulée'].map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table>{!orders.length && <p className="table-empty">Aucune commande pour le moment.</p>}</div>;
}

function SearchOverlay({ close, products, onOpen }) {
  const [query, setQuery] = useState('');
  const matches = query.trim().length > 1 ? products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5) : [];
  return <div className="overlay search-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><section className="search-dialog" role="dialog" aria-modal="true" aria-label="Rechercher un produit"><div className="search-input-wrap"><Icon name="search" size={21} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Que recherchez-vous ?" aria-label="Rechercher dans la boutique" /><button className="icon-button" onClick={close} aria-label="Fermer"><Icon name="close" /></button></div>{query.trim().length > 1 && <div className="search-results">{matches.length ? matches.map((product) => <button key={product.id} onClick={() => { onOpen(product); close(); }}><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.category}</small></span><b>{formatPrice(product.price)}</b></button>) : <p>Aucune pièce trouvée pour « {query} ».</p>}</div>}</section></div>;
}

export default function App() {
  const [view, setView] = useState(() => window.location.hash.slice(1).split('?')[0] || 'home');
  const [shopFilter, setShopFilter] = useState('Tout voir');
  const [products, setProducts] = useState(demoProducts);
  const [promotions, setPromotions] = useState(demoPromotions);
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('wearo-cart') || '[]'); } catch { return []; } });
  const [customer, setCustomer] = useState(() => { try { return JSON.parse(localStorage.getItem('wearo-customer') || 'null'); } catch { return null; } });
  const [orders, setOrders] = useState(() => { try { return JSON.parse(localStorage.getItem('wearo-orders') || '[]'); } catch { return []; } });
  const [favorites, setFavorites] = useState(() => { try { return JSON.parse(localStorage.getItem('wearo-favorites') || '[]'); } catch { return []; } });
  const [promoCode, setPromoCode] = useState('');
  const [productModal, setProductModal] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [sendingOrder, setSendingOrder] = useState(false);
  const [toast, setToast] = useState('');
  useEffect(() => { api('/products').then(setProducts).catch(() => {}); api('/promotions').then(setPromotions).catch(() => {}); }, []);
  useEffect(() => { localStorage.setItem('wearo-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { if (customer) localStorage.setItem('wearo-customer', JSON.stringify(customer)); else localStorage.removeItem('wearo-customer'); }, [customer]);
  useEffect(() => { localStorage.setItem('wearo-orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('wearo-favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { const sync = () => setView(window.location.hash.slice(1).split('?')[0] || 'home'); window.addEventListener('hashchange', sync); return () => window.removeEventListener('hashchange', sync); }, []);
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(''), 2800); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => {
    const titles = { home: 'WEARO Studio — Le style, en toute simplicité', shop: 'La boutique — WEARO Studio', collection: 'Collections — WEARO Studio', about: 'Notre histoire — WEARO Studio', contact: 'Contact — WEARO Studio', faq: 'FAQ — WEARO Studio', terms: 'Conditions de vente — WEARO Studio', privacy: 'Confidentialité — WEARO Studio', delivery: 'Livraison — WEARO Studio', returns: 'Échanges & retours — WEARO Studio', admin: 'Administration — WEARO Studio' };
    document.title = titles[view] || titles.home;
  }, [view]);
  const go = (target, filter) => { if (filter) setShopFilter(filter); else if (target === 'shop') setShopFilter('Tout voir'); setView(target); window.location.hash = target; window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const addToCart = (product, size, color, quantity = 1) => { const variant = product.variants.find((entry) => entry.size === size && entry.color === color); const key = `${product.id}|${size}|${color}`; const currentQuantity = cart.find((entry) => entry.key === key)?.quantity || 0; if (!variant || currentQuantity + quantity > variant.stock || currentQuantity + quantity > 10) { setToast('La quantité demandée n’est plus disponible.'); return false; } setCart((current) => { const match = current.find((entry) => entry.key === key); return match ? current.map((entry) => entry.key === key ? { ...entry, quantity: entry.quantity + quantity } : entry) : [...current, { key, productId: product.id, size, color, quantity }]; }); setToast('Ajouté à votre panier.'); return true; };
  const changeQuantity = (line, delta) => setCart((current) => current.map((entry) => entry.key === line.key ? { ...entry, quantity: Math.max(1, Math.min(10, line.product.variants.find((variant) => variant.size === entry.size && variant.color === entry.color)?.stock || 1, entry.quantity + delta)) } : entry));
  const removeItem = (key) => setCart((current) => current.filter((entry) => entry.key !== key));
  const toggleFavorite = (id) => setFavorites((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const placeOrder = async (payload) => { setSendingOrder(true); try { const result = await api('/orders', { method: 'POST', body: payload }); setOrders((current) => [result.order, ...current]); setProducts(await api('/products')); setCart([]); setPromoCode(''); setCheckoutOpen(false); setCartOpen(false); setSuccessOrder(result.order); } finally { setSendingOrder(false); } };
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const openCheckout = () => { setCartOpen(false); setCheckoutOpen(true); };
  const onOpenProduct = (product) => setProductModal(product);
  return <div className="app-shell"><Header view={view} go={go} cartCount={cartCount} openCart={() => setCartOpen(true)} openAccount={() => setAccountOpen(true)} setSearchOpen={setSearchOpen} />
    {view === 'home' && <HomePage products={products} onOpen={onOpenProduct} onFavorite={toggleFavorite} favorites={favorites} goShop={(filter) => go('shop', filter)} />}
    {view === 'shop' && <ShopPage products={products} onOpen={onOpenProduct} onFavorite={toggleFavorite} favorites={favorites} initialFilter={shopFilter} />}
    {view === 'admin' && <AdminPage products={products} setProducts={setProducts} setPromotions={setPromotions} go={go} />}
    {!['home', 'shop', 'admin'].includes(view) && <InformationPage view={view} go={go} />}
    {view !== 'admin' && <Footer go={go} />}
    {productModal && <ProductModal product={productModal} close={() => setProductModal(null)} addToCart={(...args) => { const result = addToCart(...args); return result; }} />}
    {cartOpen && <CartDrawer cart={cart} products={products} promotions={promotions} changeQuantity={changeQuantity} removeItem={removeItem} close={() => setCartOpen(false)} checkout={openCheckout} promoCode={promoCode} setPromoCode={setPromoCode} />}
    {checkoutOpen && <CheckoutModal cart={cart} products={products} promotions={promotions} promoCode={promoCode} customer={customer} onCustomerChange={setCustomer} onOrder={placeOrder} close={() => setCheckoutOpen(false)} isSending={sendingOrder} />}
    {accountOpen && <AccountPanel customer={customer} setCustomer={setCustomer} orders={orders} close={() => setAccountOpen(false)} onManageOrders={() => { setAccountOpen(false); go('shop'); }} />}
    {searchOpen && <SearchOverlay close={() => setSearchOpen(false)} products={products} onOpen={onOpenProduct} />}
    {successOrder && <SuccessDialog order={successOrder} close={() => setSuccessOrder(null)} continueShopping={() => go('shop')} />}
    {toast && <div className="toast" role="status"><Icon name="check" size={16} />{toast}</div>}
    <button className="admin-shortcut" aria-label="Ouvrir le tableau de bord administrateur" onClick={() => go('admin')}>W<span>Admin</span></button>
    <span className="sr-only" aria-live="polite">{cartCount} article{cartCount !== 1 ? 's' : ''} dans le panier</span>
    <span className="sr-only">{promotions.length} codes promotionnels disponibles</span>
  </div>;
}
