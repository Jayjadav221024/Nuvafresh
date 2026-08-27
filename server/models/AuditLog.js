import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    adminEmail: { type: String, required: true },
    adminName: { type: String },
    action: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' },
    userAgent: { type: String },
    status: { type: String, enum: ['Success', 'Failed'], default: 'Success' }
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
