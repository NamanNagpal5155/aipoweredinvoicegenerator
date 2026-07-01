import mongoose from 'mongoose'
import Invoice from '../models/invoicemodel.js'
import BusinessProfile from '../models/businessProfileModel.js'
import {getAuth} from '@clerk/express'
function computeTotals(item =[], taxPercent =0){
    const safe = Array.isArray(item) ? item.filter(Boolean):[];
    const subtotal =safe.reduce(
    (s,it) => s +(Number(it.qty || 0)* Number(it.unitPrice || 0)),
    0);
     const tax=(subtotal*Number(taxPercent || 0))/100;
     const total =subtotal + tax;
     return {subtotal, tax , total};
}
////parse formdata item 
function parseItemField(val){
    if(!val) return [];
    if(Array.isArray(val)) return val;
    if(typeof val === "string"){
        try{
            return JSON.parse(val);
        }
        catch {
            return [];
        }
    }
    return val;
}
/////check if string is obj id

function isObjectIdString(val){
    return typeof val ==='string' && /^[0-9a-fA-F]{24}$/.test(val);
}
////fetch brand assets from business profile as fallback
async function brandFallback(userId, body) {
  const brand = {};
  if (body.logoDataUrl || body.logo) return brand;
  if (body.stampDataUrl || body.stamp) return brand;
  if (body.signatureDataUrl || body.signature) return brand;
  try {
    const profile = await BusinessProfile.findOne({ owner: userId }).lean();
    if (profile) {
      if (profile.logoUrl) brand.logoDataUrl = profile.logoUrl;
      if (profile.stampUrl) brand.stampDataUrl = profile.stampUrl;
      if (profile.signatureUrl) brand.signatureDataUrl = profile.signatureUrl;
    }
  } catch { /* ignore */ }
  return brand;
}

////generate a unique number to avoid collision in the DB for the invoice no. 
async function generateUniqueInvoiceNumber(attempts = 8) {
  for (let i = 0; i < attempts; i++) {
    const ts = Date.now().toString();
    const suffix = Math.floor(Math.random() * 900000).toString().padStart(6, "0");
    const candidate = `INV-${ts.slice(-6)}-${suffix}`;

    const exists = await Invoice.exists({ invoiceNumber: candidate });
    if (!exists) return candidate;
    await new Promise((r) => setTimeout(r, 2));
  }
  return new mongoose.Types.ObjectId().toString();
}


//// to create an invoice
export async function createInvoice(req, res) {
  try {
    const { userId } = getAuth(req) || {};
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const body = req.body || {};
    const items = Array.isArray(body.items)
      ? body.items
      : parseItemField(body.items);
    const taxPercent = Number(
      body.taxPercent ?? body.tax ?? body.defaultTaxPercent ?? 0
    );
    const totals = computeTotals(items, taxPercent);
    const brand = await brandFallback(userId, body);

    // If client supplied invoiceNumber, ensure it doesn't already exist
    let invoiceNumberProvided =
      typeof body.invoiceNumber === "string" && body.invoiceNumber.trim()
        ? String(body.invoiceNumber).trim()
        : null;

    if (invoiceNumberProvided) {
      const duplicate = await Invoice.exists({ invoiceNumber: invoiceNumberProvided });
      if (duplicate) {
        return res
          .status(409)
          .json({ success: false, message: "Invoice number already exists" });
      }
    }

    // generate a unique invoice number (or use provided)
    let invoiceNumber = invoiceNumberProvided || (await generateUniqueInvoiceNumber());

    // Build document
    const doc = new Invoice({
      _id: new mongoose.Types.ObjectId(),
      owner: userId, // associate invoice with Clerk userId
      invoiceNumber,
      issueDate: body.issueDate || new Date().toISOString().slice(0, 10),
      dueDate: body.dueDate || "",
      fromBusinessName: body.fromBusinessName || "",
      fromEmail: body.fromEmail || "",
      fromAddress: body.fromAddress || "",
      fromPhone: body.fromPhone || "",
      fromGst: body.fromGst || "",
      client:
        typeof body.client === "string" && body.client.trim()
          ? { name: body.client }
          : body.client || {},
      items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      currency: body.currency || "INR",
      status: body.status ? String(body.status).toLowerCase() : "draft",
      taxPercent,
      logoDataUrl: body.logoDataUrl || body.logo || brand.logoDataUrl || null,
      stampDataUrl: body.stampDataUrl || body.stamp || brand.stampDataUrl || null,
      signatureDataUrl: body.signatureDataUrl || body.signature || brand.signatureDataUrl || null,
      signatureName: body.signatureName || "",
      signatureTitle: body.signatureTitle || "",
      notes: body.notes || body.aiSource || "",
    });

    // Save with retry on duplicate-key (race conditions)
    let saved = null;
    let attempts = 0;
    const maxSaveAttempts = 6;
    while (attempts < maxSaveAttempts) {
      try {
        saved = await doc.save();
        break; // success
      } catch (err) {
        // If duplicate invoiceNumber (race), regenerate and retry
        if (err && err.code === 11000 && err.keyPattern && err.keyPattern.invoiceNumber) {
          attempts += 1;
          // generate a new invoiceNumber and set on doc
          const newNumber = await generateUniqueInvoiceNumber();
          doc.invoiceNumber = newNumber;
          // loop to try save again
          continue;
        }
        // other errors → rethrow
        throw err;
      }
    }

    if (!saved) {
      return res.status(500).json({
        success: false,
        message: "Failed to create invoice after multiple attempts",
      });
    }

    return res
      .status(201)
      .json({ success: true, message: "Invoice created", data: saved });
  } catch (err) {
    console.error("createInvoice error:", err);
    if (err.type === "entity.too.large") {
      return res
        .status(413)
        .json({ success: false, message: "Payload too large" });
    }
    // handle duplicate key at top-level just in case
    if (err && err.code === 11000 && err.keyPattern && err.keyPattern.invoiceNumber) {
      return res
        .status(409)
        .json({ success: false, message: "Invoice number already exists" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
////list of all the invoice 
export async function getInvoices(req, res){
    try{
        const {userId} = getAuth(req) || {};
        if(!userId){
            return res.status(401).json({
        success:false,
        message:"Authenticatin required."})
            }

            // Auto-mark unpaid invoices past due date as overdue
            const today = new Date().toISOString().slice(0, 10);
            await Invoice.updateMany(
              { owner: userId, status: 'unpaid', $or: [{ dueDate: { $lt: today } }, { dueDate: '' }] },
              { $set: { status: 'overdue' } }
            );

            const q={owner:userId};
            if(req.query.status) q.status = req.query.status;
            if(req.query.invoiceNumber) q.invoiceNumber = req.query.invoiceNumber;
            if (req.query.search) {
      const search = req.query.search.trim();
      q.$or = [
        { fromEmail: { $regex: search, $options: "i" } },
        { "client.email": { $regex: search, $options: "i" } },
        { "client.name": { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
      ];
    }
const invoices =await Invoice.find(q).sort({createdAt:-1}).lean();
return res.status(200).json({
    success:true,
    data:invoices
});
    }
catch(err){
    console.error("GETINVOICE ERROR" , err);
    return res.status(500).json({
        success:false,
        message:"Server Error"
    });
} 
}
/// get invoice by id

export async function getInvoiceById(req,res){
    try{
       const {userId} =getAuth(req) || {};
       if(!userId){
            return res.status(401).json({
        success:false,
        message:"Authenticatin required."})
            }

            // Auto-mark unpaid past due as overdue
            const today = new Date().toISOString().slice(0, 10);
            await Invoice.updateMany(
              { owner: userId, status: 'unpaid', $or: [{ dueDate: { $lt: today } }, { dueDate: '' }] },
              { $set: { status: 'overdue' } }
            );

            const {id}= req.params;
            let inv;
            if(isObjectIdString(id)) inv =await Invoice.findById(id);
            else inv=await Invoice.findOne({invoiceNumber:id});
            if(!inv) return res.status(404).json({
              success:false,
              message:"Invoice not found"
            });
            if(inv.owner &&String(inv.owner)!=String(userId)){
              return res.status(403).json({
                success:false,
                message:"Forbidden not your invoice"
              });
            }
            return res.status(200).json({
              success:true,
              data:inv
            });
    }
    catch(err){
    console.error("GETINVOICEBYID ERROR" , err);
    return res.status(500).json({
        success:false,
        message:"Server Error"
    });
} 
}

////update an invoice 
export async function updateInvoice(req,res){
try{
  const {userId} =getAuth(req) || {};
       if(!userId){
            return res.status(401).json({
        success:false,
        message:"Authenticatin required."})
            }
            const {id}=req.params;
            const body=req.body || {};
            const query =isObjectIdString(id)?{_id:id,owner:userId}:{invoiceNumber:id,owner:userId};
            const existing = await Invoice.findOne(query);
            if(!existing){
              return res.status(404).json({success:false , message:"Invoice not found"})

            }
            ////if user changes the invoice number
              if (body.invoiceNumber && String(body.invoiceNumber).trim() !== existing.invoiceNumber) {
      const conflict = await Invoice.findOne({ invoiceNumber: String(body.invoiceNumber).trim() });
      if (conflict && String(conflict._id) !== String(existing._id)) {
        return res
          .status(409)
          .json({ success: false, message: "Invoice number already exists" });
      }
    }

    let items = [];
    if (Array.isArray(body.items)) items = body.items;
    else if (typeof body.items === "string" && body.items.length) {
      try {
        items = JSON.parse(body.items);
      } catch {
        items = [];
      }
    }

    const taxPercent = Number(
      body.taxPercent ?? body.tax ?? body.defaultTaxPercent ?? existing.taxPercent ?? 0
    );
    const totals = computeTotals(items, taxPercent);
 const update = {
      invoiceNumber: body.invoiceNumber,
      issueDate: body.issueDate,
      dueDate: body.dueDate,
      fromBusinessName: body.fromBusinessName,
      fromEmail: body.fromEmail,
      fromAddress: body.fromAddress,
      fromPhone: body.fromPhone,
      fromGst: body.fromGst,
      client:
        typeof body.client === "string" && body.client.trim()
          ? { name: body.client }
          : body.client || existing.client || {},
      items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      currency: body.currency,
      status: body.status ? String(body.status).toLowerCase() : undefined,
      taxPercent,
      logoDataUrl: body.logoDataUrl || body.logo || undefined,
      stampDataUrl: body.stampDataUrl || body.stamp || undefined,
      signatureDataUrl: body.signatureDataUrl || body.signature || undefined,
      signatureName: body.signatureName,
      signatureTitle: body.signatureTitle,
      notes: body.notes,
    };
  Object.keys(update).forEach((k)=> update[k]=== undefined && delete update[k]);
  const updated=await Invoice.findOneAndUpdate(
    {_id:existing._id},
    {$set:update},
    {new:true, runValidators:true}
  );
  if(!updated) return res.status(500).json({
    success:false,
    message:"Invoice not updated"
  });
  return res.status(200).json({
    success:true,
    message:"Invoice updated",
    data:updated
  });
}
  catch (err) {
    console.error("updateInvoice error:", err);
    if (err && err.code === 11000 && err.keyPattern && err.keyPattern.invoiceNumber) {
      return res
        .status(409)
        .json({ success: false, message: "Invoice number already exists" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function deleteInvoice(req,res){
  try{
      const {userId} =getAuth(req) || {};
       if(!userId){
            return res.status(401).json({
        success:false,
        message:"Authenticatin required."});
            }
             const {id}=req.params;
            const query =isObjectIdString(id)?{_id:id,owner:userId}:
            {invoiceNumber:id,owner:userId};
            const found =await Invoice.findOne(query);
            if(!found){ return res.status(404).json({
              success:false,
              message:"Invoice not found"
            });
  }
  await Invoice.deleteOne({_id:found._id});
  return res.status(200).json({
    success:true,
    message:"Invoice deleted successfully"
  });
}
  catch(err){
    console.error("DELETEINVOICE ERROR" , err);
    return res.status(500).json({
        success:false,
        message:"Server Error"
    });
} 
}