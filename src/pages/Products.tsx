import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Package, Plus, Search, Edit2, Trash2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number | null
  category: string | null
  is_available: boolean
}

export default function Products() {
  const [products] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">المنتجات</h1>
          <p className="text-muted mt-1">أضف منتجاتك وخدماتك عشان الذكاء الاصطناعي يعرف يرد عنها</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={18} />
          إضافة منتج
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث في المنتجات..."
          className="w-full pr-10 pl-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-muted font-medium">لا توجد منتجات بعد</p>
          <p className="text-sm text-muted mt-2">أضف منتجاتك يدوياً أو استوردها من قوقل ماب</p>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors"
            >
              إضافة يدوياً
            </button>
            <button className="px-4 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-background transition-colors">
              استيراد من قوقل ماب
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted mt-1">{product.description}</p>
                {product.price && (
                  <p className="text-sm text-primary font-medium mt-1">{product.price} ريال</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-muted hover:text-secondary transition-colors">
                  <Edit2 size={16} />
                </button>
                <button className="p-2 text-muted hover:text-danger transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-lg border border-border" dir="rtl">
            <h2 className="text-xl font-bold mb-4">إضافة منتج جديد</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المنتج</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="مثال: برجر كلاسيك"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="وصف قصير عن المنتج..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">السعر (ريال)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">التصنيف</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="مثال: مأكولات"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-border rounded-lg hover:bg-background transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
