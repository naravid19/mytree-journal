import React, { useEffect } from 'react';
import Image from 'next/image';
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { Image as TreeImage } from '../../app/types';
import { getSecureImageUrl } from '../../app/utils';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: TreeImage[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]); // Dependencies for closure freshness

  if (!isOpen || !images || images.length === 0) return null;

  const handlePrev = () => {
    onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <div
      className="fixed inset-0 z-30000 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30001 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
      >
        <HiX className="w-8 h-8" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30001 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110"
          >
            <HiChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30001 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110"
          >
            <HiChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Main Image */}
      <div
        className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={getSecureImageUrl(images[currentIndex].image)}
          alt={`Image ${currentIndex + 1}`}
          fill
          className="object-contain"
          quality={100}
          priority
        />

        {/* Image Counter */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};
