// site/majestan-frontend/src/components/site/project/ProjectEnquiryActions.test.tsx
import { act, render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectEnquiryActions } from "./ProjectEnquiryActions";
import { PROJECT_ENQUIRE_EVENT } from "./enquiry-events";
import { useUserAuthStore } from "@/store/userAuthStore";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "",
}));

vi.mock("@/lib/api", () => ({ createProjectEnquiry: vi.fn() }));

// ProjectEnquiryActions nests UserAuthModal, which imports the OTP client.
vi.mock("@/lib/otp-auth", () => ({
  requestLoginOtp: vi.fn(),
  requestRegisterOtp: vi.fn(),
  verifyLoginOtp: vi.fn(),
  verifyRegisterOtp: vi.fn(),
}));

import { createProjectEnquiry } from "@/lib/api";

const PROJECT = {
  id: 6,
  projectCode: "PA0006",
  slug: "emerald-heights-coimbatore-pa0006",
  name: "Emerald Heights",
  projectType: "apartment",
  city: "Coimbatore",
};

function logIn() {
  useUserAuthStore.setState({
    token: "tok",
    isAuthenticated: true,
    user: { id: 7, name: "Rahul", email: "r@x.com", phone: "9876543210", role: "user" },
  });
}

afterEach(() => {
  cleanup();
  useUserAuthStore.setState({ token: null, user: null, isAuthenticated: false });
  vi.clearAllMocks();
});

describe("ProjectEnquiryActions", () => {
  it("asks logged-out visitors to log in first, rather than opening the form", async () => {
    const user = userEvent.setup();
    render(<ProjectEnquiryActions project={PROJECT} />);
    await user.click(screen.getByRole("button", { name: /enquire now/i }));
    // auth modal opens (OTP entry) rather than the enquiry form:
    expect(await screen.findByRole("dialog", { name: /welcome back/i })).toBeInTheDocument();
  });

  it("selects a time slot from the picker and posts intent site_visit", async () => {
    const user = userEvent.setup();
    logIn();
    vi.mocked(createProjectEnquiry).mockResolvedValue({ id: 78, submitted: true });
    render(<ProjectEnquiryActions project={PROJECT} />);
    await user.click(screen.getByRole("button", { name: /schedule visit/i }));

    // Tomorrow, so no slot is already past.
    const dates = within(await screen.findByRole("radiogroup", { name: /visit date/i })).getAllByRole("radio");
    await user.click(dates[1]);
    const slot = within(screen.getByRole("radiogroup", { name: /visit time/i })).getByRole("radio", { name: "8:00 AM" });
    await user.click(slot);
    expect(slot).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByRole("button", { name: /book visit/i }));
    expect(createProjectEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 6, intent: "site_visit", visitSlot: "08:00" }),
      "tok",
    );
    expect(await screen.findByText(/thank you/i)).toBeInTheDocument();
  });

  it("submits the contracted project payload shape with the bearer token", async () => {
    const user = userEvent.setup();
    logIn();
    vi.mocked(createProjectEnquiry).mockResolvedValue({ id: 77, submitted: true });
    render(<ProjectEnquiryActions project={PROJECT} />);
    await user.click(screen.getByRole("button", { name: /enquire now/i }));

    expect(await screen.findByText("Rahul")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /submit enquiry/i }));
    expect(createProjectEnquiry).toHaveBeenCalledWith(
      {
        projectId: 6,
        projectCode: "PA0006",
        slug: "emerald-heights-coimbatore-pa0006",
        name: "Rahul",
        phone: "9876543210",
        email: "r@x.com",
        intent: "enquiry",
      },
      "tok",
    );
    expect(await screen.findByText(/thank you/i)).toBeInTheDocument();
  });

  it("opens from the external enquiry event and sends its message invisibly", async () => {
    const user = userEvent.setup();
    logIn();
    vi.mocked(createProjectEnquiry).mockResolvedValue({ id: 79, submitted: true });
    render(<ProjectEnquiryActions project={PROJECT} />);
    fireEvent(
      window,
      new CustomEvent(PROJECT_ENQUIRE_EVENT, {
        detail: { intent: "enquire", message: "Need the floor plan" },
      }),
    );

    // dialog opened, with no visible message textarea (parity):
    expect(await screen.findByText("Rahul")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/anything specific/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /submit enquiry/i }));
    expect(createProjectEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 6, message: "Need the floor plan", intent: "enquiry" }),
      "tok",
    );
  });

  it("gates the external enquiry event behind login when logged out", async () => {
    render(<ProjectEnquiryActions project={PROJECT} />);
    fireEvent(
      window,
      new CustomEvent(PROJECT_ENQUIRE_EVENT, { detail: { message: "hi" } }),
    );
    expect(await screen.findByRole("dialog", { name: /welcome back/i })).toBeInTheDocument();
  });

  it("resumes the pending event message after OTP login and sends it", async () => {
    const user = userEvent.setup();
    vi.mocked(createProjectEnquiry).mockResolvedValue({ id: 79, submitted: true });
    render(<ProjectEnquiryActions project={PROJECT} />);
    fireEvent(
      window,
      new CustomEvent(PROJECT_ENQUIRE_EVENT, {
        detail: { intent: "enquire", message: "Need the floor plan" },
      }),
    );
    expect(await screen.findByRole("dialog", { name: /welcome back/i })).toBeInTheDocument();

    act(() => {
      useUserAuthStore.setState({
        token: "tok",
        isAuthenticated: true,
        user: { id: 7, name: "Rahul", email: "r@x.com", phone: "9876543210", role: "user" },
      });
    });

    expect(await screen.findByText("Rahul")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/anything specific/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /submit enquiry/i }));
    expect(createProjectEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 6, message: "Need the floor plan", intent: "enquiry" }),
      "tok",
    );
  });

  it("opens from externalOpen while logged in", async () => {
    logIn();
    render(<ProjectEnquiryActions project={PROJECT} hideTriggers externalOpen={{ intent: "enquire", token: 1 }} />);
    expect(await screen.findByText("Rahul")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /enquire now/i })).not.toBeInTheDocument();
  });

  it("collapses contact details on the visit dialog when contact is complete", async () => {
    const user = userEvent.setup();
    logIn();
    render(<ProjectEnquiryActions project={PROJECT} />);
    await user.click(screen.getByRole("button", { name: /schedule visit/i }));

    // Summary line stands in for the full card:
    const toggle = await screen.findByRole("button", { name: /your contact details/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByPlaceholderText(/your full name/i)).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Rahul")).toBeInTheDocument();
  });

  it("leaves contact open on the visit dialog when the name is missing", async () => {
    const user = userEvent.setup();
    useUserAuthStore.setState({
      token: "tok",
      isAuthenticated: true,
      user: { id: 8, name: "Majestan User", email: "", phone: "9876543210", role: "user" },
    });
    render(<ProjectEnquiryActions project={PROJECT} />);
    await user.click(screen.getByRole("button", { name: /schedule visit/i }));
    expect(await screen.findByPlaceholderText(/your full name/i)).toBeInTheDocument();
  });
});

it.each([['booked', 'Sold Out'], ['sold', 'Sold Out'], ['unavailable', 'Sold Out'], ['rented', 'Sold Out']])('shows %s in place of enquiry actions', (status, label) => {
  render(<ProjectEnquiryActions project={{...PROJECT, status}} />);
  expect(screen.getByRole('status')).toHaveTextContent(label);
  expect(screen.queryByRole('button', {name: /enquire now/i})).not.toBeInTheDocument();
  expect(screen.queryByRole('button', {name: /schedule visit/i})).not.toBeInTheDocument();
});
