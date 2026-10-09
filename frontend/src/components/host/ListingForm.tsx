"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Image as ImageIcon, Sparkles, Check, Upload, Cloud } from "lucide-react";
import { ListingCreateInput, ListingDetail } from "@/types";
import { createListing, updateListing } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface ListingFormProps {
  initialData?: ListingDetail;
  isEdit?: boolean;
}

const CATEGORIES = [
  "Cabins",
  "Beachfront",
  "Mansions",
  "Amazing pools",
  "Treehouses",
  "Lakefront",
  "Countryside",
  "Skiing",
  "Islands",
  "Iconic cities",
];

const AMENITIES_OPTIONS = [
  "Wifi",
  "Pool",
  "Kitchen",
  "Free parking",
  "Air conditioning",
  "Hot tub",
  "Waterfront",
  "Dedicated workspace",
  "EV charger",
  "Washer",
  "Dryer",
  "Indoor fireplace",
  "Breakfast included",
  "Pet friendly",
  "Ski-in/Ski-out",
  "Patio or balcony",
  "TV",
];

export default function ListingForm({ initialData, isEdit = false }: ListingFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "Cabins");
  const [propertyType, setPropertyType] = useState(initialData?.property_type || "Entire home");
  const [pricePerNight, setPricePerNight] = useState(initialData?.price_per_night || 250);
  const [cleaningFee, setCleaningFee] = useState(initialData?.cleaning_fee || 50);
  const [serviceFee, setServiceFee] = useState(initialData?.service_fee || 35);
  const [city, setCity] = useState(initialData?.city || "");
  const [country, setCountry] = useState(initialData?.country || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [latitude, setLatitude] = useState(initialData?.latitude || 40.7128);
  const [longitude, setLongitude] = useState(initialData?.longitude || -74.006);
  const [maxGuests, setMaxGuests] = useState(initialData?.max_guests || 4);
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms || 2);
  const [beds, setBeds] = useState(initialData?.beds || 2);
  const [baths, setBaths] = useState(initialData?.baths || 1.5);
  const [amenities, setAmenities] = useState<string[]>(
    initialData?.amenities || ["Wifi", "Kitchen", "Free parking"]
  );
  const [photoUrls, setPhotoUrls] = useState<string[]>(
    initialData?.images?.map((img) => img.url) || [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    ]
  );
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const handleToggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setPhotoUrls((prev) => [...prev, newPhotoUrl.trim()]);
    setNewPhotoUrl("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrls((prev) => [...prev, event.target!.result as string]);
          toast.success(`Uploaded ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !city || !country || !location) {
      toast.error("Please fill in all required location and description fields.");
      return;
    }

    if (photoUrls.length === 0) {
      toast.error("Please provide at least one photo for the listing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ListingCreateInput = {
        title,
        description,
        category,
        property_type: propertyType,
        price_per_night: Number(pricePerNight),
        cleaning_fee: Number(cleaningFee),
        service_fee: Number(serviceFee),
        city,
        country,
        location,
        latitude: Number(latitude),
        longitude: Number(longitude),
        max_guests: Number(maxGuests),
        bedrooms: Number(bedrooms),
        beds: Number(beds),
        baths: Number(baths),
        amenities,
        images: photoUrls,
        host_id: user.id,
      };

      if (isEdit && initialData) {
        await updateListing(initialData.id, payload);
        toast.success("Listing updated successfully! 🎉");
        router.push(`/rooms/${initialData.id}`);
      } else {
        const created = await createListing(payload);
        toast.success("Listing published successfully! 🚀");
        router.push(`/rooms/${created.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl mx-auto">
      {/* 1. Basics & Category */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-black text-gray-900">Property Overview</h3>
          <p className="text-xs text-gray-500 mt-1">Set the title, category, and type of home</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
            Listing Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Modern Cliffside Villa with Infinity Pool"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            required
            rows={4}
            placeholder="Describe what makes your space special..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Property Type
            </label>
            <input
              type="text"
              placeholder="e.g. Entire villa, Entire cabin"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 2. Location & Map Pin */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-black text-gray-900">Location</h3>
          <p className="text-xs text-gray-500 mt-1">Where is your property located?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">City *</label>
            <input
              type="text"
              required
              placeholder="e.g. Positano"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Country *</label>
            <input
              type="text"
              required
              placeholder="e.g. Italy"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
            Display Location / Area *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Positano, Amalfi Coast, Italy"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 3. Pricing & Capacity */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-black text-gray-900">Pricing & Capacity</h3>
          <p className="text-xs text-gray-500 mt-1">Set rates and accommodation limits</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Base Price / Night ($) *
            </label>
            <input
              type="number"
              required
              min={10}
              value={pricePerNight}
              onChange={(e) => setPricePerNight(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm font-bold focus:border-black outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Cleaning Fee ($)
            </label>
            <input
              type="number"
              min={0}
              value={cleaningFee}
              onChange={(e) => setCleaningFee(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Service Fee ($)
            </label>
            <input
              type="number"
              min={0}
              value={serviceFee}
              onChange={(e) => setServiceFee(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Max Guests</label>
            <input
              type="number"
              min={1}
              value={maxGuests}
              onChange={(e) => setMaxGuests(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Bedrooms</label>
            <input
              type="number"
              min={1}
              value={bedrooms}
              onChange={(e) => setBedrooms(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Beds</label>
            <input
              type="number"
              min={1}
              value={beds}
              onChange={(e) => setBeds(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Bathrooms</label>
            <input
              type="number"
              step="0.5"
              min={0.5}
              value={baths}
              onChange={(e) => setBaths(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 4. Amenities */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-black text-gray-900">Amenities</h3>
          <p className="text-xs text-gray-500 mt-1">Select the amenities provided to guests</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AMENITIES_OPTIONS.map((item) => {
            const isChecked = amenities.includes(item);
            return (
              <button
                type="button"
                key={item}
                onClick={() => handleToggleAmenity(item)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
                  isChecked
                    ? "border-[#FF385C] bg-pink-50 text-[#FF385C]"
                    : "border-gray-200 text-gray-700 hover:border-gray-400"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                    isChecked ? "bg-[#FF385C] border-[#FF385C] text-white" : "border-gray-300"
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Photos & Cloud Storage Upload */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900">Photos</h3>
            <p className="text-xs text-gray-500 mt-1">
              Add photos via URL or upload image files directly
            </p>
          </div>
          <span className="flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-200">
            <Cloud className="w-3 h-3 text-blue-600" /> Cloud / Local Upload
          </span>
        </div>

        {/* Upload options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option A: Paste URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700">Paste Image URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="flex-1 rounded-xl border border-gray-300 p-2.5 text-xs focus:border-black outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="rounded-xl bg-gray-900 px-4 text-xs font-bold text-white hover:bg-black transition cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Option B: Direct File Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700">Upload Image Files</label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-black rounded-xl p-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer">
              <Upload className="w-4 h-4 text-gray-500" />
              <span>Choose Files to Upload</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Photo Previews */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {photoUrls.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group shadow-xs"
            >
              <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
              {index === 0 && (
                <span className="absolute top-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-700 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border border-gray-300 font-bold text-sm text-gray-700 hover:bg-gray-100 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:brightness-105 transition disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          {isSubmitting
            ? "Saving Listing..."
            : isEdit
            ? "Update Listing"
            : "Publish Listing"}
        </button>
      </div>
    </form>
  );
}