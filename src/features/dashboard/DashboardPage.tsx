import { useState } from 'react'
import { usePageHeader } from '../../context/PageHeaderContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import DetailModal from '../../components/ui/DetailModal'
import Pagination from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { useToast } from '../../context/ToastContext'
import { orders as ALL_ORDERS } from '../../data/mockOrders'
import { debtCustomers as ALL_DEBT_CUSTOMERS } from '../../data/mockDebts'
import { inventoryItems as ALL_INVENTORY } from '../../data/mockInventory'
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

  const pendingReconciliation = ALL_PAYMENTS.filter((p) => p.statusBadge.label === 'Chờ đối soát')
  const pendingReconciliationAmount = pendingReconciliation.reduce((sum, p) => sum + parseVnd(p.paidAmount), 0)

  const debtHouseholds = ALL_DEBT_CUSTOMERS.filter((c) => parseVnd(c.remaining) > 0)
  const totalDebtRemaining = debtHouseholds.reduce((sum, c) => sum + parseVnd(c.remaining), 0)
  const dueTodayHouseholds = ALL_DEBT_CUSTOMERS.filter((c) => c.statusBadge.label === 'Đến hạn').length

  const lowStockItems = ALL_INVENTORY.filter((i) => i.stockLabel === 'Sắp hết')
  const lowStockNames = lowStockItems.slice(0, 2).map((i) => i.name).join(' & ')

  const handleOrderAction = (order: Order, label: string) => {
    if (label === 'Xem' || label === 'Xem chi tiết') {
      setSelectedOrder(order)
    } else {
      showToast(`Đã thực hiện "${label}" cho đơn #${order.id}`)
    }
  }

  return (
    <>
      {/* 1. TOP METRICS ROW (6 Key Operational Agronomic & Sales KPIs) */}
      <section aria-label="Key Operational Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {/* KPI 1: Đơn hàng hôm nay */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-3 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-outline">Đơn Hàng Hôm Nay</span>
            <span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]" data-icon="receipt_long">receipt_long</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold text-on-surface tabular-nums tracking-tight leading-none">{ALL_ORDERS.length}</span>
              <span className="text-xs text-on-surface-variant font-medium">đơn</span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-outline-variant/50 text-[11px] text-on-surface-variant flex items-center justify-between">
              <span className="font-medium text-on-surface">{tabCounts[4]} hoàn thành</span>
              <span className="text-outline tabular-nums">{tabCounts[2]} đang xử lý</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Doanh thu hôm nay */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-3 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-outline">Doanh Thu Hôm Nay</span>
            <span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]" data-icon="payments">payments</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline">
              <span className="text-[22px] font-bold text-on-surface tabular-nums tracking-tight leading-none">{formatVnd(totalRevenue)}</span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-outline-variant/50 text-[11px] text-on-surface-variant flex justify-between gap-1">
              <span>Tiền mặt: <strong className="text-[#15803D] font-semibold tabular-nums">{formatVnd(cashRevenue)}</strong></span>
              <span>Gối nợ: <strong className="text-secondary font-semibold tabular-nums">{formatVnd(debtRevenue)}</strong></span>
            </div>
          </div>
        </div>

        {/* KPI 3: Chờ đối soát */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-3 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-outline">Chờ Đối Soát</span>
            <span className="w-7 h-7 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-secondary flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]" data-icon="qr_code_2">qr_code_2</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold text-on-surface tabular-nums tracking-tight leading-none">{pendingReconciliation.length}</span>
              <span className="text-xs text-on-surface-variant font-medium">giao dịch</span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-outline-variant/50 text-[11px] text-on-surface-variant flex justify-between items-center">
              <span>Giá trị: <strong className="text-on-surface font-semibold tabular-nums">{formatVnd(pendingReconciliationAmount)}</strong></span>
            </div>
          </div>
        </div>

        {/* KPI 4: Công nợ chưa thu */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-3 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-outline">Công Nợ Chưa Thu</span>
            <span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-secondary flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]" data-icon="pending_actions">pending_actions</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline">
              <span className="text-[22px] font-bold text-secondary tabular-nums tracking-tight leading-none">{formatVnd(totalDebtRemaining)}</span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-outline-variant/50 text-[11px] text-on-surface-variant flex justify-between">
              <span>{debtHouseholds.length} hộ nông dân</span>
              <span className="text-error font-medium">{dueTodayHouseholds} hộ đến hạn</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Cảnh báo tồn kho */}
        <div className="bg-white rounded-lg border border-error/30 p-3 flex flex-col justify-between shadow-2xs hover:border-error/60 transition-colors bg-error-container/10">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-error">Sắp Hết Hàng</span>
            <span className="w-7 h-7 rounded-lg bg-error-container flex items-center justify-center text-error flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]" data-icon="warning">warning</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold text-error tabular-nums tracking-tight leading-none">{lowStockItems.length}</span>
              <span className="text-xs text-on-surface-variant font-medium">mặt hàng</span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-error/20 text-[11px] text-on-surface-variant truncate">
              {lowStockItems.length > 0 ? (
                <>
                  <span className="text-error font-semibold">Báo động:</span> {lowStockNames}
                </>
              ) : (
                'Không có mặt hàng nào sắp hết'
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION A: Recent Orders Enterprise Data Table */}
      <div className="bg-white rounded-lg border border-outline-variant/60 shadow-2xs overflow-hidden">
            <div className="px-3 py-2 bg-white border-b border-outline-variant/60 flex flex-col md:flex-row md:items-center justify-between gap-1.5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-title-md text-[14px] text-on-surface font-bold">Đơn Hàng Gần Đây</h2>
                  <span className="bg-surface-container text-primary font-semibold px-1.5 py-0.5 rounded text-[11px] tabular-nums">{ALL_ORDERS.length} giao dịch hôm nay</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-low p-0.5 rounded-lg border border-outline-variant/60 text-xs">
                {TAB_OPTIONS.map((tab, i) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusTab(tab)}
                    className={
                      tab === statusTab
                        ? 'px-2 py-0.5 rounded bg-white text-primary font-semibold shadow-2xs border border-outline-variant/40 text-[11px]'
                        : 'px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-[11px]'
                    }
                  >
                    {tab} ({tabCounts[i]})
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/60 border-b border-outline-variant/60 font-label-sm text-[11px] text-outline uppercase tracking-wider">
                    <th className="py-1.5 px-3">Mã Đơn</th>
                    <th className="py-1.5 px-3">Nông Dân &amp; Địa Bàn</th>
                    <th className="py-1.5 px-3">Mặt Hàng Nông Nghiệp</th>
                    <th className="py-1.5 px-3 text-right">Giá Trị</th>
                    <th className="py-1.5 px-3 text-center">Trạng Thái</th>
                    <th className="py-1.5 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-[12px]">
                  {paginated.map((order) => {
                    const isSelected = selectedOrder?.id === order.id
                    return (
                      <tr
                        key={order.id}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-surface-container-low/40'
                        }`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="py-2 px-3">
                          <span className="font-semibold text-primary tabular-nums block">#{order.id}</span>
                          <span className="text-[10px] text-outline">{order.timeBold} {order.timeRest}</span>
                        </td>
                        <td className="py-2 px-3 min-w-0">
                          <div className="font-semibold text-on-surface text-[13px]">{order.customerName}</div>
                          <div className="text-[11px] text-on-surface-variant flex items-center gap-1 whitespace-nowrap">
                            <span className="material-symbols-outlined text-[12px] text-outline" data-icon="location_on">location_on</span>
                            {order.wardAddress}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-medium text-on-surface text-[12px] whitespace-nowrap">{order.productTitle}</div>
                          {order.productNote ? (
                            <div className="text-[10px] text-outline mt-0.5 whitespace-nowrap">{order.productNote}</div>
                          ) : null}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-on-surface tabular-nums text-[13px]">{order.total}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${order.statusBadge.className}`}>
                            {order.statusBadge.label}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end">
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
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${selectedOrder.statusBadge.className}`}>
                {selectedOrder.statusBadge.label}
              </span>
              <span className="font-bold text-on-surface tabular-nums">{selectedOrder.total}</span>
            </div>
          </div>
        ) : null}
      </DetailModal>
    </>
  )
}
