import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Loader2,
  Leaf,
  Flame,
  Coffee,
  ShoppingCart,
  Plus,
  Minus,
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  UtensilsCrossed,
  Tag,
  ClipboardList
} from 'lucide-react';
import { menuApi, orderApi, offerApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isSpicy: boolean;
  preparationTime: number;
}

interface GroupedMenu {
  [category: string]: MenuItem[];
}

interface ErrorResponse {
  message: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'flat' | 'bogo';
  discountValue: number;
  minimumOrder: number;
  code: string | null;
  validFrom: string;
  validTo: string;
}

const CATEGORIES = [
  { value: 'appetizers', label: 'Appetizers', icon: '🥗' },
  { value: 'main-course', label: 'Main Course', icon: '🍽️' },
  { value: 'desserts', label: 'Desserts', icon: '🍰' },
  { value: 'beverages', label: 'Beverages', icon: '☕' },
  { value: 'snacks', label: 'Snacks', icon: '🍿' },
  { value: 'specials', label: 'Specials', icon: '⭐' },
];

const getCategoryLabel = (value: string) => {
  return CATEGORIES.find(c => c.value === value)?.label || value;
};

const getCategoryIcon = (value: string) => {
  return CATEGORIES.find(c => c.value === value)?.icon || '🍴';
};

type MainTab = 'menu' | 'offers' | 'orders';

const TableMenu: React.FC = () => {
  const { tableNumber: tableParam } = useParams<{ tableNumber: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tableNumber = parseInt(tableParam || searchParams.get('table') || '0');

  const {
    items: cartItems,
    customerInfo,
    isRegistered,
    addItem,
    removeItem,
    updateQuantity,
    setTableNumber,
    setCustomerInfo,
    clearCart,
    getTotalAmount,
    getTotalItems,
    checkAndCleanExpiredSession
  } = useCart();

  const [menuItems, setMenuItems] = useState<GroupedMenu>({});
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [mainTab, setMainTab] = useState<MainTab>('menu');
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [tableValid, setTableValid] = useState(false);

  const [regName, setRegName] = useState(customerInfo?.name || '');
  const [regPhone, setRegPhone] = useState(customerInfo?.phone || '');

  useEffect(() => {
    if (tableNumber) {
      verifyTableAndFetchMenu();
    } else {
      setError('Invalid table number');
      setLoading(false);
    }
  }, [tableNumber]);

  useEffect(() => {
    // Check for expired customer session when going to orders tab
    if (tableValid && mainTab === 'orders') {
      const wasExpired = checkAndCleanExpiredSession();
      if (wasExpired) {
        // Reset registration form fields
        setRegName('');
        setRegPhone('');
      }
    }
    // Show registration modal if not registered and on orders tab
    if (tableValid && !isRegistered && mainTab === 'orders') {
      setShowRegisterModal(true);
    }
  }, [tableValid, isRegistered, mainTab]);

  const verifyTableAndFetchMenu = async () => {
    try {
      await orderApi.verifyTable(tableNumber);
      setTableValid(true);
      setTableNumber(tableNumber);

      const [menuResponse, offersResponse] = await Promise.all([
        menuApi.getMenuGrouped(),
        offerApi.getActiveOffers()
      ]);
      setMenuItems(menuResponse.data.data);
      setOffers(offersResponse.data.data || []);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.message || 'Invalid table or failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const cleanPhone = regPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setCustomerInfo({ name: regName.trim(), phone: cleanPhone });
    setShowRegisterModal(false);
    toast.success(`Welcome, ${regName.trim()}!`);
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!isRegistered) {
      setShowRegisterModal(true);
      return;
    }
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image || undefined
    });
    toast.success(`${item.name} added to cart`);
  };

  const handlePlaceOrder = async () => {
    if (!customerInfo) {
      toast.error('Please register first');
      setShowRegisterModal(true);
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        tableNumber,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        items: cartItems.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions
        }))
      };

      await orderApi.createOrder(orderData);
      clearCart();
      setShowCart(false);
      setShowOrderConfirm(true);
      toast.success('Order placed successfully!');
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const allItems = Object.values(menuItems).flat();
  const availableCategories = Object.keys(menuItems);

  const getFilteredItems = () => {
    let items = allItems;

    if (activeCategory !== 'all') {
      items = menuItems[activeCategory] || [];
    }

    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return items;
  };

  const filteredItems = getFilteredItems();

  const groupedFilteredItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as GroupedMenu);

  const getItemQuantityInCart = (menuItemId: string) => {
    const cartItem = cartItems.find(item => item.menuItemId === menuItemId);
    return cartItem?.quantity || 0;
  };

  // Render menu item card (view-only for Menu tab)
  const renderMenuItemCard = (item: MenuItem) => (
    <div
      key={item.id}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
    >
      {/* Image */}
      <div className="h-32 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">{getCategoryIcon(item.category)}</span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight">
            {item.name}
          </h3>
          <div className="flex gap-1 flex-shrink-0">
            {item.isVegetarian && <Leaf size={14} className="text-green-600" />}
            {item.isSpicy && <Flame size={14} className="text-red-600" />}
          </div>
        </div>
        <p className="text-gray-500 text-xs line-clamp-2 mb-2">
          {item.description || 'Delicious!'}
        </p>
        <span className="text-lg font-bold text-amber-600">₹{item.price}</span>
      </div>
    </div>
  );

  // Render order item card (with add to cart for Orders tab)
  const renderOrderItemCard = (item: MenuItem) => {
    const quantityInCart = getItemQuantityInCart(item.id);

    return (
      <div
        key={item.id}
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex"
      >
        {/* Image */}
        <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl">{getCategoryIcon(item.category)}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start gap-1 mb-1">
              <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
                {item.name}
              </h3>
              <div className="flex gap-0.5 flex-shrink-0">
                {item.isVegetarian && <Leaf size={12} className="text-green-600" />}
                {item.isSpicy && <Flame size={12} className="text-red-600" />}
              </div>
            </div>
            <p className="text-gray-500 text-xs line-clamp-1 mb-1">
              {item.description || 'Delicious!'}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-amber-600">₹{item.price}</span>

            {quantityInCart > 0 ? (
              <div className="flex items-center gap-2 bg-amber-100 rounded-lg">
                <button
                  onClick={() => updateQuantity(item.id, quantityInCart - 1)}
                  className="p-1.5 text-amber-700 hover:bg-amber-200 rounded-l-lg transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="font-semibold text-amber-800 min-w-[20px] text-center">
                  {quantityInCart}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, quantityInCart + 1)}
                  className="p-1.5 text-amber-700 hover:bg-amber-200 rounded-r-lg transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleAddToCart(item)}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium flex items-center gap-1"
              >
                <Plus size={14} />
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">BookAVibe Menu</h1>
              <p className="text-amber-100 text-sm">Table {tableNumber}</p>
            </div>
            {customerInfo && (
              <div className="text-right text-sm">
                <p className="font-medium">{customerInfo.name}</p>
                <p className="text-amber-100">{customerInfo.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Tabs */}
        <div className="bg-white/10 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex">
              <button
                onClick={() => setMainTab('menu')}
                className={`flex-1 py-3 px-4 font-medium text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${mainTab === 'menu'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/70 hover:text-white'
                  }`}
              >
                <UtensilsCrossed size={18} />
                Menu
              </button>
              <button
                onClick={() => setMainTab('offers')}
                className={`flex-1 py-3 px-4 font-medium text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${mainTab === 'offers'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/70 hover:text-white'
                  }`}
              >
                <Tag size={18} />
                Offers
              </button>
              <button
                onClick={() => setMainTab('orders')}
                className={`flex-1 py-3 px-4 font-medium text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${mainTab === 'orders'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/70 hover:text-white'
                  }`}
              >
                <ClipboardList size={18} />
                Orders
                {cartItems.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search Bar */}
        {(mainTab === 'menu' || mainTab === 'orders') && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Category Tabs for Menu and Orders */}
        {(mainTab === 'menu' || mainTab === 'orders') && (
          <div className="overflow-x-auto -mx-4 px-4 mb-6">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${activeCategory === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
                  }`}
              >
                🍴 All
              </button>
              {availableCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${activeCategory === category
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
                    }`}
                >
                  {getCategoryIcon(category)} {getCategoryLabel(category)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MENU TAB - View Only */}
        {mainTab === 'menu' && (
          <>
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchTerm ? 'No items found' : 'No menu items available'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try a different search term' : 'Check back soon for our delicious menu!'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedFilteredItems).map(([category, items]) => (
                  <div key={category}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      <h2 className="text-xl font-bold text-gray-800">
                        {getCategoryLabel(category)}
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {items.map(item => renderMenuItemCard(item))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* OFFERS TAB */}
        {mainTab === 'offers' && (
          <>
            {offers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <Tag className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Offers Available</h3>
                <p className="text-gray-600">
                  Check back soon for exciting deals and discounts!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.map(offer => (
                  <div
                    key={offer.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-amber-200"
                  >
                    {/* Offer Header */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xl font-bold">
                          {offer.discountType === 'percentage'
                            ? `${offer.discountValue}% OFF`
                            : offer.discountType === 'flat'
                              ? `₹${offer.discountValue} OFF`
                              : 'Buy 1 Get 1'}
                        </span>
                        {offer.code && (
                          <span className="bg-white/20 px-2 py-1 rounded text-sm font-mono">
                            {offer.code}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold">{offer.title}</h3>
                    </div>

                    {/* Offer Content */}
                    <div className="p-4">
                      {offer.description && (
                        <p className="text-gray-600 text-sm mb-3">{offer.description}</p>
                      )}
                      <div className="space-y-1 text-xs text-gray-500">
                        <p>Valid: {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validTo).toLocaleDateString()}</p>
                        {offer.minimumOrder > 0 && (
                          <p>Min. order: ₹{offer.minimumOrder}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ORDERS TAB - With Add to Cart */}
        {mainTab === 'orders' && (
          <>
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchTerm ? 'No items found' : 'No menu items available'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try a different search term' : 'Check back soon for our delicious menu!'}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedFilteredItems).map(([category, items]) => (
                  <div key={category}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      <h2 className="text-xl font-bold text-gray-800">
                        {getCategoryLabel(category)}
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map(item => renderOrderItemCard(item))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart FAB - Only in Orders tab */}
      {mainTab === 'orders' && cartItems.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-amber-600 text-white p-4 rounded-full shadow-lg hover:bg-amber-700 transition-all z-50 flex items-center gap-2"
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {getTotalItems()}
          </span>
        </button>
      )}

      {/* Cart Bottom Bar - Only in Orders tab */}
      {mainTab === 'orders' && cartItems.length > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{getTotalItems()} items</p>
              <p className="text-amber-600 font-bold text-lg">₹{getTotalAmount()}</p>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center gap-2"
            >
              View Cart
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Cart Slide-over */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCart(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <div>
                <h2 className="text-xl font-bold">Your Cart</h2>
                <p className="text-amber-100 text-sm">Table {tableNumber}</p>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.map(item => (
                <div key={item.menuItemId} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-amber-600 font-medium">₹{item.price}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.menuItemId)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold min-w-[30px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="font-bold text-gray-800">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium text-gray-700">Total</span>
                <span className="font-bold text-amber-600 text-xl">₹{getTotalAmount()}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
              <p className="text-center text-sm text-gray-500">
                Pay at counter after your meal
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Welcome!</h2>
              <p className="text-gray-600 mt-1">Table {tableNumber}</p>
              <p className="text-gray-500 text-sm mt-2">
                Please enter your details to place orders
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="10-digit phone number"
                    maxLength={10}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
              >
                Continue
              </button>

              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="w-full py-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {showOrderConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h2>
            <p className="text-gray-600 mb-6">
              Your order has been sent to the kitchen. We'll prepare it shortly!
            </p>
            <p className="text-amber-600 font-medium mb-6">
              Please pay at the counter after your meal.
            </p>
            <button
              onClick={() => setShowOrderConfirm(false)}
              className="w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
            >
              Order More
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableMenu;
