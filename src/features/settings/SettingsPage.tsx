import { useState } from 'react'
import { usePageHeader } from '../../context/PageHeaderContext'

export default function SettingsPage() {
  usePageHeader({
    title: 'Cài đặt',
  })

  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'display' | 'security'>('profile')

  const navItems: {
    key: 'profile' | 'notifications' | 'display' | 'security'
    label: string
    icon: string
    badge?: string
    verified?: boolean
  }[] = [
    { key: 'profile', label: 'Hồ sơ cá nhân', icon: 'person' },
    { key: 'notifications', label: 'Thông báo', icon: 'notifications_active', badge: '5 mục' },
    { key: 'display', label: 'Hiển thị', icon: 'palette' },
    { key: 'security', label: 'Bảo mật tài khoản', icon: 'shield', verified: true },
  ]

  return (
    <>
      {/* Quick status stamp */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface-variant font-label-md text-label-md shadow-sm self-start md:self-auto">
          <span className="material-symbols-outlined text-[18px] text-primary">verified_user</span>
          <span className="">
            Trạng thái tài khoản: <strong className="text-primary font-semibold">Đã xác thực đại lý</strong>
          </span>
        </div>
      </div>

      {/* TWO-COLUMN ENTERPRISE SETTINGS LAYOUT */}
      <div className="flex flex-col lg:flex-row items-start gap-space-xl">
        {/* LEFT SUB-NAVIGATION COLUMN (w-64 = 16rem) */}
        <nav className="w-full lg:w-64 bg-surface-container-lowest border border-outline-variant rounded-lg p-space-sm shadow-sm shrink-0">
          <div className="px-space-sm py-space-xs font-label-sm text-label-sm uppercase text-outline tracking-wider">
            Phân mục cấu hình
          </div>
          <ul className="mt-1 space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.key
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center justify-between px-space-md py-2.5 rounded-lg font-label-md text-label-md transition-all ${
                      isActive
                        ? 'bg-surface-container border-l-4 border-primary-container font-title-md text-title-md text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-primary' : ''}`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="px-1.5 py-0.2 bg-surface-container-high rounded text-[10px] font-medium text-on-surface">
                        {item.badge}
                      </span>
                    ) : item.verified ? (
                      <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                    ) : isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
          {/* Information card inside nav column */}
          <div className="mt-space-lg p-space-md bg-surface-container-low rounded-lg border border-outline-variant/60">
            <div className="flex items-center gap-1.5 text-primary font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span className="">Lưu ý kỹ thuật</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Các thông tin mã nhân sự và phân quyền được cố định bởi Quản trị viên Trung tâm Mekong Delta Hub.
            </p>
          </div>
        </nav>

        {/* RIGHT MAIN CONTENT AREA */}
        <div className="flex-1 w-full space-y-space-xl">
          {/* ================= SECTION 1: HỒ SƠ CÁ NHÂN ================= */}
          {activeSection === 'profile' && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm">
            {/* Card Header */}
            <div className="p-space-lg border-b border-outline-variant bg-surface-container-low/40 flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <div>
                  <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">Hồ sơ cá nhân</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Thông tin cá nhân &amp; Đơn vị công tác</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded border border-outline-variant">
                ID: AGT-8804-CT
              </span>
            </div>
            <div className="p-space-lg space-y-space-lg">
              {/* Avatar Block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-space-md bg-surface-container-low rounded-lg border border-outline-variant">
                <div className="flex items-center gap-space-md">
                  {/* Initials NM Avatar */}
                  <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-display text-[20px] font-bold shadow-sm border-2 border-surface-container-lowest">
                    NM
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-title-lg text-title-lg font-bold text-on-surface">Nguyễn Văn Minh</span>
                      <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm rounded-full font-medium border border-primary-fixed-dim">
                        Đại lý
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Đại lý vật tư nông nghiệp • AgriSage - Chi nhánh Cần Thơ
                    </p>
                    <p className="font-label-sm text-label-sm text-outline">Đăng nhập gần nhất: Hôm nay lúc 07:45 từ Cần Thơ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3.5 py-1.5 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded hover:bg-surface-container-low transition-colors flex items-center gap-1.5 shadow-sm"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload</span>
                    <span className="">Đổi ảnh đại diện</span>
                  </button>
                </div>
              </div>
              {/* Form Grid (2 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-base">
                {/* Họ và tên (editable) */}
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-medium text-on-surface">
                    Họ và tên <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-[38px] px-3 bg-surface-container-lowest border border-outline-variant rounded text-on-surface font-body-md text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                      type="text"
                      defaultValue="Nguyễn Văn Minh"
                    />
                  </div>
                </div>
                {/* Số điện thoại (editable) */}
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-medium text-on-surface">
                    Số điện thoại liên lạc <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-[38px] px-3 bg-surface-container-lowest border border-outline-variant rounded text-on-surface font-body-md text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                      type="text"
                      defaultValue="0918.234.567"
                    />
                  </div>
                </div>
                {/* Email liên hệ (editable) */}
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-medium text-on-surface">
                    Email liên hệ công vụ <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-[38px] px-3 bg-surface-container-lowest border border-outline-variant rounded text-on-surface font-body-md text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                      type="email"
                      defaultValue="minh.nguyen@agrisage.vn"
                    />
                  </div>
                </div>
                {/* Mã nhân sự (Read-only badge field) */}
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-medium text-on-surface">Mã nhân sự trạm</label>
                  <div className="flex items-center h-[38px] px-3 bg-surface-container border border-outline-variant rounded text-on-surface font-mono font-semibold">
                    <span className="material-symbols-outlined text-[18px] text-outline mr-2">tag</span>
                    #AGT-8804
                  </div>
                </div>
                {/* Vai trò hệ thống (Read-only with locked icon) */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label className="block font-label-md text-label-md font-medium text-on-surface">Vai trò hệ thống</label>
                    <span className="text-[11px] text-outline italic">Phân quyền do Quản trị viên cấp</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 min-h-[38px] px-3 py-2 bg-surface-container border border-outline-variant rounded text-on-surface font-body-md text-body-md">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-outline">lock</span>
                      <span className="font-medium text-on-surface">Đại lý / Kỹ sư phụ trách trạm</span>
                    </div>
                    <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface font-label-sm text-[10px] rounded shrink-0">
                      Cố định
                    </span>
                  </div>
                </div>
                {/* Chi nhánh / Khu vực làm việc (Read-only) */}
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-medium text-on-surface">
                    Chi nhánh / Khu vực làm việc
                  </label>
                  <div
                    className="flex items-center h-[38px] px-3 bg-surface-container border border-outline-variant rounded text-on-surface font-body-sm text-body-sm truncate"
                    title="Mekong Delta Hub - Chi nhánh Cần Thơ #04 (Quận Thới Lai, Cờ Đỏ, Ô Môn)"
                  >
                    <span className="material-symbols-outlined text-[18px] text-outline mr-2 shrink-0">hub</span>
                    <span className="truncate">Mekong Delta Hub - Chi nhánh Cần Thơ #04 (Quận Thới Lai, Cờ Đỏ, Ô Môn)</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Card Actions */}
            <div className="px-space-lg py-space-md bg-surface-container-low border-t border-outline-variant flex items-center justify-between rounded-b-lg">
              <div className="text-[12px] text-outline">Cập nhật lần cuối: 12/10/2024 bởi Hệ thống trung tâm</div>
              <div className="flex items-center gap-space-sm">
                <button
                  className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded hover:bg-surface-container transition-colors"
                  type="button"
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-2 bg-primary-container text-on-primary font-label-md text-label-md rounded hover:bg-[#17482D] active:bg-[#113622] transition-colors flex items-center gap-1.5 shadow-sm font-semibold"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span className="">Lưu thay đổi</span>
                </button>
              </div>
            </div>
          </section>
          )}

          {/* ================= SECTION 2: THÔNG BÁO ================= */}
          {activeSection === 'notifications' && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm">
            {/* Card Header */}
            <div className="p-space-lg border-b border-outline-variant bg-surface-container-low/40 flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                </div>
                <div>
                  <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">Thông báo</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Tùy chọn nhận thông báo tác vụ</p>
                </div>
              </div>
            </div>
            <div className="p-space-lg space-y-space-md">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Lựa chọn thông báo đẩy trong bảng điều khiển và thư điện tử để không bỏ lỡ tiến độ mùa vụ.
              </p>
              {/* Toggle Matrix Table */}
              <div className="overflow-x-auto border border-outline-variant rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">Loại sự kiện</th>
                      <th className="py-3 px-4 text-center font-semibold w-40 whitespace-nowrap">Thông báo trong hệ thống</th>
                      <th className="py-3 px-4 text-center font-semibold w-32 whitespace-nowrap">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                    {/* Row 1: Đơn hàng mới */}
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="font-title-md text-title-md font-semibold text-on-surface">Đơn hàng mới</div>
                        <div className="text-on-surface-variant text-[13px]">Nhận thông báo khi nông dân hoặc HTX đặt vật tư</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input defaultChecked readOnly className="sr-only peer" type="checkbox" />
                          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                        </label>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input defaultChecked readOnly className="sr-only peer" type="checkbox" />
                          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                        </label>
                      </td>
                    </tr>
                    {/* Row 2: Thanh toán chờ xác nhận */}
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="font-title-md text-title-md font-semibold text-on-surface">Thanh toán chờ xác nhận</div>
                        <div className="text-on-surface-variant text-[13px]">
                          Biến động số dư VietQR và giao dịch tiền mặt chờ khớp
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input defaultChecked readOnly className="sr-only peer" type="checkbox" />
                          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                        </label>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input defaultChecked readOnly className="sr-only peer" type="checkbox" />
                          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                        </label>
                      </td>
                    </tr>
                    {/* Row 3: Công nợ sắp đến hạn */}
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="font-title-md text-title-md font-semibold text-on-surface">Công nợ sắp đến hạn</div>
                        <div className="text-on-surface-variant text-[13px]">Cảnh báo nông dân có nợ gối đầu sắp quá hạn 7 ngày</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input defaultChecked readOnly className="sr-only peer" type="checkbox" />
                          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                        </label>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input className="sr-only peer" type="checkbox" />
                          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                        </label>
                      </td>
                    </tr>
                    {/* Row 4: Sản phẩm sắp hết hàng */}
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="font-title-md text-title-md font-semibold text-on-surface">Sản phẩm sắp hết hàng</div>
                        <div className="text-on-surface-variant text-[13px]">Cảnh báo tồn kho dưới ngưỡng an toàn tại trạm</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input defaultChecked readOnly className="sr-only peer" type="checkbox" />
                          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                        </label>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input defaultChecked readOnly className="sr-only peer" type="checkbox" />
                          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                        </label>
                      </td>
                    </tr>
                    {/* Row 5: Gợi ý AI chờ duyệt */}
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="font-title-md text-title-md font-semibold text-on-surface">Gợi ý AI chờ duyệt</div>
                        <div className="text-on-surface-variant text-[13px]">
                          Gợi ý sản phẩm thương mại cho sâu bệnh mới tải lên chờ xác nhận
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input defaultChecked readOnly className="sr-only peer" type="checkbox" />
                          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                        </label>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input className="sr-only peer" type="checkbox" />
                          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                        </label>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Card Actions */}
            <div className="px-space-lg py-space-md bg-surface-container-low border-t border-outline-variant flex items-center justify-end rounded-b-lg">
              <button
                className="px-4 py-2 bg-primary-container text-on-primary font-label-md text-label-md rounded hover:bg-[#17482D] transition-colors flex items-center gap-1.5 shadow-sm font-semibold"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span className="">Cập nhật thông báo</span>
              </button>
            </div>
          </section>
          )}

          {/* ================= SECTION 3: HIỂN THỊ ================= */}
          {activeSection === 'display' && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm">
            {/* Card Header */}
            <div className="p-space-lg border-b border-outline-variant bg-surface-container-low/40 flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">palette</span>
                </div>
                <div>
                  <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">Hiển thị</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Tùy chọn giao diện &amp; bảng dữ liệu</p>
                </div>
              </div>
            </div>
            <div className="p-space-lg space-y-space-xl">
              {/* Item 1: Chủ đề giao diện */}
              <div className="space-y-space-sm">
                <label className="block font-title-md text-title-md font-semibold text-on-surface">Chủ đề giao diện</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-base">
                  {/* Option 1: Sáng (Selected) */}
                  <div className="relative p-space-md rounded-lg border-2 border-primary-container bg-surface-container-lowest shadow-sm flex flex-col justify-between cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">Giao diện sáng</span>
                      <span className="material-symbols-outlined text-primary-container text-[20px] material-symbols-filled">
                        check_circle
                      </span>
                    </div>
                    <div className="h-16 rounded bg-slate-100 border border-outline-variant/60 p-2 flex flex-col gap-1">
                      <div className="h-2 w-1/3 bg-primary-container rounded"></div>
                      <div className="h-2 w-full bg-slate-300 rounded"></div>
                      <div className="h-2 w-2/3 bg-slate-200 rounded"></div>
                    </div>
                    <div className="mt-2 text-[11px] text-primary-container font-semibold">(Mặc định tối ưu ngoài trời)</div>
                  </div>
                  {/* Option 2: Tối (Sắp ra mắt) */}
                  <div className="relative p-space-md rounded-lg border border-outline-variant bg-surface-container-low opacity-75 cursor-not-allowed flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-md text-label-md font-medium text-on-surface">Giao diện tối</span>
                      <span className="px-1.5 py-0.5 bg-surface-container text-on-surface-variant font-label-sm text-[10px] rounded">
                        Sắp ra mắt
                      </span>
                    </div>
                    <div className="h-16 rounded bg-slate-900 border border-slate-700 p-2 flex flex-col gap-1">
                      <div className="h-2 w-1/3 bg-emerald-600 rounded"></div>
                      <div className="h-2 w-full bg-slate-700 rounded"></div>
                      <div className="h-2 w-2/3 bg-slate-800 rounded"></div>
                    </div>
                    <div className="mt-2 text-[11px] text-outline">Chế độ làm việc ban đêm</div>
                  </div>
                  {/* Option 3: Theo hệ thống */}
                  <div className="relative p-space-md rounded-lg border border-outline-variant bg-surface-container-lowest hover:border-outline cursor-pointer flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label-md text-label-md font-medium text-on-surface">Theo hệ thống</span>
                      <span className="w-4 h-4 rounded-full border border-outline-variant"></span>
                    </div>
                    <div className="h-16 rounded bg-gradient-to-r from-slate-100 to-slate-800 border border-outline-variant/60 p-2 flex flex-col gap-1">
                      <div className="h-2 w-1/3 bg-primary-container rounded"></div>
                      <div className="h-2 w-full bg-slate-400 rounded"></div>
                    </div>
                    <div className="mt-2 text-[11px] text-outline">Tự động theo thiết bị Agent</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Card Actions */}
            <div className="px-space-lg py-space-md bg-surface-container-low border-t border-outline-variant flex items-center justify-end rounded-b-lg">
              <button
                className="px-4 py-2 bg-primary-container text-on-primary font-label-md text-label-md rounded hover:bg-[#17482D] transition-colors flex items-center gap-1.5 shadow-sm font-semibold"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span className="">Áp dụng hiển thị</span>
              </button>
            </div>
          </section>
          )}

          {/* ================= SECTION 4: BẢO MẬT TÀI KHOẢN ================= */}
          {activeSection === 'security' && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm">
            {/* Card Header */}
            <div className="p-space-lg border-b border-outline-variant bg-surface-container-low/40 flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                </div>
                <div>
                  <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">Bảo mật tài khoản</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Bảo mật tài khoản &amp; Đổi mật khẩu</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-primary font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span className="">Bảo vệ 2 lớp hoạt động</span>
              </div>
            </div>
            <div className="p-space-lg space-y-space-xl">
              {/* Form Change Password */}
              <div className="space-y-space-base max-w-xl">
                <h3 className="font-title-md text-title-md font-semibold text-on-surface">Đổi mật khẩu truy cập</h3>
                {/* Mật khẩu hiện tại */}
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-medium text-on-surface">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      className="w-full h-[38px] px-3 pr-10 bg-surface-container-lowest border border-outline-variant rounded text-on-surface font-body-md text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                      type="password"
                      defaultValue="secretpassword123"
                    />
                    <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" type="button">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </div>
                </div>
                {/* Mật khẩu mới */}
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-medium text-on-surface">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      className="w-full h-[38px] px-3 pr-10 bg-surface-container-lowest border border-outline-variant rounded text-on-surface font-body-md text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                      placeholder="Nhập mật khẩu mới..."
                      type="password"
                    />
                    <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" type="button">
                      <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                    </button>
                  </div>
                  <p className="font-body-sm text-body-sm text-outline">
                    Yêu cầu: Tối thiểu 8 ký tự, bao gồm số và ký tự đặc biệt (!@#$%).
                  </p>
                </div>
                {/* Xác nhận mật khẩu mới */}
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-medium text-on-surface">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <input
                      className="w-full h-[38px] px-3 pr-10 bg-surface-container-lowest border border-outline-variant rounded text-on-surface font-body-md text-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                      placeholder="Nhập lại mật khẩu mới..."
                      type="password"
                    />
                  </div>
                </div>
                <div>
                  <button
                    className="px-4 py-2 bg-surface-container-lowest border-2 border-primary-container text-primary-container font-label-md text-label-md rounded hover:bg-primary-container hover:text-on-primary transition-all font-semibold flex items-center gap-1.5 shadow-sm"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">key</span>
                    <span className="">Đổi mật khẩu</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Card Footer Note */}
            <div className="px-space-lg py-space-sm bg-surface-container-low border-t border-outline-variant rounded-b-lg font-body-sm text-body-sm text-outline flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">lock_clock</span>
              <span className="">
                Phiên đăng nhập tự động gia hạn an toàn theo giao thức OAuth2 &amp; JWT của Trung tâm AgriSage Mekong.
              </span>
            </div>
          </section>
          )}
        </div>
      </div>
    </>
  )
}
