import { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

const Skeleton = ({ className = "", style }: SkeletonProps) => (
  <span className={`skeleton ${className}`} style={style} aria-hidden="true" />
);

export default Skeleton;
