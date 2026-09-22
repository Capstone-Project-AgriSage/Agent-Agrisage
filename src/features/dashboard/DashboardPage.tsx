import { usePageHeader } from '../../context/PageHeaderContext'
import { Calendar, DollarSign, Briefcase, Download, ChevronDown, MoreVertical, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import NewLeadsChart from './components/NewLeadsChart'
import ProposalsSentChart from './components/ProposalsSentChart'
import RevenueGrowthChart from './components/RevenueGrowthChart'
import LeadsBySourceChart from './components/LeadsBySourceChart'
import RevenueVsTargetChart from './components/RevenueVsTargetChart'
import SalesPipelineChart from './components/SalesPipelineChart'
import { revenueByRegionData, actionItemsData } from './mockSalesData'

import { orders as ALL_ORDERS } from '../../data/mockOrders'
import { debtCustomers as ALL_DEBT_CUSTOMERS } from '../../data/mockDebts'
import { parseVnd, formatVnd } from '../../utils/money'

export default function DashboardPage() {
  usePageHeader({
    title: 'Tổng Quan Bán Hàng',
  })

  // KPI Calculations
  const totalRevenue = ALL_ORDERS.reduce((sum, o) => sum + parseVnd(o.total), 0)
  const debtHouseholds = ALL_DEBT_CUSTOMERS.filter((c) => parseVnd(c.remaining) > 0)
  const totalDebtRemaining = debtHouseholds.reduce((sum, c) => sum + parseVnd(c.remaining), 0)
  const todayOrders = ALL_ORDERS.filter(o => o.timeRest === 'Hôm nay')
  
  // New KPIs for Phase 3
  const pendingOrdersCount = ALL_ORDERS.filter(o => o.statusBadge.label === 'Đang xử lý').length
  const pendingVietQrCount = 2 // Mock value for PENDING_VERIFICATION
  const pendingAiReviewsCount = 5 // Mock value for AI cases
  const lowStockCount = 8 // Mock value for Low Stock products
  const activeDeliveriesCount = 3 // Mock value for delivering trips


  return (
    <div className="space-y-4 pb-12">
      {/* 1. TOP METRICS ROW */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: New Leads -> Đơn hàng hôm nay */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Đơn Hàng Hôm Nay</h3>
            <p className="text-xs text-slate-500">Toàn bộ chi nhánh</p>
          </div>
          <NewLeadsChart />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-xl font-bold text-slate-900">{todayOrders.length}</span>
            <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">+15.2%</span>
          </div>
        </div>

        {/* Card 2: Proposals Sent -> Công Nợ Thu Hồi */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Tiến Độ Thu Nợ</h3>
            <p className="text-xs text-slate-500">Trong tháng</p>
          </div>
          <ProposalsSentChart />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <span className="text-xl font-bold text-transparent">0</span>
            <span className="text-xs font-semibold text-transparent">0</span>
          </div>
        </div>

        {/* Card 3: Revenue -> Doanh Thu */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-50 text-emerald-500 rounded-md flex items-center justify-center">
             <DollarSign size={18} />
           </div>
           <div>
            <h3 className="text-sm font-semibold text-slate-900 mt-8">Tổng Doanh Thu</h3>
            <p className="text-xs text-slate-500">Tất cả đơn hàng</p>
           </div>
           <div className="mt-4">
             <span className="text-2xl font-bold text-slate-900">{formatVnd(totalRevenue)}</span>
           </div>
           <div className="mt-auto pt-4">
             <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">+12.5%</span>
           </div>
        </div>

        {/* Card 4: Projects Won -> Khách Hàng Nợ */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-4 right-4 w-8 h-8 bg-rose-50 text-rose-500 rounded-md flex items-center justify-center">
             <Briefcase size={18} />
           </div>
           <div>
            <h3 className="text-sm font-semibold text-slate-900 mt-8">Công Nợ Tồn Đọng</h3>
            <p className="text-xs text-slate-500">{debtHouseholds.length} hộ chưa thanh toán</p>
           </div>
           <div className="mt-4">
             <span className="text-2xl font-bold text-slate-900">{formatVnd(totalDebtRemaining)}</span>
           </div>
           <div className="mt-auto pt-4">
             <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">-5.2%</span>
           </div>
        </div>

        {/* Card 5: Revenue Growth */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Biểu Đồ Doanh Thu</h3>
            <p className="text-xs text-slate-500">Theo các tháng trong năm</p>
          </div>
          <RevenueGrowthChart />
          <div className="mt-2 text-xs font-medium text-slate-500">
            Tăng trưởng +35% so với năm ngoái
          </div>
        </div>
      </section>

      {/* NEW SECTION: Alerts & Pending Actions */}
      <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">Cần Xử Lý & Cảnh Báo</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
            <div className="text-xs font-semibold text-amber-700">Đơn chờ xử lý</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">{pendingOrdersCount}</div>
          </div>
          <div className="p-3 border border-indigo-200 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors">
            <div className="text-xs font-semibold text-indigo-700">Thanh toán VietQR chờ</div>
            <div className="text-2xl font-bold text-indigo-900 mt-1">{pendingVietQrCount}</div>
          </div>
          <div className="p-3 border border-purple-200 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
            <div className="text-xs font-semibold text-purple-700">Ca AI chờ review</div>
            <div className="text-2xl font-bold text-purple-900 mt-1">{pendingAiReviewsCount}</div>
          </div>
          <div className="p-3 border border-rose-200 bg-rose-50 rounded-lg cursor-pointer hover:bg-rose-100 transition-colors">
            <div className="text-xs font-semibold text-rose-700">Sản phẩm sắp hết hàng</div>
            <div className="text-2xl font-bold text-rose-900 mt-1">{lowStockCount}</div>
          </div>
          <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
            <div className="text-xs font-semibold text-blue-700">Đang giao hàng</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{activeDeliveriesCount}</div>
          </div>
        </div>
      </section>

      {/* 2. CHARTS ROW 1 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leads by Source -> Nguồn Đơn Hàng */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Nguồn Khách Hàng</h3>
          <LeadsBySourceChart />
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
             <button className="flex-1 py-1.5 text-xs font-semibold border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50">Xem Chi Tiết</button>
             <button className="flex-1 py-1.5 text-xs font-semibold border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50">Tải CSV</button>
          </div>
        </div>

        {/* Project Revenue vs Target -> Doanh thu theo SP */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Doanh Thu Sản Phẩm vs Chỉ Tiêu</h3>
          <RevenueVsTargetChart />
        </div>
      </section>

      {/* 3. CHARTS ROW 2 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sales Pipeline -> Phễu đơn hàng */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Tiến Trình Xử Lý Đơn</h3>
          <SalesPipelineChart />
        </div>

        {/* Sales by Region -> Doanh Thu Khu Vực */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Doanh Thu Theo Khu Vực</h3>
          <p className="text-xs text-slate-500 mt-1">Tổng cộng 823,500,000 ₫</p>
          
          <div className="flex flex-col gap-4 mt-6">
            {revenueByRegionData.map(region => (
              <div key={region.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end text-xs">
                  <span className="font-semibold text-slate-900">{region.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{formatVnd(region.revenue)}</span>
                    <span className={`font-semibold ${region.growth > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {region.growth > 0 ? '+' : ''}{region.growth}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${region.percentage}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-500 w-6 text-right">{region.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            Theo dõi 5 quận/huyện - 3 khu vực tăng trưởng
          </div>
        </div>

        {/* Action Items -> Công việc cần làm */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Công Việc Cần Xử Lý</h3>
          <div className="flex flex-col gap-3">
            {actionItemsData.map(item => (
              <div key={item.id} className="border border-slate-100 rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <input type="checkbox" defaultChecked={item.completed} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${item.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{item.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        item.priority === 'High' ? 'bg-rose-50 text-rose-600' : 
                        item.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                      <Calendar size={12} />
                      {item.due}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-4">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Đơn Hàng Gần Đây</h2>
            <p className="text-xs text-slate-500 mt-0.5">Theo dõi và quản lý các đơn hàng nông nghiệp mới nhất.</p>
          </div>
          <div className="flex gap-2">
             <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50">
               <ChevronDown size={14} /> Chế Độ Xem
             </button>
             <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50">
               <Download size={14} /> Xuất File
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500">
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="py-3 px-4 whitespace-nowrap">Mã Đơn</th>
                <th className="py-3 px-4 whitespace-nowrap">Khách Hàng</th>
                <th className="py-3 px-4 min-w-[200px]">Sản Phẩm</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Trạng Thái</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Tổng Tiền</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Thanh Toán</th>
                <th className="py-3 px-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {ALL_ORDERS.slice(0, 10).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-500 whitespace-nowrap">{order.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{order.customerName}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{order.shortLocation}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 line-clamp-2">{order.productLine}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${
                      order.statusBadge.label === 'Hoàn thành' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                      order.statusBadge.label === 'Đang giao' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                      order.statusBadge.label === 'Đang xử lý' ? 'border-indigo-200 text-indigo-700 bg-indigo-50' :
                      'border-amber-200 text-amber-700 bg-amber-50'
                    }`}>
                      {order.statusBadge.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 text-center whitespace-nowrap">
                    {order.total}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-medium border ${
                      order.paymentBadge.label.includes('Gối nợ') ? 'border-red-200 text-red-700 bg-white' :
                      order.paymentBadge.label.includes('Cọc') ? 'border-amber-200 text-amber-700 bg-white' :
                      'border-slate-200 text-slate-600 bg-white'
                    }`}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600 p-1">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
           <span>0 trong {ALL_ORDERS.length} dòng được chọn.</span>
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <span>Số dòng mỗi trang</span>
               <select className="border border-slate-200 rounded px-1 py-0.5 bg-white text-xs">
                 <option>10</option>
                 <option>20</option>
               </select>
             </div>
             <span>Trang 1 / 2</span>
             <div className="flex gap-1">
               <button className="p-1 border border-slate-200 rounded text-slate-400 hover:text-slate-600 bg-white">
                 <ChevronsLeft size={16} />
               </button>
               <button className="p-1 border border-slate-200 rounded text-slate-400 hover:text-slate-600 bg-white">
                 <ChevronLeft size={16} />
               </button>
               <button className="p-1 border border-slate-200 rounded text-slate-600 hover:text-slate-900 bg-white">
                 <ChevronRight size={16} />
               </button>
               <button className="p-1 border border-slate-200 rounded text-slate-600 hover:text-slate-900 bg-white">
                 <ChevronsRight size={16} />
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
