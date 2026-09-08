import { useState } from 'react'
import { usePageHeader } from '../../context/PageHeaderContext'
import { logEntries as LOG_ENTRIES } from '../../data/mockActivityLog'

export default function ActivityLogPage() {
  usePageHeader({
    title: 'Nhật ký thao tác',
    subtitle: 'Theo dõi lịch sử thao tác và hoạt động nghiệp vụ trong hệ thống',
    badge: 'Kiểm toán hệ thống',
  })

  const [selectedId, setSelectedId] = useState(LOG_ENTRIES[0].id)
  const selected = LOG_ENTRIES.find((entry) => entry.id === selectedId) ?? LOG_ENTRIES[0]

  const MODULE_OPTIONS = ['Tất cả phân hệ', 'Đơn hàng', 'Giao hàng', 'Thanh toán', 'Công nợ', 'Gợi ý AI', 'Kho hàng', 'Sản phẩm', 'Nông dân']
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState(MODULE_OPTIONS[0])

  const filteredEntries = LOG_ENTRIES.filter((entry) => {
    const keyword = search.trim().toLowerCase()
    const matchesSearch =
      !keyword ||
      entry.id.toLowerCase().includes(keyword) ||
      entry.actorName.toLowerCase().includes(keyword) ||
      entry.description.toLowerCase().includes(keyword) ||
      entry.objectId.toLowerCase().includes(keyword)
    const matchesModule = moduleFilter === MODULE_OPTIONS[0] || entry.moduleLabel === moduleFilter
    return matchesSearch && matchesModule
  })

  const handleClearFilters = () => {
    setSearch('')
    setModuleFilter(MODULE_OPTIONS[0])
  }

  return (
    <>
      {/* Trailing Action: Export Data */}
      <div className="flex items-center justify-end gap-space-sm">
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant hover:border-outline text-on-surface rounded-lg font-label-md text-label-md font-semibold shadow-sm hover:bg-surface-container-low active:bg-surface-container-high transition"
          type="button"
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
            <span className="font-metric-num text-metric-num text-on-surface font-bold">328</span>
            <span className="font-body-sm text-body-sm text-outline">lượt</span>
          </div>
          <div className="mt-2 pt-2 border-t border-outline-variant/60 flex items-center gap-1.5">
            <span className="inline-flex items-center text-emerald-700 font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[16px]" data-icon="trending_up">
                trending_up
              </span>{' '}
              +14.2%
            </span>
            <span className="font-body-sm text-[11px] text-outline">so với hôm qua</span>
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
            <span className="font-metric-num text-metric-num text-on-surface font-bold">54</span>
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
            <span className="font-metric-num text-metric-num text-on-surface font-bold">29</span>
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
            <span className="font-metric-num text-metric-num text-on-surface font-bold">18</span>
            <span className="font-body-sm text-body-sm text-outline">lượt</span>
          </div>
          <div className="mt-2 pt-2 border-t border-outline-variant/60 flex items-center gap-2">
            <span className="inline-flex items-center text-primary-container font-semibold text-[11px]">15 phê duyệt</span>
            <span className="text-outline">•</span>
            <span className="inline-flex items-center text-error font-semibold text-[11px]">3 từ chối</span>
          </div>
        </div>
      </section>

      {/* ==================== FILTER TOOLBAR ==================== */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm">
        <div className="flex flex-wrap items-center gap-space-sm justify-between">
          {/* Search input */}
          <div className="relative flex-1 min-w-[260px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-[18px]" data-icon="search">
                search
              </span>
            </div>
            <input
              className="w-full pl-9 pr-3 py-1.5 text-body-sm font-body-sm bg-surface-container-low border border-outline-variant rounded-lg placeholder-outline text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-white"
              placeholder="Tìm kiếm theo mã, nội dung, người thực hiện..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Dropdowns Group */}
          <div className="flex flex-wrap items-center gap-space-sm">
            {/* Phân hệ */}
            <div className="relative">
              <select
                className="appearance-none bg-surface-container-lowest border border-outline-variant hover:border-outline text-on-surface text-label-md font-label-md py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
              >
                {MODULE_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-outline">
                <span className="material-symbols-outlined text-[16px]" data-icon="expand_more">
                  expand_more
                </span>
              </div>
            </div>
            {/* Loại thao tác */}
            <div className="relative">
              <select className="appearance-none bg-surface-container-lowest border border-outline-variant hover:border-outline text-on-surface text-label-md font-label-md py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer">
                <option defaultValue="">Tất cả loại thao tác</option>
                <option>Nguyễn Văn Minh</option>
                <option>Cập nhật</option>
                <option>Xác nhận</option>
                <option>Phê duyệt</option>
                <option>Từ chối</option>
                <option>Đối soát</option>
                <option>Gửi nhắc</option>
                <option>Điều chỉnh</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-outline">
                <span className="material-symbols-outlined text-[16px]" data-icon="expand_more">
                  expand_more
                </span>
              </div>
            </div>
            {/* Người thực hiện */}
            <div className="relative">
              <select className="appearance-none bg-surface-container-lowest border border-outline-variant hover:border-outline text-on-surface text-label-md font-label-md py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer">
                <option defaultValue="">Người thực hiện: Tất cả</option>
                <option>Nguyễn Văn Minh</option>
                <option>ĐP. Lê Hoàng</option>
                <option>KT. Trần Thảo</option>
                <option>Hệ thống VietQR</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-outline">
                <span className="material-symbols-outlined text-[16px]" data-icon="expand_more">
                  expand_more
                </span>
              </div>
            </div>
            {/* Thời gian */}
            <div className="relative">
              <select className="appearance-none bg-surface-container-lowest border border-outline-variant hover:border-outline text-on-surface text-label-md font-label-md py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer">
                <option defaultValue="">Thời gian: Hôm nay</option>
                <option>Nguyễn Văn Minh</option>
                <option>7 ngày qua</option>
                <option>Vụ Thu Đông</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-outline">
                <span className="material-symbols-outlined text-[16px]" data-icon="expand_more">
                  expand_more
                </span>
              </div>
            </div>
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

      {/* ==================== TWO COLUMN LAYOUT (TABLE 65% + DETAIL PANEL 35%) ==================== */}
      <div className="grid grid-cols-12 gap-space-lg items-stretch">
        {/* LEFT COLUMN: ACTIVITY LOG TABLE & RECENT EVENTS (~65% -> 8 columns) */}
        <section className="col-span-12 lg:col-span-8 space-y-space-md">
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
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-outline text-xs">
                        Không tìm thấy nhật ký phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : null}
                  {filteredEntries.map((entry) => {
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
            {/* Table Pagination */}
            <div className="py-3 px-4 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-between">
              <div className="font-body-sm text-body-sm text-outline">
                Hiển thị <span className="font-semibold text-on-surface">1 - 6</span> trong số{' '}
                <span className="font-semibold text-on-surface">328</span> bản ghi
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-outline hover:bg-surface-container-low disabled:opacity-40"
                  disabled
                >
                  <span className="material-symbols-outlined text-[16px]" data-icon="chevron_left">
                    chevron_left
                  </span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-primary-container text-white font-semibold text-label-sm">
                  1
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container-low text-label-sm">
                  2
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container-low text-label-sm">
                  3
                </button>
                <span className="px-1 text-outline">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container-low text-label-sm">
                  55
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-[16px]" data-icon="chevron_right">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
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
              {/* Event 1 */}
              <div className="flex items-start gap-3 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-primary-container border border-emerald-300 mt-0.5 whitespace-nowrap">
                  Gợi ý AI
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body-sm text-body-sm text-on-surface font-medium leading-snug">
                    Phê duyệt thành công gợi ý sản phẩm cho hộ <span className="font-bold text-primary">Trần Văn Hải</span>
                  </p>
                  <p className="font-body-sm text-[11px] text-outline">Mã phân tích #AI-2401 • Thuốc Fuji-One 40WP</p>
                </div>
                <span className="font-mono text-outline text-[11px] whitespace-nowrap">10:45</span>
              </div>
              {/* Event 2 */}
              <div className="flex items-start gap-3 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 mt-0.5 whitespace-nowrap">
                  Thanh toán
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body-sm text-body-sm text-on-surface font-medium leading-snug">
                    Đối soát tự động VietQR thành công khoản cọc{' '}
                    <span className="font-bold text-on-surface font-mono">14.200.000 đ</span>
                  </p>
                  <p className="font-body-sm text-[11px] text-outline">
                    Khách hàng: Nguyễn Văn Thắng • BIDV khớp lệnh ngay lập tức
                  </p>
                </div>
                <span className="font-mono text-outline text-[11px] whitespace-nowrap">10:32</span>
              </div>
              {/* Event 3 */}
              <div className="flex items-start gap-3 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 mt-0.5 whitespace-nowrap">
                  Đơn hàng
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body-sm text-body-sm text-on-surface font-medium leading-snug">
                    Đơn hàng giá trị cao <span className="font-mono font-bold">#DH-2024-1082</span> (
                    <span className="font-mono font-bold text-on-surface">48.500.000 đ</span>) vừa tạo thành công
                  </p>
                  <p className="font-body-sm text-[11px] text-outline">Hợp đồng bao tiêu phân bón NPK Cà Mau Vụ Thu Đông</p>
                </div>
                <span className="font-mono text-outline text-[11px] whitespace-nowrap">09:58</span>
              </div>
              {/* Event 4 */}
              <div className="flex items-start gap-3 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 mt-0.5 whitespace-nowrap">
                  Công nợ
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body-sm text-body-sm text-on-surface font-medium leading-snug">
                    Đã gửi thông báo nhắc lịch thanh toán gối đầu đến{' '}
                    <span className="font-bold text-on-surface">12 hộ nông dân</span> Thới Lai
                  </p>
                  <p className="font-body-sm text-[11px] text-outline">Tỷ lệ mở tin nhắn kiểm tra: 75% sau 45 phút phát hành</p>
                </div>
                <span className="font-mono text-outline text-[11px] whitespace-nowrap">08:40</span>
              </div>
            </div>
          </div>
        </section>
        {/* RIGHT COLUMN: DETAIL PANEL FOR SELECTED ENTRY (~35% -> 4 columns) */}
        <aside className="col-span-12 lg:col-span-4 h-full flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden sticky top-[5.25rem]">
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
            <button className="text-outline hover:text-on-surface p-1 rounded-md hover:bg-surface-container">
              <span className="material-symbols-outlined text-[18px]" data-icon="open_in_new">
                open_in_new
              </span>
            </button>
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
            >
              <span className="material-symbols-outlined text-[18px]" data-icon="psychology">
                psychology
              </span>
              <span className="">Xem phân tích AI gốc</span>
            </button>
            <button
              className="w-full py-2 px-3 bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-medium rounded-lg flex items-center justify-center gap-2 transition"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-outline" data-icon="contact_page">
                contact_page
              </span>
              <span className="">Xem hồ sơ khách hàng</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}
