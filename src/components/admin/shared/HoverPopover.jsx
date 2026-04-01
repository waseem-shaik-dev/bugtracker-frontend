import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function HoverPopover({ children, content }) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const popupRef = useRef(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 8, // 8px spacing
        left: rect.left + window.scrollX,
      });
      setShow(true);
    }
  };

  const handleMouseLeave = () => {
    setShow(false);
  };

  // Adjust position if popup goes off screen
  useEffect(() => {
    if (show && popupRef.current) {
      const popupRect = popupRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newLeft = coords.left;
      let newTop = coords.top;

      if (popupRect.right > viewportWidth) {
        newLeft = coords.left - (popupRect.right - viewportWidth) - 16;
      }
      if (popupRect.bottom > viewportHeight) {
        newTop = coords.top - popupRect.height - 40; // show above
      }

      if (newLeft !== coords.left || newTop !== coords.top) {
        setCoords({ top: newTop, left: newLeft });
      }
    }
  }, [show]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block relative"
    >
      {children}
      {show &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              top: coords.top,
              left: coords.left,
              position: "absolute",
              zIndex: 9999,
            }}
            className="animate-slide-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 min-w-[280px]"
            onMouseEnter={() => setShow(true)} // Keep open if hovering over popup
            onMouseLeave={() => setShow(false)}
          >
            {content}
          </div>,
          document.body
        )}
    </div>
  );
}
