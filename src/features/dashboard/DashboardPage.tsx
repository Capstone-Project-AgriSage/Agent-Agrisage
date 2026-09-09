import { usePageHeader } from '../../context/PageHeaderContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'

export default function DashboardPage() {
  usePageHeader({
    title: 'Operations Dashboard',
  })

  return (
    <>
      {/* 1. TOP METRICS ROW (6 Key Operational Agronomic & Sales KPIs) */}
      <section aria-label="Key Operational Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {/* KPI 1: Đơn hàng hôm nay */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-3 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-outline">Đơn Hàng Hôm Nay</span>
            <span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]" data-icon="receipt_long">receipt_long</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold text-on-surface tabular-nums tracking-tight leading-none">48</span>
              <span className="text-xs text-on-surface-variant font-medium">đơn</span>
              <span className="text-[10px] text-[#15803D] font-semibold flex items-center ml-auto bg-[#DCFCE7] border border-[#86EFAC] px-1.5 py-0.5 rounded">
                <span className="material-symbols-outlined text-[10px] mr-0.5" data-icon="trending_up">trending_up</span>+12.5%
              </span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-outline-variant/50 text-[11px] text-on-surface-variant flex items-center justify-between">
              <span className="font-medium text-on-surface">36 đã giao</span>
              <span className="text-outline tabular-nums">12 đang xử lý</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Doanh thu hôm nay */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-3 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-outline">Doanh Thu Hôm Nay</span>
            <span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]" data-icon="payments">payments</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline">
              <span className="text-[22px] font-bold text-on-surface tabular-nums tracking-tight leading-none">184.65M</span>
              <span className="text-xs text-on-surface-variant ml-1 font-medium">₫</span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-outline-variant/50 text-[11px] text-on-surface-variant flex justify-between gap-1">
              <span>Tiền mặt: <strong className="text-[#15803D] font-semibold tabular-nums">142.5M</strong></span>
              <span>Gối nợ: <strong className="text-secondary font-semibold tabular-nums">42.15M</strong></span>
            </div>
          </div>
        </div>

        {/* KPI 3: Chờ xác nhận thu */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-3 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-outline">Chờ Xác Nhận Thu</span>
            <span className="w-7 h-7 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-secondary flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]" data-icon="qr_code_2">qr_code_2</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold text-on-surface tabular-nums tracking-tight leading-none">9</span>
              <span className="text-xs text-on-surface-variant font-medium">giao dịch</span>
              <span className="text-[10px] text-secondary font-semibold ml-auto bg-[#FEF3C7] border border-[#FDE68A] px-1.5 py-0.5 rounded">Chờ QR</span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-outline-variant/50 text-[11px] text-on-surface-variant flex justify-between items-center">
              <span>Giá trị: <strong className="text-on-surface font-semibold tabular-nums">28.4M ₫</strong></span>
              <span className="text-[10px] text-outline">Tự động</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Công nợ chưa thu */}
        <div className="bg-white rounded-lg border border-outline-variant/60 p-3 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-outline">Công Nợ Chưa Thu</span>
            <span className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-secondary flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]" data-icon="pending_actions">pending_actions</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline">
              <span className="text-[22px] font-bold text-secondary tabular-nums tracking-tight leading-none">412.8M</span>
              <span className="text-xs text-on-surface-variant ml-1 font-medium">₫</span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-outline-variant/50 text-[11px] text-on-surface-variant flex justify-between">
              <span>28 hộ nông dân</span>
              <span className="text-error font-medium">18 hộ đến hạn</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Cảnh báo tồn kho */}
        <div className="bg-white rounded-lg border border-error/30 p-3 flex flex-col justify-between shadow-2xs hover:border-error/60 transition-colors bg-error-container/10">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-error">Sắp Hết Hàng</span>
            <span className="w-7 h-7 rounded-lg bg-error-container flex items-center justify-center text-error flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]" data-icon="warning">warning</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold text-error tabular-nums tracking-tight leading-none">6</span>
              <span className="text-xs text-on-surface-variant font-medium">mặt hàng</span>
              <span className="text-[10px] text-error font-bold ml-auto bg-error-container border border-error/30 px-1.5 py-0.5 rounded">Khẩn</span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-error/20 text-[11px] text-on-surface-variant truncate">
              <span className="text-error font-semibold">Báo động:</span> NPK &amp; Beam 75WP
            </div>
          </div>
        </div>
      </section>

      {/* SECTION A: Recent Orders Enterprise Data Table */}
      <div className="bg-white rounded-lg border border-outline-variant/60 shadow-2xs overflow-hidden">
            <div className="px-3 py-2 bg-white border-b border-outline-variant/60 flex flex-col md:flex-row md:items-center justify-between gap-1.5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-title-md text-[14px] text-on-surface font-bold">Đơn Hàng Gần Đây</h2>
                  <span className="bg-surface-container text-primary font-semibold px-1.5 py-0.5 rounded text-[11px] tabular-nums">48 giao dịch hôm nay</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-low p-0.5 rounded-lg border border-outline-variant/60 text-xs">
                <button className="px-2 py-0.5 rounded bg-white text-primary font-semibold shadow-2xs border border-outline-variant/40 text-[11px]">Tất cả (48)</button>
                <button className="px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-[11px]">Chờ xuất (8)</button>
                <button className="px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-[11px]">Đang giao (12)</button>
                <button className="px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-[11px]">Chờ VietQR (5)</button>
                <button className="px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-[11px]">Hoàn tất (23)</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/60 border-b border-outline-variant/60 font-label-sm text-[11px] text-outline uppercase tracking-wider">
                    <th className="py-1.5 px-3">Mã Đơn</th>
                    <th className="py-1.5 px-3">Nông Dân &amp; Địa Bàn</th>
                    <th className="py-1.5 px-3">Mặt Hàng Nông Nghiệp</th>
                    <th className="py-1.5 px-3 text-right">Giá Trị</th>
                    <th className="py-1.5 px-3 text-center">Trạng Thái</th>
                    <th className="py-1.5 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-[12px]">
                  {/* Order Row 1 */}
                  <tr className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-2 px-3">
                      <span className="font-semibold text-primary tabular-nums block">#DH-2410-089</span>
                      <span className="text-[10px] text-outline">10:42 AM</span>
                    </td>
                    <td className="py-2 px-3 min-w-0">
                      <div className="font-semibold text-on-surface text-[13px]">Trần Văn Hai</div>
                      <div className="text-[11px] text-on-surface-variant flex items-center gap-1 whitespace-nowrap">
                        <span className="material-symbols-outlined text-[12px] text-outline" data-icon="location_on">location_on</span>
                        Thới Thạnh, Thốt Nốt (3.2 ha lúa)
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-on-surface text-[12px] whitespace-nowrap">25 bao NPK Cà Mau 16-16-8 + 10 chai Tilt Super</div>
                      <div className="text-[10px] text-primary flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[11px]" data-icon="smart_toy">smart_toy</span>
                        Theo toa AI #DX-891
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-on-surface tabular-nums text-[13px]">32.500.000 ₫</td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                        VietQR Đã Khớp
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end">
                        <RowActionsMenu
                          triggerLabel="Thao tác đơn #DH-2410-089"
                          actions={[
                            { label: 'Xem chi tiết', icon: 'visibility', tone: 'primary' },
                            { label: 'In phiếu xuất', icon: 'print' },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                  {/* Order Row 2 */}
                  <tr className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-2 px-3">
                      <span className="font-semibold text-primary tabular-nums block">#DH-2410-088</span>
                      <span className="text-[10px] text-outline">10:15 AM</span>
                    </td>
                    <td className="py-2 px-3 min-w-0">
                      <div className="font-semibold text-on-surface text-[13px]">Lê Thị Bảy</div>
                      <div className="text-[11px] text-on-surface-variant flex items-center gap-1 whitespace-nowrap">
                        <span className="material-symbols-outlined text-[12px] text-outline" data-icon="location_on">location_on</span>
                        Tân Hưng, Ô Môn (4.8 ha lúa)
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-on-surface text-[12px] whitespace-nowrap">50 bao Phân Urê Phú Mỹ hạt trong</div>
                      <div className="text-[10px] text-outline mt-0.5 whitespace-nowrap">Giao thẳng tại bến xuồng kênh Cây Dừa</div>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-on-surface tabular-nums text-[13px]">46.200.000 ₫</td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                        Gối nợ 60 ngày
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end">
                        <RowActionsMenu
                          triggerLabel="Thao tác đơn #DH-2410-088"
                          actions={[
                            { label: 'Xem chi tiết', icon: 'visibility', tone: 'primary' },
                            { label: 'In phiếu xuất', icon: 'print' },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                  {/* Order Row 3 */}
                  <tr className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-2 px-3">
                      <span className="font-semibold text-primary tabular-nums block">#DH-2410-087</span>
                      <span className="text-[10px] text-outline">09:50 AM</span>
                    </td>
                    <td className="py-2 px-3 min-w-0">
                      <div className="font-semibold text-on-surface text-[13px]">Nguyễn Hữu Trí</div>
                      <div className="text-[11px] text-on-surface-variant flex items-center gap-1 whitespace-nowrap">
                        <span className="material-symbols-outlined text-[12px] text-outline" data-icon="location_on">location_on</span>
                        Nhơn Ái, Phong Điền (1.5 ha sầu riêng)
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-on-surface text-[12px] whitespace-nowrap">20kg Lúa ST25 cấp xác nhận + 5 can Chess 50WG</div>
                      <div className="text-[10px] text-outline mt-0.5 whitespace-nowrap">Đã cấp bao bì chuyên dụng bảo hộ</div>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-on-surface tabular-nums text-[13px]">14.800.000 ₫</td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                        Tiền mặt tại trạm
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end">
                        <RowActionsMenu
                          triggerLabel="Thao tác đơn #DH-2410-087"
                          actions={[
                            { label: 'Xem chi tiết', icon: 'visibility', tone: 'primary' },
                            { label: 'In phiếu xuất', icon: 'print' },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-3 py-1.5 bg-white border-t border-outline-variant/60 flex items-center justify-between text-[11px] text-on-surface-variant">
              <span>Hiển thị <strong className="text-on-surface font-semibold">1 - 3</strong> trong số <strong className="text-on-surface font-semibold">48</strong> đơn hàng</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded border border-outline-variant hover:bg-surface-container disabled:opacity-40" disabled>
                  <span className="material-symbols-outlined text-sm" data-icon="chevron_left">chevron_left</span>
                </button>
                <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-semibold">1</span>
                <button className="px-2 py-0.5 rounded hover:bg-surface-container">2</button>
                <button className="px-2 py-0.5 rounded hover:bg-surface-container">3</button>
                <span className="text-outline">...</span>
                <button className="px-2 py-0.5 rounded hover:bg-surface-container">16</button>
                <button className="p-1 rounded border border-outline-variant hover:bg-surface-container">
                  <span className="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
    </>
  )
}
