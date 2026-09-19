import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageHeader } from '../../context/PageHeaderContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import DetailModal from '../../components/ui/DetailModal'
import Pagination from '../../components/ui/Pagination'
import StatusBadge from '../../components/ui/StatusBadge'
import { usePagination } from '../../hooks/usePagination'
import { useToast } from '../../context/ToastContext'
import { orders as ALL_ORDERS } from '../../data/mockOrders'
import { debtCustomers as ALL_DEBT_CUSTOMERS } from '../../data/mockDebts'
import { payments as ALL_PAYMENTS } from '../../data/mockPayments'
import { aiCases as ALL_AI_CASES } from '../../data/mockAiRecommendations'
import { inventoryItems as ALL_INVENTORY } from '../../data/mockInventory'
import { parseVnd, formatVnd } from '../../utils/money'
import type { Order } from '../../types'

const TAB_OPTIONS = ['Tất cả', 'Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Hoàn thành']

export default function DashboardPage() {
  usePageHeader({
    title: 'Operations Dashboard',
  })

  const navigate = useNavigate()
  const { showToast } = useToast()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusTab, setStatusTab] = useState(TAB_OPTIONS[0])

  // Operational Attention Counters
  const pendingOrders = ALL_ORDERS.filter((o) => o.statusBadge.label === 'Chờ xác nhận')
  const pendingOrdersCount = pendingOrders.length

  const pendingVietQrPayments = ALL_PAYMENTS.filter(
    (p) => (p.statusBadge.label === 'Chờ đối soát' || p.methodLabel.includes('VietQR')) && p.statusBadge.label !== 'Đã thanh toán',
  )
  const pendingVietQrCount = pendingVietQrPayments.length
  const pendingVietQrAmount = pendingVietQrPayments.reduce((sum, p) => sum + parseVnd(p.totalAmount), 0)

  const pendingAiCases = ALL_AI_CASES.filter((c) => c.statusBadge.label === 'Chờ duyệt')
  const pendingAiCount = pendingAiCases.length

  const lowStockItems = ALL_INVENTORY.filter((i) => i.stockLabel !== 'Tồn kho tốt')
  const lowStockCount = lowStockItems.length

  const alertDebtCustomers = ALL_DEBT_CUSTOMERS.filter((c) => c.statusBadge.label === 'Quá hạn' || c.statusBadge.label === 'Đến hạn')
  const alertDebtCount = alertDebtCustomers.length

  const totalActionRequired = pendingOrdersCount + pendingVietQrCount + pendingAiCount + lowStockCount + alertDebtCount

  // Today Summary Statistics
  const filteredOrders = statusTab === TAB_OPTIONS[0] ? ALL_ORDERS : ALL_ORDERS.filter((o) => o.statusBadge.label === statusTab)
  const tabCounts = TAB_OPTIONS.map((tab) => (tab === TAB_OPTIONS[0] ? ALL_ORDERS.length : ALL_ORDERS.filter((o) => o.statusBadge.label === tab).length))

  const { page, totalPages, paginated, startIndex, endIndex, totalCount, goPrev, goNext, setPage } = usePagination(filteredOrders, 5)

  const totalRevenue = ALL_ORDERS.reduce((sum, o) => sum + parseVnd(o.total), 0)
  const cashRevenue = ALL_ORDERS.filter((o) => o.paymentBadge.label === 'Tiền mặt tại kho').reduce((sum, o) => sum + parseVnd(o.total), 0)
  const debtRevenue = ALL_ORDERS.filter((o) => o.paymentBadge.label === 'Gối nợ vụ mùa').reduce((sum, o) => sum + parseVnd(o.total), 0)

  const debtHouseholds = ALL_DEBT_CUSTOMERS.filter((c) => parseVnd(c.remaining) > 0)
  const totalDebtRemaining = debtHouseholds.reduce((sum, c) => sum + parseVnd(c.remaining), 0)

  const handleOrderAction = (order: Order, label: string) => {
    if (label === 'Xem' || label === 'Xem chi tiết') {
      setSelectedOrder(order)
    } else {
      showToast(`Đã thực hiện "${label}" cho đơn #${order.id}`)
    }
  }

  const getOrderProductSummary = (order: Order) => {
    if (order.items && order.items.length > 0) {
      const firstName = order.items[0].name.split('(')[0].replace(/^(Phân bón|Thuốc trừ cỏ|Thuốc trừ sâu|Lúa giống)\s+/i, '').trim()
      const extraCount = order.items.length - 1
      return extraCount > 0 ? `${firstName} + ${extraCount} sản phẩm` : firstName
    }
    return order.productTitle.split(',')[0].split('(')[0].trim()
  }

  return (
    <div className="space-y-5">
      {/* SECTION 1: CẦN XỬ LÝ NGAY (NEEDS ATTENTION - OPERATIONAL COMMAND CENTER) */}
      <section aria-label="Nhiệm vụ cần xử lý ngay" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Cần xử lý ngay
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              {totalActionRequired} việc tồn đọng
            </span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Chọn mục để chuyển nhanh đến giao diện xử lý
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Card 1: Đơn chờ duyệt */}
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className={`p-3.5 rounded-xl border text-left transition-all group flex flex-col justify-between shadow-2xs ${
              pendingOrdersCount > 0
                ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-400'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                pendingOrdersCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
              }`}>
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              </span>
              <span className={`text-xl font-bold font-mono ${pendingOrdersCount > 0 ? 'text-amber-900' : 'text-slate-700'}`}>
                {pendingOrdersCount}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">Đơn chờ duyệt</div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                {pendingOrdersCount > 0 ? 'Cần duyệt xuất kho' : 'Không có đơn chờ'}
              </div>
            </div>
          </button>

          {/* Card 2: VietQR chờ khớp */}
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className={`p-3.5 rounded-xl border text-left transition-all group flex flex-col justify-between shadow-2xs ${
              pendingVietQrCount > 0
                ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-400'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                pendingVietQrCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
              }`}>
                <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
              </span>
              <span className={`text-xl font-bold font-mono ${pendingVietQrCount > 0 ? 'text-amber-900' : 'text-slate-700'}`}>
                {pendingVietQrCount}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">VietQR chờ khớp</div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                {pendingVietQrCount > 0 ? formatVnd(pendingVietQrAmount) : 'Đã khớp tất cả'}
              </div>
            </div>
          </button>

          {/* Card 3: Ca AI chờ duyệt */}
          <button
            type="button"
            onClick={() => navigate('/ai-recommendations')}
            className={`p-3.5 rounded-xl border text-left transition-all group flex flex-col justify-between shadow-2xs ${
              pendingAiCount > 0
                ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-400'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                pendingAiCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
              }`}>
                <span className="material-symbols-outlined text-[18px]">psychology</span>
              </span>
              <span className={`text-xl font-bold font-mono ${pendingAiCount > 0 ? 'text-amber-900' : 'text-slate-700'}`}>
                {pendingAiCount}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">Thẩm định AI</div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                {pendingAiCount > 0 ? 'Duyệt phác đồ bệnh lúa' : 'Không có ca chờ'}
              </div>
            </div>
          </button>

          {/* Card 4: Vật tư sắp hết */}
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className={`p-3.5 rounded-xl border text-left transition-all group flex flex-col justify-between shadow-2xs ${
              lowStockCount > 0
                ? 'border-orange-300 bg-orange-50/40 hover:bg-orange-50 hover:border-orange-400'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                lowStockCount > 0 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500'
              }`}>
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              </span>
              <span className={`text-xl font-bold font-mono ${lowStockCount > 0 ? 'text-orange-900' : 'text-slate-700'}`}>
                {lowStockCount}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">Vật tư cần nhập</div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                {lowStockCount > 0 ? 'Tồn dưới mức an toàn' : 'Kho hàng ổn định'}
              </div>
            </div>
          </button>

          {/* Card 5: Hộ đến hạn nợ */}
          <button
            type="button"
            onClick={() => navigate('/debts')}
            className={`p-3.5 rounded-xl border text-left transition-all group flex flex-col justify-between shadow-2xs ${
              alertDebtCount > 0
                ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-400'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                alertDebtCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500'
              }`}>
                <span className="material-symbols-outlined text-[18px]">pending_actions</span>
              </span>
              <span className={`text-xl font-bold font-mono ${alertDebtCount > 0 ? 'text-rose-900' : 'text-slate-700'}`}>
                {alertDebtCount}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-xs font-bold text-slate-900 group-hover:text-rose-800 transition-colors">Công nợ cần thu</div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                {alertDebtCount > 0 ? 'Nông hộ đến/quá hạn' : 'Không có nợ quá hạn'}
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* SECTION 2: TÓM TẮT HÔM NAY (TODAY SUMMARY - QUIET STATISTICAL STRIP) */}
      <section aria-label="Thống kê giao dịch hôm nay" className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-slate-400 text-[18px]">today</span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tóm tắt hôm nay</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 md:max-w-3xl">
          <div className="border-l-2 border-slate-200 pl-3">
            <div className="text-[11px] text-slate-500 font-medium">Đơn hàng hôm nay</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-slate-900 tabular-nums">{ALL_ORDERS.length}</span>
              <span className="text-xs text-slate-400">đơn</span>
            </div>
          </div>

          <div className="border-l-2 border-slate-200 pl-3">
            <div className="text-[11px] text-slate-500 font-medium">Đã giao thành công</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-emerald-700 tabular-nums">{tabCounts[4]}</span>
              <span className="text-xs text-slate-400">đơn</span>
            </div>
          </div>

          <div className="border-l-2 border-slate-200 pl-3">
            <div className="text-[11px] text-slate-500 font-medium">Doanh thu ghi nhận</div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-slate-900 tabular-nums">{formatVnd(totalRevenue)}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              TM: {formatVnd(cashRevenue)} • Nợ: {formatVnd(debtRevenue)}
            </div>
          </div>

          <div className="border-l-2 border-slate-200 pl-3">
            <div className="text-[11px] text-slate-500 font-medium">Tổng dư nợ vụ mùa</div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-slate-700 tabular-nums">{formatVnd(totalDebtRemaining)}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {debtHouseholds.length} hộ đang gối vụ
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: RECENT ORDERS (SIMPLIFIED SCANNABLE ENTERPRISE TABLE) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Đơn Hàng Gần Đây</h2>
            <p className="text-xs text-slate-500 mt-0.5">Danh sách các giao dịch phát sinh trong ca làm việc</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
            {TAB_OPTIONS.map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  tab === statusTab
                    ? 'bg-white text-primary shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab} ({tabCounts[i]})
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Mã Đơn &amp; Giờ</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Sản Phẩm</th>
                <th className="py-3 px-4 text-right">Tổng Tiền</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {paginated.map((order) => {
                const isSelected = selectedOrder?.id === order.id
                return (
                  <tr
                    key={order.id}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold font-mono text-primary">#{order.id}</span>
                      <span className="text-xs text-slate-400 block mt-0.5 font-mono">{order.timeBold}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
                        <span>{order.shortLocation}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 truncate max-w-[220px]" title={order.productTitle}>
                        {getOrderProductSummary(order)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {order.total}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge label={order.statusBadge.label} className={order.statusBadge.className} size="xs" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                        <RowActionsMenu
                          triggerLabel={`Thao tác đơn #${order.id}`}
                          actions={order.actions.map((action) => ({
                            ...action,
                            onClick: () => handleOrderAction(order, action.label),
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
      <DetailModal open={selectedOrder !== null} onClose={() => setSelectedOrder(null)}>
        {selectedOrder ? (
          <div className="p-space-md space-y-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-primary">#{selectedOrder.id}</span>
                <span className="text-[11px] text-outline">{selectedOrder.timeBold} {selectedOrder.timeRest}</span>
              </div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold mt-0.5">{selectedOrder.customerName}</h3>
              <div className="text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px] text-outline">location_on</span>
                {selectedOrder.wardAddress}
              </div>
            </div>
            <div className="p-2.5 bg-surface-container-low rounded border border-outline-variant">
              <div className="font-medium text-on-surface text-body-sm">{selectedOrder.productTitle}</div>
              {selectedOrder.productNote ? (
                <div className="text-[11px] text-outline mt-0.5">{selectedOrder.productNote}</div>
              ) : null}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
              <StatusBadge label={selectedOrder.statusBadge.label} className={selectedOrder.statusBadge.className} />
              <span className="font-bold text-on-surface tabular-nums">{selectedOrder.total}</span>
            </div>
          </div>
        ) : null}
      </DetailModal>
    </div>
  )
}
