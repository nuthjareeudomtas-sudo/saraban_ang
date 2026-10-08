export type RoleCode = 
  | 'citizen'
  | 'staff'
  | 'central_registry'
  | 'dept_head'
  | 'technician'
  | 'hr_admin'
  | 'executive'
  | 'super_admin';

export interface User {
  id: string;
  username: string;
  prefix: string;
  firstName: string;
  lastName: string;
  position: string;
  departmentId: string;
  departmentName: string;
  role: RoleCode;
  email: string;
  phone: string;
  isFirstLogin: boolean;
  status: 'active' | 'suspended';
  avatar?: string;
  modules: {
    centralRegistry: boolean;
    deptRegistry: boolean;
    repairDispatch: boolean;
    permitReview: boolean;
    permitApprove: boolean;
    leaveReview: boolean;
    leaveApprove: boolean;
    hrManagement: boolean;
    cmsAdmin: boolean;
  };
}

export interface Department {
  id: string;
  code: string;
  name: string;
  shortName: string;
  headName: string;
}

export type DocumentType = 'incoming' | 'outgoing' | 'internal' | 'order';
export type UrgencyLevel = 'normal' | 'urgent' | 'very_urgent' | 'most_urgent';
export type SecretLevel = 'normal' | 'confidential' | 'secret' | 'top_secret';
export type DocStatus = 
  | 'central_received'
  | 'dispatched_to_dept'
  | 'dept_received'
  | 'head_reviewing'
  | 'endorsed'
  | 'archived';

export interface DocumentAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface DocumentAuditLog {
  id: string;
  documentId: string;
  action: string;
  detail: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
}

export interface EDocument {
  id: string;
  docType: DocumentType;
  bookNumber: string; // เลขที่หนังสือ
  receiveNumber: string; // เลขที่รับ (เช่น 0142/2569)
  fiscalYear: number;
  subject: string;
  sourceAgency: string; // จากหน่วยงาน
  destinationDeptId: string; // เสนอไปที่กอง
  recipient?: string; // ส่งถึง / เสนอถึง (เว้นว่างไว้ให้กรอกอิสระ)
  urgency: UrgencyLevel;
  secretLevel: SecretLevel;
  registeredDate: string;
  registeredBy: string;
  currentStatus: DocStatus;
  currentDeptName: string;
  attachments: DocumentAttachment[];
  history: DocumentAuditLog[];
}

export type RepairCategory = 
  | 'street' 
  | 'electricity' 
  | 'water' 
  | 'drainage' 
  | 'office_equipment' 
  | 'building';

export type RepairUrgency = 'normal' | 'urgent' | 'most_urgent';
export type RepairStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface RepairMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface RepairRequest {
  id: string;
  ticketId: string; // เช่น RP-2569-0012
  channel: 'public' | 'internal';
  citizenName?: string;
  citizenPhone?: string;
  reporterName?: string;
  reporterDept?: string;
  category: RepairCategory;
  categoryLabel: string;
  title: string;
  description: string;
  location: string;
  villageMoo?: string;
  lat: number;
  lng: number;
  urgency: RepairUrgency;
  status: RepairStatus;
  createdAt: string;
  assignedTo?: string;
  assignedDept?: string;
  beforeImages: string[];
  afterImages: string[];
  materialsUsed: RepairMaterial[];
  technicianNotes?: string;
  completedAt?: string;
  lineNotified?: boolean;
  pdpaConsent?: boolean;
}

export interface PermitFieldConfig {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface PermitType {
  id: string;
  code: string;
  name: string;
  description: string;
  responsibleDept: string;
  processingDays: number;
  fee: number;
  isActive: boolean;
  requiredDocuments: string[];
  fields: PermitFieldConfig[];
}

export type PermitStatus = 'submitted' | 'step1_reviewed' | 'approved' | 'rejected';

export interface PermitRequest {
  id: string;
  applicationNo: string; // เช่น PM-2569-0045
  permitTypeId: string;
  permitTypeName: string;
  citizenName: string;
  citizenIdCard: string;
  citizenPhone: string;
  citizenAddress: string;
  formData: Record<string, any>;
  attachedDocs: { name: string; uploaded: boolean }[];
  status: PermitStatus;
  submittedAt: string;
  step1Reviewer?: string;
  step1Comment?: string;
  step1ApprovedAt?: string;
  step2Reviewer?: string; // ปลัด / นายก
  step2Comment?: string;
  step2ApprovedAt?: string;
  electronicLicenseNo?: string;
  pdpaConsent?: boolean;
}

export type LeaveType = 'vacation' | 'sick' | 'personal' | 'maternity' | 'ordination';

export interface LeaveQuota {
  userId: string;
  fiscalYear: number;
  vacation: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  personal: { total: number; used: number; remaining: number };
}

export type LeaveStatus = 'pending' | 'head_approved' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  requestNo: string;
  userId: string;
  userName: string;
  userPosition: string;
  userDept: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  contactAddress?: string;
  contactPhone?: string;
  contactPhoneDuringLeave: string; // ระหว่างลาสามารถติดต่อได้ที่เบอร์
  status: LeaveStatus;
  submittedAt: string;
  headReviewer?: string;
  headComment?: string;
  headApprovedAt?: string;
  executiveReviewer?: string;
  executiveComment?: string;
  approvedAt?: string;
}

export interface DutyOfficer {
  id: string;
  date: string; // YYYY-MM-DD
  shiftType: 'day_guard' | 'night_guard' | 'emergency_standby' | 'complaint_receiver';
  shiftLabel: string;
  timeRange: string; // เช่น "08:30 - 16:30 น." หรือ "16:30 - 08:30 น."
  officerId: string;
  officerName: string;
  position: string;
  department: string;
  phone: string;
  backupPhone?: string;
  avatar?: string;
  // Second officer for 2-officer requirement on weekdays and weekends
  secondOfficerId?: string;
  secondOfficerName?: string;
  secondOfficerPosition?: string;
  secondOfficerDepartment?: string;
  secondOfficerPhone?: string;
  secondOfficerAvatar?: string;
  notes?: string;
}

export interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  type: 'meeting' | 'community' | 'holiday' | 'training';
  startDate: string;
  endDate: string;
  location: string;
  department: string;
}

export interface SiteSettings {
  saoName: string;
  province: string;
  district: string;
  subdistrict: string;
  zipcode?: string;
  fiscalYear: number;
  address: string;
  phone: string;
  emergencyHotline: string;
  email?: string;
  website?: string;
  logoUrl?: string; // ตราสัญลักษณ์ อบต.
  announcementText: string;
  lineNotifyGroup: string;
  lineNotifyTokenConfigured: boolean;
  // Customizable System Section Titles (Admin can edit freely)
  edocTitle?: string;
  repairTitle?: string;
  permitTitle?: string;
  leaveTitle?: string;
  calendarTitle?: string;
  publicPortalSlogan?: string;
  primaryColorTheme?: 'fuchsia_pink' | 'royal_magenta' | 'rose_gold';
}
