import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { toast } from '@/components/ui/toast-store';
import { MapPin, Plus, Trash2, Loader2, Navigation, GraduationCap, Heart, ShoppingBag, Bus, Clapperboard, Building } from 'lucide-react';
import { FloatingInput, FloatingSelect } from '../ui/FloatingInput';

const ICON_MAP: Record<string, React.ElementType> = {
  'graduation-cap': GraduationCap,
  'stethoscope': Heart,
  'shopping-bag': ShoppingBag,
  'bus': Bus,
  'film': Clapperboard,
  'landmark': Building,
  'navigation': Navigation
};

const CATEGORY_MAP = [
  { id: 'education', types: ['school', 'university'], title: 'Education', icon: 'graduation-cap' },
  { id: 'healthcare', types: ['hospital', 'pharmacy'], title: 'Healthcare', icon: 'stethoscope' },
  { id: 'shopping', types: ['shopping_mall', 'supermarket'], title: 'Shopping', icon: 'shopping-bag' },
  { id: 'transport', types: ['bus_station', 'train_station', 'transit_station'], title: 'Transport', icon: 'bus' },
  { id: 'entertainment', types: ['movie_theater', 'park'], title: 'Entertainment', icon: 'film' },
  { id: 'banking', types: ['bank', 'atm'], title: 'Banking', icon: 'landmark' },
];

const CONNECTIVITY_ICONS = [
  { value: 'bus', label: 'Bus / Transit' },
  { value: 'train', label: 'Train / Railway' },
  { value: 'plane', label: 'Airport' },
  { value: 'navigation', label: 'Highway / Road' },
  { value: 'map-pin', label: 'General Location' }
];

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
}

export default function Step4Localities() {
  const { watch, setValue, control, register, formState: { errors } } = useFormContext();
  const [isFetching, setIsFetching] = useState(false);

  const lat = watch('latitude');
  const lng = watch('longitude');
  
  // We only read the categories to display them (Read-Only)
  const categories = watch('localityData.categories') || [];

  const { fields: connFields, append: appendConn, remove: removeConn } = useFieldArray({
    control,
    name: 'localityData.connectivity'
  });

  const fetchNearbyPlaces = async () => {
    if (!lat || !lng) {
      toast.error('Latitude and longitude are required. Please set them in Step 3.');
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      toast.error('Google Maps API key is missing. Please configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.');
      return;
    }

    setIsFetching(true);
    try {
      const results = await Promise.all(CATEGORY_MAP.map(async (cat) => {
        const body = {
          includedTypes: cat.types,
          maxResultCount: 4,
          locationRestriction: {
            circle: {
              center: { latitude: Number(lat), longitude: Number(lng) },
              radius: 3000 // 3km radius
            }
          }
        };

        const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
          method: 'POST',
          headers: {
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.displayName,places.location',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          throw new Error('Failed to fetch from Google Places API');
        }

        const data = await res.json();
        
        const places = (data.places || []).map((p: any) => {
          const plat = p.location?.latitude;
          const plng = p.location?.longitude;
          let distance = '';
          if (plat && plng) {
            distance = haversineDistance(Number(lat), Number(lng), plat, plng) + ' km';
          }
          return {
            name: p.displayName?.text || 'Unknown Place',
            distance
          };
        }).sort((a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance));

        return {
          title: cat.title,
          icon: cat.icon,
          places
        };
      }));

      const filledCategories = results.filter(c => c.places.length > 0);
      setValue('localityData.categories', filledCategories, { shouldValidate: true, shouldDirty: true });
      toast.success('Nearby places successfully populated from Google Maps!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch nearby places. Check your API Key permissions.');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="!space-y-10">
      
      {/* ── Auto-Fetch Section ── */}
      <div>
        <h3 className="!text-[15px] !font-bold !text-gray-900 dark:!text-white !uppercase !tracking-wider !mb-2">
          Localities &amp; Places Nearby
        </h3>
        <p className="!text-sm !text-gray-500 dark:!text-gray-400 !mb-6">
          Highlight important places near the property. These categories are automatically populated using Google Maps to ensure accuracy.
        </p>

        {!lat || !lng ? (
          <div className="!p-5 !bg-yellow-50 dark:!bg-yellow-500/10 !border !border-yellow-100 dark:!border-yellow-500/20 !rounded-xl !text-sm !text-yellow-800 dark:!text-yellow-600 !flex !items-center !gap-3">
            <MapPin className="!w-5 !h-5 !shrink-0" />
            <p>Please set the exact map location (Latitude & Longitude) in Step 3 to use the auto-fetch feature.</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={fetchNearbyPlaces}
            disabled={isFetching}
            className="!flex !items-center !justify-center !gap-2 !w-full sm:!w-auto !px-6 !py-3.5 !bg-[#27427f] !text-white !rounded-xl hover:!bg-[#1c2f5a] disabled:!opacity-70 disabled:!cursor-not-allowed !transition-all !font-medium !shadow-sm"
          >
            {isFetching ? <Loader2 className="!w-5 !h-5 !animate-spin" /> : <MapPin className="!w-5 !h-5" />}
            {isFetching ? 'Fetching from Google Places...' : 'Auto-Populate Nearby Places'}
          </button>
        )}
      </div>

      {/* ── Read-Only Categories Display ── */}
      {categories.length > 0 && (
        <div className="!space-y-5 !border-t !border-gray-100 dark:!border-[#262730] !pt-8">
          <h4 className="!text-sm !font-bold !text-gray-900 dark:!text-white !uppercase !tracking-wider">Fetched Categories</h4>
          
          <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 !gap-5">
            {categories.map((category: any, idx: number) => {
              const Icon = ICON_MAP[category.icon] || MapPin;
              return (
                <div key={idx} className="!bg-gray-50 dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !rounded-[20px] !p-6">
                  <div className="!flex !items-center !gap-3 !mb-5">
                    <div className="!w-10 !h-10 !rounded-full !bg-white dark:!bg-[#0f1015] !border !border-gray-200 dark:!border-[#262730] !flex !items-center !justify-center !shrink-0 !text-blue-600 dark:!text-blue-500">
                      <Icon className="!w-5 !h-5" />
                    </div>
                    <h5 className="!font-semibold !text-gray-900 dark:!text-white">{category.title}</h5>
                  </div>
                  <ul className="!space-y-3">
                    {category.places.map((place: any, pIdx: number) => (
                      <li key={pIdx} className="!flex !items-center !justify-between !gap-3">
                        <span className="!text-sm !text-gray-600 dark:!text-gray-400 !truncate" title={place.name}>{place.name}</span>
                        <span className="!text-[11px] !font-medium !text-gray-500 !bg-white dark:!bg-[#0f1015] !border !border-gray-200 dark:!border-[#262730] !px-2 !py-1 !rounded-md !whitespace-nowrap">
                          {place.distance}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Connectivity Highlights (Manual) ── */}
      <div className="!space-y-6 !border-t !border-gray-100 dark:!border-[#262730] !pt-8">
        <div className="!flex !items-center !justify-between !mb-2">
          <div>
            <h4 className="!text-sm !font-bold !text-gray-900 dark:!text-white !uppercase !tracking-wider">Connectivity Highlights</h4>
            <p className="!text-xs !text-gray-500 dark:!text-gray-400 !mt-1">Manually highlight key transport connections or nearby highways.</p>
          </div>
          <button
            type="button"
            onClick={() => appendConn({ icon: 'bus', label: '', detail: '' })}
            className="!flex !items-center !gap-1.5 !px-4 !py-2 !bg-blue-50 dark:!bg-blue-500/10 !text-blue-600 dark:!text-blue-400 !rounded-lg hover:!bg-blue-100 dark:hover:!bg-blue-500/20 !transition-colors !text-sm !font-semibold"
          >
            <Plus className="!w-4 !h-4" /> Add
          </button>
        </div>
        
        {connFields.length === 0 ? (
          <div className="!text-center !py-8 !border-2 !border-dashed !border-gray-200 dark:!border-[#262730] !rounded-2xl">
            <p className="!text-sm !text-gray-500">No connectivity highlights added.</p>
          </div>
        ) : (
          <div className="!space-y-4">
            {connFields.map((field: any, index) => {
              const errorObj = (errors?.localityData as any)?.connectivity?.[index];
              return (
                <div key={field.id} className="!relative !bg-white dark:!bg-[#171821] !border !border-gray-200 dark:!border-[#262730] !p-5 !rounded-2xl !pl-12">
                  <button 
                    type="button" 
                    onClick={() => removeConn(index)} 
                    className="!absolute !top-1/2 !-translate-y-1/2 !left-3 !p-1.5 !text-gray-400 hover:!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-500/10 !rounded-lg !transition-colors"
                  >
                    <Trash2 className="!w-4 !h-4" />
                  </button>
                  
                  <div className="!grid !grid-cols-1 md:!grid-cols-12 !gap-4">
                    <div className="md:!col-span-3">
                      <FloatingSelect 
                        id={`localityData.connectivity.${index}.icon`}
                        label="Icon"
                        options={CONNECTIVITY_ICONS}
                        registerProps={register(`localityData.connectivity.${index}.icon` as const)}
                      />
                    </div>
                    <div className="md:!col-span-4">
                      <FloatingInput 
                        id={`localityData.connectivity.${index}.label`}
                        label="Label (e.g., Highway)"
                        registerProps={register(`localityData.connectivity.${index}.label` as const)}
                        error={errorObj?.label?.message}
                      />
                    </div>
                    <div className="md:!col-span-5">
                      <FloatingInput 
                        id={`localityData.connectivity.${index}.detail`}
                        label="Detail (e.g., 5 mins away)"
                        registerProps={register(`localityData.connectivity.${index}.detail` as const)}
                        error={errorObj?.detail?.message}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
