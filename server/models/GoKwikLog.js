import mongoose from 'mongoose';

const goKwikLogSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    type: {
      type: String,
      enum: ['API_REQUEST', 'WEBHOOK', 'CONFIG_CHANGE', 'CONNECTION_TEST', 'CHECKOUT', 'ERROR'],
      default: 'API_REQUEST'
    },
    status: {
      type: String,
      enum: ['Success', 'Failed', 'Warning', 'Info'],
      default: 'Success'
    },
    referenceId: { type: String, default: '' },
    details: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '' },
    author: { type: String, default: 'System' }
  },
  { timestamps: true }
);

export default mongoose.model('GoKwikLog', goKwikLogSchema);
