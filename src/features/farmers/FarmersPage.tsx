import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePageHeader } from '../../context/PageHeaderContext'
import { useToast } from '../../context/ToastContext'
import EmptyTableRow from '../../components/ui/EmptyTableRow'
import DetailModal from '../../components/ui/DetailModal'
import Pagination from '../../components/ui/Pagination'
import SearchInput from '../../components/ui/SearchInput'
import FilterSelect from '../../components/ui/FilterSelect'
import StatusBadge from '../../components/ui/StatusBadge'
import { useSelectableList } from '../../hooks/useSelectableList'
import { useFilteredList } from '../../hooks/useFilteredList'
import { usePagination } from '../../hooks/usePagination'
import { farmers as FARMERS } from '../../data/mockFarmers'
import { parseVnd, formatVnd } from '../../utils/money'
import { downloadCsv } from '../../utils/csv'

const DEBT_OPTIONS = ['Tất cả công nợ', 'Có công nợ', 'Không có nợ', 'Nợ quá hạn']
const REGION_OPTIONS = ['Tất cả khu vực', ...new Set(FARMERS.map((f) => f.areaShort.split(',').pop()?.trim() ?? '').filter(Boolean))]
const ACTIVITY_OPTIONS = ['Tất cả hoạt động', 'Đang hoạt động', 'Ít hoạt động']

export default function FarmersPage() {
  usePageHeader({
    title: 'Quản lý nông dân',
  })

  const { showToast } = useToast()
  const navigate = useNavigate()
  const { selectedId, setSelectedId, selected: selectedFarmer } = useSelectableList(FARMERS, (f) => f.id)

  const handleExportFarmers = () => {
    downloadCsv(
      `nong-dan-${Date.now()}.csv`,
      filteredFarmers.map((f) => ({
        'Tên nông dân': f.name,
        'SĐT': f.phone,
        'Khu vực': f.areaShort,
        'Tổng mua': f.totalPurchaseLabel,
        'Công nợ': f.hasDebt ? f.debtLabel : 'Không có nợ',
        'Trạng thái': f.statusBadge.label,
      })),
    )
    showToast(`Đã xuất danh sách ${filteredFarmers.length} nông dân`)
  }

  const [regionFilter, setRegionFilter] = useState(REGION_OPTIONS[0])
  const [activityFilter, setActivityFilter] = useState(ACTIVITY_OPTIONS[0])

  const {
    search,
    setSearch,
    statusFilter: debtFilter,
    setStatusFilter: setDebtFilter,
    filtered: filteredFarmers,
    clearFilters: handleClearFiltersBase,
  } = useFilteredList(
    FARMERS,
    DEBT_OPTIONS[0],
    (farmer, keyword, debtFilter) =>
      (!keyword ||
        farmer.name.toLowerCase().includes(keyword) ||
        farmer.phone.toLowerCase().includes(keyword) ||
        farmer.areaShort.toLowerCase().includes(keyword)) &&
      (debtFilter === DEBT_OPTIONS[0] ||
        (debtFilter === 'Có công nợ' && farmer.hasDebt) ||
        (debtFilter === 'Không có nợ' && !farmer.hasDebt) ||
        (debtFilter === 'Nợ quá hạn' && farmer.statusBadge.label === 'Quá hạn nợ')) &&
      (regionFilter === REGION_OPTIONS[0] || farmer.areaShort.includes(regionFilter)) &&
      (activityFilter === ACTIVITY_OPTIONS[0] || farmer.statusBadge.label === activityFilter),
  )

  const handleClearFilters = () => {
    handleClearFiltersBase()
    setRegionFilter(REGION_OPTIONS[0])
    setActivityFilter(ACTIVITY_OPTIONS[0])
  }

  const { page, totalPages, paginated: paginatedFarmers, startIndex, endIndex, totalCount, goPrev, goNext, setPage } =
    usePagination(filteredFarmers, 10)

  const totalFarmers = FARMERS.length
  const totalOrders = FARMERS.reduce((sum, f) => sum + (Number.parseInt(f.totalOrdersCount, 10) || 0), 0)
  const activeFarmerCount = FARMERS.filter((f) => f.statusBadge.label === 'Đang hoạt động').length
  const activePercent = totalFarmers ? Math.round((activeFarmerCount / totalFarmers) * 1000) / 10 : 0
  const inDebtFarmers = FARMERS.filter((f) => f.hasDebt)
  const totalDebtAmount = inDebtFarmers.reduce((sum, f) => sum + parseVnd(f.debtLabel), 0)
  const aiLogCount = FARMERS.reduce((sum, f) => sum + f.aiLogs.length, 0)

  return (
    <>
      {/* PAGE HEADER & ACTIONS */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-space-md shrink-0">
        <div className="flex items-center gap-2 text-slate-500 font-label-sm text-label-sm">
          <Link className="hover:text-slate-800" to="/">Bảng điều khiển</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-800 font-semibold">Quản lý nông dân</span>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            type="button"
            onClick={handleExportFarmers}
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Xuất danh sách</span>
          </button>
        </div>
      </section>

      {/* COMPACT OPERATIONAL SUMMARY STRIP */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Tổng nông dân</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
              {totalFarmers} <span className="text-xs font-normal text-slate-500">nông hộ</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Phụ trách tại Trạm #04</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#1E5E3A]">
            <span className="material-symbols-outlined text-[20px]">people</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Giao dịch vụ mùa</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
              {totalOrders} <span className="text-xs font-normal text-slate-500">đơn hàng</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">{activePercent}% đang hoạt động</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Đang có công nợ</span>
            <div className="text-xl font-bold text-amber-900 font-mono mt-0.5">
              {inDebtFarmers.length} <span className="text-xs font-normal text-slate-500">hộ</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Tổng nợ: <span className="font-mono font-semibold text-slate-700">{formatVnd(totalDebtAmount)}</span></div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <span className="material-symbols-outlined text-[20px]">credit_card_off</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Phân tích AI gần đây</span>
            <div className="text-xl font-bold text-purple-900 font-mono mt-0.5">
              {aiLogCount} <span className="text-xs font-normal text-slate-500">lượt</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Ghi nhận trong 14 ngày qua</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </div>
        </div>
      </section>

      {/* FILTER TOOLBAR */}
      <section className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm tên nông dân, số điện thoại..."
            className="relative min-w-[220px] flex-1 max-w-xs"
          />
          <FilterSelect value={regionFilter} onChange={setRegionFilter} options={REGION_OPTIONS} />
          <FilterSelect value={debtFilter} onChange={setDebtFilter} options={DEBT_OPTIONS} />
          <FilterSelect value={activityFilter} onChange={setActivityFilter} options={ACTIVITY_OPTIONS} />
        </div>
        <button
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 font-semibold transition-colors"
          type="button"
          onClick={handleClearFilters}
        >
          <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
          <span>Xóa bộ lọc</span>
        </button>
      </section>

      {/* MAIN FARMER TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col overflow-hidden min-w-0">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Danh bạ nông dân liên kết</h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
              {filteredFarmers.length} nông hộ
            </span>
          </div>
        </div>
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Nông dân</th>
                <th className="py-2.5 px-3">Số điện thoại</th>
                <th className="py-2.5 px-3">Khu vực</th>
                <th className="py-2.5 px-3">Đơn gần nhất</th>
                <th className="py-2.5 px-3 text-right">Tổng mua</th>
                <th className="py-2.5 px-3 text-right">Công nợ</th>
                <th className="py-2.5 px-3">Hoạt động</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-normal">
              {filteredFarmers.length === 0 ? (
                <EmptyTableRow colSpan={9} message="Không tìm thấy nông dân phù hợp với bộ lọc." className="text-slate-400" />
              ) : null}
              {paginatedFarmers.map((farmer) => {
                const isSelected = farmer.id === selectedId
                return (
                  <tr
                    key={farmer.id}
                    onClick={() => setSelectedId(farmer.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-50/70 border-l-4 border-l-[#1E5E3A]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full font-semibold flex items-center justify-center text-xs flex-shrink-0 ${
                            isSelected ? 'bg-[#1E5E3A] text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {farmer.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{farmer.name}</span>
                            {farmer.verified ? (
                              <span
                                className="material-symbols-outlined text-[#1E5E3A] text-sm"
                                title="Đã xác thực"
                              >
                                check_circle
                              </span>
                            ) : null}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">#{farmer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700 font-mono">{farmer.phone}</td>
                    <td className="py-3 px-3 text-slate-600 truncate max-w-[130px]" title={farmer.areaTitle}>
                      {farmer.areaShort}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 font-mono">{farmer.lastOrderId}</span>
                      <span className="block text-[11px] text-slate-500">{farmer.lastOrderAgo}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-900 font-mono">{farmer.totalPurchaseLabel}</td>
                    <td className="py-3 px-3 text-right">
                      {farmer.hasDebt ? (
                        <>
                          <span
                            className={`font-semibold font-mono text-xs px-1.5 py-0.5 rounded border ${
                              farmer.debtNoteClassName === 'text-red-600 font-medium'
                                ? 'text-rose-700 bg-rose-50 border-rose-200'
                                : 'text-amber-800 bg-amber-50 border-amber-200'
                            }`}
                          >
                            {farmer.debtLabel}
                          </span>
                          {farmer.debtNote ? (
                            <span className={`block text-[10px] mt-0.5 ${farmer.debtNoteClassName ?? 'text-slate-500'}`}>
                              {farmer.debtNote}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className="font-mono text-slate-400">{farmer.debtLabel}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div className="truncate max-w-[130px]" title={`${farmer.activityDate} - ${farmer.activityNote}`}>
                        {farmer.activityDate}
                      </div>
                      <span className={`text-[11px] ${farmer.activityNoteClassName}`}>{farmer.activityNote}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge label={farmer.statusBadge.label} className={farmer.statusBadge.className} minWidthClassName="min-w-[125px]" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedId(farmer.id)
                        }}
                        className="px-2.5 py-1 text-xs font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        Chi tiết
                      </button>
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
          unitLabel="nông dân"
          goPrev={goPrev}
          goNext={goNext}
          setPage={setPage}
        />
      </div>

      {/* DETAIL MODAL: THÔNG TIN NÔNG DÂN */}
      <DetailModal open={selectedFarmer !== null} onClose={() => setSelectedId(null)} widthClassName="max-w-lg">
        {selectedFarmer ? (
          <div className="flex flex-col overflow-hidden">
          {/* Detail Panel Header */}
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-container text-white font-bold text-base flex items-center justify-center shadow-sm">
                {selectedFarmer.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-title-lg text-title-lg text-slate-900 font-bold">{selectedFarmer.name}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                    #{selectedFarmer.id}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-slate-400" data-icon="phone">
                    phone
                  </span>
                  <span className="font-semibold text-slate-700">{selectedFarmer.phone}</span>
                </div>
              </div>
            </div>
            <StatusBadge label={selectedFarmer.statusBadge.label} className={selectedFarmer.statusBadge.className} />
          </div>
          {/* Panel Scrollable Content Body */}
          <div className="p-3.5 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
            {/* 1. THÔNG TIN CƠ BẢN */}
            <div className="border border-slate-200 rounded-lg p-3 bg-white">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                <span className="material-symbols-outlined text-base text-slate-400" data-icon="person_pin">
                  person_pin
                </span>
                <span className="">Thông tin cư trú &amp; thâm niên</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 min-w-[75px]">Địa chỉ:</span>
                  <span className="font-medium text-slate-800 text-right">{selectedFarmer.fullAddress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ngày tham gia:</span>
                  <span className="font-medium text-slate-800">
                    {selectedFarmer.joinDate} <span className="text-slate-500 font-normal">({selectedFarmer.tenureNote})</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Đơn vị quản lý:</span>
                  <span className="font-medium text-emerald-800">{selectedFarmer.managedBy}</span>
                </div>
              </div>
            </div>
            {/* 2. TỔNG QUAN GIAO DỊCH */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-base text-slate-400" data-icon="query_stats">
                    query_stats
                  </span>
                  <span className="">Tổng quan giao dịch</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Tổng: <strong className="text-slate-800">{selectedFarmer.totalOrdersCount}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white p-2 border border-slate-200 rounded">
                  <div className="text-[11px] text-slate-500">Tổng giá trị mua hàng</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedFarmer.totalPurchaseValue}</div>
                </div>
                <div className="bg-white p-2 border border-slate-200 rounded">
                  <div className="text-[11px] text-slate-500">{selectedFarmer.lastOrderDateNote}</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedFarmer.lastOrderValue}</div>
                </div>
              </div>
              {/* Payment ratio bar */}
              <div className="mt-2.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600">
                    Đã thanh toán: <strong className="text-emerald-800">{selectedFarmer.paidAmount}</strong> ({selectedFarmer.paidPercent})
                  </span>
                  <span className="text-slate-600">
                    Công nợ: <strong className="text-red-700">{selectedFarmer.debtLabel}</strong>
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-600 h-full" style={{ width: selectedFarmer.paidPercent }}></div>
                  <div className="bg-amber-500 h-full" style={{ width: selectedFarmer.debtPercent }}></div>
                </div>
              </div>
            </div>
            {/* 3. CÔNG NỢ CHI TIẾT */}
            {selectedFarmer.hasDebt ? (
              <div className="border border-amber-200 bg-amber-50/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-base text-amber-700" data-icon="account_balance">
                      account_balance
                    </span>
                    <span className="">Chi tiết dư nợ gối đầu</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    Vụ Đông Xuân
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tổng công nợ còn phải thu:</span>
                    <span className="font-bold text-sm text-red-700">{selectedFarmer.debtDetail.totalDebt}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Hạn thanh toán gần nhất:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedFarmer.debtDetail.dueDate}{' '}
                      <span className="text-emerald-700 font-medium">({selectedFarmer.debtDetail.dueNote})</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tình trạng rủi ro:</span>
                    <span className="text-emerald-800 font-medium">{selectedFarmer.debtDetail.riskLabel}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900 uppercase tracking-wider mb-2">
                  <span className="material-symbols-outlined text-base text-emerald-700" data-icon="account_balance">
                    account_balance
                  </span>
                  <span className="">Chi tiết dư nợ gối đầu</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">{selectedFarmer.debtDetail.dueNote}</span>
                  <span className="font-semibold text-emerald-800">{selectedFarmer.debtDetail.totalDebt}</span>
                </div>
              </div>
            )}
            {/* 4. ĐƠN HÀNG GẦN ĐÂY */}
            <div className="border border-slate-200 rounded-lg p-3 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-base text-slate-400" data-icon="receipt">
                    receipt
                  </span>
                  <span className="">3 đơn hàng gần nhất</span>
                </div>
              </div>
              <div className="space-y-2">
                {selectedFarmer.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-800">{order.id}</div>
                      <div className="text-[11px] text-slate-500">
                        {order.date} - {order.note}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">{order.amount}</div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${order.statusClassName}`}>{order.statusLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 5. HOẠT ĐỘNG AI GẦN ĐÂY */}
            <div className="border border-slate-200 rounded-lg p-3 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-base text-purple-600" data-icon="psychology">
                    psychology
                  </span>
                  <span className="">Nhật ký nhận diện AI</span>
                </div>
              </div>
              {selectedFarmer.aiLogs.length > 0 ? (
                <div className="space-y-2">
                  {selectedFarmer.aiLogs.map((log, idx) => (
                    <div key={`${log.disease}-${idx}`} className={`p-2 rounded border ${log.cardClassName}`}>
                      <div className="flex justify-between items-start">
                        <div className={`font-semibold ${log.diseaseClassName}`}>{log.disease}</div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${log.confidenceBadgeClassName}`}>
                          {log.confidenceLabel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">{log.date}</div>
                      <div className={`text-[11px] font-medium mt-0.5 flex items-center gap-1 ${log.noteClassName}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${log.dotClassName}`}></span>
                        {log.note}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-slate-500">Chưa có lượt phân tích AI nào được ghi nhận gần đây.</div>
              )}
            </div>
          </div>
          {/* DETAIL PANEL FOOTER - CONTEXTUAL ACTIONS ONLY (NO DELETE/NO ROLE CHANGE) */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 grid grid-cols-3 gap-2">
            <button
              className="px-2 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded text-center font-medium text-[11px] transition-colors leading-tight shadow-sm"
              onClick={() => {
                navigate('/orders')
                showToast(`Đang mở danh sách đơn hàng của ${selectedFarmer.name}`)
              }}
            >
              Xem tất cả đơn hàng
            </button>
            <button
              className="px-2 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded text-center font-medium text-[11px] transition-colors leading-tight shadow-sm"
              onClick={() => {
                navigate('/debts')
                showToast(`Đang mở chi tiết công nợ của ${selectedFarmer.name}`)
              }}
            >
              Chi tiết công nợ
            </button>
            <button
              className="px-2 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded text-center font-semibold text-[11px] transition-colors leading-tight shadow-sm"
              onClick={() => {
                navigate('/ai-recommendations')
                showToast(`Đang mở lịch sử phân tích AI của ${selectedFarmer.name}`)
              }}
            >
              Lịch sử phân tích AI
            </button>
          </div>
          </div>
        ) : null}
      </DetailModal>
    </>
  )
}
