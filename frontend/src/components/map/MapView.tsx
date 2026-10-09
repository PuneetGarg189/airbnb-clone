"use client";

import React, { useEffect, useRef } from "react";
import { ListingCard } from "@/types";
import { formatPrice } from "@/lib/utils";

interface MapViewProps {
  listings: ListingCard[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  singleListing?: boolean;
}

export default function MapView({
  listings,
  center = [40.0, 10.0],
  zoom = 3,
  height = "600px",
  singleListing = false,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;

    // Dynamically import leaflet
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Inject Leaflet CSS link if not already present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const mapCenter =
        singleListing && listings.length > 0
          ? [listings[0].latitude, listings[0].longitude]
          : center;

      const map = L.map(mapContainerRef.current).setView(
        mapCenter as [number, number],
        singleListing ? 13 : zoom
      );
      mapInstanceRef.current = map;

      // Standard OpenStreetMap tile layer (100% free, open, NO API key required, zero watermarks)
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add pins for listings
      listings.forEach((listing) => {
        if (!listing.latitude || !listing.longitude) return;

        const priceText = formatPrice(listing.price_per_night);

        const customIcon = L.divIcon({
          className: "custom-airbnb-marker",
          html: `<div class="airbnb-price-pin">${priceText}</div>`,
          iconSize: [60, 28],
          iconAnchor: [30, 14],
        });

        const popupContent = `
          <div style="min-width: 220px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
            <img src="${listing.cover_image}" style="width: 100%; height: 130px; object-fit: cover; border-radius: 12px; margin-bottom: 8px;" />
            <div style="font-weight: 700; font-size: 13px; color: #222; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${listing.title}</div>
            <div style="font-size: 12px; color: #717171; margin-top: 2px;">${listing.location}</div>
            <div style="margin-top: 6px; font-size: 13px; font-weight: 800; color: #222;">
              ${priceText} <span style="font-weight: 400; font-size: 11px; color: #717171;">night</span>
            </div>
            <a href="/rooms/${listing.id}" style="display: block; margin-top: 8px; text-align: center; background: #FF385C; color: white; padding: 6px 12px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: 700;">View stay</a>
          </div>
        `;

        const marker = L.marker([listing.latitude, listing.longitude], {
          icon: customIcon,
        }).addTo(map);

        marker.bindPopup(popupContent);
      });

      // If single listing view, also add a subtle circle around the general location
      if (singleListing && listings.length > 0) {
        L.circle([listings[0].latitude, listings[0].longitude], {
          color: "#FF385C",
          fillColor: "#FF385C",
          fillOpacity: 0.15,
          radius: 800,
        }).addTo(map);
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [listings, center, zoom, singleListing]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: "100%" }}
      className="rounded-3xl overflow-hidden shadow-md z-10 border border-gray-200"
    />
  );
}