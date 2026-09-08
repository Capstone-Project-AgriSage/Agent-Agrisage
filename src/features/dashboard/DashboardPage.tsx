import { usePageHeader } from '../../context/PageHeaderContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'

export default function DashboardPage() {
  usePageHeader({
    title: 'Operations Dashboard',
    badge: 'Vụ Thu Đông 2024 (Lúa ST25 & Sầu riêng)',
    subtitle: 'Thứ Tư, 24 Tháng 10, 2024 • Trạm Cần Thơ hoạt động ổn định',
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

      {/* 2. TWO-COLUMN OPERATIONAL SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
        {/* LEFT COLUMN (XL: 8 Cols): Recent Orders & AI Prescriptions Triage */}
        <div className="xl:col-span-8 space-y-3">
          {/* SECTION A: Recent Orders Enterprise Data Table */}
          <div className="bg-white rounded-lg border border-outline-variant/60 shadow-2xs overflow-hidden">
            <div className="px-3 py-2 bg-white border-b border-outline-variant/60 flex flex-col md:flex-row md:items-center justify-between gap-1.5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-title-md text-[14px] text-on-surface font-bold">Đơn Hàng Gần Đây</h2>
                  <span className="bg-surface-container text-primary font-semibold px-1.5 py-0.5 rounded text-[11px] tabular-nums">48 giao dịch hôm nay</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Theo dõi bốc xếp kho, lộ trình vận chuyển và trạng thái đối soát VietQR tự động</p>
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
                    <th className="py-1.5 px-3">Giao Vận</th>
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
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-on-surface font-medium">
                        <span className="material-symbols-outlined text-[14px] text-primary" data-icon="local_shipping">local_shipping</span>
                        Đang chở xe lôi
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
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#15803D] font-medium">
                        <span className="material-symbols-outlined text-[14px]" data-icon="check_circle">check_circle</span>
                        Đã giao tại ruộng
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
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-outline font-medium">
                        <span className="material-symbols-outlined text-[14px]" data-icon="hourglass_top">hourglass_top</span>
                        Chờ bốc xếp kho
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
            <div className="px-3 py-1.5 bg-white border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant">
              <span className="text-[11px]">Hiển thị 3 trong tổng số 48 đơn phát sinh hôm nay</span>
              <a className="text-primary font-semibold hover:underline flex items-center gap-1 transition-colors text-[11px]" href="#">
                Xem toàn bộ số đơn hàng
                <span className="material-symbols-outlined text-[13px]" data-icon="arrow_forward">arrow_forward</span>
              </a>
            </div>
          </div>

          {/* SECTION B: AI Agronomy Prescriptions Waiting Agent Approval */}
          <div className="bg-white rounded-lg border border-outline-variant/60 shadow-2xs overflow-hidden">
            <div className="px-3 py-2 bg-surface-container-low/40 border-b border-outline-variant/60 flex flex-wrap items-center justify-between gap-1.5">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]" data-icon="biotech">biotech</span>
                  <h2 className="font-title-md text-[13px] text-on-surface font-bold whitespace-nowrap">Gợi Ý Sản Phẩm AI Chờ Phê Duyệt</h2>
                  <span className="px-1.5 py-0.5 bg-error-container text-on-error-container border border-error/30 text-[10px] font-bold rounded whitespace-nowrap shrink-0">5 ca cấp bách</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Quy trình chuẩn: Đại lý kiểm tra gợi ý sản phẩm thương mại trước khi xuất kho BVTV</p>
              </div>
              <span className="text-[11px] text-outline flex items-center gap-1 font-medium whitespace-nowrap shrink-0">
                <span className="material-symbols-outlined text-[13px] text-primary" data-icon="verified_user">verified_user</span>
                AgriSage Vision AI v4.8
              </span>
            </div>
            <div className="p-2.5 space-y-2">
              {/* Case 1 (Expanded Priority Card) */}
              <div className="border border-outline-variant/60 rounded-lg p-2.5 bg-surface-container-low/30 hover:border-primary/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center font-bold flex-shrink-0">
                      <span className="material-symbols-outlined text-[16px]" data-icon="grain">grain</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-on-surface text-[13px]">Lâm Văn Điền</span>
                        <span className="text-[11px] text-on-surface-variant">(Lúa ST25 - 3.5 ha • Thới Lai)</span>
                        <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                          AI: 94.2%
                        </span>
                      </div>
                      <p className="text-[11px] text-error font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]" data-icon="coronavirus">coronavirus</span>
                        Đạo Ôn Cổ Bông (Magnaporthe oryzae) - Trổ đều
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">
                    <button className="h-6 px-2 rounded border border-outline-variant/60 bg-white hover:bg-surface-container text-on-surface text-[11px] font-semibold transition-colors whitespace-nowrap">
                      Chỉnh Sửa Liều Lượng
                    </button>
                    <button className="h-6 px-2.5 rounded bg-primary-container hover:bg-primary text-on-primary text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors whitespace-nowrap">
                      <span className="material-symbols-outlined text-[13px]" data-icon="check_circle">check_circle</span>Phê duyệt gợi ý
                    </button>
                  </div>
                </div>
                <div className="mt-1.5 p-2 bg-white rounded border border-outline-variant/60 text-[11px] space-y-0.5">
                  <div className="font-medium text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-primary" data-icon="medication">medication</span>
                    Gợi ý sản phẩm thương mại: Phun Beam 75WP (Tricyclazole) + Tilt Super 300EC (30g Beam + 20ml Tilt / bình 25L)
                  </div>
                  <div className="text-on-surface-variant flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
                    <span>Quy mô: <strong>14 bình / 3.5 ha</strong></span>
                    <span>Cách ly (PHI): <strong>14 ngày</strong></span>
                    <span className="text-[#15803D] font-semibold">Kho có sẵn đủ cơ số thuốc</span>
                  </div>
                </div>
              </div>

              {/* Case 2 (Compact Secondary Strip) */}
              <div className="border border-outline-variant/60 rounded-lg p-2 bg-surface-container-low/30 hover:border-primary/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center font-bold flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px]" data-icon="potted_plant">potted_plant</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-on-surface text-[12px]">Võ Thị Hạnh</span>
                      <span className="text-[11px] text-on-surface-variant">(Sầu riêng Ri6 • Phong Điền)</span>
                      <span className="text-[11px] text-secondary font-medium">• Nấm Phytophthora thối rễ xì mủ</span>
                    </div>
                    <p className="text-[10px] text-error truncate">Kho Cần Thơ chỉ còn 4 gói Aliette 800WG (Cần điều chuyển kho Ô Môn)</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button className="h-6 px-2 rounded border border-outline-variant/60 bg-white hover:bg-surface-container text-on-surface text-[11px] font-semibold transition-colors">
                    Xem Thêm Ca Này
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (XL: 4 Cols): Inventory Alerts, Debt Watch, Feed */}
        <div className="xl:col-span-4 space-y-3">
          {/* SECTION C: Low Stock Inventory Triage */}
          <div className="bg-white rounded-lg border border-outline-variant/60 shadow-2xs overflow-hidden">
            <div className="px-3 py-2 bg-surface-container-low/40 border-b border-outline-variant/60 flex items-center justify-between">
              <div>
                <h3 className="font-title-md text-[13px] text-on-surface font-bold">Cảnh Báo Vận Hành &amp; Tồn Kho</h3>
                <p className="text-[11px] text-outline">Dưới ngưỡng an toàn phục vụ mùa vụ</p>
              </div>
              <span className="material-symbols-outlined text-error text-[16px]" data-icon="inventory_2">inventory_2</span>
            </div>
            <div className="p-2.5 space-y-1.5">
              {/* Item 1: NPK Dau Trau */}
              <div className="p-1.5 rounded border border-outline-variant/60 bg-surface-container-low/40">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-[12px] text-on-surface">Phân NPK Đầu Trâu 20-20-15</h4>
                    <p className="text-[10px] text-on-surface-variant">Bao 50kg • Dùng thúc đón đòng ST25</p>
                  </div>
                  <button className="px-1.5 py-0.5 bg-white hover:bg-surface-container text-primary border border-outline-variant/60 rounded text-[10px] font-semibold flex-shrink-0">Tạo đơn nhập</button>
                </div>
                <div className="mt-1">
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-error font-semibold tabular-nums">Còn: 18 bao</span>
                    <span className="text-outline tabular-nums">Ngưỡng: 80 bao</span>
                  </div>
                  <div className="w-full bg-outline-variant/50 h-1 rounded-full overflow-hidden">
                    <div className="bg-error h-full rounded-full" style={{ width: '22.5%' }}></div>
                  </div>
                </div>
              </div>
              {/* Item 2: Beam 75WP (Urgent) */}
              <div className="p-1.5 rounded border border-error/40 bg-[#FEE2E2]/30">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="font-semibold text-[12px] text-on-surface">Thuốc Trừ Bệnh Beam 75WP</h4>
                      <span className="bg-error text-white text-[8px] font-bold px-1 rounded">KHẨN</span>
                    </div>
                    <p className="text-[10px] text-error font-medium">Gói 100g • Dịch đạo ôn bùng phát Ô Môn</p>
                  </div>
                  <button className="px-1.5 py-0.5 bg-error text-white hover:bg-[#B91C1C] rounded text-[10px] font-semibold flex-shrink-0">
                    Nhập Khẩn
                  </button>
                </div>
                <div className="mt-1">
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-error font-bold tabular-nums">Còn: 12 gói</span>
                    <span className="text-outline tabular-nums">Ngưỡng: 150 gói</span>
                  </div>
                  <div className="w-full bg-outline-variant/50 h-1 rounded-full overflow-hidden">
                    <div className="bg-error h-full rounded-full" style={{ width: '8%' }}></div>
                  </div>
                </div>
              </div>
              {/* Item 3: ST25 Rice Seed */}
              <div className="p-1.5 rounded border border-outline-variant/60 bg-surface-container-low/40">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-[12px] text-on-surface">Lúa Giống ST25 Cấp Xác Nhận</h4>
                    <p className="text-[10px] text-on-surface-variant">Bao 20kg • Viện Lúa ĐBSCL</p>
                  </div>
                  <button className="px-1.5 py-0.5 bg-white hover:bg-surface-container text-primary border border-outline-variant/60 rounded text-[10px] font-semibold flex-shrink-0">Tạo đơn nhập</button>
                </div>
                <div className="mt-1">
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-secondary font-semibold tabular-nums">Còn: 5 bao</span>
                    <span className="text-outline tabular-nums">Ngưỡng: 50 bao</span>
                  </div>
                  <div className="w-full bg-outline-variant/50 h-1 rounded-full overflow-hidden">
                    <div className="bg-secondary-container h-full rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION D: Farmer Credit Watchlist */}
          <div className="bg-white rounded-lg border border-outline-variant/60 shadow-2xs overflow-hidden">
            <div className="px-3 py-2 bg-surface-container-low/40 border-b border-outline-variant/60 flex items-center justify-between">
              <div>
                <h3 className="font-title-md text-[13px] text-on-surface font-bold">Theo Dõi Công Nợ Đến Hạn</h3>
                <p className="text-[11px] text-outline">Gối đầu phân thuốc thu hoạch trả</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-[16px]" data-icon="account_balance_wallet">account_balance_wallet</span>
            </div>
            <div className="p-2.5 divide-y divide-outline-variant/50">
              {/* Debtor 1 */}
              <div className="pb-1.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[12px] text-on-surface">Bùi Tấn Lực</div>
                  <div className="text-[10px] text-on-surface-variant">Nếp Thơm (2.8 ha) • <span className="text-secondary font-medium">Hạn: 5 ngày nữa</span></div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-on-surface tabular-nums text-[12px]">38.500.000 ₫</div>
                  <button className="mt-0.5 px-1.5 py-0.5 bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim rounded text-[9px] font-bold inline-flex items-center gap-0.5 hover:bg-primary-fixed-dim transition-colors">
                    <span className="material-symbols-outlined text-[10px]" data-icon="sms">sms</span>
                    Nhắc VietQR
                  </button>
                </div>
              </div>
              {/* Debtor 2 */}
              <div className="py-1.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[12px] text-on-surface">Đặng Hoàng Nam</div>
                  <div className="text-[10px] text-on-surface-variant">Lúa DS1 (4.0 ha) • <span className="text-outline">Hạn: 12 ngày nữa</span></div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-on-surface tabular-nums text-[12px]">52.000.000 ₫</div>
                  <button className="mt-0.5 px-1.5 py-0.5 bg-surface-container-low text-on-surface border border-outline-variant/60 rounded text-[9px] font-semibold hover:bg-surface-container transition-colors">
                    Xem Sổ Nợ
                  </button>
                </div>
              </div>
              {/* Debtor 3 (Overdue) */}
              <div className="pt-1.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-[12px] text-on-surface">Huỳnh Văn Khởi</span>
                    <span className="bg-error-container text-on-error-container border border-error/20 text-[8px] font-bold px-1 rounded">TRỄ HẠN</span>
                  </div>
                  <div className="text-[10px] text-error font-medium">Quá hạn: 4 ngày (Thốt Nốt)</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-error tabular-nums text-[12px]">24.200.000 ₫</div>
                  <span className="text-[9px] text-outline block">Đã báo HTX</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION E: Real-time Audit Activity Feed */}
          <div className="bg-white rounded-lg border border-outline-variant/60 shadow-2xs overflow-hidden">
            <div className="px-3 py-2 bg-surface-container-low/40 border-b border-outline-variant/60 flex items-center justify-between">
              <div>
                <h3 className="font-title-md text-[13px] text-on-surface font-bold">Nhật Ký Hoạt Động Gần Đây</h3>
                <p className="text-[11px] text-outline">Ghi nhận giao dịch &amp; thao tác trạm</p>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            </div>
            <div className="p-2.5 space-y-1.5 text-xs">
              <div className="flex gap-1.5">
                <span className="material-symbols-outlined text-primary text-[15px] flex-shrink-0 mt-0.5" data-icon="task_alt">task_alt</span>
                <div>
                  <p className="text-on-surface font-medium leading-tight text-[11px]">Đại lý Minh duyệt gợi ý sản phẩm <span className="text-primary font-bold">#DX-902</span> sầu riêng Ô Môn</p>
                  <span className="text-[9px] text-outline">2 phút trước • Trạm Cần Thơ</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[15px] flex-shrink-0 mt-0.5" data-icon="account_balance">account_balance</span>
                <div>
                  <p className="text-on-surface font-medium leading-tight text-[11px]">VietQR nhận <span className="font-bold text-on-surface tabular-nums">18.500.000 ₫</span> từ Lê Văn Tám</p>
                  <span className="text-[9px] text-outline">7 phút trước • VNPAY Gateway</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <span className="material-symbols-outlined text-outline text-[15px] flex-shrink-0 mt-0.5" data-icon="output">output</span>
                <div>
                  <p className="text-on-surface font-medium leading-tight text-[11px]">Kho xuất 40 bao Urê cho đơn <span className="font-bold">#DH-2410-087</span></p>
                  <span className="text-[9px] text-outline">18 phút trước • Thủ kho Hùng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
