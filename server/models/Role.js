import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, default: '' },
    usersCount: { type: Number, default: 0 },
    // The admin screens this role is allowed to open.
    screens: { type: [String], default: [] },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Role', roleSchema);
