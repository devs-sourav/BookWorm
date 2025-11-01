import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

const loadCartFromLocalStorage = () => {
  try {
    const serializedCart = localStorage.getItem('cart');
    if (serializedCart) {
      const cart = JSON.parse(serializedCart);
      // Ensure all cart items have required fields
      return cart.map(item => ({
        ...item,
        // Ensure backward compatibility with existing cart items
        regularprice: item.regularprice || item.price,
        priceAfterDiscount: item.priceAfterDiscount || item.salePrice || item.price,
        offerprice: item.offerprice || item.salePrice || item.price,
        freeShipping: item.freeShipping || false,
        discountValue: item.discountValue || item.discount || 0,
        discountType: item.discountType || 'fixed',
        discountPercent: item.discountPercent || 0,
        isActive: item.isActive !== undefined ? item.isActive : true,
      }));
    }
    return [];
  } catch (e) {
    console.error("Could not load cart from local storage", e);
    return [];
  }
};

const saveCartToLocalStorage = (cart) => {
  try {
    const serializedCart = JSON.stringify(cart);
    localStorage.setItem('cart', serializedCart);
  } catch (e) {
    console.error("Could not save cart to local storage", e);
  }
};

const initialState = {
  items: loadCartFromLocalStorage(),
  totalItems: 0,
  totalAmount: 0,
  totalDiscount: 0,
  freeShippingEligible: false,
  lastUpdated: null,
};

// Helper function to calculate cart totals
const calculateCartTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalAmount = items.reduce((sum, item) => {
    const itemPrice = item.priceAfterDiscount || item.salePrice || item.price;
    return sum + (itemPrice * item.quantity);
  }, 0);
  
  const totalDiscount = items.reduce((sum, item) => {
    const regularPrice = item.regularprice || item.price;
    const salePrice = item.priceAfterDiscount || item.salePrice || item.price;
    const itemDiscount = (regularPrice - salePrice) * item.quantity;
    return sum + Math.max(itemDiscount, 0);
  }, 0);
  
  // Check if any item has free shipping or if order qualifies for free shipping
  const freeShippingEligible = items.some(item => item.freeShipping) || totalAmount >= 1000; // Adjust threshold as needed
  
  return {
    totalItems,
    totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    freeShippingEligible,
  };
};

// Helper function to validate cart item
const validateCartItem = (item) => {
  const requiredFields = ['_id', 'title', 'price', 'quantity'];
  return requiredFields.every(field => 
    item[field] !== undefined && item[field] !== null
  );
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      
      if (!validateCartItem(newItem)) {
        console.error('Invalid cart item:', newItem);
        toast.error("Invalid item data!", { autoClose: 1000 });
        return;
      }

      const { _id } = newItem;
      const itemIndex = state.items.findIndex(item => item._id === _id);
     
      if (itemIndex >= 0) {
        // Item exists, update quantity
        const existingItem = state.items[itemIndex];
        const newQuantity = existingItem.quantity + newItem.quantity;
        
        // Check stock availability
        if (newQuantity > newItem.stock) {
          state.items[itemIndex].quantity = newItem.stock;
          toast.warning(`Added maximum available quantity (${newItem.stock})`, { autoClose: 1500 });
        } else {
          state.items[itemIndex].quantity = newQuantity;
          toast.success("Item quantity updated in cart!", { autoClose: 800 });
        }
        
        // Update item details (price, stock, etc.) in case they changed
        state.items[itemIndex] = { 
          ...state.items[itemIndex], 
          ...newItem, 
          quantity: state.items[itemIndex].quantity 
        };
      } else {
        // Item does not exist, add to cart
        const itemToAdd = {
          ...newItem,
          addedToCartAt: new Date().toISOString(),
        };
        
        // Check stock availability for new item
        if (newItem.quantity > newItem.stock) {
          itemToAdd.quantity = newItem.stock;
          toast.warning(`Added maximum available quantity (${newItem.stock})`, { autoClose: 1500 });
        } else {
          toast.success("Item added to cart!", { autoClose: 800 });
        }
        
        state.items.push(itemToAdd);
      }
      
      // Calculate and update totals
      const totals = calculateCartTotals(state.items);
      Object.assign(state, totals);
      state.lastUpdated = new Date().toISOString();
      
      saveCartToLocalStorage(state.items);
    },
    
    deleteFromCart: (state, action) => {
      const { _id } = action.payload;
      const removedItem = state.items.find(item => item._id === _id);
      
      state.items = state.items.filter(item => item._id !== _id);
      
      // Calculate and update totals
      const totals = calculateCartTotals(state.items);
      Object.assign(state, totals);
      state.lastUpdated = new Date().toISOString();
      
      saveCartToLocalStorage(state.items);
      
      if (removedItem) {
        toast.error(`"${removedItem.title}" removed from cart!`, { autoClose: 1000 });
      }
    },
    
    resetCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
      state.totalDiscount = 0;
      state.freeShippingEligible = false;
      state.lastUpdated = new Date().toISOString();
      
      saveCartToLocalStorage(state.items);
      toast.success("Cart cleared!", { autoClose: 800 });
    },
    
    incrementQuantity: (state, action) => {
      const { _id } = action.payload;
      const item = state.items.find(item => item._id === _id);
      
      if (item) {
        if (item.quantity < item.stock) {
          item.quantity += 1;
          
          // Calculate and update totals
          const totals = calculateCartTotals(state.items);
          Object.assign(state, totals);
          state.lastUpdated = new Date().toISOString();
          
          saveCartToLocalStorage(state.items);
          toast.info("Quantity increased!", { autoClose: 500 });
        } else {
          toast.warning("Maximum quantity reached!", { autoClose: 1000 });
        }
      }
    },
    
    decrementQuantity: (state, action) => {
      const { _id } = action.payload;
      const item = state.items.find(item => item._id === _id);
      
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        
        // Calculate and update totals
        const totals = calculateCartTotals(state.items);
        Object.assign(state, totals);
        state.lastUpdated = new Date().toISOString();
        
        saveCartToLocalStorage(state.items);
        toast.info("Quantity decreased!", { autoClose: 500 });
      }
    },
    
    updateItemStock: (state, action) => {
      const { _id, stock, isActive } = action.payload;
      const item = state.items.find(item => item._id === _id);
      
      if (item) {
        const oldStock = item.stock;
        item.stock = stock;
        item.isActive = isActive;
       
        // If item quantity exceeds available stock, adjust it
        if (item.quantity > stock) {
          item.quantity = Math.max(stock, 0);
          if (stock === 0) {
            toast.error(`"${item.title}" is now out of stock and removed from cart`, { autoClose: 2000 });
          } else {
            toast.warning(`"${item.title}" quantity adjusted due to stock changes`, { autoClose: 2000 });
          }
        }
        
        // Remove item if it's no longer active
        if (!isActive) {
          state.items = state.items.filter(cartItem => cartItem._id !== _id);
          toast.error(`"${item.title}" is no longer available and removed from cart`, { autoClose: 2000 });
        }
        
        // Calculate and update totals
        const totals = calculateCartTotals(state.items);
        Object.assign(state, totals);
        state.lastUpdated = new Date().toISOString();
        
        saveCartToLocalStorage(state.items);
      }
    },
    
    updateQuantity: (state, action) => {
      const { _id, quantity } = action.payload;
      const item = state.items.find(item => item._id === _id);
      
      if (item && quantity > 0) {
        const validQuantity = Math.min(quantity, item.stock);
        item.quantity = validQuantity;
        
        // Calculate and update totals
        const totals = calculateCartTotals(state.items);
        Object.assign(state, totals);
        state.lastUpdated = new Date().toISOString();
        
        saveCartToLocalStorage(state.items);
        
        if (validQuantity !== quantity) {
          toast.warning(`Quantity adjusted to available stock (${validQuantity})`, { autoClose: 1500 });
        } else {
          toast.info("Quantity updated!", { autoClose: 500 });
        }
      }
    },
    
    // New action to update item pricing (useful when prices change)
    updateItemPricing: (state, action) => {
      const { _id, pricing } = action.payload;
      const item = state.items.find(item => item._id === _id);
      
      if (item && pricing) {
        Object.assign(item, pricing);
        
        // Calculate and update totals
        const totals = calculateCartTotals(state.items);
        Object.assign(state, totals);
        state.lastUpdated = new Date().toISOString();
        
        saveCartToLocalStorage(state.items);
        toast.info(`"${item.title}" pricing updated`, { autoClose: 1000 });
      }
    },
    
    // Action to apply coupon/discount to entire cart
    applyCoupon: (state, action) => {
      const { couponCode, discountAmount, discountType } = action.payload;
      // This would integrate with your coupon system
      // For now, just showing the structure
      state.appliedCoupon = {
        code: couponCode,
        discountAmount,
        discountType,
        appliedAt: new Date().toISOString(),
      };
      
      // Recalculate totals with coupon
      const totals = calculateCartTotals(state.items);
      Object.assign(state, totals);
      
      // Apply additional coupon discount
      if (discountType === 'percent') {
        state.totalAmount = state.totalAmount * (1 - discountAmount / 100);
      } else {
        state.totalAmount = Math.max(state.totalAmount - discountAmount, 0);
      }
      
      state.totalAmount = Math.round(state.totalAmount * 100) / 100;
      saveCartToLocalStorage(state.items);
      
      toast.success(`Coupon "${couponCode}" applied successfully!`, { autoClose: 1500 });
    },
    
    removeCoupon: (state) => {
      if (state.appliedCoupon) {
        const couponCode = state.appliedCoupon.code;
        delete state.appliedCoupon;
        
        // Recalculate totals without coupon
        const totals = calculateCartTotals(state.items);
        Object.assign(state, totals);
        
        saveCartToLocalStorage(state.items);
        toast.info(`Coupon "${couponCode}" removed`, { autoClose: 1000 });
      }
    }
  },
});

export const {
  addToCart,
  deleteFromCart,
  resetCart,
  incrementQuantity,
  decrementQuantity,
  updateItemStock,
  updateQuantity,
  updateItemPricing,
  applyCoupon,
  removeCoupon
} = cartSlice.actions;

export default cartSlice.reducer;