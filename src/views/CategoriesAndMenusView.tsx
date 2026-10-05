import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { exportToCSV } from '../services/api';
import { MenuItem, MenuCategory, Restaurant } from '../types';

export const CategoriesAndMenusView: React.FC = () => {
  const { navigateTo, addToast, openConfirm } = useUIStore();
  const [categories, setCategories] = useState<MenuCategory[]>(mockStore.getCategories());
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockStore.getMenuItems());
  const [restaurants] = useState<Restaurant[]>(mockStore.getRestaurants());

  const [activeTab, setActiveTab] = useState<'ITEMS' | 'CATEGORIES'>('ITEMS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [vegFilter, setVegFilter] = useState('ALL');
  const [selectedRestaurant, setSelectedRestaurant] = useState('ALL');

  // Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('249');
  const [formDiscPrice, setFormDiscPrice] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.id || 'CAT-1');
  const [formRestaurant, setFormRestaurant] = useState(restaurants[0]?.id || 'RES-104');
  const [formIsVeg, setFormIsVeg] = useState(true);
  const [formPrepTime, setFormPrepTime] = useState('20');
  const [formSpice, setFormSpice] = useState<'MILD' | 'MEDIUM' | 'SPICY' | 'EXTRA_SPICY'>('MEDIUM');
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setCategories([...mockStore.getCategories()]);
      setMenuItems([...mockStore.getMenuItems()]);
    });
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormDesc('');
    setFormPrice('249');
    setFormDiscPrice('');
    setFormCategory(categories[0]?.id || 'CAT-1');
    setFormRestaurant(restaurants[0]?.id || 'RES-104');
    setFormIsVeg(true);
    setFormPrepTime('20');
    setFormSpice('MEDIUM');
    setFormImage('https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80');
    setIsItemModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDesc(item.description);
    setFormPrice(item.price.toString());
    setFormDiscPrice(item.discountedPrice ? item.discountedPrice.toString() : '');
    setFormCategory(item.categoryId);
    setFormRestaurant(item.restaurantId);
    setFormIsVeg(item.isVeg);
    setFormPrepTime(item.prepTimeMinutes.toString());
    setFormSpice(item.spiceLevel);
    setFormImage(item.image);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!formName.trim()) {
      addToast({ type: 'ERROR', title: 'Name Required', message: 'Item title cannot be blank.' });
      return;
    }
    const price = parseFloat(formPrice);
    if (isNaN(price) || price <= 0) {
      addToast({ type: 'ERROR', title: 'Invalid Price', message: 'Enter a valid price in rupees.' });
      return;
    }

    if (editingItem) {
      mockStore.updateMenuItem(editingItem.id, {
        name: formName,
        description: formDesc,
        price,
        discountedPrice: formDiscPrice ? parseFloat(formDiscPrice) : undefined,
        categoryId: formCategory,
        restaurantId: formRestaurant,
        isVeg: formIsVeg,
        prepTimeMinutes: parseInt(formPrepTime, 10) || 20,
        spiceLevel: formSpice,
        image: formImage,
      });
      addToast({ type: 'SUCCESS', title: 'Item Updated', message: `${formName} catalog details updated.` });
    } else {
      mockStore.createMenuItem({
        restaurantId: formRestaurant,
        categoryId: formCategory,
        name: formName,
        description: formDesc,
        price,
        discountedPrice: formDiscPrice ? parseFloat(formDiscPrice) : undefined,
        image: formImage,
        isVeg: formIsVeg,
        isAvailable: true,
        prepTimeMinutes: parseInt(formPrepTime, 10) || 20,
        spiceLevel: formSpice,
        taxPercent: 5.0,
        rating: 4.8,
      });
      addToast({ type: 'SUCCESS', title: 'Item Created', message: `${formName} added to catalog.` });
    }
    setIsItemModalOpen(false);
  };

  const handleDeleteItem = (item: MenuItem) => {
    openConfirm({
      title: `Delete ${item.name}?`,
      message: 'This menu item will be removed permanently from the restaurant live menu.',
      impact: 'Customers will no longer be able to add this item to their basket.',
      isDestructive: true,
      confirmText: 'Delete Dish',
      onConfirm: () => {
        mockStore.deleteMenuItem(item.id);
        addToast({ type: 'WARNING', title: 'Item Deleted', message: `${item.name} removed from catalog.` });
      },
    });
  };

  const handleToggleAvailability = (item: MenuItem) => {
    mockStore.updateMenuItem(item.id, { isAvailable: !item.isAvailable });
    addToast({
      type: 'INFO',
      title: item.isAvailable ? 'Item Marked Sold Out' : 'Item Made Available',
      message: `${item.name} is now ${item.isAvailable ? 'hidden' : 'visible'} on customer menu.`,
    });
  };

  const filteredItems = menuItems.filter((m) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedCategory !== 'ALL' && m.categoryId !== selectedCategory) return false;
    if (selectedRestaurant !== 'ALL' && m.restaurantId !== selectedRestaurant) return false;
    if (vegFilter !== 'ALL') {
      if (vegFilter === 'VEG' && !m.isVeg) return false;
      if (vegFilter === 'NON_VEG' && m.isVeg) return false;
    }
    return true;
  });

  const handleExport = () => {
    const rows = filteredItems.map((i) => {
      const rest = restaurants.find((r) => r.id === i.restaurantId)?.name || i.restaurantId;
      const cat = categories.find((c) => c.id === i.categoryId)?.name || i.categoryId;
      return {
        ID: i.id,
        Name: i.name,
        Restaurant: rest,
        Category: cat,
        Price: `₹${i.price}`,
        DiscountedPrice: i.discountedPrice ? `₹${i.discountedPrice}` : '-',
        Type: i.isVeg ? 'Veg' : 'Non-Veg',
        Available: i.isAvailable ? 'Yes' : 'No',
        PrepTime: `${i.prepTimeMinutes} mins`,
        SpiceLevel: i.spiceLevel,
      };
    });
    exportToCSV('Belzo_Menu_Catalog', rows);
    addToast({ type: 'SUCCESS', title: 'Menu Exported', message: `${rows.length} dishes exported to CSV.` });
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Context Header */}
      <div className="pt-space-md pb-space-lg flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-md">
        <div className="flex flex-col space-y-space-2xs">
          <nav className="flex items-center gap-space-2xs text-on-surface-variant font-label-sm text-label-sm">
            <span onClick={() => navigateTo('dashboard')} className="hover:text-on-surface cursor-pointer">
              Overview
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Categories & Menus</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Catalog & Menu Management
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
              {menuItems.length} Dishes Listed
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Configure restaurant food catalogs, dietary classifications, preparation SLAs, dynamic pricing, and stock availability.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={handleExport}
            type="button"
            className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Menu (CSV)
          </button>
          <button
            onClick={openCreateModal}
            type="button"
            className="px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md text-label-md font-semibold flex items-center gap-space-xs shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-surface-container-high mb-space-md">
        <button
          onClick={() => setActiveTab('ITEMS')}
          className={`pb-3 font-label-md text-label-md font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'ITEMS'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
          Dishes & Food Items ({menuItems.length})
        </button>
        <button
          onClick={() => setActiveTab('CATEGORIES')}
          className={`pb-3 font-label-md text-label-md font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'CATEGORIES'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">category</span>
          Food Categories ({categories.length})
        </button>
      </div>

      {activeTab === 'ITEMS' ? (
        <>
          {/* Filter Bar */}
          <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs mb-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search dishes by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-space-sm flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-on-surface-variant font-label-sm text-label-sm font-semibold">Restaurant:</span>
                <select
                  value={selectedRestaurant}
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                  className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary max-w-xs truncate"
                >
                  <option value="ALL">All Restaurants</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.outletName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-on-surface-variant font-label-sm text-label-sm font-semibold">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-on-surface-variant font-label-sm text-label-sm font-semibold">Dietary:</span>
                <select
                  value={vegFilter}
                  onChange={(e) => setVegFilter(e.target.value)}
                  className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary"
                >
                  <option value="ALL">All Diet</option>
                  <option value="VEG">Veg Only 🟢</option>
                  <option value="NON_VEG">Non-Veg Only 🔴</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dishes Table */}
          <div className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-container-high bg-surface-container-low/40">
                    <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                      Item
                    </th>
                    <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                      Restaurant
                    </th>
                    <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                      Category
                    </th>
                    <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-right">
                      Price
                    </th>
                    <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-center">
                      Prep Time
                    </th>
                    <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-center">
                      Status
                    </th>
                    <th className="py-3 px-4 font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/60 font-body-md text-body-md">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[36px] mb-2 opacity-50 block">no_meals</span>
                        No dishes found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const rest = restaurants.find((r) => r.id === item.restaurantId);
                      const cat = categories.find((c) => c.id === item.categoryId);

                      return (
                        <tr key={item.id} className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-surface-container-high"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[8px] font-bold ${
                                      item.isVeg
                                        ? 'border-emerald-600 text-emerald-600'
                                        : 'border-rose-600 text-rose-600'
                                    }`}
                                  >
                                    ●
                                  </span>
                                  <span className="font-semibold text-on-surface leading-tight">{item.name}</span>
                                </div>
                                <p className="text-[12px] text-on-surface-variant line-clamp-1 max-w-sm mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-on-surface block font-medium text-sm">
                              {rest ? rest.name : item.restaurantId}
                            </span>
                            <span className="text-[11px] text-on-surface-variant block">{rest?.outletName}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant text-[12px] font-medium">
                              {cat?.name || item.categoryId}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {item.discountedPrice ? (
                              <div>
                                <span className="font-bold text-primary">₹{item.discountedPrice}</span>
                                <span className="text-[11px] text-on-surface-variant line-through ml-1.5">
                                  ₹{item.price}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold text-on-surface">₹{item.price}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="text-sm font-medium text-on-surface">{item.prepTimeMinutes}m</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleAvailability(item)}
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                                item.isAvailable
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                            >
                              {item.isAvailable ? 'IN STOCK' : 'SOLD OUT'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(item)}
                                type="button"
                                title="Edit Dish"
                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item)}
                                type="button"
                                title="Delete Dish"
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-space-md">
                <span className="text-3xl p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                  {cat.icon || '🍛'}
                </span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{cat.name}</h3>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">{cat.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary text-[11px] font-bold">
                      {cat.itemCount} Dishes Active
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Order: #{cat.sortOrder}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span
                  className={`w-3 h-3 rounded-full ${
                    cat.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'
                  }`}
                  title={cat.isActive ? 'Active Category' : 'Inactive'}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-space-lg space-y-space-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-space-sm">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {editingItem ? 'Edit Dish Catalog Entry' : 'Create New Menu Item'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-space-sm">
              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Restaurant Outlet *
                  </label>
                  <select
                    value={formRestaurant}
                    onChange={(e) => setFormRestaurant(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  >
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} - {r.outletName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Dish Title *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Royal Chicken Dum Biryani (Boneless)"
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Dish Description
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Culinary notes, ingredients, allergen warnings..."
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Discounted Price (₹ Optional)
                  </label>
                  <input
                    type="number"
                    value={formDiscPrice}
                    onChange={(e) => setFormDiscPrice(e.target.value)}
                    placeholder="Leave blank if none"
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-space-sm">
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Dietary Classification
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormIsVeg(true)}
                      className={`flex-1 py-1.5 rounded-lg border text-sm font-semibold flex items-center justify-center gap-1 ${
                        formIsVeg
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-surface-container-high bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      🟢 Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormIsVeg(false)}
                      className={`flex-1 py-1.5 rounded-lg border text-sm font-semibold flex items-center justify-center gap-1 ${
                        !formIsVeg
                          ? 'border-rose-600 bg-rose-50 text-rose-700'
                          : 'border-surface-container-high bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      🔴 Non-Veg
                    </button>
                  </div>
                </div>
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Prep Time (Minutes)
                  </label>
                  <input
                    type="number"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                    Spice Level
                  </label>
                  <select
                    value={formSpice}
                    onChange={(e) => setFormSpice(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                  >
                    <option value="MILD">Mild 🌶️</option>
                    <option value="MEDIUM">Medium 🌶️🌶️</option>
                    <option value="SPICY">Spicy 🌶️🌶️🌶️</option>
                    <option value="EXTRA_SPICY">Extra Spicy 🔥</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">
                  Dish Photography Image URL
                </label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-space-sm border-t border-surface-container-high flex justify-end gap-space-sm">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container-highest"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 shadow-sm"
              >
                {editingItem ? 'Save Changes' : 'Create Dish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
