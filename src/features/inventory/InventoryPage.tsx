import { usePageHeader } from '../../context/PageHeaderContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'

export default function InventoryPage() {
  usePageHeader({
    title: 'Quản lý kho hàng',
    subtitle: 'Theo dõi tồn kho, nhập hàng và tình trạng sản phẩm tại đại lý',
  })

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-space-lg">
      {/* BREADCRUMB & HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex items-center gap-2 text-body-sm font-body-sm text-outline">
            <a className="hover:text-primary transition-colors" href="#">Bảng điều khiển</a>
            <span className="material-symbols-outlined text-[14px]" data-icon="chevron_right">chevron_right</span>
            <span className="text-on-surface font-medium">Quản lý kho hàng</span>
          </nav>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
            Đồng bộ thời gian thực
          </span>
        </div>
        {/* Major Operational Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low hover:border-outline font-title-md text-title-md transition-colors shadow-sm" type="button">
            <span className="material-symbols-outlined text-[18px] text-outline" data-icon="file_download">file_download</span>
            <span>Xuất biên bản kiểm kê</span>
          </button>
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low hover:border-outline font-title-md text-title-md transition-colors shadow-sm" type="button">
            <span className="material-symbols-outlined text-[18px] text-primary" data-icon="unarchive">unarchive</span>
            <span>Xuất kho</span>
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-[#17482D] active:bg-[#113622] text-on-primary font-title-md text-title-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" type="button">
            <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
            <span>Nhập kho</span>
          </button>
        </div>
      </div>

      {/* 4 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-base">
        {/* Card 1: Total Stocked Items */}
        <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm hover:border-outline transition-colors flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">Tổng sản phẩm trong kho</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]" data-icon="inventory">inventory</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-metric-num text-metric-num text-on-surface">184 <span className="text-sm font-normal text-on-surface-variant font-body-sm">mặt hàng</span></div>
            <div className="mt-1 flex items-center gap-1.5 text-body-sm font-body-sm text-outline">
              <span className="material-symbols-outlined text-[16px] text-emerald-600" data-icon="check_circle">check_circle</span>
              <span>1.420 đơn vị bao/chai/gói đang lưu trữ</span>
            </div>
          </div>
        </div>
        {/* Card 2: Low Stock Warning */}
        <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm hover:border-outline transition-colors flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">Sắp hết hàng</span>
            <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-[#B45309]">
              <span className="material-symbols-outlined text-[20px]" data-icon="warning">warning</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-metric-num text-metric-num text-[#B45309]">12 <span className="text-sm font-normal text-on-surface-variant font-body-sm">mặt hàng</span></div>
            <div className="mt-1 flex items-center gap-1.5 text-body-sm font-body-sm text-[#B45309]">
              <span className="material-symbols-outlined text-[16px]" data-icon="trending_down">trending_down</span>
              <span>Dưới ngưỡng an toàn, cần nhập sớm</span>
            </div>
          </div>
        </div>
        {/* Card 3: Out of Stock Alert */}
        <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm hover:border-outline transition-colors flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">Hết hàng</span>
            <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[20px]" data-icon="block">block</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-metric-num text-metric-num text-error">04 <span className="text-sm font-normal text-on-surface-variant font-body-sm">mặt hàng</span></div>
            <div className="mt-1 flex items-center gap-1.5 text-body-sm font-body-sm text-error">
              <span className="material-symbols-outlined text-[16px]" data-icon="error">error</span>
              <span>Tồn kho 0, ngừng cung ứng cho nông dân</span>
            </div>
          </div>
        </div>
        {/* Card 4: Total Inventory Value */}
        <div className="p-space-base rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm hover:border-outline transition-colors flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">Giá trị tồn kho</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]" data-icon="monetization_on">monetization_on</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-metric-num text-metric-num text-primary">1.845.600.000 <span className="text-sm font-normal text-on-surface-variant font-body-sm">₫</span></div>
            <div className="mt-1 flex items-center gap-1.5 text-body-sm font-body-sm text-outline">
              <span className="material-symbols-outlined text-[16px]" data-icon="info">info</span>
              <span>Định giá theo giá vốn nhập trạm</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH CONTROLS */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline" data-icon="search">search</span>
          <input className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md font-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Tìm kiếm sản phẩm, mã SKU, hoạt chất..." type="text" />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[150px]">
            <select className="w-full appearance-none pl-3 pr-8 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-sm font-label-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Tất cả danh mục</option>
              <option>Phân bón</option>
              <option>Thuốc BVTV</option>
              <option>Lúa giống</option>
              <option>Hạt giống rau</option>
              <option>Phân bón lá</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-2.5 text-[18px] text-outline" data-icon="arrow_drop_down">arrow_drop_down</span>
          </div>
          <div className="relative min-w-[150px]">
            <select className="w-full appearance-none pl-3 pr-8 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-sm font-label-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Tất cả trạng thái</option>
              <option>Tồn kho tốt</option>
              <option>Sắp hết hàng</option>
              <option>Hết hàng</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-2.5 text-[18px] text-outline" data-icon="arrow_drop_down">arrow_drop_down</span>
          </div>
          <div className="relative min-w-[170px]">
            <select className="w-full appearance-none pl-3 pr-8 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-sm font-label-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Tất cả vị trí kho</option>
              <option>Kho A - Kệ 01-04</option>
              <option>Kho B - Khu phân bón</option>
              <option>Kho C - Gian lạnh hạt giống</option>
              <option>Kho D - Tủ bảo quản BVTV</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-2.5 text-[18px] text-outline" data-icon="arrow_drop_down">arrow_drop_down</span>
          </div>
          <button className="px-3 py-2 rounded-xl text-body-sm font-label-md text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-1" type="button">
            <span className="material-symbols-outlined text-[16px]" data-icon="restart_alt">restart_alt</span>
            <span>Xóa lọc</span>
          </button>
        </div>
      </div>

      {/* MAIN INVENTORY DATA TABLE */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-label-sm uppercase tracking-wider text-outline select-none">
                <th className="py-3 px-4 font-semibold" scope="col">Sản phẩm &amp; Hoạt chất</th>
                <th className="py-3 px-3 font-semibold" scope="col">SKU</th>
                <th className="py-3 px-3 font-semibold" scope="col">Danh mục</th>
                <th className="py-3 px-3 font-semibold text-right" scope="col">Tồn thực tế</th>
                <th className="py-3 px-3 font-semibold text-right" scope="col">Tối thiểu</th>
                <th className="py-3 px-3 font-semibold" scope="col">ĐVT</th>
                <th className="py-3 px-3 font-semibold" scope="col">Vị trí kho</th>
                <th className="py-3 px-3 font-semibold text-center" scope="col">Trạng thái</th>
                <th className="py-3 px-3 font-semibold" scope="col">Cập nhật gần nhất</th>
                <th className="py-3 px-4 font-semibold text-right" scope="col">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-md">
              {/* ROW 1: Phân NPK Đầu Trâu (Amber) */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary">Phân NPK Đầu Trâu 20-20-15+TE</span>
                    <span className="font-body-sm text-[12px] text-outline">Đạm 20% - Lân 20% - Kali 15% + Vi lượng TE</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-[12px] text-on-surface-variant font-medium">SKU-NPK-2015</td>
                <td className="py-3 px-3">
                  <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant">Phân bón</span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-on-surface tabular-nums">18</span>
                    <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '36%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-mono text-outline tabular-nums">30</td>
                <td className="py-3 px-3 text-on-surface-variant text-body-sm">Bao 50kg</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-on-surface-variant text-body-sm">
                    <span className="material-symbols-outlined text-[14px] text-outline" data-icon="shelves">shelves</span>
                    <span>Kho B - Dãy 02</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                    Sắp hết
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-col text-[11px]">
                    <span className="text-on-surface">15 phút trước</span>
                    <span className="text-outline">NV. Khang</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Phân NPK Đầu Trâu 20-20-15+TE"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Điều chỉnh tồn kho', icon: 'tune' },
                        { label: 'Nhập hàng ngay', icon: 'add_circle', tone: 'primary' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 2: Thuốc Beam 75WP (Amber/Critical) */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary">Thuốc Trừ Bệnh Beam 75WP</span>
                    <span className="font-body-sm text-[12px] text-outline">Tricyclazole 75% w/w - Đặc trị đạo ôn lúa</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-[12px] text-on-surface-variant font-medium">SKU-BVTV-0084</td>
                <td className="py-3 px-3">
                  <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant">Thuốc BVTV</span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-amber-700 tabular-nums">08</span>
                    <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '16%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-mono text-outline tabular-nums">50</td>
                <td className="py-3 px-3 text-on-surface-variant text-body-sm">Gói 100g</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-on-surface-variant text-body-sm">
                    <span className="material-symbols-outlined text-[14px] text-outline" data-icon="lock">lock</span>
                    <span>Kho D - Tủ 03</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                    Sắp hết
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-col text-[11px]">
                    <span className="text-on-surface">1 giờ trước</span>
                    <span className="text-outline">KS. Minh</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Thuốc Trừ Bệnh Beam 75WP"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Điều chỉnh tồn kho', icon: 'tune' },
                        { label: 'Nhập hàng ngay', icon: 'add_circle', tone: 'primary' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 3: Lúa Giống ST25 (Green) */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary">Lúa Giống Xác Nhận ST25</span>
                    <span className="font-body-sm text-[12px] text-outline">Giống nguyên chủng Cua Đỏ Sóc Trăng - Vụ TĐ 2024</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-[12px] text-on-surface-variant font-medium">SKU-GIONG-ST25</td>
                <td className="py-3 px-3">
                  <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant">Lúa giống</span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-on-surface tabular-nums">142</span>
                    <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-mono text-outline tabular-nums">40</td>
                <td className="py-3 px-3 text-on-surface-variant text-body-sm">Bao 25kg</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-on-surface-variant text-body-sm">
                    <span className="material-symbols-outlined text-[14px] text-outline" data-icon="ac_unit">ac_unit</span>
                    <span>Kho C - Gian A</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                    Tồn kho tốt
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-col text-[11px]">
                    <span className="text-on-surface">2 giờ trước</span>
                    <span className="text-outline">KS. Minh</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Lúa Giống Xác Nhận ST25"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Điều chỉnh tồn kho', icon: 'tune' },
                        { label: 'Nhập hàng ngay', icon: 'add_circle', tone: 'primary' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 4: Thuốc Trừ Cỏ Sofit 300EC (Green) */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary">Thuốc Trừ Cỏ Sofit 300EC</span>
                    <span className="font-body-sm text-[12px] text-outline">Pretilachlor 300g/L + Chất an toàn Fenclorim - Syngenta</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-[12px] text-on-surface-variant font-medium">SKU-BVTV-300E</td>
                <td className="py-3 px-3">
                  <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant">Thuốc BVTV</span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-on-surface tabular-nums">95</span>
                    <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-mono text-outline tabular-nums">30</td>
                <td className="py-3 px-3 text-on-surface-variant text-body-sm">Chai 500ml</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-on-surface-variant text-body-sm">
                    <span className="material-symbols-outlined text-[14px] text-outline" data-icon="shelves">shelves</span>
                    <span>Kho D - Tủ 01</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                    Tồn kho tốt
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-col text-[11px]">
                    <span className="text-on-surface">Hôm qua</span>
                    <span className="text-outline">TK. Nam</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Thuốc Trừ Cỏ Sofit 300EC"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Điều chỉnh tồn kho', icon: 'tune' },
                        { label: 'Nhập hàng ngay', icon: 'add_circle', tone: 'primary' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 5: Phân Urê Hạt Đục Cà Mau (Green) */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary">Phân Urê Hạt Đục Cà Mau</span>
                    <span className="font-body-sm text-[12px] text-outline">Đạm 46.3% N tối thiểu - Tan chậm hạn chế thất thoát</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-[12px] text-on-surface-variant font-medium">SKU-URE-CM01</td>
                <td className="py-3 px-3">
                  <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant">Phân bón</span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-on-surface tabular-nums">310</span>
                    <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-mono text-outline tabular-nums">80</td>
                <td className="py-3 px-3 text-on-surface-variant text-body-sm">Bao 50kg</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-on-surface-variant text-body-sm">
                    <span className="material-symbols-outlined text-[14px] text-outline" data-icon="shelves">shelves</span>
                    <span>Kho B - Dãy 01</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                    Tồn kho tốt
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-col text-[11px]">
                    <span className="text-on-surface">3 giờ trước</span>
                    <span className="text-outline">NV. Khang</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Phân Urê Hạt Đục Cà Mau"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Điều chỉnh tồn kho', icon: 'tune' },
                        { label: 'Nhập hàng ngay', icon: 'add_circle', tone: 'primary' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 6: Thuốc Trừ Sâu Virtako 40WG (RED - Out of stock) */}
              <tr className="hover:bg-surface-container-low transition-colors group bg-red-50/20">
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-error font-semibold group-hover:underline">Thuốc Trừ Sâu Virtako 40WG</span>
                    <span className="font-body-sm text-[12px] text-outline">Chlorantraniliprole 20% + Thiamethoxam 20%</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-[12px] text-on-surface-variant font-medium">SKU-BVTV-40WG</td>
                <td className="py-3 px-3">
                  <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant">Thuốc BVTV</span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-error tabular-nums">00</span>
                    <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-red-600 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-mono text-outline tabular-nums">40</td>
                <td className="py-3 px-3 text-on-surface-variant text-body-sm">Gói 15g</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-on-surface-variant text-body-sm">
                    <span className="material-symbols-outlined text-[14px] text-outline" data-icon="shelves">shelves</span>
                    <span>Kho D - Tủ 02</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
                    Hết hàng
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-col text-[11px]">
                    <span className="text-on-surface">10 phút trước</span>
                    <span className="text-outline">KS. Minh</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Thuốc Trừ Sâu Virtako 40WG"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Điều chỉnh tồn kho', icon: 'tune' },
                        { label: 'Tạo đề nghị nhập khẩn', icon: 'notification_important', tone: 'danger' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 7: Phân Bón Lá Siêu Ra Rễ Roots 2 (Green) */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary">Phân Bón Lá Siêu Ra Rễ Roots 2</span>
                    <span className="font-body-sm text-[12px] text-outline">Axit Humic + Rong biển hữu cơ cô đặc kích rễ cực mạnh</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-[12px] text-on-surface-variant font-medium">SKU-PBL-RT02</td>
                <td className="py-3 px-3">
                  <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant">Phân bón lá</span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-on-surface tabular-nums">64</span>
                    <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-mono text-outline tabular-nums">20</td>
                <td className="py-3 px-3 text-on-surface-variant text-body-sm">Can 5 Lít</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-on-surface-variant text-body-sm">
                    <span className="material-symbols-outlined text-[14px] text-outline" data-icon="shelves">shelves</span>
                    <span>Kho A - Kệ 04</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                    Tồn kho tốt
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-col text-[11px]">
                    <span className="text-on-surface">Hôm qua</span>
                    <span className="text-outline">TK. Nam</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Phân Bón Lá Siêu Ra Rễ Roots 2"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Điều chỉnh tồn kho', icon: 'tune' },
                        { label: 'Nhập hàng ngay', icon: 'add_circle', tone: 'primary' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
              {/* ROW 8: Hạt Giống Rau Cải Ngọt Sen Hồng (Green) */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary">Hạt Giống Rau Cải Ngọt Sen Hồng</span>
                    <span className="font-body-sm text-[12px] text-outline">Độ nảy mầm &gt; 85%, thời gian thu hoạch 28-32 ngày</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-[12px] text-on-surface-variant font-medium">SKU-GR-CH08</td>
                <td className="py-3 px-3">
                  <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant">Giống rau</span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-on-surface tabular-nums">210</span>
                    <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-mono text-outline tabular-nums">50</td>
                <td className="py-3 px-3 text-on-surface-variant text-body-sm">Gói 50g</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-on-surface-variant text-body-sm">
                    <span className="material-symbols-outlined text-[14px] text-outline" data-icon="ac_unit">ac_unit</span>
                    <span>Kho C - Kệ mát</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                    Tồn kho tốt
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-col text-[11px]">
                    <span className="text-on-surface">4 giờ trước</span>
                    <span className="text-outline">KS. Minh</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end">
                    <RowActionsMenu
                      triggerLabel="Thao tác Hạt Giống Rau Cải Ngọt Sen Hồng"
                      actions={[
                        { label: 'Xem chi tiết', icon: 'visibility' },
                        { label: 'Điều chỉnh tồn kho', icon: 'tune' },
                        { label: 'Nhập hàng ngay', icon: 'add_circle', tone: 'primary' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* PAGINATION & SUMMARY FOOTER */}
        <div className="px-space-md py-space-sm bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-space-sm select-none">
          <div className="flex items-center gap-4 text-body-sm text-outline font-body-sm">
            <span>Hiển thị <strong className="text-on-surface font-semibold">1 - 8</strong> trong số <strong className="text-on-surface font-semibold">184</strong> sản phẩm</span>
            <div className="hidden md:flex items-center gap-1 text-xs">
              <span>Số dòng:</span>
              <select className="py-0.5 px-2 bg-surface-container-lowest border border-outline-variant rounded text-on-surface text-xs focus:outline-none">
                <option>10 sản phẩm / trang</option>
                <option>20 sản phẩm / trang</option>
                <option>50 sản phẩm / trang</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant text-outline hover:text-on-surface text-body-sm disabled:opacity-40" disabled type="button">
              Trước
            </button>
            <button className="w-8 h-8 rounded bg-primary text-on-primary font-semibold text-xs flex items-center justify-center" type="button">1</button>
            <button className="w-8 h-8 rounded hover:bg-surface-container-high text-on-surface-variant font-medium text-xs flex items-center justify-center" type="button">2</button>
            <button className="w-8 h-8 rounded hover:bg-surface-container-high text-on-surface-variant font-medium text-xs flex items-center justify-center" type="button">3</button>
            <span className="px-1 text-outline">...</span>
            <button className="w-8 h-8 rounded hover:bg-surface-container-high text-on-surface-variant font-medium text-xs flex items-center justify-center" type="button">19</button>
            <button className="px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container text-body-sm font-medium" type="button">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* 2-COLUMN AUXILIARY LOWER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-base">
        {/* COLUMN 1: CẢNH BÁO SẮP HẾT HÀNG KHẨN CẤP (LOW STOCK ALERTS) */}
        <div className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col justify-between">
          <div className="p-space-base border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
              <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">Cảnh báo tồn kho khẩn cấp</h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-error-container text-on-error-container font-semibold">3 cảnh báo nghiêm trọng</span>
          </div>
          <div className="p-space-base divide-y divide-outline-variant">
            {/* Alert Item 1: Virtako 40WG */}
            <div className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-space-md">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FEE2E2] text-error flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]" data-icon="report">report</span>
                </div>
                <div>
                  <h3 className="font-title-md text-title-md text-on-surface font-semibold">Thuốc Trừ Sâu Virtako 40WG</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-body-sm">
                    <span className="font-bold text-error">Tồn 0 / Ngưỡng 40 gói</span>
                    <span className="text-outline">•</span>
                    <span className="text-on-surface-variant">Kho D - Tủ 02 (Đang có đơn chờ)</span>
                  </div>
                </div>
              </div>
              <button className="shrink-0 px-3 py-1.5 rounded-lg bg-error hover:bg-[#b91c1c] text-on-error text-body-sm font-semibold transition-colors flex items-center gap-1 shadow-sm" type="button">
                <span className="material-symbols-outlined text-[16px]" data-icon="add_shopping_cart">add_shopping_cart</span>
                <span>Tạo đề nghị nhập khẩn</span>
              </button>
            </div>
            {/* Alert Item 2: Beam 75WP */}
            <div className="py-3 flex items-center justify-between gap-space-md">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]" data-icon="warning">warning</span>
                </div>
                <div>
                  <h3 className="font-title-md text-title-md text-on-surface font-semibold">Thuốc Trừ Bệnh Beam 75WP</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-body-sm">
                    <span className="font-bold text-[#B45309]">Tồn 8 / Ngưỡng 50 gói</span>
                    <span className="text-outline">•</span>
                    <span className="text-on-surface-variant">Kho D - Tủ 03 (Đạt ngưỡng báo động)</span>
                  </div>
                </div>
              </div>
              <button className="shrink-0 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface text-body-sm font-semibold transition-colors flex items-center gap-1" type="button">
                <span>Tạo đề nghị nhập</span>
              </button>
            </div>
            {/* Alert Item 3: Phân NPK Đầu Trâu */}
            <div className="py-3 last:pb-0 flex items-center justify-between gap-space-md">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]" data-icon="hourglass_top">hourglass_top</span>
                </div>
                <div>
                  <h3 className="font-title-md text-title-md text-on-surface font-semibold">Phân NPK Đầu Trâu 20-20-15+TE</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-body-sm">
                    <span className="font-bold text-[#B45309]">Tồn 18 / Ngưỡng 30 bao</span>
                    <span className="text-outline">•</span>
                    <span className="text-on-surface-variant">Kho B - Dãy 02 (Đang vụ bón đón đòng)</span>
                  </div>
                </div>
              </div>
              <button className="shrink-0 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface text-body-sm font-semibold transition-colors flex items-center gap-1" type="button">
                <span>Tạo đề nghị nhập</span>
              </button>
            </div>
          </div>
          <div className="p-space-sm bg-surface-container-low border-t border-outline-variant flex items-center justify-between text-body-sm text-outline">
            <span>Dữ liệu kích hoạt tự động theo hạn ngạch vụ mùa ĐBSCL</span>
            <a className="text-primary font-semibold hover:underline" href="#">Xem quy tắc cảnh báo →</a>
          </div>
        </div>
        {/* COLUMN 2: NHẬT KÝ XUẤT NHẬP KHO GẦN ĐÂY */}
        <div className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col justify-between">
          <div className="p-space-base border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]" data-icon="receipt">receipt</span>
              <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">Nhật ký xuất nhập kho gần đây</h2>
            </div>
            <a className="text-body-sm text-primary font-semibold hover:underline" href="#">Xem tất cả thẻ kho</a>
          </div>
          <div className="p-space-base divide-y divide-outline-variant">
            {/* Activity 1 */}
            <div className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">NHẬP</span>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface font-semibold">+50 bao Phân Urê Cà Mau</span>
                  <span className="text-body-sm text-outline mt-0.5">Thực hiện: Kỹ sư Nguyễn Văn Khang (Kho B)</span>
                </div>
              </div>
              <span className="text-body-sm text-outline shrink-0 font-mono">14:20 hôm nay</span>
            </div>
            {/* Activity 2 */}
            <div className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#B45309]">XUẤT</span>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface font-semibold">-15 bao Lúa Giống ST25</span>
                  <span className="text-body-sm text-outline mt-0.5">Đơn DH-2024-884 (Hộ Bùi Tấn Lực) • KS. Minh</span>
                </div>
              </div>
              <span className="text-body-sm text-outline shrink-0 font-mono">11:05 hôm nay</span>
            </div>
            {/* Activity 3 */}
            <div className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#B45309]">XUẤT</span>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface font-semibold">-20 gói Thuốc Beam 75WP</span>
                  <span className="text-body-sm text-outline mt-0.5">Đơn DH-2024-881 (Hộ Trần Văn Triệu) • KS. Minh</span>
                </div>
              </div>
              <span className="text-body-sm text-outline shrink-0 font-mono">09:30 hôm nay</span>
            </div>
            {/* Activity 4 */}
            <div className="py-2.5 last:pb-0 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-container text-on-surface-variant">ĐIỀU CHỈNH</span>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface font-semibold">Khớp thẻ kho Sofit 300EC</span>
                  <span className="text-body-sm text-outline mt-0.5">Kiểm đếm cuối ngày trạm • Thủ kho Lê Hoàng Nam</span>
                </div>
              </div>
              <span className="text-body-sm text-outline shrink-0 font-mono">08:15 hôm nay</span>
            </div>
          </div>
          <div className="p-space-sm bg-surface-container-low border-t border-outline-variant flex items-center justify-between text-body-sm text-outline">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-emerald-600" data-icon="verified">verified</span>
              Thẻ kho điện tử mã hóa an toàn theo tiêu chuẩn AgriSage
            </span>
            <button className="text-primary font-semibold hover:underline" type="button">In sổ kho</button>
          </div>
        </div>
      </div>
    </div>
  )
}
