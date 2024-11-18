const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config({ path: "./config/config.env" });
const { DetectIp, MainEnc } = require("../utils/devicefuncs");

module.exports = {
  formatAmount: (amount) => {
    // Convert the amount to a string with two decimal places
    const amountStr = (amount * 100).toFixed(0); // Multiplies by 100 to account for cents and removes decimal

    // Pad with leading zeros to ensure the length is 13
    const formattedAmount = amountStr.padStart(13, '0');

    return formattedAmount;
  },

  setJwt: (UserInfo, req) => {
    // let device = await DetectDevice(req.headers['user-agent'], req)
    let userIp = DetectIp(req);
    // UserInfo.devcrb = device
    UserInfo.devirb = userIp;
    let EncUserInfo = MainEnc(UserInfo); //encrypt entire user information
    const accessToken = jwt.sign(
      { EncUserInfo },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24hrs" }
    );

    // // Create token and share
    return accessToken;
  },
};
