export const demoProducts = [
  {
    id: 'veste-ligne', name: 'Veste Ligne', category: 'Vestes', price: 38500, oldPrice: 45000,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85',
    badge: 'Bestseller', description: 'Une coupe décontractée, un tombé structuré et des détails pensés pour traverser les saisons.',
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Sable', hex: '#c9b99f' }, { name: 'Noir', hex: '#24211f' }], stock: 18,
    variants: [{ size: 'S', color: 'Sable', stock: 3 }, { size: 'M', color: 'Sable', stock: 5 }, { size: 'L', color: 'Sable', stock: 2 }, { size: 'XL', color: 'Sable', stock: 1 }, { size: 'S', color: 'Noir', stock: 2 }, { size: 'M', color: 'Noir', stock: 3 }, { size: 'L', color: 'Noir', stock: 1 }, { size: 'XL', color: 'Noir', stock: 1 }],
  },
  {
    id: 'chemise-atelier', name: 'Chemise Atelier', category: 'Hauts', price: 24500,
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85',
    badge: 'Nouveau', description: 'Le coton doux et respirant rencontre une silhouette ample et naturellement élégante.',
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Ivoire', hex: '#e9e2d3' }, { name: 'Bleu nuit', hex: '#31383f' }], stock: 15,
    variants: [{ size: 'S', color: 'Ivoire', stock: 2 }, { size: 'M', color: 'Ivoire', stock: 4 }, { size: 'L', color: 'Ivoire', stock: 3 }, { size: 'XL', color: 'Ivoire', stock: 1 }, { size: 'S', color: 'Bleu nuit', stock: 1 }, { size: 'M', color: 'Bleu nuit', stock: 2 }, { size: 'L', color: 'Bleu nuit', stock: 1 }, { size: 'XL', color: 'Bleu nuit', stock: 1 }],
  },
  {
    id: 'pantalon-sable', name: 'Pantalon Sable', category: 'Pantalons', price: 29500,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85',
    badge: '', description: 'Un pantalon à taille haute et jambe droite, aussi simple à porter qu’à associer.',
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Sable', hex: '#c9b99f' }, { name: 'Noir', hex: '#24211f' }], stock: 11,
    variants: [{ size: 'S', color: 'Sable', stock: 2 }, { size: 'M', color: 'Sable', stock: 3 }, { size: 'L', color: 'Sable', stock: 2 }, { size: 'XL', color: 'Sable', stock: 1 }, { size: 'S', color: 'Noir', stock: 1 }, { size: 'M', color: 'Noir', stock: 1 }, { size: 'L', color: 'Noir', stock: 1 }, { size: 'XL', color: 'Noir', stock: 0 }],
  },
  {
    id: 'robe-essentielle', name: 'Robe Essentielle', category: 'Robes', price: 32000, oldPrice: 39000,
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=85',
    badge: '-18%', description: 'Une ligne fluide et féminine, facile à habiller pour les belles occasions ou le quotidien.',
    sizes: ['S', 'M', 'L'], colors: [{ name: 'Noir', hex: '#24211f' }, { name: 'Terracotta', hex: '#a15f48' }], stock: 10,
    variants: [{ size: 'S', color: 'Noir', stock: 2 }, { size: 'M', color: 'Noir', stock: 3 }, { size: 'L', color: 'Noir', stock: 2 }, { size: 'S', color: 'Terracotta', stock: 1 }, { size: 'M', color: 'Terracotta', stock: 1 }, { size: 'L', color: 'Terracotta', stock: 1 }],
  },
  {
    id: 'maille-douce', name: 'Maille Douce', category: 'Hauts', price: 27500,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85',
    badge: 'Nouveau', description: 'Une maille légère et réconfortante aux finitions délicates. À porter seule ou en superposition.',
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Écru', hex: '#e8dfd0' }, { name: 'Olive', hex: '#74745b' }], stock: 12,
    variants: [{ size: 'S', color: 'Écru', stock: 2 }, { size: 'M', color: 'Écru', stock: 3 }, { size: 'L', color: 'Écru', stock: 2 }, { size: 'XL', color: 'Écru', stock: 1 }, { size: 'S', color: 'Olive', stock: 1 }, { size: 'M', color: 'Olive', stock: 1 }, { size: 'L', color: 'Olive', stock: 1 }, { size: 'XL', color: 'Olive', stock: 1 }],
  },
  {
    id: 'sac-jour', name: 'Sac Le Jour', category: 'Accessoires', price: 22000,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85',
    badge: '', description: 'Un compagnon de tous les jours, spacieux juste ce qu’il faut, aux lignes épurées.',
    sizes: ['Unique'], colors: [{ name: 'Cognac', hex: '#966440' }, { name: 'Noir', hex: '#24211f' }], stock: 9,
    variants: [{ size: 'Unique', color: 'Cognac', stock: 5 }, { size: 'Unique', color: 'Noir', stock: 4 }],
  },
  {
    id: 'blazer-structure', name: 'Blazer Structure', category: 'Vestes', price: 42500,
    image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=85',
    badge: 'Bestseller', description: 'Un vestiaire raffiné commence par une belle veste. Celle-ci donne le ton avec assurance.',
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Noir', hex: '#24211f' }, { name: 'Sable', hex: '#c9b99f' }], stock: 13,
    variants: [{ size: 'S', color: 'Noir', stock: 1 }, { size: 'M', color: 'Noir', stock: 3 }, { size: 'L', color: 'Noir', stock: 2 }, { size: 'XL', color: 'Noir', stock: 1 }, { size: 'S', color: 'Sable', stock: 2 }, { size: 'M', color: 'Sable', stock: 2 }, { size: 'L', color: 'Sable', stock: 1 }, { size: 'XL', color: 'Sable', stock: 1 }],
  },
  {
    id: 'tee-studio', name: 'T-shirt Studio', category: 'Hauts', price: 12500,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
    badge: '', description: 'L’essentiel bien fait. Un jersey de coton agréable, une coupe nette, mille façons de le porter.',
    sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Blanc', hex: '#efeee9' }, { name: 'Noir', hex: '#24211f' }, { name: 'Terre', hex: '#a15f48' }], stock: 22,
    variants: [{ size: 'S', color: 'Blanc', stock: 3 }, { size: 'M', color: 'Blanc', stock: 4 }, { size: 'L', color: 'Blanc', stock: 3 }, { size: 'XL', color: 'Blanc', stock: 2 }, { size: 'S', color: 'Noir', stock: 2 }, { size: 'M', color: 'Noir', stock: 3 }, { size: 'L', color: 'Noir', stock: 2 }, { size: 'XL', color: 'Noir', stock: 1 }, { size: 'S', color: 'Terre', stock: 1 }, { size: 'M', color: 'Terre', stock: 1 }],
  },
];

export const demoPromotions = [
  { id: 'welcome10', code: 'BIENVENUE10', label: 'Un premier plaisir', discountPercent: 10, active: true, expiresAt: '' },
];

export const formatPrice = (amount) => `${new Intl.NumberFormat('fr-FR').format(amount)} F CFA`;
