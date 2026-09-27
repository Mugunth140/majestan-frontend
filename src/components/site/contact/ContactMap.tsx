import { MAP_QUERY } from "./content";

/**
 * The embed itself is unchanged (it was already loading correctly) — what is new
 * is the `title`, which the old iframe lacked. An iframe with no accessible name
 * is announced as an unlabelled frame, and this one carries the only indication
 * on the page of where the office actually is.
 */
export function ContactMap() {
  return (
    <div>
      <h2 className="text-[clamp(21px,2.4vw,26px)]! font-medium! text-[#161e2d]! leading-[1.18]! tracking-[-0.018em]!">
        Find the office
      </h2>

      <div className="mt-[18px]! overflow-hidden! rounded-[16px]! border! border-gray-200!">
        <iframe
          title="Map showing the Majestan Realty head office on Aandal Street, Coimbatore"
          width="100%"
          height="360"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(
            MAP_QUERY,
          )}&output=embed`}
          className="block! border-0! w-full! h-[360px]!"
        />
      </div>
    </div>
  );
}
