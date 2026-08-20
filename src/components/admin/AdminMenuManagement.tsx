import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Flame,
  Dumbbell,
  Tag,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';
import { DietType, FoodItem, MealCategory } from '../../types';

export const MENU_CATEGORIES: { id: MealCategory; label: string }[] = [
  { id: 'all', label: 'All Dishes' },
  { id: 'fruit-bowls', label: 'Fruit Bowls' },
  { id: 'protein-meals', label: 'High Protein Meals' },
  { id: 'healthy-breakfast', label: 'Healthy Breakfast' },
  { id: 'healthy-lunch', label: 'Healthy Lunch Bowls' },
  { id: 'salads', label: 'Salads & Sprouts' },
  { id: 'sandwiches-rolls', label: 'Sandwiches & Rolls' },
  { id: 'meal-packages', label: 'Meal Packages' },
];

interface AdminMenuManagementProps {
  items: FoodItem[];
  onAddItem: (item: Omit<FoodItem, 'id'>) => void;
  onUpdateItem: (item: FoodItem) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleAvailability: (itemId: string) => void;
  onResetMenu: () => void;
}

// Preset food images for easy quick selection
const PRESET_FOOD_IMAGES = [
  {
    label: 'Fresh Fruit Bowl',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Papaya & Dragonfruit',
    url: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'High Protein Paneer & Eggs',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Sprouts & Pomegranate',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Avocado Chickpea Salad',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Grilled Whole Wheat Sandwich',
    url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Hydrating Watermelon Cuts',
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Rolled Oats & Nuts Porridge',
    url: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80',
  },
];

export const AdminMenuManagement: React.FC<AdminMenuManagementProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onToggleAvailability,
  onResetMenu,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MealCategory>('fruit-bowls');
  const [formDiet, setFormDiet] = useState<DietType>('veg');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState<number>(120);
  const [formCalories, setFormCalories] = useState<number | undefined>(180);
  const [formProtein, setFormProtein] = useState<string>('8g');
  const [formBadge, setFormBadge] = useState<string>('Chef Special');
  const [formImage, setFormImage] = useState<string>(PRESET_FOOD_IMAGES[0].url);
  const [formScheduleNote, setFormScheduleNote] = useState<string>('All Day Available');
  const [formIngredients, setFormIngredients] = useState<string>('Apple, Pomegranate, Kiwi, Honey');
  const [formIsAvailable, setFormIsAvailable] = useState<boolean>(true);

  // Inline price editing state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesBadge = (item.badge || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesBadge) return false;
      }

      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      const isItemAvailable = item.isAvailable !== false;
      if (availabilityFilter === 'available' && !isItemAvailable) return false;
      if (availabilityFilter === 'unavailable' && isItemAvailable) return false;

      return true;
    });
  }, [items, searchQuery, selectedCategory, availabilityFilter]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('fruit-bowls');
    setFormDiet('veg');
    setFormDescription('');
    setFormPrice(120);
    setFormCalories(200);
    setFormProtein('6g');
    setFormBadge('');
    setFormImage(PRESET_FOOD_IMAGES[0].url);
    setFormScheduleNote('Fresh Daily');
    setFormIngredients('');
    setFormIsAvailable(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: FoodItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormDiet(item.diet);
    setFormDescription(item.description);
    setFormPrice(item.price);
    setFormCalories(item.calories);
    setFormProtein(item.protein || '');
    setFormBadge(item.badge || '');
    setFormImage(item.image);
    setFormScheduleNote(item.scheduleNote || '');
    setFormIngredients((item.ingredients || []).join(', '));
    setFormIsAvailable(item.isAvailable !== false);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0) return;

    const ingredientsList = formIngredients
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingItem) {
      // Update
      const updated: FoodItem = {
        ...editingItem,
        name: formName.trim(),
        category: formCategory,
        diet: formDiet,
        description: formDescription.trim(),
        price: Number(formPrice),
        calories: formCalories ? Number(formCalories) : undefined,
        protein: formProtein.trim() || undefined,
        badge: formBadge.trim() || undefined,
        image: formImage.trim() || PRESET_FOOD_IMAGES[0].url,
        scheduleNote: formScheduleNote.trim() || undefined,
        ingredients: ingredientsList.length > 0 ? ingredientsList : undefined,
        isAvailable: formIsAvailable,
      };
      onUpdateItem(updated);
    } else {
      // Add
      onAddItem({
        name: formName.trim(),
        category: formCategory,
        diet: formDiet,
        description: formDescription.trim(),
        price: Number(formPrice),
        calories: formCalories ? Number(formCalories) : undefined,
        protein: formProtein.trim() || undefined,
        badge: formBadge.trim() || undefined,
        image: formImage.trim() || PRESET_FOOD_IMAGES[0].url,
        scheduleNote: formScheduleNote.trim() || undefined,
        ingredients: ingredientsList.length > 0 ? ingredientsList : undefined,
        isAvailable: formIsAvailable,
      });
    }

    setIsModalOpen(false);
  };

  const handleSaveInlinePrice = (itemId: string) => {
    if (tempPrice > 0) {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        onUpdateItem({ ...item, price: tempPrice });
      }
    }
    setEditingPriceId(null);
  };

  return (
    <div className="space-y-4" id="admin-menu-management-section">
      
      {/* Header and Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-menu-search"
              placeholder="Search dish name, description, high protein..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-add-food-item"
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4 text-[#7BF587]" />
              <span>Add New Food Item</span>
            </button>

            <button
              type="button"
              id="btn-reset-menu-defaults"
              onClick={() => {
                if (window.confirm('Reset all menu items to default My Fruit Bowl TN 49 menu?')) {
                  onResetMenu();
                }
              }}
              className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer border border-stone-200"
              title="Reset Menu to Original Defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills & Availability Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                id={`btn-menu-cat-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id as MealCategory)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer whitespace-nowrap border ${
                  selectedCategory === cat.id
                    ? 'bg-[#0F2A1D] text-white border-[#0F2A1D]'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-[#FAF9F5] rounded-lg border border-stone-200 text-stone-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Availability: All Items</option>
              <option value="available">In Stock Only</option>
              <option value="unavailable">Out of Stock Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Summary Counter */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          Showing <strong className="text-stone-800">{filteredItems.length}</strong> food items
        </span>
        <span className="text-[11px] text-stone-400">
          Tip: Toggle availability switch to instantly show/hide items from customers
        </span>
      </div>

      {/* Menu Items Table / Grid */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#FAF9F5] border-b border-stone-200/80 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4">Category & Diet</th>
                <th className="py-3 px-4">Price (₹)</th>
                <th className="py-3 px-4">Nutrition</th>
                <th className="py-3 px-4 text-center">Availability (Live Store)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map((item) => {
                const isAvailable = item.isAvailable !== false;
                const isPriceEditing = editingPriceId === item.id;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-stone-50/70 transition-colors ${
                      !isAvailable ? 'bg-stone-50/40 opacity-75' : ''
                    }`}
                  >
                    {/* 1. Dish details with image */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0 max-w-[220px]">
                          <div className="font-bold text-stone-900 text-sm truncate flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {item.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 truncate mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Category & Diet */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                          {item.category.replace('-', ' ')}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-stone-600 font-medium">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.diet === 'veg'
                                ? 'bg-emerald-600'
                                : item.diet === 'egg'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span className="capitalize">{item.diet}</span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Price with inline edit */}
                    <td className="py-3.5 px-4">
                      {isPriceEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-stone-900">₹</span>
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(Number(e.target.value))}
                            className="w-16 px-1.5 py-1 bg-white border border-emerald-600 rounded text-xs font-bold text-stone-900"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveInlinePrice(item.id)}
                            className="p-1 bg-emerald-700 text-white rounded hover:bg-emerald-800"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingPriceId(item.id);
                            setTempPrice(item.price);
                          }}
                          className="font-serif text-sm font-bold text-stone-900 cursor-pointer hover:text-emerald-700 flex items-center gap-1 group"
                          title="Click to edit price"
                        >
                          <span>₹{item.price}</span>
                          <Edit2 className="w-3 h-3 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* 4. Nutrition */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-stone-600 space-y-0.5">
                        {item.calories && (
                          <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-600" />
                            <span>{item.calories} kcal</span>
                          </div>
                        )}
                        {item.protein && (
                          <div className="flex items-center gap-1">
                            <Dumbbell className="w-3 h-3 text-emerald-700" />
                            <span>{item.protein} protein</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 5. Live Store Availability Toggle Switch */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        id={`toggle-item-avail-${item.id}`}
                        onClick={() => onToggleAvailability(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                            : 'bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300'
                        }`}
                      >
                        {isAvailable ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-stone-500" />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* 6. Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          id={`btn-edit-item-${item.id}`}
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                          title="Edit Food Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          id={`btn-delete-item-${item.id}`}
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Food Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-xl">
                        🥗
                      </div>
                      <h4 className="font-serif text-base font-bold text-stone-800">
                        {items.length === 0 ? 'No Dishes Found in Firestore' : 'No Dishes Match Your Filter'}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {items.length === 0
                          ? 'The Cloud Firestore products collection is currently empty. Click below to initialize and seed the complete Thanjavur healthy menu.'
                          : 'Try changing your category tab or clearing your search keywords.'}
                      </p>
                      {items.length === 0 && (
                        <button
                          type="button"
                          id="btn-seed-cloud-menu-empty"
                          onClick={onResetMenu}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Initialize / Seed Menu to Firestore</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-stone-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-stone-900">Delete Menu Item?</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Are you sure you want to remove this item from the kitchen menu? This will also remove it from the customer ordering page.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteItem(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Food Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-stone-200 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-xl font-bold text-[#0F2A1D]">
                {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs sm:text-sm">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Food Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tropical Dragonfruit & Papaya Bowl"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-stone-900 focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Category & Diet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MealCategory)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-stone-900"
                  >
                    <option value="fruit-bowls">Fruit Bowls</option>
                    <option value="protein-meals">Protein Meals</option>
                    <option value="healthy-breakfast">Healthy Breakfast</option>
                    <option value="healthy-lunch">Healthy Lunch</option>
                    <option value="salads">Salads</option>
                    <option value="sandwiches-rolls">Sandwiches & Rolls</option>
                    <option value="meal-packages">Meal Packages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Diet Preference
                  </label>
                  <select
                    value={formDiet}
                    onChange={(e) => setFormDiet(e.target.value as DietType)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-stone-900"
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="egg">Egg-based</option>
                    <option value="vegan">Pure Vegan</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              {/* Price, Calories, Protein */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-200 rounded-xl text-stone-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    value={formCalories || ''}
                    onChange={(e) => setFormCalories(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-200 rounded-xl text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Protein
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14g"
                    value={formProtein}
                    onChange={(e) => setFormProtein(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-200 rounded-xl text-stone-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe fresh ingredients and health benefits..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF9F5] border border-stone-200 rounded-xl text-stone-900"
                />
              </div>

              {/* Badge & Ingredients */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Highlight Badge (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bestseller, Immunity Booster"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-200 rounded-xl text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Ingredients (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Papaya, Kiwi, Chia Seeds..."
                    value={formIngredients}
                    onChange={(e) => setFormIngredients(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-200 rounded-xl text-stone-900"
                  />
                </div>
              </div>

              {/* Image URL & Preset Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Food Photo URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-200 rounded-xl text-stone-900 text-xs font-mono mb-2"
                />
                
                {/* Preset quick picker chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-stone-500 font-medium">Or pick a preset photo:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_FOOD_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormImage(preset.url)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                          formImage === preset.url
                            ? 'bg-emerald-700 text-white border-emerald-800'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Availability Toggle in Form */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <span className="font-bold text-stone-900 block text-xs">Available for Customer Orders</span>
                  <span className="text-[11px] text-stone-500">Uncheck to mark as Out of Stock</span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsAvailable}
                  onChange={(e) => setFormIsAvailable(e.target.checked)}
                  className="w-5 h-5 accent-emerald-700 rounded cursor-pointer"
                />
              </div>

              {/* Modal Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
                >
                  {editingItem ? 'Save Changes' : 'Add Item to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
