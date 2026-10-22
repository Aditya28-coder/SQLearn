export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 13.5C8 9.9 13.4 7 20 7s12 2.9 12 6.5v13C32 30.1 26.6 33 20 33S8 30.1 8 26.5v-13Z"
        fill="currentColor"
        opacity=".14"
      />
      <ellipse
        cx="20"
        cy="13"
        rx="12"
        ry="6"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 13v13c0 3.3 5.4 6 12 6s12-2.7 12-6V13M8 19.5c0 3.3 5.4 6 12 6s12-2.7 12-6"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="m27 5 1-3 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="currentColor" />
    </svg>
  );
}
