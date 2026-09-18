import { useState } from 'react'
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
import { parseVnd, formatVnd } from '../../utils/money'
import type { Order } from '../../types'

const TAB_OPTIONS = ['Tất cả', 'Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Hoàn thành']

export default function DashboardPage() {
  usePageHeader({
    title: 'Operations Dashboard',
  })

  const { showToast } = useToast()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusTab, setStatusTab] = useState(TAB_OPTIONS[0])

  const filteredOrders = statusTab === TAB_OPTIONS[0] ? ALL_ORDERS : ALL_ORDERS.filter((o) => o.statusBadge.label === statusTab)
  const tabCounts = TAB_OPTIONS.map((tab) => (tab === TAB_OPTIONS[0] ? ALL_ORDERS.length : ALL_ORDERS.filter((o) => o.statusBadge.label === tab).length))

  const { page, totalPages, paginated, startIndex, endIndex, totalCount, goPrev, goNext, setPage } = usePagination(filteredOrders, 5)

  const totalRevenue = ALL_ORDERS.reduce((sum, o) => sum + parseVnd(o.total), 0)
  const cashRevenue = ALL_ORDERS.filter((o) => o.paymentBadge.label === 'Tiền mặt tại kho').reduce((sum, o) => sum + parseVnd(o.total), 0)
  const debtRevenue = ALL_ORDERS.filter((o) => o.paymentBadge.label === 'Gối nợ vụ mùa').reduce((sum, o) => sum + parseVnd(o.total), 0)

  const pendingVietQrPayments = ALL_PAYMENTS.filter((p) => p.methodLabel.includes('VietQR') && p.statusBadge.label !== 'Đã thanh toán')
  const pendingVietQrAmount = pendingVietQrPayments.reduce((sum, p) => sum + parseVnd(p.totalAmount), 0)

  const debtHouseholds = ALL_DEBT_CUSTOMERS.filter((c) => parseVnd(c.remaining) > 0)
  const totalDebtRemaining = debtHouseholds.reduce((sum, c) => sum + parseVnd(c.remaining), 0)
  const dueTodayHouseholds = ALL_DEBT_CUSTOMERS.filter((c) => c.statusBadge.label === 'Đến hạn').length

  const handleOrderAction = (order: Order, label: string) => {
    if (label === 'Xem' || label === 'Xem chi tiết') {
      setSelectedOrder(order)
    } else {
      showToast(`Đã thực hiện "${label}" cho đơn #${order.id}`)
    }
  }

  return (
    <>
      {/* 1. TOP METRICS ROW: 4 Core Executive KPIs */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Đơn hàng hôm nay */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase tracking-wider font-bold">Đơn Hàng Hôm Nay</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">{ALL_ORDERS.length}</span>
              <span className="text-xs text-slate-500 font-medium">đơn hàng</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span className="text-emerald-700 font-medium">{tabCounts[4]} hoàn thành</span>
              <span>{tabCounts[2]} đang giao/xử lý</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Doanh thu hôm nay */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase tracking-wider font-bold">Doanh Thu Hôm Nay</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">{formatVnd(totalRevenue)}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Tiền mặt: <strong className="text-emerald-700">{formatVnd(cashRevenue)}</strong></span>
              <span>Gối nợ: <strong className="text-slate-700">{formatVnd(debtRevenue)}</strong></span>
            </div>
          </div>
        </div>

        {/* KPI 3: VietQR Chờ Khớp */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase tracking-wider font-bold">VietQR Chờ Khớp</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">{pendingVietQrPayments.length}</span>
              <span className="text-xs text-slate-500 font-medium">chờ xác nhận</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Chờ duyệt: <strong className="text-slate-900 font-medium">{formatVnd(pendingVietQrAmount)}</strong></span>
            </div>
          </div>
        </div>

        {/* KPI 4: Công nợ vụ lúa */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase tracking-wider font-bold">Công Nợ Cần Thu</span>
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-purple-900 tabular-nums">{formatVnd(totalDebtRemaining)}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>{debtHouseholds.length} hộ nông dân</span>
              <span className="text-amber-700 font-semibold">{dueTodayHouseholds} hộ đến hạn</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Recent Orders Enterprise Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Đơn Hàng Gần Đây</h2>
            <p className="text-xs text-slate-500 mt-0.5">Tổng cộng {ALL_ORDERS.length} giao dịch hôm nay</p>
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
                <th className="py-3 px-4">Mã Đơn</th>
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
                      <span className="text-xs text-slate-400 block mt-0.5">{order.timeRest}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
                        {order.wardAddress}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{order.productTitle}</div>
                      {order.productNote && (
                        <div className="text-xs text-slate-500 mt-0.5">{order.productNote}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {order.total}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge label={order.statusBadge.label} className={order.statusBadge.className} size="xs" minWidthClassName="min-w-[90px]" />
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
    </>
  )
}
