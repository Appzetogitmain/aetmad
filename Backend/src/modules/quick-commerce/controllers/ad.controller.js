import { QuickAd } from '../models/ad.model.js';
import { ApiError } from '../../../utils/ApiError.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

export const createAd = asyncHandler(async (req, res) => {
    const { title, imageUrl, linkUrl, isActive } = req.body;
    
    if (!title || !imageUrl) {
        throw new ApiError(400, "Title and Image URL are required");
    }
    
    const ad = await QuickAd.create({
        title,
        imageUrl,
        linkUrl,
        isActive
    });
    
    res.status(201).json({ success: true, result: ad });
});

export const updateAd = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, imageUrl, linkUrl, isActive } = req.body;
    
    const ad = await QuickAd.findByIdAndUpdate(
        id,
        { $set: { title, imageUrl, linkUrl, isActive } },
        { new: true, runValidators: true }
    );
    
    if (!ad) {
        throw new ApiError(404, "Ad not found");
    }
    
    res.json({ success: true, result: ad });
});

export const deleteAd = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const ad = await QuickAd.findByIdAndDelete(id);
    
    if (!ad) {
        throw new ApiError(404, "Ad not found");
    }
    
    res.json({ success: true, message: 'Ad deleted successfully' });
});

export const getActiveAds = asyncHandler(async (req, res) => {
    const ads = await QuickAd.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, results: ads });
});

export const getAllAds = asyncHandler(async (req, res) => {
    const ads = await QuickAd.find().sort({ createdAt: -1 });
    res.json({ success: true, results: ads });
});
