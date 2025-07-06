export const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accesstoken", accessToken, {
    httpOnly: true, //prevents XSS attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", //prevent CSRF attacks
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshtoken", refreshToken, {
    httpOnly: true, //prevents XSS attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", //prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
