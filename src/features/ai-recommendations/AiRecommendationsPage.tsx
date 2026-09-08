import { useState } from 'react'
import { usePageHeader } from '../../context/PageHeaderContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import { aiCases as AI_CASES } from '../../data/mockAiRecommendations'

export default function AiRecommendationsPage() {
  usePageHeader({
    title: 'Quản lý gợi ý AI',
    subtitle: 'Kiểm tra kết quả nhận diện bệnh và duyệt gợi ý sản phẩm trước khi hiển thị cho nông dân',
  })

  const [selectedId, setSelectedId] = useState(AI_CASES[0].id)
  const selected = AI_CASES.find((c) => c.id === selectedId) ?? AI_CASES[0]

  const STATUS_LABELS: Record<string, string> = {
    'cho-duyet': 'Chờ duyệt',
    'da-duyet': 'Đã phê duyệt',
    'da-tu-choi': 'Đã từ chối',
    'chua-chac-chan': 'Chưa đủ chắc chắn',
  }
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('cho-duyet')

  const filteredCases = AI_CASES.filter((item) => {
    const keyword = search.trim().toLowerCase()
    const matchesSearch =
      !keyword ||
      item.id.toLowerCase().includes(keyword) ||
      item.farmerName.toLowerCase().includes(keyword) ||
      item.field.farmerPhone.toLowerCase().includes(keyword)
    const matchesStatus = !statusFilter || item.statusBadge.label === STATUS_LABELS[statusFilter]
    return matchesSearch && matchesStatus
  })

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('')
  }

  return (
    <>
      {/* UTILITY ACTIONS */}
      <div className="flex items-center justify-end gap-space-md">
        <div className="flex items-center gap-space-sm">
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md shadow-sm transition-colors">
            <span className="material-symbols-outlined text-[18px] text-outline">file_download</span>
            <span className="">Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* 5 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
        <div className="p-space-base rounded-xl bg-surface-container-lowest border-2 border-amber-400/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline">Chờ duyệt</span>
            <span className="p-1 rounded bg-amber-50 text-amber-700 material-symbols-outlined text-[18px]">hourglass_top</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-metric-num text-metric-num text-on-surface font-semibold">14 <span className="text-sm font-normal text-outline">yêu cầu</span></div>
            <div className="font-body-sm text-body-sm text-amber-700 font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              <span className="">08 ca ưu tiên trong ngày</span>
            </div>
          </div>
        </div>
        <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline">Đã phê duyệt</span>
            <span className="p-1 rounded bg-emerald-50 text-emerald-700 material-symbols-outlined text-[18px]">check_circle</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-metric-num text-metric-num text-primary font-semibold">42 <span className="text-sm font-normal text-outline">kết quả</span></div>
            <div className="font-body-sm text-body-sm text-emerald-700 font-medium mt-1">Đã gửi gợi ý đến app nông dân</div>
          </div>
        </div>
        <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline">Đã từ chối</span>
            <span className="p-1 rounded bg-slate-100 text-slate-700 material-symbols-outlined text-[18px]">cancel</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-metric-num text-metric-num text-on-surface font-semibold">06 <span className="text-sm font-normal text-outline">yêu cầu</span></div>
            <div className="font-body-sm text-body-sm text-slate-600 mt-1">Ảnh mờ hoặc không đúng bệnh</div>
          </div>
        </div>
        <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline">Chưa chắc chắn</span>
            <span className="p-1 rounded bg-orange-50 text-orange-700 material-symbols-outlined text-[18px]">warning</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-metric-num text-metric-num text-orange-700 font-semibold">05 <span className="text-sm font-normal text-outline">ca (&lt;70%)</span></div>
            <div className="font-body-sm text-body-sm text-orange-700 mt-1">Cần kỹ sư kiểm tra thực địa</div>
          </div>
        </div>
        <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline">Tổng phân tích hôm nay</span>
            <span className="p-1 rounded bg-blue-50 text-blue-700 material-symbols-outlined text-[18px]">analytics</span>
          </div>
          <div className="mt-space-sm">
            <div className="font-metric-num text-metric-num text-on-surface font-semibold">67 <span className="text-sm font-normal text-outline">lượt</span></div>
            <div className="font-body-sm text-body-sm text-emerald-700 font-medium mt-1 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[15px]">trending_up</span>
              <span className="">Tăng +18.4% so với hôm qua</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex flex-wrap items-center gap-space-sm flex-1">
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">filter_alt</span>
            <input
              className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low/50 border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-outline"
              placeholder="Tìm mã phân tích / tên nông dân / SĐT..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <select className="py-1.5 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" defaultValue="dao-on">
              <option value="">Tất cả bệnh (4 loại lúa)</option>
              <option value="dao-on">Đạo ôn</option>
              <option value="bac-la">Bạc lá</option>
              <option value="kho-van">Khô vằn</option>
              <option value="dom-nau">Đốm nâu</option>
            </select>
          </div>
          <div className="flex items-center">
            <select
              className="py-1.5 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="cho-duyet">Chờ duyệt</option>
              <option value="da-duyet">Đã phê duyệt</option>
              <option value="da-tu-choi">Đã từ chối</option>
              <option value="chua-chac-chan">Chưa đủ chắc chắn (&lt;70%)</option>
            </select>
          </div>
          <div className="flex items-center">
            <select className="py-1.5 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Tất cả độ tin cậy</option>
              <option value="high">&gt;90% (Độ tin cậy cao)</option>
              <option value="med">75-90% (Phù hợp)</option>
              <option value="low">&lt;75% (Thấp / Chưa chắc chắn)</option>
            </select>
          </div>
          <div className="flex items-center">
            <select className="py-1.5 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="today">Hôm nay - Vụ Thu Đông</option>
              <option value="yesterday">Hôm qua</option>
              <option value="7days">7 ngày qua</option>
            </select>
          </div>
        </div>
        <button
          className="px-3 py-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-low font-label-md text-label-md flex items-center gap-1 transition-colors"
          onClick={handleClearFilters}
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span className="">Xóa bộ lọc</span>
        </button>
      </div>

      {/* MAIN SPLIT WORKSPACE (Table + Detailed Review Panel) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-stretch">
        {/* LEFT: MAIN EVALUATION TABLE */}
        <div className="xl:col-span-7 h-full bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
          <div className="px-space-md py-space-sm border-b border-outline-variant flex items-center justify-between bg-surface-container-low/40">
            <div className="flex items-center gap-2">
              <span className="font-title-md text-title-md text-on-surface font-semibold">Danh sách phân tích bệnh lúa</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">{filteredCases.length} kết quả cần xử lý</span>
            </div>
            <div className="font-body-sm text-body-sm text-outline flex items-center gap-1">
              <span className="">Tự động cập nhật qua AI Vision</span>
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
                  <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider">Kho</th>
                  <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider">Trạng thái</th>
                  <th className="py-2.5 px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 font-body-sm text-body-sm">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-outline text-xs">
                      Không tìm thấy kết quả phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : null}
                {filteredCases.map((item) => {
                  const isSelected = item.id === selectedId
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
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
                        {!item.productLine ? <div className="text-[10px] text-orange-700">Không gợi ý khi &lt;70%</div> : null}
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
                            <RowActionsMenu triggerLabel={`Thao tác #${item.id}`} actions={item.actions ?? []} />
                          </div>
                        ) : item.actionsMode === 'sent' ? (
                          <span className="text-[11px] text-outline">Đã gửi</span>
                        ) : (
                          <button
                            className="px-2 py-1 rounded bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface text-[11px] font-medium"
                            onClick={(e) => e.stopPropagation()}
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
          <div className="p-space-sm border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest text-outline font-label-sm text-label-sm">
            <div className="">Hiển thị 1 - 5 của 14 yêu cầu cần xử lý hôm nay</div>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 rounded border border-outline-variant hover:bg-surface-container-low disabled:opacity-40" disabled>Trước</button>
              <button className="px-2.5 py-1 rounded bg-primary text-white font-semibold">1</button>
              <button className="px-2.5 py-1 rounded border border-outline-variant hover:bg-surface-container-low">2</button>
              <button className="px-2 py-1 rounded border border-outline-variant hover:bg-surface-container-low">Sau</button>
            </div>
          </div>
        </div>

        {/* RIGHT: RECOMMENDATION DETAIL PANEL */}
        <div className="xl:col-span-5 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col divide-y divide-outline-variant">
          <div className="p-space-md bg-surface-container-low/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-primary/10 text-primary">#{selected.id}</span>
              <span className="font-title-md text-title-md text-on-surface font-semibold">Chi tiết đánh giá gợi ý AI</span>
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${selected.panelBadge.className}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${selected.panelBadge.dotClassName} mr-1.5`}></span>
              {selected.panelBadge.label}
            </span>
          </div>
          {/* 1. THÔNG TIN NÔNG DÂN */}
          <div className="p-space-md flex flex-col gap-space-xs">
            <div className="flex items-center justify-between text-outline font-label-sm text-label-sm uppercase tracking-wide">
              <span className="">1. Thông tin nông dân &amp; đồng ruộng</span>
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
          {/* 2. KẾT QUẢ AI & BOUNDING BOX */}
          <div className="p-space-md flex flex-col gap-space-xs">
            <div className="flex items-center justify-between text-outline font-label-sm text-label-sm uppercase tracking-wide">
              <span className="">2. Kết quả nhận diện bệnh bằng AI</span>
              <span className="material-symbols-outlined text-[16px]">psychology</span>
            </div>
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-outline-variant bg-slate-900 mt-1">
              <img className={`w-full h-full object-cover opacity-90 ${selected.imageBlurred ? 'blur-sm' : ''}`} data-alt={selected.imageAlt} src={selected.imageSrc} />
              {selected.boundingBox ? (
                <div className="absolute top-10 left-24 w-28 h-20 border-2 border-emerald-400 bg-emerald-400/10 rounded pointer-events-none flex flex-col justify-between p-1">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-600 text-white text-[9px] font-bold px-1 rounded uppercase tracking-wider">{selected.boundingBox.label}</span>
                    <span className="bg-black/60 text-white text-[9px] px-1 rounded font-mono">{selected.boundingBox.confidence}</span>
                  </div>
                  <div className="text-[9px] text-emerald-300 font-mono">{selected.boundingBox.note}</div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                  <span className="text-[11px] text-orange-200 bg-black/50 px-2 py-1 rounded">Ảnh chưa đủ nét để xác định vùng tổn thương</span>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[12px]">crop_free</span>
                <span className="">AI Vision Model v2.4 Rice Disease</span>
              </div>
            </div>
            <div className="mt-2 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-outline">Bệnh nhận diện</div>
                <div className="font-semibold text-on-surface text-sm">
                  {selected.diseaseFullLabel}{' '}
                  {selected.diseaseLatin ? <span className="font-normal text-outline text-xs">({selected.diseaseLatin})</span> : null}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-outline">Độ tin cậy</div>
                <div className={`font-bold text-sm flex items-center justify-end gap-1 ${selected.confidenceFullClassName}`}>
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span className="">{selected.confidenceFullLabel}</span>
                </div>
              </div>
            </div>
          </div>
          {/* 3. GỢI Ý SẢN PHẨM THƯƠNG MẠI */}
          <div className="p-space-md flex flex-col gap-space-xs">
            <div className="flex items-center justify-between text-outline font-label-sm text-label-sm uppercase tracking-wide">
              <span className="">3. Gợi ý sản phẩm thương mại</span>
              <span className="material-symbols-outlined text-[16px]">storefront</span>
            </div>
            <div className="p-2.5 rounded bg-amber-50/90 border-l-4 border-amber-500 text-amber-900 font-body-sm text-body-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5 shrink-0">info</span>
              <div className="">
                <span className="font-semibold">Lưu ý quan trọng:</span> Đây là gợi ý sản phẩm hỗ trợ xử lý và cần được người có chuyên môn xem xét trước khi sử dụng.
              </div>
            </div>
            {selected.product ? (
              <div className="p-3 rounded-lg border border-outline-variant bg-surface-container-lowest shadow-xs flex flex-col gap-2 mt-1">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-outline uppercase tracking-wider">Sản phẩm đề xuất</span>
                    <div className="font-semibold text-primary text-base">{selected.product.name}</div>
                    <div className="text-xs text-outline">Danh mục: {selected.product.category} • {selected.product.activeIngredient}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selected.product.fitTag}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/60">
                  <div>
                    <div className="text-[11px] text-outline">Giá bán đại lý niêm yết</div>
                    <div className="font-semibold text-on-surface text-sm">{selected.product.price} <span className="text-xs font-normal text-outline">{selected.product.priceUnit}</span></div>
                  </div>
                  <div>
                    <div className="text-[11px] text-outline">{selected.product.stockNote}</div>
                    <div className="font-semibold text-emerald-700 text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">inventory</span>
                      <span className="">{selected.product.stockLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-low p-2 rounded text-xs text-on-surface-variant leading-relaxed">
                  <span className="font-medium text-on-surface">Lý do AI khuyến nghị:</span> {selected.product.reasoning}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/60 text-orange-800 text-xs leading-relaxed mt-1">
                {selected.noProductNote}
              </div>
            )}
          </div>
          {/* 4. KHUNG PHÊ DUYỆT CỦA KỸ SƯ */}
          <div className="p-space-md flex flex-col gap-space-sm bg-surface-container-low/30">
            <div className="flex items-center justify-between text-outline font-label-sm text-label-sm uppercase tracking-wide">
              <span className="">4. Phê duyệt của đại lý</span>
              <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">Ghi chú của đại lý (hiển thị kèm gợi ý trên app nông dân):</label>
              <textarea
                key={selected.id}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-outline"
                placeholder="Ví dụ: Vết bệnh mới chớm, phun vào sáng sớm khi ráo sương. Giữ mực nước ruộng 3-5cm..."
                rows={2}
                defaultValue={selected.defaultAgentNote}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-outline">Lý do nếu từ chối:</span>
              <select className="py-1 px-2 text-xs bg-surface-container-lowest border border-outline-variant rounded text-on-surface-variant">
                <option value="">-- Chọn lý do từ chối nếu có --</option>
                <option value="mo">Ảnh mờ / Cháy sáng</option>
                <option value="nham">Nhận diện nhầm bệnh</option>
                <option value="sai-giai-doan">Sai giai đoạn phát triển</option>
                <option value="khang-thuoc">Khu vực đã kháng hoạt chất này</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-space-sm pt-1">
              <button className="w-full py-2.5 px-4 rounded-lg bg-surface-container-lowest border border-error/40 hover:bg-error/5 text-error font-title-md text-title-md flex items-center justify-center gap-1.5 transition-colors shadow-xs">
                <span className="material-symbols-outlined text-[18px]">close</span>
                <span className="">Từ chối</span>
              </button>
              <button className="w-full py-2.5 px-4 rounded-lg bg-primary-container hover:bg-primary text-white font-title-md text-title-md flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span className="">Phê duyệt gợi ý</span>
              </button>
            </div>
          </div>
          {/* 5. NHẬT KÝ XEM XÉT GẦN ĐÂY */}
          <div className="p-space-md flex flex-col gap-2">
            <div className="flex items-center justify-between text-outline font-label-sm text-label-sm uppercase tracking-wide">
              <span className="">5. Nhật ký thẩm định gần đây (Đại lý)</span>
              <span className="material-symbols-outlined text-[16px]">history</span>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="p-2 rounded bg-surface-container-low/60 border border-outline-variant/40 flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0"></span>
                <div className="flex-1">
                  <div className="text-on-surface font-medium">
                    Kỹ sư Nguyễn Văn Minh — <span className="text-emerald-700 font-semibold">Đã phê duyệt #AI-2398</span>
                  </div>
                  <div className="text-outline text-[11px]">Bệnh khô vằn / Validacin 5SL — 08:42 hôm nay</div>
                </div>
              </div>
              <div className="p-2 rounded bg-surface-container-low/60 border border-outline-variant/40 flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500 mt-1 shrink-0"></span>
                <div className="flex-1">
                  <div className="text-on-surface font-medium">
                    Kỹ sư Nguyễn Văn Minh — <span className="text-slate-700 font-semibold">Từ chối #AI-2395</span>
                  </div>
                  <div className="text-outline text-[11px]">Lý do: Ảnh không rõ lá bệnh (cháy sáng) — 08:15 hôm nay</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
