"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { Sublocation, UnitType } from "@/lib/api";

const propertyTypeOptions = [
  ["apartment", "Apartment"],
  ["villa", "Villa"],
  ["independenthouse", "Independent House"],
  ["plot", "Plot"],
  ["commercialspace", "Commercial Space"],
  ["industrialspace", "Industrial"],
  ["farmlands", "Farmlands"],
] as const;

const propertySlugMap: Record<string, { buy: string; rent: string }> = {
  apartment: { buy: "buy-apartments", rent: "rent-apartments" },
  villa: { buy: "buy-villas", rent: "rent-villas" },
  independenthouse: {
    buy: "buy-independent-houses",
    rent: "rent-independent-houses",
  },
  plot: { buy: "buy-plots", rent: "buy-plots" },
  commercialspace: {
    buy: "buy-commercial-space",
    rent: "rent-commercial-space",
  },
  industrialspace: { buy: "buy-industrials", rent: "rent-industrials" },
  farmlands: { buy: "buy-farmlands", rent: "buy-farmlands" },
};

export function HomeSearch({
  sublocations,
  unitTypes,
}: {
  sublocations: Sublocation[];
  unitTypes: UnitType[];
}) {
  const router = useRouter();
  const [listingType, setListingType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [unitType, setUnitType] = useState("");
  const [facing, setFacing] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!propertyType) {
      setError("Please select a property type.");
      return;
    }

    const listingMode = listingType === "Rent" ? "rent" : "buy";
    const routeBase = propertySlugMap[propertyType]?.[listingMode];
    const params = new URLSearchParams();

    if (listingType) params.set("listingType", listingType);
    if (propertyType) params.set("propertyType", propertyType);
    if (location) params.set("location", location);
    if (unitType) params.set("unitType", unitType);
    if (facing) params.set("facing", facing);

    setError("");

    if (routeBase && !unitType && !facing) {
      const suffix = location
        ? location.toLowerCase().trim().replace(/\s+/g, "-")
        : "coimbatore";
      router.push(`/${routeBase}-${suffix}`);
      return;
    }

    router.push(`/property?${params.toString()}`);
  }

  return (
    <div className="wg-filter migrated-search">
      <form className="w-full" onSubmit={onSubmit}>
        <div className="form-title home-filter-grid">
          <select
            aria-label="Purchase type"
            className="form-select"
            value={listingType}
            onChange={(event) => setListingType(event.target.value)}
          >
            <option value="">Purchase type</option>
            <option value="Sell">Buy</option>
            <option value="Rent">Rent</option>
          </select>

          <select
            aria-label="Property type"
            className="form-select"
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value)}
          >
            <option value="">Property type</option>
            {propertyTypeOptions.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            aria-label="Location"
            className="form-select"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            <option value="">Location</option>
            {sublocations.map((item) => (
              <option value={item.sublocation} key={item.id}>
                {item.sublocation}
              </option>
            ))}
          </select>

          <select
            aria-label="Unit type"
            className="form-select"
            value={unitType}
            onChange={(event) => setUnitType(event.target.value)}
          >
            <option value="">Various Unit Types</option>
            {unitTypes.map((item) => (
              <option value={item.unittype} key={item.id}>
                {item.unittype}
              </option>
            ))}
          </select>

          <select
            aria-label="Facing"
            className="form-select"
            value={facing}
            onChange={(event) => setFacing(event.target.value)}
          >
            <option value="">Facing</option>
            <option value="east">East</option>
            <option value="west">West</option>
            <option value="north">North</option>
            <option value="south">South</option>
          </select>

          <button className="tf-btn bg-color-primary pd-3" type="submit">
            Search <i className="icon-MagnifyingGlass fw-6" />
          </button>
        </div>
        {error ? <p className="error-tooltip">{error}</p> : null}
      </form>
    </div>
  );
}
