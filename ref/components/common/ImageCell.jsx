import { useState, useEffect, useMemo } from "react";

const ImageCell = ({
  src,
  fallback,
  alt = "image",
  width = 40,
  height = 20,
  className = "",
}) => {
  const cacheBustedSrc = useMemo(() => {
    if (!src) return fallback;
    return `${src}${src.includes("?") ? "&" : "?"}t=${Date.now()}`;
  }, [src, fallback]);

  const [imgSrc, setImgSrc] = useState(cacheBustedSrc);
  // console.log(imgSrc, "imgSrc");
  useEffect(() => {
    setImgSrc(cacheBustedSrc);
  }, [cacheBustedSrc]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      width={width}
      height={height}
      onError={() => setImgSrc(fallback)}
      className={`object-cover rounded border block ${className}`}
    />
  );
};

export default ImageCell;
