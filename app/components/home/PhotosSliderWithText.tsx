import { memo } from 'react';
import { ServicesSection } from './ServicesSection';

export const PhotosSliderWithText = memo(function PhotosSliderWithText({
  data,
}: {
  data?: any;
}) {
  return <ServicesSection data={data} />;
});

export default PhotosSliderWithText;
