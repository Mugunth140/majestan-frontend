import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { OwnerPhotoGallery, OwnerPhotoUploadProgress } from "./OwnerPhotoGallery";
import type { Photo } from "./owner-post-model";

afterEach(cleanup);

const photos: Photo[] = [
  { key: "one", name: "front.jpg", previewUrl: "/front.jpg" },
  { key: "two", name: "kitchen.jpg", previewUrl: "/kitchen.jpg" },
  { key: "three", name: "garden.jpg" },
];

describe("OwnerPhotoGallery", () => {
  it("marks only the first photo as cover and keeps remove as its own action", () => {
    const onRemove = vi.fn();
    render(<OwnerPhotoGallery photos={photos} disabled={false} onReorder={vi.fn()} onRemove={onRemove} />);
    expect(screen.getAllByText("Cover photo")).toHaveLength(1);
    expect(screen.getByRole("img", { name: /front\.jpg/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove kitchen.jpg" }));
    expect(onRemove).toHaveBeenCalledWith(photos[1]);
  });

  it("reorders using keyboard arrows and announces the new cover", () => {
    const onReorder = vi.fn();
    render(<OwnerPhotoGallery photos={photos} disabled={false} onReorder={onReorder} onRemove={vi.fn()} />);
    fireEvent.keyDown(screen.getByRole("button", { name: "Drag to reorder kitchen.jpg" }), { key: "ArrowLeft" });
    expect(onReorder).toHaveBeenCalledWith([photos[1], photos[0], photos[2]]);
    expect(screen.getByRole("status")).toHaveTextContent("kitchen.jpg moved to position 1 of 3. It is now the cover photo.");
  });

  it("reorders by pointer drop within the photo grid", () => {
    const onReorder = vi.fn();
    render(<OwnerPhotoGallery photos={photos} disabled={false} onReorder={onReorder} onRemove={vi.fn()} />);
    const tiles = screen.getAllByRole("listitem");
    tiles.forEach((tile, index) => {
      vi.spyOn(tile, "getBoundingClientRect").mockReturnValue({
        x: index * 110,
        y: 0,
        left: index * 110,
        right: index * 110 + 100,
        top: 0,
        bottom: 100,
        width: 100,
        height: 100,
        toJSON: () => ({}),
      } as DOMRect);
    });
    const handle = screen.getByRole("button", { name: "Drag to reorder front.jpg" });
    fireEvent.pointerDown(handle, { pointerId: 7, button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(handle, { pointerId: 7, clientX: 280, clientY: 10 });
    fireEvent.pointerUp(handle, { pointerId: 7, clientX: 280, clientY: 10 });
    expect(onReorder).toHaveBeenCalledWith([photos[1], photos[2], photos[0]]);
  });

  it("exposes upload counts in a prominent accessible progress bar", () => {
    render(<OwnerPhotoUploadProgress current={2} total={5} fileNames={["garden.jpg", "front.jpg"]} />);
    expect(screen.getByRole("status")).toHaveTextContent("Uploading photo 3 of 5");
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Photo upload progress" })).toHaveAttribute("aria-valuenow", "2");
    expect(screen.getByText("Now uploading garden.jpg and 1 more")).toBeInTheDocument();
  });
});
