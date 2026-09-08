import { useState } from 'react'
import { usePageHeader } from '../../context/PageHeaderContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import { debtCustomers as DEBT_CUSTOMERS } from '../../data/mockDebts'

export default function DebtsPage() {
  usePageHeader({
    title: 'Quản lý công nợ',
    badge: 'Sổ công nợ trạm Cần Thơ #04',
    subtitle: 'Theo dõi công nợ, hạn thanh toán và lịch sử thu nợ của đại lý',
  })

  const [selectedId, setSelectedId] = useState(DEBT_CUSTOMERS[0].id)
  const selected = DEBT_CUSTOMERS.find((c) => c.id === selectedId) ?? DEBT_CUSTOMERS[0]

  const STATUS_OPTIONS = ['Tất cả trạng thái công nợ', 'Bình thường', 'Sắp đến hạn', 'Đến hạn', 'Quá hạn', 'Đã thanh toán']
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(STATUS_OPTIONS[0])

  const filteredCustomers = DEBT_CUSTOMERS.filter((customer) => {
    const keyword = search.trim().toLowerCase()
    const matchesSearch =
      !keyword ||
      customer.name.toLowerCase().includes(keyword) ||
      customer.phone.toLowerCase().includes(keyword) ||
      customer.addressShort.toLowerCase().includes(keyword)
    const matchesStatus = statusFilter === STATUS_OPTIONS[0] || customer.statusBadge.label === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter(STATUS_OPTIONS[0])
  }

  return (
    <>
      {/* PAGE HEADER */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-space-md shrink-0">
        <div className="flex items-center gap-2 text-slate-500 font-label-sm text-label-sm">
          <a className="hover:text-slate-800" href="#">Bảng điều khiển</a>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-800 font-semibold">Quản lý công nợ</span>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 font-title-md text-title-md rounded-lg hover:bg-slate-50 transition-colors shadow-2xs" type="button">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span className="">Xuất báo cáo</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 font-title-md text-title-md rounded-lg hover:bg-slate-50 transition-colors shadow-2xs" type="button">
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span className="">In sổ nợ</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1E5E3A] hover:bg-[#17482D] text-white font-title-md text-title-md font-medium rounded-lg transition-colors shadow-sm" type="button">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="">Ghi nhận thu nợ</span>
          </button>
        </div>
      </section>

      {/* 5 THẺ KPI TÓM TẮT CÔNG NỢ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 shrink-0">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-label-md text-label-md font-medium">Tổng công nợ</span>
            <span className="material-symbols-outlined text-slate-400 text-[19px]">account_balance</span>
          </div>
          <div className="font-metric-num text-metric-num text-slate-900 tracking-tight font-bold my-1">
            412.800.000 <span className="text-sm font-normal text-slate-500">đ</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span className="">Tổng nợ 28 nông hộ</span>
            <span className="text-emerald-700 font-medium">+5.4% so vụ trước</span>
          </div>
        </div>
        <div className="bg-white border border-amber-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500"></div>
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="font-label-md text-label-md font-medium">Đến hạn hôm nay</span>
            <span className="material-symbols-outlined text-amber-600 text-[19px]">alarm</span>
          </div>
          <div className="font-metric-num text-metric-num text-amber-900 tracking-tight font-bold my-1">
            18.500.000 <span className="text-sm font-normal text-amber-700">đ</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium pt-1 border-t border-amber-100">
            03 khách hàng cần thu trong ngày
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-label-md text-label-md font-medium">Sắp đến hạn</span>
            <span className="material-symbols-outlined text-amber-500 text-[19px]">calendar_clock</span>
          </div>
          <div className="font-metric-num text-metric-num text-slate-900 tracking-tight font-bold my-1">
            64.200.000 <span className="text-sm font-normal text-slate-500">đ</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
            <span className="text-slate-500">07 khách hàng (7 ngày tới)</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">Cần lưu ý</span>
          </div>
        </div>
        <div className="bg-white border border-rose-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-600"></div>
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="font-label-md text-label-md font-medium text-rose-900">Quá hạn</span>
            <span className="material-symbols-outlined text-rose-600 text-[19px]">warning</span>
          </div>
          <div className="font-metric-num text-metric-num text-rose-700 tracking-tight font-bold my-1">
            42.850.000 <span className="text-sm font-normal text-rose-600">đ</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-rose-100">
            <span className="text-rose-700">04 khách hàng quá hạn &gt;15 ngày</span>
            <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">Cảnh báo</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-label-md text-label-md font-medium">Đã thu tháng này</span>
            <span className="material-symbols-outlined text-emerald-600 text-[19px]">task_alt</span>
          </div>
          <div className="font-metric-num text-metric-num text-emerald-800 tracking-tight font-bold my-1">
            128.600.000 <span className="text-sm font-normal text-slate-500">đ</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span className="">Đạt 75.6% kế hoạch</span>
            <span className="inline-flex items-center text-emerald-600 font-medium gap-0.5">
              <span className="material-symbols-outlined text-[13px]">trending_up</span> Tiến độ tốt
            </span>
          </div>
        </div>
      </section>

      {/* BỘ LỌC CHUYÊN DỤNG */}
      <section className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[320px]">
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-[18px]">search</span>
            <input
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md font-body-sm text-body-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-container focus:bg-white"
              placeholder="Tìm khách hàng / số điện thoại / ấp..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="py-1.5 px-3 bg-white border border-slate-300 rounded-md font-body-sm text-body-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-container cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select className="py-1.5 px-3 bg-white border border-slate-300 rounded-md font-body-sm text-body-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-container cursor-pointer" defaultValue="Tất cả thời hạn (Trong 7 ngày, 15 ngày, >30 ngày)">
            <option>Tất cả thời hạn (Trong 7 ngày, 15 ngày, &gt;30 ngày)</option>
            <option>Trong 7 ngày tới</option>
            <option>Trong 15 ngày tới</option>
            <option>Quá hạn &gt; 30 ngày</option>
          </select>
          <select className="py-1.5 px-3 bg-white border border-slate-300 rounded-md font-body-sm text-body-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-container cursor-pointer" defaultValue="Tất cả khu vực (Thới Lai, Ô Môn, Phong Điền, Cờ Đỏ, Thốt Nốt)">
            <option>Tất cả khu vực (Thới Lai, Ô Môn, Phong Điền, Cờ Đỏ, Thốt Nốt)</option>
            <option>Huyện Thới Lai</option>
            <option>Quận Ô Môn</option>
            <option>Huyện Phong Điền</option>
            <option>Huyện Cờ Đỏ</option>
            <option>Quận Thốt Nốt</option>
          </select>
        </div>
        <button
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md font-label-md text-label-md transition-colors"
          type="button"
          onClick={handleClearFilters}
        >
          <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
          <span className="">Xóa bộ lọc</span>
        </button>
      </section>

      {/* BỐ CỤC CHÍNH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
        {/* A. BẢNG QUẢN LÝ CÔNG NỢ */}
        <div className="lg:col-span-7 xl:col-span-8 h-full flex flex-col gap-3">
          <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-[18px]">group</span>
                <h2 className="font-title-md text-title-md text-slate-900 font-semibold">Danh sách công nợ khách hàng</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">{filteredCustomers.length} nông hộ</span>
              </div>
              <div className="text-xs text-slate-500">Đơn vị tính: Việt Nam Đồng (VND)</div>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Khách hàng &amp; SĐT &amp; Địa chỉ</th>
                    <th className="py-2.5 px-3 text-right">Tổng mua</th>
                    <th className="py-2.5 px-3 text-right">Đã thanh toán</th>
                    <th className="py-2.5 px-3 text-right font-bold text-slate-800">Còn phải thu</th>
                    <th className="py-2.5 px-3 text-center">Hạn gần nhất</th>
                    <th className="py-2.5 px-2 text-center">Quá hạn</th>
                    <th className="py-2.5 px-3 text-center">Trạng thái</th>
                    <th className="py-2.5 px-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-body-sm text-[13px]">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        Không tìm thấy khách hàng phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : null}
                  {filteredCustomers.map((customer) => {
                    const isSelected = customer.id === selectedId
                    return (
                      <tr
                        key={customer.id}
                        onClick={() => setSelectedId(customer.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/70 border-l-4 border-l-[#1E5E3A] hover:bg-emerald-50'
                            : `hover:bg-slate-50 ${customer.rowAttentionClassName ?? ''}`
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span className="">{customer.name}</span>
                            {customer.cropBadge ? (
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-[#1E5E3A] text-[10px] rounded font-bold">
                                {customer.cropBadge}
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">{customer.phone}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[170px]">{customer.addressShort}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">{customer.totalPurchase}</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-700 font-medium">{customer.paidAmount}</td>
                        <td className={`py-3 px-3 text-right font-mono font-bold ${customer.remainingCellClassName}`}>
                          {customer.remaining}
                        </td>
                        <td className={`py-3 px-3 text-center font-mono ${customer.dueDateClassName}`}>{customer.dueDate}</td>
                        <td className={`py-3 px-2 text-center ${customer.overdueDaysClassName}`}>{customer.overdueDays}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${customer.statusBadge.className}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${customer.statusBadge.dotClassName}`}></span>
                            {customer.statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center">
                            <RowActionsMenu triggerLabel={`Thao tác công nợ ${customer.name}`} actions={customer.actions} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-2">
                <span className="">Hiển thị</span>
                <select className="py-1 px-2 bg-white border border-slate-300 rounded text-xs focus:outline-none">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
                <span className="">dòng / trang. Hiển thị 1 - 5 trong số 28 khách hàng</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-500 hover:bg-slate-100 disabled:opacity-50" disabled>Trước</button>
                <button className="px-2.5 py-1 rounded bg-[#1E5E3A] text-white font-bold">1</button>
                <button className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100">2</button>
                <button className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100">3</button>
                <button className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100">Trang sau</button>
              </div>
            </div>
          </div>
        </div>

        {/* B. BẢNG CHI TIẾT CÔNG NỢ BÊN PHẢI */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1E5E3A] text-[20px]">person_pin</span>
                <div>
                  <h3 className="font-title-md text-title-md text-slate-900 font-bold">Chi tiết công nợ khách hàng</h3>
                  <div className="text-xs text-slate-500">Mã KH: {selected.customerCode}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#1E5E3A] font-bold text-[11px]">Đang chọn</span>
            </div>
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-headline-sm text-headline-sm text-slate-900 font-bold">{selected.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">call</span>
                    <span className="font-mono font-semibold">{selected.phone}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium inline-block">{selected.landNote}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                <span className="material-symbols-outlined text-[15px] text-slate-400">pin_drop</span>
                <span className="">{selected.fullAddress}</span>
              </div>
            </div>
            <div className={`p-3.5 border-b ${selected.remainingSectionClassName}`}>
              <div className="flex items-center justify-between">
                <span className={`font-label-sm text-label-sm font-bold tracking-wider uppercase ${selected.remainingStatusClassName}`}>CÒN PHẢI THU</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${selected.remainingStatusClassName}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${selected.statusBadge.dotClassName}`}></span>
                  {selected.statusBadge.label}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 my-1">
                {selected.remainingAmount} <span className="text-sm font-normal text-slate-600">VND</span>
              </div>
              <div className="w-full bg-white/60 h-2 rounded-full overflow-hidden my-2">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: selected.progressBarWidth }}></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="">Tổng nợ: <strong className="font-mono">{selected.totalDebtLabel}</strong></span>
                <span className="">Đã trả: <strong className="font-mono text-emerald-800">{selected.paidLabel}</strong></span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="font-medium">Hạn thanh toán gần nhất:</span>
                <span className="font-bold font-mono">{selected.dueDetailNote}</span>
              </div>
            </div>
            <div className="p-3.5 border-b border-slate-100 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-title-md text-title-md text-slate-900 font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px] text-slate-500">receipt</span>
                  <span className="">Đơn hàng liên quan ({selected.relatedOrders.length} đơn)</span>
                </h4>
                <span className="text-[11px] text-slate-500">Niên vụ 2024</span>
              </div>
              <div className="space-y-2">
                {selected.relatedOrders.map((order) => (
                  <div key={order.id} className={`p-2.5 rounded-md border text-xs flex flex-col gap-1 ${order.cardClassName}`}>
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-900 font-mono">{order.id}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${order.statusClassName}`}>{order.status}</span>
                    </div>
                    {order.dateNote || order.dueNote ? (
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="">{order.dateNote}</span>
                        <span className="">{order.dueNote}</span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between pt-1 border-t border-black/5">
                      <span className="text-slate-600">{order.totalNote}</span>
                      <span className={`font-bold font-mono ${order.remainingClassName}`}>{order.remainingLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3.5 border-b border-slate-100 flex flex-col gap-2">
              <h4 className="font-title-md text-title-md text-slate-900 font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-slate-500">history</span>
                <span className="">Lịch sử thu nợ &amp; thanh toán</span>
              </h4>
              <div className="space-y-2 text-xs">
                {selected.paymentHistory.map((entry, idx) => (
                  <div key={`${entry.title}-${idx}`} className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${entry.dotClassName}`}></span>
                      <div>
                        <div className="font-medium text-slate-800">{entry.title}</div>
                        <div className="text-[11px] text-slate-500">{entry.dateNote}</div>
                      </div>
                    </div>
                    <span className={`font-mono font-bold ${entry.amountClassName}`}>{entry.amountLabel}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 flex flex-col gap-2">
              <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#1E5E3A] hover:bg-[#17482D] text-white font-title-md text-title-md font-medium rounded-md shadow-sm transition-colors" type="button">
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="">Ghi nhận thu nợ</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white border border-slate-300 text-slate-700 font-label-md text-label-md rounded-md hover:bg-slate-100 transition-colors" type="button">
                  <span className="material-symbols-outlined text-[16px] text-slate-500">sms</span>
                  <span className="">Gửi VietQR/SMS</span>
                </button>
                <button className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white border border-slate-300 text-slate-700 font-label-md text-label-md rounded-md hover:bg-slate-100 transition-colors" type="button">
                  <span className="material-symbols-outlined text-[16px] text-slate-500">description</span>
                  <span className="">Xem đơn hàng gốc</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KHU VỰC PHỤ PHÍA DƯỚI BẢNG */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg shrink-0 pb-6">
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-[20px]">warning</span>
              <h3 className="font-title-md text-title-md text-slate-900 font-bold">Công nợ quá hạn cần xử lý</h3>
              <span className="px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">3 ca ưu tiên</span>
            </div>
            <a className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5" href="#">
              Xem tất cả quá hạn <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </a>
          </div>
          <div className="space-y-2.5">
            <div className="p-3 bg-rose-50/40 border border-rose-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-sm">Phan Văn Thắng</span>
                  <span className="text-xs font-mono text-slate-500">0903.112.890</span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 font-bold text-[10px]">Quá hạn 12 ngày</span>
                </div>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                  <span className="">Nợ: <strong className="font-mono text-rose-700">14.500.000 đ</strong></span>
                  <span className="">Đơn cũ nhất: <span className="font-mono text-slate-700 font-medium">DH-2024-1079</span></span>
                  <span className="text-slate-500">Nhắc nợ: Đã gửi SMS Zalo 2 ngày trước</span>
                </div>
              </div>
              <button className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-label-md text-label-md rounded-md transition-colors shadow-2xs self-start sm:self-auto" type="button">
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span className="">Gửi nhắc nợ</span>
              </button>
            </div>
            <div className="p-3 bg-rose-50/40 border border-rose-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-sm">Võ Thị Hạnh</span>
                  <span className="text-xs font-mono text-slate-500">0912.345.678</span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 font-bold text-[10px]">Quá hạn 25 ngày</span>
                </div>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                  <span className="">Nợ: <strong className="font-mono text-rose-700">7.300.000 đ</strong></span>
                  <span className="">Đơn cũ nhất: <span className="font-mono text-slate-700 font-medium">DH-2024-0988</span></span>
                  <span className="text-amber-700 font-medium">Nhắc nợ: Chưa gửi lần 2</span>
                </div>
              </div>
              <button className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-label-md text-label-md rounded-md transition-colors shadow-2xs self-start sm:self-auto" type="button">
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span className="">Gửi nhắc nợ</span>
              </button>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-sm">Nguyễn Văn Đực</span>
                  <span className="text-xs font-mono text-slate-500">0988.334.221</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">Quá hạn 18 ngày</span>
                </div>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                  <span className="">Nợ: <strong className="font-mono text-slate-900">11.200.000 đ</strong></span>
                  <span className="">Đơn cũ nhất: <span className="font-mono text-slate-700 font-medium">DH-2024-1012</span></span>
                  <span className="text-slate-600">Nhắc nợ: Hẹn sau thu hoạch</span>
                </div>
              </div>
              <button className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-label-md text-label-md rounded-md transition-colors shadow-2xs self-start sm:self-auto" type="button">
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span className="">Gửi nhắc nợ</span>
              </button>
            </div>
          </div>
        </div>
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700 text-[20px]">history_edu</span>
              <h3 className="font-title-md text-title-md text-slate-900 font-bold">Nhật ký thu nợ gần đây</h3>
            </div>
            <span className="text-xs text-slate-400">Trạm Cần Thơ #04</span>
          </div>
          <div className="space-y-3">
            <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[17px]">qr_code_2</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-xs">Trần Văn Hải • <span className="text-slate-600 font-normal">Đã thu VietQR</span></div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="">Đại lý Nguyễn Văn Minh</span>
                    <span className="">•</span>
                    <span className="">08:45 Hôm nay</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-emerald-700 text-sm">+5.000.000 đ</span>
                <div className="text-[10px] text-emerald-600 font-medium">Khớp sổ tự động</div>
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[17px]">attach_money</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-xs">Lê Thị Bảy • <span className="text-slate-600 font-normal">Thu tiền mặt tất toán</span></div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="">Thủ quỹ Hồng</span>
                    <span className="">•</span>
                    <span className="">16:30 Hôm qua</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900 text-sm">+4.800.000 đ</span>
                <div className="text-[10px] text-slate-500">Đã in biên lai</div>
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[17px]">account_balance</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-xs">Nguyễn Hữu Trí • <span className="text-slate-600 font-normal">Thu chuyển khoản</span></div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="">Đại lý Nguyễn Văn Minh</span>
                    <span className="">•</span>
                    <span className="">09:15 03/10</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-emerald-700 text-sm">+2.160.000 đ</span>
                <div className="text-[10px] text-emerald-600 font-medium">Đã cập nhật đơn</div>
              </div>
            </div>
          </div>
          <div className="mt-1 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="">Dữ liệu kế toán đồng bộ tức thời với VietQR Mekong Hub</span>
            <span className="font-mono">Sync: 14:02:18</span>
          </div>
        </div>
      </section>
    </>
  )
}
