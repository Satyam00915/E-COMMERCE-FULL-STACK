import { createStripeCoupon } from "../lib/createStripeCoupon.js";
import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length == 0) {
      return res.status(400).json({
        error: "Invalid or empty products array",
      });
    }

    let totalAmount = 0;
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100);
      totalAmount += amount * product.quantity;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
      };
    });

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        couponCode,
        isActive: true,
        expirationDate: { $gte: new Date() },
      });
      if (
        coupon &&
        !coupon.userIsUsed.includes(req.user._id) &&
        totalAmount >= coupon.minAmount
      ) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      } else {
        coupon = null;
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: coupon ? couponCode : "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    res.status(200).json({
      sessionId: session.id,
      totalAmount: totalAmount / 100,
    });
  } catch (error) {
    console.log("Error in creating checkout session", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const createSuccessSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          { couponCode: session.metadata.couponCode },
          {
            $addToSet: { userIsUsed: session.metadata.userId },
          }
        );
      }

      //create a new order
      const products = JSON.parse(session.metadata.products);
      const newOrder = await Order.create({
        user: session.metadata.userId,
        products: products.map((p) => ({
          product: p._id,
          quantity: p.quantity,
          price: p.price,
        })),
        totalAmount: session.amount_total / 100,
        stripeSessionId: sessionId,
      });
      res.status(200).json({
        success: true,
        message: "Payment successful , order created, and coupon used",
        orderId: newOrder._id,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Payment was not completed",
      });
    }
  } catch (error) {
    console.log("Error in processing successful checkout", error);
    res.status(500).json({
      message: "Error processing successful checkout",
      error: error.message,
    });
  }
};
