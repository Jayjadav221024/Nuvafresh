import mongoose from 'mongoose';

const goKwikWebhookEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true, index: true },
    gokwikOrderId: { type: String, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    signature: { type: String },
    status: {
      type: String,
      enum: ['Success', 'Failed', 'Ignored', 'Duplicate'],
      default: 'Success'
    },
    errorMessage: { type: String, default: '' },
    processedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('GoKwikWebhookEvent', goKwikWebhookEventSchema);
