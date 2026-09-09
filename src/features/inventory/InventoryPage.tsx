import { usePageHeader } from '../../context/PageHeaderContext'
import RowActionsMenu from '../../components/ui/RowActionsMenu'
import DetailModal from '../../components/ui/DetailModal'
import Pagination from '../../components/ui/Pagination'
import { useSelectableList } from '../../hooks/useSelectableList'
import { usePagination } from '../../hooks/usePagination'
import { inventoryItems as INITIAL_INVENTORY } from '../../data/mockInventory'

export default function InventoryPage() {
  usePageHeader({
    title: 'Quản lý kho hàng',
  })

  const { selectedId, setSelectedId, selected: selectedItem } = useSelectableList(INITIAL_INVENTORY, (item) => item.id)
  const { page, totalPages, paginated, startIndex, endIndex, totalCount: pageTotalCount, goPrev, goNext, setPage } =
    usePagination(INITIAL_INVENTORY, 10)

  const handleInventoryAction = (id: string, label: string) => {
    if (label === 'Xem chi tiết') setSelectedId(id)
  }

  const totalCount = INITIAL_INVENTORY.length
  const lowStockCount = INITIAL_INVENTORY.filter((item) => item.stockLabel === 'Sắp hết').length
  const outOfStockCount = INITIAL_INVENTORY.filter((item) => item.stockLabel === 'Hết hàng').length

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
            <div className="font-metric-num text-metric-num text-on-surface">{totalCount} <span className="text-sm font-normal text-on-surface-variant font-body-sm">mặt hàng</span></div>
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
            <div className="font-metric-num text-metric-num text-[#B45309]">{lowStockCount} <span className="text-sm font-normal text-on-surface-variant font-body-sm">mặt hàng</span></div>
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
            <div className="font-metric-num text-metric-num text-error">{outOfStockCount} <span className="text-sm font-normal text-on-surface-variant font-body-sm">mặt hàng</span></div>
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
                <th className="py-3 px-3 font-semibold text-center" scope="col">Trạng thái</th>
                <th className="py-3 px-3 font-semibold" scope="col">Cập nhật gần nhất</th>
                <th className="py-3 px-4 font-semibold text-right" scope="col">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-md">
              {paginated.map((item) => {
                const isSelected = item.id === selectedId
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary'
                        : `hover:bg-surface-container-low ${item.rowClassName ?? ''}`
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className={`font-title-md text-title-md font-semibold group-hover:text-primary ${item.nameClassName ?? 'text-on-surface'}`}>
                          {item.name}
                        </span>
                        <span className="font-body-sm text-[12px] text-outline">{item.description}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[12px] text-on-surface-variant font-medium">{item.sku}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant">{item.categoryLabel}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-semibold tabular-nums ${item.stockQuantityClassName ?? 'text-on-surface'}`}>{item.stockQuantity}</span>
                        <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1">
                          <div className={`h-full rounded-full ${item.stockBarClassName}`} style={{ width: item.stockBarWidth }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${item.stockClassName}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.stockDotClassName}`}></span>
                        {item.stockLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col text-[11px]">
                        <span className="text-on-surface">{item.updatedAgo}</span>
                        <span className="text-outline">{item.updatedBy}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end">
                        <RowActionsMenu
                          triggerLabel={`Thao tác ${item.name}`}
                          actions={item.actions.map((action) => ({
                            ...action,
                            onClick: () => handleInventoryAction(item.id, action.label),
                          }))}
                        />
                      </div>
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
          totalCount={pageTotalCount}
          unitLabel="sản phẩm"
          goPrev={goPrev}
          goNext={goNext}
          setPage={setPage}
        />
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
          <div className="p-space-sm bg-surface-container-low border-t border-outline-variant text-body-sm text-outline">
            <span>Dữ liệu kích hoạt tự động theo hạn ngạch vụ mùa ĐBSCL</span>
          </div>
        </div>
        {/* COLUMN 2: NHẬT KÝ XUẤT NHẬP KHO GẦN ĐÂY */}
        <div className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col justify-between">
          <div className="p-space-base border-b border-outline-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]" data-icon="receipt">receipt</span>
            <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">Nhật ký xuất nhập kho gần đây</h2>
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

      {/* DETAIL MODAL: CHI TIẾT THẺ KHO */}
      <DetailModal open={selectedItem !== null} onClose={() => setSelectedId(null)}>
        {selectedItem ? (
          <div className="p-space-md space-y-3">
            <div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">{selectedItem.name}</h3>
              <p className="text-body-sm text-outline mt-0.5">{selectedItem.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[12px] text-on-surface-variant font-medium px-2 py-0.5 bg-surface-container-low rounded">{selectedItem.sku}</span>
              <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant">{selectedItem.categoryLabel}</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${selectedItem.stockClassName}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedItem.stockDotClassName}`}></span>
                {selectedItem.stockLabel}
              </span>
            </div>
            <div className="pt-2 border-t border-outline-variant">
              <div className="flex items-center justify-between text-body-sm text-outline mb-1">
                <span>Tồn thực tế</span>
                <span className="font-semibold text-on-surface tabular-nums">{selectedItem.stockQuantity}</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${selectedItem.stockBarClassName}`} style={{ width: selectedItem.stockBarWidth }}></div>
              </div>
            </div>
            <div className="text-body-sm text-on-surface-variant">
              Cập nhật gần nhất: <strong className="text-on-surface">{selectedItem.updatedAgo}</strong> bởi {selectedItem.updatedBy}
            </div>
          </div>
        ) : null}
      </DetailModal>
    </div>
  )
}
