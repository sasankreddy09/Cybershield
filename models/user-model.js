const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    googleId: { type: String, required: true, unique: true }, // ✅ Ensure uniqueness
    email: { type: String, required: true, unique: true }, // ✅ Added email
    thumbnail: { type: String, default: "" }, // ✅ Default empty string if no profile picture
  },
  { timestamps: true } // ✅ Adds createdAt & updatedAt
);

const User = mongoose.model("User", userSchema); // ✅ Changed model name to 'User' (capitalized)
module.exports = User;
