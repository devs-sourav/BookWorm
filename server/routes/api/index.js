const express = require("express");
const authRoute = require("./authRotue");
const categoryRoute = require("./categoryRoute");
const subCategoryRoute = require("./subCategoryRoute");
const brandRoute = require("./brandRoute");
const productRoute = require("./productRoute");
const searchRoute = require("./searchRoute");
const bannerRoute = require("./bannerRoute");
const discountRoute = require("./discountRoute");
const orderRoute = require("./orderRoute");
const couponRoute = require("./couponRoute");
const pathaoLocationRoute = require("./pathaoLocationRoute");
const authorRoute = require("./authorRoute");
const reviewRoute =require("./reviewRoutes");

const router = express.Router();

router.use("/auth", authRoute);
router.use("/author", authorRoute);
router.use("/category", categoryRoute);
router.use("/subCategory", subCategoryRoute);
router.use("/brand", brandRoute);
router.use("/product", productRoute);
router.use("/search", searchRoute);
router.use("/banner", bannerRoute);
router.use("/discount", discountRoute);
router.use("/order", orderRoute);
router.use("/coupon", couponRoute);
router.use("/pathaoLocation", pathaoLocationRoute);
router.use("/review", reviewRoute);

module.exports = router;
