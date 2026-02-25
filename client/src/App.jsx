import React, { Suspense, lazy, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import ApiContext from "./components/baseapi/BaseApi";
import RootLayout from "./layouts/RootLayout";
import CategoryShop from "./components/shop/CategoryShop";
import RegistrationPage from "./pages/Registration";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import PasswordResetForm from "./pages/PasswordResetForm";
import AuthorsPage from "./pages/AuthorsPage";
import AuthorDetailPage from "./pages/AuthorDetailPage";
import OrderPaymentSuccess from "./pages/OrderPaymentSuccess";
import PaymentFailPage from "./pages/PaymentFailPage";
import ProfilePage from "./pages/ProfilePage";

// Lazy load components
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const TermsCondition = lazy(() => import("./pages/TermsCondition"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ShippingRates = lazy(() => import("./pages/ShippingRates"));
const DeliveryInfo = lazy(() => import("./pages/DeliveryInfo"));
const RefundsAndReplacements = lazy(() =>
  import("./pages/RefundsAndReplacements")
);
const EmailVerification = lazy(() => import("./pages/EmailVerification"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const ShopLayouts = lazy(() => import("./layouts/ShopLayouts"));
const MegaSale = lazy(() => import("./components/shop/MegaSale"));
const LatestSale = lazy(() => import("./components/shop/LatestSale"));
const OfferSale = lazy(() => import("./components/shop/OfferSale"));
const BrandShop = lazy(() => import("./components/shop/BrandShop"));
const Subcategory = lazy(() => import("./components/shop/Subcategory"));
const NotFound = lazy(() => import("./pages/NotFound"));

const baseApi = "https://bookwormm.netlify.app/api/v1";

// Loading Spinner
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Define routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route
        index
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Home />
          </Suspense>
        }
      />
      <Route
        path="shop"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ShopLayouts />
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Shop />
            </Suspense>
          }
        />
        <Route
          path="mega-sale"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <MegaSale />
            </Suspense>
          }
        />
        <Route
          path="latest-sale"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LatestSale />
            </Suspense>
          }
        />
        <Route
          path="offer-sale"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <OfferSale />
            </Suspense>
          }
        />
        <Route
          path="category/:categoryId"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <CategoryShop />
            </Suspense>
          }
        />
        <Route
          path="subcategory/:subcategoryId"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Subcategory />
            </Suspense>
          }
        />
        <Route
          path="brand/:brandId"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <BrandShop />
            </Suspense>
          }
        />
      </Route>
      <Route
        path="/author"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <AuthorsPage />
          </Suspense>
        }
      />
      <Route
        path="/order/payment/success/:orderId"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <OrderPaymentSuccess />
          </Suspense>
        }
      />
      <Route
        path="/order/payment/fail/:orderId"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <PaymentFailPage />
          </Suspense>
        }
      />
      <Route
        path="/profile/general/:id"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ProfilePage />
          </Suspense>
        }
      />
      <Route
        path="/author/:id"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <AuthorDetailPage />
          </Suspense>
        }
      />
      <Route
        path="about"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <About />
          </Suspense>
        }
      />
      <Route
        path="contact"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Contact />
          </Suspense>
        }
      />
      <Route
        path="registration"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <RegistrationPage />
          </Suspense>
        }
      />
      <Route
        path="login"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path="forgot-password"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ForgotPassword />
          </Suspense>
        }
      />
      <Route
        path="verify-email"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <EmailVerification />
          </Suspense>
        }
      />
      <Route
        path="reset-password"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <PasswordResetForm />
          </Suspense>
        }
      />
      <Route
        path="terms-condition"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <TermsCondition />
          </Suspense>
        }
      />
      <Route
        path="privacy"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <PrivacyPolicy />
          </Suspense>
        }
      />
      <Route
        path="shipingrates-policy"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ShippingRates />
          </Suspense>
        }
      />
      <Route
        path="delivery-info"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <DeliveryInfo />
          </Suspense>
        }
      />
      <Route
        path="refund-replace"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <RefundsAndReplacements />
          </Suspense>
        }
      />
      <Route
        path="productdetail/:id"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ProductDetail />
          </Suspense>
        }
      />
      <Route
        path="cart"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Cart />
          </Suspense>
        }
      />
      <Route
        path="checkout"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Checkout />
          </Suspense>
        }
      />
      <Route
        path="thankyou"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ThankYou />
          </Suspense>
        }
      />

      <Route
        path="*"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <NotFound />
          </Suspense>
        }
      />
    </Route>
  )
);

// App Component
function App() {
  return (
    <ApiContext.Provider value={baseApi}>
      <RouterProvider router={router} />
    </ApiContext.Provider>
  );
}

export default App;
