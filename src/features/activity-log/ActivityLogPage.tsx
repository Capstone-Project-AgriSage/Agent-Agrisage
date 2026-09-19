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
      {/* PAGE HEADER & EXPORT ACTION */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-space-md shrink-0">
        <div className="flex items-center gap-2 text-slate-500 font-label-sm text-label-sm">
          <Link className="hover:text-slate-800" to="/">Bảng điều khiển</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-800 font-semibold">Nhật ký thao tác</span>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
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
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Xuất dữ liệu nhật ký</span>
          </button>
        </div>
      </section>

      {/* COMPACT OPERATIONAL SUMMARY STRIP */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Tổng thao tác hôm nay</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
              {totalActionsToday} <span className="text-xs font-normal text-slate-500">lượt ghi nhận</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Ghi nhận qua các kênh nghiệp vụ</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <span className="material-symbols-outlined text-[20px]">history</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Đơn hàng &amp; Thanh toán</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
              {orderActionsCount + paymentActionsCount} <span className="text-xs font-normal text-slate-500">lượt</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span className="text-blue-700 font-medium">{orderActionsCount} đơn hàng</span>
              <span>·</span>
              <span className="text-emerald-700 font-medium">{paymentActionsCount} thanh toán</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
            <span className="material-symbols-outlined text-[20px]">sync_alt</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Phê duyệt gợi ý AI</span>
            <div className="text-xl font-bold text-purple-900 font-mono mt-0.5">
              {aiActions.length} <span className="text-xs font-normal text-slate-500">lượt</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span className="text-[#1E5E3A] font-semibold">{aiApprovedCount} đã duyệt</span>
              <span>·</span>
              <span className="text-rose-700 font-semibold">{aiRejectedCount} từ chối</span>
            </div>
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
            placeholder="Tìm theo mã, nội dung, người thực hiện..."
            className="relative min-w-[220px] flex-1 max-w-xs"
          />
          <FilterSelect value={moduleFilter} onChange={setModuleFilter} options={MODULE_OPTIONS} />
          <FilterSelect value={actionFilter} onChange={setActionFilter} options={ACTION_OPTIONS} />
          <FilterSelect value={actorFilter} onChange={setActorFilter} options={ACTOR_OPTIONS} />
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

      {/* ACTIVITY LOG TABLE */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Danh sách nhật ký thao tác trạm</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
                {filteredEntries.length} bản ghi
              </span>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider select-none">
                  <th className="py-2.5 px-4">Thời gian</th>
                  <th className="py-2.5 px-3">Người thực hiện</th>
                  <th className="py-2.5 px-2.5">Phân hệ</th>
                  <th className="py-2.5 px-2.5">Thao tác</th>
                  <th className="py-2.5 px-2.5">Đối tượng</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Mô tả nghiệp vụ</th>
                  <th className="py-2.5 px-2.5 text-center">Kết quả</th>
                  <th className="py-2.5 px-4 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
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
                        isSelected ? 'bg-emerald-50/70 border-l-4 border-l-[#1E5E3A]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-slate-500">
                        <div>{entry.time}</div>
                        {entry.timeNote ? <div className="text-[10px] text-slate-400">{entry.timeNote}</div> : null}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${entry.actorAvatarClassName}`}
                          >
                            {entry.actorInitials}
                          </div>
                          <span className="font-medium text-slate-900">{entry.actorName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${entry.moduleClassName}`}>
                          {entry.moduleLabel}
                        </span>
                      </td>
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${entry.actionClassName}`}>
                          {entry.actionLabel}
                        </span>
                      </td>
                      <td className="py-3 px-2.5 whitespace-nowrap font-mono font-bold text-[#1E5E3A]">{entry.objectId}</td>
                      <td className="py-3 px-3 text-slate-800">
                        <p className="line-clamp-1 font-medium text-slate-900">{entry.description}</p>
                        <span className="text-[11px] text-slate-400">{entry.descriptionNote}</span>
                      </td>
                      <td className="py-3 px-2.5 whitespace-nowrap text-center">
                        <StatusBadge label={entry.resultLabel} className={entry.resultClassName} minWidthClassName="min-w-[100px]" />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedId(entry.id)
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
            unitLabel="bản ghi"
            goPrev={goPrev}
            goNext={goNext}
            setPage={setPage}
          />
        </div>

        {/* COMPACT SECTION: SỰ KIỆN QUAN TRỌNG GẦN ĐÂY */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1E5E3A] text-[18px]">
                flag
              </span>
              <h3 className="font-bold text-sm text-slate-900">Sự kiện quan trọng gần đây</h3>
            </div>
            <span className="text-[11px] text-slate-400">Ghi nhận qua kênh nghiệp vụ chính thức</span>
          </div>
          <div className="space-y-2">
            {LOG_ENTRIES.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">Không có sự kiện nào gần đây.</p>
            ) : (
              LOG_ENTRIES.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${entry.moduleClassName}`}
                  >
                    {entry.moduleLabel}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800 font-medium truncate">{entry.description}</p>
                    <p className="text-[10px] text-slate-400 truncate">{entry.descriptionNote}</p>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px] whitespace-nowrap">{entry.time}</span>
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
                <StatusBadge label={selected.resultLabel} className={selected.resultClassName} />
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
          <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
            <button
              className="w-full py-2.5 px-3 bg-[#1E5E3A] hover:bg-[#17482D] text-white text-xs font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
              type="button"
              onClick={() => {
                navigate('/ai-recommendations')
                showToast(`Đang mở phân tích AI gốc cho ${selected.objectId}`)
              }}
            >
              <span className="material-symbols-outlined text-[18px]">
                psychology
              </span>
              <span>Xem phân tích AI gốc</span>
            </button>
            <button
              className="w-full py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl shadow-2xs flex items-center justify-center gap-2 transition"
              type="button"
              onClick={() => {
                navigate('/farmers')
                showToast(`Đang mở hồ sơ liên quan đến ${selected.actorName}`)
              }}
            >
              <span className="material-symbols-outlined text-[18px] text-slate-500">
                contact_page
              </span>
              <span>Xem hồ sơ khách hàng</span>
            </button>
          </div>
          </div>
        ) : null}
      </DetailModal>
    </>
  )
}
