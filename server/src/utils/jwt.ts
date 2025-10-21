import jwt from "jsonwebtoken";

// Short-lived token used to authenticate API requests.
export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: "15m",
  });
};

// Long-lived token used only to obtain a new Access Token.
export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: "7d",
  });
};
