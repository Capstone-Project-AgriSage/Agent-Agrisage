import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageHeader } from '../../context/PageHeaderContext'
import { useToast } from '../../context/ToastContext'
import EmptyTableRow from '../../components/ui/EmptyTableRow'
import DetailModal from '../../components/ui/DetailModal'
import Pagination from '../../components/ui/Pagination'
import SearchInput from '../../components/ui/SearchInput'
import FilterSelect from '../../components/ui/FilterSelect'
import { useSelectableList } from '../../hooks/useSelectableList'
import { useFilteredList } from '../../hooks/useFilteredList'
import { usePagination } from '../../hooks/usePagination'
import { logEntries as LOG_ENTRIES } from '../../data/mockActivityLog'
import { downloadCsv } from '../../utils/csv'

const MODULE_OPTIONS = ['Tất cả phân hệ', 'Đơn hàng', 'Giao hàng', 'Thanh toán', 'Công nợ', 'Gợi ý AI', 'Kho hàng', 'Sản phẩm', 'Nông dân']
const ACTION_OPTIONS = ['Tất cả loại thao tác', 'Tạo mới', 'Cập nhật', 'Xác nhận', 'Phê duyệt', 'Từ chối', 'Đối soát', 'Gửi nhắc', 'Điều chỉnh', 'Xuất kho', 'Nhập kho']
const ACTOR_OPTIONS = ['Người thực hiện: Tất cả', 'Nguyễn Văn Minh', 'ĐP. Lê Hoàng', 'KT. Trần Thảo', 'Hệ thống VietQR']

export default function ActivityLogPage() {
  usePageHeader({
    title: 'Nhật ký thao tác',
  })

  const { showToast } = useToast()
  const navigate = useNavigate()
  const { selectedId, setSelectedId, selected } = useSelectableList(LOG_ENTRIES, (entry) => entry.id)

  const [actionFilter, setActionFilter] = useState(ACTION_OPTIONS[0])
  const [actorFilter, setActorFilter] = useState(ACTOR_OPTIONS[0])

  const {
    search,
    setSearch,
    statusFilter: moduleFilter,
    setStatusFilter: setModuleFilter,
    filtered: filteredEntries,
    clearFilters: handleClearFiltersBase,
  } = useFilteredList(
    LOG_ENTRIES,
    MODULE_OPTIONS[0],
    (entry, keyword, moduleFilter) =>
      (!keyword ||
        entry.id.toLowerCase().includes(keyword) ||
        entry.actorName.toLowerCase().includes(keyword) ||
        entry.description.toLowerCase().includes(keyword) ||
        entry.objectId.toLowerCase().includes(keyword)) &&
      (moduleFilter === MODULE_OPTIONS[0] || entry.moduleLabel === moduleFilter) &&
      (actionFilter === ACTION_OPTIONS[0] || entry.actionLabel === actionFilter) &&
      (actorFilter === ACTOR_OPTIONS[0] || entry.actorName === actorFilter),
  )

  const handleClearFilters = () => {
    handleClearFiltersBase()
    setActionFilter(ACTION_OPTIONS[0])
    setActorFilter(ACTOR_OPTIONS[0])
  }

  const {
    page,
    totalPages,
    paginated: paginatedEntries,
    startIndex,
    endIndex,
    totalCount,
    goPrev,
    goNext,
    setPage,
  } = usePagination(filteredEntries, 10)

  const totalActionsToday = LOG_ENTRIES.length
  const orderActionsCount = LOG_ENTRIES.filter((e) => e.moduleLabel === 'Đơn hàng').length
  const paymentActionsCount = LOG_ENTRIES.filter((e) => e.moduleLabel === 'Thanh toán').length
  const aiActions = LOG_ENTRIES.filter((e) => e.moduleLabel === 'Gợi ý AI')
  const aiApprovedCount = aiActions.filter((e) => e.actionLabel === 'Phê duyệt').length
  const aiRejectedCount = aiActions.filter((e) => e.actionLabel === 'Từ chối').length

  return (
    <>
      {/* Trailing Action: Export Data */}
      <div className="flex items-center justify-end gap-space-sm">
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant hover:border-outline text-on-surface rounded-lg font-label-md text-label-md font-semibold shadow-sm hover:bg-surface-container-low active:bg-surface-container-high transition"
          type="button"
          onClick={() => {
            downloadCsv(
              `nhat-ky-thao-tac-${Date.now()}.csv`,
              filteredEntries.map((entry) => ({
                'Thời gian': entry.time,
                'Người thực hiện': entry.actorName,
                'Phân hệ': entry.moduleLabel,
                'Thao tác': entry.actionLabel,
                'Đối tượng': entry.objectId,
                'Mô tả': entry.description,
                'Kết quả': entry.resultLabel,
              })),
            )
            showToast(`Đã xuất dữ liệu nhật ký (${filteredEntries.length} bản ghi)`)
          }}
        >
          <span className="material-symbols-outlined text-outline" data-icon="download">
            download
          </span>
          <span className="">Xuất dữ liệu nhật ký</span>
        </button>
      </div>

      {/* ==================== 4 SUMMARY KPI CARDS ==================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* KPI 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-label-md text-on-surface-variant">Tổng thao tác hôm nay</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="history">
                history
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-metric-num text-metric-num text-on-surface font-bold">{totalActionsToday}</span>
            <span className="font-body-sm text-body-sm text-outline">lượt</span>
          </div>
          <div className="mt-2 pt-2 border-t border-outline-variant/60 flex items-center gap-1.5">
            <span className="font-body-sm text-[11px] text-outline">Ghi nhận qua các kênh nghiệp vụ</span>
          </div>
        </div>
        {/* KPI 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-label-md text-on-surface-variant">Đơn hàng cập nhật</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="shopping_cart">
                shopping_cart
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-metric-num text-metric-num text-on-surface font-bold">{orderActionsCount}</span>
            <span className="font-body-sm text-body-sm text-outline">lượt</span>
          </div>
          <div className="mt-2 pt-2 border-t border-outline-variant/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span className="font-body-sm text-[11px] text-on-surface-variant">Đã duyệt &amp; xuất kho</span>
          </div>
        </div>
        {/* KPI 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-label-md text-on-surface-variant">Thanh toán ghi nhận</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="payments">
                payments
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-metric-num text-metric-num text-on-surface font-bold">{paymentActionsCount}</span>
            <span className="font-body-sm text-body-sm text-outline">lượt</span>
          </div>
          <div className="mt-2 pt-2 border-t border-outline-variant/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span className="font-body-sm text-[11px] text-on-surface-variant">Khớp lệnh VietQR &amp; tiền mặt</span>
          </div>
        </div>
        {/* KPI 4 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-label-md text-on-surface-variant">Gợi ý AI đã xử lý</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <span className="material-symbols-outlined" data-icon="psychology">
                psychology
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-metric-num text-metric-num text-on-surface font-bold">{aiActions.length}</span>
            <span className="font-body-sm text-body-sm text-outline">lượt</span>
          </div>
          <div className="mt-2 pt-2 border-t border-outline-variant/60 flex items-center gap-2">
            <span className="inline-flex items-center text-primary-container font-semibold text-[11px]">{aiApprovedCount} phê duyệt</span>
            <span className="text-outline">•</span>
            <span className="inline-flex items-center text-error font-semibold text-[11px]">{aiRejectedCount} từ chối</span>
          </div>
        </div>
      </section>

      {/* ==================== FILTER TOOLBAR ==================== */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm">
        <div className="flex flex-wrap items-center gap-space-sm justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Tìm kiếm theo mã, nội dung, người thực hiện..." />
          {/* Dropdowns Group */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <FilterSelect value={moduleFilter} onChange={setModuleFilter} options={MODULE_OPTIONS} />
            <FilterSelect value={actionFilter} onChange={setActionFilter} options={ACTION_OPTIONS} />
            <FilterSelect value={actorFilter} onChange={setActorFilter} options={ACTOR_OPTIONS} />
            {/* Xóa bộ lọc */}
            <button
              className="flex items-center gap-1 text-outline hover:text-error px-2.5 py-1.5 rounded-lg hover:bg-error-container/20 font-label-md text-label-md transition"
              type="button"
              onClick={handleClearFilters}
            >
              <span className="material-symbols-outlined text-[16px]" data-icon="restart_alt">
                restart_alt
              </span>
              <span className="">Xóa bộ lọc</span>
            </button>
          </div>
        </div>
      </section>

      {/* ACTIVITY LOG TABLE & RECENT EVENTS */}
      <div className="space-y-space-md">
          {/* Table Container */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-label-sm uppercase tracking-wider text-outline select-none">
                    <th className="py-2.5 px-3">Thời gian</th>
                    <th className="py-2.5 px-3">Người thực hiện</th>
                    <th className="py-2.5 px-2">Phân hệ</th>
                    <th className="py-2.5 px-2">Thao tác</th>
                    <th className="py-2.5 px-2">Đối tượng</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Mô tả nghiệp vụ</th>
                    <th className="py-2.5 px-2 text-center">Kết quả</th>
                    <th className="py-2.5 px-3 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-sm font-body-sm">
                  {filteredEntries.length === 0 ? (
                    <EmptyTableRow colSpan={8} message="Không tìm thấy nhật ký phù hợp với bộ lọc." />
                  ) : null}
                  {paginatedEntries.map((entry) => {
                    const isSelected = entry.id === selectedId
                    return (
                      <tr
                        key={entry.id}
                        onClick={() => setSelectedId(entry.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-emerald-50/70 border-l-4 border-primary-container' : 'hover:bg-surface-container-low'
                        }`}
                      >
                        <td
                          className={`py-3 px-3 whitespace-nowrap font-mono text-[12px] ${
                            isSelected ? 'font-medium text-on-surface' : 'text-outline'
                          }`}
                        >
                          {entry.time}
                          {entry.timeNote ? <div className="text-[10px] text-outline">{entry.timeNote}</div> : null}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${entry.actorAvatarClassName}`}
                            >
                              {entry.actorInitials}
                            </div>
                            <span className="font-medium text-on-surface">{entry.actorName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${entry.moduleClassName}`}>
                            {entry.moduleLabel}
                          </span>
                        </td>
                        <td className="py-3 px-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${entry.actionClassName}`}>
                            {entry.actionLabel}
                          </span>
                        </td>
                        <td className="py-3 px-2 whitespace-nowrap font-mono font-bold text-primary">{entry.objectId}</td>
                        <td className="py-3 px-3 text-on-surface">
                          <p className="line-clamp-1 font-medium text-on-surface">{entry.description}</p>
                          <span className="text-[11px] text-outline">{entry.descriptionNote}</span>
                        </td>
                        <td className="py-3 px-2 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${entry.resultClassName}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${entry.resultDotClassName}`}></span> {entry.resultLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-right">
                          <button
                            className={
                              isSelected
                                ? 'px-2.5 py-1 rounded bg-primary-container text-white text-label-sm font-semibold hover:bg-primary transition shadow-2xs'
                                : 'px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container border border-outline-variant text-on-surface text-label-sm font-semibold transition'
                            }
                          >
                            {isSelected ? 'Đang chọn' : 'Chi tiết'}
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
              unitLabel="bản ghi"
              goPrev={goPrev}
              goNext={goNext}
              setPage={setPage}
            />
          </div>
          {/* COMPACT SECTION: SỰ KIỆN QUAN TRỌNG GẦN ĐÂY */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container" data-icon="flag">
                  flag
                </span>
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Sự kiện quan trọng gần đây</h3>
              </div>
              <span className="font-label-sm text-label-sm text-outline">Ghi nhận qua kênh nghiệp vụ chính thức</span>
            </div>
            <div className="space-y-2.5">
              {LOG_ENTRIES.length === 0 ? (
                <p className="text-body-sm text-outline text-center py-4">Không có sự kiện nào gần đây.</p>
              ) : (
                LOG_ENTRIES.slice(0, 4).map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 whitespace-nowrap ${entry.moduleClassName}`}
                    >
                      {entry.moduleLabel}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-sm text-body-sm text-on-surface font-medium leading-snug">{entry.description}</p>
                      <p className="font-body-sm text-[11px] text-outline">{entry.descriptionNote}</p>
                    </div>
                    <span className="font-mono text-outline text-[11px] whitespace-nowrap">{entry.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
      </div>

      {/* DETAIL MODAL: NHẬT KÝ THAO TÁC ĐÃ CHỌN */}
      <DetailModal open={selected !== null} onClose={() => setSelectedId(null)}>
        {selected ? (
          <div className="flex flex-col overflow-hidden">
          {/* Detail Header */}
          <div className="p-space-md bg-surface-container-low border-b border-outline-variant flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-title-md text-on-surface">#{selected.id}</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${selected.resultClassName}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${selected.resultDotClassName}`}></span> {selected.resultLabel}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Thao tác: <span className="font-semibold text-primary">{selected.actionTypeLabel}</span>
              </p>
            </div>
          </div>
          {/* Body Content Zones */}
          <div className="flex-1 min-h-0 p-space-md space-y-space-md text-body-sm font-body-sm overflow-y-auto">
            {/* 1. THÔNG TIN CHUNG */}
            <div>
              <div className="flex items-center gap-1.5 text-outline font-label-sm uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[14px]" data-icon="info">
                  info
                </span>
                <span className="">1. THÔNG TIN CHUNG</span>
              </div>
              <div className="bg-surface-container-low/60 rounded-lg p-2.5 border border-outline-variant/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-outline">Thời gian:</span>
                  <span className="font-medium text-on-surface font-mono">
                    {selected.time} - {selected.timeNote ?? 'Hôm nay'} (04/12/2024)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Người thực hiện:</span>
                  <span className="font-medium text-on-surface text-right">
                    {selected.actorName}
                    <br />
                    <span className="text-[11px] text-outline">{selected.actorRole}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Phân hệ:</span>
                  <span className="font-medium text-primary font-semibold">{selected.moduleLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Địa chỉ IP / Thiết bị:</span>
                  <span className="font-mono text-on-surface text-[11px]">{selected.ipDevice}</span>
                </div>
              </div>
            </div>
            {/* 2. ĐỐI TƯỢNG LIÊN QUAN */}
            <div>
              <div className="flex items-center gap-1.5 text-outline font-label-sm uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[14px]" data-icon="link">
                  link
                </span>
                <span className="">2. ĐỐI TƯỢNG LIÊN QUAN</span>
              </div>
              <div className="bg-surface-container-low/60 rounded-lg p-2.5 border border-outline-variant/60 space-y-2">
                {selected.relatedObjects.map((field) => (
                  <div key={field.label} className="flex justify-between items-start">
                    <span className="text-outline">{field.label}</span>
                    <span className="font-medium text-on-surface text-right">
                      {field.value}
                      {field.sub ? (
                        <>
                          <br />
                          <span className="text-[11px] text-outline">{field.sub}</span>
                        </>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* 3. MÔ TẢ CHI TIẾT & BIẾN ĐỘNG TRẠNG THÁI */}
            <div>
              <div className="flex items-center gap-1.5 text-outline font-label-sm uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[14px]" data-icon="tune">
                  tune
                </span>
                <span className="">3. CHI TIẾT &amp; BIẾN ĐỘNG TRẠNG THÁI</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg border border-outline-variant bg-white">
                  <span className="text-[11px] font-semibold text-outline uppercase block mb-1">Nội dung thao tác</span>
                  <p
                    className="text-on-surface leading-relaxed text-body-sm"
                    dangerouslySetInnerHTML={{ __html: selected.operationContentHtml }}
                  />
                </div>
                {/* State transition flow */}
                <div className="p-2.5 rounded-lg border border-outline-variant bg-surface-container-low/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-outline block">Trước thao tác</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${selected.beforeStateClassName}`}
                    >
                      {selected.beforeStateLabel}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-outline" data-icon="arrow_forward">
                    arrow_forward
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-outline block">Sau thao tác</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${selected.afterStateClassName}`}
                    >
                      {selected.afterStateLabel}
                    </span>
                  </div>
                </div>
                {/* Technical Note */}
                {selected.technicalNote ? (
                  <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-200 text-[11px] text-tertiary">
                    <div className="font-semibold text-primary mb-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]" data-icon="edit_note">
                        edit_note
                      </span>{' '}
                      Ghi chú chuyên môn:
                    </div>
                    {selected.technicalNote}
                  </div>
                ) : null}
              </div>
            </div>
            {/* 4. LIÊN KẾT NGỮ CẢNH */}
            <div>
              <div className="flex items-center gap-1.5 text-outline font-label-sm uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[14px]" data-icon="hub">
                  hub
                </span>
                <span className="">4. LIÊN KẾT NGỮ CẢNH</span>
              </div>
              <div className="space-y-1.5">
                {selected.relatedLinks.map((link) => (
                  <a
                    key={link.label}
                    className="flex items-center justify-between p-2 rounded-lg border border-outline-variant hover:border-primary bg-white hover:bg-surface-container-low transition group"
                    href="#"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline group-hover:text-primary" data-icon={link.icon}>
                        {link.icon}
                      </span>
                      <span className="text-body-sm font-medium text-on-surface">{link.label}</span>
                    </div>
                    {link.badgeLabel ? (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${link.badgeClassName ?? 'bg-surface-container text-primary'}`}
                      >
                        {link.badgeLabel}
                      </span>
                    ) : (
                      <span
                        className="material-symbols-outlined text-[14px] text-outline group-hover:text-primary"
                        data-icon="chevron_right"
                      >
                        chevron_right
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
          {/* 5. THAO TÁC NGỮ CẢNH (FOOTER ACTIONS) */}
          <div className="p-space-md bg-surface-container-low border-t border-outline-variant space-y-2">
            <button
              className="w-full py-2 px-3 bg-primary-container hover:bg-primary text-white font-label-md text-label-md font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.99]"
              type="button"
              onClick={() => {
                navigate('/ai-recommendations')
                showToast(`Đang mở phân tích AI gốc cho ${selected.objectId}`)
              }}
            >
              <span className="material-symbols-outlined text-[18px]" data-icon="psychology">
                psychology
              </span>
              <span className="">Xem phân tích AI gốc</span>
            </button>
            <button
              className="w-full py-2 px-3 bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-medium rounded-lg flex items-center justify-center gap-2 transition"
              type="button"
              onClick={() => {
                navigate('/farmers')
                showToast(`Đang mở hồ sơ liên quan đến ${selected.actorName}`)
              }}
            >
              <span className="material-symbols-outlined text-[18px] text-outline" data-icon="contact_page">
                contact_page
              </span>
              <span className="">Xem hồ sơ khách hàng</span>
            </button>
          </div>
          </div>
        ) : null}
      </DetailModal>
    </>
  )
}
