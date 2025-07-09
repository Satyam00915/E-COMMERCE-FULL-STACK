import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import { updateFeaturedProductsCache } from "../lib/updateRedisCache.js";
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

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image: cloudinaryResponse.secure_url || "",
    });

    return res.status(201).json({
      product,
    });
  } catch (error) {
    console.log("Error in createProduct Controller", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "No Product found with this Id" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("deleted image from cloudinary");
      } catch (error) {
        console.log("Error in cloudinary image", error.message);
      }
    }

    await Product.findByIdAndDelete(productId);

    res.json({
      message: "Product deleted Successfully",
    });
  } catch (error) {
    console.log("Error in Delete Product Controller", error.message);
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate(
      [],
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      }
    );

    res.json({ products });
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category });
    res.json({
      products,
    });
  } catch (error) {
    console.log("Error in getProductsByCategory Controller", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const toggleFeatureProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();

      //update redis
      await updateFeaturedProductsCache();
      return res.json({ updatedProduct });
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
