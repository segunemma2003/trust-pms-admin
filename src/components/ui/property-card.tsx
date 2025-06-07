
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export type Property = {
  id: string;
  title: string;
  location: string;
  images: string[];
  price: number;
  rating: number;
  reviewCount: number;
  trustLevel?: 1 | 2 | 3 | 4 | 5;
  discount?: number;
  beds: number;
  baths: number;
  sqft?: number;
};

type PropertyCardProps = {
  property: Property;
  className?: string;
};

const PropertyCard = ({ property, className }: PropertyCardProps) => {
  const {
    id,
    title,
    location,
    images,
    price,
    rating,
    reviewCount,
    beds,
    baths,
    sqft
  } = property;

  return (
    <Link to={`/properties/${id}`}>
      <div className={cn('property-card', className)}>
        <div className="relative aspect-[4/3]">
          <img
            src={images[0]}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-airbnb-dark">{title}</h3>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#FF5A5F"
                className="w-4 h-4 mr-1"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-airbnb-dark font-medium">{rating}</span>
              <span className="text-sm text-airbnb-light ml-1">({reviewCount})</span>
            </div>
          </div>
          
          <p className="text-sm text-airbnb-light mt-1">{location}</p>
          
          <div className="flex items-center gap-3 mt-2 text-sm text-airbnb-light">
            <span>{beds} {beds === 1 ? 'bed' : 'beds'}</span>
            <span>•</span>
            <span>{baths} {baths === 1 ? 'bath' : 'baths'}</span>
            {sqft && (
              <>
                <span>•</span>
                <span>{sqft} sqft</span>
              </>
            )}
          </div>
          
          <div className="mt-3">
            <span className="text-lg font-medium text-airbnb-dark">${price}</span>
            <span className="text-sm text-airbnb-light ml-1">night</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
