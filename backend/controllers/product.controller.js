import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({
      products,
    });
  } catch (error) {
    console.log("Error in getAllProducts", error.message);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json({
        featuredProducts: JSON.parse(featuredProducts),
      });
    }

    //if not in redis featch from mongo
    // .lean() returns plan js object instead of mongo obj
    featuredProducts = await Product.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      return res.status(404).json({
        message: "No Featured Products found",
      });
    }

    //store in redis
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
