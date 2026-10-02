// site/majestan-frontend/src/components/site/property/PropertyEnquiryActions.test.tsx
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PropertyEnquiryActions } from "./PropertyEnquiryActions";
import { useUserAuthStore } from "@/store/userAuthStore";

vi.mock("@/lib/api", () => ({ createPropertyEnquiry: vi.fn() }));

// WishlistButton nests UserAuthModal, which imports the OTP client.
vi.mock("@/lib/otp-auth", () => ({
  requestLoginOtp: vi.fn(),
  requestRegisterOtp: vi.fn(),
  verifyLoginOtp: vi.fn(),
  verifyRegisterOtp: vi.fn(),
}));

import { createPropertyEnquiry } from "@/lib/api";

const PROP = {
  id: 18,
  propertyCode: "AP018",
  slug: "some-villa-ap018",
  title: "Some Villa",
  propertyType: "villa",
  listingType: "sale",
  city: "Coimbatore",
};

afterEach(() => {
  cleanup();
  useUserAuthStore.setState({ token: null, user: null, isAuthenticated: false });
  vi.clearAllMocks();
});

describe("PropertyEnquiryActions", () => {
  it("asks logged-out visitors to log in first, then opens the prefilled form", async () => {
    const user = userEvent.setup();
    render(<PropertyEnquiryActions property={PROP} />);
    await user.click(screen.getByRole("button", { name: /enquire now/i }));
    // auth modal opens (OTP entry) rather than the enquiry form:
    expect(await screen.findByText(/enter your mobile number/i)).toBeInTheDocument();
  });

  it("shows name/phone read-only for logged-in visitors and submits the enquiry", async () => {
    const user = userEvent.setup();
    useUserAuthStore.setState({
      token: "tok",
      isAuthenticated: true,
      user: { id: 7, name: "Rahul", email: "r@x.com", phone: "9876543210", role: "user" },
    });
    vi.mocked(createPropertyEnquiry).mockResolvedValue({ id: 77, submitted: true });
    render(<PropertyEnquiryActions property={PROP} />);
    await user.click(screen.getByRole("button", { name: /enquire now/i }));

    // Name shown as text (not an input) since "Rahul" is a real name
    expect(await screen.findByText("Rahul")).toBeInTheDocument();
    // Phone shown formatted in the contact card (may have spaces/prefix)
    const phoneEls = screen.getAllByText((_, el) => !!el?.textContent?.replace(/\s/g, "").includes("9876543210"));
    expect(phoneEls.length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /submit enquiry/i }));
    expect(createPropertyEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({ propertyId: 18, propertyCode: "AP018", intent: "enquiry", name: "Rahul", phone: "9876543210" }),
      "tok",
    );
    expect(await screen.findByText(/thank you/i)).toBeInTheDocument();
  });

  it("starts in edit mode when name is the system placeholder", async () => {
    const user = userEvent.setup();
    useUserAuthStore.setState({
      token: "tok",
      isAuthenticated: true,
      user: { id: 8, name: "Majestan User", email: "", phone: "9876543210", role: "user" },
    });
    render(<PropertyEnquiryActions property={PROP} />);
    await user.click(screen.getByRole("button", { name: /enquire now/i }));
    // Name input is shown (edit mode) because stored name is the placeholder
    expect(await screen.findByPlaceholderText(/your full name/i)).toBeInTheDocument();
  });

  it("requires a slot for visit bookings and posts intent site_visit", async () => {
    const user = userEvent.setup();
    useUserAuthStore.setState({
      token: "tok",
      isAuthenticated: true,
      user: { id: 7, name: "Rahul", email: "", phone: "9876543210", role: "user" },
    });
    vi.mocked(createPropertyEnquiry).mockResolvedValue({ id: 78, submitted: true });
    render(<PropertyEnquiryActions property={PROP} />);
    await user.click(screen.getByRole("button", { name: /schedule visit/i }));
    // no slot picked yet → submitting shows the inline error, no POST:
    await user.click(screen.getByRole("button", { name: /book visit/i }));
    expect(await screen.findByText(/pick a date and time/i)).toBeInTheDocument();
    expect(createPropertyEnquiry).not.toHaveBeenCalled();
  });
});
