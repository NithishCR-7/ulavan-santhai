"use client";
import { useRef } from "react";
export default function ReferenceInteractions({ children }) {
  const root = useRef(null);
  function handleClick(event) {
    const container = root.current;
    const dialog = container.querySelector("#notice");
    const action = event.target.closest("[data-action]");
    if (action) {
      event.preventDefault();
      const label = action.dataset.action;
      container.querySelector("#notice-title").textContent = label;
      container.querySelector("#notice-copy").textContent = ["Terms", "Privacy"].includes(label) ? `The published ${label.toLowerCase()} policy has not been provided yet.` : "Contact details have not been provided yet.";
      dialog.showModal();
    }
    if (event.target.closest(".close, #dismiss")) dialog.close();
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }
  }
  return <div ref={root} onClick={handleClick}>{children}</div>;
}
