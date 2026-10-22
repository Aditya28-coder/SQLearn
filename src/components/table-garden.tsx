export function TableGarden() {
  return (
    <svg
      className="table-garden"
      viewBox="0 0 370 230"
      role="img"
      aria-labelledby="garden-title garden-description"
    >
      <title id="garden-title">Small beginnings grow into SQL confidence</title>
      <desc id="garden-description">
        A table of students with ID, name and city columns. A small sprout grows
        next to it.
      </desc>
      <ellipse cx="199" cy="204" rx="143" ry="12" fill="#DCD5ED" opacity=".5" />
      <g transform="rotate(-5 170 105)">
        <rect
          x="39"
          y="36"
          width="253"
          height="154"
          rx="15"
          fill="#fff"
          stroke="#DDD4EC"
          strokeWidth="1.5"
        />
        <path
          d="M54 36h223a15 15 0 0 1 15 15v24H39V51a15 15 0 0 1 15-15Z"
          fill="#E7DDF8"
        />
        <g
          fontFamily="Nunito Variable, sans-serif"
          fontSize="13"
          fill="#565068"
        >
          <text x="57" y="61" fontWeight="750">
            id
          </text>
          <text x="104" y="61" fontWeight="750">
            name
          </text>
          <text x="217" y="61" fontWeight="750">
            city
          </text>
          <text x="57" y="101">
            1
          </text>
          <text x="104" y="101">
            Aanya
          </text>
          <text x="217" y="101">
            Pune
          </text>
          <text x="57" y="137">
            2
          </text>
          <text x="104" y="137">
            Kabir
          </text>
          <text x="217" y="137">
            Mumbai
          </text>
          <text x="57" y="173">
            3
          </text>
          <text x="104" y="173">
            Meera
          </text>
          <text x="217" y="173">
            Pune
          </text>
        </g>
        <path d="M51 114h228M51 150h228" stroke="#F0EDF4" />
      </g>
      <g className="garden-sprout">
        <path
          d="M294 169v-40"
          stroke="#5A8572"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M293 151c-21 0-31-12-28-25 19-2 30 9 28 25Z" fill="#A8CAB5" />
        <path d="M295 141c19-1 28-13 24-25-18-1-26 11-24 25Z" fill="#7EAD93" />
        <path d="M273 166h43l-6 30h-31l-6-30Z" fill="#E8B6B7" />
        <path
          d="M273 169h43"
          stroke="#CA8F96"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <g stroke="#9B86B6" strokeWidth="1.7" strokeLinecap="round">
        <path d="M320 52v12m-6-6h12M30 137v8m-4-4h8" />
        <path
          d="m337 91 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z"
          fill="#F3D5DD"
          stroke="none"
        />
      </g>
      <g transform="rotate(7 288 54)">
        <rect x="261" y="36" width="65" height="27" rx="13.5" fill="#F8EDF2" />
        <text
          x="275"
          y="54"
          fontFamily="Nunito Variable, sans-serif"
          fontSize="12"
          fontWeight="750"
          fill="#86576B"
        >
          hello, SQL
        </text>
      </g>
    </svg>
  );
}
