import React, { useEffect, useState } from "react";
import {
  HiOutlinePencilSquare,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineXMark,
} from "react-icons/hi2";
import { adminApi } from "../services/adminApi";
import Card from "@shared/components/ui/Card";
import Modal from "@shared/components/ui/Modal";
import { useToast } from "@shared/components/ui/Toast";
import { cn } from "@/lib/utils";

const emptyAdItem = () => ({
  title: "",
  imageUrl: "",
  linkUrl: "",
  isActive: true,
  isUploading: false,
});

export default function AdsManagement() {
  const { showToast } = useToast();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formAd, setFormAd] = useState(emptyAdItem());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAds();
      const fetchedAds = res.data?.results || res.data?.result || [];
      setAds(Array.isArray(fetchedAds) ? fetchedAds : []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load ads", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const openCreate = () => {
    setEditingAd(null);
    setFormAd(emptyAdItem());
    setModalOpen(true);
  };

  const openEdit = (ad) => {
    setEditingAd(ad);
    setFormAd({ ...ad, isUploading: false });
    setModalOpen(true);
  };

  const handleFileChange = async (file) => {
    if (!file) return;
    setFormAd((prev) => ({ ...prev, isUploading: true }));
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await adminApi.uploadSettingsImage(fd, "ads");
      const url = res.data?.result?.url || res.data?.url;
      if (!url) throw new Error("Upload failed");
      setFormAd((prev) => ({ ...prev, imageUrl: url, isUploading: false }));
      showToast("Ad image uploaded", "success");
    } catch (e) {
      console.error(e);
      setFormAd((prev) => ({ ...prev, isUploading: false }));
      showToast("Failed to upload ad image", "error");
    }
  };

  const handleSave = async () => {
    if (!formAd.title || !formAd.imageUrl) {
      showToast("Title and Image are required", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formAd.title,
        imageUrl: formAd.imageUrl,
        linkUrl: formAd.linkUrl,
        isActive: formAd.isActive,
      };

      if (editingAd) {
        await adminApi.updateAd(editingAd._id, payload);
        showToast("Ad updated successfully", "success");
      } else {
        await adminApi.createAd(payload);
        showToast("Ad created successfully", "success");
      }
      
      setModalOpen(false);
      fetchAds();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Failed to save ad", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;
    
    setDeletingId(id);
    try {
      await adminApi.deleteAd(id);
      showToast("Ad deleted successfully", "success");
      fetchAds();
    } catch (error) {
      console.error(error);
      showToast("Failed to delete ad", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleStatus = async (ad) => {
    try {
      await adminApi.updateAd(ad._id, { ...ad, isActive: !ad.isActive });
      fetchAds();
      showToast(`Ad marked as ${!ad.isActive ? 'Active' : 'Inactive'}`, "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to update status", "error");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Ads Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage promotional banners and ads displayed on the storefront.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#0c831f] text-white rounded-xl font-bold text-sm shadow-sm hover:opacity-90 transition-all"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add New Ad
        </button>
      </div>

      <Card className="border border-slate-100 bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold">Loading…</div>
        ) : ads.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <HiOutlinePhoto className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="font-bold">No ads found</p>
            <p className="text-sm mt-1">Click the button above to add a new ad.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Image</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Link</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ads.map((ad) => (
                  <tr key={ad._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 w-24">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                        {ad.imageUrl ? (
                          ad.imageUrl.toLowerCase().endsWith('.mp4') || ad.imageUrl.toLowerCase().endsWith('.webm') ? (
                            <video src={ad.imageUrl} autoPlay loop muted className="w-full h-full object-cover" />
                          ) : (
                            <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <HiOutlinePhoto className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{ad.title}</p>
                    </td>
                    <td className="p-4 max-w-xs truncate">
                      {ad.linkUrl ? (
                        <a href={ad.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                          {ad.linkUrl}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No link</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleStatus(ad)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors",
                          ad.isActive
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        )}
                      >
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEdit(ad)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-black transition-colors"
                        title="Edit"
                      >
                        <HiOutlinePencilSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ad._id)}
                        disabled={deletingId === ad._id}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editingAd ? "Edit Ad" : "Create New Ad"}
        size="lg"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || formAd.isUploading}
              className="px-6 py-2 rounded-xl text-sm font-bold bg-[#0c831f] text-white hover:opacity-90 transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? "Saving…" : "Save Ad"}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="shrink-0 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Media (Image/Video) *
              </label>
              <div className="w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center relative group">
                {formAd.imageUrl ? (
                  formAd.imageUrl.toLowerCase().endsWith('.mp4') || formAd.imageUrl.toLowerCase().endsWith('.webm') ? (
                    <video src={formAd.imageUrl} autoPlay loop muted className="w-full h-full object-cover" />
                  ) : (
                    <img src={formAd.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  )
                ) : (
                  <HiOutlinePhoto className="w-8 h-8 text-slate-300 mb-1" />
                )}
                
                <div className={cn(
                  "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity",
                  formAd.imageUrl ? "opacity-0 group-hover:opacity-100" : "opacity-100 bg-transparent hover:bg-slate-100/50"
                )}>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    id="ad-media-upload"
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                    disabled={formAd.isUploading}
                  />
                  <label
                    htmlFor="ad-media-upload"
                    className="px-3 py-1.5 rounded-lg bg-white text-xs font-bold text-slate-800 shadow-sm cursor-pointer hover:bg-slate-50"
                  >
                    {formAd.isUploading ? "Uploading..." : formAd.imageUrl ? "Change" : "Upload Media"}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Title *
                </label>
                <input
                  type="text"
                  value={formAd.title}
                  onChange={(e) => setFormAd((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] transition-all"
                  placeholder="e.g. Summer Sale 50% Off"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Redirect Link (Optional)
                </label>
                <input
                  type="text"
                  value={formAd.linkUrl}
                  onChange={(e) => setFormAd((prev) => ({ ...prev, linkUrl: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] transition-all"
                  placeholder="e.g. /quick/categories/fruits"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formAd.isActive}
                    onChange={(e) => setFormAd((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0c831f]"></div>
                  <span className="ml-3 text-sm font-bold text-slate-700">
                    {formAd.isActive ? 'Active (Visible on Store)' : 'Inactive (Hidden)'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
