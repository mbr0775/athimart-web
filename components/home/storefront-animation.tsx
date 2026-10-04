"use client";

import { useState } from "react";
import styles from "./storefront-animation.module.css";

export default function StorefrontAnimation() {
  const [paused, setPaused] = useState(false);

  return (
    <figure className={styles.scene} data-paused={paused}>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 480" role="img" aria-labelledby="store-title store-description">
<title id="store-title">From your store to their door</title>
<desc id="store-description">An orange isometric shop packs a parcel into a white and orange cargo van. A confirmation check appears and the van drives away. The animation repeats every eight seconds.</desc>
<defs>
 <linearGradient id="store-halo" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0dd"/><stop offset="1" stopColor="#eef4ff"/></linearGradient>
 <linearGradient id="store-glass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b5e4da"/><stop offset="1" stopColor="#e6f5f0"/></linearGradient>
 <linearGradient id="store-roof" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffaf75"/><stop offset="1" stopColor="#ff8b50"/></linearGradient>
<linearGradient id="van-body" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffffff"/><stop offset="1" stopColor="#e7f0f1"/></linearGradient>
<linearGradient id="van-window" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#446975"/><stop offset="1" stopColor="#233e4b"/></linearGradient>
</defs>

<ellipse cx="377" cy="234" rx="281" ry="185" fill="url(#store-halo)"/>
<path d="m126 321 261-132 269 132-260 128Z" fill="#dce8fa"/>
<path d="m126 321 270 128v9L126 331Z" fill="#cadbf4"/>
<path d="m396 449 260-128v10L396 458Z" fill="#b9ceeb"/>
<path d="m235 373 130-67 209 101-130 66Z" fill="#f9fbf8" opacity=".65"/>

<path d="m235 309 114-60 148 72-114 61Z" fill="#69857b" opacity=".12"/>

<path d="m221 167 118-60 1 185-119 61Z" fill="#f9e0bf"/>
<path d="m340 107 96 48v185l-96-48Z" fill="#ddbfa0"/>

<path d="m205 158 130-66 115 58-130 66Z" fill="url(#store-roof)"/>
<path d="m205 158 115 58v15l-115-58Z" fill="#ef7842"/>
<path d="m320 216 130-66v15l-130 66Z" fill="#d96334"/>

<path d="m235 228 41-21v76l-41 21Z" fill="url(#store-glass)" stroke="#fff5e5" strokeWidth="5"/>
<path d="m245 237 19-10m-20 26 19-10" stroke="#fff" strokeWidth="3" opacity=".6" strokeLinecap="round"/>

<path d="m287 201 39-20v105l-39 20Z" fill="#435e58"/>
<path d="m294 209 24-12v58l-24 12Z" fill="url(#store-glass)"/>
<path d="m316 270 0 10" stroke="#f7cc97" strokeWidth="3" strokeLinecap="round"/>
<path d="m278 310 56-28 11 6-57 29Z" fill="#fff0da"/>

<path d="m359 195 55 27v61l-55-27Z" fill="url(#store-glass)" stroke="#eed7bc" strokeWidth="5"/>
<path d="m383 208 0 60" stroke="#eed7bc" strokeWidth="4"/>

<path d="m212 194 121-62 12 33-121 62Z" fill="#fff4df"/>
<path d="m212 194 18-9 12 33-18 9Z" className={styles["orange"]}/>
<path d="m248 175 18-9 12 33-18 9Z" className={styles["orange"]}/>
<path d="m284 157 18-9 12 33-18 9Z" className={styles["orange"]}/>
<path d="m320 139 13-7 12 33-13 7Z" className={styles["orange"]}/>
<path d="m224 227 121-62v13l-121 62Z" fill="#fff4df"/>
<path d="m224 227 18-9v13l-18 9Zm36-18 18-9v13l-18 9Zm36-18 18-9v13l-18 9Zm36-19 13-7v13l-13 7Z" className={styles["orange"]}/>

<ellipse cx="186" cy="323" rx="26" ry="9" fill="#5b7b6a" opacity=".1"/>
<path d="m174 301 23 0-4 26h-15Z" fill="#f8ae7c"/>
<path d="M185 301v-41" stroke="#59796b" strokeWidth="6"/>
<ellipse cx="185" cy="253" rx="25" ry="32" fill="#82b89c"/>
<ellipse cx="177" cy="246" rx="15" ry="25" fill="#a1cfad"/>

<g transform="translate(176 125)"><g className={styles["bubble"]}>
 <rect x="-37" y="-37" width="74" height="74" rx="23" fill="#fff" stroke="#f1dfc8"/>
 <path d="m-13-20-16 10 8 13 8-4v24h26V-1l8 4 8-13-16-10c-3 11-23 11-26 0Z" fill="#7ab9a9"/>
</g></g>

<g transform="translate(477 96)"><g className={`${styles.bubble} ${styles.two}`}>
 <rect x="-37" y="-37" width="74" height="74" rx="23" fill="#fff" stroke="#f1dfc8"/>
 <path d="m-21-8-4 34h50L21-8Z" fill="#ffbd8b"/>
 <path d="M-10-4v-10a10 10 0 0 1 20 0v10" fill="none" stroke="#d37c41" strokeWidth="4" strokeLinecap="round"/>
 <path d="m-6 11 5 5 9-10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
</g></g>

<g className={styles["van"]}><g transform="translate(384 232) scale(.52)"><g>
<ellipse cx="231" cy="259" rx="159" ry="15" fill="#233b43" opacity=".12"/>

<path d="M73 111Q71 100 85 98L112 80Q118 76 129 76H304Q314 76 319 85L275 110Z" fill="#ffffff" stroke="#c7d8db" strokeWidth="2"/>
<path d="M73 111Q73 103 84 103H266Q276 103 282 113L317 153 343 164Q350 168 350 180V224L319 235H314Q312 203 289 203Q266 203 264 235H154Q152 203 128 203Q104 203 102 235H82Q73 235 73 225Z" fill="url(#van-body)" stroke="#bed1d4" strokeWidth="2" strokeLinejoin="round"/>

<path d="M279 112 318 89 357 131 317 153Z" fill="#355768" stroke="#e0eef1" strokeWidth="4" strokeLinejoin="round"/>
<path d="m289 111 29-16 24 26-29 17Z" fill="#668b99" opacity=".65"/>
<path d="M317 153 357 131 383 145 347 166Z" fill="#eaf3f4" stroke="#c7d8db" strokeWidth="2"/>
<path d="m350 169 35-21v54q0 8-8 13l-28 17Z" fill="#c8dadd" stroke="#adc6cc" strokeWidth="2"/>

<path d="M74 178H338L350 184V201H308Q292 189 276 201H141Q128 190 113 201H74Z" fill="#ff7900"/>
<path d="M104 235a24 31 0 0 1 48 0M265 235a24 31 0 0 1 48 0" fill="#233b43"/>

<path d="M94 118v54m0 32v15M220 114v107M110 120h97v49h-97Z" fill="none" stroke="#c3d5d9" strokeWidth="2"/>
<path d="M105 223h111m23 0h21" stroke="#a9bfc5" strokeWidth="4" strokeLinecap="round"/>
<rect x="194" y="176" width="16" height="5" rx="2.5" fill="#526f77"/>

<path d="M234 119H265L295 151H234Z" fill="url(#van-window)" stroke="#385964" strokeWidth="2" strokeLinejoin="round"/>
<path d="m244 122 27 28h-9l-26-28Z" fill="#ffffff" opacity=".22"/>
<path d="M229 116v94m0-49h76l14 32" fill="none" stroke="#acc5ca" strokeWidth="2"/>
<rect x="239" y="169" width="16" height="5" rx="2.5" fill="#526f77"/>
<path d="m296 148 12 4" stroke="#314d59" strokeWidth="4"/>
<rect x="303" y="140" width="13" height="20" rx="5" fill="#314d59"/>

<path d="m353 177 10-6v10l-10 6Z" fill="#fff8cf" stroke="#91acb7" strokeWidth="1.5"/>
<path d="m377 163 7-4v10l-7 4Z" fill="#fff8cf" stroke="#91acb7" strokeWidth="1.5"/>
<path d="m357 192 24-14v13l-24 14Z" fill="#314d59"/>
<path d="m359 194 20-12m-20 16 20-12" stroke="#75909a" strokeWidth="1.5"/>
<path d="m349 218 36-21v10l-36 22Z" fill="#4c6873"/>
<path d="m362 212 12-7v6l-12 7Z" fill="#f3f7f7"/>
<path d="M73 205h8v14h-8" fill="#ed655c"/>

<g transform="translate(159 145)"><path d="m-17-7 17-9 17 9-17 9Z" fill="#ff7900"/><path d="m-17-7 17 9v19l-17-9Z" fill="#e96b37"/><path d="m0 2 17-9v19L0 21Z" fill="#ffab76"/><path d="m-6-13 17 9v7l-5 3v-7l-17-9Z" fill="#ffe7d5"/></g>

<g transform="translate(128 232) scale(.85 1)">
<circle r="24" fill="#233640"/><circle r="20" fill="#344a54"/>
<circle r="14" fill="#becdd3"/>
<g className={styles["van-wheel"]}><circle r="11" fill="#6c8592"/>
<path d="M0-10v20M-10 0h20M-7-7 7 7M-7 7 7-7" stroke="#dbe5ea" strokeWidth="3"/>
</g><circle r="4" fill="#edf3f5"/>
</g>
<g transform="translate(289 232) scale(.85 1)">
<circle r="24" fill="#233640"/><circle r="20" fill="#344a54"/>
<circle r="14" fill="#becdd3"/>
<g className={styles["van-wheel"]}><circle r="11" fill="#6c8592"/>
<path d="M0-10v20M-10 0h20M-7-7 7 7M-7 7 7-7" stroke="#dbe5ea" strokeWidth="3"/>
</g><circle r="4" fill="#edf3f5"/>
</g>
</g></g></g>

<g className={styles["parcel"]}>
 <path d="m330 277 23-12 24 12-23 12Z" fill="#ffd3a0"/>
 <path d="m330 277 24 12v31l-24-12Z" fill="#edae71"/>
 <path d="m354 289 23-12v31l-23 12Z" fill="#d99152"/>
 <path d="m339 272 24 12 0 10 7-4v-9l-24-12Z" fill="#fff0d2"/>
</g>

<g className={styles["notification"]}>
 <circle cx="508" cy="174" r="32" fill="#fff"/>
 <circle cx="508" cy="174" r="25" fill="#62b99b"/>
 <path d="m496 174 8 8 16-17" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
</g>
<g className={styles["sparkle"]} fill="#f8b778"><path d="m560 140 4 11 11 4-11 4-4 11-4-11-11-4 11-4Z"/><path d="m118 221 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/></g>
</svg>
      <button className={styles.pause} type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
        {paused ? "Play animation" : "Pause animation"}
      </button>
    </figure>
  );
}
