import { useState } from 'react'
import { usePageHeader } from '../../context/PageHeaderContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import EmptyTableRow from '../../components/ui/EmptyTableRow'
import { useSelectableList } from '../../hooks/useSelectableList'
import { useFilteredList } from '../../hooks/useFilteredList'
import { orders as INITIAL_ORDERS } from '../../data/mockOrders'

const STATUS_OPTIONS = ['Tất cả trạng thái', 'Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy']

const STATUS_VISUALS: Record<string, { className: string; panelClassName: string }> = {
  'Chờ xác nhận': { className: 'bg-amber-100 text-amber-800 border-amber-300', panelClassName: 'bg-amber-100 text-amber-800' },
  'Đã xác nhận': { className: 'bg-sky-100 text-sky-800 border-sky-300', panelClassName: 'bg-sky-100 text-sky-800' },
  'Đang xử lý': { className: 'bg-indigo-100 text-indigo-800 border-indigo-300', panelClassName: 'bg-indigo-100 text-indigo-800' },
  'Đang giao': { className: 'bg-blue-100 text-blue-800 border-blue-300', panelClassName: 'bg-blue-100 text-blue-800' },
  'Hoàn thành': { className: 'bg-emerald-100 text-emerald-800 border-emerald-300', panelClassName: 'bg-emerald-100 text-emerald-800' },
}

const NEXT_STATUS: Record<string, string> = {
  'Chờ xác nhận': 'Đã xác nhận',
  'Đã xác nhận': 'Đang xử lý',
  'Đang xử lý': 'Đang giao',
  'Đang giao': 'Hoàn thành',
}

export default function OrdersPage() {
  usePageHeader({
    title: 'Quản lý đơn hàng',
    badge: 'Trực tiếp trạm Cần Thơ #04',
    subtitle: 'Theo dõi và xử lý đơn hàng của Cán bộ Thôn #04 - Mekong',
  })

  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const itemsTotalLabel = 'Tổng thanh toán'

  const setOrderStatus = (id: string, label: string) => {
    const visuals = STATUS_VISUALS[label]
    if (!visuals) return
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              statusBadge: { label, className: visuals.className, pulse: false },
              panelBadge: { label, className: visuals.panelClassName },
              rowAttentionClassName: undefined,
              idClassName: 'text-on-surface',
            }
          : order,
      ),
    )
  }

  const advanceOrderStatus = (id: string) => {
    const order = orders.find((o) => o.id === id)
    const next = order && NEXT_STATUS[order.statusBadge.label]
    if (next) setOrderStatus(id, next)
  }

  const handleOrderAction = (id: string, label: string) => {
    if (label === 'Duyệt đơn') setOrderStatus(id, 'Đã xác nhận')
    else if (label === 'Xác nhận') setOrderStatus(id, 'Đang giao')
    else if (label === 'Cập nhật') advanceOrderStatus(id)
  }

  const { selectedId, setSelectedId, selected: selectedOrder } = useSelectableList(orders, (o) => o.id)

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filtered: filteredOrders,
    clearFilters: handleClearFilters,
  } = useFilteredList(
    orders,
    STATUS_OPTIONS[0],
    (order, keyword, status) =>
      (!keyword ||
        order.id.toLowerCase().includes(keyword) ||
        order.customerName.toLowerCase().includes(keyword) ||
        order.phone.toLowerCase().includes(keyword)) &&
      (status === STATUS_OPTIONS[0] || order.statusBadge.label === status),
  )

  return (
    <>
      {/* PAGE TITLE & ACTIONS ZONE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <nav className="flex items-center gap-1 text-[12px] text-outline" aria-label="Breadcrumb">
          <a className="hover:text-on-surface" href="#">Bảng điều khiển</a>
          <span className="material-symbols-outlined text-xs" data-icon="chevron_right">chevron_right</span>
          <span className="text-on-surface font-medium">Quản lý đơn hàng</span>
        </nav>
        <div className="flex items-center gap-space-xs flex-wrap">
          <button className="inline-flex items-center gap-1 px-space-sm py-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded hover:bg-surface-container-low transition-colors shadow-sm" type="button">
            <span className="material-symbols-outlined text-base text-outline" data-icon="table_view">table_view</span>
            <span>Xuất Excel</span>
          </button>
          <button className="inline-flex items-center gap-1 px-space-sm py-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded hover:bg-surface-container-low transition-colors shadow-sm" type="button">
            <span className="material-symbols-outlined text-base text-outline" data-icon="print">print</span>
            <span>In phiếu xuất hàng loạt</span>
          </button>
          <button className="inline-flex items-center gap-1 px-space-md py-2 bg-primary-container text-on-primary font-label-md text-label-md rounded hover:bg-primary transition-colors shadow-sm" type="button">
            <span className="material-symbols-outlined text-lg" data-icon="add">add</span><span>Tạo đơn hàng</span>
          </button>
        </div>
      </div>

      {/* SUMMARY KPI CARDS (5 compact cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-sm">
        {/* KPI 1: Đơn hàng hôm nay */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Đơn hàng hôm nay</span>
            <span className="material-symbols-outlined text-base text-primary" data-icon="receipt_long">receipt_long</span>
          </div>
          <div className="my-space-xs">
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-on-surface font-semibold">48</span>
              <span className="text-xs font-medium text-emerald-600">↑ 12% so với hôm qua</span>
            </div>
          </div>
          <div className="text-[12px] font-mono text-outline border-t border-outline-variant/60 pt-1">
            Tổng giá trị: <span className="font-semibold text-on-surface">184.650.000 ₫</span>
          </div>
        </div>
        {/* KPI 2: Chờ xác nhận */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-sm shadow-sm border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Chờ xác nhận</span>
            <span className="material-symbols-outlined text-base text-amber-600" data-icon="pending_actions">pending_actions</span>
          </div>
          <div className="my-space-xs">
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-amber-700 font-semibold">08</span>
              <span className="text-xs text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium">Ưu tiên cao</span>
            </div>
          </div>
          <div className="text-[12px] text-amber-700 border-t border-outline-variant/60 pt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs" data-icon="schedule">schedule</span>
            <span>Cần duyệt gấp trước 11:30</span>
          </div>
        </div>
        {/* KPI 3: Đang xử lý */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Đang xử lý</span>
            <span className="material-symbols-outlined text-base text-blue-600" data-icon="move_to_inbox">move_to_inbox</span>
          </div>
          <div className="my-space-xs">
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-on-surface font-semibold">14</span>
              <span className="text-xs text-outline">đang bốc hàng</span>
            </div>
          </div>
          <div className="text-[12px] text-outline border-t border-outline-variant/60 pt-1 truncate">
            Kho đang soạn hàng &amp; bốc xếp
          </div>
        </div>
        {/* KPI 4: Đang giao */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Đang giao</span>
            <span className="material-symbols-outlined text-base text-blue-700" data-icon="sailing">sailing</span>
          </div>
          <div className="my-space-xs">
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-on-surface font-semibold">12</span>
              <span className="text-xs text-blue-600 font-medium">8 ghe + 4 xe</span>
            </div>
          </div>
          <div className="text-[12px] text-outline border-t border-outline-variant/60 pt-1 truncate">
            Vận chuyển ghe xuồng &amp; xe lôi Mekong
          </div>
        </div>
        {/* KPI 5: Hoàn thành */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Hoàn thành</span>
            <span className="material-symbols-outlined text-base text-emerald-600" data-icon="check_circle">check_circle</span>
          </div>
          <div className="my-space-xs">
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-emerald-700 font-semibold">14</span>
              <span className="text-xs text-emerald-600 font-medium">100% đối soát</span>
            </div>
          </div>
          <div className="text-[12px] text-outline border-t border-outline-variant/60 pt-1 truncate">
            Đã ký nhận &amp; đối soát VietQR
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm flex-1 flex-wrap">
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-base" data-icon="search">search</span>
            <input
              className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-outline-variant rounded font-body-sm text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Tìm kiếm mã đơn, tên nông dân, SĐT..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="pl-2.5 pr-8 py-1.5 bg-surface-container-low border border-outline-variant rounded font-body-sm text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select className="pl-2.5 pr-8 py-1.5 bg-surface-container-low border border-outline-variant rounded font-body-sm text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Tất cả thanh toán</option>
              <option>Đã thanh toán</option>
              <option>Chưa thanh toán</option>
              <option>Thanh toán một phần</option>
            </select>
          </div>
          <div className="relative">
            <select className="pl-2.5 pr-8 py-1.5 bg-surface-container-low border border-outline-variant rounded font-body-sm text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Hôm nay - Vụ Thu Đông</option>
              <option>3 ngày gần đây</option>
              <option>Tuần này</option>
              <option>Toàn bộ vụ mùa 2024</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-space-xs">
          <button
            className="text-xs text-outline hover:text-error transition-colors flex items-center gap-1 px-2 py-1"
            type="button"
            onClick={handleClearFilters}
          >
            <span className="material-symbols-outlined text-sm" data-icon="filter_alt_off">filter_alt_off</span>
            <span>Xóa bộ lọc</span>
          </button>
        </div>
      </div>

      {/* MAIN SPLIT WORKSPACE: TABLE (70%) + DETAIL PREVIEW (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-stretch">
        {/* LEFT / MAIN TABLE */}
        <div className="lg:col-span-8 h-full bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden flex flex-col">
          <div className="px-space-md py-space-sm border-b border-outline-variant bg-surface-container-low/50 flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="font-title-md text-title-md text-on-surface">Danh sách đơn xuất kho trạm #04</span>
              <span className="text-xs font-mono bg-surface-container text-outline px-1.5 py-0.5 rounded">{filteredOrders.length} bản ghi</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <button className="p-1 hover:bg-surface-container rounded text-outline hover:text-on-surface" title="Làm mới bảng">
                <span className="material-symbols-outlined text-base" data-icon="refresh">refresh</span>
              </button>
              <button className="p-1 hover:bg-surface-container rounded text-outline hover:text-on-surface" title="Tùy biến cột">
                <span className="material-symbols-outlined text-base" data-icon="view_column">view_column</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-outline font-label-sm uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Mã đơn</th>
                  <th className="py-2.5 px-3 font-semibold">Khách hàng &amp; Xã</th>
                  <th className="py-2.5 px-3 font-semibold">Thời gian</th>
                  <th className="py-2.5 px-3 font-semibold">Sản phẩm chính</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Tổng tiền</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Thanh toán</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Trạng thái</th>
                  <th className="py-2.5 px-3 font-semibold">Vận chuyển</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 font-body-sm">
                {filteredOrders.length === 0 ? (
                  <EmptyTableRow colSpan={9} message="Không tìm thấy đơn hàng phù hợp với bộ lọc." />
                ) : null}
                {filteredOrders.map((order) => {
                  const isSelected = order.id === selectedId
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedId(order.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary'
                          : `hover:bg-surface-container-low ${order.rowAttentionClassName ?? ''}`
                      }`}
                    >
                      <td className={`py-3 px-3 font-mono font-semibold ${isSelected ? 'text-primary' : order.idClassName}`}>
                        {order.id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-on-surface">{order.customerName}</div>
                        <div className="text-[11px] text-outline">{order.phone} • {order.shortLocation}</div>
                      </td>
                      <td className="py-3 px-3 text-outline whitespace-nowrap">
                        {order.timeBold ? <span className="font-medium text-on-surface">{order.timeBold}</span> : null}
                        {order.timeBold ? ' ' : ''}
                        {order.timeRest}
                      </td>
                      <td className="py-3 px-3 max-w-[190px]">
                        <div className="truncate text-on-surface font-medium" title={order.productTitle}>
                          {order.productLine}
                        </div>
                        <span className="text-[11px] text-outline">{order.productNote}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-on-surface whitespace-nowrap">
                        {order.total}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${order.paymentBadge.className}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {order.paymentBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${order.statusBadge.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full bg-current ${order.statusBadge.pulse ? 'animate-pulse' : ''}`}></span>
                          {order.statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-outline text-[11px]">
                        <div className="flex items-center gap-1">
                          <span className={`material-symbols-outlined text-xs ${order.shippingIconClassName}`} data-icon={order.shippingIcon}>
                            {order.shippingIcon}
                          </span>
                          {order.shippingLabelTitle ? (
                            <span className="truncate max-w-[110px]" title={order.shippingLabelTitle}>
                              {order.shippingLabel}
                            </span>
                          ) : (
                            <span className={order.rowAttentionClassName ? 'italic' : ''}>{order.shippingLabel}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
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
          {/* Pagination Bar */}
          <div className="px-space-md py-space-sm bg-surface-container-low/50 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-space-sm text-xs">
            <div className="text-outline">
              Hiển thị <span className="font-medium text-on-surface">1 - 5</span> trong số <span className="font-medium text-on-surface">48</span> đơn hàng
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-1">
                <span className="text-outline">Số dòng:</span>
                <select className="py-0.5 px-2 bg-surface-container-lowest border border-outline-variant rounded text-xs focus:ring-1 focus:ring-primary">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded border border-outline-variant hover:bg-surface-container disabled:opacity-40" disabled>
                  <span className="material-symbols-outlined text-sm" data-icon="chevron_left">chevron_left</span>
                </button>
                <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-semibold">1</span>
                <button className="px-2 py-0.5 rounded hover:bg-surface-container">2</button>
                <button className="px-2 py-0.5 rounded hover:bg-surface-container">3</button>
                <span className="text-outline">...</span>
                <button className="px-2 py-0.5 rounded hover:bg-surface-container">5</button>
                <button className="p-1 rounded border border-outline-variant hover:bg-surface-container">
                  <span className="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE PANEL: PREVIEW CHI TIẾT ĐƠN HÀNG */}
        <div className="lg:col-span-4 space-y-space-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden">
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
              <button className="p-1 hover:bg-surface-container rounded text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-base" data-icon="open_in_new">open_in_new</span>
              </button>
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
                <button className="flex items-center justify-center gap-1 px-2 py-2 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface rounded text-xs font-medium transition-colors" type="button">
                  <span className="material-symbols-outlined text-sm" data-icon="print">print</span>
                  <span>In phiếu giao hàng</span>
                </button>
                <button
                  className="flex items-center justify-center gap-1 px-2 py-2 bg-primary-container text-on-primary hover:bg-primary rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                  disabled={!NEXT_STATUS[selectedOrder.statusBadge.label]}
                  onClick={() => advanceOrderStatus(selectedOrder.id)}
                >
                  <span className="material-symbols-outlined text-sm" data-icon="update">update</span>
                  <span>
                    {NEXT_STATUS[selectedOrder.statusBadge.label]
                      ? `Chuyển sang "${NEXT_STATUS[selectedOrder.statusBadge.label]}"`
                      : 'Đã hoàn thành'}
                  </span>
                </button>
              </div>
              <button className="w-full flex items-center justify-center gap-1 px-2 py-1.5 border border-outline-variant hover:bg-surface-container-lowest text-outline hover:text-on-surface rounded text-xs transition-colors" type="button">
                <span className="material-symbols-outlined text-sm" data-icon="sms">sms</span>
                <span>Gửi tin nhắn SMS cập nhật cho nông dân</span>
              </button>
            </div>
          </div>
          {/* Compact Recent Activity / Nhật ký xử lý trạm */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-sm shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
              <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-semibold">Nhật ký xử lý đơn trạm #04</span>
              <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Realtime
              </span>
            </div>
            <div className="mt-space-sm space-y-space-sm text-xs">
              <div className="flex items-start gap-2">
                <span className="font-mono text-[11px] text-outline shrink-0 mt-0.5">08:45</span>
                <div>
                  <p className="text-on-surface">Tài xế xe lôi <strong className="font-semibold">Nguyễn Văn Tèo</strong> xác nhận nhận hàng <span className="font-mono text-primary font-medium">#DH-2024-1082</span></p>
                  <p className="text-[11px] text-outline">Đã rời trạm Thới Lai • Tuyến Kênh Xáng</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[11px] text-outline shrink-0 mt-0.5">08:20</span>
                <div>
                  <p className="text-on-surface">Xác nhận thanh toán VietQR <strong className="font-mono text-emerald-700">8.245.000 ₫</strong> từ <strong className="font-semibold">Trần Văn Hải</strong></p>
                  <p className="text-[11px] text-outline">Ref: MBB-TK-982103 • Khớp hóa đơn</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[11px] text-outline shrink-0 mt-0.5">07:55</span>
                <div>
                  <p className="text-on-surface">Đại lý <strong className="font-semibold">Nguyễn Văn Minh</strong> duyệt đơn <span className="font-mono text-primary font-medium">#DH-2024-1081</span> cho Lê Thị Bảy</p>
                  <p className="text-[11px] text-outline">Kho B tiếp nhận lệnh bốc hàng</p>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant text-center">
              <a className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-0.5" href="#">
                <span>Xem toàn bộ nhật ký trạm</span>
                <span className="material-symbols-outlined text-xs" data-icon="chevron_right">chevron_right</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
