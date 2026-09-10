import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageHeader } from '../../context/PageHeaderContext'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import DetailModal from '../../components/ui/DetailModal'
import Pagination from '../../components/ui/Pagination'
import EmptyTableRow from '../../components/ui/EmptyTableRow'
import SearchInput from '../../components/ui/SearchInput'
import FilterSelect from '../../components/ui/FilterSelect'
import { useSelectableList } from '../../hooks/useSelectableList'
import { useFilteredList } from '../../hooks/useFilteredList'
import { usePagination } from '../../hooks/usePagination'
import { contactRequests as INITIAL_REQUESTS } from '../../data/mockContactRequests'

const STATUS_OPTIONS = ['Tất cả trạng thái', 'Chưa xử lý', 'Đang xử lý', 'Đã xử lý']
const REQUEST_TYPE_OPTIONS = ['Tất cả loại yêu cầu', 'Kỹ thuật canh tác', 'Đặt vật tư', 'Sổ nợ mùa vụ', 'Khác']

const STATUS_VISUALS: Record<string, { className: string; dotClassName: string }> = {
  'Chưa xử lý': { className: 'bg-amber-100 text-amber-800 border-amber-300', dotClassName: 'bg-amber-500' },
  'Đang xử lý': { className: 'bg-sky-100 text-sky-800 border-sky-300', dotClassName: 'bg-sky-500' },
  'Đã xử lý': { className: 'bg-emerald-100 text-emerald-800 border-emerald-300', dotClassName: 'bg-emerald-600' },
}

export default function ContactPage() {
  usePageHeader({
    title: 'Yêu cầu hỗ trợ',
  })

  const { showToast } = useToast()
  const { user } = useAuth()
  const [requests, setRequests] = useState(INITIAL_REQUESTS)

  const setRequestStatus = (id: string, label: string) => {
    const visuals = STATUS_VISUALS[label]
    if (!visuals) return
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              statusBadge: { label, className: visuals.className, dotClassName: visuals.dotClassName },
              assignedTo: label === 'Chưa xử lý' ? undefined : `${user.name} (${user.role})`,
              actions:
                label === 'Đã xử lý'
                  ? [{ label: 'Xem chi tiết', icon: 'visibility' }]
                  : [
                      { label: 'Xem chi tiết', icon: 'visibility' },
                      { label: 'Đánh dấu đã xử lý', icon: 'task_alt', tone: 'primary' },
                    ],
            }
          : r,
      ),
    )
  }

  const handleRequestAction = (id: string, label: string) => {
    if (label === 'Xem chi tiết') {
      setSelectedId(id)
    } else if (label === 'Nhận xử lý') {
      setRequestStatus(id, 'Đang xử lý')
      showToast(`Bạn đã nhận xử lý yêu cầu #${id}`)
    } else if (label === 'Đánh dấu đã xử lý') {
      setRequestStatus(id, 'Đã xử lý')
      showToast(`Đã đánh dấu hoàn tất yêu cầu #${id}`)
    }
  }

  const { selectedId, setSelectedId, selected } = useSelectableList(requests, (r) => r.id)

  const [requestTypeFilter, setRequestTypeFilter] = useState(REQUEST_TYPE_OPTIONS[0])

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filtered: filteredRequests,
    clearFilters: handleClearFiltersBase,
  } = useFilteredList(
    requests,
    STATUS_OPTIONS[0],
    (request, keyword, status) =>
      (!keyword ||
        request.senderName.toLowerCase().includes(keyword) ||
        request.senderPhone.toLowerCase().includes(keyword) ||
        request.message.toLowerCase().includes(keyword)) &&
      (status === STATUS_OPTIONS[0] || request.statusBadge.label === status) &&
      (requestTypeFilter === REQUEST_TYPE_OPTIONS[0] || request.requestType === requestTypeFilter),
  )

  const handleClearFilters = () => {
    handleClearFiltersBase()
    setRequestTypeFilter(REQUEST_TYPE_OPTIONS[0])
  }

  const { page, totalPages, paginated, startIndex, endIndex, totalCount, goPrev, goNext, setPage } =
    usePagination(filteredRequests, 10)

  const pendingCount = requests.filter((r) => r.statusBadge.label === 'Chưa xử lý').length
  const inProgressCount = requests.filter((r) => r.statusBadge.label === 'Đang xử lý').length
  const resolvedCount = requests.filter((r) => r.statusBadge.label === 'Đã xử lý').length

  return (
    <>
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-body-sm font-body-sm text-outline">
        <Link className="hover:text-primary transition-colors" to="/">Bảng điều khiển</Link>
        <span className="material-symbols-outlined text-[14px]" data-icon="chevron_right">chevron_right</span>
        <span className="text-on-surface font-medium">Yêu cầu hỗ trợ</span>
      </nav>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-base shadow-sm flex items-start justify-between">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Tổng yêu cầu</span>
            <div className="font-metric-num text-metric-num text-on-surface mt-1">{requests.length}</div>
          </div>
          <div className="p-2.5 bg-surface-container rounded-lg text-primary">
            <span className="material-symbols-outlined text-2xl">forum</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border-2 border-amber-300 rounded-xl p-space-base shadow-sm flex items-start justify-between">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-amber-700">Chưa xử lý</span>
            <div className="font-metric-num text-metric-num text-amber-700 mt-1">{pendingCount}</div>
          </div>
          <div className="p-2.5 bg-amber-100 rounded-lg text-amber-700">
            <span className="material-symbols-outlined text-2xl">priority_high</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-base shadow-sm flex items-start justify-between">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Đang xử lý</span>
            <div className="font-metric-num text-metric-num text-sky-700 mt-1">{inProgressCount}</div>
          </div>
          <div className="p-2.5 bg-sky-100 rounded-lg text-sky-700">
            <span className="material-symbols-outlined text-2xl">sync</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-base shadow-sm flex items-start justify-between">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Đã xử lý</span>
            <div className="font-metric-num text-metric-num text-emerald-700 mt-1">{resolvedCount}</div>
          </div>
          <div className="p-2.5 bg-emerald-100 rounded-lg text-emerald-700">
            <span className="material-symbols-outlined text-2xl">task_alt</span>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên, số điện thoại, nội dung..." className="relative flex-1" />
        <div className="flex flex-wrap items-center gap-2.5">
          <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} className="relative min-w-[160px]" />
          <FilterSelect value={requestTypeFilter} onChange={setRequestTypeFilter} options={REQUEST_TYPE_OPTIONS} className="relative min-w-[180px]" />
          <button
            className="px-3 py-2 rounded-xl text-body-sm font-label-md text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-1"
            type="button"
            onClick={handleClearFilters}
          >
            <span className="material-symbols-outlined text-[16px]" data-icon="restart_alt">restart_alt</span>
            <span>Xóa lọc</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-label-sm uppercase tracking-wider text-outline select-none">
                <th className="py-3 px-4 font-semibold" scope="col">Người gửi &amp; Liên hệ</th>
                <th className="py-3 px-3 font-semibold" scope="col">Loại yêu cầu</th>
                <th className="py-3 px-3 font-semibold" scope="col">Nội dung</th>
                <th className="py-3 px-3 font-semibold" scope="col">Thời gian gửi</th>
                <th className="py-3 px-3 font-semibold text-center" scope="col">Trạng thái</th>
                <th className="py-3 px-4 font-semibold text-right" scope="col">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-md">
              {paginated.length === 0 ? (
                <EmptyTableRow colSpan={6} message="Không tìm thấy yêu cầu phù hợp với bộ lọc." />
              ) : null}
              {paginated.map((request) => {
                const isSelected = request.id === selectedId
                return (
                  <tr
                    key={request.id}
                    onClick={() => setSelectedId(request.id)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected ? 'bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-title-md text-title-md font-semibold text-on-surface group-hover:text-primary">
                        {request.senderName}
                      </div>
                      <div className="text-body-sm text-outline flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[13px]">{request.channelIcon}</span>
                        {request.senderPhone} · {request.channel}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant">
                        {request.requestType}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-[280px]">
                      <div className="text-body-sm text-on-surface-variant truncate" title={request.message}>{request.message}</div>
                    </td>
                    <td className="py-3 px-3 text-body-sm text-outline whitespace-nowrap">{request.submittedAgo}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${request.statusBadge.className}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${request.statusBadge.dotClassName}`}></span>
                        {request.statusBadge.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end">
                        <RowActionsMenu
                          triggerLabel={`Thao tác yêu cầu #${request.id}`}
                          actions={request.actions.map((action) => ({
                            ...action,
                            onClick: () => handleRequestAction(request.id, action.label),
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
          unitLabel="yêu cầu"
          goPrev={goPrev}
          goNext={goNext}
          setPage={setPage}
        />
      </div>

      {/* DETAIL MODAL */}
      <DetailModal open={selected !== null} onClose={() => setSelectedId(null)}>
        {selected ? (
          <div className="p-space-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-primary">#{selected.id}</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${selected.statusBadge.className}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selected.statusBadge.dotClassName}`}></span>
                {selected.statusBadge.label}
              </span>
            </div>
            <div>
              <h3 className="font-title-md text-title-md font-bold text-on-surface">{selected.senderName}</h3>
              <div className="text-body-sm text-outline flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {selected.senderArea}
              </div>
              <div className="text-body-sm text-outline flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">{selected.channelIcon}</span>
                {selected.senderPhone} · Gửi qua {selected.channel} · {selected.submittedAgo}
              </div>
            </div>
            <div className="p-space-sm bg-surface-container-low rounded border border-outline-variant">
              <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider block mb-1">
                {selected.requestType}
              </span>
              <p className="text-body-sm text-on-surface">{selected.message}</p>
            </div>
            {selected.assignedTo ? (
              <div className="text-body-sm text-on-surface-variant">
                Người phụ trách: <strong className="text-on-surface">{selected.assignedTo}</strong>
              </div>
            ) : null}
            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant">
              <a
                href={`tel:${selected.senderPhone.replace(/\./g, '')}`}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface rounded-lg text-body-sm font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">call</span>
                Gọi cho nông dân
              </a>
              <button
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface rounded-lg text-body-sm font-semibold transition-colors"
                type="button"
                onClick={() => showToast(`Đã gửi phản hồi qua Zalo/SMS cho ${selected.senderName}`)}
              >
                <span className="material-symbols-outlined text-[18px] text-blue-600">chat</span>
                Gửi phản hồi qua Zalo/SMS
              </button>
              {selected.statusBadge.label === 'Chưa xử lý' ? (
                <button
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-primary hover:bg-[#17482D] text-on-primary rounded-lg text-body-sm font-semibold transition-colors"
                  type="button"
                  onClick={() => {
                    handleRequestAction(selected.id, 'Nhận xử lý')
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                  Nhận xử lý
                </button>
              ) : selected.statusBadge.label === 'Đang xử lý' ? (
                <button
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-primary hover:bg-[#17482D] text-on-primary rounded-lg text-body-sm font-semibold transition-colors"
                  type="button"
                  onClick={() => {
                    handleRequestAction(selected.id, 'Đánh dấu đã xử lý')
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                  Đánh dấu đã xử lý
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </DetailModal>
    </>
  )
}
