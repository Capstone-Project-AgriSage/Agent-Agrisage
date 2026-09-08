import { useNavigate } from 'react-router-dom'
import { usePageHeaderValue } from '../../context/PageHeaderContext'
import { useAuth } from '../../context/AuthContext'

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { title, subtitle, badge } = usePageHeaderValue()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-header-height px-layout-margin-desktop bg-white border-b border-outline-variant/60 sticky top-0 z-40 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-space-lg min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded border border-transparent hover:border-outline-variant/60 hover:bg-surface-container-low text-on-surface-variant transition-colors"
          aria-label="Mở menu điều hướng"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-title-lg text-title-lg text-on-surface font-bold truncate shrink-0 max-w-[280px]">{title}</h1>
            {badge ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-primary-fixed/50 text-on-primary-fixed-variant font-label-sm text-label-sm rounded border border-primary-fixed-dim/60 font-medium max-w-[110px] lg:max-w-[200px] overflow-hidden min-w-0">
                <span className="material-symbols-outlined text-[14px] text-primary shrink-0">agriculture</span>
                <span className="truncate">{badge}</span>
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2 mt-0.5 truncate">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="w-96 relative hidden xl:block">
        <span className="material-symbols-outlined absolute left-3 top-2 text-[18px] text-outline">search</span>
        <input
          className="w-full h-8 pl-9 pr-12 text-sm bg-surface-container-low border border-outline-variant/60 rounded focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white text-on-surface transition-all placeholder:text-outline font-body-md"
          placeholder="Tìm nông dân, đơn hàng, vật tư (NPK, giống, thuốc BVTV)..."
          type="text"
        />
        <kbd className="absolute right-2 top-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/60 rounded select-none">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-space-md">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low/60 border border-outline-variant/60 rounded text-on-surface font-label-md text-label-md">
          <span className="material-symbols-outlined text-[18px] text-primary">warehouse</span>
          <span className="font-medium text-xs">Đại lý vật tư nông nghiệp</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="w-8 h-8 flex items-center justify-center rounded border border-transparent hover:border-outline-variant/60 hover:bg-surface-container-low text-on-surface-variant transition-colors"
            title="VietQR Quick Scanner"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded border border-transparent hover:border-outline-variant/60 hover:bg-surface-container-low text-on-surface-variant relative transition-colors"
            title="Thông báo hệ thống"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-error ring-2 ring-white"></span>
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded border border-transparent hover:border-outline-variant/60 hover:bg-surface-container-low text-on-surface-variant transition-colors"
            title="Đăng xuất"
            type="button"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
