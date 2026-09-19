import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageHeader } from '../../context/PageHeaderContext'
import { useToast } from '../../context/ToastContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import DetailModal from '../../components/ui/DetailModal'
import FormModal, { type FormFieldSpec } from '../../components/ui/FormModal'
import Pagination from '../../components/ui/Pagination'
import EmptyTableRow from '../../components/ui/EmptyTableRow'
import SearchInput from '../../components/ui/SearchInput'
import FilterSelect from '../../components/ui/FilterSelect'
import StatusBadge from '../../components/ui/StatusBadge'
import { useSelectableList } from '../../hooks/useSelectableList'
import { usePagination } from '../../hooks/usePagination'
import { useFormValues } from '../../hooks/useFormValues'
import { products as INITIAL_PRODUCTS } from '../../data/mockProducts'
import { downloadCsv } from '../../utils/csv'
import type { Product } from '../../types'

const CATEGORY_OPTIONS = ['Tất cả danh mục', ...new Set(INITIAL_PRODUCTS.map((p) => p.categoryLabel))]
const BUSINESS_OPTIONS = ['Tất cả trạng thái KD', 'Đang kinh doanh', 'Tạm ngừng kinh doanh']
const NEW_PRODUCT_CATEGORIES = CATEGORY_OPTIONS.slice(1)

const emptyProductForm = { name: '', description: '', categoryLabel: NEW_PRODUCT_CATEGORIES[0] ?? '', price: '', stockQuantity: '' }

const CREATE_PRODUCT_FIELDS: FormFieldSpec[] = [
  { key: 'name', label: 'Tên sản phẩm *', placeholder: 'Ví dụ: Phân NPK 20-20-15' },
  { key: 'description', label: 'Mô tả / Hoạt chất' },
  { key: 'categoryLabel', label: 'Danh mục', type: 'select', options: NEW_PRODUCT_CATEGORIES, group: 'catPrice' },
  { key: 'price', label: 'Giá bán *', placeholder: 'Ví dụ: 250.000 ₫', group: 'catPrice' },
  { key: 'stockQuantity', label: 'Số lượng tồn kho ban đầu *', placeholder: 'Ví dụ: 100 bao' },
]

const EDIT_PRODUCT_FIELDS: FormFieldSpec[] = [
  { key: 'name', label: 'Tên sản phẩm *' },
  { key: 'description', label: 'Mô tả / Hoạt chất' },
  { key: 'price', label: 'Giá bán *', group: 'priceQty' },
  { key: 'stockQuantity', label: 'Số lượng *', group: 'priceQty' },
]

export default function ProductsPage() {
  usePageHeader({
    title: 'Quản lý sản phẩm',
  })

  const { showToast } = useToast()
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const { selectedId, setSelectedId, selected: selectedProduct } = useSelectableList(products, (p) => p.id)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(CATEGORY_OPTIONS[0])
  const [businessFilter, setBusinessFilter] = useState(BUSINESS_OPTIONS[0])
  type ProductQuickFilter = 'all' | 'active' | 'low_stock' | 'out_of_stock'
  const [quickFilter, setQuickFilter] = useState<ProductQuickFilter>('all')

  const keyword = search.trim().toLowerCase()
  const filteredProducts = products.filter(
    (p) => {
      const matchesKeyword = !keyword || p.name.toLowerCase().includes(keyword) || p.description.toLowerCase().includes(keyword)
      const matchesCategory = categoryFilter === CATEGORY_OPTIONS[0] || p.categoryLabel === categoryFilter
      const matchesBusiness = businessFilter === BUSINESS_OPTIONS[0] || p.businessStatus === businessFilter
      const matchesQuick =
        quickFilter === 'all'
          ? true
          : quickFilter === 'active'
          ? p.businessStatus === 'Đang kinh doanh'
          : quickFilter === 'low_stock'
          ? p.stockLabel === 'Sắp hết'
          : quickFilter === 'out_of_stock'
          ? p.stockLabel === 'Hết hàng' || p.businessStatus === 'Tạm ngừng kinh doanh'
          : true
      return matchesKeyword && matchesCategory && matchesBusiness && matchesQuick
    },
  )

  const handleClearFilters = () => {
    setSearch('')
    setCategoryFilter(CATEGORY_OPTIONS[0])
    setBusinessFilter(BUSINESS_OPTIONS[0])
    setQuickFilter('all')
  }

  const { page, totalPages, paginated, startIndex, endIndex, totalCount: pageTotalCount, goPrev, goNext, setPage } =
    usePagination(filteredProducts, 10)

  const [createOpen, setCreateOpen] = useState(false)
  const { values: createForm, update: updateCreateForm, reset: resetCreateForm } = useFormValues(emptyProductForm)

  const [editId, setEditId] = useState<string | null>(null)
  const { values: editForm, update: updateEditForm, reset: resetEditForm } = useFormValues(emptyProductForm)

  const [restockId, setRestockId] = useState<string | null>(null)
  const { values: restockForm, update: updateRestockForm, reset: resetRestockForm } = useFormValues({ amount: '' })

  const handleProductAction = (id: string, label: string) => {
    const product = products.find((p) => p.id === id)
    if (label === 'Xem chi tiết') {
      setSelectedId(id)
    } else if (label === 'Chỉnh sửa' && product) {
      setEditId(id)
      resetEditForm({
        name: product.name,
        description: product.description,
        categoryLabel: product.categoryLabel,
        price: product.price,
        stockQuantity: product.stockQuantity,
      })
    } else if (label === 'Nhập thêm kho' && product) {
      setRestockId(id)
      resetRestockForm()
    } else {
      showToast(`Đã thực hiện "${label}" cho sản phẩm ${product?.name ?? id}`)
    }
  }

  const handleCreateProduct = () => {
    if (!createForm.name.trim() || !createForm.price.trim() || !createForm.stockQuantity.trim()) {
      showToast('Vui lòng nhập đầy đủ tên, giá bán và số lượng')
      return
    }
    const existingSameCategory = products.find((p) => p.categoryLabel === createForm.categoryLabel)
    const newProduct: Product = {
      id: `PRD-${String(products.length + 1).padStart(3, '0')}`,
      name: createForm.name.trim(),
      description: createForm.description.trim() || 'Chưa có mô tả',
      categoryLabel: createForm.categoryLabel,
      categoryClassName: existingSameCategory?.categoryClassName ?? 'bg-slate-50 text-slate-700 border-slate-200',
      price: createForm.price.trim(),
      stockStatus: 'Còn hàng',
      stockLabel: 'Còn hàng',
      stockClassName: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
      stockDotClassName: 'bg-[#16A34A]',
      stockQuantity: createForm.stockQuantity.trim(),
      businessStatus: 'Đang kinh doanh',
      actions: [
        { label: 'Xem chi tiết', icon: 'visibility' },
        { label: 'Chỉnh sửa', icon: 'edit' },
        { label: 'Nhập thêm kho', icon: 'add_business' },
      ],
    }
    setProducts((prev) => [newProduct, ...prev])
    setCreateOpen(false)
    resetCreateForm()
    showToast(`Đã thêm sản phẩm mới: ${newProduct.name}`)
  }

  const handleSaveEdit = () => {
    if (!editId) return
    if (!editForm.name.trim() || !editForm.price.trim() || !editForm.stockQuantity.trim()) {
      showToast('Vui lòng nhập đầy đủ tên, giá bán và số lượng')
      return
    }
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editId
          ? {
              ...p,
              name: editForm.name.trim(),
              description: editForm.description.trim(),
              categoryLabel: editForm.categoryLabel,
              price: editForm.price.trim(),
              stockQuantity: editForm.stockQuantity.trim(),
            }
          : p,
      ),
    )
    showToast(`Đã cập nhật sản phẩm: ${editForm.name.trim()}`)
    setEditId(null)
  }

  const handleConfirmRestock = () => {
    const amount = Number.parseInt(restockForm.amount, 10)
    if (!restockId || !Number.isFinite(amount) || amount <= 0) {
      showToast('Vui lòng nhập số lượng nhập thêm hợp lệ')
      return
    }
    const product = products.find((p) => p.id === restockId)
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== restockId) return p
        const currentQty = Number.parseInt(p.stockQuantity, 10) || 0
        const unit = p.stockQuantity.replace(/^[0-9.,\s]+/, '').trim()
        const newQty = currentQty + amount
        return {
          ...p,
          stockQuantity: unit ? `${newQty} ${unit}` : String(newQty),
          stockStatus: 'Còn hàng',
          stockLabel: 'Còn hàng',
          stockClassName: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
          stockDotClassName: 'bg-[#16A34A]',
        }
      }),
    )
    showToast(`Đã nhập thêm ${amount} vào kho cho ${product?.name ?? restockId}`)
    setRestockId(null)
  }

  const handleExportProducts = () => {
    downloadCsv(
      `san-pham-${Date.now()}.csv`,
      filteredProducts.map((p) => ({
        'Mã sản phẩm': p.id,
        'Tên sản phẩm': p.name,
        'Danh mục': p.categoryLabel,
        'Giá bán': p.price,
        'Số lượng': p.stockQuantity,
        'Trạng thái kinh doanh': p.businessStatus,
      })),
    )
    showToast(`Đã xuất Excel danh sách ${filteredProducts.length} sản phẩm`)
  }

  const totalCount = products.length
  const activeCount = products.filter((p) => p.businessStatus === 'Đang kinh doanh').length
  const lowStockCount = products.filter((p) => p.stockLabel === 'Sắp hết').length
  const outOfStockCount = products.filter((p) => p.stockLabel === 'Hết hàng' || p.businessStatus === 'Tạm ngừng kinh doanh').length

  return (
    <>
      {/* 1. BREADCRUMBS & PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12px] text-outline">
          <Link className="hover:text-on-surface" to="/">Bảng điều khiển</Link>
          <span className="material-symbols-outlined text-xs" data-icon="chevron_right">chevron_right</span>
          <span className="text-primary font-medium">Quản lý sản phẩm</span>
        </nav>
        <div className="flex items-center gap-space-xs flex-wrap">
          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-label-md text-label-md transition-all shadow-sm"
            onClick={handleExportProducts}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-outline" data-icon="download">download</span>
            <span>Xuất Excel</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E5E3A] hover:bg-[#17482D] text-white rounded-xl font-title-md text-title-md transition-all shadow-sm"
            onClick={() => setCreateOpen(true)}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER BAR WITH 1-CLICK QUICK PILLS */}
      <div className="bg-surface-container-lowest border border-outline-variant p-3.5 rounded-xl shadow-sm space-y-3">
        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-label-md font-label-md">
          <span className="text-outline text-[12px] whitespace-nowrap mr-1">Trạng thái:</span>
          <button
            type="button"
            onClick={() => setQuickFilter('all')}
            className={`px-3 py-1.5 rounded-lg border text-[13px] font-medium transition-colors whitespace-nowrap ${
              quickFilter === 'all'
                ? 'bg-[#1E5E3A] text-white border-[#1E5E3A] shadow-sm'
                : 'bg-surface-container-low text-on-surface border-outline-variant/60 hover:bg-surface-container'
            }`}
          >
            Tất cả ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setQuickFilter('active')}
            className={`px-3 py-1.5 rounded-lg border text-[13px] font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              quickFilter === 'active'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>Đang kinh doanh ({activeCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickFilter('low_stock')}
            className={`px-3 py-1.5 rounded-lg border text-[13px] font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              quickFilter === 'low_stock'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/70'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Sắp hết hàng ({lowStockCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickFilter('out_of_stock')}
            className={`px-3 py-1.5 rounded-lg border text-[13px] font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              quickFilter === 'out_of_stock'
                ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
                : 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100/70'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            <span>Hết hàng / Tạm ngừng ({outOfStockCount})</span>
          </button>
        </div>

        {/* Inputs & Dropdowns */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-outline-variant/40">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm sản phẩm, hoạt chất..."
            className="relative flex-1 min-w-[260px]"
          />
          <div className="flex items-center gap-2.5 flex-wrap">
            <FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={CATEGORY_OPTIONS} className="relative min-w-[170px]" />
            <FilterSelect value={businessFilter} onChange={setBusinessFilter} options={BUSINESS_OPTIONS} className="relative min-w-[170px]" />
            <button
              className="flex items-center gap-1 px-3 py-1.5 text-outline hover:text-on-surface hover:bg-surface-container-low rounded-xl font-label-md text-label-md transition-colors"
              onClick={handleClearFilters}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. ENTERPRISE DATA TABLE CONTAINER (6 Clean Columns) */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
        <div className="px-space-md py-3 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-title-md text-title-md font-semibold text-on-surface">Danh mục sản phẩm kinh doanh</span>
            <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">{filteredProducts.length} mặt hàng</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant text-[11px] font-semibold uppercase tracking-wider text-outline select-none">
                <th className="py-2.5 px-4 min-w-[240px]">Sản phẩm &amp; Quy cách</th>
                <th className="py-2.5 px-3">Danh mục</th>
                <th className="py-2.5 px-3 text-right">Giá bán</th>
                <th className="py-2.5 px-3 text-right">Tồn kho</th>
                <th className="py-2.5 px-3 text-center">Trạng thái KD</th>
                <th className="py-2.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm text-on-surface">
              {filteredProducts.length === 0 ? (
                <EmptyTableRow colSpan={6} message="Không tìm thấy sản phẩm phù hợp với bộ lọc." />
              ) : null}
              {paginated.map((product) => {
                const isSelected = product.id === selectedId
                return (
                  <tr
                    key={product.id}
                    onClick={() => setSelectedId(product.id)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-primary-container'
                        : `hover:bg-surface-container-low ${product.rowClassName ?? ''}`
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div
                        className={`font-semibold group-hover:text-primary transition-colors ${
                          product.discontinued ? 'text-outline line-through' : 'text-on-surface'
                        }`}
                      >
                        {product.name}
                      </div>
                      <div className="text-[12px] text-outline truncate max-w-[260px] mt-0.5">{product.description}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${product.categoryClassName}`}>
                        {product.categoryLabel}
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-right font-semibold font-mono tabular-nums whitespace-nowrap ${product.priceClassName ?? 'text-on-surface'}`}>
                      {product.price}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span className="inline-flex items-center justify-end gap-1.5 font-semibold font-mono tabular-nums text-on-surface">
                        <span className={`w-1.5 h-1.5 rounded-full ${product.stockDotClassName}`}></span>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        product.businessStatus === 'Đang kinh doanh'
                          ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {product.businessStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <RowActionsMenu
                          triggerLabel={`Thao tác ${product.name}`}
                          actions={product.actions.map((action) => ({
                            ...action,
                            onClick: () => handleProductAction(product.id, action.label),
                          }))}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalCount={pageTotalCount}
          unitLabel="sản phẩm"
          goPrev={goPrev}
          goNext={goNext}
          setPage={setPage}
        />
      </div>

      {/* 6. OPERATIONAL AUDIT & FAST NOTES STRIP */}
      <section className="p-space-sm px-space-md bg-surface-container-lowest rounded-lg border border-outline-variant flex flex-wrap items-center justify-between text-body-sm text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base" data-icon="info">info</span>
          <span>Hệ thống áp dụng cảnh báo sắp hết hàng mặc định: <strong>&lt; 20 bao/chai</strong> đối với nhóm Phân bón và Thuốc BVTV chủ lực vụ Đông Xuân.</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-outline">
          <span>Người đồng bộ kho gần nhất: <strong>Nguyễn Văn Khang (Kỹ sư nông học)</strong></span>
          <span>•</span>
          <span>15 phút trước qua VietQR Dispatch</span>
        </div>
      </section>

      {/* DETAIL MODAL: CHI TIẾT SẢN PHẨM */}
      <DetailModal open={selectedProduct !== null} onClose={() => setSelectedId(null)}>
        {selectedProduct ? (
          <div className="p-space-md space-y-3">
            <div>
              <h3 className={`font-title-md text-title-md font-bold ${selectedProduct.discontinued ? 'text-outline line-through' : 'text-on-surface'}`}>
                {selectedProduct.name}
              </h3>
              <p className="text-body-sm text-outline mt-0.5">{selectedProduct.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${selectedProduct.categoryClassName}`}>
                {selectedProduct.categoryLabel}
              </span>
              <StatusBadge label={selectedProduct.stockLabel} className={selectedProduct.stockClassName} />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
              <span className="text-body-sm text-outline">Giá bán niêm yết</span>
              <span className={`font-semibold text-lg tabular-nums ${selectedProduct.priceClassName ?? 'text-on-surface'}`}>
                {selectedProduct.price}
              </span>
            </div>
            <div className="text-body-sm text-on-surface-variant">{selectedProduct.businessStatus}</div>
          </div>
        ) : null}
      </DetailModal>

      {/* MODAL: THÊM SẢN PHẨM MỚI */}
      <FormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Thêm sản phẩm mới"
        fields={CREATE_PRODUCT_FIELDS}
        values={createForm}
        onChange={updateCreateForm}
        onSubmit={handleCreateProduct}
        submitLabel="Thêm sản phẩm"
      />

      {/* MODAL: CHỈNH SỬA SẢN PHẨM */}
      <FormModal
        open={editId !== null}
        onClose={() => setEditId(null)}
        title="Chỉnh sửa sản phẩm"
        fields={EDIT_PRODUCT_FIELDS}
        values={editForm}
        onChange={updateEditForm}
        onSubmit={handleSaveEdit}
        submitLabel="Lưu thay đổi"
      />

      {/* MODAL: NHẬP THÊM KHO */}
      <FormModal
        open={restockId !== null}
        onClose={() => setRestockId(null)}
        title="Nhập thêm kho"
        fields={[
          {
            key: 'note',
            type: 'note',
            content: (
              <p className="text-body-sm text-outline">
                {products.find((p) => p.id === restockId)?.name} — tồn hiện tại: {products.find((p) => p.id === restockId)?.stockQuantity}
              </p>
            ),
          },
          { key: 'amount', label: 'Số lượng nhập thêm *', type: 'number', min: '1', placeholder: 'Ví dụ: 50' },
        ]}
        values={restockForm}
        onChange={updateRestockForm}
        onSubmit={handleConfirmRestock}
        submitLabel="Xác nhận nhập kho"
      />
    </>
  )
}
