import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageHeader } from '../../context/PageHeaderContext'
import { useToast } from '../../context/ToastContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import EmptyTableRow from '../../components/ui/EmptyTableRow'
import DetailModal from '../../components/ui/DetailModal'
import FormModal, { type FormFieldSpec } from '../../components/ui/FormModal'
import Pagination from '../../components/ui/Pagination'
import SearchInput from '../../components/ui/SearchInput'
import FilterSelect from '../../components/ui/FilterSelect'
import type { TripTimelineStep } from '../../types'
import { useSelectableList } from '../../hooks/useSelectableList'
import { useFilteredList } from '../../hooks/useFilteredList'
import { usePagination } from '../../hooks/usePagination'
import { useFormValues } from '../../hooks/useFormValues'
import { trips as INITIAL_TRIPS } from '../../data/mockDeliveries'
import { parseVnd, formatVnd } from '../../utils/money'
import { downloadCsv } from '../../utils/csv'
import type { Trip } from '../../types'

const STATUS_OPTIONS = [
  'Tất cả trạng thái (Chờ, Đang giao, Thành công...)',
  'Chờ phân công',
  'Đã phân công',
  'Đang lấy hàng',
  'Đang giao',
  'Giao thành công',
  'Giao thất bại',
]

const DRIVER_OPTIONS = ['Tất cả tài xế', 'Nguyễn Văn Út', 'Lê Hoàng Nam', 'Trần Quốc Bảo', 'Huỳnh Minh Sang']
const COD_OPTIONS = ['Tất cả COD', 'Chờ thu COD', 'Đã thu COD', 'Đã CK / 0 COD', 'Tiền mặt tại kho', 'Chưa thu được']

const NEW_TRIP_DRIVERS = DRIVER_OPTIONS.slice(1)
const emptyTripForm = {
  orderId: '',
  customerName: '',
  customerPhone: '',
  addressShort: '',
  driverName: NEW_TRIP_DRIVERS[0] ?? '',
  scheduledWindow: '',
  codAmount: '',
}

const CREATE_TRIP_FIELDS: FormFieldSpec[] = [
  { key: 'orderId', label: 'Mã đơn hàng gốc (VD: #DH-2024-1082)' },
  { key: 'customerName', label: 'Tên khách hàng' },
  { key: 'customerPhone', label: 'Số điện thoại khách hàng' },
  { key: 'addressShort', label: 'Địa chỉ giao hàng' },
  { key: 'scheduledWindow', label: 'Khung giờ hẹn giao (VD: 10:00 - 10:30)' },
  { key: 'codAmount', label: 'Số tiền thu hộ COD (₫)' },
  { key: 'driverName', label: 'Tài xế', type: 'select', options: NEW_TRIP_DRIVERS },
]

const STATUS_VISUALS: Record<string, { className: string; dotClassName: string; dotPulseClassName?: string }> = {
  'Chờ phân công': { className: 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]', dotClassName: 'bg-[#64748B]' },
  'Đã phân công': { className: 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]', dotClassName: 'bg-[#4F46E5]' },
  'Đang lấy hàng': { className: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]', dotClassName: 'bg-[#D97706]' },
  'Đang giao': { className: 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]', dotClassName: 'bg-[#2563EB]', dotPulseClassName: 'animate-ping' },
  'Giao thành công': { className: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]', dotClassName: 'bg-[#16A34A]' },
  'Giao thất bại': { className: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]', dotClassName: 'bg-[#DC2626]' },
}

export default function DeliveryPage() {
  usePageHeader({
    title: 'Quản lý giao hàng',
  })

  const [trips, setTrips] = useState(INITIAL_TRIPS)
  const { showToast } = useToast()

  const setTripStatus = (id: string, label: string) => {
    const visuals = STATUS_VISUALS[label]
    if (!visuals) return
    setTrips((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              statusBadge: { label, className: visuals.className, dotClassName: visuals.dotClassName, dotPulseClassName: visuals.dotPulseClassName },
              rowClassName: undefined,
            }
          : t,
      ),
    )
    showToast(`Đã cập nhật chuyến #${id} sang "${label}"`)
  }

  const confirmDelivery = (id: string) => {
    setTripStatus(id, 'Giao thành công')
    setTrips((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, codBadge: { label: 'Đã thu COD', className: 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]' } } : t,
      ),
    )
  }

  const handleTripAction = (id: string, label: string) => {
    if (label === 'Phân công tài xế') setTripStatus(id, 'Đã phân công')
    else if (label === 'Xử lý lại chuyến giao') setTripStatus(id, 'Đang giao')
    else if (label === 'Xem chi tiết' || label === 'Xem ghi chú') setSelectedId(id)
    else if (label === 'In phiếu giao') window.print()
    else showToast(`Đã thực hiện "${label}" cho chuyến #${id}`)
  }

  const [createOpen, setCreateOpen] = useState(false)
  const { values: createForm, update: updateCreateForm, reset: resetCreateForm } = useFormValues(emptyTripForm)

  const handleCreateTrip = () => {
    const { orderId, customerName, customerPhone, addressShort, driverName, scheduledWindow, codAmount } = createForm
    const cod = parseVnd(codAmount)
    if (!orderId.trim() || !customerName.trim() || !customerPhone.trim() || !addressShort.trim() || !scheduledWindow.trim() || cod <= 0) {
      showToast('Vui lòng nhập đầy đủ thông tin chuyến giao')
      return
    }
    const maxNum = trips.reduce((max, t) => {
      const n = Number.parseInt(t.id.split('-').pop() ?? '0', 10)
      return Number.isNaN(n) ? max : Math.max(max, n)
    }, 0)
    const newTrip: Trip = {
      id: `GH-${maxNum + 1}`,
      orderId: orderId.trim(),
      customerName: customerName.trim(),
      addressShort: addressShort.trim(),
      addressTitle: addressShort.trim(),
      driverName,
      driverIcon: 'local_shipping',
      vehicleLabel: 'Chưa xác định',
      etaLabel: scheduledWindow.trim(),
      etaClassName: 'text-[#334155] font-medium',
      codAmountLabel: formatVnd(cod),
      codAmountClassName: 'font-bold text-[#0F172A] tabular-nums',
      codBadge: { label: 'Chờ thu COD', className: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]' },
      statusBadge: { label: 'Chờ phân công', className: STATUS_VISUALS['Chờ phân công'].className, dotClassName: STATUS_VISUALS['Chờ phân công'].dotClassName },
      actions: [
        { label: 'Xem chi tiết', icon: 'visibility' },
        { label: 'Phân công tài xế', icon: 'person_add', tone: 'primary' },
      ],
      customerPhone: customerPhone.trim(),
      customerAddressDetail: addressShort.trim(),
      driverInitial: driverName.charAt(0),
      driverPhone: 'Chưa cập nhật',
      driverRoleLabel: 'Chưa phân công',
      scheduledWindow: scheduledWindow.trim(),
      timeline: [{ label: 'Đã tạo chuyến giao', time: 'Vừa xong', note: 'Chờ phân công tài xế', state: 'current', icon: 'flag' }],
      items: [],
      orderTotalLabel: formatVnd(cod),
      codToCollectLabel: formatVnd(cod),
      codNote: 'Thu tiền mặt hoặc quét VietQR cá nhân của tài xế.',
    }
    setTrips((prev) => [newTrip, ...prev])
    showToast(`Đã tạo chuyến giao ${newTrip.id}`)
    resetCreateForm()
    setCreateOpen(false)
  }

  const handleExportTrips = () => {
    downloadCsv(
      // oxlint-disable-next-line react/purity -- only invoked from a click handler, never during render
      `chuyen-giao-${Date.now()}.csv`,
      filteredTrips.map((t) => ({
        'Mã GH': t.id,
        'Mã đơn': t.orderId,
        'Khách hàng': t.customerName,
        'Địa chỉ': t.addressTitle,
        'Tài xế': t.driverName,
        'Thu COD': t.codAmountLabel,
        'Trạng thái': t.statusBadge.label,
      })),
    )
    showToast(`Đã xuất danh sách ${filteredTrips.length} chuyến giao`)
  }

  const handlePrintTrips = () => {
    showToast(`Đang in phiếu giao cho ${filteredTrips.length} chuyến`)
    window.print()
  }

  const { selectedId, setSelectedId, selected: selectedTrip } = useSelectableList(trips, (t) => t.id)

  const [driverFilter, setDriverFilter] = useState(DRIVER_OPTIONS[0])
  const [codFilter, setCodFilter] = useState(COD_OPTIONS[0])

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filtered: filteredTrips,
    clearFilters: handleClearFiltersBase,
  } = useFilteredList(
    trips,
    STATUS_OPTIONS[0],
    (trip, keyword, status) =>
      (!keyword ||
        trip.id.toLowerCase().includes(keyword) ||
        trip.orderId.toLowerCase().includes(keyword) ||
        trip.customerName.toLowerCase().includes(keyword)) &&
      (status === STATUS_OPTIONS[0] || trip.statusBadge.label === status) &&
      (driverFilter === DRIVER_OPTIONS[0] || trip.driverName === driverFilter) &&
      (codFilter === COD_OPTIONS[0] || trip.codBadge.label === codFilter),
  )

  const handleClearFilters = () => {
    handleClearFiltersBase()
    setDriverFilter(DRIVER_OPTIONS[0])
    setCodFilter(COD_OPTIONS[0])
  }

  const { page, totalPages, paginated: paginatedTrips, startIndex, endIndex, totalCount, goPrev, goNext, setPage } =
    usePagination(filteredTrips, 10)

  const waitingTrips = trips.filter((t) => t.statusBadge.label === 'Chờ phân công').length
  const deliveringTrips = trips.filter((t) => t.statusBadge.label === 'Đang giao').length
  const succeededTrips = trips.filter((t) => t.statusBadge.label === 'Giao thành công').length
  const failedTrips = trips.filter((t) => t.statusBadge.label === 'Giao thất bại').length
  const successRate = trips.length ? Math.round((succeededTrips / trips.length) * 1000) / 10 : 0
  const totalCodAmount = trips.reduce((sum, t) => sum + parseVnd(t.codAmountLabel), 0)
  const reconciledCodAmount = trips
    .filter((t) => t.codBadge.label === 'Đã thu COD')
    .reduce((sum, t) => sum + parseVnd(t.codAmountLabel), 0)

  const timelineCircleClassName = (state: TripTimelineStep['state']) => {
    switch (state) {
      case 'done':
        return 'bg-[#16A34A] text-white ring-4 ring-white'
      case 'current':
        return 'bg-[#1E5E3A] text-white ring-4 ring-[#DCFCE7] animate-pulse'
      case 'failed':
        return 'bg-[#DC2626] text-white ring-4 ring-white'
      default:
        return 'bg-[#E2E8F0] text-[#94A3B8] ring-4 ring-white'
    }
  }

  const timelineIcon = (step: TripTimelineStep) => {
    if (step.icon) return step.icon
    if (step.state === 'done') return 'check'
    if (step.state === 'failed') return 'close'
    return 'flag'
  }

  return (
    <>
      {/* 1. BREADCRUMB & PAGE HEADER WITH ONLY ONE MAIN CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-[#E2E8F0] pb-space-md">
        <div className="flex items-center gap-1.5 text-[12px] text-[#64748B] font-body-sm">
          <Link className="hover:text-[#0F172A] transition-colors" to="/">Bảng điều khiển</Link>
          <span className="material-symbols-outlined text-[14px]" data-icon="chevron_right">chevron_right</span>
          <span className="text-[#0F172A] font-medium">Quản lý giao hàng</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] rounded-lg font-label-md text-label-md shadow-sm transition-colors"
            type="button"
            onClick={handleExportTrips}
          >
            <span className="material-symbols-outlined text-[17px] text-[#64748B]" data-icon="download">download</span>
            <span className="">Xuất danh sách</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] rounded-lg font-label-md text-label-md shadow-sm transition-colors"
            type="button"
            onClick={handlePrintTrips}
          >
            <span className="material-symbols-outlined text-[17px] text-[#64748B]" data-icon="print">print</span>
            <span className="">In phiếu giao loạt</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1E5E3A] hover:bg-[#17482D] text-white rounded-lg font-label-md text-label-md shadow-sm font-semibold transition-colors focus:ring-2 focus:ring-[#1E5E3A] focus:outline-none"
            type="button"
            onClick={() => setCreateOpen(true)}
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
            <span className="">Tạo chuyến giao</span>
          </button>
        </div>
      </div>

      {/* 2. 5 THẺ KPI TÓM TẮT GIAO HÀNG (Compact KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Chờ giao</span>
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-metric-num text-metric-num text-[#0F172A] font-bold tabular-nums">{waitingTrips}</span>
            <span className="font-body-sm text-body-sm text-[#64748B]">chuyến</span>
          </div>
          <p className="font-body-sm text-[12px] text-[#D97706] mt-1 font-medium truncate flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]" data-icon="schedule">schedule</span>
            Cần xếp xe/ghe
          </p>
        </div>
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Đang giao</span>
            <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse"></span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-metric-num text-metric-num text-[#0F172A] font-bold tabular-nums">{deliveringTrips}</span>
            <span className="font-body-sm text-body-sm text-[#64748B]">chuyến</span>
          </div>
          <p className="font-body-sm text-[12px] text-[#475569] mt-1 truncate">
            Đang vận chuyển ghe xuồng &amp; xe lôi
          </p>
        </div>
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Giao thành công</span>
            <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-metric-num text-metric-num text-[#15803D] font-bold tabular-nums">{succeededTrips}</span>
            <span className="font-body-sm text-body-sm text-[#64748B]">chuyến</span>
          </div>
          <p className="font-body-sm text-[12px] text-[#15803D] mt-1 font-medium truncate">
            Đạt {successRate}%
          </p>
        </div>
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Giao thất bại</span>
            <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-metric-num text-metric-num text-[#DC2626] font-bold tabular-nums">{failedTrips}</span>
            <span className="font-body-sm text-body-sm text-[#64748B]">chuyến</span>
          </div>
          <p className="font-body-sm text-[12px] text-[#DC2626] mt-1 font-medium truncate">
            Cần xử lý lại
          </p>
        </div>
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Thu COD hôm nay</span>
            <span className="material-symbols-outlined text-[#64748B] text-[16px]" data-icon="payments">payments</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[20px] leading-tight text-[#0F172A] font-bold tabular-nums">{formatVnd(totalCodAmount)}</span>
          </div>
          <p className="font-body-sm text-[12px] text-[#475569] mt-1 truncate">
            Đã đối soát <span className="font-semibold text-[#15803D]">{formatVnd(reconciledCodAmount)}</span>
          </p>
        </div>
      </div>

      {/* 3. BỘ LỌC TÌM KIẾM (Filters bar) */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm mã giao hàng / mã đơn / khách hàng..."
            className="relative w-72 min-w-[220px]"
          />
          <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
          <FilterSelect value={driverFilter} onChange={setDriverFilter} options={DRIVER_OPTIONS} />
          <FilterSelect value={codFilter} onChange={setCodFilter} options={COD_OPTIONS} />
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm text-outline">
            <span className="material-symbols-outlined text-[16px] text-[#64748B]" data-icon="calendar_today">calendar_today</span>
            <span className="">Hôm nay - Vụ Thu Đông</span>
          </div>
        </div>
        <button
          className="text-body-sm font-body-sm text-[#64748B] hover:text-[#DC2626] flex items-center gap-1 transition-colors px-2 py-1"
          type="button"
          onClick={handleClearFilters}
        >
          <span className="material-symbols-outlined text-[16px]" data-icon="filter_alt_off">filter_alt_off</span>
          <span className="">Xóa bộ lọc</span>
        </button>
      </div>

      {/* BẢNG DỮ LIỆU GIAO HÀNG */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#FCFDFE]">
            <div className="flex items-center gap-2">
              <span className="font-title-md text-title-md font-semibold text-[#0F172A]">Danh sách các chuyến giao thực địa</span>
              <span className="px-2 py-0.5 rounded text-xs bg-[#F1F5F9] text-[#475569] font-medium tabular-nums">{filteredTrips.length} chuyến</span>
            </div>
            <div className="flex items-center gap-2 text-body-sm text-[#64748B]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#16A34A]"></span>
              <span className="">Cập nhật trực tiếp: 09:28</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse text-body-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#64748B] font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Mã GH / Đơn</th>
                  <th className="py-2.5 px-3">Khách hàng &amp; Địa chỉ</th>
                  <th className="py-2.5 px-3 text-right">Thu COD</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredTrips.length === 0 ? (
                  <EmptyTableRow colSpan={5} message="Không tìm thấy chuyến giao phù hợp với bộ lọc." className="text-[#94A3B8]" />
                ) : null}
                {paginatedTrips.map((trip) => {
                  const isSelected = trip.id === selectedId
                  return (
                    <tr
                      key={trip.id}
                      onClick={() => setSelectedId(trip.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#F0FDF4] hover:bg-[#E8F5EE] border-l-4 border-l-[#1E5E3A]'
                          : `hover:bg-[#F8FAFC] ${trip.rowClassName ?? ''}`
                      }`}
                    >
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-[#0F172A] font-title-md text-[13px]">{trip.id}</div>
                        <div className="text-[11px] text-[#64748B]">{trip.orderId}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#0F172A]">{trip.customerName}</div>
                        <div className="text-[11px] text-[#64748B] truncate max-w-[190px]" title={trip.addressTitle}>
                          {trip.addressShort}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className={trip.codAmountClassName}>{trip.codAmountLabel}</div>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${trip.codBadge.className}`}>
                          {trip.codBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${trip.statusBadge.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${trip.statusBadge.dotClassName} ${trip.statusBadge.dotPulseClassName ?? ''}`}></span>
                          {trip.statusBadge.label}
                        </span>
                        {trip.failureNote ? (
                          <div className="text-[11px] text-[#DC2626] mt-0.5 font-medium">{trip.failureNote}</div>
                        ) : null}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end">
                          <RowActionsMenu
                            triggerLabel={`Thao tác chuyến #${trip.id}`}
                            actions={trip.actions.map((action) => ({
                              ...action,
                              onClick: () => handleTripAction(trip.id, action.label),
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
            unitLabel="chuyến giao"
            goPrev={goPrev}
            goNext={goNext}
            setPage={setPage}
          />
          <div className="p-3.5 border-t border-[#E2E8F0] bg-[#FCFDFE]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#64748B] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#1E5E3A]" data-icon="sensors">sensors</span>
                Nhật ký vận hành trực tiếp trạm Cần Thơ #04
              </span>
              <span className="text-[11px] text-[#94A3B8]">Tự động đồng bộ mỗi 30 giây</span>
            </div>
            <div className="space-y-1.5 text-body-sm">
              <div className="flex items-center justify-between text-[#334155] bg-white px-2.5 py-1.5 rounded border border-[#E2E8F0]">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#15803D] font-bold bg-[#DCFCE7] px-1 rounded">09:25</span>
                  <span className=""><strong>GH-8821</strong> bắt đầu di chuyển về Thới Lai (Tài xế Út - Xe lôi)</span>
                </span>
                <span className="text-[11px] text-[#64748B]">GPS: 10.0452° N, 105.7469° E</span>
              </div>
              <div className="flex items-center justify-between text-[#334155] bg-white px-2.5 py-1.5 rounded border border-[#E2E8F0]">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#1E40AF] font-bold bg-[#DBEAFE] px-1 rounded">09:12</span>
                  <span className=""><strong>GH-8819</strong> hoàn tất giao 30 gói Virtako tại Cờ Đỏ (Tài xế Bảo - Thu đủ 2.160.000 đ)</span>
                </span>
                <span className="text-[11px] text-[#16A34A] font-medium flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]" data-icon="check_circle">check_circle</span> Đã đối soát
                </span>
              </div>
              <div className="flex items-center justify-between text-[#334155] bg-white px-2.5 py-1.5 rounded border border-[#E2E8F0]">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#B91C1C] font-bold bg-[#FEE2E2] px-1 rounded">08:45</span>
                  <span className=""><strong>GH-8817</strong> cập nhật thất bại: Khách hẹn giao sau mưa lớn (Điều phối viên Minh)</span>
                </span>
                <span className="text-[11px] text-[#DC2626] font-medium">Hẹn lại 15:00</span>
              </div>
            </div>
          </div>
        </div>

      {/* DETAIL MODAL: CHI TIẾT CHUYẾN GIAO ĐANG CHỌN */}
      <DetailModal open={selectedTrip !== null} onClose={() => setSelectedId(null)}>
        {selectedTrip ? (
          <div className="flex flex-col divide-y divide-[#E2E8F0]">
          <div className="p-4 bg-[#FCFDFE]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#64748B]">Chi tiết chuyến giao</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedTrip.statusBadge.className}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedTrip.statusBadge.dotClassName} animate-pulse`}></span>
                {selectedTrip.statusBadge.label}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <h2 className="font-headline-sm text-headline-sm font-bold text-[#0F172A]">#{selectedTrip.id}</h2>
              <span className="font-body-sm text-body-sm text-[#64748B]">Đơn gốc: <strong className="text-[#0F172A]">{selectedTrip.orderId}</strong></span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E8F5EE] text-[#1E5E3A] flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]" data-icon="person">person</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-title-md text-title-md font-semibold text-[#0F172A]">{selectedTrip.customerName}</span>
                  <a className="text-body-sm text-[#1E5E3A] font-semibold hover:underline" href={`tel:${selectedTrip.customerPhone.replace(/\./g, '')}`}>{selectedTrip.customerPhone}</a>
                </div>
                <p className="text-body-sm text-[#475569] mt-0.5 leading-snug">
                  {selectedTrip.customerAddressDetail}
                </p>
                {selectedTrip.customerNote ? (
                  <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${selectedTrip.customerNote.className}`}>
                    <span className="material-symbols-outlined text-[13px]" data-icon={selectedTrip.customerNote.icon}>{selectedTrip.customerNote.icon}</span>
                    <span className="">{selectedTrip.customerNote.text}</span>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#334155] text-white flex items-center justify-center font-bold text-xs">
                  {selectedTrip.driverInitial}
                </div>
                <div>
                  <p className="font-title-md text-[13px] font-semibold text-[#0F172A]">{selectedTrip.driverName}</p>
                  <p className="text-[11px] text-[#64748B]">{selectedTrip.driverRoleLabel} • {selectedTrip.driverPhone}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#64748B] block">Hẹn giao</span>
                <span className="text-xs font-bold text-[#1E5E3A]">{selectedTrip.scheduledWindow}</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white">
            <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-[#64748B] font-semibold mb-3">Tiến độ chuyến giao</h3>
            <div className="space-y-3.5 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#E2E8F0] pl-1">
              {selectedTrip.timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${timelineCircleClassName(step.state)}`}>
                    <span className="material-symbols-outlined text-[14px]" data-icon={timelineIcon(step)}>{timelineIcon(step)}</span>
                  </div>
                  {step.state === 'current' || step.state === 'failed' ? (
                    <div
                      className={`min-w-0 flex-1 p-2 rounded-lg border ${
                        step.state === 'current' ? 'bg-[#E8F5EE] border-[#A7F3D0]' : 'bg-[#FEE2E2] border-[#FCA5A5]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-title-md text-[13px] font-bold ${step.state === 'current' ? 'text-[#1E5E3A]' : 'text-[#B91C1C]'}`}>
                          {step.label}
                        </span>
                        <span className={`font-mono text-[11px] font-bold ${step.state === 'current' ? 'text-[#1E5E3A]' : 'text-[#B91C1C]'}`}>
                          {step.time}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${step.state === 'current' ? 'text-[#065F46]' : 'text-[#B91C1C]'}`}>{step.note}</p>
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-title-md text-[13px] ${step.state === 'done' ? 'font-semibold text-[#0F172A]' : 'font-medium text-[#64748B]'}`}>
                          {step.label}
                        </span>
                        <span className={`font-mono text-[11px] ${step.state === 'done' ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>{step.time}</span>
                      </div>
                      <p className={`text-[11px] ${step.state === 'done' ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>{step.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 space-y-2.5">
            <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-[#64748B] font-semibold">Danh mục vật tư giao đợt này</h3>
            <div className="space-y-1.5 text-body-sm divide-y divide-[#F1F5F9]">
              {selectedTrip.items.map((item) => (
                <div key={item.name} className="pt-1.5 flex justify-between items-start">
                  <div>
                    <p className="font-medium text-[#0F172A] text-[13px]">{item.name}</p>
                    <p className="text-[11px] text-[#64748B]">{item.qtyPrice}</p>
                  </div>
                  <span className="font-semibold text-[#0F172A] tabular-nums">{item.total}</span>
                </div>
              ))}
              {selectedTrip.shippingFeeNote ? (
                <div className="pt-1.5 flex justify-between items-start text-[12px] text-[#64748B]">
                  <span className="">{selectedTrip.shippingFeeNote.label}</span>
                  <span className={selectedTrip.shippingFeeNote.valueClassName}>{selectedTrip.shippingFeeNote.value}</span>
                </div>
              ) : null}
            </div>
            <div className="p-3 bg-[#FEF3C7] rounded-lg border border-[#FDE68A] mt-2">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-label-md text-label-md text-[#92400E] font-medium">Tổng tiền đơn hàng:</span>
                <span className="font-bold text-[#92400E] tabular-nums">{selectedTrip.orderTotalLabel}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1.5 border-t border-[#FCD34D]">
                <span className="font-title-md text-title-md text-[#B45309] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[17px]" data-icon="attach_money">attach_money</span>
                  Cần thu hộ COD:
                </span>
                <span className="text-[18px] font-bold text-[#92400E] tabular-nums">{selectedTrip.codToCollectLabel}</span>
              </div>
              <p className="text-[11px] text-[#B45309] mt-1 font-medium">
                * {selectedTrip.codNote}
              </p>
            </div>
          </div>
          <div className="p-4 bg-[#F8FAFC] space-y-2">
            <button
              className="w-full py-2.5 px-3 bg-[#1E5E3A] hover:bg-[#17482D] text-white rounded-lg font-title-md text-title-md font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              disabled={selectedTrip.statusBadge.label === 'Giao thành công'}
              onClick={() => confirmDelivery(selectedTrip.id)}
            >
              <span className="material-symbols-outlined text-[18px]" data-icon="check_circle">check_circle</span>
              <span className="">
                {selectedTrip.statusBadge.label === 'Giao thành công' ? 'Đã giao thành công' : 'Xác nhận giao hàng & Thu COD'}
              </span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <a
                className="py-2 px-2 bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#0F172A] rounded-lg text-body-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                href={`tel:${selectedTrip.driverPhone.replace(/\./g, '')}`}
              >
                <span className="material-symbols-outlined text-[16px] text-[#1E5E3A]" data-icon="call">call</span>
                <span className="">Gọi tài xế</span>
              </a>
              <button
                className="py-2 px-2 bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#0F172A] rounded-lg text-body-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                type="button"
                onClick={() => {
                  showToast(`Đang in phiếu giao cho chuyến #${selectedTrip.id}`)
                  window.print()
                }}
              >
                <span className="material-symbols-outlined text-[16px] text-[#64748B]" data-icon="print">print</span>
                <span className="">In phiếu giao</span>
              </button>
            </div>
            <button
              className="w-full py-1.5 px-3 bg-white border border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg text-body-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
              type="button"
              onClick={() => {
                setTripStatus(selectedTrip.id, 'Giao thất bại')
                showToast(`Đã ghi nhận báo giao thất bại / đổi lịch cho chuyến #${selectedTrip.id}`)
              }}
            >
              <span className="material-symbols-outlined text-[16px]" data-icon="report_problem">report_problem</span>
              <span className="">Báo giao thất bại / Đổi lịch</span>
            </button>
          </div>
          </div>
        ) : null}
      </DetailModal>

      {/* MODAL: TẠO CHUYẾN GIAO MỚI */}
      <FormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tạo chuyến giao mới"
        fields={CREATE_TRIP_FIELDS}
        values={createForm}
        onChange={updateCreateForm}
        onSubmit={handleCreateTrip}
        submitLabel="Tạo chuyến giao"
      />
    </>
  )
}
