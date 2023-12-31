import * as authDao from "../models/authDao";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (name, email, password) => {
  try {
    const validateEmail = new RegExp(
      /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/
    );

    if (!validateEmail.test(email)) {
      throw new Error("Invalid email formet.");
    }

    const user = await authDao.getUserByEmail(email);

    if (user) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await authDao.signup(name, email, hashedPassword);
  } catch (error) {
    throw new Error("Something went wrong");
  }
};

export const login = async (email, password) => {
  try {
    const user = await authDao.getUserByEmail(email);

    if (!user) {
      throw new Error("User not exists");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid password");
    }

    const name = user.name;
    const userCode = user.id;
    const token = jwt.sign({ name, userCode }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return token;
  } catch (error) {
    throw new Error("Something went wrong");
  }
};

export const deleteUser = async (userId) => {
  try {
    await authDao.deleteUser(userId);
  } catch (error) {
    throw new Error("Something went wrong");
  }
};

export const editUser = async (newName, newEmail, newPassword, userId) => {
  try {
    const emailDuplication = await authDao.getUserByEmail(newEmail);

    if (emailDuplication) {
      throw new Error("Email already exists");
    }

    const user = await authDao.getUserById(userId);

    if (newPassword !== undefined && newPassword.length !== 0) {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
    }

    if (newEmail !== undefined && newEmail.length !== 0) {
      user.email = newEmail;
    }

    if (newName !== undefined && newName.length !== 0) {
      user.name = newName;
    }

    await authDao.editUser(user);
  } catch (error) {
    throw new Error("Something went wrong");
  }
};
