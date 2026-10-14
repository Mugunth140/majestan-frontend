// site/majestan-frontend/src/components/site/project/ProjectEnquiryActions.test.tsx
import { act, render, screen, cleanup, fireEvent } from "@testing-library/react";
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
    expect(await screen.findByText(/enter your mobile number/i)).toBeInTheDocument();
  });

  it("selects a time slot from the pill grid and posts intent site_visit", async () => {
    const user = userEvent.setup();
    logIn();
    vi.mocked(createProjectEnquiry).mockResolvedValue({ id: 78, submitted: true });
    render(<ProjectEnquiryActions project={PROJECT} />);
    await user.click(screen.getByRole("button", { name: /schedule visit/i }));

    const pills = await screen.findAllByRole("button", { name: /\d{1,2}:\d{2}\s?(AM|PM)/ });
    expect(pills.length).toBeGreaterThan(0);
    await user.click(pills[0]);
    expect(pills[0]).toHaveAttribute("aria-pressed", "true");

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
    expect(await screen.findByText(/enter your mobile number/i)).toBeInTheDocument();
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
    expect(await screen.findByText(/enter your mobile number/i)).toBeInTheDocument();

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
});
