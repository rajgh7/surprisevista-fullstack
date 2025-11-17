// backend/models/Blog.js
import mongoose from "mongoose";
import slugify from "slugify";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String },
    content: { type: String }, // store HTML or markdown
    author: { type: String, default: "SurpriseVista" },
    coverImage: { type: String }, // path to uploaded image
    tags: [{ type: String }],
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// create slug pre-save if missing or title changed
BlogSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  } else if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
