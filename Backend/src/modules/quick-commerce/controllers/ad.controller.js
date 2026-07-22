import { QuickAd } from '../models/ad.model.js';
import { ApiError } from '../../../utils/ApiError.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

export const createAd = asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, result: {} });
});

export const updateAd = asyncHandler(async (req, res) => {
    res.json({ success: true, result: {} });
});

export const deleteAd = asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'Ad deleted' });
});

export const getActiveAds = asyncHandler(async (req, res) => {
    res.json({ success: true, results: [] });
});

export const getAllAds = asyncHandler(async (req, res) => {
    res.json({ success: true, results: [] });
});
