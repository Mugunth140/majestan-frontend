import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { OwnerPostWizard } from "./OwnerPostWizard";
import { emptyDraft } from "./owner-post-model";

const auth = vi.hoisted(() => ({
  token: null as string | null,
  user: null as { id: number; name: string; phone: string } | null,
  isAuthenticated: false,
  logout: vi.fn(),
}));
const api = vi.hoisted(() => ({
  draft: vi.fn(),
  saveDraft: vi.fn(),
  request: vi.fn(),
}));
vi.mock("@/store/userAuthStore", () => ({ useUserAuthStore: () => auth }));
vi.mock("@/components/site/auth/user-auth-modal", () => ({
  UserAuthModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>Existing OTP authentication</div> : null,
}));
vi.mock("./owner-post-api", () => ({ ownerApi: api }));
const data = {
  cities: [
    { id: 1, city_name: "Coimbatore", state_name: "Tamil Nadu" },
    { id: 3, city_name: "Chennai", state_name: "Tamil Nadu" },
  ],
  sublocations: [
    { id: 2, city_id: 1, locality_name: "Saravanampatti" },
    { id: 4, city_id: 3, locality_name: "Adyar" },
  ],
  amenities: [],
  furnishings: [],
};
const clickContinue = () =>
  fireEvent.click(screen.getByRole("button", { name: /^Continue/ }));
beforeEach(() => {
  cleanup();
  localStorage.clear();
  auth.token = null;
  auth.user = null;
  auth.isAuthenticated = false;
  vi.clearAllMocks();
  api.draft.mockResolvedValue({ payload: null });
  api.saveDraft.mockResolvedValue({ saved: true });
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("owner posting wizard", () => {
  it("validates progression and resets locality when city changes", async () => {
    render(<OwnerPostWizard data={data} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Continue/ })).toBeEnabled(),
    );
    clickContinue();
    expect(
      await screen.findByText("Choose a property category to continue."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Apartment/ }));
    clickContinue();
    expect(
      screen.getByRole("heading", { name: "Location" }),
    ).toBeInTheDocument();
    clickContinue();
    expect(screen.getByText("Choose a city.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("combobox", { name: /^City/ }));
    fireEvent.click(await screen.findByRole("option", { name: "Coimbatore" }));
    fireEvent.click(screen.getByRole("combobox", { name: /^Locality/ }));
    fireEvent.click(
      await screen.findByRole("option", { name: "Saravanampatti" }),
    );
    fireEvent.click(screen.getByRole("combobox", { name: /^City/ }));
    fireEvent.click(await screen.findByRole("option", { name: "Chennai" }));
    expect(
      screen.getByRole("combobox", { name: /^Locality/ }),
    ).toHaveTextContent("Choose a locality");
    expect(
      screen.queryByRole("option", { name: "Saravanampatti" }),
    ).not.toBeInTheDocument();
  });
  it("restores server drafts before saving, and clears drafts only after successful submission", async () => {
    auth.token = "test";
    auth.user = { id: 7, name: "Owner", phone: "+919999999999" };
    auth.isAuthenticated = true;
    api.draft.mockResolvedValue({
      payload: {
        ...emptyDraft(),
        category: "plot",
        cityId: "1",
        sublocationId: "2",
        values: {
          title: "My plot",
          description: "A well located plot",
          address: "Example street",
          price: "500000",
          areaSqft: "1200",
        },
      },
    });
    api.request.mockResolvedValue({ id: 99, propertyCode: "P099" });
    render(<OwnerPostWizard data={data} />);
    await screen.findByText("Saved");
    expect(api.saveDraft).not.toHaveBeenCalled();
    for (let i = 0; i < 4; i++) clickContinue();
    clickContinue();
    fireEvent.click(screen.getByRole("checkbox", { name: /I confirm/ }));
    fireEvent.click(screen.getByRole("button", { name: /Send for review/ }));
    await screen.findByRole("heading", {
      name: "Your listing is with our team",
    });
    expect(api.request).toHaveBeenCalledWith(
      "/properties/plot",
      "test",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"sublocationId":2'),
      }),
    );
    expect(localStorage.getItem("majestan_owner_draft_user_7_v2")).toBeNull();
  });
  it("shows a restored five plan collection as full without changing photo cover handling", async () => {
    auth.token = "test";
    auth.user = { id: 7, name: "Owner", phone: "+919999999999" };
    auth.isAuthenticated = true;
    api.draft.mockResolvedValue({
      payload: {
        ...emptyDraft(),
        category: "plot",
        cityId: "1",
        sublocationId: "2",
        values: {
          title: "My plot",
          description: "A well located plot",
          address: "Example street",
          price: "500000",
          areaSqft: "1200",
        },
        photos: [{ key: "photo-key", name: "front.jpg" }],
        floorPlans: Array.from({ length: 5 }, (_, index) => ({
          key: `plan-${index}`,
          name: `plan-${index}.pdf`,
          mimeType: "application/pdf",
          fileSizeBytes: 1200,
        })),
      },
    });
    render(<OwnerPostWizard data={data} />);
    await screen.findByText("Saved");
    for (let i = 0; i < 4; i++) clickContinue();
    expect(screen.getByLabelText("Choose floor plans")).toBeDisabled();
    expect(screen.getByText(/5 of 5 added/)).toBeInTheDocument();
    clickContinue();
    expect(screen.getByText(/1 photo added\. First photo is your cover\./)).toBeInTheDocument();
    expect(screen.getByText("5 floor plans added.")).toBeInTheDocument();
  });
  it("uploads and removes a floor plan separately, preserves the photo cover, and rejects a selection over five", async () => {
    auth.token = "test";
    auth.user = { id: 7, name: "Owner", phone: "+919999999999" };
    auth.isAuthenticated = true;
    api.draft.mockResolvedValue({
      payload: {
        ...emptyDraft(),
        category: "plot",
        cityId: "1",
        sublocationId: "2",
        values: {
          title: "My plot",
          description: "A well located plot",
          address: "Example street",
          price: "500000",
          areaSqft: "1200",
        },
        photos: [{ key: "photo-key", name: "front.jpg" }],
      },
    });
    api.request.mockResolvedValue({
      url: "https://upload.example/plan.pdf",
      key: "local/temp/123-owner-7-12345678-1234-1234-1234-123456789abc-plan.pdf",
      previewUrl: "https://media.example/plan.pdf",
    });
    const put = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", put);

    render(<OwnerPostWizard data={data} />);
    await screen.findByText("Saved");
    for (let i = 0; i < 4; i++) clickContinue();
    expect(screen.getByText("Cover photo")).toBeInTheDocument();

    const plan = new File(["pdf"], "plan.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Choose floor plans"), {
      target: { files: [plan] },
    });
    expect(await screen.findByText("plan.pdf")).toBeInTheDocument();
    expect(api.request).toHaveBeenCalledWith(
      expect.stringContaining("fileSizeBytes=3"),
      "test",
    );
    expect(put).toHaveBeenCalledWith(
      expect.stringContaining("/site-api/owner/media/upload-temp?key="),
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ "Content-Type": "application/pdf" }),
      }),
    );
    expect(screen.getByText("Cover photo")).toBeInTheDocument();
    const savedWithPlan = JSON.parse(
      localStorage.getItem("majestan_owner_draft_user_7_v2") || "{}",
    );
    expect(savedWithPlan.draft.floorPlans).toMatchObject([
      {
        key: "local/temp/123-owner-7-12345678-1234-1234-1234-123456789abc-plan.pdf",
        name: "plan.pdf",
        mimeType: "application/pdf",
        fileSizeBytes: 3,
      },
    ]);
    expect(screen.getByLabelText("Preview plan.pdf")).toHaveAttribute(
      "href",
      "https://media.example/plan.pdf",
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove plan.pdf" }));
    expect(screen.queryByText("plan.pdf")).not.toBeInTheDocument();
    expect(screen.getByText(/0 of 5 added/)).toBeInTheDocument();
    const savedAfterRemoval = JSON.parse(
      localStorage.getItem("majestan_owner_draft_user_7_v2") || "{}",
    );
    expect(savedAfterRemoval.draft.floorPlans).toEqual([]);

    const overLimit = Array.from(
      { length: 6 },
      (_, index) => new File(["pdf"], `plan-${index}.pdf`, { type: "application/pdf" }),
    );
    fireEvent.change(screen.getByLabelText("Choose floor plans"), {
      target: { files: overLimit },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You can add up to 5 floor plans.",
    );
    expect(api.request).toHaveBeenCalledTimes(1);
  });
  it("focuses missing consent and keeps a rejected submission visible with its draft intact", async () => {
    auth.token = "test";
    auth.user = { id: 7, name: "Owner", phone: "+919999999999" };
    auth.isAuthenticated = true;
    api.draft.mockResolvedValue({
      payload: {
        ...emptyDraft(),
        category: "plot",
        cityId: "1",
        sublocationId: "2",
        values: {
          title: "My plot",
          description: "A well located plot",
          address: "Example street",
          price: "500000",
          areaSqft: "1200",
        },
      },
    });
    api.request.mockRejectedValue(
      Object.assign(new Error("Please replace this photo."), { status: 400 }),
    );
    render(<OwnerPostWizard data={data} />);
    await screen.findByText("Saved");
    for (let i = 0; i < 5; i++) clickContinue();
    fireEvent.click(screen.getByRole("button", { name: /Send for review/ }));
    const consent = screen.getByRole("checkbox", { name: /I confirm/ });
    await waitFor(() => expect(consent).toHaveFocus());
    expect(api.request).not.toHaveBeenCalled();
    fireEvent.click(consent);
    fireEvent.click(screen.getByRole("button", { name: /Send for review/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please replace this photo.",
    );
    expect(
      screen.getByRole("button", { name: /Send for review/ }),
    ).toBeEnabled();
    expect(
      screen.queryByText("Your listing is with our team"),
    ).not.toBeInTheDocument();
  });
  it("shows a choice when a guest draft and account draft both exist", async () => {
    const guest = { ...emptyDraft(), category: "plot" };
    localStorage.setItem(
      "majestan_owner_draft_guest_v2",
      JSON.stringify({ draft: guest }),
    );
    const view = render(<OwnerPostWizard data={data} />);
    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: /Residential plot/ }),
      ).toBeChecked(),
    );
    auth.token = "test";
    auth.user = { id: 7, name: "Owner", phone: "+919999999999" };
    auth.isAuthenticated = true;
    api.draft.mockResolvedValue({
      payload: { ...emptyDraft(), category: "villa" },
    });
    view.rerender(<OwnerPostWizard data={data} />);
    await screen.findByText("You have two drafts");
    expect(api.saveDraft).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Resume account draft" }),
    );
    expect(screen.getByRole("radio", { name: /Villa/ })).toBeChecked();
  });
});
