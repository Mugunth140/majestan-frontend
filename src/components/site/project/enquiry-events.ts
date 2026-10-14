/**
 * One enquiry form per page lives in the aside. Sections elsewhere on the
 * page (an empty floor-plan card, say) open it with a pre-filled note by
 * dispatching this event, rather than each mounting a form of their own.
 */
export const PROJECT_ENQUIRE_EVENT = "project:enquire";

export type ProjectEnquireDetail = {
  intent?: "enquire" | "visit";
  /** Invisible note sent in the payload (no visible field) so the lead says what was asked for. */
  message?: string;
};

export function requestProjectEnquiry(detail: ProjectEnquireDetail) {
  window.dispatchEvent(
    new CustomEvent<ProjectEnquireDetail>(PROJECT_ENQUIRE_EVENT, { detail }),
  );
}
