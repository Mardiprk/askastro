import Image from 'next/image';
import { FC } from 'react';

interface CarouselSlideProps {
  image: string;
  title: string;
  description: string;
  index: number;
  currentIndex: number;
}

const CarouselSlide: FC<CarouselSlideProps> = ({
  image,
  title,
  description,
  index,
  currentIndex
}) => {
  const isActive = index === currentIndex;

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ${
        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
      }`}
    >
      <div className="relative h-full w-full">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          {/* Grain texture overlay */}
          <div 
            className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '200px 200px'
            }}
          />
        </div>
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h3 className="text-3xl font-eb-garamond font-medium mb-2">{title}</h3>
          <p className="text-white/90 mb-6 max-w-xl text-sm">
            {description}
          </p>
          {/* Designer attribution - Redesigned */}
          <div className="mt-6 flex items-center">
            <div className="relative overflow-hidden px-4 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center group hover:bg-white/20 transition-all duration-300 border border-white/20">
              <span className="text-xs italic text-white/50 mr-2">Designs by:</span>
              <span className="text-base italic text-white">Reve</span>
              <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-r from-transparent to-black/20 group-hover:to-black/30 transition-colors"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselSlide; 