import mongoose from 'mongoose';

/* When a report was last opened, and by whom. The report catalogue itself is
   defined in code — these are the only facts about it that are not. */
const reportViewSchema = new mongoose.Schema(
  {
    reportId: { type: String, required: true, unique: true, index: true },
    lastViewedAt: { type: Date, default: Date.now },
    lastViewedBy: { type: String, default: '' },
    viewCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('ReportView', reportViewSchema);
