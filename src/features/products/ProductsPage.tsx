import { usePageHeader } from '../../context/PageHeaderContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'

export default function ProductsPage() {
  usePageHeader({
    title: 'Quản lý sản phẩm',
    subtitle: 'Quản lý danh mục sản phẩm, theo dõi tồn kho và tình trạng kinh doanh tại kho Cần Thơ #04',
  })

  return (
    <>
      {/* 1. BREADCRUMBS & PAGE HEADER */}
      <section className="space-y-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-body-sm text-outline">
          <a className="hover:text-primary transition-colors" href="#">Bảng điều khiển</a>
          <span className="material-symbols-outlined text-xs" data-icon="chevron_right">chevron_right</span>
          <span className="text-on-surface font-medium">Quản lý sản phẩm</span>
        </nav>
        <div className="flex justify-end pt-1">
          <div className="flex items-center gap-space-sm self-start md:self-auto">
            <button className="flex items-center gap-2 h-9 px-space-md bg-surface-container-lowest hover:bg-surface border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md transition-all shadow-sm">
              <span className="material-symbols-outlined text-lg text-outline" data-icon="download">download</span>
              <span>Xuất Excel</span>
            </button>
            <button className="flex items-center gap-2 h-9 px-space-lg bg-[#1E5E3A] hover:bg-[#17482D] text-on-primary rounded-lg font-label-md text-label-md transition-all shadow-sm">
              <span className="material-symbols-outlined text-lg" data-icon="add">add</span><span>Thêm sản phẩm</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. COMPACT SUMMARY METRIC CARDS (4 Cards Grid) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1: Tổng sản phẩm */}
        <div className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Tổng sản phẩm</span>
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-on-surface tabular-nums">184</span>
              <span className="font-body-sm text-body-sm text-outline">mặt hàng</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">14 danh mục đang hoạt động</p>
          </div>
          <div className="p-2.5 bg-surface-container rounded-lg text-primary">
            <span className="material-symbols-outlined text-2xl" data-icon="inventory_2">inventory_2</span>
          </div>
        </div>
        {/* Card 2: Đang kinh doanh */}
        <div className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Đang kinh doanh</span>
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-[#15803D] tabular-nums">168</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                91.3%
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Đảm bảo dòng tiền bán lẻ</p>
          </div>
          <div className="p-2.5 bg-[#DCFCE7] rounded-lg text-[#15803D]">
            <span className="material-symbols-outlined text-2xl fill" data-icon="check_circle" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
        </div>
        {/* Card 3: Sắp hết hàng */}
        <div className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Sắp hết hàng</span>
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-[#B45309] tabular-nums">12</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                Cần nhập
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-[#B45309]">Ngưỡng cảnh báo &lt; 20 bao/chai</p>
          </div>
          <div className="p-2.5 bg-[#FEF3C7] rounded-lg text-[#B45309]">
            <span className="material-symbols-outlined text-2xl fill" data-icon="warning" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
        </div>
        {/* Card 4: Ngừng kinh doanh / Hết hàng */}
        <div className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Ngừng KD / Hết hàng</span>
            <div className="flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-[#B91C1C] tabular-nums">4</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5]">
                Tồn: 0
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-outline">Tồn kho 0 hoặc ngưng nhập</p>
          </div>
          <div className="p-2.5 bg-[#FEE2E2] rounded-lg text-[#B91C1C]">
            <span className="material-symbols-outlined text-2xl" data-icon="block">block</span>
          </div>
        </div>
      </section>

      {/* 3. DATA FILTERS TOOLBAR */}
      <section className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant shadow-sm flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex flex-wrap items-center gap-space-sm flex-1">
          <div className="relative min-w-[210px]">
            <select className="w-full h-9 pl-3 pr-8 bg-surface rounded-lg border border-outline-variant text-on-surface font-label-md text-label-md focus:ring-1 focus:ring-primary focus:border-primary">
              <option>Tất cả danh mục</option>
              <option>Phân bón vô cơ &amp; hữu cơ</option>
              <option>Thuốc BVTV &amp; Trừ bệnh</option>
              <option>Giống cây trồng</option>
              <option>Dụng cụ nông nghiệp</option>
            </select>
          </div>
          <div className="relative min-w-[170px]">
            <select className="w-full h-9 pl-3 pr-8 bg-surface rounded-lg border border-outline-variant text-on-surface font-label-md text-label-md focus:ring-1 focus:ring-primary focus:border-primary">
              <option>Tất cả trạng thái kho</option>
              <option>Còn hàng (An toàn)</option>
              <option>Sắp hết (&lt;20)</option>
              <option>Hết hàng (0 tồn)</option>
            </select>
          </div>
          <div className="relative min-w-[170px]">
            <select className="w-full h-9 pl-3 pr-8 bg-surface rounded-lg border border-outline-variant text-on-surface font-label-md text-label-md focus:ring-1 focus:ring-primary focus:border-primary">
              <option>Tất cả trạng thái KD</option>
              <option>Đang kinh doanh</option>
              <option>Tạm ngừng kinh doanh</option>
            </select>
          </div>
          <button className="h-9 px-space-sm text-outline hover:text-on-surface font-body-sm text-body-sm flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-base" data-icon="filter_alt_off">filter_alt_off</span>
            <span>Đặt lại bộ lọc</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-body-sm text-outline hidden xl:inline">Đã chọn: <strong className="text-on-surface font-semibold">0</strong> sản phẩm</span>
          <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden bg-surface">
            <button className="px-3 py-1.5 text-body-sm text-outline hover:text-on-surface hover:bg-surface-container flex items-center gap-1 border-r border-outline-variant disabled:opacity-50" title="Cập nhật giá hàng loạt">
              <span className="material-symbols-outlined text-base" data-icon="price_change">price_change</span>
              <span className="font-label-md text-label-md hidden sm:inline">Cập nhật giá</span>
            </button>
            <button className="px-3 py-1.5 text-body-sm text-outline hover:text-on-surface hover:bg-surface-container flex items-center gap-1 border-r border-outline-variant" title="In tem mã vạch QR">
              <span className="material-symbols-outlined text-base" data-icon="print">print</span>
              <span className="font-label-md text-label-md hidden sm:inline">In tem QR</span>
            </button>
            <button className="px-2.5 py-1.5 text-body-sm text-outline hover:text-on-surface hover:bg-surface-container" title="Tùy chọn khác">
              <span className="material-symbols-outlined text-base" data-icon="more_vert">more_vert</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. ENTERPRISE DATA TABLE CONTAINER */}
      <section className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-outline-variant text-[11px] font-semibold uppercase tracking-wider text-outline select-none">
                <th className="py-3 pl-4 pr-2 w-10 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer" type="checkbox" />
                </th>
                <th className="py-3 px-3 min-w-[280px]">Sản phẩm &amp; Hoạt chất</th>
                <th className="py-3 px-3 min-w-[120px]">SKU</th>
                <th className="py-3 px-3 min-w-[130px]">Danh mục</th>
                <th className="py-3 px-3 min-w-[100px]">Đơn vị tính</th>
                <th className="py-3 px-3 min-w-[120px] text-right">Giá bán niêm yết</th>
                <th className="py-3 px-3 min-w-[160px]">Tồn kho thực tế</th>
                <th className="py-3 px-3 min-w-[170px]">Trạng thái</th>
                <th className="py-3 pr-4 pl-3 w-28 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-md text-on-surface">
              {/* ROW 1: Phân NPK Đầu Trâu */}
              <tr className="hover:bg-surface/70 transition-colors group">
                <td className="py-3.5 pl-4 pr-2 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer" type="checkbox" />
                </td>
                <td className="py-3.5 px-3">
                  <div className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors">
                    Phân NPK Đầu Trâu 20-20-15+TE
                  </div>
                  <div className="text-body-sm text-outline mt-0.5">Quy cách đóng bao chính hãng Bình Điền</div>
                </td>
                <td className="py-3.5 px-3 font-mono text-body-sm text-outline tabular-nums">SKU-NPK-2015</td>
                <td className="py-3.5 px-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Phân bón
                  </span>
                </td>
                <td className="py-3.5 px-3 text-on-surface-variant text-body-sm">Bao 50kg</td>
                <td className="py-3.5 px-3 text-right font-semibold tabular-nums text-on-surface">685.000 ₫</td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center justify-between text-body-sm mb-1">
                    <span className="font-semibold text-[#B45309] tabular-nums">18 bao</span>
                    <span className="text-[11px] text-[#B45309] font-medium">Sắp hết</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                      Sắp hết
                    </span>
                    <span className="text-[11px] text-[#15803D] font-medium flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#15803D]"></span>
                      Đang kinh doanh
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4 pl-3 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Phân NPK Đầu Trâu 20-20-15+TE"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Chỉnh sửa', icon: 'edit' },
                        { label: 'Nhập thêm kho', icon: 'add_business' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 2: Thuốc Trừ Bệnh Beam 75WP */}
              <tr className="hover:bg-surface/70 transition-colors group">
                <td className="py-3.5 pl-4 pr-2 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer" type="checkbox" />
                </td>
                <td className="py-3.5 px-3">
                  <div className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors">
                    Thuốc Trừ Bệnh Beam 75WP
                  </div>
                  <div className="text-body-sm text-outline mt-0.5">Hoạt chất Tricyclazole - Trị đạo ôn cổ bông</div>
                </td>
                <td className="py-3.5 px-3 font-mono text-body-sm text-outline tabular-nums">SKU-BVTV-0084</td>
                <td className="py-3.5 px-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    Thuốc BVTV
                  </span>
                </td>
                <td className="py-3.5 px-3 text-on-surface-variant text-body-sm">Gói 100g</td>
                <td className="py-3.5 px-3 text-right font-semibold tabular-nums text-on-surface">42.000 ₫</td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center justify-between text-body-sm mb-1">
                    <span className="font-semibold text-[#B91C1C] tabular-nums">8 gói</span>
                    <span className="text-[11px] text-[#B91C1C] font-medium">Ngưỡng báo động</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                      Sắp hết
                    </span>
                    <span className="text-[11px] text-[#15803D] font-medium flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#15803D]"></span>
                      Đang kinh doanh
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4 pl-3 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Thuốc Trừ Bệnh Beam 75WP"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Chỉnh sửa', icon: 'edit' },
                        { label: 'Nhập thêm kho', icon: 'add_business' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 3: Lúa Giống Xác Nhận ST25 */}
              <tr className="hover:bg-surface/70 transition-colors group">
                <td className="py-3.5 pl-4 pr-2 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer" type="checkbox" />
                </td>
                <td className="py-3.5 px-3">
                  <div className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors">
                    Lúa Giống Xác Nhận ST25 (F1)
                  </div>
                  <div className="text-body-sm text-outline mt-0.5">Giống lúa chuẩn thuần Sóc Trăng - Độ nảy mầm 92%</div>
                </td>
                <td className="py-3.5 px-3 font-mono text-body-sm text-outline tabular-nums">SKU-GIONG-ST25</td>
                <td className="py-3.5 px-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                    Lúa giống
                  </span>
                </td>
                <td className="py-3.5 px-3 text-on-surface-variant text-body-sm">Bao 25kg</td>
                <td className="py-3.5 px-3 text-right font-semibold tabular-nums text-on-surface">720.000 ₫</td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center justify-between text-body-sm mb-1">
                    <span className="font-semibold text-on-surface tabular-nums">142 bao</span>
                    <span className="text-[11px] text-emerald-700 font-medium">Tồn tốt</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '71%' }}></div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                      Còn hàng
                    </span>
                    <span className="text-[11px] text-[#15803D] font-medium flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#15803D]"></span>
                      Đang kinh doanh
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4 pl-3 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Lúa Giống Xác Nhận ST25 (F1)"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Chỉnh sửa', icon: 'edit' },
                        { label: 'Nhập thêm kho', icon: 'add_business' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 4: Thuốc Trừ Cỏ Sofit 300EC */}
              <tr className="hover:bg-surface/70 transition-colors group">
                <td className="py-3.5 pl-4 pr-2 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer" type="checkbox" />
                </td>
                <td className="py-3.5 px-3">
                  <div className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors">
                    Thuốc Trừ Cỏ Sofit 300EC (Syngenta)
                  </div>
                  <div className="text-body-sm text-outline mt-0.5">Hoạt chất Pretilachlor + Fenclorim chống cháy lá mầm</div>
                </td>
                <td className="py-3.5 px-3 font-mono text-body-sm text-outline tabular-nums">SKU-BVTV-300E</td>
                <td className="py-3.5 px-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    Thuốc BVTV
                  </span>
                </td>
                <td className="py-3.5 px-3 text-on-surface-variant text-body-sm">Chai 500ml</td>
                <td className="py-3.5 px-3 text-right font-semibold tabular-nums text-on-surface">165.000 ₫</td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center justify-between text-body-sm mb-1">
                    <span className="font-semibold text-on-surface tabular-nums">95 chai</span>
                    <span className="text-[11px] text-emerald-700 font-medium">Đủ hàng</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                      Còn hàng
                    </span>
                    <span className="text-[11px] text-[#15803D] font-medium flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#15803D]"></span>
                      Đang kinh doanh
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4 pl-3 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Thuốc Trừ Cỏ Sofit 300EC (Syngenta)"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Chỉnh sửa', icon: 'edit' },
                        { label: 'Nhập thêm kho', icon: 'add_business' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 5: Phân Urê Hạt Đục Cà Mau */}
              <tr className="hover:bg-surface/70 transition-colors group">
                <td className="py-3.5 pl-4 pr-2 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer" type="checkbox" />
                </td>
                <td className="py-3.5 px-3">
                  <div className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors">
                    Phân Urê Hạt Đục Cà Mau
                  </div>
                  <div className="text-body-sm text-outline mt-0.5">Đạm 46.3% N tối thiểu, chống thất thoát phân tử khí</div>
                </td>
                <td className="py-3.5 px-3 font-mono text-body-sm text-outline tabular-nums">SKU-URE-CM01</td>
                <td className="py-3.5 px-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Phân bón
                  </span>
                </td>
                <td className="py-3.5 px-3 text-on-surface-variant text-body-sm">Bao 50kg</td>
                <td className="py-3.5 px-3 text-right font-semibold tabular-nums text-on-surface">540.000 ₫</td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center justify-between text-body-sm mb-1">
                    <span className="font-semibold text-on-surface tabular-nums">310 bao</span>
                    <span className="text-[11px] text-emerald-700 font-medium">Dồi dào</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                      Còn hàng
                    </span>
                    <span className="text-[11px] text-[#15803D] font-medium flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#15803D]"></span>
                      Đang kinh doanh
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4 pl-3 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Phân Urê Hạt Đục Cà Mau"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Chỉnh sửa', icon: 'edit' },
                        { label: 'Nhập thêm kho', icon: 'add_business' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 6: Thuốc Trừ Sâu Virtako 40WG */}
              <tr className="hover:bg-surface/70 transition-colors group">
                <td className="py-3.5 pl-4 pr-2 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer" type="checkbox" />
                </td>
                <td className="py-3.5 px-3">
                  <div className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors">
                    Thuốc Trừ Sâu Virtako 40WG
                  </div>
                  <div className="text-body-sm text-outline mt-0.5">Chlorantraniliprole + Thiamethoxam - Đặc trị sâu cuốn lá</div>
                </td>
                <td className="py-3.5 px-3 font-mono text-body-sm text-outline tabular-nums">SKU-BVTV-40WG</td>
                <td className="py-3.5 px-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    Thuốc BVTV
                  </span>
                </td>
                <td className="py-3.5 px-3 text-on-surface-variant text-body-sm">Gói 15g</td>
                <td className="py-3.5 px-3 text-right font-semibold tabular-nums text-on-surface">28.000 ₫</td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center justify-between text-body-sm mb-1">
                    <span className="font-semibold text-[#B91C1C] tabular-nums">0 gói</span>
                    <span className="text-[11px] text-[#B91C1C] font-medium">Hết sạch tồn</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
                      Hết hàng
                    </span>
                    <span className="text-[11px] text-[#15803D] font-medium flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#15803D]"></span>
                      Đang kinh doanh
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4 pl-3 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Thuốc Trừ Sâu Virtako 40WG"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Chỉnh sửa', icon: 'edit' },
                        { label: 'Tạo phiếu nhập gấp', icon: 'add_business', tone: 'primary' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 7: Phân Bón Lá Siêu Ra Rễ Roots 2 */}
              <tr className="hover:bg-surface/70 transition-colors group">
                <td className="py-3.5 pl-4 pr-2 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer" type="checkbox" />
                </td>
                <td className="py-3.5 px-3">
                  <div className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors">
                    Phân Bón Lá Siêu Ra Rễ Roots 2
                  </div>
                  <div className="text-body-sm text-outline mt-0.5">Dung tích lớn chuyên dụng cho hệ thống tưới nhỏ giọt sầu riêng</div>
                </td>
                <td className="py-3.5 px-3 font-mono text-body-sm text-outline tabular-nums">SKU-PBL-RT02</td>
                <td className="py-3.5 px-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Phân bón lá
                  </span>
                </td>
                <td className="py-3.5 px-3 text-on-surface-variant text-body-sm">Can 5 Lít</td>
                <td className="py-3.5 px-3 text-right font-semibold tabular-nums text-on-surface">380.000 ₫</td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center justify-between text-body-sm mb-1">
                    <span className="font-semibold text-on-surface tabular-nums">64 can</span>
                    <span className="text-[11px] text-emerald-700 font-medium">Tồn chuẩn</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                      Còn hàng
                    </span>
                    <span className="text-[11px] text-[#15803D] font-medium flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#15803D]"></span>
                      Đang kinh doanh
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4 pl-3 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Phân Bón Lá Siêu Ra Rễ Roots 2"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Chỉnh sửa', icon: 'edit' },
                        { label: 'Nhập thêm kho', icon: 'add_business' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 8: Hạt Giống Rau Cải Ngọt Sen Hồng */}
              <tr className="hover:bg-surface/70 transition-colors group">
                <td className="py-3.5 pl-4 pr-2 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer" type="checkbox" />
                </td>
                <td className="py-3.5 px-3">
                  <div className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors">
                    Hạt Giống Rau Cải Ngọt Sen Hồng
                  </div>
                  <div className="text-body-sm text-outline mt-0.5">Kháng bệnh tốt, ăn ngọt mềm không xơ - Thu hoạch 25-30 ngày</div>
                </td>
                <td className="py-3.5 px-3 font-mono text-body-sm text-outline tabular-nums">SKU-GR-CH08</td>
                <td className="py-3.5 px-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200">
                    Giống rau màu
                  </span>
                </td>
                <td className="py-3.5 px-3 text-on-surface-variant text-body-sm">Gói 50g</td>
                <td className="py-3.5 px-3 text-right font-semibold tabular-nums text-on-surface">18.000 ₫</td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center justify-between text-body-sm mb-1">
                    <span className="font-semibold text-on-surface tabular-nums">210 gói</span>
                    <span className="text-[11px] text-emerald-700 font-medium">Tồn dồi dào</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                      Còn hàng
                    </span>
                    <span className="text-[11px] text-[#15803D] font-medium flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#15803D]"></span>
                      Đang kinh doanh
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4 pl-3 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Hạt Giống Rau Cải Ngọt Sen Hồng"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Chỉnh sửa', icon: 'edit' },
                        { label: 'Nhập thêm kho', icon: 'add_business' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 9: Thuốc Điều Hòa Sinh Trưởng Gibberellin 90% */}
              <tr className="hover:bg-surface/70 transition-colors group bg-slate-50/50">
                <td className="py-3.5 pl-4 pr-2 text-center">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer" type="checkbox" />
                </td>
                <td className="py-3.5 px-3">
                  <div className="font-title-md text-title-md text-outline group-hover:text-on-surface transition-colors line-through">
                    Thuốc Điều Hòa Sinh Trưởng Gibberellin 90%
                  </div>
                  <div className="text-body-sm text-outline mt-0.5">Tạm dừng phân phối do nhà máy chuyển giao đổi bao bì mới</div>
                </td>
                <td className="py-3.5 px-3 font-mono text-body-sm text-outline tabular-nums">SKU-DHS-GIBB</td>
                <td className="py-3.5 px-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    Kích thích ST
                  </span>
                </td>
                <td className="py-3.5 px-3 text-outline text-body-sm">Lọ 10g</td>
                <td className="py-3.5 px-3 text-right font-semibold tabular-nums text-outline">65.000 ₫</td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center justify-between text-body-sm mb-1">
                    <span className="font-semibold text-outline tabular-nums">0 lọ</span>
                    <span className="text-[11px] text-outline font-medium">Khóa kho</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-slate-400 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]"></span>
                      Hết hàng
                    </span>
                    <span className="text-[11px] text-[#475569] font-medium flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#64748B]"></span>
                      Tạm ngừng kinh doanh
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4 pl-3 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Thuốc Điều Hòa Sinh Trưởng Gibberellin 90%"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Chỉnh sửa', icon: 'edit' },
                        { label: 'Tạm khóa nhập', icon: 'lock', tone: 'danger' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* 5. TABLE FOOTER & PAGINATION */}
        <div className="bg-[#F8FAFC] px-space-md py-space-sm border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-3 text-body-sm text-on-surface-variant select-none">
          <div className="flex items-center gap-4">
            <span>Hiển thị <strong className="font-semibold text-on-surface tabular-nums">1 - 9</strong> trong số <strong className="font-semibold text-on-surface tabular-nums">184</strong> sản phẩm</span>
            <div className="flex items-center gap-1.5 border-l border-outline-variant pl-4">
              <span className="text-xs text-outline">Số dòng:</span>
              <select defaultValue="10 sản phẩm / trang" className="h-7 text-xs bg-surface border border-outline-variant rounded px-2 py-0 focus:ring-primary focus:border-primary">
                <option>10 sản phẩm / trang</option>
                <option>25 sản phẩm / trang</option>
                <option>50 sản phẩm / trang</option>
                <option>100 sản phẩm / trang</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="h-8 px-2.5 rounded border border-outline-variant bg-surface-container-lowest text-outline hover:text-on-surface hover:bg-surface flex items-center gap-1 disabled:opacity-40" disabled>
              <span className="material-symbols-outlined text-base" data-icon="chevron_left">chevron_left</span>
              <span className="font-label-sm text-label-sm">Trước</span>
            </button>
            <button className="h-8 w-8 rounded bg-[#1E5E3A] text-on-primary font-semibold text-xs flex items-center justify-center shadow-xs">1</button>
            <button className="h-8 w-8 rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface text-xs flex items-center justify-center">2</button>
            <button className="h-8 w-8 rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface text-xs flex items-center justify-center">3</button>
            <span className="px-1 text-outline font-medium">...</span>
            <button className="h-8 w-8 rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface text-xs flex items-center justify-center">19</button>
            <button className="h-8 px-2.5 rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface flex items-center gap-1">
              <span className="font-label-sm text-label-sm">Sau</span>
              <span className="material-symbols-outlined text-base" data-icon="chevron_right">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. OPERATIONAL AUDIT & FAST NOTES STRIP */}
      <section className="p-space-sm px-space-md bg-surface-container-lowest rounded-lg border border-outline-variant flex flex-wrap items-center justify-between text-body-sm text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base" data-icon="info">info</span>
          <span>Hệ thống áp dụng cảnh báo sắp hết hàng mặc định: <strong>&lt; 20 bao/chai</strong> đối với nhóm Phân bón và Thuốc BVTV chủ lực vụ Đông Xuân.</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-outline">
          <span>Người đồng bộ kho gần nhất: <strong>Nguyễn Văn Khang (Kỹ sư nông học)</strong></span>
          <span>•</span>
          <span>15 phút trước qua VietQR Dispatch</span>
        </div>
      </section>
    </>
  )
}
