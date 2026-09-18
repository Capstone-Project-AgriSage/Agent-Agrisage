import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageHeader } from '../../context/PageHeaderContext'
import { useToast } from '../../context/ToastContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import EmptyTableRow from '../../components/ui/EmptyTableRow'
import Pagination from '../../components/ui/Pagination'
import SearchInput from '../../components/ui/SearchInput'
import FilterSelect from '../../components/ui/FilterSelect'
import StatusBadge from '../../components/ui/StatusBadge'
import { useSelectableList } from '../../hooks/useSelectableList'
import { useFilteredList } from '../../hooks/useFilteredList'
import { usePagination } from '../../hooks/usePagination'
import {
  mockCreditRequests as INITIAL_CREDIT_REQUESTS,
  mockDebtPaymentRequests as INITIAL_PAYMENT_REQUESTS,
  debtCustomers as INITIAL_DEBT_CUSTOMERS,
} from '../../data/mockDebts'
import { parseVnd, formatVnd } from '../../utils/money'
import { downloadCsv } from '../../utils/csv'
import type { CreditRequest, DebtPaymentRequest } from '../../types'

const STATUS_OPTIONS = ['Tất cả trạng thái công nợ', 'Bình thường', 'Sắp đến hạn', 'Đến hạn', 'Quá hạn', 'Đã thanh toán']
const REGION_OPTIONS = [
  'Tất cả khu vực',
  ...new Set(INITIAL_DEBT_CUSTOMERS.map((c) => c.addressShort.split(',').pop()?.trim() ?? '').filter(Boolean)),
]

export default function DebtsPage() {
  usePageHeader({
    title: 'Quản lý công nợ',
  })

  const [customers, setCustomers] = useState(INITIAL_DEBT_CUSTOMERS)
  const [activeTab, setActiveTab] = useState<'ledger' | 'credit-requests' | 'repayments'>('ledger')
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>(INITIAL_CREDIT_REQUESTS)
  const [paymentRequests, setPaymentRequests] = useState<DebtPaymentRequest[]>(INITIAL_PAYMENT_REQUESTS)
  const { showToast } = useToast()

  const pendingCreditCount = creditRequests.filter((cr) => cr.status === 'PENDING_APPROVAL').length
  const pendingRepaymentCount = paymentRequests.filter((pr) => pr.status === 'PENDING_AGENT_CONFIRMATION').length

  const handleApproveCredit = (id: string) => {
    setCreditRequests((prev) =>
      prev.map((cr) =>
        cr.id === id
          ? {
              ...cr,
              status: 'APPROVED',
              reviewedAt: 'Vừa xong',
              reviewerNote: 'Đã thẩm định hạn mức, cho phép xuất kho giao hàng gối vụ.',
            }
          : cr,
      ),
    )
    showToast(`Đã phê duyệt cấp hạn mức tín dụng cho yêu cầu #${id}`)
  }

  const handleRejectCredit = (id: string) => {
    setCreditRequests((prev) =>
      prev.map((cr) =>
        cr.id === id
          ? {
              ...cr,
              status: 'REJECTED',
              reviewedAt: 'Vừa xong',
              reviewerNote: 'Dư nợ hiện tại vượt ngưỡng an toàn mùa vụ hoặc lịch sử hoàn ứng chậm.',
            }
          : cr,
      ),
    )
    showToast(`Đã từ chối cấp tín dụng cho yêu cầu #${id}`)
  }

  const handleConfirmRepayment = (id: string) => {
    const payment = paymentRequests.find((pr) => pr.id === id)
    setPaymentRequests((prev) =>
      prev.map((pr) => (pr.id === id ? { ...pr, status: 'CONFIRMED', confirmedAt: 'Vừa xong' } : pr)),
    )
    showToast(`Đã xác nhận thu nợ ${payment ? formatVnd(payment.amount) : ''} thành công (Khớp thẻ nợ)`)
  }

  const handleRejectRepayment = (id: string) => {
    setPaymentRequests((prev) => prev.map((pr) => (pr.id === id ? { ...pr, status: 'REJECTED' } : pr)))
    showToast(`Đã từ chối ghi nhận giao dịch thu nợ #${id}`)
  }

  const markDebtPaid = (id: string) => {
    const customer = customers.find((c) => c.id === id)
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              paidAmount: c.totalPurchase,
              remaining: '0 đ',
              remainingCellClassName: 'text-emerald-700',
              overdueDays: '0 ngày',
              overdueDaysClassName: 'text-slate-400',
              status: 'Đã thanh toán',
              statusBadge: { label: 'Đã thanh toán', className: 'bg-emerald-100 text-emerald-800 border-emerald-200', dotClassName: 'bg-emerald-600' },
              rowAttentionClassName: undefined,
              remainingSectionClassName: 'bg-emerald-50/80 border-emerald-200',
              remainingStatusClassName: 'text-emerald-800',
              remainingAmount: '0',
              paidLabel: `${c.totalDebtLabel} (100%)`,
              paidPercent: '100%',
              progressBarWidth: '100%',
            }
          : c,
      ),
    )
    showToast(`Đã ghi nhận thu nợ - ${customer?.name ?? id} đã tất toán`)
  }

  const handleDebtAction = (id: string, label: string) => {
    if (label === 'Ghi nhận thu nợ') markDebtPaid(id)
    else if (label === 'Xem chi tiết') setSelectedId(id)
    else {
      const customer = customers.find((c) => c.id === id)
      showToast(`Đã thực hiện "${label}" cho khách hàng ${customer?.name ?? id}`)
    }
  }

  const handleExportDebts = () => {
    downloadCsv(
      // oxlint-disable-next-line react/purity -- only invoked from a click handler, never during render
      `cong-no-${Date.now()}.csv`,
      filteredCustomers.map((c) => ({
        'Khách hàng': c.name,
        'SĐT': c.phone,
        'Địa chỉ': c.addressShort,
        'Tổng mua': c.totalPurchase,
        'Đã thanh toán': c.paidAmount,
        'Còn phải thu': c.remaining,
        'Hạn gần nhất': c.dueDate,
        'Trạng thái': c.statusBadge.label,
      })),
    )
    showToast(`Đã xuất báo cáo công nợ ${filteredCustomers.length} khách hàng`)
  }

  const handlePrintDebts = () => {
    showToast('Đang in sổ nợ')
    window.print()
  }

  const { selectedId, setSelectedId } = useSelectableList(customers, (c) => c.id)

  const [regionFilter, setRegionFilter] = useState(REGION_OPTIONS[0])

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filtered: filteredCustomers,
    clearFilters: handleClearFiltersBase,
  } = useFilteredList(
    customers,
    STATUS_OPTIONS[0],
    (customer, keyword, status) =>
      (!keyword ||
        customer.name.toLowerCase().includes(keyword) ||
        customer.phone.toLowerCase().includes(keyword) ||
        customer.addressShort.toLowerCase().includes(keyword)) &&
      (status === STATUS_OPTIONS[0] || customer.statusBadge.label === status) &&
      (regionFilter === REGION_OPTIONS[0] || customer.addressShort.includes(regionFilter)),
  )

  const handleClearFilters = () => {
    handleClearFiltersBase()
    setRegionFilter(REGION_OPTIONS[0])
  }

  const { page, totalPages, paginated: paginatedCustomers, startIndex, endIndex, totalCount, goPrev, goNext, setPage } =
    usePagination(filteredCustomers, 10)

  const totalDebtAmount = customers.reduce((sum, c) => sum + parseVnd(c.remaining), 0)
  const dueTodayCustomers = customers.filter((c) => c.statusBadge.label === 'Đến hạn')
  const dueTodayAmount = dueTodayCustomers.reduce((sum, c) => sum + parseVnd(c.remaining), 0)
  const overdueCustomers = customers.filter((c) => c.statusBadge.label === 'Quá hạn')
  const overdueAmount = overdueCustomers.reduce((sum, c) => sum + parseVnd(c.remaining), 0)
  const totalCollected = customers.reduce((sum, c) => sum + parseVnd(c.paidAmount), 0)

  return (
    <>
      {/* PAGE HEADER */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-space-md shrink-0">
        <div className="flex items-center gap-2 text-slate-500 font-label-sm text-label-sm">
          <Link className="hover:text-slate-800" to="/">Bảng điều khiển</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-800 font-semibold">Quản lý công nợ</span>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 font-title-md text-title-md rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            type="button"
            onClick={handleExportDebts}
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span className="">Xuất báo cáo</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 font-title-md text-title-md rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            type="button"
            onClick={handlePrintDebts}
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span className="">In sổ nợ</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#1E5E3A] hover:bg-[#17482D] text-white font-title-md text-title-md font-medium rounded-lg transition-colors shadow-sm"
            type="button"
            onClick={() => showToast('Chức năng ghi nhận thu nợ mới đang được phát triển')}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="">Ghi nhận thu nợ</span>
          </button>
        </div>
      </section>

      {/* 3 TABS ĐIỀU HƯỚNG: SỔ NỢ NÔNG HỘ | DUYỆT TÍN DỤNG MÙA VỤ | XÁC NHẬN TRẢ NỢ */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-1.5 rounded-xl shadow-2xs shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'ledger'
              ? 'bg-[#1E5E3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">account_balance</span>
          <span>Sổ nợ nông hộ</span>
          <span className={`px-2 py-0.2 rounded-full text-xs ${activeTab === 'ledger' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {customers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('credit-requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'credit-requests'
              ? 'bg-[#1E5E3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">credit_score</span>
          <span>Duyệt tín dụng mùa vụ (WF-03)</span>
          {pendingCreditCount > 0 && (
            <span className="px-2 py-0.2 rounded-full bg-amber-500 text-white text-xs font-bold animate-pulse">
              {pendingCreditCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('repayments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'repayments'
              ? 'bg-[#1E5E3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">payments</span>
          <span>Xác nhận trả nợ (WF-04)</span>
          {pendingRepaymentCount > 0 && (
            <span className="px-2 py-0.2 rounded-full bg-emerald-600 text-white text-xs font-bold animate-pulse">
              {pendingRepaymentCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'ledger' && (
        <>
          {/* 3 THẺ KPI TÓM TẮT CÔNG NỢ */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs uppercase tracking-wider font-bold">Tổng Công Nợ Cho Vay</span>
                <span className="material-symbols-outlined text-slate-400 text-[20px]">account_balance</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono my-1">
                {formatVnd(totalDebtAmount)}
              </div>
              <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                Tổng nợ của {customers.length} nông hộ vụ Đông Xuân
              </div>
            </div>

            <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-xs uppercase tracking-wider font-bold">Đến Hạn &amp; Quá Hạn</span>
                <span className="material-symbols-outlined text-amber-600 text-[20px]">alarm</span>
              </div>
              <div className="text-2xl font-bold text-amber-900 font-mono my-1">
                {formatVnd(dueTodayAmount + overdueAmount)}
              </div>
              <div className="text-xs text-amber-800 pt-1 border-t border-amber-100 flex items-center justify-between">
                <span>{dueTodayCustomers.length} hộ đến hạn</span>
                <span className="font-semibold">{overdueCustomers.length} hộ quá hạn</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs uppercase tracking-wider font-bold">Đã Thu Hồi Nợ</span>
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">task_alt</span>
              </div>
              <div className="text-2xl font-bold text-emerald-800 font-mono my-1">
                {formatVnd(totalCollected)}
              </div>
              <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                Thu hồi từ thu hoạch lúa sớm
              </div>
            </div>
          </section>

          {/* BỘ LỌC CHUYÊN DỤNG */}
          <section className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Tìm tên nông dân, SĐT, ấp..."
                className="relative min-w-[220px] flex-1 max-w-sm"
              />
              <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
              <FilterSelect value={regionFilter} onChange={setRegionFilter} options={REGION_OPTIONS} />
            </div>
            <button
              className="inline-flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
              type="button"
              onClick={handleClearFilters}
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              <span>Xóa bộ lọc</span>
            </button>
          </section>

          {/* BẢNG QUẢN LÝ CÔNG NỢ */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Danh sách công nợ khách hàng</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
                  {filteredCustomers.length} nông hộ
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Khách Hàng &amp; SĐT</th>
                    <th className="py-3 px-3 text-right">Tổng Mua</th>
                    <th className="py-3 px-3 text-right">Đã Trả</th>
                    <th className="py-3 px-3 text-right font-bold text-slate-900">Còn Nợ</th>
                    <th className="py-3 px-3 text-center">Hạn Trả</th>
                    <th className="py-3 px-3 text-center">Trạng Thái</th>
                    <th className="py-3 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredCustomers.length === 0 ? (
                    <EmptyTableRow colSpan={7} message="Không tìm thấy khách hàng phù hợp với bộ lọc." className="text-slate-400" />
                  ) : null}
                  {paginatedCustomers.map((customer) => {
                    const isSelected = customer.id === selectedId
                    return (
                      <tr
                        key={customer.id}
                        onClick={() => setSelectedId(customer.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/70 border-l-4 border-l-[#1E5E3A]'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{customer.name}</span>
                            {customer.cropBadge && (
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-[#1E5E3A] text-[10px] rounded font-bold">
                                {customer.cropBadge}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{customer.phone} · {customer.addressShort}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">{customer.totalPurchase}</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-700 font-medium">{customer.paidAmount}</td>
                        <td className={`py-3 px-3 text-right font-mono font-bold ${customer.remainingCellClassName}`}>
                          {customer.remaining}
                        </td>
                        <td className={`py-3 px-3 text-center font-mono text-xs ${customer.dueDateClassName}`}>{customer.dueDate}</td>
                        <td className="py-3 px-3 text-center">
                          <StatusBadge label={customer.statusBadge.label} className={customer.statusBadge.className} minWidthClassName="min-w-[110px]" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <RowActionsMenu
                              triggerLabel={`Thao tác công nợ ${customer.name}`}
                              actions={customer.actions.map((action) => ({
                                ...action,
                                onClick: () => handleDebtAction(customer.id, action.label),
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
              unitLabel="khách hàng"
              goPrev={goPrev}
              goNext={goNext}
              setPage={setPage}
            />
          </div>
        </>
      )}

  {/* TAB 2: DUYỆT TÍN DỤNG MÙA VỤ (WF-03) */}
  {activeTab === 'credit-requests' && (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1E5E3A]">credit_score</span>
            <span>Hàng đợi duyệt hạn mức tín dụng mùa vụ (Gối nợ vật tư lúa)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Nông dân đặt mua vật tư lúa và gửi yêu cầu gối nợ. Chủ đại lý Hai Thắng thẩm định hạn mức trước khi xuất kho.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs whitespace-nowrap self-start sm:self-auto">
          {pendingCreditCount} yêu cầu chờ duyệt
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Mã YC / Đơn hàng</th>
                <th className="py-3 px-4">Nông dân &amp; SĐT</th>
                <th className="py-3 px-3">Vụ mùa</th>
                <th className="py-3 px-3 text-right">Số tiền đề nghị</th>
                <th className="py-3 px-3 text-right">Hạn mức / Còn lại</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {creditRequests.map((cr) => {
                const isPending = cr.status === 'PENDING_APPROVAL'
                const isApproved = cr.status === 'APPROVED'
                const isRejected = cr.status === 'REJECTED'

                return (
                  <tr key={cr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{cr.id}</div>
                      <div className="text-slate-500 text-[11px]">{cr.orderCode}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{cr.farmerName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{cr.farmerPhone}</div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">{cr.cropSeason}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-[#1E5E3A] text-sm">
                      {formatVnd(cr.requestedAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[11px]">
                      <div>HM: {formatVnd(cr.seasonalLimit)}</div>
                      <div className="text-emerald-700 font-semibold">Còn lại: {formatVnd(cr.remainingLimit)}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-300">
                          Chờ phê duyệt
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300">
                          Đã phê duyệt
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-300">
                          Từ chối cấp nợ
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isPending ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApproveCredit(cr.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#1E5E3A] hover:bg-[#17482D] text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[15px]">check</span>
                            <span>Phê duyệt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectCredit(cr.id)}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic max-w-[200px] mx-auto text-left">
                          {cr.reviewerNote}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

  {/* TAB 3: XÁC NHẬN TRẢ NỢ (WF-04) */}
  {activeTab === 'repayments' && (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1E5E3A]">payments</span>
            <span>Hàng đợi xác nhận thanh toán trả nợ vụ mùa</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Nông dân chuyển khoản VietQR vào Vietcombank 19006828999 hoặc nộp tiền mặt. Chủ đại lý Hai Thắng kiểm tra và bấm xác nhận để khấu trừ sổ nợ.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs whitespace-nowrap self-start sm:self-auto">
          {pendingRepaymentCount} khoản chờ khớp
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Mã TT / Đơn gốc</th>
                <th className="py-3 px-4">Nông dân &amp; SĐT</th>
                <th className="py-3 px-3 text-right">Số tiền trả</th>
                <th className="py-3 px-3">Phương thức thanh toán</th>
                <th className="py-3 px-3">Ghi chú giao dịch</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác khớp sổ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paymentRequests.map((pr) => {
                const isPending = pr.status === 'PENDING_AGENT_CONFIRMATION'
                const isConfirmed = pr.status === 'CONFIRMED'
                const isRejected = pr.status === 'REJECTED'

                return (
                  <tr key={pr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{pr.id}</div>
                      <div className="text-slate-500 text-[11px]">{pr.orderCode}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{pr.farmerName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{pr.farmerPhone}</div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                      +{formatVnd(pr.amount)}
                    </td>
                    <td className="py-3.5 px-3">
                      {pr.paymentMethod === 'VIETQR' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="material-symbols-outlined text-[13px]">qr_code_2</span>
                          VietQR Vietcombank (19006828999)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          <span className="material-symbols-outlined text-[13px]">local_atm</span>
                          Tiền mặt nộp tại trạm
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-[220px]">
                      <div>{pr.note || 'Không có ghi chú'}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{pr.createdAt}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-300 animate-pulse">
                          Chờ đối soát thu tiền
                        </span>
                      )}
                      {isConfirmed && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300">
                          Đã khớp sổ nợ
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-300">
                          Từ chối khớp
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isPending ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleConfirmRepayment(pr.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#1E5E3A] hover:bg-[#17482D] text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[15px]">task_alt</span>
                            <span>Xác nhận thu nợ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectRepayment(pr.id)}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">
                          {pr.confirmedAt ? `Khớp: ${pr.confirmedAt}` : 'Đã xử lý'}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}
</>
  )
}
