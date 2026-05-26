import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateProperty } from '../../hooks/useProperties';
import { COMMON_AMENITIES, MAJOR_CITIES } from '@metriva/shared';

const schema = z.object({
  title: z.string().min(10).max(150),
  description: z.string().min(50).max(5000),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'PLOT', 'COMMERCIAL', 'OFFICE', 'SHOP', 'WAREHOUSE', 'FARMHOUSE']),
  listingType: z.enum(['BUY', 'RENT', 'COMMERCIAL']),
  address: z.string().min(5),
  locality: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
  price: z.coerce.number().positive(),
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  builtUpArea: z.coerce.number().positive().optional(),
  furnishing: z.enum(['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED']).optional(),
  amenities: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof schema>;

export default function PostProperty() {
  const navigate = useNavigate();
  const { mutate: create, isPending } = useCreateProperty();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { listingType: 'BUY', amenities: [] },
  });

  const selectedAmenities = watch('amenities') ?? [];

  const onSubmit = (data: FormData) => {
    create({ ...data, price: data.price * 100 }, {
      onSuccess: () => navigate('/dashboard/properties'),
    });
  };

  const toggleAmenity = (a: string) => {
    const current = selectedAmenities;
    setValue('amenities', current.includes(a) ? current.filter((x) => x !== a) : [...current, a]);
  };

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-2xl font-bold mb-2">Post a Property</h1>
      <p className="text-muted-foreground mb-8">Fill in the details below. Our AI will score your listing automatically.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium">Listing Type</label>
              <div className="flex gap-3 mt-1.5">
                {(['BUY', 'RENT', 'COMMERCIAL'] as const).map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input {...register('listingType')} type="radio" value={t} className="accent-brand-500" />
                    <span className="text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Property Title *</label>
              <input {...register('title')} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g., 3BHK Apartment in Bandra West with Sea View" />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Property Type *</label>
              <select {...register('type')} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-brand-500">
                {['APARTMENT', 'HOUSE', 'VILLA', 'PLOT', 'COMMERCIAL', 'OFFICE', 'SHOP'].map((t) => (
                  <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Price (₹) *</label>
              <input {...register('price')} type="number" className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="15000000" />
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description *</label>
            <textarea {...register('description')} rows={5} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-brand-500 resize-none" placeholder="Describe the property — features, nearby places, why it's special..." />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
          </div>
        </section>

        {/* Location */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium">Full Address *</label>
              <input {...register('address')} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="Flat 12A, Building Name, Street" />
            </div>
            <div>
              <label className="text-sm font-medium">Locality *</label>
              <input {...register('locality')} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder="Bandra West" />
            </div>
            <div>
              <label className="text-sm font-medium">City *</label>
              <input {...register('city')} list="cities-list" className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-brand-500" />
              <datalist id="cities-list">{MAJOR_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label className="text-sm font-medium">State *</label>
              <input {...register('state')} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="text-sm font-medium">Pincode *</label>
              <input {...register('pincode')} maxLength={6} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
        </section>

        {/* Property Details */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Property Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-sm font-medium">Bedrooms</label><input {...register('bedrooms')} type="number" min="0" className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div><label className="text-sm font-medium">Bathrooms</label><input {...register('bathrooms')} type="number" min="0" className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div><label className="text-sm font-medium">Built-up Area (sqft)</label><input {...register('builtUpArea')} type="number" className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-brand-500" /></div>
          </div>
          <div>
            <label className="text-sm font-medium">Furnishing</label>
            <select {...register('furnishing')} className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Select furnishing status</option>
              <option value="UNFURNISHED">Unfurnished</option>
              <option value="SEMI_FURNISHED">Semi-Furnished</option>
              <option value="FULLY_FURNISHED">Fully Furnished</option>
            </select>
          </div>
        </section>

        {/* Amenities */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {COMMON_AMENITIES.map((amenity) => (
              <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${selectedAmenities.includes(amenity) ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-accent'}`}>
                {amenity}
              </button>
            ))}
          </div>
        </section>

        <button type="submit" disabled={isPending} className="w-full py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-base">
          {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
          Submit for Review
        </button>
      </form>
    </div>
  );
}
