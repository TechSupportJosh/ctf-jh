import argon2 from "argon2";

export const hashPassword = async (password: string) => {
  try {
    // Memory cost from OWASP's cheat sheet
    // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 16384, // 16MiB
    });
  } catch (err) {
    console.error("Error occured when attempting to hash password: ", err);
    return null;
  }
};

export const verifyPassword = async (password: string, hash: string) => {
  try {
    if (await argon2.verify(hash, password)) {
      return true;
    }
  } catch (err) {
    console.error("Error occured when attempting to verify password: ", err);
  }
  return false;
};
