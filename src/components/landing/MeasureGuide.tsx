import { TAILORING_OPTIONS } from "@/lib/constants/tailoring";

/**
 * The two questions every curtain buyer has before the configurator:
 * "how much fabric?" and "how is it finished?". Answered with the shop's own
 * rules and prices — no icon trio.
 */
export function MeasureGuide() {
  return (
    <section
      id="masurare"
      className="mx-auto mt-20 max-w-7xl scroll-mt-32 px-4 lg:mt-28 lg:px-8"
    >
      <div className="grid gap-12 border-t border-foreground pt-10 lg:grid-cols-12 lg:gap-12">
        {/* Measuring */}
        <div className="min-w-0 lg:col-span-5">
          <h2 className="font-display text-3xl font-medium tracking-tight lg:text-4xl">
            Cum măsori fereastra
          </h2>

          <RailDiagram />

          <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
            <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 py-4">
              <dt className="font-medium">Lățime</dt>
              <dd className="leading-relaxed text-muted-foreground">
                Măsoară galeria sau bara, apoi înmulțește cu 2–2,5. Atât
                material comanzi, în metri liniari, ca să rămână faldurile.
              </dd>
            </div>
            <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 py-4">
              <dt className="font-medium">Înălțime</dt>
              <dd className="leading-relaxed text-muted-foreground">
                De la galerie până unde vrei să cadă materialul. Fiecare produs
                are înălțimea minimă și maximă pe pagina lui.
              </dd>
            </div>
            <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 py-4">
              <dt className="font-medium">Termen</dt>
              <dd className="leading-relaxed text-muted-foreground">
                Confecționarea durează 7–8 zile lucrătoare. Produsele croite pe
                măsură nu se pot returna (OUG 34/2014).
              </dd>
            </div>
          </dl>
        </div>

        {/* Finishing */}
        <div className="min-w-0 lg:col-span-6 lg:col-start-7">
          <h2 className="font-display text-3xl font-medium tracking-tight lg:text-4xl">
            Cum se prinde pe galerie
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Alegi manopera în pagina produsului. Prețul se adaugă la fiecare
            metru liniar de material.
          </p>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[26rem] text-left text-sm">
              <thead>
                <tr className="border-b border-foreground">
                  <th scope="col" className="py-3 pr-4 font-medium">Manoperă</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Ce primești</th>
                  <th scope="col" className="py-3 text-right font-medium whitespace-nowrap">Preț / ml</th>
                </tr>
              </thead>
              <tbody>
                {TAILORING_OPTIONS.map((option) => (
                  <tr key={option.type} className="border-b border-border align-top">
                    <th scope="row" className="py-4 pr-4 font-medium">
                      {option.label}
                    </th>
                    <td className="py-4 pr-4 leading-relaxed text-muted-foreground">
                      {option.description}
                    </td>
                    <td className="tnum py-4 text-right whitespace-nowrap">
                      {option.pricePerUnit === 0 ? "inclus" : `+${option.pricePerUnit} lei`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Hand-drawn rail with gathered fabric: the 2–2,5× rule as a picture. */
function RailDiagram() {
  return (
    <figure className="mt-8 text-foreground">
      <svg
        viewBox="0 0 320 150"
        role="img"
        aria-label="Galeria are lățimea L; materialul comandat are 2–2,5 × L, strâns în falduri."
        className="h-auto w-full max-w-[26rem]"
      >
        {/* rail */}
        <line x1="20" y1="28" x2="300" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="20" cy="28" r="4" fill="currentColor" />
        <circle cx="300" cy="28" r="4" fill="currentColor" />
        {/* gathered fabric */}
        <path
          d="M24 32 q10 50 0 100 M24 32 C 40 32, 40 32, 52 32 q-8 50 0 100 M52 32 C 66 32, 66 32, 80 32 q8 50 0 100 M80 32 C 94 32, 94 32, 108 32 q-8 50 0 100 M108 32 C 122 32, 122 32, 136 32 q8 50 0 100 M136 32 C 150 32, 150 32, 164 32 q-8 50 0 100 M164 32 C 178 32, 178 32, 192 32 q8 50 0 100 M192 32 C 206 32, 206 32, 220 32 q-8 50 0 100 M220 32 C 234 32, 234 32, 248 32 q8 50 0 100 M248 32 C 262 32, 262 32, 276 32 q-8 50 0 100 M276 32 C 286 32, 290 32, 296 32 q-6 50 0 100"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1.25"
        />
        {/* width marker */}
        <line x1="20" y1="10" x2="300" y2="10" stroke="var(--brand)" strokeWidth="1.25" />
        <line x1="20" y1="5" x2="20" y2="15" stroke="var(--brand)" strokeWidth="1.25" />
        <line x1="300" y1="5" x2="300" y2="15" stroke="var(--brand)" strokeWidth="1.25" />
        <text x="160" y="148" textAnchor="middle" fontSize="11" fill="currentColor" fontFamily="var(--font-montserrat)">
          material = 2–2,5 × L
        </text>
        <rect x="140" y="3" width="40" height="14" fill="var(--background)" />
        <text x="160" y="14" textAnchor="middle" fontSize="11" fill="var(--brand)" fontFamily="var(--font-montserrat)">
          L
        </text>
      </svg>
    </figure>
  );
}
