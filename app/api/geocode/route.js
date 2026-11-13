export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Known reliable fallbacks for key surveillance areas
const KNOWN_PLACES = [
  { name: "Jagatballavpur", admin1: "West Bengal", country: "India", latitude: 22.6868, longitude: 88.1065, elevation: 12 },
  { name: "Howrah", admin1: "West Bengal", country: "India", latitude: 22.5958, longitude: 88.2636, elevation: 12 },
  { name: "Kolkata", admin1: "West Bengal", country: "India", latitude: 22.5726, longitude: 88.3639, elevation: 9 },
  { name: "Bidhannagar (Salt Lake)", admin1: "West Bengal", country: "India", latitude: 22.5867, longitude: 88.4178, elevation: 11 },
  { name: "Siliguri", admin1: "West Bengal", country: "India", latitude: 26.7271, longitude: 88.3953, elevation: 122 },
  { name: "Delhi", admin1: "Delhi", country: "India", latitude: 28.6139, longitude: 77.2090, elevation: 216 },
  { name: "Mumbai", admin1: "Maharashtra", country: "India", latitude: 19.0760, longitude: 72.8777, elevation: 14 },
  { name: "Bengaluru", admin1: "Karnataka", country: "India", latitude: 12.9716, longitude: 77.5946, elevation: 920 },
  { name: "Chennai", admin1: "Tamil Nadu", country: "India", latitude: 13.0827, longitude: 80.2707, elevation: 6 },
  { name: "Dhaka", admin1: "Dhaka Division", country: "Bangladesh", latitude: 23.8103, longitude: 90.4125, elevation: 12 },
  { name: "Chittagong", admin1: "Chittagong Division", country: "Bangladesh", latitude: 22.3569, longitude: 91.7832, elevation: 15 },
  { name: "Bangkok", admin1: "Bangkok", country: "Thailand", latitude: 13.7563, longitude: 100.5018, elevation: 2 },
  { name: "Singapore", admin1: "", country: "Singapore", latitude: 1.3521, longitude: 103.8198, elevation: 15 },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const detect = searchParams.get("detect") === "true" || searchParams.get("detectIp") === "true";

  // 1. IP-based detection when GPS is unavailable or requested
  if (detect) {
    try {
      const res = await fetch("https://ipapi.co/json/", {
        headers: { "User-Agent": "DengueShield-Surveillance/2.0" },
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.latitude && d.longitude) {
          return Response.json({
            result: {
              name: d.city || d.region || "Your Location",
              admin1: d.region || "",
              country: d.country_name || d.country || "India",
              latitude: Number(d.latitude),
              longitude: Number(d.longitude),
            },
          });
        }
      }
    } catch {}

    try {
      const res2 = await fetch("http://ip-api.com/json/?fields=status,country,regionName,city,lat,lon", {
        signal: AbortSignal.timeout(3500),
      });
      if (res2.ok) {
        const d2 = await res2.json();
        if (d2.status === "success" && d2.lat && d2.lon) {
          return Response.json({
            result: {
              name: d2.city || d2.regionName || "Your Location",
              admin1: d2.regionName || "",
              country: d2.country || "India",
              latitude: Number(d2.lat),
              longitude: Number(d2.lon),
            },
          });
        }
      }
    } catch {}

    // Fallback to active surveillance region
    return Response.json({
      result: {
        name: "Jagatballavpur",
        admin1: "West Bengal",
        country: "India",
        latitude: 22.6868,
        longitude: 88.1065,
      },
    });
  }

  // 2. High-Accuracy Reverse Geocoding with full administrative address hierarchy
  if (lat && lon) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const accuracy = searchParams.get("accuracy") ? parseFloat(searchParams.get("accuracy")) : null;

    // Validate geographic coordinates
    if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      return Response.json({ error: "Invalid geographic coordinates provided." }, { status: 400 });
    }

    // Always use zoom 18 for high-resolution reverse geocoding (village, suburb, road level)
    const zoomLevel = 18;

    // A. OpenStreetMap Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latNum}&lon=${lonNum}&format=jsonv2&zoom=${zoomLevel}&addressdetails=1`,
        {
          headers: {
            "User-Agent": "DengueShield-Surveillance/2.0 (contact@dengueshield.org)",
            "Accept-Language": "en",
          },
          signal: AbortSignal.timeout(6000),
        }
      );

      if (res.ok) {
        const body = await res.json();
        const addr = body.address || {};

        const houseNumber = addr.house_number || addr.building || "";
        const road = addr.road || addr.pedestrian || addr.street || addr.residential || "";
        const locality = addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || addr.quarter || addr.subdivision || addr.town || "";
        const city = addr.city || addr.town || addr.municipality || "";
        const district = addr.state_district || addr.district || addr.county || "";
        const state = addr.state || addr.province || addr.region || "";
        const country = addr.country || "India";
        const postcode = addr.postcode || addr.postal_code || "";

        // Primary name prioritizes specific village, suburb, town over broad city
        const primaryName = locality || road || city || district || body.name || "Your Location";

        // Build a complete, deduplicated human-readable formatted address
        const addressParts = [];
        const streetPart = [houseNumber, road].filter(Boolean).join(" ");
        if (streetPart) addressParts.push(streetPart);
        if (locality && locality !== road && locality !== city) addressParts.push(locality);
        if (city && city !== locality) addressParts.push(city);
        if (district && district !== city && district !== state) addressParts.push(district);
        if (state) addressParts.push(state);
        if (postcode) addressParts.push(postcode);
        if (country) addressParts.push(country);

        const formattedAddress = addressParts.join(", ") || body.display_name || primaryName;

        return Response.json({
          result: {
            name: primaryName,
            road,
            locality,
            city,
            district,
            admin1: state || district || "",
            country,
            postcode,
            latitude: latNum,
            longitude: lonNum,
            formattedAddress,
            displayName: formattedAddress,
          },
        });
      }
    } catch (nomErr) {
      console.warn("Nominatim reverse geocode lookup failed, trying fallback:", nomErr);
    }

    // B. BigDataCloud reverse geocode client as high-reliability secondary provider
    try {
      const bdcRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latNum}&longitude=${lonNum}&localityLanguage=en`,
        { signal: AbortSignal.timeout(5000) }
      );

      if (bdcRes.ok) {
        const bdc = await bdcRes.json();
        const locality = bdc.locality || "";
        const city = bdc.city || "";
        const state = bdc.principalSubdivision || "";
        const country = bdc.countryName || "India";
        const postcode = bdc.postcode || "";

        const primaryName = locality || city || state || "Your Location";

        const addressParts = [];
        if (locality) addressParts.push(locality);
        if (city && city !== locality) addressParts.push(city);
        if (state) addressParts.push(state);
        if (postcode) addressParts.push(postcode);
        if (country) addressParts.push(country);

        const formattedAddress = addressParts.join(", ") || primaryName;

        return Response.json({
          result: {
            name: primaryName,
            locality,
            city,
            district: bdc.localityInfo?.administrative?.[2]?.name || "",
            admin1: state,
            country,
            postcode,
            latitude: latNum,
            longitude: lonNum,
            formattedAddress,
            displayName: formattedAddress,
          },
        });
      }
    } catch (bdcErr) {
      console.warn("BigDataCloud reverse geocode fallback failed:", bdcErr);
    }

    // C. Non-destructive coordinate result (never invent or substitute a distant city!)
    return Response.json({
      result: {
        name: `Location (${latNum.toFixed(4)}, ${lonNum.toFixed(4)})`,
        locality: "",
        city: "",
        district: "",
        admin1: "",
        country: "",
        postcode: "",
        latitude: latNum,
        longitude: lonNum,
        formattedAddress: `Lat: ${latNum.toFixed(4)}, Lon: ${lonNum.toFixed(4)}`,
        displayName: `Lat: ${latNum.toFixed(4)}, Lon: ${lonNum.toFixed(4)}`,
      },
    });
  }

  if (!q || q.length < 2) {
    return Response.json({ results: [] });
  }

  const qLower = q.toLowerCase();
  const matchedKnown = KNOWN_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(qLower) ||
      `${p.name}, ${p.admin1}, ${p.country}`.toLowerCase().includes(qLower) ||
      qLower.includes(p.name.toLowerCase())
  );

  let results = [];

  // 3. OpenStreetMap Nominatim for forward search
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=6&addressdetails=1`,
      {
        headers: {
          "User-Agent": "DengueShield-Surveillance/2.0 (contact@dengueshield.org)",
          "Accept-Language": "en",
        },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (nomRes.ok) {
      const list = await nomRes.json();
      if (Array.isArray(list) && list.length > 0) {
        results = list.map((item) => ({
          id: item.place_id,
          name: item.name || item.address?.village || item.address?.town || item.address?.city || item.address?.suburb || q.split(",")[0].trim(),
          admin1: item.address?.state || item.address?.county || "",
          country: item.address?.country || "",
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
        }));
      }
    }
  } catch {}

  // 4. Open-Meteo Geocoding fallback
  if (results.length === 0) {
    const searchTarget = q.includes(",") ? q.split(",")[0].trim() : q;
    try {
      const omRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTarget)}&count=6&language=en&format=json`,
        { signal: AbortSignal.timeout(4500) }
      );
      if (omRes.ok) {
        const omData = await omRes.json();
        if (omData.results && omData.results.length > 0) {
          results = omData.results.map((item) => ({
            id: item.id,
            name: item.name,
            admin1: item.admin1 || "",
            country: item.country || "",
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            elevation: item.elevation,
          }));
        }
      }
    } catch {}
  }

  // Combine known places if matched
  if (matchedKnown.length > 0) {
    const combined = [...matchedKnown.map((k, idx) => ({ ...k, id: `known-${idx}` }))];
    for (const r of results) {
      if (!combined.some((c) => Math.abs(c.latitude - r.latitude) < 0.05 && Math.abs(c.longitude - r.longitude) < 0.05)) {
        combined.push(r);
      }
    }
    return Response.json({ results: combined.slice(0, 8) });
  }

  return Response.json({ results: results.slice(0, 8) });
}
