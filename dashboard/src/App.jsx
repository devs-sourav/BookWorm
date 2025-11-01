import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import Login from "./Pages/Login";
import MainLayout from "./LayOut/MainLayout";
import Signup from "./Pages/Singup";
import Home from "./Pages/DashBoardHome";
import EditProduct from "./Pages/EditProduct";
import Order from "./Pages/Order";
import UploadBanner from "./Pages/UploadBanner";
import AllBanner from "./Pages/AllBanner";
import AddCategory from "./Pages/Category";
import AllSubCategory from "./Pages/AllSubCategory";
import UploadProduct from "./Pages/UploadProduct";
import AllProduct from "./Pages/AllProduct";
import AddDiscount from "./Pages/AddDiscount";
import AddReview from "./Pages/AddReview";
import ApplayCuppon from "./Pages/ApplayCuppon";
import AddBrand from "./Pages/AddBrand";
import AllBrand from "./Pages/AllBrand";
import AddSubCategory from "./Pages/AddSubCategory";
import AllCategories from "./Pages/AllCategories";
import AuthorManagement from "./Pages/AuthorManagement";
import UserManagement from "./Pages/UserManagement";
import ReviewManagement from "./Pages/ReviewManagement";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/edit-product" element={<EditProduct />} />
      <Route path="/dashboard" element={<MainLayout />}>
        {/* Default dashboard route */}
        <Route index element={<Home />} />
        
        {/* Individual dashboard routes */}
        <Route path="order" element={<Order />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="upload-banner" element={<UploadBanner />} />
        <Route path="all-banner" element={<AllBanner />} />
        <Route path="add-category" element={<AddCategory />} />
        <Route path="all-categories" element={<AllCategories />} />
        <Route path="upload-product" element={<UploadProduct />} />
        <Route path="all-products" element={<AllProduct />} />
        <Route path="add-discount" element={<AddDiscount />} />
        {/* <Route path="add-review" element={<AddReview />} /> */}
        <Route path="coupon" element={<ApplayCuppon />} />
        <Route path="add-author" element={<AuthorManagement />} />
        <Route path="add-publisher" element={<AddBrand />} />
        <Route path="all-brands" element={<AllBrand />} />
        <Route path="add-subcategory" element={<AddSubCategory />} />
        <Route path="all-subcategories" element={<AllSubCategory />} />
        <Route path="add-review" element={<ReviewManagement />} />
      </Route>
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;