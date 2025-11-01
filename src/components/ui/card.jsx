import React from "react";

export function Card({ className = "", children, ...props }) {
  return (
    <div className={`poster rounded-3xl shadow-poster border border-black/5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={`p-5 sm:p-6 border-b border-black/5 ${className}`}>{children}</div>;
}

export function CardContent({ className = "", children }) {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ className = "", children }) {
  return <div className={`p-5 sm:p-6 border-t border-black/5 ${className}`}>{children}</div>;
}
