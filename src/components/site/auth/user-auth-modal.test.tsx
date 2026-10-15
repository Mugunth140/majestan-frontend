// site/majestan-frontend/src/components/site/auth/user-auth-modal.test.tsx
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserAuthModal } from "./user-auth-modal";

afterEach(cleanup);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "",
}));

const requestLoginOtp = vi.fn();
const requestRegisterOtp = vi.fn();
const verifyLoginOtp = vi.fn();
const verifyRegisterOtp = vi.fn();

vi.mock("@/lib/otp-auth", () => ({
  requestLoginOtp: (...a: unknown[]) => requestLoginOtp(...a),
  requestRegisterOtp: (...a: unknown[]) => requestRegisterOtp(...a),
  verifyLoginOtp: (...a: unknown[]) => verifyLoginOtp(...a),
  verifyRegisterOtp: (...a: unknown[]) => verifyRegisterOtp(...a),
}));

// Ticks the clock inside act() so the interval-driven re-render is flushed.
const tick = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

// The countdown re-arms a 1s timeout on every render, so each tick has to be
// advanced separately — one advanceTimersByTime call only fires the pending one.
const tickSeconds = (seconds: number) => {
  for (let i = 0; i < seconds; i++) tick(1000);
};

// Fire rather than userEvent: userEvent's internal delays never resolve under
// fake timers, which hangs the suite.
async function gotoOtpStep() {
  render(<UserAuthModal isOpen onClose={() => {}} />);

  const input = screen.getByPlaceholderText("90929 65556");
  await act(async () => {
    fireEvent.change(input, { target: { value: "9876543210" } });
  });

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /get verification code/i }));
  });

  expect(screen.getByText("Enter OTP")).toBeDefined();
}

describe("UserAuthModal step 2", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    requestLoginOtp.mockReset();
    requestRegisterOtp.mockReset();
    verifyLoginOtp.mockReset();
    verifyRegisterOtp.mockReset();
    requestLoginOtp.mockResolvedValue({ otpSent: true, expiresInSeconds: 300 });
  });

  it("shows a reverse expiry countdown seeded from the backend TTL", async () => {
    await gotoOtpStep();

    expect(screen.getByText("Expires in 300s")).toBeDefined();

    tickSeconds(1);
    expect(screen.getByText("Expires in 299s")).toBeDefined();

    tickSeconds(2);
    expect(screen.getByText("Expires in 297s")).toBeDefined();
  });

  it("drops the old '6-digit OTP' label and the 'Change number' link", async () => {
    await gotoOtpStep();

    expect(screen.queryByText("6-digit OTP")).toBeNull();
    expect(screen.queryByText("Change number")).toBeNull();
  });

  it("switches to 'Code expired' when the countdown reaches zero", async () => {
    await gotoOtpStep();

    tickSeconds(300);
    expect(screen.getByText("Code expired")).toBeDefined();
    expect(screen.queryByText("Expires in 0s")).toBeNull();
  });

  it("resets the countdown when the OTP is resent", async () => {
    await gotoOtpStep();

    tickSeconds(30);
    expect(screen.getByText("Expires in 270s")).toBeDefined();

    // Clear the 60s resend gate, then resend.
    tickSeconds(31);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /resend otp/i }));
    });

    expect(requestLoginOtp).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Expires in 300s")).toBeDefined();
  });

  it("sends only one OTP request when submitted twice while in flight", async () => {
    // A submit that lands while `loading` is already true — a second click
    // queued ahead of the disabling re-render, or a programmatic submit —
    // must not fire a second request. Each request sends a real SMS.
    let resolveRequest!: (value: unknown) => void;
    requestLoginOtp.mockImplementationOnce(
      () => new Promise((resolve) => { resolveRequest = resolve; }),
    );
    render(<UserAuthModal isOpen onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText("90929 65556"), {
      target: { value: "9876543210" },
    });

    const sendButton = screen.getByRole("button", { name: /get verification code/i });
    fireEvent.click(sendButton);
    // Bypass the (already-disabled) button and submit the form directly, so
    // the assertion targets the handler rather than the button's disabled
    // state in jsdom.
    fireEvent.submit(sendButton.closest("form")!);

    expect(requestLoginOtp).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveRequest({ otpSent: true, expiresInSeconds: 300 });
    });
    expect(screen.getByText("Enter OTP")).toBeDefined();
  });
});

describe("UserAuthModal OTP feedback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    requestLoginOtp.mockReset();
    verifyLoginOtp.mockReset();
    requestLoginOtp.mockResolvedValue({ otpSent: true, expiresInSeconds: 300 });
  });

  it("verifies on the sixth digit without pressing the button", async () => {
    verifyLoginOtp.mockResolvedValue({
      accessToken: "t",
      user: { id: 1, name: "A", email: "a@b.co", phone: "9876543210", role: "user" },
    });
    await gotoOtpStep();

    await act(async () => {
      fireEvent.change(screen.getByLabelText("6-digit code"), { target: { value: "123456" } });
    });

    expect(verifyLoginOtp).toHaveBeenCalledTimes(1);
    expect(verifyLoginOtp.mock.calls[0][0]).toMatchObject({ otp: "123456", countryCode: "+91" });
    expect(screen.getByText("Verified. Signing you in…")).toBeDefined();
  });

  it("shows the rejection and clears it once the code is edited", async () => {
    verifyLoginOtp.mockRejectedValue(Object.assign(new Error("bad"), { status: 401 }));
    await gotoOtpStep();

    const input = screen.getByLabelText("6-digit code");
    await act(async () => {
      fireEvent.change(input, { target: { value: "111111" } });
    });
    expect(screen.getByRole("alert").textContent).toMatch(/doesn't match/);
    expect(input.getAttribute("aria-invalid")).toBe("true");

    await act(async () => {
      fireEvent.change(input, { target: { value: "11111" } });
    });
    expect(input.getAttribute("aria-invalid")).toBe("false");
  });
});

describe("UserAuthModal country code", () => {
  beforeEach(() => {
    vi.useRealTimers();
    requestLoginOtp.mockReset();
    requestLoginOtp.mockResolvedValue({ otpSent: true, expiresInSeconds: 300 });
  });

  it("searches the full list and sends the chosen code", async () => {
    render(<UserAuthModal isOpen onClose={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /country code/i }));
    fireEvent.change(screen.getByLabelText("Search country or code"), {
      target: { value: "971" },
    });
    fireEvent.click(screen.getByRole("option", { name: /united arab emirates/i }));

    fireEvent.change(screen.getByPlaceholderText("Mobile number"), {
      target: { value: "501234567" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /get verification code/i }));
    });

    expect(requestLoginOtp).toHaveBeenCalledWith({ countryCode: "+971", phone: "501234567" });
  });
});
