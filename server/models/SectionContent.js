import mongoose from 'mongoose';

const sectionSchemaDefinition = new mongoose.Schema(
  {
    sectionKey: { type: String, required: true, unique: true, index: true },
    page: { type: String, required: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    fieldsSchema: [
      {
        name: { type: String, required: true },
        label: { type: String, required: true },
        type: { type: String, enum: ['text', 'textarea', 'image', 'video', 'repeatable-group'], required: true },
        helperText: { type: String },
        subFields: [
          {
            name: { type: String, required: true },
            label: { type: String, required: true },
            type: { type: String, enum: ['text', 'textarea', 'image', 'video'], default: 'text' },
            helperText: { type: String }
          }
        ]
      }
    ],
    defaultFields: { type: mongoose.Schema.Types.Mixed, default: {} },
    fields: { type: mongoose.Schema.Types.Mixed, default: {} },
    isEdited: { type: Boolean, default: false },
    updatedBy: { type: String, default: 'System Seed' },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('SectionContent', sectionSchemaDefinition);
