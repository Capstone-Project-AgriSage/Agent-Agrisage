import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageHeader } from '../../context/PageHeaderContext'
import { useToast } from '../../context/ToastContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import DetailModal from '../../components/ui/DetailModal'
import Pagination from '../../components/ui/Pagination'
import EmptyTableRow from '../../components/ui/EmptyTableRow'
import SearchInput from '../../components/ui/SearchInput'
import FilterSelect from '../../components/ui/FilterSelect'
import { useSelectableList } from '../../hooks/useSelectableList'
import { usePagination } from '../../hooks/usePagination'
import { products as INITIAL_PRODUCTS } from '../../data/mockProducts'

const CATEGORY_OPTIONS = ['Tất cả danh mục', ...new Set(INITIAL_PRODUCTS.map((p) => p.categoryLabel))]
const BUSINESS_OPTIONS = ['Tất cả trạng thái KD', 'Đang kinh doanh', 'Tạm ngừng kinh doanh']

export default function ProductsPage() {
  usePageHeader({
    title: 'Quản lý sản phẩm',
  })

  const { showToast } = useToast()
  const { selectedId, setSelectedId, selected: selectedProduct } = useSelectableList(INITIAL_PRODUCTS, (p) => p.id)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(CATEGORY_OPTIONS[0])
  const [businessFilter, setBusinessFilter] = useState(BUSINESS_OPTIONS[0])

  const keyword = search.trim().toLowerCase()
  const filteredProducts = INITIAL_PRODUCTS.filter(
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

  const handleProductAction = (id: string, label: string) => {
    if (label === 'Xem chi tiết') {
      setSelectedId(id)
      return
    }
    const product = INITIAL_PRODUCTS.find((p) => p.id === id)
    showToast(`Đã thực hiện "${label}" cho sản phẩm ${product?.name ?? id}`)
  }

  const totalCount = INITIAL_PRODUCTS.length
  const activeCount = INITIAL_PRODUCTS.filter((p) => p.businessStatus === 'Đang kinh doanh').length
  const lowStockCount = INITIAL_PRODUCTS.filter((p) => p.stockLabel === 'Sắp hết').length
  const outOfStockCount = INITIAL_PRODUCTS.filter((p) => p.stockLabel === 'Hết hàng').length
  const activePercent = totalCount ? Math.round((activeCount / totalCount) * 1000) / 10 : 0
  const categoryCount = new Set(INITIAL_PRODUCTS.map((p) => p.categoryLabel)).size

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
              onClick={() => showToast(`Đã xuất Excel danh sách ${filteredProducts.length} sản phẩm`)}
              type="button"
            >
              <span className="material-symbols-outlined text-lg text-outline" data-icon="download">download</span>
              <span>Xuất Excel</span>
            </button>
            <button
              className="flex items-center gap-2 h-9 px-space-lg bg-[#1E5E3A] hover:bg-[#17482D] text-on-primary rounded-lg font-label-md text-label-md transition-all shadow-sm"
              onClick={() => showToast('Chức năng thêm sản phẩm mới đang được phát triển')}
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
    </>
  )
}
