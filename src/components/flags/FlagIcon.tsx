interface FlagIconProps {
  country: 'GB' | 'BR' | 'FR'
  className?: string
}

export function FlagIcon({ country, className = 'w-6 h-6' }: FlagIconProps) {
  const flags = {
    GB: (
      <svg viewBox="0 0 640 480" className={className}>
        <path fill="#012169" d="M0 0h640v480H0z"/>
        <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
        <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
        <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
        <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
      </svg>
    ),
    BR: (
      <svg viewBox="0 0 640 480" className={className}>
        <g strokeWidth="1pt">
          <path fill="#229e45" fillRule="evenodd" d="M0 0h640v480H0z"/>
          <path fill="#f8e509" fillRule="evenodd" d="m321.4 436 301.5-195.7L319.6 44 17.1 240.7 321.4 436z"/>
          <path fill="#2b49a3" fillRule="evenodd" d="M452.8 240c0 70.3-57.1 127.3-127.6 127.3A127.4 127.4 0 1 1 452.8 240z"/>
          <path fill="#ffffef" fillRule="evenodd" d="M283.3 316.3l-4-2.3-4 2.3 1-4.6-3.4-3.2 4.6-.7 2.2-4.2 2.1 4.2 4.6.7-3.4 3.2m86 26.3-3.9-2.3-4 2.3 1-4.6-3.3-3.2 4.6-.7 2.1-4.2 2.2 4.2 4.6.7-3.4 3.2m-36.2-30-3.4-2-3.5 2 .8-4-2.9-2.7 4-.6 1.8-3.6 1.8 3.7 4 .6-3 2.7m87-8.5-3.4-2-3.5 2 .8-4-2.9-2.7 4-.6 1.8-3.6 1.8 3.7 4 .6-3 2.7m-87.3-22-4-2.2-4 2.3 1-4.7-3.4-3.2 4.6-.7 2.2-4.2 2 4.2 4.7.7-3.4 3.2"/>
          <path fill="#ffffef" fillRule="evenodd" d="m219.3 287.6-3.5-2-3.5 2 .8-4-2.8-2.7 4-.6 1.7-3.6 1.9 3.7 4 .6-3 2.7m-19 16-2.7-1.6-2.7 1.6.6-3.1-2.3-2.2 3.2-.4 1.4-3 1.4 2.9 3.2.5-2.3 2.2"/>
          <path fill="#ffffef" fillRule="evenodd" d="m219.3 287.6-3.5-2-3.5 2 .8-4-2.8-2.7 4-.6 1.7-3.6 1.9 3.7 4 .6-3 2.7m-36.3-4.8-4-2.3-4 2.3 1-4.6-3.3-3.2 4.6-.7 2.1-4.2 2.1 4.2 4.6.7-3.3 3.2m-17-8-3-1.7-3 1.8.8-3.5-2.6-2.4 3.6-.6 1.6-3.3 1.6 3.4 3.6.5-2.6 2.4m-5.4-17-2.7-1.5-2.7 1.6.6-3.1-2.3-2.2 3.2-.5 1.4-2.9 1.4 2.9 3.2.5-2.3 2.2m93-14.5-4-2.3-4 2.3 1-4.6-3.4-3.2 4.6-.7 2.2-4.2 2.1 4.2 4.6.7-3.4 3.2"/>
          <path fill="#ffffef" fillRule="evenodd" d="m247 224.7-3.5-2-3.4 2 .8-4-2.8-2.7 4-.6 1.7-3.6 1.8 3.7 4 .6-2.9 2.7m-88 34.7-3.7-2.2-3.7 2.2 1-4.4-3.2-3 4.4-.6 2-4 2 4 4.4.7-3.2 3"/>
          <path fill="#ffffef" fillRule="evenodd" d="m182.8 217-2.7-1.5-2.7 1.6.6-3.1-2.2-2.2 3.1-.5 1.4-2.9 1.4 2.9 3.2.5-2.3 2.2"/>
        </g>
      </svg>
    ),
    FR: (
      <svg viewBox="0 0 640 480" className={className}>
        <g fillRule="evenodd" strokeWidth="1pt">
          <path fill="#fff" d="M0 0h640v480H0z"/>
          <path fill="#002654" d="M0 0h213.3v480H0z"/>
          <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
        </g>
      </svg>
    ),
  }

  return flags[country]
}
