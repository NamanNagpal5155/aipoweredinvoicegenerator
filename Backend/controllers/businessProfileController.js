import {getAuth} from "@clerk/express";
import BusinessProfile from "../models/businessProfileModel.js";

export async function createBusinessProfile(req,res){
    try{
 const { userId } = getAuth(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const body=req.body || {};
      const profile = new BusinessProfile({
      owner: userId,
      businessName: body.businessName || "ABC Solutions",
      email: body.email || "",
      address: body.address || "",
      phone: body.phone || "",
      gst: body.gst || "",
      logoUrl: body.logoUrl || null,
      stampUrl: body.stampUrl || null,
      signatureUrl: body.signatureUrl || null,
      signatureOwnerName: body.signatureOwnerName || "",
      signatureOwnerTitle: body.signatureOwnerTitle || "",
      defaultTaxPercent:
        body.defaultTaxPercent !== undefined ? Number(body.defaultTaxPercent) : 18,
    });
    const saved=await profile.save();
    return res.status(201).json({
        success:true,
        data:saved,
        message:"Business Profile Created."
    })
    }
    catch(error){
   console.log("create business profile error:" ,error);
   return res.status(500).json({
    success:false,
    message:"server error"
   });
    }
}

// to update a business profile

export async function updateBusinessProfile(req,res){
try{
 const { userId } = getAuth(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const {id} =req.params;
      const body=req.body || {};
    const existing = await BusinessProfile.findById(id);
    if(!existing) return res.status(404).json({
        success:false,
        message:"business profile not found."
    })
    if(existing.owner.toString()!==userId){
        return res.status(403).json({
            success:false,
            message:"forbidden : not your profile. "
        })
    }
    const update={};
     if (body.businessName !== undefined) update.businessName = body.businessName;
    if (body.email !== undefined) update.email = body.email;
    if (body.address !== undefined) update.address = body.address;
    if (body.phone !== undefined) update.phone = body.phone;
    if (body.gst !== undefined) update.gst = body.gst;

    if (body.logoUrl !== undefined) update.logoUrl = body.logoUrl;
    if (body.stampUrl !== undefined) update.stampUrl = body.stampUrl;
    if (body.signatureUrl !== undefined) update.signatureUrl = body.signatureUrl;

    if (body.signatureOwnerName !== undefined) update.signatureOwnerName = body.signatureOwnerName;
    if (body.signatureOwnerTitle !== undefined) update.signatureOwnerTitle = body.signatureOwnerTitle;
    if (body.defaultTaxPercent !== undefined) update.defaultTaxPercent = Number(body.defaultTaxPercent);

    const updated = await BusinessProfile.findByIdAndUpdate(id,update,{
        new :true,
        runValidators:true,

    });
    return res.status(200).json({
        success:true,
        data:updated,
        message:"profile updated."
    })
}
catch(error){
   console.log("update business profile error:" ,error);
   return res.status(500).json({
    success:false,
    message:"server error"
   });
    }
}

//to get mybusiness profile
export async function getMyBusinessProfile(req,res){
    try{
         const { userId } = getAuth(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const profile  = await BusinessProfile.findOne({
        owner:userId
    }).lean();
    if(!profile){
        return res.status(200).json({
            success:true,
            data:null,
            message:"no profile found"
        })
    }
    return res.status(200).json({
        success:true,
        data:profile
    });
    }
    catch(error){
   console.log("getmybusiness profile error:" ,error);
   return res.status(500).json({
    success:false,
    message:"server error"
   });
    }
}
