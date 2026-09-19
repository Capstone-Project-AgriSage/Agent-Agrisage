import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePageHeader } from '../../context/PageHeaderContext'
import { useToast } from '../../context/ToastContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import EmptyTableRow from '../../components/ui/EmptyTableRow'
import DetailModal from '../../components/ui/DetailModal'
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

  const navigate = useNavigate()
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

  const { selectedId, setSelectedId, selected: selectedCustomer } = useSelectableList(customers, (c) => c.id)

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
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            type="button"
            onClick={handleExportDebts}
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Xuất báo cáo</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            type="button"
            onClick={handlePrintDebts}
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>In sổ nợ</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#1E5E3A] hover:bg-[#17482D] text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
            type="button"
            onClick={() => showToast('Chức năng ghi nhận thu nợ mới đang được phát triển')}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Ghi nhận thu nợ</span>
          </button>
        </div>
      </section>

      {/* 3 TABS ĐIỀU HƯỚNG */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-1.5 rounded-xl shadow-2xs shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'ledger'
              ? 'bg-[#1E5E3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">account_balance</span>
          <span>Danh sách nợ nông hộ</span>
          <span className={`px-2 py-0.2 rounded-full text-xs ${activeTab === 'ledger' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {customers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('credit-requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'credit-requests'
              ? 'bg-[#1E5E3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">credit_score</span>
          <span>Duyệt cấp nợ vụ mùa</span>
          {pendingCreditCount > 0 && (
            <span className="px-2 py-0.2 rounded-full bg-amber-500 text-white text-xs font-bold">
              {pendingCreditCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('repayments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'repayments'
              ? 'bg-[#1E5E3A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">payments</span>
          <span>Xác nhận thu nợ</span>
          {pendingRepaymentCount > 0 && (
            <span className="px-2 py-0.2 rounded-full bg-emerald-600 text-white text-xs font-bold">
              {pendingRepaymentCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'ledger' && (
        <>
          {/* COMPACT OPERATIONAL SUMMARY STRIP */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Tổng dư nợ vụ mùa</span>
                <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                  {formatVnd(totalDebtAmount)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {customers.length} nông hộ vụ Đông Xuân · Đã thu {formatVnd(totalCollected)}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
            </div>

            <div className="bg-white border border-amber-200/80 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700">Cần thu hồi nợ</span>
                <div className="text-xl font-bold text-amber-900 font-mono mt-0.5">
                  {formatVnd(dueTodayAmount + overdueAmount)}
                </div>
                <div className="text-[11px] text-amber-800 mt-0.5 flex items-center gap-1.5">
                  <span className="font-semibold">{dueTodayCustomers.length} hộ đến hạn</span>
                  <span>·</span>
                  <span className="font-semibold text-rose-700">{overdueCustomers.length} hộ quá hạn</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <span className="material-symbols-outlined text-[20px]">alarm</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Tác vụ nợ chờ xử lý</span>
                <div className="text-xl font-bold text-[#1E5E3A] font-mono mt-0.5">
                  {pendingCreditCount + pendingRepaymentCount} <span className="text-sm font-normal text-slate-500">yêu cầu</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                  <button type="button" onClick={() => setActiveTab('credit-requests')} className="text-[#1E5E3A] font-medium hover:underline">
                    {pendingCreditCount} cấp nợ
                  </button>
                  <span>·</span>
                  <button type="button" onClick={() => setActiveTab('repayments')} className="text-emerald-700 font-medium hover:underline">
                    {pendingRepaymentCount} thu nợ
                  </button>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#1E5E3A]">
                <span className="material-symbols-outlined text-[20px]">pending_actions</span>
              </div>
            </div>
          </section>

          {/* FILTER TOOLBAR */}
          <section className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
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

          {/* SCANNABLE DEBT TABLE */}
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
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Khách Hàng &amp; SĐT</th>
                    <th className="py-2.5 px-3 text-right">Tổng Mua</th>
                    <th className="py-2.5 px-3 text-right">Đã Trả</th>
                    <th className="py-2.5 px-3 text-right font-bold text-slate-900">Còn Nợ</th>
                    <th className="py-2.5 px-3 text-center">Hạn Trả</th>
                    <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                    <th className="py-2.5 px-4 text-center">Thao Tác</th>
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
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedId(customer.id)}
                              className="px-2.5 py-1 text-xs font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              Chi tiết
                            </button>
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
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-300">
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

    {/* DETAIL MODAL: CHI TIẾT CÔNG NỢ NÔNG HỘ */}
    <DetailModal open={selectedCustomer !== null} onClose={() => setSelectedId(null)} widthClassName="max-w-lg">
      {selectedCustomer ? (
        <div className="flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base text-slate-900 font-bold">{selectedCustomer.name}</h3>
                {selectedCustomer.cropBadge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-[#1E5E3A] font-bold border border-emerald-200">
                    {selectedCustomer.cropBadge}
                  </span>
                )}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold">
                  #{selectedCustomer.id}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span className="font-mono text-slate-700 font-medium">{selectedCustomer.phone}</span>
                <span>·</span>
                <span>{selectedCustomer.addressShort}</span>
              </div>
            </div>
            <StatusBadge label={selectedCustomer.statusBadge.label} className={selectedCustomer.statusBadge.className} />
          </div>

          {/* Body */}
          <div className="p-4 space-y-3.5 overflow-y-auto max-h-[70vh] text-xs">
            {/* 1. THÔNG TIN RUỘNG ĐẤT & VỤ MÙA */}
            <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-slate-400">agriculture</span>
                <span>Hồ sơ canh tác &amp; địa chỉ</span>
              </div>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Quy mô canh tác:</span>
                  <span className="font-semibold text-slate-900">{selectedCustomer.landNote}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Địa chỉ cụ thể:</span>
                  <span className="font-medium text-slate-800 text-right max-w-[260px]">{selectedCustomer.fullAddress}</span>
                </div>
              </div>
            </div>

            {/* 2. TỔNG QUAN NỢ VỤ MÙA & TIẾN ĐỘ HOÀN ỨNG */}
            <div className={`border rounded-xl p-3.5 ${selectedCustomer.remainingSectionClassName}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px] text-[#1E5E3A]">account_balance_wallet</span>
                  <span>Tình trạng dư nợ vụ mùa</span>
                </div>
                <span className="text-[11px] font-mono text-slate-600 font-semibold">{selectedCustomer.dueDetailNote}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 my-2.5">
                <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-500">Tổng phát sinh</div>
                  <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">{selectedCustomer.totalPurchase}</div>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-500">Đã thanh toán</div>
                  <div className="text-xs font-bold text-emerald-700 font-mono mt-0.5">{selectedCustomer.paidAmount}</div>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
                  <div className="text-[10px] text-slate-500 font-bold text-amber-800">Còn phải thu</div>
                  <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">{selectedCustomer.remaining}</div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-2">
                <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-medium">
                  <span>Tiến độ thu nợ vụ mùa</span>
                  <span className="font-bold text-[#1E5E3A]">{selectedCustomer.paidPercent}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#1E5E3A] h-full transition-all" style={{ width: selectedCustomer.progressBarWidth }}></div>
                </div>
              </div>
            </div>

            {/* 3. CÁC ĐƠN HÀNG GỐI NỢ LIÊN QUAN */}
            <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">receipt_long</span>
                  <span>Đơn hàng liên quan vụ mùa</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">{selectedCustomer.relatedOrders?.length ?? 0} đơn</span>
              </div>
              <div className="space-y-2">
                {selectedCustomer.relatedOrders?.map((order, idx) => (
                  <div key={idx} className={`p-2.5 rounded-lg border ${order.cardClassName}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-900 font-mono text-xs">{order.id}</div>
                        {order.dateNote && <div className="text-[11px] text-slate-500 mt-0.5">{order.dateNote}</div>}
                        {order.dueNote && <div className="text-[11px] text-amber-700 font-medium mt-0.5">{order.dueNote}</div>}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${order.statusClassName}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-1.5 mt-1.5 border-t border-slate-200/60">
                      <span className="text-slate-600">{order.totalNote}</span>
                      <span className={`font-semibold font-mono ${order.remainingClassName}`}>{order.remainingLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. LỊCH SỬ CÁC ĐỢT HOÀN ỨNG NỢ */}
            <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-slate-400">history</span>
                <span>Lịch sử thanh toán thu nợ</span>
              </div>
              {selectedCustomer.paymentHistory && selectedCustomer.paymentHistory.length > 0 ? (
                <div className="space-y-2">
                  {selectedCustomer.paymentHistory.map((ph, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${ph.dotClassName}`}></span>
                        <div>
                          <div className="font-medium text-slate-800 text-xs">{ph.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{ph.dateNote}</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 text-xs">{ph.amountLabel}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-xs italic py-2 text-center">Chưa có lịch sử thu nợ nào.</div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              type="button"
              className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
              onClick={() => {
                navigate('/orders')
                showToast(`Đang chuyển tới danh sách đơn hàng của ${selectedCustomer.name}`)
              }}
            >
              Xem đơn hàng nông hộ
            </button>
            <div className="flex items-center gap-2">
              {selectedCustomer.status !== 'Đã thanh toán' && (
                <button
                  type="button"
                  className="px-3 py-2 bg-[#1E5E3A] hover:bg-[#17482D] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1"
                  onClick={() => {
                    markDebtPaid(selectedCustomer.id)
                  }}
                >
                  <span className="material-symbols-outlined text-[15px]">paid</span>
                  <span>Ghi nhận thu nợ</span>
                </button>
              )}
              <button
                type="button"
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                onClick={() => setSelectedId(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DetailModal>
  </>
  )
}
