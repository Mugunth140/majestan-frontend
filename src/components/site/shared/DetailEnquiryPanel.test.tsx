import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { DetailEnquiryPanel } from "./DetailEnquiryPanel";

afterEach(cleanup);

function EnquiryAction() {
  const [requested, setRequested] = useState(false);
  return <button onClick={() => setRequested(true)}>{requested ? "Enquiry open" : "Enquire Now"}</button>;
}

it("preserves the enquiry flow when expanding and collapsing, and returns focus on Escape", () => {
  render(
    <DetailEnquiryPanel title="Emerald Heights" price="₹90 L – 6 Cr"
      actions={<EnquiryAction />} footer={<p>Zero brokerage</p>}
      listedBy={<p>Majestan Realty</p>}>
      <h2>Project details</h2>
    </DetailEnquiryPanel>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Enquire Now" }));
  const toggle = screen.getByRole("button", { name: "Expand enquiry details" });
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  for (const id of toggle.getAttribute("aria-controls")!.split(" ")) {
    expect(document.getElementById(id)).toBeInTheDocument();
  }
  const action = screen.getByRole("button", { name: "Enquiry open" });
  action.focus();
  fireEvent.keyDown(action, { key: "Escape" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(toggle).toHaveFocus();
  expect(screen.getByRole("button", { name: "Enquiry open" })).toBe(action);
});
