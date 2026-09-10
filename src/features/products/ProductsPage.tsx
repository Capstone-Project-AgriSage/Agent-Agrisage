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

  const keyword = search.trim().toLowerCase()
  const filteredProducts = products.filter(
    (p) =>
      (!keyword || p.name.toLowerCase().includes(keyword) || p.description.toLowerCase().includes(keyword)) &&
      (categoryFilter === CATEGORY_OPTIONS[0] || p.categoryLabel === categoryFilter) &&
      (businessFilter === BUSINESS_OPTIONS[0] || p.businessStatus === businessFilter),
  )

  const handleClearFilters = () => {
    setSearch('')
    setCategoryFilter(CATEGORY_OPTIONS[0])
    setBusinessFilter(BUSINESS_OPTIONS[0])
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
  const outOfStockCount = products.filter((p) => p.stockLabel === 'Hết hàng').length
  const activePercent = totalCount ? Math.round((activeCount / totalCount) * 1000) / 10 : 0
  const categoryCount = new Set(products.map((p) => p.categoryLabel)).size

  return (
    <>
      {/* 1. BREADCRUMBS & PAGE HEADER */}
      <section className="space-y-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-body-sm text-outline">
          <Link className="hover:text-primary transition-colors" to="/">Bảng điều khiển</Link>
          <span className="material-symbols-outlined text-xs" data-icon="chevron_right">chevron_right</span>
          <span className="text-on-surface font-medium">Quản lý sản phẩm</span>
        </nav>
        <div className="flex justify-end pt-1">
          <div className="flex items-center gap-space-sm self-start md:self-auto">
            <button
              className="flex items-center gap-2 h-9 px-space-md bg-surface-container-lowest hover:bg-surface border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md transition-all shadow-sm"
              onClick={handleExportProducts}
              type="button"
            >
              <span className="material-symbols-outlined text-lg text-outline" data-icon="download">download</span>
              <span>Xuất Excel</span>
            </button>
            <button
              className="flex items-center gap-2 h-9 px-space-lg bg-[#1E5E3A] hover:bg-[#17482D] text-on-primary rounded-lg font-label-md text-label-md transition-all shadow-sm"
              onClick={() => setCreateOpen(true)}
              type="button"
            >
              <span className="material-symbols-outlined text-lg" data-icon="add">add</span><span>Thêm sản phẩm</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. COMPACT SUMMARY METRIC CARDS (4 Cards Grid) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1: Tổng sản phẩm */}
        <div className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Tổng sản phẩm</span>
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-on-surface tabular-nums">{totalCount}</span>
              <span className="font-body-sm text-body-sm text-outline">mặt hàng</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{categoryCount} danh mục đang hoạt động</p>
          </div>
          <div className="p-2.5 bg-surface-container rounded-lg text-primary">
            <span className="material-symbols-outlined text-2xl" data-icon="inventory_2">inventory_2</span>
          </div>
        </div>
        {/* Card 2: Đang kinh doanh */}
        <div className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Đang kinh doanh</span>
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-[#15803D] tabular-nums">{activeCount}</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                {activePercent}%
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Đảm bảo dòng tiền bán lẻ</p>
          </div>
          <div className="p-2.5 bg-[#DCFCE7] rounded-lg text-[#15803D]">
            <span className="material-symbols-outlined text-2xl fill" data-icon="check_circle" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
        </div>
        {/* Card 3: Sắp hết hàng */}
        <div className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Sắp hết hàng</span>
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-[#B45309] tabular-nums">{lowStockCount}</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                Cần nhập
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-[#B45309]">Ngưỡng cảnh báo &lt; 20 bao/chai</p>
          </div>
          <div className="p-2.5 bg-[#FEF3C7] rounded-lg text-[#B45309]">
            <span className="material-symbols-outlined text-2xl fill" data-icon="warning" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
        </div>
        {/* Card 4: Ngừng kinh doanh / Hết hàng */}
        <div className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Ngừng KD / Hết hàng</span>
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-[#B91C1C] tabular-nums">{outOfStockCount}</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5]">
                Tồn: 0
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-outline">Tồn kho 0 hoặc ngưng nhập</p>
          </div>
          <div className="p-2.5 bg-[#FEE2E2] rounded-lg text-[#B91C1C]">
            <span className="material-symbols-outlined text-2xl" data-icon="block">block</span>
          </div>
        </div>
      </section>

      {/* 3. DATA FILTERS TOOLBAR */}
      <section className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant shadow-sm flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex flex-wrap items-center gap-space-sm flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Tìm kiếm sản phẩm, hoạt chất..." />
          <FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={CATEGORY_OPTIONS} className="relative min-w-[210px]" />
          <FilterSelect value={businessFilter} onChange={setBusinessFilter} options={BUSINESS_OPTIONS} className="relative min-w-[170px]" />
          <button
            className="h-9 px-space-sm text-outline hover:text-on-surface font-body-sm text-body-sm flex items-center gap-1 transition-colors"
            onClick={handleClearFilters}
            type="button"
          >
            <span className="material-symbols-outlined text-base" data-icon="filter_alt_off">filter_alt_off</span>
            <span>Đặt lại bộ lọc</span>
          </button>
        </div>
      </section>

      {/* 4. ENTERPRISE DATA TABLE CONTAINER */}
      <section className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-outline-variant text-[11px] font-semibold uppercase tracking-wider text-outline select-none">
                <th className="py-3 pl-4 px-3 min-w-[280px]">Sản phẩm &amp; Hoạt chất</th>
                <th className="py-3 px-3 min-w-[130px]">Danh mục</th>
                <th className="py-3 px-3 min-w-[120px] text-right">Giá bán niêm yết</th>
                <th className="py-3 px-3 min-w-[170px] text-right">Số lượng</th>
                <th className="py-3 pr-4 pl-3 w-28 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-md text-on-surface">
              {paginated.length === 0 ? (
                <EmptyTableRow colSpan={5} message="Không tìm thấy sản phẩm phù hợp với bộ lọc." />
              ) : null}
              {paginated.map((product) => {
                const isSelected = product.id === selectedId
                return (
                  <tr
                    key={product.id}
                    onClick={() => setSelectedId(product.id)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary'
                        : `hover:bg-surface/70 ${product.rowClassName ?? ''}`
                    }`}
                  >
                    <td className="py-3.5 pl-4 px-3">
                      <div
                        className={`font-title-md text-title-md group-hover:text-primary transition-colors ${
                          product.discontinued ? 'text-outline line-through' : 'text-on-surface'
                        }`}
                      >
                        {product.name}
                      </div>
                      <div className="text-body-sm text-outline mt-0.5">{product.description}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${product.categoryClassName}`}>
                        {product.categoryLabel}
                      </span>
                    </td>
                    <td className={`py-3.5 px-3 text-right font-semibold tabular-nums ${product.priceClassName ?? 'text-on-surface'}`}>
                      {product.price}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="inline-flex items-center justify-end gap-1.5 font-semibold tabular-nums text-on-surface">
                        <span className={`w-1.5 h-1.5 rounded-full ${product.stockDotClassName}`}></span>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 pl-3 text-right">
                      <div className="flex items-center justify-end">
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
      </section>

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
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${selectedProduct.stockClassName}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedProduct.stockDotClassName}`}></span>
                {selectedProduct.stockLabel}
              </span>
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
