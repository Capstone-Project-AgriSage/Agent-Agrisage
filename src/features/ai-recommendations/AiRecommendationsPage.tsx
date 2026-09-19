import { useRef, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePageHeader } from '../../context/PageHeaderContext'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import SearchInput from '../../components/ui/SearchInput'
import FilterSelect from '../../components/ui/FilterSelect'
import Pagination from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { aiCases as INITIAL_AI_CASES } from '../../data/mockAiRecommendations'
import { downloadCsv } from '../../utils/csv'
import type { AiCase, ProductSuggestion } from '../../types'

const CANONICAL_RICE_CONDITIONS = [
  { id: 'dao-on', label: 'Bệnh đạo ôn lá (Pyricularia oryzae)', short: 'Đạo ôn lá', isDisease: true },
  { id: 'bac-la', label: 'Bệnh bạc lá vi khuẩn (Xanthomonas oryzae)', short: 'Bạc lá vi khuẩn', isDisease: true },
  { id: 'kho-van', label: 'Bệnh khô vằn (Rhizoctonia solani)', short: 'Khô vằn', isDisease: true },
  { id: 'dom-nau', label: 'Bệnh đốm nâu (Bipolaris oryzae)', short: 'Đốm nâu', isDisease: true },
  { id: 'khoe-manh', label: 'Lúa sinh trưởng khỏe mạnh', short: 'Khỏe mạnh', isDisease: false },
]

const CANONICAL_CONDITION_PRODUCTS: Record<string, ProductSuggestion> = {
  'dao-on': {
    name: 'Fuji-One 40WP',
    category: 'Thuốc trừ bệnh cây trồng',
    activeIngredient: 'Isoprothiolane 40%',
    fitTag: 'Đặc trị đạo ôn lá',
    price: '45.000 đ',
    priceUnit: '/ gói 100g',
    stockLabel: 'Còn 142 gói (Sẵn sàng)',
    stockNote: 'Tồn kho tại trạm Thới Lai',
    reasoning: 'Hoạt chất Isoprothiolane có hiệu lực nội hấp và lưu dẫn cao với nấm đạo ôn, hạn chế cháy chóp lá non.',
  },
  'bac-la': {
    name: 'Starner 20WP',
    category: 'Thuốc trừ bệnh cây trồng',
    activeIngredient: 'Oxolinic acid 20%',
    fitTag: 'Đặc trị vi khuẩn bạc lá',
    price: '32.000 đ',
    priceUnit: '/ gói 100g',
    stockLabel: 'Còn 85 gói (Sẵn sàng)',
    stockNote: 'Tồn kho tại trạm Thới Lai',
    reasoning: 'Oxolinic acid đặc trị vi khuẩn Xanthomonas oryzae gây bạc lá, ít ảnh hưởng thiên địch.',
  },
  'kho-van': {
    name: 'Validacin 5SL',
    category: 'Thuốc trừ bệnh cây trồng',
    activeIngredient: 'Validamycin A',
    fitTag: 'Đặc trị khô vằn',
    price: '38.000 đ',
    priceUnit: '/ chai 500ml',
    stockLabel: 'Còn 40 chai (Sẵn sàng)',
    stockNote: 'Tồn kho tại trạm Thới Lai',
    reasoning: 'Hoạt chất Validamycin A ức chế sự phát triển sợi nấm Rhizoctonia solani gây khô vằn.',
  },
  'dom-nau': {
    name: 'Tilt Super 300EC',
    category: 'Thuốc trừ bệnh cây trồng',
    activeIngredient: 'Difenoconazole + Propiconazole',
    fitTag: 'Đặc trị đốm nâu',
    price: '65.000 đ',
    priceUnit: '/ chai 100ml',
    stockLabel: 'Còn 60 chai (Sẵn sàng)',
    stockNote: 'Tồn kho tại trạm Thới Lai',
    reasoning: 'Difenoconazole + Propiconazole có phổ tác động rộng, kiểm soát tốt nấm Bipolaris oryzae gây đốm nâu.',
  },
}

const INCONCLUSIVE_REASONS = [
  { value: 'mo', label: 'Ảnh mờ / Cháy sáng' },
  { value: 'nham', label: 'Triệu chứng không rõ ràng' },
  { value: 'thieu-thong-tin', label: 'Không đủ thông tin chẩn đoán' },
  { value: 'ngoai-pham-vi', label: 'Ngoài phạm vi chẩn đoán tiêu chuẩn' },
  { value: 'sai-giai-doan', label: 'Sai giai đoạn sinh trưởng của cây' },
]

const CONDITION_OPTIONS = [
  { value: '', label: 'Tất cả tình trạng lá lúa' },
  { value: 'Đạo ôn', label: 'Đạo ôn lá' },
  { value: 'Bạc lá', label: 'Bạc lá vi khuẩn' },
  { value: 'Khô vằn', label: 'Khô vằn' },
  { value: 'Đốm nâu', label: 'Đốm nâu' },
  { value: 'Khỏe mạnh', label: 'Khỏe mạnh' },
]

const CONFIDENCE_OPTIONS = [
  { value: '', label: 'Tất cả độ tin cậy' },
  { value: 'high', label: '>90% (Rất cao)' },
  { value: 'med', label: '75-90% (Phù hợp)' },
  { value: 'low', label: '<75% (Chưa chắc chắn)' },
]

export default function AiRecommendationsPage() {
  usePageHeader({
    title: 'Thẩm định chẩn đoán tình trạng lá lúa AI',
  })

  const { user } = useAuth()
  const { showToast } = useToast()
  const [cases, setCases] = useState<AiCase[]>(INITIAL_AI_CASES)

  // Selected Case in Master-Detail Workspace
  const [selectedId, setSelectedId] = useState<string>(INITIAL_AI_CASES[0]?.id ?? '')

  // Queue Tab Filter: 'pending' (Chờ thẩm định), 'reviewed' (Lịch sử đã duyệt), 'all' (Tất cả)
  const [queueTab, setQueueTab] = useState<'pending' | 'reviewed' | 'all'>('pending')
  const [search, setSearch] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')
  const [confidenceFilter, setConfidenceFilter] = useState('')

  // Reviewer Decision States (Strictly Diagnosis Only)
  const [isCorrecting, setIsCorrecting] = useState(false)
  const [correctedConditionId, setCorrectedConditionId] = useState(CANONICAL_RICE_CONDITIONS[0].id)
  const [isInconclusiveMode, setIsInconclusiveMode] = useState(false)
  const [inconclusiveReason, setInconclusiveReason] = useState(INCONCLUSIVE_REASONS[0].value)
  const agentNoteRef = useRef<HTMLTextAreaElement>(null)

  // Zoom Image Modal State
  const [zoomedImage, setZoomedImage] = useState<{ src: string; alt: string; title: string } | null>(null)

  // Filtered Queue Cases
  const filteredQueueCases = useMemo(() => {
    return cases.filter((c) => {
      // 1. Tab filter
      const isPending = c.status === 'Chờ duyệt' || c.status === 'Chưa đủ chắc chắn'
      const isReviewed = c.status === 'Đã phê duyệt' || c.status === 'Đã từ chối'
      if (queueTab === 'pending' && !isPending) return false
      if (queueTab === 'reviewed' && !isReviewed) return false

      // 2. Keyword search
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const match =
          c.id.toLowerCase().includes(q) ||
          c.farmerName.toLowerCase().includes(q) ||
          c.field.farmerPhone.toLowerCase().includes(q) ||
          c.diseaseLabel.toLowerCase().includes(q)
        if (!match) return false
      }

      // 3. Condition filter
      if (conditionFilter && !c.diseaseLabel.toLowerCase().includes(conditionFilter.toLowerCase())) {
        return false
      }

      // 4. Confidence filter
      if (confidenceFilter === 'high' && c.confidencePercent <= 90) return false
      if (confidenceFilter === 'med' && (c.confidencePercent < 75 || c.confidencePercent > 90)) return false
      if (confidenceFilter === 'low' && c.confidencePercent >= 75) return false

      return true
    })
  }, [cases, queueTab, search, conditionFilter, confidenceFilter])

  // Queue Pagination (6 items per page for comfortable vertical scrolling)
  const {
    page,
    totalPages,
    paginated: paginatedQueueCases,
    startIndex,
    endIndex,
    totalCount,
    goPrev,
    goNext,
    setPage,
  } = usePagination(filteredQueueCases, 6)

  // Active Selected Case
  const selectedCase = useMemo(() => {
    return cases.find((c) => c.id === selectedId) ?? filteredQueueCases[0] ?? cases[0] ?? null
  }, [cases, selectedId, filteredQueueCases])

  // Derived Diagnosis States for Selected Case
  const isVerified = selectedCase?.status === 'Đã phê duyệt'
  const isInconclusive = selectedCase?.status === 'Đã từ chối'
  const isPending = selectedCase?.status === 'Chờ duyệt' || selectedCase?.status === 'Chưa đủ chắc chắn'

  // Aggregate Counts
  const pendingCount = cases.filter((c) => c.status === 'Chờ duyệt' || c.status === 'Chưa đủ chắc chắn').length
  const reviewedCount = cases.filter((c) => c.status === 'Đã phê duyệt' || c.status === 'Đã từ chối').length

  // Move to next case in queue after action
  const selectNextPending = (currentId: string) => {
    const remainingPending = cases.filter(
      (c) => c.id !== currentId && (c.status === 'Chờ duyệt' || c.status === 'Chưa đủ chắc chắn'),
    )
    if (remainingPending.length > 0) {
      setSelectedId(remainingPending[0].id)
    }
  }

  // 1. SCENARIO A: Confirm Diagnosis (Accepts AI Candidate, Produces Verified Disease)
  const handleConfirmDiagnosis = (id: string) => {
    if (!user.can_review_ai) {
      showToast('Tài khoản chưa được phân quyền Thẩm định viên AI')
      return
    }
    const note = agentNoteRef.current?.value.trim()
    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'Đã phê duyệt',
              statusBadge: {
                label: 'Đã xác nhận',
                className: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
                dotClassName: 'bg-emerald-600',
              },
              panelBadge: {
                label: 'Đã xác nhận chẩn đoán',
                className: 'bg-emerald-100 text-emerald-800',
                dotClassName: 'bg-emerald-600',
              },
              actionsMode: 'sent' as const,
              agentNote: note || c.agentNote || c.defaultAgentNote,
            }
          : c,
      ),
    )
    showToast(`Đã xác nhận chẩn đoán cho ca #${id}`)
    setIsCorrecting(false)
    setIsInconclusiveMode(false)
    selectNextPending(id)
  }

  // 2. SCENARIO B: Correct Diagnosis (Select Condition ONLY, Produces Verified Disease)
  const handleSaveDiagnosisCorrection = (id: string) => {
    if (!user.can_review_ai) {
      showToast('Tài khoản chưa được phân quyền Thẩm định viên AI')
      return
    }
    const target = CANONICAL_RICE_CONDITIONS.find((d) => d.id === correctedConditionId) || CANONICAL_RICE_CONDITIONS[0]
    const defaultProduct = target.isDisease ? CANONICAL_CONDITION_PRODUCTS[correctedConditionId] : undefined
    const note = agentNoteRef.current?.value.trim()

    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              diseaseLabel: target.short,
              diseaseFullLabel: target.label,
              status: 'Đã phê duyệt',
              statusBadge: {
                label: 'Đã hiệu chỉnh',
                className: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
                dotClassName: 'bg-emerald-600',
              },
              panelBadge: {
                label: 'Đã hiệu chỉnh chẩn đoán',
                className: 'bg-emerald-100 text-emerald-800',
                dotClassName: 'bg-emerald-600',
              },
              actionsMode: 'sent' as const,
              agentNote: note || `Đại lý hiệu chỉnh chẩn đoán thành: ${target.label}.`,
              productLine: defaultProduct?.name,
              productSubLine: defaultProduct?.activeIngredient,
              product: defaultProduct,
            }
          : c,
      ),
    )
    showToast(`Đã hiệu chỉnh chẩn đoán ca #${id} thành "${target.short}"`)
    setIsCorrecting(false)
    selectNextPending(id)
  }

  // 3. SCENARIO C: Mark Inconclusive (Terminates Flow: NO Verified Disease, NO Treatment Recommendation)
  const handleMarkInconclusive = (id: string) => {
    if (!user.can_review_ai) {
      showToast('Tài khoản chưa được phân quyền Thẩm định viên AI')
      return
    }
    const reasonLabel = INCONCLUSIVE_REASONS.find((r) => r.value === inconclusiveReason)?.label || 'Chưa đủ điều kiện chẩn đoán'
    const note = agentNoteRef.current?.value.trim()

    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'Đã từ chối',
              statusBadge: {
                label: 'Không đủ cơ sở kết luận',
                className: 'bg-slate-200 text-slate-700 border border-slate-300',
                dotClassName: 'bg-slate-500',
              },
              panelBadge: {
                label: 'Không đủ cơ sở kết luận',
                className: 'bg-slate-200 text-slate-700',
                dotClassName: 'bg-slate-500',
              },
              actionsMode: 'survey' as const,
              rejectReasonLabel: reasonLabel,
              agentNote: note || `Không đủ cơ sở kết luận: ${reasonLabel}`,
              product: undefined,
              productLine: undefined,
              productSubLine: undefined,
            }
          : c,
      ),
    )
    showToast(`Đã ghi nhận không đủ cơ sở kết luận cho ca #${id} (${reasonLabel})`)
    setIsInconclusiveMode(false)
    selectNextPending(id)
  }

  // Export CSV
  const handleExportCsv = () => {
    downloadCsv(
      `tham-dinh-ai-${Date.now()}.csv`,
      cases.map((c) => ({
        'Mã ca': c.id,
        'Nông dân': c.farmerName,
        'Số điện thoại': c.field.farmerPhone,
        'Khu vực / Thửa': `${c.field.plotLabel} - ${c.field.plotLocation}`,
        'Chẩn đoán AI đề xuất': c.diseaseLabel,
        'Độ tin cậy': `${c.confidencePercent}%`,
        'Trạng thái thẩm định': c.status,
        'Thuốc đề xuất': c.product?.name ?? 'Không phát hành',
      })),
    )
    showToast(`Đã xuất báo cáo CSV danh sách ${cases.length} ca thẩm định`)
  }

  return (
    <>
      {/* 1. BREADCRUMBS & WORKSPACE HEADER */}
      <nav className="flex items-center gap-1 text-[12px] text-outline mb-1" aria-label="Breadcrumb">
        <Link className="hover:text-on-surface transition-colors" to="/">Bảng điều khiển</Link>
        <span className="material-symbols-outlined text-xs" data-icon="chevron_right">chevron_right</span>
        <span className="text-primary font-medium">Thẩm định chẩn đoán tình trạng lá lúa AI</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 shadow-xs">
            <span className="material-symbols-outlined text-[24px]">psychology</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-on-surface text-base">Thẩm định chẩn đoán tình trạng lá lúa AI</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Không gian thẩm định chuyên gia
              </span>
            </div>
            <div className="text-xs text-outline mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Đại lý Hai Thắng • ĐBSCL</span>
              <span>•</span>
              <span>
                Thẩm định viên: <strong className="text-on-surface font-semibold">{user.name}</strong> ({user.hub})
              </span>
              {!user.can_review_ai && (
                <span className="px-2 py-0.2 rounded bg-amber-100 text-amber-800 text-[11px] font-medium border border-amber-300">
                  Chỉ xem (Chưa cấp quyền thẩm định)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded-xl hover:bg-surface-container-low transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-outline">file_download</span>
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* 2. MASTER-DETAIL WORKSPACE (33% Queue : 67% Inspection) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* =========================================================================
            PANEL A: REVIEW QUEUE (LEFT PANEL: ~33% width on desktop)
            ========================================================================= */}
        <div className="xl:col-span-4 flex flex-col gap-3 bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant shadow-sm">
          {/* A1. Queue Navigation Tabs */}
          <div className="flex items-center p-1 bg-surface-container-low rounded-xl border border-outline-variant/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setQueueTab('pending')
                setPage(1)
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                queueTab === 'pending'
                  ? 'bg-surface-container-lowest text-on-surface font-bold shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span>Chờ thẩm định</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                queueTab === 'pending' ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-surface-container text-outline'
              }`}>
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setQueueTab('reviewed')
                setPage(1)
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                queueTab === 'reviewed'
                  ? 'bg-surface-container-lowest text-on-surface font-bold shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span>Đã thẩm định</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                queueTab === 'reviewed' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-surface-container text-outline'
              }`}>
                {reviewedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setQueueTab('all')
                setPage(1)
              }}
              className={`py-1.5 px-2 rounded-lg transition-all ${
                queueTab === 'all'
                  ? 'bg-surface-container-lowest text-on-surface font-bold shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Tất cả ({cases.length})
            </button>
          </div>

          {/* A2. Search & Compact Filters */}
          <div className="space-y-2">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val)
                setPage(1)
              }}
              placeholder="Tìm mã ca, nông dân, SĐT..."
              className="relative w-full"
            />
            <div className="grid grid-cols-2 gap-2">
              <FilterSelect
                value={conditionFilter}
                onChange={(val) => {
                  setConditionFilter(val)
                  setPage(1)
                }}
                options={CONDITION_OPTIONS}
                className="w-full text-xs"
              />
              <FilterSelect
                value={confidenceFilter}
                onChange={(val) => {
                  setConfidenceFilter(val)
                  setPage(1)
                }}
                options={CONFIDENCE_OPTIONS}
                className="w-full text-xs"
              />
            </div>
          </div>

          {/* A3. Queue Cases List */}
          <div className="space-y-2 min-h-[360px]">
            {filteredQueueCases.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-low/40 rounded-xl border border-dashed border-outline-variant text-outline text-xs">
                <span className="material-symbols-outlined text-3xl mb-1 text-outline/80 block">inbox</span>
                Không có ca thẩm định nào phù hợp bộ lọc.
              </div>
            ) : null}

            {paginatedQueueCases.map((c) => {
              const isSelected = c.id === (selectedCase?.id ?? '')

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedId(c.id)
                    setIsCorrecting(false)
                    setIsInconclusiveMode(false)
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSelectedId(c.id)
                      setIsCorrecting(false)
                      setIsInconclusiveMode(false)
                    }
                  }}
                  className={`p-3 rounded-xl transition-all cursor-pointer border text-left flex items-start gap-3 relative group ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-surface-container-lowest border-outline-variant/80 hover:border-slate-300 hover:bg-surface-container-low/60'
                  }`}
                >
                  {/* Miniature Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-outline-variant bg-slate-900 relative">
                    <img
                      src={c.imageSrc}
                      alt={c.imageAlt}
                      className={`w-full h-full object-cover ${c.imageBlurred ? 'blur-[1px] opacity-75' : ''}`}
                    />
                    {c.imageBlurred && (
                      <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-amber-300 font-bold">
                        Mờ
                      </span>
                    )}
                  </div>

                  {/* Case Summary Information */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`font-mono text-xs font-bold ${isSelected ? 'text-[#1E5E3A]' : 'text-on-surface'}`}>
                        #{c.id}
                      </span>
                      <span className="text-[11px] text-outline whitespace-nowrap">{c.field.sentTime}</span>
                    </div>

                    <div className="font-semibold text-on-surface text-xs truncate">{c.farmerName}</div>

                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-medium text-xs text-on-surface truncate">{c.diseaseLabel}</span>
                      </div>
                      <span
                        className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          c.confidencePercent >= 90
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.confidencePercent >= 75
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-orange-50 text-orange-800 border border-orange-200'
                        }`}
                      >
                        {c.confidencePercent}%
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-outline truncate max-w-[140px]">{c.farmerLocationLine}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                          c.status === 'Chờ duyệt'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : c.status === 'Chưa đủ chắc chắn'
                            ? 'bg-orange-100 text-orange-900 border border-orange-300'
                            : c.status === 'Đã phê duyệt'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-slate-200 text-slate-800 border border-slate-300'
                        }`}
                      >
                        {c.status === 'Chờ duyệt' ? 'Chờ thẩm định' : c.status}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Queue Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalCount={totalCount}
            unitLabel="ca"
            goPrev={goPrev}
            goNext={goNext}
            setPage={setPage}
          />
        </div>

        {/* =========================================================================
            PANEL B: INSPECTION & DECISION WORKSPACE (RIGHT PANEL: ~67% width)
            ========================================================================= */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {selectedCase ? (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-4 md:p-6 space-y-6">
              {/* B0. Case Title & Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-sm bg-[#1E5E3A]/10 text-[#1E5E3A]">
                      #{selectedCase.id}
                    </span>
                    <h2 className="font-bold text-on-surface text-base md:text-lg">
                      Chi tiết thẩm định ca bệnh
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        selectedCase.status === 'Chờ duyệt'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : selectedCase.status === 'Chưa đủ chắc chắn'
                          ? 'bg-orange-100 text-orange-900 border border-orange-300'
                          : selectedCase.status === 'Đã phê duyệt'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-slate-200 text-slate-800 border border-slate-300'
                      }`}
                    >
                      {selectedCase.status === 'Chờ duyệt' ? 'Chờ thẩm định' : selectedCase.status}
                    </span>
                  </div>
                  <div className="text-xs text-outline mt-1">
                    Tiếp nhận lúc: <span className="text-on-surface font-medium">{selectedCase.field.sentTime}</span> •{' '}
                    {selectedCase.field.sentChannel}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="font-semibold text-on-surface text-sm">{selectedCase.field.farmerName}</div>
                  <div className="font-mono text-xs text-primary font-medium">{selectedCase.field.farmerPhone}</div>
                </div>
              </div>

              {/* B1. LARGE RICE LEAF IMAGE INSPECTION (Dominant Evidence) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">visibility</span>
                    Hình ảnh mẫu lá lúa (Bằng chứng chẩn đoán)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setZoomedImage({
                        src: selectedCase.imageSrc,
                        alt: selectedCase.imageAlt,
                        title: `Mẫu bệnh phẩm ca #${selectedCase.id} - ${selectedCase.farmerName}`,
                      })
                    }
                    className="text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                    <span>Phóng to ảnh gốc</span>
                  </button>
                </div>

                <div className="w-full h-80 sm:h-96 md:h-[420px] rounded-2xl bg-slate-950 border border-outline-variant overflow-hidden relative flex items-center justify-center shadow-inner group">
                  <img
                    src={selectedCase.imageSrc}
                    alt={selectedCase.imageAlt}
                    className={`max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-[1.02] ${
                      selectedCase.imageBlurred ? 'blur-[1px] opacity-80' : ''
                    }`}
                  />

                  {/* Overlay Tag bottom left */}
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Triệu chứng: {selectedCase.boundingBox?.note || selectedCase.diseaseLabel}</span>
                  </div>

                  {/* Warning tag if blurred */}
                  {selectedCase.imageBlurred && (
                    <div className="absolute top-3 left-3 bg-amber-500/90 text-slate-950 font-bold text-xs px-3 py-1 rounded-lg backdrop-blur-md shadow-md flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      <span>Ảnh chụp bị mờ / thiếu sáng</span>
                    </div>
                  )}

                  {/* Click to zoom overlay action */}
                  <button
                    type="button"
                    onClick={() =>
                      setZoomedImage({
                        src: selectedCase.imageSrc,
                        alt: selectedCase.imageAlt,
                        title: `Mẫu bệnh phẩm ca #${selectedCase.id} - ${selectedCase.farmerName}`,
                      })
                    }
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-xl backdrop-blur-sm transition-colors"
                    title="Phóng to ảnh"
                  >
                    <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                  </button>
                </div>
              </div>

              {/* B2. CHẨN ĐOÁN AI ĐỀ XUẤT (Transparent & Non-definitive) */}
              <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                      Chẩn đoán AI đề xuất
                    </span>
                    <span className="font-bold text-on-surface text-sm md:text-base">
                      Kết quả mô hình AI đề xuất ban đầu
                    </span>
                  </div>
                  <span className="text-xs text-outline italic">
                    * Kết quả gợi ý từ mô hình AI — Cần thẩm định viên xác nhận trước khi phát hành khuyến nghị
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {/* Candidate Condition */}
                  <div className="md:col-span-2 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/70">
                    <div className="text-[11px] font-semibold text-outline uppercase tracking-wider">Tình trạng đề xuất</div>
                    <div className="font-bold text-on-surface text-base mt-0.5">{selectedCase.diseaseFullLabel}</div>
                    {selectedCase.diseaseLatin && (
                      <div className="text-xs text-outline italic mt-0.5">{selectedCase.diseaseLatin}</div>
                    )}
                  </div>

                  {/* AI Confidence Meter */}
                  <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/70 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-semibold text-outline uppercase tracking-wider">Độ tin cậy mô hình</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xl font-bold font-mono ${selectedCase.confidenceTextClassName}`}>
                          {selectedCase.confidencePercent}%
                        </span>
                        <span className={`text-xs font-semibold ${selectedCase.confidenceNoteClassName}`}>
                          {selectedCase.confidenceNote}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden mt-2">
                      <div
                        className={`${selectedCase.confidenceBarClassName} h-full rounded-full transition-all`}
                        style={{ width: `${selectedCase.confidencePercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Sub-threshold or uncertain notice */}
                {selectedCase.confidencePercent < 70 && (
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-300 text-orange-900 text-xs flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-orange-700 shrink-0 mt-0.5">info</span>
                    <div>
                      <strong>Lưu ý chuyên môn:</strong> Độ tin cậy dưới ngưỡng an toàn 70%. Hệ thống không tự động tạo phác đồ. Thẩm định viên vui lòng kiểm tra kỹ hoặc chọn <em>Hiệu chỉnh chẩn đoán</em> / <em>Không đủ cơ sở kết luận</em>.
                    </div>
                  </div>
                )}
              </div>

              {/* B3. KẾT LUẬN THẨM ĐỊNH (Strictly Diagnosis Decision) */}
              <div className="p-4 md:p-5 rounded-2xl bg-surface-container-lowest border-2 border-primary/30 space-y-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">assignment_turned_in</span>
                    <h3 className="font-bold text-on-surface text-sm md:text-base">
                      Kết luận thẩm định
                    </h3>
                  </div>
                  {isVerified && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      ✓ Đã có kết luận chẩn đoán thẩm định
                    </span>
                  )}
                  {isInconclusive && (
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-300">
                      ✕ Không đủ cơ sở kết luận
                    </span>
                  )}
                </div>

                {/* Main Action Buttons (Clear Visual Hierarchy) */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* 1. SCENARIO A: Confirm Diagnosis (Primary Button) */}
                  <button
                    type="button"
                    disabled={!user.can_review_ai || isVerified}
                    onClick={() => handleConfirmDiagnosis(selectedCase.id)}
                    className="flex-1 min-w-[180px] py-2.5 px-4 bg-[#1E5E3A] hover:bg-[#17482D] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-title-md text-title-md rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Xác nhận chẩn đoán</span>
                  </button>

                  {/* 2. SCENARIO B: Correct Diagnosis (Secondary Button - Opens Diagnosis-Only Correction) */}
                  <button
                    type="button"
                    disabled={!user.can_review_ai}
                    onClick={() => {
                      setIsCorrecting(!isCorrecting)
                      setIsInconclusiveMode(false)
                    }}
                    className={`py-2.5 px-4 border rounded-xl font-title-md text-title-md transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                      isCorrecting
                        ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                        : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-outline">tune</span>
                    <span>{isCorrecting ? 'Đóng hiệu chỉnh' : 'Hiệu chỉnh chẩn đoán'}</span>
                  </button>

                  {/* 3. SCENARIO C: Mark Inconclusive (Tertiary Button - Opens Inconclusive Reason Selector) */}
                  <button
                    type="button"
                    disabled={!user.can_review_ai}
                    onClick={() => {
                      setIsInconclusiveMode(!isInconclusiveMode)
                      setIsCorrecting(false)
                    }}
                    className={`py-2.5 px-3.5 border rounded-xl font-label-md text-label-md transition-all flex items-center justify-center gap-1.5 ${
                      isInconclusiveMode
                        ? 'bg-slate-200 border-slate-400 text-slate-800 font-bold'
                        : 'bg-surface-container-lowest border-outline-variant text-outline hover:text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">help_outline</span>
                    <span>Không đủ cơ sở kết luận</span>
                  </button>
                </div>

                {/* Inline Mode: Diagnosis-Only Correction Form (NO product selection here!) */}
                {isCorrecting && (
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300 space-y-3 animate-fadeIn">
                    <div className="font-bold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-800">edit_note</span>
                      <span>Chế độ hiệu chỉnh kết luận chẩn đoán tình trạng lá lúa</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-amber-950 mb-1">
                        Chọn kết luận chẩn đoán chính xác:
                      </label>
                      <select
                        value={correctedConditionId}
                        onChange={(e) => setCorrectedConditionId(e.target.value)}
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-xs text-on-surface font-medium shadow-xs focus:ring-1 focus:ring-primary focus:border-primary"
                      >
                        {CANONICAL_RICE_CONDITIONS.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-amber-800 mt-1">
                        * Khuyến nghị sau thẩm định sẽ được cập nhật tự động tương ứng với kết luận chẩn đoán này.
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCorrecting(false)}
                        className="px-3 py-1.5 rounded-lg border border-outline-variant bg-white text-xs font-medium text-outline hover:text-on-surface"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveDiagnosisCorrection(selectedCase.id)}
                        className="px-4 py-1.5 rounded-lg bg-[#1E5E3A] hover:bg-[#17482D] text-white text-xs font-bold shadow-sm"
                      >
                        Lưu kết luận chẩn đoán
                      </button>
                    </div>
                  </div>
                )}

                {/* Inline Mode: Inconclusive Reason Form (Single direct action) */}
                {isInconclusiveMode && (
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-3 animate-fadeIn">
                    <div className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-slate-700">report</span>
                      <span>Xác nhận không đủ cơ sở kết luận ca bệnh</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Lý do không đủ cơ sở:
                        </label>
                        <select
                          value={inconclusiveReason}
                          onChange={(e) => setInconclusiveReason(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-on-surface font-medium shadow-xs"
                        >
                          {INCONCLUSIVE_REASONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end gap-2 pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => setIsInconclusiveMode(false)}
                          className="px-3 py-2 rounded-lg border border-outline-variant bg-white text-xs font-medium text-outline hover:text-on-surface"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkInconclusive(selectedCase.id)}
                          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold whitespace-nowrap shadow-sm"
                        >
                          Xác nhận không đủ cơ sở
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Specialist Note Input */}
                <div className="pt-2 border-t border-outline-variant/60">
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Ghi chú chuyên môn gửi nông dân (tùy chọn):
                  </label>
                  <textarea
                    key={selectedCase.id}
                    ref={agentNoteRef}
                    rows={2}
                    defaultValue={selectedCase.agentNote ?? selectedCase.defaultAgentNote}
                    placeholder="Nhập hướng dẫn liều lượng thuốc, cách quản lý mực nước ruộng hoặc thời điểm phun xịt tối ưu..."
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-outline resize-none transition-colors"
                  />
                </div>
              </div>

              {/* B4. KHUYẾN NGHỊ SAU THẨM ĐỊNH (Recommendation Review) */}
              <div className="p-4 md:p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-800 text-[20px]">medication</span>
                    <div>
                      <h3 className="font-bold text-on-surface text-sm md:text-base">
                        Khuyến nghị sau thẩm định
                      </h3>
                      <div className="text-xs text-outline">
                        Phác đồ điều trị &amp; Thuốc chỉ định tại trạm Thới Lai
                      </div>
                    </div>
                  </div>

                  {/* Verified Condition Badge */}
                  {isVerified ? (
                    <div className="flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold border border-emerald-300">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Kết luận đã xác nhận: {selectedCase.diseaseLabel}</span>
                    </div>
                  ) : isInconclusive ? (
                    <div className="flex items-center gap-1.5 text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-semibold border border-slate-300">
                      <span className="material-symbols-outlined text-[16px]">cancel</span>
                      <span>Không có kết luận chẩn đoán</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-semibold border border-amber-300">
                      <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                      <span>Chờ kết luận thẩm định</span>
                    </div>
                  )}
                </div>

                {/* SCENARIO C: Inconclusive Flow -> TERMINATED & NOT ACTIONABLE */}
                {isInconclusive ? (
                  <div className="p-4 rounded-xl bg-slate-100/90 border border-slate-300 text-slate-800 text-xs flex items-start gap-3">
                    <span className="material-symbols-outlined text-[24px] text-slate-600 shrink-0 mt-0.5">block</span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Không đủ cơ sở kết luận chẩn đoán</div>
                      <p className="mt-1 text-slate-700 leading-relaxed">
                        Ca bệnh đã được ghi nhận <strong>không đủ cơ sở kết luận</strong> (Lý do: <em>{selectedCase.rejectReasonLabel || 'Chưa đủ điều kiện chẩn đoán'}</em>). Hệ thống <strong>không phát hành phác đồ điều trị</strong> và không đề xuất sản phẩm thuốc cho ca này.
                      </p>
                    </div>
                  </div>
                ) : isPending ? (
                  /* PENDING STATE: Standby until Diagnosis is made */
                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-dashed border-outline-variant text-outline text-xs flex items-start gap-3">
                    <span className="material-symbols-outlined text-[24px] text-outline/80 shrink-0 mt-0.5">lock_clock</span>
                    <div>
                      <div className="font-semibold text-on-surface text-sm">Đang chờ kết luận thẩm định chẩn đoán</div>
                      <p className="mt-1 leading-relaxed">
                        Khuyến nghị phác đồ điều trị và vật tư trạm chỉ có hiệu lực sau khi thẩm định viên thực hiện <strong>"Xác nhận chẩn đoán"</strong> hoặc <strong>"Hiệu chỉnh chẩn đoán"</strong> ở phần trên.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* SCENARIO A & B: Verified Condition -> Actionable Treatment Review */
                  selectedCase.diseaseLabel === 'Khỏe mạnh' || selectedCase.diseaseLabel === 'Lúa khỏe mạnh' ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
                      <span className="material-symbols-outlined text-[24px] text-emerald-700 shrink-0 mt-0.5">eco</span>
                      <div>
                        <div className="font-bold text-emerald-950 text-sm">Lúa sinh trưởng khỏe mạnh bình thường</div>
                        <p className="mt-1 text-emerald-800 leading-relaxed">
                          Thẩm định viên xác nhận ruộng lúa phát triển bình thường, không có dấu hiệu nhiễm bệnh. <strong>Không cần can thiệp thuốc bảo vệ thực vật</strong>. Khuyến nghị nông dân tiếp tục duy trì chế độ chăm sóc và mực nước ruộng phù hợp.
                        </p>
                      </div>
                    </div>
                  ) : selectedCase.product ? (
                    <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant space-y-3 shadow-xs">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="font-bold text-[#1E5E3A] text-base">{selectedCase.product.name}</div>
                          <div className="text-xs text-outline mt-0.5">
                            Hoạt chất đặc trị: <strong className="text-on-surface">{selectedCase.product.activeIngredient}</strong>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {selectedCase.product.fitTag}
                        </span>
                      </div>

                      <p className="text-xs text-outline leading-relaxed bg-surface-container-low/40 p-2.5 rounded-lg border border-outline-variant/40">
                        {selectedCase.product.reasoning}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-outline-variant/60 text-xs">
                        <div>
                          <span className="text-outline block text-[11px]">Đơn giá niêm yết</span>
                          <span className="font-mono font-bold text-on-surface text-sm">
                            {selectedCase.product.price} {selectedCase.product.priceUnit}
                          </span>
                        </div>
                        <div>
                          <span className="text-outline block text-[11px]">Tồn kho trạm Thới Lai</span>
                          <span className="font-semibold text-emerald-800 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                            <span>{selectedCase.product.stockLabel}</span>
                          </span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-outline block text-[11px]">Trạng thái giao nhận</span>
                          <span className="font-medium text-on-surface">Sẵn sàng xuất kho</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
                      <span className="material-symbols-outlined text-[24px] text-amber-700 shrink-0">info</span>
                      <div>
                        {selectedCase.noProductNote ||
                          'Chưa có sản phẩm phác đồ liên kết với ca bệnh này. Thẩm định viên có thể ghi chú chỉ định cụ thể trong ô ghi chú chuyên môn gửi nông dân.'}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* B5. SUPPORTING FARMER CONTEXT (Compact Agronomic Metadata) */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">agriculture</span>
                    Thông tin bối cảnh thửa ruộng (Farmer Context)
                  </span>
                  <span className="text-[11px] text-outline">ĐBSCL • Vụ Thu Đông</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/40">
                    <div className="text-outline text-[11px]">Nông dân &amp; SĐT</div>
                    <div className="font-bold text-on-surface mt-0.5">{selectedCase.field.farmerName}</div>
                    <div className="font-mono text-primary text-[11px]">{selectedCase.field.farmerPhone}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/40">
                    <div className="text-outline text-[11px]">Vị trí thửa ruộng</div>
                    <div className="font-semibold text-on-surface mt-0.5">{selectedCase.field.plotLabel}</div>
                    <div className="text-outline text-[11px] truncate" title={selectedCase.field.plotLocation}>
                      {selectedCase.field.plotLocation}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/40">
                    <div className="text-outline text-[11px]">Giống lúa &amp; Ngày sạ</div>
                    <div className="font-semibold text-on-surface mt-0.5">{selectedCase.field.varietyLabel}</div>
                    <div className="text-outline text-[11px]">{selectedCase.field.varietyNote}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/40">
                    <div className="text-outline text-[11px]">Kênh gửi yêu cầu</div>
                    <div className="font-semibold text-on-surface mt-0.5">{selectedCase.field.sentChannel}</div>
                    <div className="text-outline text-[11px]">{selectedCase.field.sentTime}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant text-outline">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline/60 block">touch_app</span>
              Chọn một ca từ hàng đợi bên trái để bắt đầu thẩm định.
            </div>
          )}
        </div>
      </div>

      {/* 3. ZOOM IMAGE MODAL (HIGH RESOLUTION INSPECTION) */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between text-white pb-3">
              <span className="font-bold text-sm truncate">{zoomedImage.title}</span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/20 bg-black flex items-center justify-center max-h-[80vh]">
              <img
                src={zoomedImage.src}
                alt={zoomedImage.alt}
                className="max-h-[80vh] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
