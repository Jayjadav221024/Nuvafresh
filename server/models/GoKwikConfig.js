import mongoose from 'mongoose';

const goKwikConfigSchema = new mongoose.Schema(
  {
    merchantId: { type: String, default: '' },
    apiKey: { type: String, default: '' },
    apiSecret: { type: String, default: '' },
    environment: {
      type: String,
      enum: ['sandbox', 'production'],
      default: 'sandbox'
    },
    isCheckoutEnabled: { type: Boolean, default: false },

    // COD Settings
    cod: {
      enabled: { type: Boolean, default: true },
      verificationRequired: { type: Boolean, default: false },
      orderLimit: { type: Number, default: 10000 },
      minCartValue: { type: Number, default: 199 },
      maxCartValue: { type: Number, default: 5000 },
      codFee: { type: Number, default: 0 },
      prepaidDiscountPercent: { type: Number, default: 5 },
      enableOtpVerification: { type: Boolean, default: true }
    },

    // RTO & Risk Settings
    rto: {
      protectionEnabled: { type: Boolean, default: true },
      codRiskCheck: { type: Boolean, default: true },
      highRiskAction: {
        type: String,
        enum: ['Allow Order', 'Require Verification', 'Disable COD', 'Allow Prepaid Only'],
        default: 'Allow Prepaid Only'
      },
      mediumRiskAction: {
        type: String,
        enum: ['Allow Order', 'Require Verification', 'Disable COD', 'Allow Prepaid Only'],
        default: 'Require Verification'
      },
      lowRiskAction: {
        type: String,
        enum: ['Allow Order', 'Require Verification', 'Disable COD', 'Allow Prepaid Only'],
        default: 'Allow Order'
      }
    },

    // Webhook Configuration
    webhookSecret: { type: String, default: '' },
    lastConnectionTest: {
      status: { type: String, enum: ['Success', 'Failed', 'Untested'], default: 'Untested' },
      message: { type: String, default: '' },
      testedAt: { type: Date }
    }
  },
  { timestamps: true }
);

export default mongoose.model('GoKwikConfig', goKwikConfigSchema);
