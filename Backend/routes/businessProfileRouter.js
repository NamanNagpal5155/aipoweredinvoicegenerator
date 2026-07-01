import express from "express";
import { createBusinessProfile, updateBusinessProfile, getMyBusinessProfile } from '../controllers/businessProfileController.js';
const businessProfileRouter =express.Router();

businessProfileRouter.post("/", createBusinessProfile);
businessProfileRouter.put("/:id", updateBusinessProfile);
businessProfileRouter.get("/me",getMyBusinessProfile);
export default businessProfileRouter;
