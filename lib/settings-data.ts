// ─────────────────────────────────────────────────────────────────────────────
// Sound packs
// ─────────────────────────────────────────────────────────────────────────────

export type SoundPack =
  | "default"
  | "cherrymx-black-pbt"
  | "cherrymx-blue-pbt"
  | "cherrymx-brown-pbt"
  | "cherrymx-red-pbt"
  | "mx-speed-silver"
  | "eg-oreo"
  | "topre-purple";

export interface SoundPackOption {
  id: SoundPack;
  label: string;
  url: string;
  configUrl?: string;
}

export const SOUND_PACKS: SoundPackOption[] = [
  { id: "default",            label: "Classic",          url: "/sounds/sound.ogg" },
  { id: "cherrymx-black-pbt", label: "Cherry MX Black",  url: "/sounds/cherrymx-black-pbt/sound.ogg",          configUrl: "/sounds/cherrymx-black-pbt/config.json" },
  { id: "cherrymx-blue-pbt",  label: "Cherry MX Blue",   url: "/sounds/cherrymx-blue-pbt/sound.ogg",           configUrl: "/sounds/cherrymx-blue-pbt/config.json" },
  { id: "cherrymx-brown-pbt", label: "Cherry MX Brown",  url: "/sounds/cherrymx-brown-pbt/sound.ogg",          configUrl: "/sounds/cherrymx-brown-pbt/config.json" },
  { id: "cherrymx-red-pbt",   label: "Cherry MX Red",    url: "/sounds/cherrymx-red-pbt/sound.ogg",            configUrl: "/sounds/cherrymx-red-pbt/config.json" },
  { id: "mx-speed-silver",    label: "MX Speed Silver",  url: "/sounds/mx-speed-silver/mx-speed-silver-1.wav", configUrl: "/sounds/mx-speed-silver/config.json" },
  { id: "eg-oreo",            label: "EG Oreo",          url: "/sounds/eg-oreo/oreo.ogg",                      configUrl: "/sounds/eg-oreo/config.json" },
  { id: "topre-purple",       label: "Topre Purple",     url: "/sounds/topre-purple-hybrid-pbt/sound.ogg",     configUrl: "/sounds/topre-purple-hybrid-pbt/config.json" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Accent colours
// ─────────────────────────────────────────────────────────────────────────────

export type AccentColor =
  | "teal" | "red" | "amber" | "purple" | "green" | "rose" | "blue" | "orange"
  | "cyan" | "pink" | "indigo" | "lime" | "violet" | "lightgreen" | "sky"
  | "coral" | "mint" | "gold" | "lavender";

export const ACCENT_COLORS: { id: AccentColor; label: string; swatch: string }[] = [
  { id: "teal",       label: "Teal",        swatch: "oklch(0.55 0.13 200)" },
  { id: "red",        label: "Red",         swatch: "oklch(0.55 0.22 25)"  },
  { id: "amber",      label: "Amber",       swatch: "oklch(0.72 0.18 75)"  },
  { id: "purple",     label: "Purple",      swatch: "oklch(0.58 0.2 295)"  },
  { id: "green",      label: "Green",       swatch: "oklch(0.58 0.17 145)" },
  { id: "rose",       label: "Rose",        swatch: "oklch(0.6 0.2 355)"   },
  { id: "blue",       label: "Blue",        swatch: "oklch(0.55 0.2 255)"  },
  { id: "orange",     label: "Orange",      swatch: "oklch(0.68 0.2 50)"   },
  { id: "cyan",       label: "Cyan",        swatch: "oklch(0.6 0.14 220)"  },
  { id: "pink",       label: "Pink",        swatch: "oklch(0.62 0.22 330)" },
  { id: "indigo",     label: "Indigo",      swatch: "oklch(0.55 0.22 270)" },
  { id: "lime",       label: "Lime",        swatch: "oklch(0.72 0.2 125)"  },
  { id: "violet",     label: "Violet",      swatch: "oklch(0.58 0.25 308)" },
  { id: "lightgreen", label: "Light Green", swatch: "oklch(0.72 0.18 155)" },
  { id: "sky",        label: "Sky",         swatch: "oklch(0.62 0.16 235)" },
  { id: "coral",      label: "Coral",       swatch: "oklch(0.65 0.2 35)"   },
  { id: "mint",       label: "Mint",        swatch: "oklch(0.72 0.13 175)" },
  { id: "gold",       label: "Gold",        swatch: "oklch(0.75 0.17 90)"  },
  { id: "lavender",   label: "Lavender",    swatch: "oklch(0.65 0.16 285)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Font sizes
// ─────────────────────────────────────────────────────────────────────────────

export type FontSize = "xs" | "sm" | "md" | "lg" | "xl";

export const FONT_SIZES: { id: FontSize; label: string; rem: string }[] = [
  { id: "xs", label: "XS", rem: "1rem"    },
  { id: "sm", label: "SM", rem: "1.25rem" },
  { id: "md", label: "MD", rem: "1.5rem"  },
  { id: "lg", label: "LG", rem: "1.875rem"},
  { id: "xl", label: "XL", rem: "2.25rem" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Typing fonts
// ─────────────────────────────────────────────────────────────────────────────

export type TypingFont =
  // Mono
  | "geist-mono" | "jetbrains-mono" | "fira-code" | "source-code-pro"
  | "ibm-plex-mono" | "roboto-mono" | "space-mono" | "inconsolata"
  | "cascadia-code" | "0xproto" | "overpass-mono" | "ubuntu-mono"
  | "oxygen-mono" | "courier-prime" | "dm-mono" | "red-hat-mono"
  | "martian-mono" | "anonymous-pro" | "share-tech-mono" | "chivo-mono"
  | "victor-mono" | "azeret-mono" | "hack" | "fira-mono" | "pt-mono" | "cousine" | "cutive-mono"
  | "vt323" | "major-mono-display" | "nova-mono"
  // Display / Sans
  | "atkinson-hyperlegible" | "comfortaa" | "coming-soon" | "geist-sans"
  | "ibm-plex-sans" | "inter-tight" | "itim" | "kanit" | "lalezar" | "lato"
  | "lexend-deca" | "montserrat" | "nunito" | "oxygen" | "parkinsans"
  | "roboto" | "sarabun" | "space-grotesk" | "titillium-web" | "ubuntu"
  | "georgia" | "helvetica" | "sf-pro" | "poppins" | "raleway" | "work-sans"
  | "plus-jakarta-sans" | "dm-sans" | "outfit" | "figtree" | "manrope"
  | "rubik" | "quicksand" | "josefin-sans" | "sora" | "barlow" | "cabin"
  | "exo-2" | "inter" | "bebas-neue" | "oswald" | "noto-sans" | "pacifico" | "archivo" | "syne" | "arvo" | "bitter" | "karla" | "public-sans"
  | "jost" | "heebo" | "prompt" | "rajdhani" | "teko" | "lexend" | "catamaran" | "cairo"
  // Serif
  | "playfair-display" | "merriweather" | "lora" | "eb-garamond"
  | "libre-baskerville" | "crimson-pro" | "cinzel" | "cormorant-garamond" | "zilla-slab"
  // Handwriting
  | "caveat" | "patrick-hand" | "indie-flower" | "architects-daughter"
  | "permanent-marker" | "shadows-into-light" | "dancing-script" | "amatic-sc" | "sacramento";

export interface FontOption {
  id: TypingFont;
  label: string;
  googleFamily: string | null;
  cssFamily: string;
  tag?: "mono" | "display" | "serif" | "handwriting";
}

export const FONT_OPTIONS: FontOption[] = [
  // ── Mono ────────────────────────────────────────────────────────────────────
  { id: "geist-mono",            label: "Geist Mono",            googleFamily: null,                                 cssFamily: "var(--font-mono)",             tag: "mono" },
  { id: "jetbrains-mono",        label: "JetBrains Mono",        googleFamily: "JetBrains+Mono:wght@400;500;700",    cssFamily: "'JetBrains Mono'",             tag: "mono" },
  { id: "fira-code",             label: "Fira Code",             googleFamily: "Fira+Code:wght@400;500;700",         cssFamily: "'Fira Code'",                  tag: "mono" },
  { id: "source-code-pro",       label: "Source Code Pro",       googleFamily: "Source+Code+Pro:wght@400;500;700",   cssFamily: "'Source Code Pro'",            tag: "mono" },
  { id: "ibm-plex-mono",         label: "IBM Plex Mono",         googleFamily: "IBM+Plex+Mono:wght@400;500;700",     cssFamily: "'IBM Plex Mono'",              tag: "mono" },
  { id: "roboto-mono",           label: "Roboto Mono",           googleFamily: "Roboto+Mono:wght@400;500;700",       cssFamily: "'Roboto Mono'",                tag: "mono" },
  { id: "space-mono",            label: "Space Mono",            googleFamily: "Space+Mono:wght@400;700",            cssFamily: "'Space Mono'",                 tag: "mono" },
  { id: "inconsolata",           label: "Inconsolata",           googleFamily: "Inconsolata:wght@400;500;700",       cssFamily: "'Inconsolata'",                tag: "mono" },
  { id: "cascadia-code",         label: "Cascadia Code",         googleFamily: "Cascadia+Code:wght@400;700",         cssFamily: "'Cascadia Code'",              tag: "mono" },
  { id: "0xproto",               label: "0xProto",               googleFamily: "0xProto:wght@400;700",               cssFamily: "'0xProto'",                    tag: "mono" },
  { id: "overpass-mono",         label: "Overpass Mono",         googleFamily: "Overpass+Mono:wght@400;500;700",     cssFamily: "'Overpass Mono'",              tag: "mono" },
  { id: "ubuntu-mono",           label: "Ubuntu Mono",           googleFamily: "Ubuntu+Mono:wght@400;700",           cssFamily: "'Ubuntu Mono'",                tag: "mono" },
  { id: "oxygen-mono",           label: "Oxygen Mono",           googleFamily: "Oxygen+Mono",                        cssFamily: "'Oxygen Mono'",                tag: "mono" },
  { id: "courier-prime",         label: "Courier Prime",         googleFamily: "Courier+Prime:wght@400;700",         cssFamily: "'Courier Prime'",              tag: "mono" },
  { id: "dm-mono",               label: "DM Mono",               googleFamily: "DM+Mono:wght@400;500;700",           cssFamily: "'DM Mono'",                    tag: "mono" },
  { id: "red-hat-mono",          label: "Red Hat Mono",          googleFamily: "Red+Hat+Mono:wght@400;500;700",      cssFamily: "'Red Hat Mono'",               tag: "mono" },
  { id: "martian-mono",          label: "Martian Mono",          googleFamily: "Martian+Mono:wght@400;700",          cssFamily: "'Martian Mono'",               tag: "mono" },
  { id: "anonymous-pro",         label: "Anonymous Pro",         googleFamily: "Anonymous+Pro:wght@400;700",         cssFamily: "'Anonymous Pro'",              tag: "mono" },
  { id: "share-tech-mono",       label: "Share Tech Mono",       googleFamily: "Share+Tech+Mono",                    cssFamily: "'Share Tech Mono'",            tag: "mono" },
  { id: "chivo-mono",            label: "Chivo Mono",            googleFamily: "Chivo+Mono:wght@400;500;700",        cssFamily: "'Chivo Mono'",                 tag: "mono" },
  { id: "victor-mono",           label: "Victor Mono",           googleFamily: "Victor+Mono:wght@400;500;700",       cssFamily: "'Victor Mono'",                tag: "mono" },
  { id: "azeret-mono",           label: "Azeret Mono",           googleFamily: "Azeret+Mono:wght@400;500;700",       cssFamily: "'Azeret Mono'",                tag: "mono" },
  { id: "hack",                  label: "Hack",                  googleFamily: "Hack",                               cssFamily: "'Hack', monospace",            tag: "mono" },
  { id: "fira-mono",             label: "Fira Mono",             googleFamily: "Fira+Mono:wght@400;500;700",         cssFamily: "'Fira Mono'",                  tag: "mono" },
  { id: "pt-mono",               label: "PT Mono",               googleFamily: "PT+Mono",                            cssFamily: "'PT Mono'",                    tag: "mono" },
  { id: "cousine",               label: "Cousine",               googleFamily: "Cousine:wght@400;700",               cssFamily: "'Cousine'",                    tag: "mono" },
  { id: "cutive-mono",           label: "Cutive Mono",           googleFamily: "Cutive+Mono",                        cssFamily: "'Cutive Mono'",                tag: "mono" },
  { id: "vt323",                 label: "VT323",                 googleFamily: "VT323",                              cssFamily: "'VT323'",                      tag: "mono" },
  { id: "major-mono-display",    label: "Major Mono Display",    googleFamily: "Major+Mono+Display",                 cssFamily: "'Major Mono Display'",         tag: "mono" },
  { id: "nova-mono",             label: "Nova Mono",             googleFamily: "Nova+Mono",                          cssFamily: "'Nova Mono'",                  tag: "mono" },
  // ── Display / Sans ──────────────────────────────────────────────────────────
  { id: "atkinson-hyperlegible", label: "Atkinson Hyperlegible", googleFamily: "Atkinson+Hyperlegible:wght@400;700", cssFamily: "'Atkinson Hyperlegible'",      tag: "display" },
  { id: "comfortaa",             label: "Comfortaa",             googleFamily: "Comfortaa:wght@400;500;700",         cssFamily: "'Comfortaa'",                  tag: "display" },
  { id: "coming-soon",           label: "Coming Soon",           googleFamily: "Coming+Soon",                        cssFamily: "'Coming Soon'",                tag: "display" },
  { id: "geist-sans",            label: "Geist",                 googleFamily: "Geist:wght@400;500;700",             cssFamily: "'Geist'",                      tag: "display" },
  { id: "ibm-plex-sans",         label: "IBM Plex Sans",         googleFamily: "IBM+Plex+Sans:wght@400;500;700",     cssFamily: "'IBM Plex Sans'",              tag: "display" },
  { id: "inter-tight",           label: "Inter Tight",           googleFamily: "Inter+Tight:wght@400;500;700",       cssFamily: "'Inter Tight'",                tag: "display" },
  { id: "itim",                  label: "Itim",                  googleFamily: "Itim",                               cssFamily: "'Itim'",                       tag: "display" },
  { id: "kanit",                 label: "Kanit",                 googleFamily: "Kanit:wght@400;500;700",             cssFamily: "'Kanit'",                      tag: "display" },
  { id: "lalezar",               label: "Lalezar",               googleFamily: "Lalezar",                            cssFamily: "'Lalezar'",                    tag: "display" },
  { id: "lato",                  label: "Lato",                  googleFamily: "Lato:wght@400;700",                  cssFamily: "'Lato'",                       tag: "display" },
  { id: "lexend-deca",           label: "Lexend Deca",           googleFamily: "Lexend+Deca:wght@400;500;700",       cssFamily: "'Lexend Deca'",                tag: "display" },
  { id: "montserrat",            label: "Montserrat",            googleFamily: "Montserrat:wght@400;500;700",        cssFamily: "'Montserrat'",                 tag: "display" },
  { id: "nunito",                label: "Nunito",                googleFamily: "Nunito:wght@400;500;700",            cssFamily: "'Nunito'",                     tag: "display" },
  { id: "oxygen",                label: "Oxygen",                googleFamily: "Oxygen:wght@400;700",                cssFamily: "'Oxygen'",                     tag: "display" },
  { id: "parkinsans",            label: "Parkinsans",            googleFamily: "Parkinsans:wght@400;500;700",        cssFamily: "'Parkinsans'",                 tag: "display" },
  { id: "roboto",                label: "Roboto",                googleFamily: "Roboto:wght@400;500;700",            cssFamily: "'Roboto'",                     tag: "display" },
  { id: "sarabun",               label: "Sarabun",               googleFamily: "Sarabun:wght@400;500;700",           cssFamily: "'Sarabun'",                    tag: "display" },
  { id: "space-grotesk",         label: "Space Grotesk",         googleFamily: "Space+Grotesk:wght@400;500;700",     cssFamily: "'Space Grotesk'",              tag: "display" },
  { id: "titillium-web",         label: "Titillium Web",         googleFamily: "Titillium+Web:wght@400;600;700",     cssFamily: "'Titillium Web'",              tag: "display" },
  { id: "ubuntu",                label: "Ubuntu",                googleFamily: "Ubuntu:wght@400;500;700",            cssFamily: "'Ubuntu'",                     tag: "display" },
  { id: "georgia",               label: "Georgia",               googleFamily: null,                                 cssFamily: "Georgia, serif",               tag: "display" },
  { id: "helvetica",             label: "Helvetica",             googleFamily: null,                                 cssFamily: "Helvetica, Arial, sans-serif",                tag: "display" },
  { id: "sf-pro",                label: "SF Pro",                googleFamily: null,                                 cssFamily: "-apple-system, 'SF Pro Display', system-ui", tag: "display" },
  { id: "poppins",               label: "Poppins",               googleFamily: "Poppins:wght@400;500;700",           cssFamily: "'Poppins'",                    tag: "display" },
  { id: "raleway",               label: "Raleway",               googleFamily: "Raleway:wght@400;500;700",           cssFamily: "'Raleway'",                    tag: "display" },
  { id: "work-sans",             label: "Work Sans",             googleFamily: "Work+Sans:wght@400;500;700",         cssFamily: "'Work Sans'",                  tag: "display" },
  { id: "plus-jakarta-sans",     label: "Plus Jakarta Sans",     googleFamily: "Plus+Jakarta+Sans:wght@400;500;700", cssFamily: "'Plus Jakarta Sans'",          tag: "display" },
  { id: "dm-sans",               label: "DM Sans",               googleFamily: "DM+Sans:wght@400;500;700",           cssFamily: "'DM Sans'",                    tag: "display" },
  { id: "outfit",                label: "Outfit",                googleFamily: "Outfit:wght@400;500;700",            cssFamily: "'Outfit'",                     tag: "display" },
  { id: "figtree",               label: "Figtree",               googleFamily: "Figtree:wght@400;500;700",           cssFamily: "'Figtree'",                    tag: "display" },
  { id: "manrope",               label: "Manrope",               googleFamily: "Manrope:wght@400;500;700",           cssFamily: "'Manrope'",                    tag: "display" },
  { id: "rubik",                 label: "Rubik",                 googleFamily: "Rubik:wght@400;500;700",             cssFamily: "'Rubik'",                      tag: "display" },
  { id: "quicksand",             label: "Quicksand",             googleFamily: "Quicksand:wght@400;500;700",         cssFamily: "'Quicksand'",                  tag: "display" },
  { id: "josefin-sans",          label: "Josefin Sans",          googleFamily: "Josefin+Sans:wght@400;600;700",      cssFamily: "'Josefin Sans'",               tag: "display" },
  { id: "sora",                  label: "Sora",                  googleFamily: "Sora:wght@400;500;700",              cssFamily: "'Sora'",                       tag: "display" },
  { id: "barlow",                label: "Barlow",                googleFamily: "Barlow:wght@400;500;700",            cssFamily: "'Barlow'",                     tag: "display" },
  { id: "cabin",                 label: "Cabin",                 googleFamily: "Cabin:wght@400;500;700",             cssFamily: "'Cabin'",                      tag: "display" },
  { id: "exo-2",                 label: "Exo 2",                 googleFamily: "Exo+2:wght@400;500;700",             cssFamily: "'Exo 2'",                      tag: "display" },
  { id: "inter",                 label: "Inter",                 googleFamily: "Inter:wght@400;500;700",             cssFamily: "'Inter'",                      tag: "display" },
  { id: "bebas-neue",            label: "Bebas Neue",            googleFamily: "Bebas+Neue",                         cssFamily: "'Bebas Neue'",                 tag: "display" },
  { id: "oswald",                label: "Oswald",                googleFamily: "Oswald:wght@400;500;700",            cssFamily: "'Oswald'",                     tag: "display" },
  { id: "noto-sans",             label: "Noto Sans",             googleFamily: "Noto+Sans:wght@400;500;700",         cssFamily: "'Noto Sans'",                  tag: "display" },
  { id: "pacifico",              label: "Pacifico",              googleFamily: "Pacifico",                           cssFamily: "'Pacifico'",                  tag: "display" },
  { id: "archivo",               label: "Archivo",               googleFamily: "Archivo:wght@400;500;700",            cssFamily: "'Archivo'",                    tag: "display" },
  { id: "syne",                  label: "Syne",                  googleFamily: "Syne:wght@400;500;700;800",          cssFamily: "'Syne'",                       tag: "display" },
  { id: "arvo",                  label: "Arvo",                  googleFamily: "Arvo:wght@400;700",                  cssFamily: "'Arvo'",                       tag: "display" },
  { id: "bitter",                label: "Bitter",                googleFamily: "Bitter:wght@400;500;700",            cssFamily: "'Bitter'",                     tag: "display" },
  { id: "karla",                 label: "Karla",                 googleFamily: "Karla:wght@400;500;700",              cssFamily: "'Karla'",                      tag: "display" },
  { id: "public-sans",           label: "Public Sans",           googleFamily: "Public+Sans:wght@400;500;700",       cssFamily: "'Public Sans'",                tag: "display" },
  { id: "jost",                  label: "Jost",                  googleFamily: "Jost:wght@400;500;700",              cssFamily: "'Jost'",                       tag: "display" },
  { id: "heebo",                 label: "Heebo",                 googleFamily: "Heebo:wght@400;500;700",             cssFamily: "'Heebo'",                      tag: "display" },
  { id: "prompt",                label: "Prompt",                googleFamily: "Prompt:wght@400;500;700",            cssFamily: "'Prompt'",                     tag: "display" },
  { id: "rajdhani",              label: "Rajdhani",              googleFamily: "Rajdhani:wght@400;500;700",          cssFamily: "'Rajdhani'",                   tag: "display" },
  { id: "teko",                  label: "Teko",                  googleFamily: "Teko:wght@400;500;700",              cssFamily: "'Teko'",                       tag: "display" },
  { id: "lexend",                label: "Lexend",                googleFamily: "Lexend:wght@400;500;700",            cssFamily: "'Lexend'",                     tag: "display" },
  { id: "catamaran",             label: "Catamaran",             googleFamily: "Catamaran:wght@400;500;700",         cssFamily: "'Catamaran'",                  tag: "display" },
  { id: "cairo",                 label: "Cairo",                 googleFamily: "Cairo:wght@400;500;700",             cssFamily: "'Cairo'",                      tag: "display" },
  // ── Serif ────────────────────────────────────────────────────────────────────
  { id: "playfair-display",      label: "Playfair Display",      googleFamily: "Playfair+Display:wght@400;500;700",  cssFamily: "'Playfair Display'",           tag: "serif" },
  { id: "merriweather",          label: "Merriweather",          googleFamily: "Merriweather:wght@400;700",          cssFamily: "'Merriweather'",               tag: "serif" },
  { id: "lora",                  label: "Lora",                  googleFamily: "Lora:wght@400;500;700",              cssFamily: "'Lora'",                       tag: "serif" },
  { id: "eb-garamond",           label: "EB Garamond",           googleFamily: "EB+Garamond:wght@400;500;700",       cssFamily: "'EB Garamond'",                tag: "serif" },
  { id: "libre-baskerville",     label: "Libre Baskerville",     googleFamily: "Libre+Baskerville:wght@400;700",     cssFamily: "'Libre Baskerville'",          tag: "serif" },
  { id: "crimson-pro",           label: "Crimson Pro",           googleFamily: "Crimson+Pro:wght@400;500;700",       cssFamily: "'Crimson Pro'",                tag: "serif" },
  { id: "cinzel",                label: "Cinzel",                googleFamily: "Cinzel:wght@400;700",                cssFamily: "'Cinzel'",                     tag: "serif" },
  { id: "cormorant-garamond",    label: "Cormorant Garamond",    googleFamily: "Cormorant+Garamond:wght@400;700",    cssFamily: "'Cormorant Garamond'",         tag: "serif" },
  { id: "zilla-slab",            label: "Zilla Slab",            googleFamily: "Zilla+Slab:wght@400;700",            cssFamily: "'Zilla Slab'",                 tag: "serif" },
  // ── Handwriting ─────────────────────────────────────────────────────────────
  { id: "caveat",                label: "Caveat",                googleFamily: "Caveat:wght@400;500;700",            cssFamily: "'Caveat'",                     tag: "handwriting" },
  { id: "patrick-hand",          label: "Patrick Hand",          googleFamily: "Patrick+Hand",                       cssFamily: "'Patrick Hand'",               tag: "handwriting" },
  { id: "indie-flower",          label: "Indie Flower",          googleFamily: "Indie+Flower",                       cssFamily: "'Indie Flower'",               tag: "handwriting" },
  { id: "architects-daughter",   label: "Architects Daughter",   googleFamily: "Architects+Daughter",                cssFamily: "'Architects Daughter'",        tag: "handwriting" },
  { id: "permanent-marker",      label: "Permanent Marker",      googleFamily: "Permanent+Marker",                   cssFamily: "'Permanent Marker'",           tag: "handwriting" },
  { id: "shadows-into-light",    label: "Shadows Into Light",    googleFamily: "Shadows+Into+Light",                 cssFamily: "'Shadows Into Light'",         tag: "handwriting" },
  { id: "dancing-script",        label: "Dancing Script",        googleFamily: "Dancing+Script",                     cssFamily: "'Dancing Script'",             tag: "handwriting" },
  { id: "amatic-sc",             label: "Amatic SC",             googleFamily: "Amatic+SC",                          cssFamily: "'Amatic SC'",                  tag: "handwriting" },
  { id: "sacramento",            label: "Sacramento",            googleFamily: "Sacramento",                         cssFamily: "'Sacramento'",                 tag: "handwriting" },
];
