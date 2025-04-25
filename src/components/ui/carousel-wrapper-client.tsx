'use client';

import dynamic from 'next/dynamic';

const CarouselWrapper = dynamic(() => import('./carousel-wrapper'), {
  ssr: false,
});

export default CarouselWrapper;