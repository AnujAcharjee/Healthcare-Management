import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const hashPassword = async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
};
