
import React, { useEffect, useCallback } from "react";
import { Modal } from "flowbite-react";
import { HiX, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import Image from "next/image";

interface ImageViewerModalProps {
  show: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  show,
  onClose,
  images,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  // Update index when initialIndex changes or modal opens
  useEffect(() => {
    if (show) {
      setCurrentIndex(initialIndex);
    }
  }, [show, initialIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, handlePrev, handleNext, onClose]);

  if (!show || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-110 p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition-all transform hover:scale-110"
        aria-label="Close"
      >
        <HiX className="w-8 h-8" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-110 p-3 rounded-full bg-black/30 hover:bg-white/10 text-white transition-all transform hover:scale-110 backdrop-blur-sm"
            aria-label="Previous"
          >
            <HiChevronLeft className="w-10 h-10" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-110 p-3 rounded-full bg-black/30 hover:bg-white/10 text-white transition-all transform hover:scale-110 backdrop-blur-sm"
            aria-label="Next"
          >
            <HiChevronRight className="w-10 h-10" />
          </button>
        </>
      )}

      {/* Image Counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-110 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md text-white font-kanit text-sm tracking-wider">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Image Container */}
      <div className="relative w-full h-full max-w-[95vw] max-h-[90vh] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="relative w-auto h-auto max-w-full max-h-full">
            <img
            src={images[currentIndex]}
            alt={`View ${currentIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-in"
            />
        </div>
      </div>
    </div>
  );
};
