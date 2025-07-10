import User from "../models/user.model.js";

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find(
      (item) => item.product === productId
    );
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }

    await user.save();
    res.json({
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.log("Error in addToCart Controller", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const removeItemFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    user.cartItems = user.cartItems.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();

    res.status(200).json({
      message: "Item removed successfully",
    });
  } catch (error) {
    console.log("Error in removeItemfromCart Controller", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const removeAllItemsFromCart = async (req, res) => {
  try {
    const user = req.user;
    if (user.cartItems.length === 0) {
      return res.status(200).json({
        message: "Cart is already empty",
      });
    }
    user.cartItems = [];
    await user.save();

    res.json({
      message: "All Cart Items removed Successfully",
    });
  } catch (error) {
    console.log("Error in removeAllFromCart Controller", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find(
      (item) => item.product === productId
    );

    if (existingItem) {
      if (quantity == 0) {
        user.cartItems = user.cartItems.filter(
          (item) => item.product !== productId
        );
        await user.save();
        return res.json(user.cartItems);
      }

      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cartItems);
    } else {
      res.status(404).json({
        message: "Item not found",
      });
    }
  } catch (error) {
    console.log("Error in updateQuantity Controller", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getCartProducts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "cartItems.product"
    );

    res.status(200).json({
      message: "Cart Fetched Successfully",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.log("Error in getCartProducts Controller", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
