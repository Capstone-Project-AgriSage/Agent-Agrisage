import type { RowAction } from '../components/ui/RowActionsMenu'

export interface AgentUser {
  name: string
  role: string
  initials: string
  hub: string
}

export interface NavItem {
  label: string
  to: string
  icon: string
  badge?: string
  badgeTone?: 'neutral' | 'primary' | 'error' | 'warning'
  iconTone?: 'default' | 'primary'
}

export interface PageHeaderState {
  title: string
  subtitle?: string
  badge?: string
}

export interface OrderItem {
  name: string
  qtyPrice: string
  total: string
}

export interface Order {
  id: string
  customerName: string
  phone: string
  shortLocation: string
  fullAddress: string
  wardAddress: string
  timeBold?: string
  timeRest: string
  createdAgo: string
  productLine: string
  productTitle: string
  productNote: string
  items: OrderItem[]
  feeLine?: { label: string; value: string }
  total: string
  paymentBadge: { label: string; className: string }
  statusBadge: { label: string; className: string; pulse?: boolean }
  shippingIcon: string
  shippingIconClassName: string
  shippingLabel: string
  shippingLabelTitle?: string
  rowAttentionClassName?: string
  idClassName: string
  panelBadge: { label: string; className: string }
  deliveryNote?: string
  paymentFooterNote: string
  paymentFooterClassName: string
  actions: RowAction[]
}

export interface RecentOrder {
  id: string
  date: string
  note: string
  amount: string
  statusLabel: string
  statusClassName: string
}

export interface AiLog {
  disease: string
  diseaseClassName: string
  confidenceLabel: string
  confidenceBadgeClassName: string
  cardClassName: string
  date: string
  note: string
  noteClassName: string
  dotClassName: string
}

export interface Farmer {
  id: string
  name: string
  initials: string
  verified: boolean
  phone: string
  areaShort: string
  areaTitle: string
  lastOrderId: string
  lastOrderAgo: string
  totalPurchaseLabel: string
  hasDebt: boolean
  debtLabel: string
  debtNote?: string
  debtNoteClassName?: string
  activityDate: string
  activityNote: string
  activityNoteClassName: string
  statusBadge: { label: string; className: string; dotClassName: string }
  fullAddress: string
  joinDate: string
  tenureNote: string
  managedBy: string
  totalOrdersCount: string
  totalPurchaseValue: string
  lastOrderDateNote: string
  lastOrderValue: string
  paidAmount: string
  paidPercent: string
  debtPercent: string
  debtDetail: {
    totalDebt: string
    dueDate: string
    dueNote: string
    riskLabel: string
  }
  recentOrders: RecentOrder[]
  aiLogs: AiLog[]
}

export interface TripItem {
  name: string
  qtyPrice: string
  total: string
}

export interface TripTimelineStep {
  label: string
  time: string
  note: string
  state: 'done' | 'current' | 'pending' | 'failed'
  icon?: string
}

export interface StatusBadge {
  label: string
  className: string
  dotClassName: string
  dotPulseClassName?: string
}

export interface Trip {
  id: string
  orderId: string
  customerName: string
  addressShort: string
  addressTitle: string
  driverName: string
  driverIcon: string
  vehicleLabel: string
  etaLabel: string
  etaClassName: string
  codAmountLabel: string
  codAmountClassName: string
  codBadge: { label: string; className: string }
  statusBadge: StatusBadge
  rowClassName?: string
  failureNote?: string
  actions: RowAction[]
  // Detail panel fields
  customerPhone: string
  customerAddressDetail: string
  customerNote?: { icon: string; text: string; className: string }
  driverInitial: string
  driverPhone: string
  driverRoleLabel: string
  scheduledWindow: string
  timeline: TripTimelineStep[]
  items: TripItem[]
  shippingFeeNote?: { label: string; value: string; valueClassName: string }
  orderTotalLabel: string
  codToCollectLabel: string
  codNote: string
}

export interface FieldInfo {
  farmerName: string
  farmerPhone: string
  plotLabel: string
  plotLocation: string
  varietyLabel: string
  varietyNote: string
  sentTime: string
  sentChannel: string
}

export interface ProductSuggestion {
  name: string
  category: string
  activeIngredient: string
  fitTag: string
  price: string
  priceUnit: string
  stockLabel: string
  stockNote: string
  reasoning: string
}

export interface BoundingBox {
  label: string
  confidence: string
  note: string
}

export interface AiCase {
  id: string
  idClassName: string
  farmerName: string
  farmerLocationLine: string
  imageSrc: string
  imageAlt: string
  imageBorderClassName: string
  imageBlurred?: boolean
  diseaseLabel: string
  diseaseSubLabel: string
  diseaseLabelClassName: string
  confidencePercent: number
  confidenceBarClassName: string
  confidenceTextClassName: string
  confidenceNote: string
  confidenceNoteClassName: string
  productLine?: string
  productSubLine?: string
  stockLabel: string
  stockLabelClassName: string
  statusBadge: { label: string; className: string; dotClassName: string }
  rowClassName?: string
  actionsMode: 'menu' | 'sent' | 'survey'
  actions?: RowAction[]
  // Detail panel
  panelBadge: { label: string; className: string; dotClassName: string }
  field: FieldInfo
  boundingBox?: BoundingBox
  diseaseFullLabel: string
  diseaseLatin?: string
  confidenceFullLabel: string
  confidenceFullClassName: string
  product?: ProductSuggestion
  noProductNote?: string
  defaultAgentNote: string
  agentNote?: string
  rejectReasonLabel?: string
}

export interface RelatedObjectField {
  label: string
  value: string
  sub?: string
}

export interface RelatedLink {
  icon: string
  label: string
  badgeLabel?: string
  badgeClassName?: string
}

export interface RelatedOrder {
  id: string
  dateNote: string
  status: string
  statusClassName: string
  cardClassName: string
  dueNote?: string
  totalNote: string
  remainingLabel: string
  remainingClassName: string
}

export interface DebtPaymentHistoryEntry {
  dotClassName: string
  title: string
  dateNote: string
  amountLabel: string
  amountClassName: string
}

export interface DebtCustomer {
  id: string
  name: string
  cropBadge?: string
  phone: string
  addressShort: string
  totalPurchase: string
  paidAmount: string
  remaining: string
  remainingCellClassName: string
  dueDate: string
  dueDateClassName: string
  overdueDays: string
  overdueDaysClassName: string
  statusBadge: { label: string; className: string; dotClassName: string }
  rowAttentionClassName?: string
  actions: RowAction[]
  // Detail panel fields
  customerCode: string
  landNote: string
  fullAddress: string
  remainingSectionClassName: string
  remainingStatusClassName: string
  remainingAmount: string
  totalDebtLabel: string
  paidLabel: string
  paidPercent: string
  progressBarWidth: string
  dueDetailNote: string
  relatedOrders: RelatedOrder[]
  paymentHistory: DebtPaymentHistoryEntry[]
}

export interface PaymentHistoryEntry {
  icon?: string
  iconClassName?: string
  title: string
  note: string
  amountLabel: string
  amountClassName: string
  cardClassName: string
}

export interface Payment {
  id: string
  orderId: string
  customerName: string
  customerPhone: string
  addressShort: string
  totalAmount: string
  paidAmount: string
  paidAmountClassName: string
  remainingAmount: string
  remainingAmountClassName: string
  methodLabel: string
  methodIcon?: string
  methodIconClassName?: string
  methodClassName: string
  statusBadge: { label: string; className: string; dotClassName: string }
  time: string
  actions: RowAction[]
  // Detail panel
  subtitle: string
  customerNote: string
  goodsNote: string
  collectedLabel: string
  progressWidth: string
  hasRemaining: boolean
  recordedBy: string
  paymentHistory: PaymentHistoryEntry[]
}

export interface Product {
  id: string
  name: string
  discontinued?: boolean
  description: string
  categoryLabel: string
  categoryClassName: string
  price: string
  priceClassName?: string
  stockLabel: string
  stockClassName: string
  stockDotClassName: string
  stockQuantity: string
  businessStatus: string
  rowClassName?: string
  actions: RowAction[]
}

export interface InventoryItem {
  id: string
  name: string
  description: string
  sku: string
  categoryLabel: string
  stockQuantity: string
  stockQuantityClassName?: string
  stockBarClassName: string
  stockBarWidth: string
  stockLabel: string
  stockClassName: string
  stockDotClassName: string
  updatedAgo: string
  updatedBy: string
  rowClassName?: string
  nameClassName?: string
  actions: RowAction[]
}

export interface LogEntry {
  id: string
  time: string
  timeNote?: string
  actorInitials: string
  actorAvatarClassName: string
  actorName: string
  actorRole: string
  moduleLabel: string
  moduleClassName: string
  actionLabel: string
  actionClassName: string
  objectId: string
  description: string
  descriptionNote: string
  resultLabel: string
  resultClassName: string
  resultDotClassName: string
  // Detail panel
  actionTypeLabel: string
  ipDevice: string
  relatedObjects: RelatedObjectField[]
  operationContentHtml: string
  beforeStateLabel: string
  beforeStateClassName: string
  afterStateLabel: string
  afterStateClassName: string
  technicalNote?: string
  relatedLinks: RelatedLink[]
}

export interface ContactRequest {
  id: string
  senderName: string
  senderPhone: string
  senderArea: string
  channel: string
  channelIcon: string
  requestType: string
  message: string
  submittedAgo: string
  statusBadge: { label: string; className: string; dotClassName: string }
  assignedTo?: string
  actions: RowAction[]
}
