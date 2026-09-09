export type Role = 'ADMIN' | 'TECHNICIAN' | 'VIEWER';
export interface User { id: string; name: string; email: string; role: Role }
export interface Session { user: User; csrfToken: string }
export interface PlanTask { id: string; code: string; description: string; frequency: number; mandatory: boolean; blocking: boolean; sourceType: string; sourceReference: string; partId?: string; quantity?: number }
export interface Plan { id: string; code: string; name: string; revision: number; status: string; tasks: PlanTask[] }
export interface Asset { id: string; code: string; name: string; family: string; meter: number; operatingStatus: string; planId?: string; plan?: Plan }
export interface Part { id: string; code: string; name: string; partNumber: string; unit: string; onHand: number; reserved: number; available: number }
export interface OrderTask extends PlanTask { status: 'PENDING' | 'DONE' | 'DEFERRED' | 'NA'; deferredReason?: string; deferredUntil?: string; deferredBy?: string }
export interface OrderMaterial { id: string; partId: string; part: {code: string; name: string; partNumber: string; unit: string}; quantityPlanned: number; quantityReserved: number; quantityUsed: number; shortage: number }
export interface Checkpoint { id: string; code: string; label: string; critical: boolean; result: 'PENDING' | 'PASS' | 'FAIL' | 'NA' }
export interface Audit { id: string; createdAt: string; actorName: string; action: string; entityId: string; details: unknown }
export interface Order { id: string; code: string; status: string; targetMeter: number; actualMeter: number; createdAt: string; closedAt?: string; asset: Asset; plan: { id: string; name: string; revision: number }; tasks: OrderTask[]; materials: OrderMaterial[]; checkpoints: Checkpoint[]; audit?: Audit[]; nextServiceMeter?: number }
export interface Dashboard { assets: number; openOrders: number; overdue: number; lowStock: number }
export interface Version { version: string; commit: string; environment: string }
export interface AppData { dashboard: Dashboard; assets: Asset[]; plans: Plan[]; inventory: Part[]; orders: Order[]; audit: Audit[]; version: Version }
