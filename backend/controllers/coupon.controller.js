import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    if (coupons.length == 0) {
      return res.status(404).json({
        message: "Sorry! Coupons not available at this moment",
      });
    }

    res.json({
      coupons,
    });
  } catch (error) {
    console.log("Error in getCoupon Controller", error.message);
    res.status(500).json({
      message: "Some Internal server error occurred",
      error: error.message,
    });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ couponCode: code, isActive: true });
    if (!coupon) {
      return res.status(404).json({
        message: "No coupon found",
      });
    }

    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(404).json({
        message: "Coupon expired",
      });
    }

    res.json({
      message: "Coupon is valid",
      couponCode: code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    console.log("Error in validateCoupon controller", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const createnewCoupon = async (req, res) => {
  try {
    const { couponCode, discountPercentage, expirationDate, minAmount } =
      req.body;
    if (
      !couponCode ||
      discountPercentage === undefined ||
      !expirationDate ||
      minAmount === undefined
    ) {
      return res.status(400).json({
        message: "Some missing fields. Please provide all the fields below",
        couponCode,
        discountPercentage,
        expirationDate,
        minAmount,
      });
    }

    const coupon = await Coupon.create({
      couponCode,
      discountPercentage,
      expirationDate,
      minAmount: minAmount * 100,
    });

    res.status(200).json({
      message: "Coupon created Successfully",
      coupon,
    });
  } catch (error) {
    console.log("Error in creating coupon", error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Coupon code already exists",
      });
    }
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
