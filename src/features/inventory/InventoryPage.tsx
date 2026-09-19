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
import { downloadCsv } from '../../utils/csv'
import {
  inventoryItems as INITIAL_INVENTORY,
  mockStockMovements as INITIAL_MOVEMENTS,
} from '../../data/mockInventory'
import type { InventoryItem, StockMovement, StockAdjustmentReason } from '../../types'

const CATEGORY_OPTIONS = ['Tất cả danh mục', ...new Set(INITIAL_INVENTORY.map((item) => item.categoryLabel))]
const STOCK_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Tồn kho tốt', label: 'Tồn kho tốt' },
  { value: 'Sắp hết', label: 'Sắp hết hàng' },
  { value: 'Hết hàng', label: 'Hết hàng' },
]

const MOVEMENT_TYPE_OPTIONS = [
  { value: 'ALL', label: 'Tất cả loại biến động' },
  { value: 'STOCK_IN', label: 'Nhập hàng' },
  { value: 'SALE', label: 'Bán hàng' },
  { value: 'ADJUSTMENT', label: 'Điều chỉnh kiểm kê' },
]

const ADJUST_REASONS: { value: StockAdjustmentReason; label: string; desc: string }[] = [
  { value: 'DAMAGED', label: 'Hư hỏng / Rách vỡ bao bì', desc: 'Vật tư bị hỏng do bảo quản hoặc vận chuyển' },
  { value: 'EXPIRED', label: 'Hết hạn sử dụng', desc: 'Vật tư quá date lưu kho theo quy chuẩn BVTV' },
  { value: 'LOST', label: 'Thất thoát / Hao hụt kiểm kê', desc: 'Không tìm thấy hiện vật khi đối chiếu kho thực tế' },
  { value: 'MANUAL_CORRECTION', label: 'Hiệu chỉnh sai lệch kiểm đếm', desc: 'Cân bằng số dư thẻ kho với kiểm kê thực tế' },
]

export default function InventoryPage() {
  usePageHeader({
    title: 'Quản lý kho hàng & Thẻ kho',
  })

  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'stock' | 'ledger'>('stock')
  const [inventoryItems, setInventoryItems] = useState(INITIAL_INVENTORY)
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_MOVEMENTS)
  const { selectedId, setSelectedId, selected: selectedItem } = useSelectableList(inventoryItems, (item) => item.id)

  // Stock Filter State
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(CATEGORY_OPTIONS[0])
  const [stockFilter, setStockFilter] = useState('')

  // Ledger Filter State
  const [ledgerSearch, setLedgerSearch] = useState('')
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('ALL')

  // Restock Modal State
  const [restockOpen, setRestockOpen] = useState(false)
  const { values: restockForm, update: updateRestockForm, reset: resetRestockForm } = useFormValues({ itemId: '', amount: '' })

  // Adjustment Modal State (WF-05 Append-Only)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null)
  const [adjustChangeType, setAdjustChangeType] = useState<'decrease' | 'increase'>('decrease')
  const [adjustAmount, setAdjustAmount] = useState('1')
  const [adjustReason, setAdjustReason] = useState<StockAdjustmentReason>('DAMAGED')
  const [adjustNote, setAdjustNote] = useState('')

  // Filtered Stock Items
  const keyword = search.trim().toLowerCase()
  const filteredInventory = inventoryItems.filter(
    (item) =>
      (!keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.sku.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)) &&
      (categoryFilter === CATEGORY_OPTIONS[0] || item.categoryLabel === categoryFilter) &&
      (!stockFilter || item.stockLabel === stockFilter),
  )

  const handleClearFilters = () => {
    setSearch('')
    setCategoryFilter(CATEGORY_OPTIONS[0])
    setStockFilter('')
  }

  const { page, totalPages, paginated, startIndex, endIndex, totalCount: pageTotalCount, goPrev, goNext, setPage } =
    usePagination(filteredInventory, 10)

  // Filtered Ledger Movements
  const ledgerKeyword = ledgerSearch.trim().toLowerCase()
  const filteredMovements = stockMovements.filter((m) => {
    const matchesSearch =
      !ledgerKeyword ||
      m.id.toLowerCase().includes(ledgerKeyword) ||
      m.productName.toLowerCase().includes(ledgerKeyword) ||
      m.sku.toLowerCase().includes(ledgerKeyword) ||
      (m.referenceId && m.referenceId.toLowerCase().includes(ledgerKeyword)) ||
      (m.createdBy && m.createdBy.toLowerCase().includes(ledgerKeyword)) ||
      (m.note && m.note.toLowerCase().includes(ledgerKeyword))

    const matchesType = ledgerTypeFilter === 'ALL' || m.movementType === ledgerTypeFilter

    return matchesSearch && matchesType
  })

  const {
    page: ledgerPage,
    totalPages: ledgerTotalPages,
    paginated: paginatedMovements,
    startIndex: ledgerStartIndex,
    endIndex: ledgerEndIndex,
    totalCount: ledgerTotalCount,
    goPrev: ledgerGoPrev,
    goNext: ledgerGoNext,
    setPage: setLedgerPage,
  } = usePagination(filteredMovements, 10)

  const handleInventoryAction = (id: string, label: string) => {
    if (label === 'Xem chi tiết') {
      setSelectedId(id)
      return
    }
    if (label === 'Nhập hàng ngay' || label === 'Tạo đề nghị nhập khẩn') {
      resetRestockForm({ itemId: id, amount: '' })
      setRestockOpen(true)
      return
    }
    if (label === 'Điều chỉnh kho') {
      setAdjustItem(inventoryItems.find((i) => i.id === id) ?? null)
      setAdjustChangeType('decrease')
      setAdjustAmount('1')
      setAdjustReason('DAMAGED')
      setAdjustNote('')
      setAdjustOpen(true)
      return
    }
    const item = inventoryItems.find((i) => i.id === id)
    showToast(`Đã thực hiện "${label}" cho ${item?.name ?? id}`)
  }

  const restockItem = inventoryItems.find((i) => i.id === restockForm.itemId) ?? null

  const handleConfirmRestock = () => {
    const amount = Number.parseInt(restockForm.amount, 10)
    if (!restockItem || !restockForm.amount.trim() || Number.isNaN(amount) || amount <= 0) {
      showToast('Vui lòng nhập số lượng hợp lệ')
      return
    }
    const currentQty = Number.parseInt(restockItem.stockQuantity, 10) || 0
    const unit = restockItem.stockQuantity.replace(/^[0-9.,\s]+/, '').trim()
    const newQty = currentQty + amount
    setInventoryItems((prev) =>
      prev.map((item) =>
        item.id === restockItem.id
          ? {
              ...item,
              stockQuantity: `${newQty} ${unit}`.trim(),
              stockBarClassName: 'bg-emerald-600',
              stockBarWidth: '100%',
              stockLabel: 'Tồn kho tốt',
              stockClassName: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
              stockDotClassName: 'bg-[#16A34A]',
              updatedAgo: 'Vừa xong',
              updatedBy: 'Bạn (Thủ kho)',
            }
          : item,
      ),
    )

    const newMovement: StockMovement = {
      id: `SM-${Date.now().toString().slice(-4)}`,
      productId: restockItem.id,
      productName: restockItem.name,
      sku: restockItem.sku,
      movementType: 'STOCK_IN',
      quantityChange: amount,
      balanceAfter: newQty,
      unit: unit || 'đơn vị',
      referenceId: `PNK-${Date.now().toString().slice(-4)}`,
      createdAt: 'Vừa xong',
      createdBy: 'Bạn (Thủ kho)',
      note: 'Nhập kho bổ sung vật tư đại lý Hai Thắng',
    }
    setStockMovements((prev) => [newMovement, ...prev])
    showToast(`Đã nhập thêm ${amount} ${unit} vào kho cho ${restockItem.name}`)
    setRestockOpen(false)
  }

  const handleConfirmAdjust = () => {
    const targetItem = adjustItem || inventoryItems[0]
    const amount = Number.parseInt(adjustAmount, 10)
    if (!targetItem || !adjustAmount.trim() || Number.isNaN(amount) || amount <= 0) {
      showToast('Vui lòng chọn sản phẩm và nhập số lượng điều chỉnh hợp lệ (> 0)')
      return
    }
    const currentQty = Number.parseInt(targetItem.stockQuantity, 10) || 0
    const unit = targetItem.stockQuantity.replace(/^[0-9.,\s]+/, '').trim()
    const delta = adjustChangeType === 'decrease' ? -amount : amount
    const newQty = Math.max(0, currentQty + delta)

    setInventoryItems((prev) =>
      prev.map((item) =>
        item.id === targetItem.id
          ? {
              ...item,
              stockQuantity: `${newQty} ${unit}`.trim(),
              stockLabel: newQty === 0 ? 'Hết hàng' : newQty < 20 ? 'Sắp hết' : 'Tồn kho tốt',
              stockClassName:
                newQty === 0
                  ? 'bg-[#FEE2E2] text-error border-error/30'
                  : newQty < 20
                  ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                  : 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
              stockDotClassName:
                newQty === 0 ? 'bg-error' : newQty < 20 ? 'bg-[#D97706]' : 'bg-[#16A34A]',
              updatedAgo: 'Vừa xong',
              updatedBy: 'Bạn (Thủ kho)',
            }
          : item,
      ),
    )

    const reasonObj = ADJUST_REASONS.find((r) => r.value === adjustReason)
    const newMovement: StockMovement = {
      id: `SM-${Date.now().toString().slice(-4)}`,
      productId: targetItem.id,
      productName: targetItem.name,
      sku: targetItem.sku,
      movementType: 'ADJUSTMENT',
      quantityChange: delta,
      balanceAfter: newQty,
      unit: unit || 'đơn vị',
      reason: adjustReason,
      referenceId: `DCK-${Date.now().toString().slice(-4)}`,
      createdAt: 'Vừa xong',
      createdBy: 'Bạn (Thủ kho)',
      note: adjustNote.trim() || `Điều chỉnh kho (${reasonObj?.label ?? adjustReason})`,
    }
    setStockMovements((prev) => [newMovement, ...prev])
    showToast(`Đã ghi nhận điều chỉnh kho (${delta > 0 ? '+' : ''}${delta} ${unit}) cho ${targetItem.name}`)
    setAdjustOpen(false)
  }

  const handleExportInventory = () => {
    downloadCsv(
      `bien-ban-kiem-ke-${Date.now()}.csv`,
      filteredInventory.map((item) => ({
        'Mã kho': item.id,
        'Tên sản phẩm': item.name,
        'SKU': item.sku,
        'Danh mục': item.categoryLabel,
        'Số lượng': item.stockQuantity,
        'Trạng thái': item.stockLabel,
      })),
    )
    showToast(`Đã xuất biên bản kiểm kê ${filteredInventory.length} mặt hàng`)
  }

  const handleExportLedger = () => {
    downloadCsv(
      `so-bien-dong-the-kho-${Date.now()}.csv`,
      filteredMovements.map((m) => ({
        'Mã GD': m.id,
        'Thời gian': m.createdAt,
        'Tên sản phẩm': m.productName,
        'SKU': m.sku,
        'Loại biến động': m.movementType,
        'Biến động': m.quantityChange,
        'Tồn sau': m.balanceAfter,
        'Đơn vị': m.unit,
        'Lý do': m.reason ?? '',
        'Mã tham chiếu': m.referenceId ?? '',
        'Người thực hiện': m.createdBy,
        'Ghi chú': m.note ?? '',
      })),
    )
    showToast(`Đã xuất sổ biến động thẻ kho (${filteredMovements.length} bản ghi)`)
  }

  const totalCount = inventoryItems.length
  const lowStockCount = inventoryItems.filter((item) => item.stockLabel === 'Sắp hết').length
  const outOfStockCount = inventoryItems.filter((item) => item.stockLabel === 'Hết hàng').length

  const totalMovementsCount = stockMovements.length
  const stockInCount = stockMovements.filter((m) => m.movementType === 'STOCK_IN').length
  const saleCount = stockMovements.filter((m) => m.movementType === 'SALE').length
  const adjustmentCount = stockMovements.filter((m) => m.movementType === 'ADJUSTMENT').length

  const restockFields: FormFieldSpec[] = [
    {
      key: 'itemId',
      label: 'Sản phẩm',
      type: 'select',
      options: inventoryItems.map((item) => ({ value: item.id, label: `${item.name} (${item.sku})` })),
    },
    {
      key: 'currentStockNote',
      type: 'note',
      content: restockItem ? (
        <p className="text-body-sm text-outline">
          Tồn hiện tại: <span className="font-semibold text-on-surface">{restockItem.stockQuantity}</span>
        </p>
      ) : null,
    },
    { key: 'amount', label: 'Số lượng nhập thêm', type: 'number', min: '1', placeholder: 'Nhập số lượng' },
  ]

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-space-lg">
      {/* BREADCRUMB & HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex items-center gap-2 text-body-sm font-body-sm text-outline">
            <Link className="hover:text-primary transition-colors" to="/">Bảng điều khiển</Link>
            <span className="material-symbols-outlined text-[14px]" data-icon="chevron_right">chevron_right</span>
            <span className="text-primary font-medium">Quản lý kho &amp; Thẻ kho</span>
          </nav>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
            Đại lý Hai Thắng • ĐBSCL
          </span>
        </div>
        {/* Major Operational Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low font-title-md text-title-md transition-colors shadow-sm"
            type="button"
            onClick={activeTab === 'stock' ? handleExportInventory : handleExportLedger}
          >
            <span className="material-symbols-outlined text-[18px] text-outline" data-icon="file_download">file_download</span>
            <span>Xuất dữ liệu</span>
          </button>
          <button
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low font-title-md text-title-md transition-colors shadow-sm"
            type="button"
            onClick={() => {
              setAdjustItem(inventoryItems[0] ?? null)
              setAdjustChangeType('decrease')
              setAdjustAmount('1')
              setAdjustReason('DAMAGED')
              setAdjustNote('')
              setAdjustOpen(true)
            }}
          >
            <span className="material-symbols-outlined text-[18px] text-outline" data-icon="tune">tune</span>
            <span>Điều chỉnh kho</span>
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E5E3A] hover:bg-[#17482D] text-white font-title-md text-title-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            type="button"
            onClick={() => {
              resetRestockForm({ itemId: inventoryItems[0]?.id ?? '', amount: '' })
              setRestockOpen(true)
            }}
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
            <span>Nhập kho</span>
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-outline-variant bg-surface-container-lowest rounded-t-xl px-4 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-3 font-title-md text-title-md border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'stock'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" data-icon="inventory_2">inventory_2</span>
          <span>Tồn kho hiện tại</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'stock' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
          }`}>
            {totalCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-3 font-title-md text-title-md border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'ledger'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" data-icon="receipt_long">receipt_long</span>
          <span>Lịch sử biến động kho</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'ledger' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
          }`}>
            {totalMovementsCount}
          </span>
        </button>
      </div>

      {/* TAB 1: TỒN KHO HIỆN TẠI */}
      {activeTab === 'stock' && (
        <div className="space-y-space-lg">
          {/* 3 COMPACT OPERATIONAL SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-base">
            {/* Card 1: Low Stock Alert (Actionable) */}
            <div
              onClick={() => setStockFilter(stockFilter === 'Sắp hết' ? '' : 'Sắp hết')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setStockFilter(stockFilter === 'Sắp hết' ? '' : 'Sắp hết')}
              className={`p-space-base rounded-xl shadow-sm transition-all cursor-pointer flex flex-col justify-between ${
                stockFilter === 'Sắp hết'
                  ? 'border-2 border-amber-500 bg-amber-100/60 ring-2 ring-amber-400/30'
                  : 'border border-amber-300 bg-amber-50/40 hover:bg-amber-50/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm text-amber-900 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-amber-700">warning</span>
                  Sắp hết hàng
                </span>
                <span className="px-2 py-0.2 rounded-full text-[11px] font-bold bg-amber-200/80 text-amber-900">
                  {lowStockCount > 0 ? 'Cần nhập' : 'Ổn định'}
                </span>
              </div>
              <div className="mt-2">
                <div className="font-metric-num text-metric-num text-amber-900 font-bold tabular-nums">
                  {lowStockCount} <span className="text-sm font-normal text-amber-800">mặt hàng</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-amber-800 font-medium">
                  <span>Dưới ngưỡng an toàn</span>
                  <span className="underline underline-offset-2">{stockFilter === 'Sắp hết' ? 'Bỏ lọc ✕' : 'Lọc ngay →'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Out of Stock Alert (Actionable) */}
            <div
              onClick={() => setStockFilter(stockFilter === 'Hết hàng' ? '' : 'Hết hàng')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setStockFilter(stockFilter === 'Hết hàng' ? '' : 'Hết hàng')}
              className={`p-space-base rounded-xl shadow-sm transition-all cursor-pointer flex flex-col justify-between ${
                stockFilter === 'Hết hàng'
                  ? 'border-2 border-rose-500 bg-rose-100/60 ring-2 ring-rose-400/30'
                  : 'border border-rose-200 bg-rose-50/40 hover:bg-rose-50/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm text-rose-900 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-rose-700">block</span>
                  Hết hàng
                </span>
                <span className="px-2 py-0.2 rounded-full text-[11px] font-bold bg-rose-200/80 text-rose-900">
                  {outOfStockCount > 0 ? 'Tồn kho 0' : 'Đầy đủ'}
                </span>
              </div>
              <div className="mt-2">
                <div className="font-metric-num text-metric-num text-rose-900 font-bold tabular-nums">
                  {outOfStockCount} <span className="text-sm font-normal text-rose-800">mặt hàng</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-rose-800 font-medium">
                  <span>Tồn 0, tạm ngưng bán</span>
                  <span className="underline underline-offset-2">{stockFilter === 'Hết hàng' ? 'Bỏ lọc ✕' : 'Lọc ngay →'}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Healthy Stock & Total SKUs (Quiet) */}
            <div
              onClick={() => setStockFilter('')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setStockFilter('')}
              className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm hover:border-slate-400 transition-colors flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-700">task_alt</span>
                  Tồn kho an toàn
                </span>
                <span className="px-2 py-0.2 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {totalCount} SKU
                </span>
              </div>
              <div className="mt-2">
                <div className="font-metric-num text-metric-num text-on-surface font-semibold tabular-nums">
                  {totalCount - lowStockCount - outOfStockCount} <span className="text-sm font-normal text-outline">SKU ổn định</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-outline">
                  <span>9 danh mục vật tư lúa ĐBSCL</span>
                  <span className="underline underline-offset-2">Xem tất cả</span>
                </div>
              </div>
            </div>
          </div>

          {/* FILTERS & SEARCH CONTROLS */}
          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
            <SearchInput value={search} onChange={setSearch} placeholder="Tìm kiếm sản phẩm, mã SKU, hoạt chất..." className="relative flex-1" />
            <div className="flex flex-wrap items-center gap-2.5">
              <FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={CATEGORY_OPTIONS} className="relative min-w-[150px]" />
              <FilterSelect value={stockFilter} onChange={setStockFilter} options={STOCK_OPTIONS} className="relative min-w-[150px]" />
              <button
                className="px-3 py-1.5 rounded-xl text-body-sm font-label-md text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-1"
                type="button"
                onClick={handleClearFilters}
              >
                <span className="material-symbols-outlined text-[18px]" data-icon="filter_alt_off">filter_alt_off</span>
                <span>Xóa bộ lọc</span>
              </button>
            </div>
          </div>

          {/* MAIN INVENTORY DATA TABLE */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50 border-b border-outline-variant text-[11px] font-semibold uppercase tracking-wider text-outline select-none">
                    <th className="py-2.5 px-4" scope="col">Sản phẩm &amp; Hoạt chất</th>
                    <th className="py-2.5 px-3" scope="col">SKU</th>
                    <th className="py-2.5 px-3" scope="col">Danh mục</th>
                    <th className="py-2.5 px-3 text-right" scope="col">Số lượng tồn</th>
                    <th className="py-2.5 px-3 text-center" scope="col">Trạng thái</th>
                    <th className="py-2.5 px-3" scope="col">Cập nhật gần nhất</th>
                    <th className="py-2.5 px-4 text-center" scope="col">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                  {paginated.length === 0 ? (
                    <EmptyTableRow colSpan={7} message="Không tìm thấy sản phẩm phù hợp với bộ lọc." />
                  ) : null}
                  {paginated.map((item) => {
                    const isSelected = item.id === selectedId
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected
                            ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-primary-container'
                            : `hover:bg-surface-container-low ${item.rowClassName ?? ''}`
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className={`font-semibold group-hover:text-primary ${item.nameClassName ?? 'text-on-surface'}`}>
                              {item.name}
                            </span>
                            <span className="text-[12px] text-outline truncate max-w-[280px]">{item.description}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[12px] text-on-surface-variant font-medium whitespace-nowrap">{item.sku}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant">{item.categoryLabel}</span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <span className={`font-mono font-semibold tabular-nums ${item.stockQuantityClassName ?? 'text-on-surface'}`}>{item.stockQuantity}</span>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${item.stockClassName}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.stockDotClassName}`}></span>
                            {item.stockLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex flex-col text-[11px]">
                            <span className="text-on-surface font-medium">{item.updatedAgo}</span>
                            <span className="text-outline">{item.updatedBy}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <RowActionsMenu
                              triggerLabel={`Thao tác ${item.name}`}
                              actions={item.actions.map((action) => ({
                                ...action,
                                onClick: () => handleInventoryAction(item.id, action.label),
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

          {/* 2-COLUMN AUXILIARY LOWER SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-base">
            {/* COLUMN 1: CẢNH BÁO SẮP HẾT HÀNG KHẨN CẤP */}
            <div className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="p-space-base border-b border-outline-variant flex items-center justify-between bg-surface-container-low/30">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  <h2 className="font-semibold text-on-surface text-sm">Vật tư cần nhập khẩn</h2>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-error-container text-on-error-container font-medium">Ngưỡng báo động</span>
              </div>
              <div className="p-space-base divide-y divide-outline-variant/60">
                {/* Alert Item 1: Virtako 40WG */}
                <div className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-space-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] text-error flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]" data-icon="report">report</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-surface text-xs">Thuốc Trừ Sâu Virtako 40WG</h3>
                      <div className="text-[11px] text-error font-medium">Tồn 0 / Ngưỡng 40 gói (Kho D)</div>
                    </div>
                  </div>
                  <button
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-error hover:bg-[#b91c1c] text-on-error text-xs font-medium transition-colors shadow-xs"
                    type="button"
                    onClick={() => showToast('Đã tạo đề nghị nhập khẩn: Thuốc Trừ Sâu Virtako 40WG')}
                  >
                    Nhập khẩn
                  </button>
                </div>
                {/* Alert Item 2: Beam 75WP */}
                <div className="py-2.5 flex items-center justify-between gap-space-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]" data-icon="warning">warning</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-surface text-xs">Thuốc Trừ Bệnh Beam 75WP</h3>
                      <div className="text-[11px] text-[#B45309] font-medium">Tồn 8 / Ngưỡng 50 gói (Kho D)</div>
                    </div>
                  </div>
                  <button
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-medium transition-colors"
                    type="button"
                    onClick={() => showToast('Đã tạo đề nghị nhập: Thuốc Trừ Bệnh Beam 75WP')}
                  >
                    Đề nghị nhập
                  </button>
                </div>
                {/* Alert Item 3: Phân NPK Đầu Trâu */}
                <div className="py-2.5 last:pb-0 flex items-center justify-between gap-space-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]" data-icon="hourglass_top">hourglass_top</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-surface text-xs">Phân NPK Đầu Trâu 20-20-15+TE</h3>
                      <div className="text-[11px] text-[#B45309] font-medium">Tồn 14 / Ngưỡng 30 bao (Kho B)</div>
                    </div>
                  </div>
                  <button
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-medium transition-colors"
                    type="button"
                    onClick={() => showToast('Đã tạo đề nghị nhập: Phân NPK Đầu Trâu 20-20-15+TE')}
                  >
                    Đề nghị nhập
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMN 2: NHẬT KÝ XUẤT NHẬP KHO GẦN ĐÂY */}
            <div className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="p-space-base border-b border-outline-variant flex items-center justify-between bg-surface-container-low/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]" data-icon="receipt">receipt</span>
                  <h2 className="font-semibold text-on-surface text-sm">Biến động thẻ kho gần đây</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('ledger')}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Xem sổ thẻ kho</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
              <div className="p-space-base divide-y divide-outline-variant/60">
                {stockMovements.slice(0, 3).map((m) => (
                  <div key={m.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          m.movementType === 'STOCK_IN'
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : m.movementType === 'SALE'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {m.movementType === 'STOCK_IN' ? 'NHẬP' : m.movementType === 'SALE' ? 'XUẤT' : 'ĐIỀU CHỈNH'}
                      </span>
                      <div>
                        <span className="font-semibold text-on-surface text-xs">
                          {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange} {m.unit} {m.productName}
                        </span>
                        <div className="text-[11px] text-outline">
                          {m.referenceId ? `${m.referenceId} • ` : ''}{m.note || m.createdBy}
                        </div>
                      </div>
                    </div>
                    <span className="text-outline font-mono text-[11px] shrink-0">{m.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SỔ BIẾN ĐỘNG THẺ KHO (APPEND-ONLY LEDGER - WF-05) */}
      {activeTab === 'ledger' && (
        <div className="space-y-space-lg">
          {/* LEDGER 4 KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-base">
            <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Tổng giao dịch thẻ kho</span>
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]" data-icon="history">history</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="font-metric-num text-metric-num text-on-surface font-semibold">{totalMovementsCount} <span className="text-sm font-normal text-outline">lượt ghi sổ</span></div>
                <div className="mt-1 text-xs text-outline">Lịch sử append-only bất biến</div>
              </div>
            </div>

            <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Lượt nhập hàng</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <span className="material-symbols-outlined text-[20px]" data-icon="input">input</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="font-metric-num text-metric-num text-emerald-700 font-semibold">{stockInCount} <span className="text-sm font-normal text-outline">lần nhập</span></div>
                <div className="mt-1 text-xs text-emerald-700 font-medium">Nhập từ nhà phân phối</div>
              </div>
            </div>

            <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Lượt bán hàng</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                  <span className="material-symbols-outlined text-[20px]" data-icon="shopping_cart_checkout">shopping_cart_checkout</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="font-metric-num text-metric-num text-blue-700 font-semibold">{saleCount} <span className="text-sm font-normal text-outline">đơn xuất</span></div>
                <div className="mt-1 text-xs text-blue-600">Khấu trừ tự động theo đơn</div>
              </div>
            </div>

            <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Điều chỉnh kiểm kê</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700">
                  <span className="material-symbols-outlined text-[20px]" data-icon="fact_check">fact_check</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="font-metric-num text-metric-num text-purple-700 font-semibold">{adjustmentCount} <span className="text-sm font-normal text-outline">lần điều chỉnh</span></div>
                <div className="mt-1 text-xs text-purple-700 font-medium">Ghi nhận hư hỏng / hao hụt</div>
              </div>
            </div>
          </div>

          {/* AUDIT POLICY BANNER (CLEAN & COMPACT) */}
          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
              <span className="font-semibold">Sổ theo dõi biến động kho</span>
              <span className="text-outline hidden sm:inline">• Lưu vết kiểm toán tự động</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-outline flex-wrap">
              <span>Lý do kiểm kê:</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-semibold">Hư hỏng</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-semibold">Hết hạn</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-semibold">Thất thoát</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-semibold">Kiểm kê</span>
            </div>
          </div>

          {/* LEDGER SEARCH & FILTER BAR */}
          <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md">
            <SearchInput
              value={ledgerSearch}
              onChange={setLedgerSearch}
              placeholder="Tìm theo mã GD, SKU, sản phẩm, mã đơn, người lập..."
              className="relative flex-1"
            />
            <div className="flex items-center gap-3">
              <FilterSelect
                value={ledgerTypeFilter}
                onChange={setLedgerTypeFilter}
                options={MOVEMENT_TYPE_OPTIONS}
                className="relative min-w-[200px]"
              />
              <button
                type="button"
                onClick={() => {
                  setLedgerSearch('')
                  setLedgerTypeFilter('ALL')
                }}
                className="px-3 py-2 rounded-xl text-body-sm font-label-md text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Đặt lại</span>
              </button>
            </div>
          </div>

          {/* STOCK MOVEMENTS TABLE */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-label-sm uppercase tracking-wider text-outline select-none">
                    <th className="py-3 px-4 font-semibold" scope="col">Mã GD &amp; Thời gian</th>
                    <th className="py-3 px-3 font-semibold" scope="col">Sản phẩm &amp; SKU</th>
                    <th className="py-3 px-3 font-semibold text-center" scope="col">Loại biến động</th>
                    <th className="py-3 px-3 font-semibold text-right" scope="col">Biến động</th>
                    <th className="py-3 px-3 font-semibold text-right" scope="col">Tồn sau GD</th>
                    <th className="py-3 px-3 font-semibold" scope="col">Lý do / Tham chiếu</th>
                    <th className="py-3 px-3 font-semibold" scope="col">Người thực hiện</th>
                    <th className="py-3 px-4 font-semibold" scope="col">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md">
                  {paginatedMovements.length === 0 ? (
                    <EmptyTableRow colSpan={8} message="Không có bản ghi biến động thẻ kho phù hợp." />
                  ) : null}
                  {paginatedMovements.map((m) => {
                    const isPositive = m.quantityChange > 0
                    return (
                      <tr key={m.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-bold text-on-surface">{m.id}</span>
                            <span className="text-[11px] text-outline mt-0.5">{m.createdAt}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-title-md text-title-md font-semibold text-on-surface">{m.productName}</span>
                            <span className="font-mono text-[11px] text-outline">{m.sku}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              m.movementType === 'STOCK_IN'
                                ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                                : m.movementType === 'SALE'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                m.movementType === 'STOCK_IN'
                                  ? 'bg-[#16A34A]'
                                  : m.movementType === 'SALE'
                                  ? 'bg-blue-600'
                                  : 'bg-purple-600'
                              }`}
                            ></span>
                            {m.movementType === 'STOCK_IN'
                              ? 'Nhập hàng'
                              : m.movementType === 'SALE'
                              ? 'Bán hàng'
                              : 'Điều chỉnh kiểm kê'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`font-semibold tabular-nums ${
                              isPositive ? 'text-emerald-700 font-bold' : 'text-on-surface'
                            }`}
                          >
                            {isPositive ? `+${m.quantityChange}` : m.quantityChange} {m.unit}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-mono text-sm font-bold text-on-surface tabular-nums">
                            {m.balanceAfter} <span className="font-normal text-xs text-outline">{m.unit}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            {m.reason ? (
                              <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 w-fit">
                                {m.reason}
                              </span>
                            ) : null}
                            {m.referenceId ? (
                              <span className="font-mono text-xs text-on-surface-variant font-medium">
                                Ref: {m.referenceId}
                              </span>
                            ) : (
                              <span className="text-xs text-outline">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-xs text-on-surface font-medium">
                          {m.createdBy}
                        </td>
                        <td className="py-3 px-4 text-xs text-outline max-w-[240px] truncate" title={m.note}>
                          {m.note || '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={ledgerPage}
              totalPages={ledgerTotalPages}
              startIndex={ledgerStartIndex}
              endIndex={ledgerEndIndex}
              totalCount={ledgerTotalCount}
              unitLabel="giao dịch thẻ kho"
              goPrev={ledgerGoPrev}
              goNext={ledgerGoNext}
              setPage={setLedgerPage}
            />
          </div>
        </div>
      )}

      {/* DETAIL MODAL: CHI TIẾT THẺ KHO */}
      <DetailModal open={selectedItem !== null} onClose={() => setSelectedId(null)}>
        {selectedItem ? (
          <div className="p-space-md space-y-3">
            <div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">{selectedItem.name}</h3>
              <p className="text-body-sm text-outline mt-0.5">{selectedItem.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[12px] text-on-surface-variant font-medium px-2 py-0.5 bg-surface-container-low rounded">{selectedItem.sku}</span>
              <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant">{selectedItem.categoryLabel}</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${selectedItem.stockClassName}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedItem.stockDotClassName}`}></span>
                {selectedItem.stockLabel}
              </span>
            </div>
            <div className="pt-2 border-t border-outline-variant">
              <div className="flex items-center justify-between text-body-sm text-outline mb-1">
                <span>Số lượng</span>
                <span className="font-semibold text-on-surface tabular-nums">{selectedItem.stockQuantity}</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${selectedItem.stockBarClassName}`} style={{ width: selectedItem.stockBarWidth }}></div>
              </div>
            </div>
            <div className="text-body-sm text-on-surface-variant">
              Cập nhật gần nhất: <strong className="text-on-surface">{selectedItem.updatedAgo}</strong> bởi {selectedItem.updatedBy}
            </div>
            <div className="pt-3 border-t border-outline-variant flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const item = selectedItem
                  setSelectedId(null)
                  setAdjustItem(item)
                  setAdjustChangeType('decrease')
                  setAdjustAmount('1')
                  setAdjustReason('DAMAGED')
                  setAdjustNote('')
                  setAdjustOpen(true)
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold hover:bg-amber-100"
              >
                Điều chỉnh kho mặt hàng này
              </button>
            </div>
          </div>
        ) : null}
      </DetailModal>

      {/* MODAL: NHẬP KHO */}
      <FormModal
        open={restockOpen}
        onClose={() => setRestockOpen(false)}
        title="Nhập kho vật tư Hai Thắng"
        fields={restockFields}
        values={restockForm}
        onChange={updateRestockForm}
        onSubmit={handleConfirmRestock}
        submitLabel="Xác nhận nhập kho"
      />

      {/* MODAL: ĐIỀU CHỈNH KHO KIỂM KÊ (WF-05 AUDITABLE ADJUSTMENT) */}
      {adjustOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </div>
                <div>
                  <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Điều chỉnh tồn kho kiểm kê</h3>
                  <p className="text-xs text-outline">Ghi nhận biến động thẻ kho lưu vết kiểm toán</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdjustOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase text-outline mb-1.5">
                  Sản phẩm điều chỉnh <span className="text-error">*</span>
                </label>
                <select
                  value={adjustItem?.id ?? inventoryItems[0]?.id ?? ''}
                  onChange={(e) => {
                    const found = inventoryItems.find((i) => i.id === e.target.value) ?? null
                    setAdjustItem(found)
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.sku}) - Hiện tồn: {item.stockQuantity}
                    </option>
                  ))}
                </select>
                {adjustItem && (
                  <p className="mt-1 text-xs text-outline">
                    Hiện tại kho ghi nhận: <strong className="text-on-surface">{adjustItem.stockQuantity}</strong>
                  </p>
                )}
              </div>

              {/* Adjustment Direction */}
              <div>
                <label className="block text-xs font-semibold uppercase text-outline mb-1.5">
                  Hình thức điều chỉnh <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustChangeType('decrease')}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                      adjustChangeType === 'decrease'
                        ? 'border-error bg-error-container/40 text-error'
                        : 'border-outline-variant bg-surface-container-lowest text-outline hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                    <span>Giảm tồn (Hao hụt/Hỏng)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustChangeType('increase')}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                      adjustChangeType === 'increase'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-outline-variant bg-surface-container-lowest text-outline hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>Tăng tồn (Dôi dư kiểm đếm)</span>
                  </button>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-xs font-semibold uppercase text-outline mb-1.5">
                  Số lượng thay đổi <span className="text-error">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="Nhập số lượng"
                    className="flex-1 px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:border-primary focus:ring-1 focus:ring-primary font-semibold"
                  />
                  <span className="text-xs font-semibold text-outline px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant">
                    {adjustItem?.stockQuantity.replace(/^[0-9.,\s]+/, '').trim() || 'đơn vị'}
                  </span>
                </div>
              </div>

              {/* Mandatory Reason Select (WF-05 / ERD physical specification) */}
              <div>
                <label className="block text-xs font-semibold uppercase text-outline mb-1.5">
                  Lý do kiểm kê bắt buộc (Audit Reason) <span className="text-error">*</span>
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value as StockAdjustmentReason)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {ADJUST_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-outline">
                  {ADJUST_REASONS.find((r) => r.value === adjustReason)?.desc}
                </p>
              </div>

              {/* Note / Audit Trail */}
              <div>
                <label className="block text-xs font-semibold uppercase text-outline mb-1.5">
                  Ghi chú biên bản kiểm kê / Vị trí bao bì
                </label>
                <textarea
                  rows={2}
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Ví dụ: Rách vỏ do vận chuyển ghe từ Cần Thơ, biên bản kiểm đếm BB-042..."
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* Calculation Preview Banner */}
              {adjustItem && (
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-between text-xs">
                  <span className="text-outline">Dự tính tồn mới sau ghi sổ:</span>
                  <span className="font-bold text-on-surface font-mono text-sm">
                    {Math.max(
                      0,
                      (Number.parseInt(adjustItem.stockQuantity, 10) || 0) +
                        (adjustChangeType === 'decrease'
                          ? -(Number.parseInt(adjustAmount, 10) || 0)
                          : Number.parseInt(adjustAmount, 10) || 0),
                    )}{' '}
                    {adjustItem.stockQuantity.replace(/^[0-9.,\s]+/, '').trim()}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAdjustOpen(false)}
                className="px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container text-body-sm font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmAdjust}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-[#17482D] text-on-primary text-body-sm font-bold transition-colors shadow-sm"
              >
                Xác nhận điều chỉnh &amp; Ghi sổ thẻ kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
