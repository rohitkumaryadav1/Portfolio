'use client';
import { useState } from 'react';
export function ProfilePortrait({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="portrait">
      {src && !failed ? (
        <img
          src={src}
          alt={`${name} portrait`}
          loading="lazy"
          fetchPriority="low"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="portrait-placeholder">
          RKY<span>Portrait coming soon</span>
        </div>
      )}
      <span className="photo-label">THE PERSON BEHIND THE PROJECTS</span>
    </div>
  );
}
