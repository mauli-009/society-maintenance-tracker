import mongoose from "mongoose";
import bcrypt from "bcryptjs";





const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never return password by default in queries
    },
    role: {
      type: String,
      enum: ["resident", "admin"],
      default: "resident",
    },
    flatNumber: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);


userSchema.pre("save", async function () {
  // If the password hasn't been modified, just return to proceed
  if (!this.isModified("password")) return;
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare entered password with hashed one
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;