import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

interface UseSwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  /** Minimum horizontal distance (px) to trigger swipe. Default: 50 */
  threshold?: number;
  /** Max vertical distance (px) allowed. Default: 100 */
  maxVertical?: number;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  maxVertical = 100,
}: UseSwipeOptions): SwipeHandlers {
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    tracking.current = true;
  }, []);

  const onTouchMove = useCallback((_e: React.TouchEvent) => {
    // We only need start/end, but keeping move to potentially cancel
  }, []);

  const onTouchEnd = useCallback(() => {
    // We handle via touchEnd with stored start position
    // Actually we need the end position - let's use a different approach
  }, []);

  // Use a ref for the end handler that captures the last touch position
  const lastTouch = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    lastTouch.current = { x: touch.clientX, y: touch.clientY };
    tracking.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!tracking.current) return;
    const touch = e.touches[0];
    lastTouch.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!tracking.current) return;
    tracking.current = false;

    const dx = lastTouch.current.x - startX.current;
    const dy = lastTouch.current.y - startY.current;

    // Only trigger if horizontal movement exceeds threshold
    // and vertical movement is within tolerance
    if (Math.abs(dx) >= threshold && Math.abs(dy) <= maxVertical) {
      if (dx < 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }
  }, [onSwipeLeft, onSwipeRight, threshold, maxVertical]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
