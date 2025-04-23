import argon2 from "argon2";

export class PasswordService {
  hashPassword = async (password: string) => {
    return argon2.hash(password);
  };

  comparePassword = async (password: string, hashedPassword: string) => {
    return argon2.verify(hashedPassword, password);
  };
}
