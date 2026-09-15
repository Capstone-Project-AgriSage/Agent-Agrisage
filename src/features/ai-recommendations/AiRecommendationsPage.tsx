import { useRef, useState } from 'react'
import { usePageHeader } from '../../context/PageHeaderContext'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import EmptyTableRow from '../../components/ui/EmptyTableRow'
import DetailModal from '../../components/ui/DetailModal'
import Pagination from '../../components/ui/Pagination'
import SearchInput from '../../components/ui/SearchInput'
import FilterSelect from '../../components/ui/FilterSelect'
import { useSelectableList } from '../../hooks/useSelectableList'
import { useFilteredList } from '../../hooks/useFilteredList'
import { usePagination } from '../../hooks/usePagination'
import { aiCases as INITIAL_AI_CASES } from '../../data/mockAiRecommendations'
import { products as STORE_PRODUCTS } from '../../data/mockProducts'
import { downloadCsv } from '../../utils/csv'

const STATUS_LABELS: Record<string, string> = {
  'cho-duyet': 'Chờ duyệt',
  'da-duyet': 'Đã phê duyệt',
  'da-tu-choi': 'Đã từ chối',
  'chua-chac-chan': 'Chưa đủ chắc chắn',
}

const REJECT_REASON_LABELS: Record<string, string> = {
  mo: 'Ảnh mờ / Cháy sáng',
  nham: 'Nhận diện nhầm bệnh',
  'ngoai-pham-vi': 'Không phải lá lúa / Ngoài phạm vi 5 bệnh',
  'sai-giai-doan': 'Sai giai đoạn phát triển',
  'khang-thuoc': 'Khu vực đã kháng hoạt chất này',
}

const CANONICAL_RICE_DISEASES = [
  { id: 'dao-on', label: 'Bệnh đạo ôn lá (Pyricularia oryzae)' },
  { id: 'bac-la', label: 'Bệnh bạc lá vi khuẩn (Xanthomonas oryzae)' },
  { id: 'kho-van', label: 'Bệnh khô vằn (Rhizoctonia solani)' },
  { id: 'dom-nau', label: 'Bệnh đốm nâu (Bipolaris oryzae)' },
  { id: 'khoe-manh', label: 'Lúa sinh trưởng khỏe mạnh' },
]

const DISEASE_KEYWORDS: Record<string, string> = {
  'dao-on': 'Đạo ôn',
  'bac-la': 'Bạc lá',
  'kho-van': 'Khô vằn',
  'dom-nau': 'Đốm nâu',
}

const CONFIDENCE_RANGES: Record<string, (percent: number) => boolean> = {
  high: (percent) => percent > 90,
  med: (percent) => percent >= 75 && percent <= 90,
  low: (percent) => percent < 75,
}

const DISEASE_OPTIONS = [
  { value: '', label: 'Tất cả bệnh (5 lớp lúa P0)' },
  { value: 'dao-on', label: 'Đạo ôn lá' },
  { value: 'bac-la', label: 'Bạc lá vi khuẩn' },
  { value: 'kho-van', label: 'Khô vằn' },
  { value: 'dom-nau', label: 'Đốm nâu' },
]

const AI_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'cho-duyet', label: 'Chờ duyệt' },
  { value: 'da-duyet', label: 'Đã phê duyệt' },
  { value: 'da-tu-choi', label: 'Đã từ chối' },
  { value: 'chua-chac-chan', label: 'Chưa đủ chắc chắn (<70%)' },
]

const CONFIDENCE_OPTIONS = [
  { value: '', label: 'Tất cả độ tin cậy' },
  { value: 'high', label: '>90% (Độ tin cậy cao)' },
  { value: 'med', label: '75-90% (Phù hợp)' },
  { value: 'low', label: '<75% (Thấp / Chưa chắc chắn)' },
]

export default function AiRecommendationsPage() {
  usePageHeader({
    title: 'Quản lý thẩm định AI',
  })

  const { user } = useAuth()
  const [cases, setCases] = useState(INITIAL_AI_CASES)
  const { showToast } = useToast()
  const agentNoteRef = useRef<HTMLTextAreaElement>(null)
  const rejectReasonRef = useRef<HTMLSelectElement>(null)

  // Correction Mode State
  const [isCorrecting, setIsCorrecting] = useState(false)
  const [correctedDisease, setCorrectedDisease] = useState(CANONICAL_RICE_DISEASES[0].label)
  const [correctedProductId, setCorrectedProductId] = useState(STORE_PRODUCTS[0]?.id ?? '')

  const approveCase = (id: string) => {
    if (!user.can_review_ai) {
      showToast('Tài khoản của bạn không có quyền Thẩm định viên AI (can_review_ai: false)')
      return
    }
    const note = agentNoteRef.current?.value.trim()
    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              statusBadge: { label: 'Đã phê duyệt', className: 'bg-emerald-100 text-emerald-800 border border-emerald-300', dotClassName: 'bg-emerald-600' },
              panelBadge: { label: 'Đã gửi đến nông dân', className: 'bg-emerald-100 text-emerald-800', dotClassName: 'bg-emerald-600' },
              actionsMode: 'sent' as const,
              rowClassName: undefined,
              agentNote: note || c.agentNote,
            }
          : c,
      ),
    )
    showToast(`Đã phê duyệt gợi ý #${id} - đã gửi đến nông dân${note ? ` kèm ghi chú` : ''}`)
  }

  const approveWithCorrection = (id: string) => {
    if (!user.can_review_ai) {
      showToast('Tài khoản của bạn không có quyền Thẩm định viên AI')
      return
    }
    const matchedProduct = STORE_PRODUCTS.find((p) => p.id === correctedProductId)
    const note = agentNoteRef.current?.value.trim()
    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              diseaseLabel: correctedDisease.split('(')[0].replace('Bệnh ', '').trim(),
              diseaseFullLabel: correctedDisease,
              statusBadge: { label: 'Đã phê duyệt', className: 'bg-emerald-100 text-emerald-800 border border-emerald-300', dotClassName: 'bg-emerald-600' },
              panelBadge: { label: 'Đã hiệu chỉnh & gửi', className: 'bg-emerald-100 text-emerald-800', dotClassName: 'bg-emerald-600' },
              actionsMode: 'sent' as const,
              rowClassName: undefined,
              agentNote: note || `Đại lý đã hiệu chỉnh bệnh thành: ${correctedDisease}. Chỉ định thuốc ${matchedProduct?.name}.`,
              productLine: matchedProduct?.name,
              productSubLine: matchedProduct?.description,
              product: matchedProduct
                ? {
                    name: matchedProduct.name,
                    category: matchedProduct.categoryLabel,
                    activeIngredient: matchedProduct.description,
                    fitTag: 'Đại lý hiệu chỉnh phác đồ',
                    price: matchedProduct.price,
                    priceUnit: matchedProduct.stockQuantity.includes('bao') ? '/ bao' : '/ chai',
                    stockLabel: `Kho: ${matchedProduct.stockQuantity}`,
                    stockNote: 'Sẵn hàng tại kho Thới Lai',
                    reasoning: 'Thẩm định viên chuyên môn đã hiệu chỉnh bệnh thực tế và chỉ định thuốc đặc trị phù hợp.',
                  }
                : c.product,
            }
          : c,
      ),
    )
    showToast(`Đã hiệu chỉnh và phê duyệt ca #${id}`)
    setIsCorrecting(false)
  }

  const rejectCase = (id: string) => {
    const reasonValue = rejectReasonRef.current?.value
    const reasonLabel = reasonValue ? REJECT_REASON_LABELS[reasonValue] : undefined
    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              statusBadge: { label: 'Đã từ chối', className: 'bg-slate-200 text-slate-700 border border-slate-300', dotClassName: 'bg-slate-500' },
              panelBadge: { label: 'Đã từ chối', className: 'bg-slate-200 text-slate-700', dotClassName: 'bg-slate-500' },
              rowClassName: undefined,
              rejectReasonLabel: reasonLabel,
            }
          : c,
      ),
    )
    showToast(`Đã từ chối gợi ý #${id}${reasonLabel ? ` - Lý do: ${reasonLabel}` : ''}`)
  }

  const requestFieldSurvey = (id: string, farmerName: string) => {
    showToast(`Đã gửi yêu cầu khảo sát thực địa cho ${farmerName} (#${id})`)
  }

  const handleCaseAction = (id: string, label: string) => {
    if (label === 'Duyệt nhanh gợi ý') approveCase(id)
    else if (label === 'Từ chối') rejectCase(id)
  }

  const { selectedId, setSelectedId, selected } = useSelectableList(cases, (c) => c.id)

  const [diseaseFilter, setDiseaseFilter] = useState('')
  const [confidenceFilter, setConfidenceFilter] = useState('')

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filtered: filteredCases,
    clearFilters: handleClearFiltersBase,
  } = useFilteredList(
    cases,
    'cho-duyet',
    (item, keyword, status) =>
      (!keyword ||
        item.id.toLowerCase().includes(keyword) ||
        item.farmerName.toLowerCase().includes(keyword) ||
        item.field.farmerPhone.toLowerCase().includes(keyword)) &&
      (!status || item.statusBadge.label === STATUS_LABELS[status]) &&
      (!diseaseFilter || item.diseaseLabel.includes(DISEASE_KEYWORDS[diseaseFilter])) &&
      (!confidenceFilter || CONFIDENCE_RANGES[confidenceFilter](item.confidencePercent)),
    '',
  )

  const handleClearFilters = () => {
    handleClearFiltersBase()
    setDiseaseFilter('')
    setConfidenceFilter('')
  }

  const {
    page,
    totalPages,
    paginated: paginatedCases,
    startIndex,
    endIndex,
    totalCount,
    goPrev,
    goNext,
    setPage,
  } = usePagination(filteredCases, 10)

  const totalCasesToday = cases.length
  const pendingCount = cases.filter((c) => c.statusBadge.label === 'Chờ duyệt').length
  const approvedCount = cases.filter((c) => c.statusBadge.label === 'Đã phê duyệt').length
  const rejectedCount = cases.filter((c) => c.statusBadge.label === 'Đã từ chối').length
  const uncertainCount = cases.filter((c) => c.statusBadge.label === 'Chưa đủ chắc chắn').length

  return (
    <>
      {/* ACTIVE POLICY & REVIEWER PERMISSION BANNER */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <span className="material-symbols-outlined text-[22px]">policy</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Chính sách Thẩm định AI (v2.1 - Rice Model)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Đang kích hoạt</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Ngưỡng: Cao <strong className="text-slate-800">≥85%</strong> • Trung bình <strong className="text-slate-800">70-84%</strong> • Từ chối <strong className="text-slate-800">&lt;50%</strong>.
              Quy định P0: Thuốc BVTV bắt buộc có thẩm định viên duyệt trước khi nông dân nhìn thấy trên app.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1 justify-end">
              <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified</span>
              <span>{user.name}</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Thẩm định viên chuyên môn (can_review_ai: {String(user.can_review_ai)})</span>
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md shadow-sm transition-colors"
            onClick={() => {
              downloadCsv(
                `phan-tich-ai-${Date.now()}.csv`,
                filteredCases.map((c) => ({
                  'Mã ca': c.id,
                  'Nông dân': c.farmerName,
                  'Khu vực': c.farmerLocationLine,
                  'Bệnh nhận diện': c.diseaseLabel,
                  'Độ tin cậy': `${c.confidencePercent}%`,
                  'Trạng thái': c.statusBadge.label,
                })),
              )
              showToast(`Đã xuất báo cáo ${filteredCases.length} kết quả phân tích`)
            }}
          >
            <span className="material-symbols-outlined text-[18px] text-outline">file_download</span>
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </section>

      {/* 5 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
        <div className="p-space-base rounded-xl bg-surface-container-lowest border-2 border-amber-400/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline">Chờ thẩm định</span>
            <span className="p-1 rounded bg-amber-50 text-amber-700 material-symbols-outlined text-[18px]">hourglass_top</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-metric-num text-metric-num text-on-surface font-semibold">{pendingCount} <span className="text-sm font-normal text-outline">ca</span></div>
            <div className="font-body-sm text-body-sm text-amber-700 font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              <span>Cần duyệt phác đồ</span>
            </div>
          </div>
        </div>
        <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline">Đã phê duyệt</span>
            <span className="p-1 rounded bg-emerald-50 text-emerald-700 material-symbols-outlined text-[18px]">check_circle</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-metric-num text-metric-num text-primary font-semibold">{approvedCount} <span className="text-sm font-normal text-outline">ca</span></div>
            <div className="font-body-sm text-body-sm text-emerald-700 font-medium mt-1">Đã mở bán thuốc cho nông dân</div>
          </div>
        </div>
        <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline">Đã từ chối</span>
            <span className="p-1 rounded bg-slate-100 text-slate-700 material-symbols-outlined text-[18px]">cancel</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-metric-num text-metric-num text-on-surface font-semibold">{rejectedCount} <span className="text-sm font-normal text-outline">ca</span></div>
            <div className="font-body-sm text-body-sm text-slate-600 mt-1">Ảnh mờ hoặc không đúng bệnh</div>
          </div>
        </div>
        <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline">Chưa chắc chắn</span>
            <span className="p-1 rounded bg-orange-50 text-orange-700 material-symbols-outlined text-[18px]">warning</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-metric-num text-metric-num text-orange-700 font-semibold">{uncertainCount} <span className="text-sm font-normal text-outline">ca (&lt;70%)</span></div>
            <div className="font-body-sm text-body-sm text-orange-700 mt-1">Khảo sát đồng ruộng</div>
          </div>
        </div>
        <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline">Tổng ca hôm nay</span>
            <span className="p-1 rounded bg-blue-50 text-blue-700 material-symbols-outlined text-[18px]">analytics</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-metric-num text-metric-num text-on-surface font-semibold">{totalCasesToday} <span className="text-sm font-normal text-outline">lượt</span></div>
            <div className="font-body-sm text-body-sm text-emerald-700 font-medium mt-1 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[15px]">analytics</span>
              <span>Mô hình 5 lớp lúa ĐBSCL</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex flex-wrap items-center gap-space-sm flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm mã AI / tên nông dân / SĐT..."
            className="relative min-w-[240px] flex-1 max-w-sm"
          />
          <FilterSelect value={diseaseFilter} onChange={setDiseaseFilter} options={DISEASE_OPTIONS} />
          <FilterSelect value={statusFilter} onChange={setStatusFilter} options={AI_STATUS_OPTIONS} />
          <FilterSelect value={confidenceFilter} onChange={setConfidenceFilter} options={CONFIDENCE_OPTIONS} />
        </div>
        <button
          className="px-3 py-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-low font-label-md text-label-md flex items-center gap-1 transition-colors"
          onClick={handleClearFilters}
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span>Xóa bộ lọc</span>
        </button>
      </div>

      {/* MAIN EVALUATION TABLE */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
          <div className="px-space-md py-space-sm border-b border-outline-variant flex items-center justify-between bg-surface-container-low/40">
            <div className="flex items-center gap-2">
              <span className="font-title-md text-title-md text-on-surface font-semibold">Hàng đợi thẩm định bệnh lúa</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">{filteredCases.length} ca chờ xử lý</span>
            </div>
            <div className="font-body-sm text-body-sm text-outline flex items-center gap-1">
              <span>Đồng bộ từ app nông dân Thới Lai</span>
              <span className="material-symbols-outlined text-[16px] text-emerald-600">sync</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/80 border-b border-outline-variant">
                  <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider">Mã AI</th>
                  <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider">Nông dân &amp; Thửa</th>
                  <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider">Lá lúa</th>
                  <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider">Bệnh nhận diện</th>
                  <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider">Độ tin cậy</th>
                  <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider">Sản phẩm gợi ý</th>
                  <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider">Kho Thới Lai</th>
                  <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider">Trạng thái</th>
                  <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 font-body-sm text-body-sm">
                {filteredCases.length === 0 ? (
                  <EmptyTableRow colSpan={9} message="Không tìm thấy kết quả phù hợp với bộ lọc." />
                ) : null}
                {paginatedCases.map((item) => {
                  const isSelected = item.id === selectedId
                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setSelectedId(item.id)
                        setIsCorrecting(false)
                      }}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-l-4 border-l-primary bg-primary/5 hover:bg-primary/10'
                          : `hover:bg-surface-container-low ${item.rowClassName ?? ''}`
                      }`}
                    >
                      <td className={`py-3 px-3 font-semibold ${isSelected ? 'text-primary' : item.idClassName}`}>#{item.id}</td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-on-surface">{item.farmerName}</div>
                        <div className="text-[11px] text-outline">{item.farmerLocationLine}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className={`w-10 h-10 rounded border overflow-hidden relative group ${item.imageBorderClassName}`}>
                          <img className={`w-full h-full object-cover ${item.imageBlurred ? 'blur-[1px] opacity-80' : ''}`} data-alt={item.imageAlt} src={item.imageSrc} />
                          <span className="absolute inset-0 bg-black/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-medium ${item.diseaseLabelClassName}`}>{item.diseaseLabel}</span>
                        <div className={`text-[11px] ${item.id === 'AI-2404' ? 'text-orange-700' : 'text-outline'}`}>{item.diseaseSubLabel}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-surface-container rounded-full h-1.5 overflow-hidden">
                            <div className={`${item.confidenceBarClassName} h-full rounded-full`} style={{ width: `${item.confidencePercent}%` }}></div>
                          </div>
                          <span className={`font-semibold text-[11px] ${item.confidenceTextClassName}`}>{item.confidencePercent}%</span>
                        </div>
                        <span className={`text-[10px] ${item.confidenceNoteClassName}`}>{item.confidenceNote}</span>
                      </td>
                      <td className="py-3 px-3">
                        {item.productLine ? (
                          <>
                            <div className="font-medium text-on-surface">{item.productLine}</div>
                            <div className="text-[10px] text-outline">{item.productSubLine}</div>
                          </>
                        ) : (
                          <span className="text-outline font-medium">—</span>
                        )}
                        {!item.productLine ? <div className="text-[10px] text-orange-700">Chưa đủ tin cậy để gợi ý</div> : null}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center text-[11px] font-medium ${item.stockLabelClassName}`}>
                          {item.productLine ? item.stockLabel : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${item.statusBadge.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.statusBadge.dotClassName} mr-1.5`}></span>
                          {item.statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {item.actionsMode === 'menu' ? (
                          <div className="flex items-center justify-end">
                            <RowActionsMenu
                              triggerLabel={`Thao tác #${item.id}`}
                              actions={(item.actions ?? []).map((action) => ({
                                ...action,
                                onClick: () => handleCaseAction(item.id, action.label),
                              }))}
                            />
                          </div>
                        ) : item.actionsMode === 'sent' ? (
                          <span className="text-[11px] text-outline font-medium">Đã duyệt</span>
                        ) : (
                          <button
                            className="px-2 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface text-[11px] font-medium"
                            onClick={(e) => {
                              e.stopPropagation()
                              requestFieldSurvey(item.id, item.farmerName)
                            }}
                          >
                            Khảo sát
                          </button>
                        )}
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
            unitLabel="ca thẩm định lúa"
            goPrev={goPrev}
            goNext={goNext}
            setPage={setPage}
          />
      </div>

      {/* DETAIL MODAL: CHI TIẾT ĐÁNH GIÁ GỢI Ý AI (NO BOUNDING BOX) */}
      <DetailModal open={selected !== null} onClose={() => setSelectedId(null)} widthClassName="max-w-xl">
        {selected ? (
          <div className="flex flex-col divide-y divide-outline-variant">
          <div className="p-space-md bg-surface-container-low/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-primary/10 text-primary">#{selected.id}</span>
              <span className="font-title-md text-title-md text-on-surface font-semibold">Thẩm định chẩn đoán bệnh lúa</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${selected.panelBadge.className}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selected.panelBadge.dotClassName} mr-1.5`}></span>
                {selected.panelBadge.label}
              </span>
              {selected.rejectReasonLabel ? (
                <span className="text-[11px] text-outline">Lý do: {selected.rejectReasonLabel}</span>
              ) : null}
            </div>
          </div>

          {/* 1. THÔNG TIN NÔNG DÂN */}
          <div className="p-space-md flex flex-col gap-space-xs">
            <div className="flex items-center justify-between text-outline font-label-sm text-label-sm uppercase tracking-wide">
              <span>1. Thông tin nông hộ &amp; thửa ruộng</span>
              <span className="material-symbols-outlined text-[16px]">person</span>
            </div>
            <div className="grid grid-cols-2 gap-x-space-md gap-y-2 mt-1">
              <div>
                <div className="text-[11px] text-outline">Nông dân</div>
                <div className="font-medium text-on-surface text-sm">{selected.field.farmerName}</div>
                <div className="text-xs text-primary font-mono">{selected.field.farmerPhone}</div>
              </div>
              <div>
                <div className="text-[11px] text-outline">Vị trí thửa ruộng</div>
                <div className="font-medium text-on-surface text-sm">{selected.field.plotLabel}</div>
                <div className="text-xs text-outline">{selected.field.plotLocation}</div>
              </div>
              <div>
                <div className="text-[11px] text-outline">Giống lúa &amp; Tuổi cây</div>
                <div className="font-medium text-on-surface text-sm">{selected.field.varietyLabel}</div>
                <div className="text-xs text-outline">{selected.field.varietyNote}</div>
              </div>
              <div>
                <div className="text-[11px] text-outline">Thời gian gửi ảnh</div>
                <div className="font-medium text-on-surface text-sm">{selected.field.sentTime}</div>
                <div className="text-xs text-outline">{selected.field.sentChannel}</div>
              </div>
            </div>
          </div>

          {/* 2. HÌNH ẢNH MÔ BỆNH (NO BOUNDING BOX - P0 COMPLIANT) */}
          <div className="p-space-md flex flex-col gap-space-xs">
            <div className="flex items-center justify-between text-outline font-label-sm text-label-sm uppercase tracking-wide">
              <span>2. Hình ảnh lá lúa được phân tích</span>
              <span className="material-symbols-outlined text-[16px]">psychology</span>
            </div>
            <div className="relative w-full h-52 rounded-lg overflow-hidden border border-outline-variant bg-slate-900 mt-1">
              <img className={`w-full h-full object-contain ${selected.imageBlurred ? 'blur-sm' : ''}`} data-alt={selected.imageAlt} src={selected.imageSrc} />
              <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1.5 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[13px] text-emerald-400">check_circle</span>
                <span>Mô hình AgriSage Rice v2.1 • 5 Lớp Bệnh Lúa</span>
              </div>
            </div>
            <div className="mt-2 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-outline">Bệnh do AI phân loại</div>
                <div className="font-semibold text-on-surface text-sm">
                  {selected.diseaseFullLabel}{' '}
                  {selected.diseaseLatin ? <span className="font-normal text-outline text-xs">({selected.diseaseLatin})</span> : null}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-outline">Độ tin cậy AI</div>
                <div className={`font-bold text-sm flex items-center justify-end gap-1 ${selected.confidenceFullClassName}`}>
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>{selected.confidenceFullLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. GỢI Ý THUỐC BVTV THƯƠNG MẠI */}
          <div className="p-space-md flex flex-col gap-space-xs">
            <div className="flex items-center justify-between text-outline font-label-sm text-label-sm uppercase tracking-wide">
              <span>3. Phác đồ thuốc đề xuất</span>
              <span className="material-symbols-outlined text-[16px]">storefront</span>
            </div>
            {selected.product ? (
              <div className="p-3 rounded-lg border border-outline-variant bg-surface-container-lowest shadow-xs flex flex-col gap-2 mt-1">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-outline uppercase tracking-wider">Thuốc trong kho Hai Thắng</span>
                    <div className="font-semibold text-primary text-base">{selected.product.name}</div>
                    <div className="text-xs text-outline">{selected.product.activeIngredient}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selected.product.fitTag}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/60">
                  <div>
                    <div className="text-[11px] text-outline">Giá niêm yết tại quầy</div>
                    <div className="font-semibold text-on-surface text-sm">{selected.product.price} <span className="text-xs font-normal text-outline">{selected.product.priceUnit}</span></div>
                  </div>
                  <div>
                    <div className="text-[11px] text-outline">Tồn kho trạm Thới Lai</div>
                    <div className="font-semibold text-emerald-700 text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">inventory</span>
                      <span>{selected.product.stockLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-low p-2 rounded text-xs text-on-surface-variant leading-relaxed">
                  <span className="font-medium text-on-surface">Cơ chế hoạt chất:</span> {selected.product.reasoning}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/60 text-orange-800 text-xs leading-relaxed mt-1">
                {selected.noProductNote}
              </div>
            )}
          </div>

          {/* 4. KHUNG PHÊ DUYỆT & HIỆU CHỈNH CỦA ĐẠI LÝ (CAN_REVIEW_AI) */}
          <div className="p-space-md flex flex-col gap-space-sm bg-surface-container-low/30">
            <div className="flex items-center justify-between text-outline font-label-sm text-label-sm uppercase tracking-wide">
              <span>4. Quyết định thẩm định của Đại lý</span>
              <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
            </div>

            {/* Reviewer permission check */}
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-[18px] text-emerald-700">badge</span>
                <span>Thẩm định viên: {user.name} ({user.hub})</span>
              </span>
              <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-950 font-mono font-bold rounded text-[10px]">can_review_ai: true</span>
            </div>

            {/* CORRECTION TOGGLE */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-800">Cần hiệu chỉnh kết quả AI?</span>
              <button
                type="button"
                onClick={() => setIsCorrecting(!isCorrecting)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                <span>{isCorrecting ? 'Hủy hiệu chỉnh' : 'Hiệu chỉnh bệnh / thuốc khác'}</span>
              </button>
            </div>

            {isCorrecting && (
              <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Chọn lại bệnh chính xác (5 lớp lúa):
                  </label>
                  <select
                    value={correctedDisease}
                    onChange={(e) => setCorrectedDisease(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                  >
                    {CANONICAL_RICE_DISEASES.map((d) => (
                      <option key={d.id} value={d.label}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Chỉ định thuốc từ kho đại lý:
                  </label>
                  <select
                    value={correctedProductId}
                    onChange={(e) => setCorrectedProductId(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                  >
                    {STORE_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Ghi chú chuyên môn gửi đến nông dân:
              </label>
              <textarea
                key={selected.id}
                ref={agentNoteRef}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-outline"
                placeholder="Ví dụ: Vết bệnh chớm xuất hiện trên chóp lá ST25. Đề nghị rút bớt nước 3-5cm, ngưng bón đạm và xử lý thuốc vào sáng sớm..."
                rows={2}
                defaultValue={selected.agentNote ?? selected.defaultAgentNote}
              />
            </div>

            {!isCorrecting && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-outline">Lý do từ chối (nếu có):</span>
                <select
                  key={selected.id}
                  ref={rejectReasonRef}
                  className="py-1 px-2 text-xs bg-surface-container-lowest border border-outline-variant rounded text-on-surface-variant"
                  defaultValue=""
                >
                  <option value="">-- Chọn lý do từ chối nếu có --</option>
                  <option value="mo">Ảnh mờ / Cháy sáng</option>
                  <option value="nham">Nhận diện nhầm bệnh</option>
                  <option value="ngoai-pham-vi">Không phải lá lúa / Ngoài phạm vi 5 bệnh</option>
                  <option value="sai-giai-doan">Sai giai đoạn phát triển</option>
                  <option value="khang-thuoc">Khu vực đã kháng hoạt chất này</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-space-sm pt-1">
              <button
                className="w-full py-2.5 px-4 rounded-lg bg-surface-container-lowest border border-error/40 hover:bg-error/5 text-error font-title-md text-title-md flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selected.actionsMode === 'sent'}
                onClick={() => rejectCase(selected.id)}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
                <span>Từ chối</span>
              </button>

              {isCorrecting ? (
                <button
                  className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-title-md text-title-md flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  onClick={() => approveWithCorrection(selected.id)}
                >
                  <span className="material-symbols-outlined text-[18px]">done_all</span>
                  <span>Hiệu chỉnh &amp; Duyệt</span>
                </button>
              ) : (
                <button
                  className="w-full py-2.5 px-4 rounded-lg bg-primary-container hover:bg-primary text-white font-title-md text-title-md flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selected.actionsMode === 'sent'}
                  onClick={() => approveCase(selected.id)}
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>{selected.actionsMode === 'sent' ? 'Đã phê duyệt' : 'Phê duyệt gợi ý'}</span>
                </button>
              )}
            </div>
          </div>
          </div>
        ) : null}
      </DetailModal>
    </>
  )
}
