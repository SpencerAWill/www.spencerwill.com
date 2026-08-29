import { type Category, categories, years } from "#/data/profile";

/**
 * Three of the five categories are greens, which is at the edge of what stays
 * distinguishable — so "My projects" is a circle rather than a fourth tint.
 * Shape carries the distinction where luminance alone would not, particularly
 * in dark mode.
 */
const swatch: Record<Category, string> = {
  school:
    "border-[1.5px] border-[color-mix(in_srgb,var(--c-accent)_55%,transparent)]",
  work: "bg-accent",
  client:
    "bg-[color-mix(in_srgb,var(--c-accent)_48%,var(--c-paper))] border border-[color-mix(in_srgb,var(--c-accent)_52%,transparent)]",
  project:
    "rounded-full bg-[color-mix(in_srgb,var(--c-accent)_70%,var(--c-paper))]",
  climb: "bg-warm",
};

function Swatch({ category }: { category: Category }) {
  return (
    <span
      aria-hidden="true"
      className={`relative top-px size-2 shrink-0 rounded-[2px] ${swatch[category]}`}
    />
  );
}

export function YearStack() {
  return (
    <>
      <div>
        {years.map((year) => (
          <div
            key={year.year}
            className="grid grid-cols-[3.6rem_1fr] gap-4 border-line border-t py-3 first:border-t-0 first:pt-0"
          >
            <div
              className={`font-display font-semibold text-[1.19rem] tabular-nums leading-snug ${
                year.current ? "text-warm" : "text-muted"
              }`}
            >
              {year.year}
            </div>
            <div>
              {year.items.map((item) => (
                <div
                  key={`${item.category}-${item.title}`}
                  className="flex items-baseline gap-2.5 py-[0.15rem] text-[0.9rem] leading-normal"
                >
                  <Swatch category={item.category} />
                  <span>
                    {item.title}
                    {item.note ? (
                      <span className="text-[0.81rem] text-muted">
                        {" "}
                        {item.note}
                      </span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-line border-t pt-4 text-[0.78rem] text-muted">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center gap-1.5">
            <Swatch category={category.id} />
            {category.label}
          </li>
        ))}
      </ul>
    </>
  );
}
