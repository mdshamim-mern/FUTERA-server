// Node-only persistence definitions; the storefront imports through server-only repositories.
// Kept free of Next's server-only marker so the Node seed CLI can use the same validators.
import mongoose, { Schema } from "mongoose";
import { categoryCodes, categorySchema, productSchema, specSchemas } from "../../features/products/schema.ts";

const categoryModelSchema = new Schema({
  slug: { type: String, required: true, enum: categoryCodes },
  name: { type: String, required: true }, description: { type: String, required: true },
  sortOrder: { type: Number, required: true }, active: { type: Boolean, required: true }, isSample: { type: Boolean, required: true },
}, { timestamps: true, strict: "throw", autoIndex: false });
categoryModelSchema.index({ slug: 1 }, { unique: true });
categoryModelSchema.index({ active: 1, sortOrder: 1 });
categoryModelSchema.pre("validate", function () {
  const { _id, __v, createdAt, updatedAt, ...data } = this.toObject();
  void [_id, __v, createdAt, updatedAt];
  const result = categorySchema.safeParse(data);
  if (!result.success) this.invalidate("slug", "Category does not match the catalog schema.");
});

const productModelSchema = new Schema({
  slug: { type: String, required: true }, sku: { type: String, required: true },
  name: { type: String, required: true }, brand: { type: String, required: true },
  category: { type: String, enum: categoryCodes, required: true },
  description: { type: String, required: true },
  isReference: {type:Boolean}, sourceUrl: {type:String}, reviewedAt: {type:String},
  priceMinor: { type: Number, min: 0, required: true }, stock: { type: Number, min: 0, required: true },
  active: { type: Boolean, required: true }, isSample: { type: Boolean, required: true }, featured: { type: Boolean, required: true },
  images: { type: [{ _id: false, src: { type: String, required: true }, alt: { type: String, required: true } }], required: true },
  // Mixed storage is constrained by category-specific strict Zod specs on validation.
  // Catalog writes must use document.save(), not unvalidated update operators.
  specs: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true, strict: "throw", autoIndex: false });
productModelSchema.pre("validate", function () {
  const { _id, __v, createdAt, updatedAt, ...data } = this.toObject();
  void [_id, __v, createdAt, updatedAt];
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) this.invalidate("specs", "Product fields or category-specific specs are invalid.");
  if (!specSchemas[this.category].safeParse(this.specs).success) this.invalidate("specs", "Specs do not match category.");
});
productModelSchema.index({ slug: 1 }, { unique: true });
productModelSchema.index({ sku: 1 }, { unique: true });
productModelSchema.index({ active: 1, category: 1, priceMinor: 1, slug: 1 });
productModelSchema.index({ active: 1, brand: 1, priceMinor: 1 });
productModelSchema.index({ active: 1, priceMinor: 1, slug: 1 });
productModelSchema.index({ active: 1, stock: 1 });
productModelSchema.index({ name: "text", brand: "text", description: "text" }, { weights: { name: 10, brand: 5, description: 1 }, name: "catalog_text" });

export const CategoryModel = mongoose.models.Category ?? mongoose.model("Category", categoryModelSchema);
export const ProductModel = mongoose.models.Product ?? mongoose.model("Product", productModelSchema);
