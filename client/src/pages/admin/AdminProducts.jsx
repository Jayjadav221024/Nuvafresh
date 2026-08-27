import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  X, 
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import API from '../../api/axiosInstance';
import CSV_PRODUCTS from '../../data/csvProducts.json';
import { AdminTableSkeleton } from '../../components/common/Skeleton';

const AdminProducts = () => {
  const [products, setProducts] = useState(CSV_PRODUCTS || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [previewImage, setPreviewImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [formData, setFormData] = useState({
    title: '',
    category: 'Ozone Washed Vegetables',
    price: '',
    discountedPrice: '',
    stock: '',
    unit: '500g',
    isOzoneWashed: true,
    image: '',
    description: ''
  });

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products?limit=all');
      if (data.success && data.products && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (e) {
      console.warn('Using client CSV fallback catalog', e);
      if (CSV_PRODUCTS && CSV_PRODUCTS.length > 0) {
        setProducts(CSV_PRODUCTS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        category: product.category,
        price: product.price,
        discountedPrice: product.discountedPrice || '',
        stock: product.stock,
        unit: product.unit,
        isOzoneWashed: product.isOzoneWashed,
        isBestseller: product.isBestseller || false,
        image: product.images?.[0] || '',
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        category: 'Ozone Washed Vegetables',
        price: '',
        discountedPrice: '',
        stock: '50',
        unit: '500g',
        isOzoneWashed: true,
        isBestseller: false,
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product from catalog?')) {
      try {
        await API.delete(`/products/${id}`);
        setProducts(products.filter(p => p._id !== id));
      } catch (e) {
        setProducts(products.filter(p => p._id !== id));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      discountedPrice: Number(formData.discountedPrice) || Number(formData.price),
      stock: Number(formData.stock) || 50,
      images: [formData.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500']
    };

    try {
      if (editingProduct) {
        const { data } = await API.put(`/products/${editingProduct._id}`, payload);
        if (data.success) {
          setProducts(products.map(p => p._id === editingProduct._id ? { ...p, ...payload } : p));
        }
      } else {
        const { data } = await API.post('/products', payload);
        if (data.success && data.product) {
          setProducts([data.product, ...products]);
        }
      }
    } catch (err) {
      // Offline fallback
      if (editingProduct) {
        setProducts(products.map(p => p._id === editingProduct._id ? { ...p, ...payload } : p));
      } else {
        const fallback = { _id: `p-${Date.now()}`, ...payload };
        setProducts([fallback, ...products]);
      }
    }
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.slug && p.slug.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const categoriesList = ['All', 'Ozone Washed Vegetables', 'A2 Ghee', 'Stone Pressed Oils', 'Organic Atta', 'Cold-Pressed Juices'];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
              Produce & Catalog Inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black">
              {products.length} Products Loaded
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Manage all 335+ chemical-free farm batches, ozone purity tags, stock counts, and prices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Reload from Database"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Produce</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-neutral-400" />
          <input 
            type="text"
            placeholder="Search by title, mango, ghee, oil..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#2d472c]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#2d472c] text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-800/60 text-[11px] font-extrabold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                <th className="py-4 px-6">Produce Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Purity Tag</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {loading ? (
                <AdminTableSkeleton rows={8} cols={6} />
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-neutral-400">
                    No products found matching your filter.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3.5">
                        <div 
                          onClick={() => setPreviewImage(p.images?.[0])}
                          className="h-11 w-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <img 
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500'} 
                            alt={p.title}
                            className="h-full w-full object-cover" 
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white leading-tight">
                            {p.title}
                          </h4>
                          <span className="text-[10px] text-neutral-400">Unit: {p.unit || '1 Unit'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-6 text-neutral-600 dark:text-neutral-300 font-medium">
                      {p.category}
                    </td>

                    <td className="py-3 px-6">
                      <div className="flex flex-col gap-1 items-start">
                        {p.isBestseller ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-sans text-[10px] font-bold border border-amber-300 dark:border-amber-800 shadow-xs">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <span>Bestseller</span>
                          </span>
                        ) : null}
                        {p.isOzoneWashed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                            <Sparkles className="h-3 w-3" />
                            {p.ozoneBatchNumber || 'O3-VERIFIED'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-neutral-400">Standard Harvest</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-6 font-mono font-bold text-neutral-900 dark:text-white">
                      ₹{p.discountedPrice || p.price}
                      {p.price > (p.discountedPrice || p.price) && (
                        <span className="text-[10px] line-through text-neutral-400 ml-1.5">
                          ₹{p.price}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-6">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                        {p.stock} units
                      </span>
                    </td>

                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={async () => {
                            const updatedVal = !p.isBestseller;
                            try {
                              await API.put(`/products/${p._id}`, { isBestseller: updatedVal });
                            } catch (e) {}
                            setProducts(products.map(prod => prod._id === p._id ? { ...prod, isBestseller: updatedVal } : prod));
                          }}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            p.isBestseller 
                              ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300' 
                              : 'text-neutral-400 border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }`}
                          title={p.isBestseller ? "Remove from Bestsellers" : "Set as Homepage Bestseller"}
                        >
                          <Sparkles className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(p)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Edit Produce"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-bold text-neutral-900 dark:text-white px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
                {editingProduct ? 'Edit Produce Item' : 'Add New Produce Item'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Product Title
                </label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-medium"
                  >
                    <option>Ozone Washed Vegetables</option>
                    <option>A2 Ghee</option>
                    <option>Stone Pressed Oils</option>
                    <option>Organic Atta</option>
                    <option>Cold-Pressed Juices</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Unit Specification
                  </label>
                  <input 
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. 500g, 1L, 1 KG"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Price (₹)
                  </label>
                  <input 
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Discount Price (₹)
                  </label>
                  <input 
                    type="number"
                    value={formData.discountedPrice}
                    onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Stock
                  </label>
                  <input 
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Image URL
                </label>
                <input 
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="ozoneWashed"
                    checked={formData.isOzoneWashed}
                    onChange={(e) => setFormData({ ...formData, isOzoneWashed: e.target.checked })}
                    className="h-4 w-4 rounded text-[#2d472c] focus:ring-[#2d472c]"
                  />
                  <label htmlFor="ozoneWashed" className="text-xs font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                    Aqueous Ozone Sanitized (O₃)
                  </label>
                </div>

                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/40">
                  <input 
                    type="checkbox"
                    id="isBestseller"
                    checked={formData.isBestseller || false}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="isBestseller" className="text-xs font-bold text-amber-900 dark:text-amber-300 cursor-pointer flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Feature as Nuva Bestseller on Homepage</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md transition-transform active:scale-95"
                >
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} alt="Enlarged preview" className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl" />
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
