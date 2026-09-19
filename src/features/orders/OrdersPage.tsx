import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageHeader } from '../../context/PageHeaderContext'
import { useToast } from '../../context/ToastContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import EmptyTableRow from '../../components/ui/EmptyTableRow'
import DetailModal from '../../components/ui/DetailModal'
import FormModal, { type FormFieldSpec } from '../../components/ui/FormModal'
import Pagination from '../../components/ui/Pagination'
import SearchInput from '../../components/ui/SearchInput'
import FilterSelect from '../../components/ui/FilterSelect'
import StatusBadge from '../../components/ui/StatusBadge'
import { useSelectableList } from '../../hooks/useSelectableList'
import { useFilteredList } from '../../hooks/useFilteredList'
import { usePagination } from '../../hooks/usePagination'
import { useFormValues } from '../../hooks/useFormValues'
import { orders as INITIAL_ORDERS } from '../../data/mockOrders'
import { parseVnd, formatVnd } from '../../utils/money'
import { downloadCsv } from '../../utils/csv'
import type { Order, OrderStatus } from '../../types'

const STATUS_OPTIONS = ['Tất cả trạng thái', 'Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy']
const PAYMENT_OPTIONS = ['Tất cả thanh toán', 'VietQR (Đã TT)', 'Chuyển khoản', 'Tiền mặt tại kho', 'Cọc 50%', 'Gối nợ vụ mùa']

const STATUS_VISUALS: Record<OrderStatus, { className: string; panelClassName: string }> = {
  'Chờ xác nhận': { className: 'bg-amber-100 text-amber-800 border-amber-300', panelClassName: 'bg-amber-100 text-amber-800' },
  'Đã xác nhận': { className: 'bg-sky-100 text-sky-800 border-sky-300', panelClassName: 'bg-sky-100 text-sky-800' },
  'Đang xử lý': { className: 'bg-indigo-100 text-indigo-800 border-indigo-300', panelClassName: 'bg-indigo-100 text-indigo-800' },
  'Đang giao': { className: 'bg-blue-100 text-blue-800 border-blue-300', panelClassName: 'bg-blue-100 text-blue-800' },
  'Hoàn thành': { className: 'bg-emerald-100 text-emerald-800 border-emerald-300', panelClassName: 'bg-emerald-100 text-emerald-800' },
  'Đã hủy': { className: 'bg-slate-100 text-slate-800 border-slate-300', panelClassName: 'bg-slate-100 text-slate-800' },
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  'Chờ xác nhận': 'Đã xác nhận',
  'Đã xác nhận': 'Đang xử lý',
  'Đang xử lý': 'Đang giao',
  'Đang giao': 'Hoàn thành',
}

const emptyOrderForm = {
  customerName: '',
  phone: '',
  shortLocation: '',
  wardAddress: '',
  productTitle: '',
  quantity: '',
  unitPrice: '',
}

const CREATE_ORDER_FIELDS: FormFieldSpec[] = [
  { key: 'customerName', label: 'Tên khách hàng' },
  { key: 'phone', label: 'Số điện thoại' },
  { key: 'shortLocation', label: 'Địa chỉ ngắn gọn (VD: Thới Lai)' },
  { key: 'wardAddress', label: 'Địa chỉ đầy đủ (Xã/Huyện/Tỉnh)' },
  { key: 'productTitle', label: 'Sản phẩm' },
  { key: 'quantity', label: 'Số lượng', type: 'number', min: '1', group: 'qtyPrice' },
  { key: 'unitPrice', label: 'Đơn giá (₫)', placeholder: 'VD: 685.000', group: 'qtyPrice' },
]

export default function OrdersPage() {
  usePageHeader({
    title: 'Quản lý đơn hàng',
  })

  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const { showToast } = useToast()
  const itemsTotalLabel = 'Tổng thanh toán'

  const setOrderStatus = (id: string, label: OrderStatus) => {
    const visuals = STATUS_VISUALS[label]
    if (!visuals) return
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              status: label,
              statusBadge: { label, className: visuals.className, pulse: false },
              panelBadge: { label, className: visuals.panelClassName },
              rowAttentionClassName: undefined,
              idClassName: 'text-on-surface',
            }
          : order,
      ),
    )
    showToast(`Đã cập nhật đơn #${id} sang "${label}"`)
  }

  const advanceOrderStatus = (id: string) => {
    const order = orders.find((o) => o.id === id)
    const next = order && NEXT_STATUS[order.status]
    if (next) setOrderStatus(id, next)
  }

  const handleOrderAction = (id: string, label: string) => {
    if (label === 'Duyệt đơn') setOrderStatus(id, 'Đã xác nhận')
    else if (label === 'Xác nhận') setOrderStatus(id, 'Đang giao')
    else if (label === 'Cập nhật') advanceOrderStatus(id)
    else if (label === 'Xem') setSelectedId(id)
    else showToast(`Đã thực hiện "${label}" cho đơn #${id}`)
  }

  const [createOpen, setCreateOpen] = useState(false)
  const { values: createForm, update: updateCreateForm, reset: resetCreateForm } = useFormValues(emptyOrderForm)

  const handleCreateOrder = () => {
    const { customerName, phone, shortLocation, wardAddress, productTitle, quantity, unitPrice } = createForm
    const qty = Number.parseInt(quantity, 10)
    const price = parseVnd(unitPrice)
    if (!customerName.trim() || !phone.trim() || !shortLocation.trim() || !wardAddress.trim() || !productTitle.trim() || Number.isNaN(qty) || qty <= 0 || price <= 0) {
      showToast('Vui lòng nhập đầy đủ thông tin đơn hàng')
      return
    }
    const maxNum = orders.reduce((max, o) => {
      const n = Number.parseInt(o.id.split('-').pop() ?? '0', 10)
      return Number.isNaN(n) ? max : Math.max(max, n)
    }, 0)
    const total = qty * price
    const newOrder: Order = {
      id: `DH-2024-${maxNum + 1}`,
      customerName: customerName.trim(),
      phone: phone.trim(),
      shortLocation: shortLocation.trim(),
      fullAddress: shortLocation.trim(),
      wardAddress: wardAddress.trim(),
      timeRest: 'Vừa tạo',
      createdAgo: 'Vừa tạo',
      productLine: productTitle.trim(),
      productTitle: productTitle.trim(),
      productNote: `Số lượng: ${qty}`,
      items: [{ name: productTitle.trim(), qtyPrice: `${qty} x ${formatVnd(price)}`, total: formatVnd(total) }],
      total: formatVnd(total),
      paymentMethod: 'Gối nợ vụ mùa',
      paymentBadge: { label: 'Gối nợ vụ mùa', className: 'bg-slate-100 text-slate-800 border-slate-300' },
      status: 'Chờ xác nhận',
      statusBadge: { label: 'Chờ xác nhận', className: STATUS_VISUALS['Chờ xác nhận'].className, pulse: true },
      shippingIcon: 'local_shipping',
      shippingIconClassName: 'text-outline',
      shippingLabel: 'Chưa xếp chuyến',
      idClassName: 'text-on-surface',
      panelBadge: { label: 'Chờ xác nhận', className: STATUS_VISUALS['Chờ xác nhận'].panelClassName },
      paymentFooterNote: 'Chưa thanh toán',
      paymentFooterClassName: 'text-outline',
      actions: [
        { label: 'Xem', icon: 'visibility' },
        { label: 'Duyệt đơn', icon: 'check_circle', tone: 'primary' },
      ],
    }
    setOrders((prev) => [newOrder, ...prev])
    showToast(`Đã tạo đơn hàng ${newOrder.id}`)
    resetCreateForm()
    setCreateOpen(false)
  }

  const handleExportOrders = () => {
    downloadCsv(
      // oxlint-disable-next-line react/purity -- only invoked from a click handler, never during render
      `don-hang-${Date.now()}.csv`,
      filteredOrders.map((o) => ({
        'Mã đơn': o.id,
        'Khách hàng': o.customerName,
        'SĐT': o.phone,
        'Địa chỉ': o.wardAddress,
        'Sản phẩm': o.productTitle,
        'Tổng tiền': o.total,
        'Thanh toán': o.paymentBadge.label,
        'Trạng thái': o.statusBadge.label,
      })),
    )
    showToast(`Đã xuất Excel ${filteredOrders.length} đơn hàng`)
  }

  const handlePrintOrders = () => {
    showToast(`Đang in phiếu xuất hàng loạt cho ${filteredOrders.length} đơn hàng`)
    window.print()
  }

  const { selectedId, setSelectedId, selected: selectedOrder } = useSelectableList(orders, (o) => o.id)

  const [paymentFilter, setPaymentFilter] = useState(PAYMENT_OPTIONS[0])

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filtered: filteredOrders,
    clearFilters: handleClearFiltersBase,
  } = useFilteredList(
    orders,
    STATUS_OPTIONS[0],
    (order, keyword, status) =>
      (!keyword ||
        order.id.toLowerCase().includes(keyword) ||
        order.customerName.toLowerCase().includes(keyword) ||
        order.phone.toLowerCase().includes(keyword)) &&
      (status === STATUS_OPTIONS[0] || order.statusBadge.label === status) &&
      (paymentFilter === PAYMENT_OPTIONS[0] || order.paymentBadge.label === paymentFilter),
  )

  const handleClearFilters = () => {
    handleClearFiltersBase()
    setPaymentFilter(PAYMENT_OPTIONS[0])
  }

  const { page, totalPages, paginated: paginatedOrders, startIndex, endIndex, totalCount, goPrev, goNext, setPage } =
    usePagination(filteredOrders, 10)

  const totalOrdersToday = orders.length
  const totalOrderValue = orders.reduce((sum, o) => sum + parseVnd(o.total), 0)
  const waitingCount = orders.filter((o) => o.statusBadge.label === 'Chờ xác nhận').length
  const processingCount = orders.filter((o) => o.statusBadge.label === 'Đang xử lý').length
  const deliveringCount = orders.filter((o) => o.statusBadge.label === 'Đang giao').length
  const completedCount = orders.filter((o) => o.statusBadge.label === 'Hoàn thành').length

  const getOrderProductSummary = (order: Order) => {
    if (order.items && order.items.length > 0) {
      const firstName = order.items[0].name.split('(')[0].replace(/^(Phân bón|Thuốc trừ cỏ|Thuốc trừ sâu|Lúa giống)\s+/i, '').trim()
      const extraCount = order.items.length - 1
      return { firstName, extraCount }
    }
    const title = order.productTitle.split(',')[0].split('(')[0].trim()
    return { firstName: title, extraCount: 0 }
  }

  return (
    <>
      {/* PAGE TITLE & ACTIONS ZONE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <nav className="flex items-center gap-1 text-[12px] text-outline" aria-label="Breadcrumb">
          <Link className="hover:text-on-surface" to="/">Bảng điều khiển</Link>
          <span className="material-symbols-outlined text-xs" data-icon="chevron_right">chevron_right</span>
          <span className="text-primary font-medium">Quản lý đơn hàng</span>
        </nav>
        <div className="flex items-center gap-space-xs flex-wrap">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded-xl hover:bg-surface-container-low transition-colors shadow-sm"
            type="button"
            onClick={handleExportOrders}
          >
            <span className="material-symbols-outlined text-[18px] text-outline" data-icon="table_view">table_view</span>
            <span>Xuất Excel</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded-xl hover:bg-surface-container-low transition-colors shadow-sm"
            type="button"
            onClick={handlePrintOrders}
          >
            <span className="material-symbols-outlined text-[18px] text-outline" data-icon="print">print</span>
            <span>In phiếu xuất</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E5E3A] hover:bg-[#17482D] text-white font-title-md text-title-md rounded-xl transition-colors shadow-sm"
            type="button"
            onClick={() => setCreateOpen(true)}
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
            <span>Tạo đơn hàng</span>
          </button>
        </div>
      </div>

      {/* COMPACT OPERATIONAL SUMMARY (2 High-Value Blocks) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* Block 1: Cần xử lý xuất kho (Action-Oriented Queue) */}
        <div className="bg-amber-50/40 border border-amber-300 rounded-xl p-space-md shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-label-md">
              <span className="material-symbols-outlined text-[18px] text-amber-700">pending_actions</span>
              <span>Cần xử lý xuất kho</span>
              <span className="px-2 py-0.2 rounded-full text-[11px] font-bold bg-amber-200/80 text-amber-900">
                {waitingCount + processingCount} đơn
              </span>
            </div>
            <div className="text-xs text-amber-800">
              {waitingCount > 0 ? `${waitingCount} đơn chờ duyệt xuất kho` : 'Đã duyệt tất cả'} • {processingCount} đơn đang soạn hàng
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('Chờ xác nhận')}
            className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200/80 text-amber-900 font-medium text-xs border border-amber-300 transition-colors"
          >
            Lọc đơn chờ →
          </button>
        </div>

        {/* Block 2: Đang giao & Hoàn thành (Routine Statistics) */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-on-surface font-semibold text-label-md">
              <span className="material-symbols-outlined text-[18px] text-emerald-700">local_shipping</span>
              <span>Đang vận chuyển & Hoàn tất</span>
              <span className="px-2 py-0.2 rounded-full text-[11px] font-medium bg-surface-container text-outline">
                {deliveringCount + completedCount} đơn
              </span>
            </div>
            <div className="text-xs text-outline">
              {deliveringCount} đang trên đường giao • {completedCount} hoàn thành • Tổng: {formatVnd(totalOrderValue)}
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">
            {totalOrdersToday} tổng đơn
          </span>
        </div>
      </div>

      {/* FILTER BAR WITH 1-CLICK STATUS PILLS */}
      <div className="bg-surface-container-lowest border border-outline-variant p-3.5 rounded-xl shadow-sm space-y-3">
        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-label-md font-label-md">
          <span className="text-outline text-[12px] whitespace-nowrap mr-1">Trạng thái:</span>
          <button
            type="button"
            onClick={() => setStatusFilter(STATUS_OPTIONS[0])}
            className={`px-3 py-1.5 rounded-lg border text-[13px] font-medium transition-colors whitespace-nowrap ${
              statusFilter === STATUS_OPTIONS[0]
                ? 'bg-[#1E5E3A] text-white border-[#1E5E3A] shadow-sm'
                : 'bg-surface-container-low text-on-surface border-outline-variant/60 hover:bg-surface-container'
            }`}
          >
            Tất cả ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Chờ xác nhận')}
            className={`px-3 py-1.5 rounded-lg border text-[13px] font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'Chờ xác nhận'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/70'
            }`}
          >
            <span>Chờ xác nhận</span>
            <span className="px-1.5 py-0.2 bg-amber-200/80 text-amber-900 text-[11px] rounded-full font-bold">
              {waitingCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Đang xử lý')}
            className={`px-3 py-1.5 rounded-lg border text-[13px] font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'Đang xử lý'
                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                : 'bg-surface-container-low text-on-surface border-outline-variant/60 hover:bg-surface-container'
            }`}
          >
            Đang xử lý ({processingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Đang giao')}
            className={`px-3 py-1.5 rounded-lg border text-[13px] font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'Đang giao'
                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                : 'bg-surface-container-low text-on-surface border-outline-variant/60 hover:bg-surface-container'
            }`}
          >
            Đang giao ({deliveringCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Hoàn thành')}
            className={`px-3 py-1.5 rounded-lg border text-[13px] font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'Hoàn thành'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                : 'bg-surface-container-low text-on-surface border-outline-variant/60 hover:bg-surface-container'
            }`}
          >
            Hoàn thành ({completedCount})
          </button>
        </div>

        {/* Inputs & Dropdowns */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-outline-variant/40">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm mã đơn, khách hàng, SĐT..."
            className="relative flex-1 min-w-[260px]"
          />
          <div className="flex items-center gap-2.5 flex-wrap">
            <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
            <FilterSelect value={paymentFilter} onChange={setPaymentFilter} options={PAYMENT_OPTIONS} />
            <button
              className="flex items-center gap-1 px-3 py-1.5 text-outline hover:text-on-surface hover:bg-surface-container-low rounded-xl font-label-md text-label-md transition-colors"
              type="button"
              onClick={handleClearFilters}
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN TABLE (7 Columns Scannable) */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-space-md py-3 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-title-md text-title-md font-semibold text-on-surface">Danh sách đơn xuất kho trạm</span>
            <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">{filteredOrders.length} đơn</span>
          </div>
          <button
            className="p-1 hover:bg-surface-container rounded-lg text-outline hover:text-on-surface transition-colors"
            title="Làm mới bảng"
            type="button"
            onClick={() => showToast('Đã làm mới danh sách đơn hàng')}
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="refresh">refresh</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant text-[11px] font-semibold text-outline uppercase tracking-wider">
                <th className="py-2.5 px-space-md">MÃ ĐƠN &amp; GIỜ</th>
                <th className="py-2.5 px-space-md">KHÁCH HÀNG</th>
                <th className="py-2.5 px-space-md">SẢN PHẨM</th>
                <th className="py-2.5 px-space-md text-right">TỔNG TIỀN</th>
                <th className="py-2.5 px-space-md text-center">THANH TOÁN</th>
                <th className="py-2.5 px-space-md text-center">TRẠNG THÁI</th>
                <th className="py-2.5 px-space-md text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
              {filteredOrders.length === 0 ? (
                <EmptyTableRow colSpan={7} message="Không tìm thấy đơn hàng phù hợp với bộ lọc." />
              ) : null}
              {paginatedOrders.map((order) => {
                const isSelected = order.id === selectedId
                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedId(order.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-primary-container'
                        : `hover:bg-surface-container-low ${order.rowAttentionClassName ?? ''}`
                    }`}
                  >
                    <td className="py-3 px-space-md whitespace-nowrap">
                      <div className={`font-semibold font-mono ${isSelected ? 'text-primary' : order.idClassName}`}>
                        #{order.id}
                      </div>
                      <div className="text-[11px] font-mono text-outline">
                        {order.timeBold ? `${order.timeBold} ` : ''}{order.timeRest}
                      </div>
                    </td>
                    <td className="py-3 px-space-md">
                      <div className="font-medium text-on-surface">{order.customerName}</div>
                      <div className="text-[11px] text-outline truncate max-w-[160px]">{order.shortLocation}</div>
                    </td>
                    <td className="py-3 px-space-md max-w-[220px]">
                      {(() => {
                        const { firstName, extraCount } = getOrderProductSummary(order)
                        return (
                          <div className="flex flex-col">
                            <span className="font-medium text-on-surface truncate" title={order.productTitle}>
                              {firstName}
                            </span>
                            {extraCount > 0 && (
                              <span className="text-[11px] text-outline font-medium">
                                + {extraCount} sản phẩm
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </td>
                    <td className="py-3 px-space-md text-right font-mono font-semibold text-on-surface whitespace-nowrap">
                      {order.total}
                    </td>
                    <td className="py-3 px-space-md text-center whitespace-nowrap">
                      <StatusBadge label={order.paymentBadge.label} className={order.paymentBadge.className} />
                    </td>
                    <td className="py-3 px-space-md text-center whitespace-nowrap">
                      <StatusBadge label={order.statusBadge.label} className={order.statusBadge.className} />
                    </td>
                    <td className="py-3 px-space-md text-center whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <RowActionsMenu
                          triggerLabel={`Thao tác đơn #${order.id}`}
                          actions={order.actions.map((action) => ({
                            ...action,
                            onClick: () => handleOrderAction(order.id, action.label),
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
          totalCount={totalCount}
          unitLabel="đơn hàng"
          goPrev={goPrev}
          goNext={goNext}
          setPage={setPage}
        />
      </div>

      {/* DETAIL MODAL: CHI TIẾT ĐƠN HÀNG */}
      <DetailModal open={selectedOrder !== null} onClose={() => setSelectedId(null)}>
        {selectedOrder ? (
          <>
            <div className="p-space-sm bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-sm text-primary">#{selectedOrder.id}</span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold ${selectedOrder.panelBadge.className}`}>
                    {selectedOrder.panelBadge.label}
                  </span>
                </div>
                <div className="text-[11px] text-outline mt-0.5">{selectedOrder.createdAgo}</div>
              </div>
            </div>
            <div className="p-space-sm space-y-space-xs border-b border-outline-variant">
              <div>
                <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider block">Khách hàng đặt</span>
                <div className="font-title-md text-sm text-on-surface font-semibold mt-0.5">{selectedOrder.customerName}</div>
                <div className="text-xs text-outline flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-xs text-primary" data-icon="call">call</span>
                  <span className="font-mono font-medium text-on-surface">{selectedOrder.phone}</span>
                  <span className="text-outline/70">| {selectedOrder.fullAddress}</span>
                </div>
                <div className="text-xs text-outline mt-0.5">{selectedOrder.wardAddress}</div>
              </div>
              {selectedOrder.deliveryNote ? (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded p-2 text-xs text-amber-900 mt-2">
                  <div className="flex items-start gap-1">
                    <span className="material-symbols-outlined text-sm text-amber-700 shrink-0 mt-0.5" data-icon="pin_drop">pin_drop</span>
                    <div>
                      <span className="font-semibold">Ghi chú giao hàng:</span> {selectedOrder.deliveryNote}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="p-space-sm space-y-space-xs border-b border-outline-variant">
              <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider block">Danh sách vật tư xuất</span>
              <div className="space-y-2 pt-1 text-xs">
                {selectedOrder.items.map((item) => (
                  <div key={item.name} className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-on-surface">{item.name}</p>
                      <p className="text-[11px] text-outline font-mono">{item.qtyPrice}</p>
                    </div>
                    <span className="font-mono font-semibold text-on-surface">{item.total}</span>
                  </div>
                ))}
                {selectedOrder.feeLine ? (
                  <div className="flex items-start justify-between text-outline pt-1 border-t border-dashed border-outline-variant">
                    <span>{selectedOrder.feeLine.label}</span>
                    <span className="font-mono font-medium text-on-surface">{selectedOrder.feeLine.value}</span>
                  </div>
                ) : null}
              </div>
              <div className="pt-2 mt-2 border-t border-outline-variant flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-on-surface uppercase">{itemsTotalLabel}</span>
                  <div className={`text-[11px] font-medium flex items-center gap-1 ${selectedOrder.paymentFooterClassName}`}>
                    <span className="material-symbols-outlined text-xs" data-icon="verified">verified</span>
                    {selectedOrder.paymentFooterNote}
                  </div>
                </div>
                <span className="font-mono text-base font-bold text-primary">{selectedOrder.total}</span>
              </div>
            </div>
            <div className="p-space-sm bg-surface-container-low space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="flex items-center justify-center gap-1 px-2 py-2 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface rounded text-xs font-medium transition-colors"
                  type="button"
                  onClick={() => {
                    showToast(`Đang in phiếu giao hàng cho đơn #${selectedOrder.id}`)
                    window.print()
                  }}
                >
                  <span className="material-symbols-outlined text-sm" data-icon="print">print</span>
                  <span>In phiếu giao hàng</span>
                </button>
                <button
                  className="flex items-center justify-center gap-1 px-2 py-2 bg-primary-container text-on-primary hover:bg-primary rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                  disabled={!NEXT_STATUS[selectedOrder.status]}
                  onClick={() => advanceOrderStatus(selectedOrder.id)}
                >
                  <span className="material-symbols-outlined text-sm" data-icon="update">update</span>
                  <span>
                    {NEXT_STATUS[selectedOrder.status]
                      ? `Chuyển sang "${NEXT_STATUS[selectedOrder.status]}"`
                      : 'Đã hoàn thành'}
                  </span>
                </button>
              </div>
              <button
                className="w-full flex items-center justify-center gap-1 px-2 py-1.5 border border-outline-variant hover:bg-surface-container-lowest text-outline hover:text-on-surface rounded text-xs transition-colors"
                type="button"
                onClick={() => showToast(`Đã gửi SMS cập nhật cho ${selectedOrder.customerName}`)}
              >
                <span className="material-symbols-outlined text-sm" data-icon="sms">sms</span>
                <span>Gửi tin nhắn SMS cập nhật cho nông dân</span>
              </button>
            </div>
          </>
        ) : null}
      </DetailModal>

      {/* MODAL: TẠO ĐƠN HÀNG MỚI */}
      <FormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tạo đơn hàng mới"
        fields={CREATE_ORDER_FIELDS}
        values={createForm}
        onChange={updateCreateForm}
        onSubmit={handleCreateOrder}
        submitLabel="Tạo đơn hàng"
      />
    </>
  )
}
