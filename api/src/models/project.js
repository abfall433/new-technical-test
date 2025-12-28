const mongoose = require("mongoose");

const MODELNAME = "project";

const Schema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },

  budget: {
    total: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
  },
  
  status: { type: String, enum: ["ok", "warning", "out_of_budget"], default: "ok" },
  threshold: { type: Number, default: 0.8 },
}, {
  timestamps: true
});

Schema.pre('save', function(next) {
  if (this.isNew && this.budget.total) {
    this.budget.remaining = this.budget.total;
  }
  next();
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
