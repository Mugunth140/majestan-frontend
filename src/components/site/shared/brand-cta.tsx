/**
 * Post Property: brand yellow with a soft top highlight and a hairline edge,
 * so it reads as a pressed-in surface rather than a flat sticker. On hover it
 * turns brand blue, with no shadow. A gradient can't be faded to a flat
 * colour, so the blue is its own layer (PostPropertyHover) that fades in.
 */
export const POST_PROPERTY_BUTTON =
  "group/pp relative! isolate! overflow-hidden! inline-flex! items-center! justify-center! rounded-full! border! border-solid! border-[#e9b500]! bg-[linear-gradient(180deg,#ffd84a_0%,#ffc700_100%)]! font-bold! leading-none! text-[#101828]! no-underline! shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_1px_2px_rgba(16,24,40,0.08)]! transition-[border-color,color,box-shadow,transform]! duration-200! ease-out! hover:border-[#27427f]! hover:text-white! hover:shadow-none! active:scale-[0.98]!";

/** The blue that fades in over the yellow on hover. */
export function PostPropertyHover() {
  return (
    <span
      aria-hidden="true"
      className="absolute! inset-0! -z-10! bg-[#27427f]! opacity-0! transition-opacity! duration-200! ease-out! group-hover/pp:opacity-100!"
    />
  );
}

