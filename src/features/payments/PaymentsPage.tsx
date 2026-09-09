import { useState } from 'react'
import { usePageHeader } from '../../context/PageHeaderContext'
import { useToast } from '../../context/ToastContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import EmptyTableRow from '../../components/ui/EmptyTableRow'
import DetailModal from '../../components/ui/DetailModal'
import { useSelectableList } from '../../hooks/useSelectableList'
import { useFilteredList } from '../../hooks/useFilteredList'
import { payments as INITIAL_PAYMENTS } from '../../data/mockPayments'

const STATUS_OPTIONS = ['Tất cả trạng thái', 'Chưa thanh toán', 'Thanh toán 1 phần', 'Đã thanh toán', 'Chờ đối soát', 'Đã đối soát', 'Hoàn tiền']

export default function PaymentsPage() {
  usePageHeader({
    title: 'Quản lý thanh toán',
  })

  const [payments, setPayments] = useState(INITIAL_PAYMENTS)
  const { showToast } = useToast()

  const markPaymentPaid = (id: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              paidAmount: p.totalAmount,
              paidAmountClassName: 'text-emerald-700',
              remainingAmount: '0 đ',
              remainingAmountClassName: 'text-outline',
              statusBadge: { label: 'Đã thanh toán', className: 'bg-emerald-100 text-emerald-800 border-emerald-300', dotClassName: 'bg-emerald-600' },
              collectedLabel: `${p.totalAmount} (100%)`,
              progressWidth: '100%',
              hasRemaining: false,
            }
          : p,
      ),
    )
    showToast(`Đã ghi nhận thanh toán #${id}`)
  }

  const markPaymentReconciled = (id: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, statusBadge: { label: 'Đã đối soát', className: 'bg-emerald-100 text-emerald-800 border-emerald-300', dotClassName: 'bg-emerald-600' } }
          : p,
      ),
    )
    showToast(`Đã đối soát giao dịch #${id}`)
  }

  const handlePaymentAction = (id: string, label: string) => {
    if (label === 'Thu tiếp' || label === 'Ghi nhận TT') markPaymentPaid(id)
    else if (label === 'Đối soát') markPaymentReconciled(id)
  }

  const { selectedId, setSelectedId, selected } = useSelectableList(payments, (p) => p.id)

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filtered: filteredPayments,
    clearFilters: handleClearFilters,
  } = useFilteredList(
    payments,
    STATUS_OPTIONS[0],
    (payment, keyword, status) =>
      (!keyword ||
        payment.id.toLowerCase().includes(keyword) ||
        payment.orderId.toLowerCase().includes(keyword) ||
        payment.customerName.toLowerCase().includes(keyword)) &&
      (status === STATUS_OPTIONS[0] || payment.statusBadge.label === status),
  )

  return (
    <>
      {/* PAGE HEADER & BREADCRUMBS & TOP ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-1 text-outline font-label-sm text-label-sm">
          <span className="">Bảng điều khiển</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-medium">Quản lý thanh toán</span>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap">
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface rounded-xl font-label-md text-label-md transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-outline">download</span>
            <span className="">Xuất báo cáo</span>
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface rounded-xl font-label-md text-label-md transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-outline">print</span>
            <span className="">In sổ thu chi</span>
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-primary-container hover:bg-primary text-surface-container-lowest rounded-xl font-title-md text-title-md transition-colors shadow-sm focus:ring-2 focus:ring-primary-container focus:outline-none">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="">Ghi nhận thanh toán</span>
          </button>
        </div>
      </div>

      {/* 5 COMPACT KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
        <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded-xl shadow-sm flex flex-col justify-between hover:border-slate-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline font-medium">Thu hôm nay</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              +14.2% so hôm qua
            </span>
          </div>
          <div className="mt-2">
            <div className="font-metric-num text-metric-num text-on-surface tracking-tight font-bold">58.420.000 <span className="text-title-md font-normal text-outline">đ</span></div>
            <div className="text-[12px] text-outline mt-1 truncate">
              Tiền mặt 22.150.000đ • VietQR 36.270.000đ
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded-xl shadow-sm flex flex-col justify-between hover:border-slate-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline font-medium">Chờ thanh toán</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100"></span>
          </div>
          <div className="mt-2">
            <div className="font-metric-num text-metric-num text-on-surface tracking-tight font-bold">09 <span className="text-title-md font-normal text-outline">giao dịch</span></div>
            <div className="text-[12px] text-amber-700 font-medium mt-1 truncate">
              Tổng tiền chờ: 42.180.000 đ
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded-xl shadow-sm flex flex-col justify-between hover:border-slate-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline font-medium">Thanh toán một phần</span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 ring-4 ring-yellow-100"></span>
          </div>
          <div className="mt-2">
            <div className="font-metric-num text-metric-num text-on-surface tracking-tight font-bold">06 <span className="text-title-md font-normal text-outline">đơn</span></div>
            <div className="text-[12px] text-outline mt-1 truncate">
              Đã thu 38.500.000đ / Còn thiếu 24.300.000đ
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded-xl shadow-sm flex flex-col justify-between hover:border-slate-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline font-medium">Đã thanh toán</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
          </div>
          <div className="mt-2">
            <div className="font-metric-num text-metric-num text-on-surface tracking-tight font-bold">34 <span className="text-title-md font-normal text-outline">giao dịch</span></div>
            <div className="text-[12px] text-emerald-700 font-medium mt-1 truncate">
              Hoàn tất 100% doanh thu
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded-xl shadow-sm flex flex-col justify-between hover:border-slate-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline font-medium">COD chờ đối soát</span>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100"></span>
          </div>
          <div className="mt-2">
            <div className="font-metric-num text-metric-num text-indigo-900 tracking-tight font-bold">18.650.000 <span className="text-title-md font-normal text-outline">đ</span></div>
            <div className="text-[12px] text-indigo-700 font-medium mt-1 truncate">
              04 chuyến giao đã thu COD cần nộp quỹ
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-surface-container-lowest border border-outline-variant p-3.5 rounded-xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input
            className="w-full pl-9 pr-3 py-1.5 text-body-md font-body-md bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-outline focus:bg-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            placeholder="Tìm mã thanh toán / mã đơn / khách hàng..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            className="py-1.5 pl-3 pr-8 text-label-md font-label-md bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select className="py-1.5 pl-3 pr-8 text-label-md font-label-md bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container">
            <option>Tất cả phương thức</option>
            <option>Tiền mặt</option>
            <option>VietQR</option>
            <option>Chuyển khoản</option>
            <option>COD</option>
          </select>
          <select className="py-1.5 pl-3 pr-8 text-label-md font-label-md bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container">
            <option>Hôm nay - Vụ Thu Đông</option>
            <option>7 ngày gần nhất</option>
            <option>30 ngày qua</option>
            <option>Tùy chọn khoảng ngày...</option>
          </select>
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-outline hover:text-on-surface hover:bg-surface-container-low rounded-xl font-label-md text-label-md transition-colors"
            onClick={handleClearFilters}
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
            <span className="">Xóa bộ lọc</span>
          </button>
        </div>
      </div>

      {/* Main Payment Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-space-md py-3 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-title-md text-title-md font-semibold text-on-surface">Danh sách giao dịch thanh toán</span>
                <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">{filteredPayments.length} giao dịch</span>
              </div>
              <div className="flex items-center gap-1.5 text-outline font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="">Cập nhật trực tiếp: 10:15</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50 border-b border-outline-variant text-[11px] font-semibold text-outline uppercase tracking-wider">
                    <th className="py-2.5 px-space-md">MÃ TT / ĐƠN</th>
                    <th className="py-2.5 px-space-md">KHÁCH HÀNG</th>
                    <th className="py-2.5 px-space-md text-right">TỔNG ĐƠN</th>
                    <th className="py-2.5 px-space-md text-right">ĐÃ THU</th>
                    <th className="py-2.5 px-space-md text-right">CÒN LẠI</th>
                    <th className="py-2.5 px-space-md">PHƯƠNG THỨC</th>
                    <th className="py-2.5 px-space-md text-center">TRẠNG THÁI</th>
                    <th className="py-2.5 px-space-md">THỜI GIAN</th>
                    <th className="py-2.5 px-space-md text-center">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                  {filteredPayments.length === 0 ? (
                    <EmptyTableRow colSpan={9} message="Không tìm thấy giao dịch phù hợp với bộ lọc." />
                  ) : null}
                  {filteredPayments.map((payment) => {
                    const isSelected = payment.id === selectedId
                    return (
                      <tr
                        key={payment.id}
                        onClick={() => setSelectedId(payment.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-primary-container'
                            : 'hover:bg-surface-container-low'
                        }`}
                      >
                        <td className="py-3 px-space-md whitespace-nowrap">
                          <div className={`font-semibold font-mono ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{payment.id}</div>
                          <div className="text-[11px] text-outline">{payment.orderId}</div>
                        </td>
                        <td className="py-3 px-space-md">
                          <div className="font-medium text-on-surface">{payment.customerName}</div>
                          <div className="text-[11px] text-outline truncate max-w-[130px]">{payment.addressShort}</div>
                        </td>
                        <td className="py-3 px-space-md text-right font-medium text-on-surface whitespace-nowrap font-mono">
                          {payment.totalAmount}
                        </td>
                        <td className={`py-3 px-space-md text-right font-medium whitespace-nowrap font-mono ${payment.paidAmountClassName}`}>
                          {payment.paidAmount}
                        </td>
                        <td className={`py-3 px-space-md text-right font-semibold whitespace-nowrap font-mono ${payment.remainingAmountClassName}`}>
                          {payment.remainingAmount}
                        </td>
                        <td className="py-3 px-space-md whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${payment.methodClassName}`}>
                            {payment.methodIcon ? (
                              <span className={`material-symbols-outlined text-[14px] ${payment.methodIconClassName ?? ''}`}>
                                {payment.methodIcon}
                              </span>
                            ) : null}
                            {payment.methodLabel}
                          </span>
                        </td>
                        <td className="py-3 px-space-md text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${payment.statusBadge.className}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${payment.statusBadge.dotClassName}`}></span>
                            {payment.statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3 px-space-md text-outline whitespace-nowrap text-[12px] font-mono">{payment.time}</td>
                        <td className="py-3 px-space-md text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <RowActionsMenu
                              triggerLabel={`Thao tác giao dịch #${payment.id}`}
                              actions={payment.actions.map((action) => ({
                                ...action,
                                onClick: () => handlePaymentAction(payment.id, action.label),
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
            <div className="px-space-md py-3 bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-label-md text-outline font-label-md">
                Hiển thị <span className="font-semibold text-on-surface">1 - 5</span> trong số <span className="font-semibold text-on-surface">52</span> giao dịch
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-label-md text-outline">
                  <span className="">Số dòng:</span>
                  <select className="py-0.5 px-2 text-label-md bg-surface-container-lowest border border-outline-variant rounded font-medium text-on-surface">
                    <option>10/trang</option>
                    <option>25/trang</option>
                    <option>50/trang</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-primary-container text-white font-medium text-xs">
                    1
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container text-xs font-medium">
                    2
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container text-xs font-medium">
                    3
                  </button>
                  <span className="text-outline px-1">...</span>
                  <button className="px-2.5 h-8 flex items-center justify-center rounded bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container text-xs font-medium">
                    Trang sau
                  </button>
                </div>
              </div>
            </div>
          </div>

      {/* DETAIL MODAL: CHI TIẾT GIAO DỊCH */}
      <DetailModal open={selected !== null} onClose={() => setSelectedId(null)}>
        {selected ? (
          <>
            <div className="p-space-md bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-title-lg text-title-lg font-bold text-primary font-mono">#{selected.id}</span>
                  <span className="text-[11px] text-outline font-mono">(Đơn gốc {selected.orderId})</span>
                </div>
                <div className="text-[11px] text-outline">{selected.subtitle}</div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold border ${selected.statusBadge.className}`}
              >
                {selected.statusBadge.label}
              </span>
            </div>
            <div className="p-space-md space-y-3.5">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <div className="flex-1">
                  <div className="font-label-md text-label-md font-semibold text-on-surface">
                    {selected.customerName} - {selected.customerPhone}
                  </div>
                  <div className="text-body-sm text-outline">{selected.customerNote}</div>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-[12px] space-y-1">
                <div className="text-outline font-medium">Chi tiết hàng hóa:</div>
                <div className="font-medium text-on-surface leading-snug">{selected.goodsNote}</div>
              </div>
              <div className="space-y-2 pt-1 border-t border-outline-variant/60">
                <div className="flex justify-between items-center text-body-sm">
                  <span className="text-outline">Tổng giá trị đơn hàng:</span>
                  <span className="font-mono font-semibold text-on-surface">{selected.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center text-body-sm">
                  <span className="text-outline">Đã thu qua hệ thống:</span>
                  <span className="font-mono font-semibold text-emerald-700">{selected.collectedLabel}</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: selected.progressWidth }}></div>
                </div>
                {selected.hasRemaining ? (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 text-amber-900 font-medium text-body-sm">
                      <span className="material-symbols-outlined text-amber-700 text-[18px]">warning</span>
                      <span className="">CÒN LẠI CẦN THU:</span>
                    </div>
                    <span className="font-mono font-bold text-amber-900 text-headline-sm">{selected.remainingAmount}</span>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-medium text-body-sm">
                      <span className="material-symbols-outlined text-emerald-700 text-[18px]">task_alt</span>
                      <span className="">ĐÃ THU ĐỦ</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-800 text-headline-sm">{selected.remainingAmount}</span>
                  </div>
                )}
                <div className="text-[11px] text-outline flex items-center justify-between pt-1">
                  <span className="">Người ghi nhận:</span>
                  <span className="font-medium text-on-surface">{selected.recordedBy}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-outline-variant/60">
                <span className="font-label-md text-label-md font-semibold text-on-surface block mb-2">
                  Lịch sử thanh toán chi tiết
                </span>
                <div className="space-y-2">
                  {selected.paymentHistory.map((entry, idx) => (
                    <div
                      key={`${entry.title}-${idx}`}
                      className={`p-2 rounded border text-[12px] flex items-start justify-between ${entry.cardClassName}`}
                    >
                      <div>
                        <div className="font-medium text-on-surface flex items-center gap-1">
                          {entry.icon ? (
                            <span className={`material-symbols-outlined text-[14px] ${entry.iconClassName ?? ''}`}>{entry.icon}</span>
                          ) : null}
                          <span className="">{entry.title}</span>
                        </div>
                        <div className="text-[11px] text-outline">{entry.note}</div>
                      </div>
                      <span className={`font-mono font-semibold text-right ${entry.amountClassName}`}>{entry.amountLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button className="w-full py-2 bg-primary-container hover:bg-primary text-white font-title-md text-title-md font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span className="">Ghi nhận thu tiền tiếp</span>
                </button>
                <button className="w-full py-2 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-outline">print</span>
                  <span className="">In phiếu thu VietQR / Biên nhận</span>
                </button>
                <button className="w-full py-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg font-label-md text-label-md transition-colors flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-blue-600">chat</span>
                  <span className="">Gửi nhắc nợ Zalo / SMS</span>
                </button>
              </div>
            </div>
          </>
        ) : null}
      </DetailModal>

      {/* Compact Recent Payment Activity */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-space-md">
            <div className="flex items-center justify-between mb-3">
              <span className="font-title-md text-title-md font-semibold text-on-surface">Nhật ký giao dịch gần đây</span>
              <span className="material-symbols-outlined text-outline text-[18px]">update</span>
            </div>
            <div className="space-y-3 font-body-sm text-body-sm">
              <div className="flex items-start gap-2.5 pb-2.5 border-b border-outline-variant/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                <div className="flex-1">
                  <div className="text-on-surface">
                    <strong className="font-mono text-primary">TT-9042:</strong> Nhận <span className="font-semibold text-emerald-700 font-mono">5.000.000đ</span> qua VietQR từ Trần Văn Hải
                  </div>
                  <div className="text-[11px] text-outline mt-0.5">08:45 • Bởi Đại lý</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 pb-2.5 border-b border-outline-variant/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                <div className="flex-1">
                  <div className="text-on-surface">
                    <strong className="font-mono text-primary">TT-9041:</strong> Thanh toán đủ <span className="font-semibold text-emerald-700 font-mono">4.800.000đ</span> VietQR từ Lê Thị Bảy
                  </div>
                  <div className="text-[11px] text-outline mt-0.5">09:45 • Tự động khớp lệnh Webhook</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                <div className="flex-1">
                  <div className="text-on-surface">
                    <strong className="font-mono text-indigo-800">COD-8819:</strong> Thu tiền mặt <span className="font-semibold font-mono text-on-surface">2.160.000đ</span> từ tài xế Bảo
                  </div>
                  <div className="text-[11px] text-outline mt-0.5">09:15 • Chờ duyệt đối soát thủ quỹ</div>
                </div>
              </div>
            </div>
          </div>
    </>
  )
}
