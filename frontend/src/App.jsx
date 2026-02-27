import React, { useState, useEffect } from 'react';
import { ShoppingBag, Bot, Loader2 } from 'lucide-react';
import Navbar from './components/layout/Navbar';
import HeroSection from './components/layout/HeroSection';
import Footer from './components/layout/Footer';
import ProductGrid from './components/menu/ProductGrid';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginModal from './components/admin/LoginModal';
import CustomizationModal from './components/menu/CustomizationModal';
import GalleryModal from './components/menu/GalleryModal';
import CartModal from './components/cart/CartModal';
import ConfirmationView from './components/cart/ConfirmationView';
import DeleteConfirmationModal from './components/admin/DeleteConfirmationModal';
import ToastNotification from './components/ui/ToastNotification';
import EnhancedChatBot from './EnhancedChatBot';
import CategoryToggle from './components/layout/CategoryToggle';
import RentalProductCard from './components/rental/RentalProductCard';
import CartSidebar from './components/cart/CartSidebar';
import CheckoutForm from './components/cart/CheckoutForm';
import CommunitySection from './components/community/CommunitySection';
import MobileBottomNav from './components/layout/MobileBottomNav';
import BulkOrderModal from './components/menu/BulkOrderModal';
import DiscountTimer from './components/layout/DiscountTimer';

const DEMO_MODE = false;
const API_URL = "/api";
const BUSINESS_PHONE = "523123099318";

const BACKUP_OPTIONS = {
  bases: ["Sabritas naturales", "Chips fuego", "Ruffles queso", "Doritos nacho", "Takis fuego", "Chips jalapeños", "Sabritas adobada", "Rancheritos", "Tostitos"],
  complements: ["Cueritos", "Pepino", "Jícama", "Salchicha", "Sandía (Temp)", "Piña", "Mango (Temp)", "Palomitas", "Churros de maíz", "Zanahoria rallada"],
  toppings: ["Manguitos", "Picafresas", "Lombrices", "Cacahuates", "Rellerindos", "Panditas", "Paletas", "Churro loko", "Sandías", "Lombrices ácidas", "Bolitochas de sandía", "Frutitas de gomita", "Tiburones de gomita", "Aros de durazno", "Cacahuate salado"]
};

export const CUSTOMIZABLE_IDS = [6];
export const TRAY_IDS = [8];

const INITIAL_PRODUCTS = [
  { id: 6, name: "Papas Preparadas (Bowl)", category: "Snacks", desc: "Elige Tamaño (1/4 o 1/2) + Base + Complementos + Toppings.", keywords: ["papas", "bowl", "preparadas"], img: "/images/papas-preparadas.jpg", gallery: ["/images/papas-preparadas.jpg"] },
  { id: 1, name: "Tostilocos", category: "Snacks", desc: "Tostitos con cueritos, jícama, pepino...", keywords: ["tostilocos"], img: "/images/tostilocos.jpg", gallery: ["/images/tostilocos.jpg"] },
  { id: 2, name: "Maruchan Preparada", category: "Snacks", desc: "Sopa instantánea con elote y queso.", keywords: ["maruchan"], img: "/images/maruchan.jpg", gallery: [] },
  { id: 3, name: "Elote en Vaso", category: "Snacks", desc: "Clásico esquite con mayonesa, queso y chile.", keywords: ["elote", "vaso"], img: "/images/elote.jpg", gallery: [] },
  { id: 4, name: "Tostielote", category: "Snacks", desc: "Tostitos preparados con esquite (elote), queso y crema.", keywords: ["tostielote"], img: "/images/tostielote.jpg", gallery: [] },
  { id: 5, name: "Duros Preparados", category: "Snacks", desc: "Chicharrón de harina con verdura y crema.", keywords: ["duro"], img: "/images/duros.jpg", gallery: [] },
  { id: 7, name: "Crepaletas", category: "Snacks", desc: "Crepa en forma de paleta con toppings dulces.", keywords: ["crepa"], img: "/images/crepaletas.jpg", gallery: [] },
  { id: 8, name: "Fresas con Crema", category: "Snacks", desc: "Fresas frescas con nuestra crema especial.", keywords: ["fresas"], img: "/images/fresas.jpg", gallery: [] },
  { id: 9, name: "Mini Hotcakes", category: "Snacks", desc: "Porción de hotcakes pequeños.", keywords: ["hotcakes"], img: "/images/hotcakes.jpg", gallery: [] },
  { id: 10, name: "Paletas de Hielo", category: "Snacks", desc: "Paleta de agua con chamoy y gomitas.", keywords: ["paleta"], img: "/images/paletas.jpg", gallery: [] },
  { id: 11, name: "Micheladas", category: "Bebidas", desc: "Preparado especial con escarchado.", keywords: ["michelada"], img: "/images/michelada.jpg", gallery: [] },
  { id: 12, name: "Cantaritos", category: "Bebidas", desc: "Estilo Jalisco con toronja, naranja y tequila.", keywords: ["cantarito"], img: "/images/cantarito.jpg", gallery: [] },
  { id: 13, name: "Mesa Redonda", category: "Rentas", desc: "Mesa redonda sola (1.50m diámetro).", keywords: ["mesa", "redonda"], img: "/images/mesa_redonda.jpg", gallery: [], productType: "RENTAL", rentalPricePerDay: 150 },
  { id: 14, name: "Mesa Redonda (Paquete)", category: "Rentas", desc: "Incluye mesa redonda, mantel blanco y 10 sillas plegables.", keywords: ["mesa", "redonda", "paquete", "sillas"], img: "/images/mesa_redonda.jpg", gallery: [], productType: "RENTAL", rentalPricePerDay: 350 },
  { id: 15, name: "Tablón", category: "Rentas", desc: "Mesa rectangular (2.40m) para 10 personas.", keywords: ["tablon", "mesa", "rectangular"], img: "/images/tablon.jpg", gallery: [], productType: "RENTAL", rentalPricePerDay: 150 },
  { id: 16, name: "Tablón (Paquete)", category: "Rentas", desc: "Incluye tablón, mantel blanco y 10 sillas plegables.", keywords: ["tablon", "paquete", "sillas"], img: "/images/tablon.jpg", gallery: [], productType: "RENTAL", rentalPricePerDay: 350 },
  { id: 17, name: "Brincolín", category: "Rentas", desc: "Brincolín inflable para niños (4x4m).", keywords: ["brincolin", "inflable", "juegos"], img: "/images/brincolin.jpg", gallery: [], productType: "RENTAL", rentalPricePerDay: 600 },
];
const INITIAL_CATEGORIES = ["Snacks", "Bebidas", "Rentas"];

import { useAuth } from './context/AuthContext';
import { useNotification } from './context/NotificationContext';
import { authService } from './services/authService';

export default function App() {
  const { user, login: authLogin, logout: authLogout } = useAuth();
  const { requestPermission } = useNotification();

  const [view, setView] = useState('home');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [options, setOptions] = useState(BACKUP_OPTIONS);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  // Sync admin state with AuthContext
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(!!user);
  }, [user]);
  const [showLogin, setShowLogin] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [productToCustomize, setProductToCustomize] = useState(null);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('snacks'); // 'snacks' | 'rental'
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [productForBulk, setProductForBulk] = useState(null);
  // Re-added Checkout Modal state for mobile flow
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
  };

  const [checkoutFormData, setCheckoutFormData] = useState({
    name: '', phone: '', date: new Date().toISOString().split('T')[0], time: '16:00', eventLocation: ''
  });

  const refreshData = () => {
    if (!DEMO_MODE) {
      setLoading(true);
      fetch(`${API_URL}/products`)
        .then(r => r.json())
        .then(data => {
          if (data && data.length > 0) setProducts(data);
          setLoading(false);
        })
        .catch(err => { console.error("Error refreshing products:", err); setLoading(false); });
    }
  };

  useEffect(() => {
    if (!DEMO_MODE) {
      setLoading(true);
      Promise.all([fetch(`${API_URL}/products`).then(r => r.json()), fetch(`${API_URL}/options`).then(r => r.json())])
        .then(([prodData, optData]) => {
          if (prodData && prodData.length > 0) setProducts(prodData);
          if (optData && optData.bases) setOptions(optData);
          setLoading(false);
        }).catch(err => { console.error("Error DB:", err); setLoading(false); });
    }
  }, []);

  useEffect(() => {
    if (isAdmin && !DEMO_MODE) {
      authService.fetch(`${API_URL}/orders`).then(r => r.json()).then(data => setOrders(data)).catch(console.error);
    }
  }, [isAdmin]);

  const handleLogin = async (u, p) => {
    const success = await authLogin(u, p);
    if (success) {
      setShowLogin(false);
      setView('admin');
      showToast('Bienvenido Admin', 'success');
      // Request push permission after login
      requestPermission();
    } else {
      showToast("Credenciales incorrectas", 'error');
    }
  };

  const handleLogout = () => {
    authLogout();
    setView('home');
    showToast('Sesión cerrada', 'info');
  };

  const handleProductClick = (product, openGallery = false) => {
    if (openGallery && product.gallery && product.gallery.length > 0) { setGalleryImages(product.gallery); setGalleryModalOpen(true); return; }
    const inCart = cart.find(item => item.id === product.id);
    if (inCart && !(CUSTOMIZABLE_IDS.includes(product.id) || TRAY_IDS.includes(product.id))) { removeFromCart(inCart.cartId); return; }
    if (CUSTOMIZABLE_IDS.includes(product.id) || TRAY_IDS.includes(product.id)) { setProductToCustomize(product); setCustomModalOpen(true); }
    else if (product.category === 'Snacks' || product.category === 'Bebidas' || product.category === 'Rentas' || product.productType === 'RENTAL') {
      setProductForBulk({ product, customization: null });
      setBulkModalOpen(true);
    }
    else { addToCart(product); }
  };

  const addToCart = (product, customization = null) => {
    if (!product) {
      console.warn("addToCart called with null product");
      return;
    }
    setCart(prev => {
      const existingIdx = prev.findIndex(item =>
        item.id === product.id &&
        JSON.stringify(item.customization) === JSON.stringify(customization)
      );

      const qty = product.quantity || 1;
      let unitPrice = product.rentalPricePerDay || product.price || 0;

      // If AI provided a price override, compute the unit price for this addition
      if (product.priceOverride !== undefined && product.priceOverride !== null) {
        unitPrice = product.priceOverride / qty;
      }

      if (existingIdx > -1) {
        const newCart = [...prev];
        const item = newCart[existingIdx];
        const newQty = (item.quantity || 1) + qty;

        // Use custom unit price if it exists, otherwise use standard unit price
        const currentUnitPrice = item.customUnitPrice !== undefined && item.customUnitPrice !== null
          ? item.customUnitPrice
          : (item.rentalPricePerDay || item.price || 0);

        newCart[existingIdx] = {
          ...item,
          quantity: newQty,
          totalPrice: currentUnitPrice * newQty
        };
        return newCart;
      }

      // New item
      return [...prev, {
        ...product,
        cartId: Date.now(),
        customization,
        quantity: qty,
        customUnitPrice: (product.priceOverride !== undefined && product.priceOverride !== null) ? unitPrice : null,
        totalPrice: unitPrice * qty
      }];
    });
  };
  const setProductQuantity = (product, quantity, customization = null, priceOverride = null) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item =>
        item.id === product.id &&
        JSON.stringify(item.customization) === JSON.stringify(customization)
      );

      let unitPrice = product.rentalPricePerDay || product.price || 0;

      if (priceOverride !== null && quantity > 0) {
        unitPrice = priceOverride / quantity;
      }

      if (existingIdx > -1) {
        const newCart = [...prev];
        if (quantity <= 0) {
          // Remove if 0
          return newCart.filter((_, idx) => idx !== existingIdx);
        }

        // If a new override is applied, update it. Else keep the old customUnitPrice or fall back.
        const effectiveUnitPrice = priceOverride !== null ? unitPrice :
          (newCart[existingIdx].customUnitPrice !== undefined && newCart[existingIdx].customUnitPrice !== null
            ? newCart[existingIdx].customUnitPrice
            : unitPrice);

        newCart[existingIdx] = {
          ...newCart[existingIdx],
          quantity: quantity,
          customUnitPrice: priceOverride !== null ? unitPrice : newCart[existingIdx].customUnitPrice,
          totalPrice: effectiveUnitPrice * quantity,
          isRental: product.productType === 'RENTAL'
        };
        return newCart;
      }

      // New item if positive qty
      if (quantity > 0) {
        return [...prev, {
          ...product,
          cartId: Date.now(),
          customization,
          quantity: quantity,
          customUnitPrice: priceOverride !== null ? unitPrice : null,
          totalPrice: unitPrice * quantity,
          isRental: product.productType === 'RENTAL'
        }];
      }
      return prev;
    });
  };

  const removeFromCart = (cartId) => setCart(cart.filter(item => item.cartId !== cartId));

  const handleCheckout = async (formData) => {
    setLoading(true);
    const newOrder = { ...formData, customer: formData.name, items: cart, status: 'PENDING', createdAt: new Date().toISOString() };
    if (DEMO_MODE) {
      setTimeout(() => { setOrders([...orders, { ...newOrder, id: 999 }]); setLastOrder({ ...newOrder, id: 999 }); setCart([]); setView('confirmation'); setLoading(false); }, 1000);
    } else {
      try {
        const res = await fetch(`${API_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOrder) });
        const savedOrder = await res.json();
        setLastOrder(savedOrder); setCart([]); setView('confirmation');
      } catch (err) { alert("Error al guardar"); }
      setLoading(false);
    }
  };

  const handleSaveProduct = async (p) => {
    if (!DEMO_MODE) {
      try {
        await authService.fetch(`${API_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
        refreshData();
        showToast(p.id ? 'Producto actualizado correctamente' : 'Producto creado correctamente', 'success');
      } catch (err) {
        console.error("Error saving product:", err);
        showToast('Error al guardar el producto', 'error');
      }
    } else {
      showToast('Producto guardado (Modo Demo)', 'success');
    }
  };

  const handleDeleteProduct = (id) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setProductToDelete(product);
      setDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const id = productToDelete.id;

    if (!DEMO_MODE) {
      try {
        const res = await authService.fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Error en el servidor");
        refreshData();
        setDeleteModalOpen(false);
        setProductToDelete(null);
        showToast('Producto eliminado correctamente', 'success');
      } catch (err) {
        showToast("Error al eliminar el producto. Verifica que no tenga pedidos activos.", 'error');
        console.error(err);
      }
    } else {
      setProducts(products.filter(p => p.id !== id));
      setDeleteModalOpen(false);
      setProductToDelete(null);
      showToast('Producto eliminado (Modo Demo)', 'success');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (DEMO_MODE) {
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    } else {
      try {
        await authService.fetch(`${API_URL}/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
      } catch (err) {
        console.error('Error updating order status:', err);
        alert('Error al actualizar el estado');
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('¿Eliminar este pedido?')) return;
    if (DEMO_MODE) {
      setOrders(orders.filter(o => o.id !== orderId));
    } else {
      try {
        await authService.fetch(`${API_URL}/orders/${orderId}`, { method: 'DELETE' });
        setOrders(orders.filter(o => o.id !== orderId));
      } catch (err) {
        console.error('Error deleting order:', err);
        alert('Error al eliminar el pedido');
      }
    }
  };

  const handleSaveOptions = async (newOptions) => {
    if (DEMO_MODE) {
      setOptions(newOptions);
      alert('Opciones guardadas (modo demo)');
    } else {
      try {
        await authService.fetch(`${API_URL}/options`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOptions)
        });
        setOptions(newOptions);
        alert('Opciones guardadas correctamente');
      } catch (err) {
        console.error('Error saving options:', err);
        alert('Error al guardar opciones');
      }
    }
  };

  const handleSaveInventory = (inventory) => {
    console.log('Saving inventory:', inventory);
    alert('Inventario guardado (funcionalidad en desarrollo)');
    // TODO: Implement backend endpoint for inventory
  };

  const handleAutoFillCheckout = (data) => {
    setCheckoutFormData(data);
    setIsBotOpen(false);
    // Open checkout modal if mobile, or scroll to form if desktop
    if (window.innerWidth < 1024) {
      setIsCartModalOpen(false);
      setIsCheckoutModalOpen(true);
    } else {
      document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCheckoutSuccess = async () => {
    // Create order object
    const newOrder = {
      ...checkoutFormData,
      customer: checkoutFormData.name,
      items: cart,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // Save order to backend first
    if (!DEMO_MODE) {
      try {
        const res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        const savedOrder = await res.json();
        setOrders(prev => [...prev, savedOrder]);
        // Update newOrder with the ID from the backend so the confirmation view has it
        newOrder.id = savedOrder.id;
      } catch (err) {
        console.error("Error saving order:", err);
      }
    }

    setLastOrder(newOrder);
    setView('confirmation');

    setIsCheckoutModalOpen(false);
    setCart([]);
    setCheckoutFormData({
      name: '', phone: '', date: new Date().toISOString().split('T')[0], time: '16:00', eventLocation: ''
    });
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col relative overflow-x-hidden pb-16 md:pb-0 transition-colors duration-500">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 blur-3xl opacity-60 dark:opacity-40 transition-opacity duration-500">
        <div className="w-80 h-80 bg-rose-200 dark:bg-purple-900 absolute -top-10 -left-10 rounded-full transition-colors duration-500"></div>
        <div className="w-64 h-64 bg-amber-200 dark:bg-indigo-900 absolute top-20 right-10 rounded-full transition-colors duration-500"></div>
        <div className="w-72 h-72 bg-cyan-200 dark:bg-rose-900 absolute bottom-0 left-1/3 rounded-full transition-colors duration-500"></div>
      </div>

      <Navbar setView={setView} cart={cart} isAdmin={isAdmin} setIsAdmin={setIsAdmin} setShowLogin={setShowLogin} view={view} setIsCartModalOpen={setIsCartModalOpen} onLogout={handleLogout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 relative z-10 w-full">
        {loading && <div className="fixed inset-0 bg-white/80 z-[60] flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-rose-500 mb-2" size={48} /></div>}

        {view === 'home' && (
          <>
            <HeroSection openBot={() => setIsBotOpen(true)} setActiveCategory={setActiveCategory} />
            <DiscountTimer />

            {/* Filtered Products for Customer View */}
            {(() => {
              const visibleProducts = products.filter(p => p.visible !== false);
              return (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Content Area (Products) */}
                  <div className="lg:col-span-2 space-y-8">
                    <CategoryToggle activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

                    {activeCategory === 'snacks' || activeCategory === 'drinks' ? (
                      <ProductGrid
                        products={visibleProducts.filter(p => p.productType === 'SNACK' || !p.productType)}
                        categories={activeCategory === 'snacks' ? ['Snacks'] : ['Bebidas']}
                        cart={cart}
                        onProductClick={handleProductClick} removeFromCart={removeFromCart}
                        CUSTOMIZABLE_IDS={CUSTOMIZABLE_IDS}
                        TRAY_IDS={TRAY_IDS}
                      />
                    ) : (
                      <ProductGrid
                        products={visibleProducts.filter(p => p.productType === 'RENTAL' || p.category?.includes('Renta')).map(p => ({ ...p, category: 'Rentas' }))}
                        categories={['Rentas']}
                        cart={cart}
                        onProductClick={handleProductClick} removeFromCart={removeFromCart}
                        CUSTOMIZABLE_IDS={CUSTOMIZABLE_IDS}
                        TRAY_IDS={TRAY_IDS}
                      />
                    )}
                  </div>

                  {/* Sidebar: Cart & Request Form (Static) */}
                  <div className="lg:col-span-1">
                    <CartSidebar
                      cart={cart}
                      removeFromCart={(id) => removeFromCart(id)}
                      openBot={() => setIsBotOpen(true)}
                      onCheckout={() => {
                        if (window.innerWidth < 1024) {
                          setIsCartModalOpen(false);
                          setIsCheckoutModalOpen(true);
                        } else {
                          setIsCheckoutModalOpen(true);
                        }
                      }}
                    />
                    <CommunitySection />
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {view === 'confirmation' && lastOrder && <ConfirmationView order={lastOrder} onBack={() => setView('home')} />}

        {view === 'admin' && isAdmin && (
          <AdminDashboard
            products={products}
            categories={categories}
            orders={orders}
            options={options}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onSaveOptions={handleSaveOptions}
            onSaveInventory={handleSaveInventory}
            onLogout={handleLogout}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        )}
      </main>

      <Footer />

      {/* Floating Buttons */}
      {cart.length > 0 && (
        <button onClick={() => setIsCartModalOpen(true)} className="fixed max-md:bottom-[96px] md:bottom-6 right-6 z-40 bg-gradient-to-r from-rose-500 to-rose-600 text-white p-4 rounded-full shadow-2xl hover:shadow-rose-300 transition-all hover:scale-110 active:scale-95">
          <ShoppingBag size={24} />
          <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">{cart.length}</span>
        </button>
      )}

      {view !== 'admin' && !isBotOpen && (
        <div className={`fixed z-40 transition-all duration-500 ease-in-out right-6 ${cart.length > 0 ? 'max-md:bottom-[170px] md:bottom-28' : 'max-md:bottom-[96px] md:bottom-6'}`}>
          <button onClick={() => setIsBotOpen(true)} className="bg-slate-900 dark:bg-black text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-rose-500/50 transition-all hover:scale-110 active:scale-95 flex items-center justify-center relative animate-shake">
            {/* Tooltip flotante con fondo transparente */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-slate-800 dark:text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 cursor-pointer whitespace-nowrap">
              ¿Necesitas ayuda?
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rotate-45 border-b border-r border-slate-200/50 dark:border-slate-700/50"></div>
            </div>
            <Bot size={28} className="text-rose-300 dark:text-rose-400" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 dark:border-black"></span>
          </button>
        </div>
      )}

      {view !== 'admin' && (
        <EnhancedChatBot isOpen={isBotOpen} setIsOpen={setIsBotOpen} products={products.filter(p => p.visible !== false)} options={options} cart={cart} onAddProducts={addToCart} onSetQuantity={setProductQuantity} onAutoFillCheckout={handleAutoFillCheckout} />
      )}

      {/* Modals */}
      <BulkOrderModal
        product={productForBulk?.product}
        products={products}
        isOpen={bulkModalOpen}
        onClose={() => { setBulkModalOpen(false); setProductForBulk(null); }}
        onConfirm={(peopleCount, splitMode = false, splitValue = 0, otherElote = null) => {
          const mainProd = productForBulk.product;

          const addProduct = (prod, count) => {
            const tiers = prod.priceTiers || [];
            // Usamos peopleCount total para buscar el tier de mayoreo de ambos
            const matchingTier = tiers.find(t => peopleCount >= t.minGuests && peopleCount <= t.maxGuests);
            const closestTier = tiers.filter(t => t.minGuests <= peopleCount).sort((a, b) => b.minGuests - a.minGuests)[0];

            // Calculamos el precio por persona basado en el volumen total, y luego lo multiplicamos por la cantidad dividida
            const unitPrice = (matchingTier?.price || closestTier?.price || (prod.price * peopleCount)) / peopleCount;
            const totalPrice = unitPrice * count;

            const prodWithPrice = {
              ...prod,
              quantity: count,
              priceOverride: totalPrice
            };
            addToCart(prodWithPrice, productForBulk.customization);
          };

          if (splitMode && otherElote) {
            addProduct(mainProd, peopleCount - splitValue);
            addProduct(otherElote, splitValue);
          } else {
            addProduct(mainProd, peopleCount);
          }

          setBulkModalOpen(false);
          setProductForBulk(null);
        }}
      />

      {customModalOpen && productToCustomize && <CustomizationModal product={productToCustomize} options={options} onClose={() => setCustomModalOpen(false)} onConfirm={(c) => {
        setCustomModalOpen(false);
        if (productToCustomize.category === 'Snacks' || productToCustomize.category === 'Bebidas') {
          setProductForBulk({ product: productToCustomize, customization: c });
          setBulkModalOpen(true);
        } else {
          addToCart(productToCustomize, c);
        }
      }} />}

      {galleryModalOpen && <GalleryModal images={galleryImages} onClose={() => setGalleryModalOpen(false)} />}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}

      {deleteModalOpen && (
        <DeleteConfirmationModal
          product={productToDelete}
          onClose={() => { setDeleteModalOpen(false); setProductToDelete(null); }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {toast.visible && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}

      {isCartModalOpen && (
        <CartModal
          cart={cart} onClose={() => setIsCartModalOpen(false)} removeFromCart={(id) => removeFromCart(id)}
          onContinueCheckout={() => { setIsCartModalOpen(false); setIsCheckoutModalOpen(true); }}
        />
      )}

      {/* Re-added Checkout Modal for Mobile Flow */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 dark:text-white rounded-3xl max-w-lg w-full my-8 shadow-2xl relative transition-colors duration-300">
            <button onClick={() => setIsCheckoutModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 z-10 font-bold transition-colors">✕</button>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-4 text-center">Finalizar compra</h3>
              {(() => {
                const isFurnitureOnly = cart.length > 0 && cart.every(item => {
                  const cat = (item.category || '').toLowerCase();
                  const type = (item.productType || '').toLowerCase();
                  const isRental = cat.includes('renta') || type === 'rental' || item.isRental;
                  console.log(`Item ${item.name}: category=${item.category}, type=${item.productType}, isRental=${isRental}`);
                  return isRental;
                });
                console.log("Is Furniture Only?", isFurnitureOnly);
                return (
                  <CheckoutForm
                    onCheckout={handleCheckoutSuccess}
                    hasItems={cart.length > 0}
                    formData={checkoutFormData}
                    setFormData={setCheckoutFormData}
                    isFurnitureOnly={isFurnitureOnly}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {view !== 'admin' && (
        <MobileBottomNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} isBotOpen={isBotOpen} />
      )}
    </div>
  );
}
