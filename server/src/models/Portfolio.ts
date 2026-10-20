import mongoose, { Schema } from 'mongoose';

const PortfolioSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  payload: { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export const PortfolioModel = mongoose.models.Portfolio ?? mongoose.model('Portfolio', PortfolioSchema);
