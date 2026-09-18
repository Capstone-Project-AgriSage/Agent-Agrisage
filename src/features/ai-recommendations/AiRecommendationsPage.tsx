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
import StatusBadge from '../../components/ui/StatusBadge'
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
              status: 'Đã phê duyệt',
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
              status: 'Đã từ chối',
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
      {/* 1. HEADER CONTROL BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <span className="material-symbols-outlined text-[24px]">psychology</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-on-surface text-base">Thẩm định chẩn đoán bệnh lúa AI</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">Mô hình v2.1</span>
            </div>
            <p className="text-xs text-outline mt-0.5">
              5 bệnh lúa ĐBSCL • Thẩm định viên: <strong className="text-on-surface font-semibold">{user.name}</strong> ({user.hub})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md shadow-sm transition-colors"
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
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* 2. 4 CLEAN KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1: Chờ thẩm định */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border-2 border-amber-400/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Chờ thẩm định</span>
            <span className="p-1 rounded bg-amber-50 text-amber-700 material-symbols-outlined text-[20px]">hourglass_top</span>
          </div>
          <div className="mt-2">
            <div className="font-metric-num text-metric-num text-on-surface font-semibold">{pendingCount} <span className="text-sm font-normal text-outline">ca</span></div>
            <div className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              <span>Cần duyệt phác đồ</span>
            </div>
          </div>
        </div>

        {/* Card 2: Đã phê duyệt */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Đã phê duyệt</span>
            <span className="p-1 rounded bg-emerald-50 text-emerald-700 material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <div className="mt-2">
            <div className="font-metric-num text-metric-num text-primary font-semibold">{approvedCount} <span className="text-sm font-normal text-outline">ca</span></div>
            <div className="text-xs text-emerald-700 font-medium mt-1">Đã mở bán thuốc cho nông dân</div>
          </div>
        </div>

        {/* Card 3: Cần khảo sát / Chưa chắc chắn */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Cần khảo sát (&lt;70%)</span>
            <span className="p-1 rounded bg-orange-50 text-orange-700 material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div className="mt-2">
            <div className="font-metric-num text-metric-num text-orange-700 font-semibold">{uncertainCount} <span className="text-sm font-normal text-outline">ca</span></div>
            <div className="text-xs text-outline mt-1">Đã từ chối: {rejectedCount} ca</div>
          </div>
        </div>

        {/* Card 4: Tổng ca tiếp nhận */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Tổng ca hôm nay</span>
            <span className="p-1 rounded bg-blue-50 text-blue-700 material-symbols-outlined text-[20px]">analytics</span>
          </div>
          <div className="mt-2">
            <div className="font-metric-num text-metric-num text-on-surface font-semibold">{totalCasesToday} <span className="text-sm font-normal text-outline">lượt</span></div>
            <div className="text-xs text-outline mt-1">Trạm Thới Lai • Cần Thơ</div>
          </div>
        </div>
      </div>

      {/* 3. FILTER BAR */}
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

      {/* 4. MAIN EVALUATION TABLE */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
        <div className="px-space-md py-space-sm border-b border-outline-variant flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-2">
            <span className="font-title-md text-title-md text-on-surface font-semibold">Hàng đợi thẩm định bệnh lúa</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">{filteredCases.length} ca</span>
          </div>
          <div className="font-body-sm text-body-sm text-outline flex items-center gap-1">
            <span>Đồng bộ từ app nông dân</span>
            <span className="material-symbols-outlined text-[16px] text-emerald-600">sync</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/80 border-b border-outline-variant">
                <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider">Mã AI</th>
                <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider">Nông dân &amp; Thửa</th>
                <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider">Ảnh lá</th>
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
                    <td className={`py-3 px-3 font-mono font-semibold ${isSelected ? 'text-primary' : item.idClassName}`}>#{item.id}</td>
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
                      {!item.productLine ? <div className="text-[10px] text-orange-700">Chưa đủ tin cậy</div> : null}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center text-[11px] font-medium ${item.stockLabelClassName}`}>
                        {item.productLine ? item.stockLabel : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge label={item.statusBadge.label} className={item.statusBadge.className} minWidthClassName="min-w-[140px]" />
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
                        <span className="text-[11px] text-emerald-700 font-medium">Đã duyệt</span>
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

      {/* 5. DETAIL MODAL: 2-COLUMN ERGONOMIC LAYOUT */}
      <DetailModal open={selected !== null} onClose={() => setSelectedId(null)} widthClassName="max-w-3xl">
        {selected ? (
          <div className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-xl">
            {/* Modal Header */}
            <div className="p-4 bg-surface-container-low/60 border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded font-mono font-bold text-xs bg-primary/10 text-primary">#{selected.id}</span>
                <span className="font-semibold text-on-surface text-base">Thẩm định chẩn đoán bệnh lúa</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge label={selected.panelBadge.label} className={selected.panelBadge.className} />
              </div>
            </div>

            {/* Modal 2-Column Body */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Leaf Image & AI Result */}
              <div className="md:col-span-5 flex flex-col gap-3">
                <div className="relative w-full h-56 rounded-xl overflow-hidden border border-outline-variant bg-slate-900">
                  <img
                    className={`w-full h-full object-contain ${selected.imageBlurred ? 'blur-sm' : ''}`}
                    data-alt={selected.imageAlt}
                    src={selected.imageSrc}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Mô hình Rice v2.1
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
                  <div className="text-[11px] text-outline">Bệnh AI phân loại</div>
                  <div className="font-bold text-on-surface text-sm mt-0.5">
                    {selected.diseaseFullLabel}
                  </div>
                  {selected.diseaseLatin ? (
                    <div className="text-xs text-outline italic">{selected.diseaseLatin}</div>
                  ) : null}

                  <div className="mt-2.5 pt-2 border-t border-outline-variant/60 flex items-center justify-between">
                    <span className="text-xs text-outline">Độ tin cậy:</span>
                    <span className={`font-bold text-sm ${selected.confidenceFullClassName}`}>
                      {selected.confidenceFullLabel}
                    </span>
                  </div>
                </div>

                {/* Farmer quick metadata */}
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-outline">Nông dân:</span>
                    <span className="font-semibold text-on-surface">{selected.field.farmerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">SĐT:</span>
                    <span className="font-mono text-primary font-medium">{selected.field.farmerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Thửa ruộng:</span>
                    <span className="text-on-surface">{selected.field.plotLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Giống lúa:</span>
                    <span className="text-on-surface">{selected.field.varietyLabel}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Proposed Pharmacy & Agent Decision */}
              <div className="md:col-span-7 flex flex-col gap-4">
                {/* Proposed Medication Card */}
                <div>
                  <span className="text-xs font-semibold text-outline uppercase tracking-wider block mb-1.5">
                    Phác đồ thuốc đề xuất
                  </span>
                  {selected.product ? (
                    <div className="p-3 rounded-xl border border-outline-variant bg-surface-container-lowest space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-primary text-base">{selected.product.name}</div>
                          <div className="text-xs text-outline">{selected.product.activeIngredient}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {selected.product.fitTag}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/60 text-xs">
                        <div>
                          <span className="text-outline block">Giá niêm yết</span>
                          <span className="font-semibold text-on-surface">{selected.product.price} {selected.product.priceUnit}</span>
                        </div>
                        <div>
                          <span className="text-outline block">Kho Thới Lai</span>
                          <span className="font-semibold text-emerald-700 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">inventory</span>
                            <span>{selected.product.stockLabel}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-orange-200 bg-orange-50/60 text-orange-800 text-xs">
                      {selected.noProductNote}
                    </div>
                  )}
                </div>

                {/* Agent Decision Panel */}
                <div className="p-3.5 rounded-xl bg-surface-container-low/40 border border-outline-variant space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-on-surface">Đại lý phê duyệt</span>
                    <button
                      type="button"
                      onClick={() => setIsCorrecting(!isCorrecting)}
                      className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit_note</span>
                      <span>{isCorrecting ? 'Hủy hiệu chỉnh' : 'Đổi bệnh / thuốc khác'}</span>
                    </button>
                  </div>

                  {isCorrecting && (
                    <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Chọn lại bệnh chính xác:
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
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Chỉ định thuốc từ kho:
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
                    <label className="block text-xs font-medium text-on-surface mb-1">
                      Ghi chú chuyên môn gửi nông dân:
                    </label>
                    <textarea
                      key={selected.id}
                      ref={agentNoteRef}
                      className="w-full p-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs text-on-surface focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-outline resize-none"
                      placeholder="Ghi chú thêm về liều lượng phun xịt hoặc cách xử lý nước ruộng..."
                      rows={2}
                      defaultValue={selected.agentNote ?? selected.defaultAgentNote}
                    />
                  </div>

                  {!isCorrecting && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-outline shrink-0">Lý do từ chối:</span>
                      <select
                        key={selected.id}
                        ref={rejectReasonRef}
                        className="py-1 px-2 text-xs bg-surface-container-lowest border border-outline-variant rounded text-on-surface-variant flex-1"
                        defaultValue=""
                      >
                        <option value="">-- Nếu từ chối, chọn lý do --</option>
                        <option value="mo">Ảnh mờ / Cháy sáng</option>
                        <option value="nham">Nhận diện nhầm bệnh</option>
                        <option value="ngoai-pham-vi">Không phải lá lúa / Ngoài phạm vi 5 bệnh</option>
                        <option value="sai-giai-doan">Sai giai đoạn phát triển</option>
                        <option value="khang-thuoc">Khu vực đã kháng hoạt chất này</option>
                      </select>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      className="py-2 px-3 rounded-lg bg-surface-container-lowest border border-error/40 hover:bg-error/5 text-error text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={selected.actionsMode === 'sent'}
                      onClick={() => rejectCase(selected.id)}
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      <span>Từ chối</span>
                    </button>

                    {isCorrecting ? (
                      <button
                        className="py-2 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-sm"
                        onClick={() => approveWithCorrection(selected.id)}
                      >
                        <span className="material-symbols-outlined text-[16px]">done_all</span>
                        <span>Hiệu chỉnh &amp; Duyệt</span>
                      </button>
                    ) : (
                      <button
                        className="py-2 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selected.actionsMode === 'sent'}
                        onClick={() => approveCase(selected.id)}
                      >
                        <span className="material-symbols-outlined text-[16px]">check</span>
                        <span>{selected.actionsMode === 'sent' ? 'Đã duyệt' : 'Phê duyệt phác đồ'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DetailModal>
    </>
  )
}
