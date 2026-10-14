"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import type { Photo } from "./owner-post-model";
import styles from "./owner-photo-gallery.module.css";

type DragState = {
  key: string;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
};

export type OwnerPhotoGalleryProps = {
  photos: Photo[];
  disabled: boolean;
  onReorder: (photos: Photo[]) => void;
  onRemove: (photo: Photo) => void;
};

function reordered(photos: Photo[], from: number, to: number) {
  if (from < 0 || to < 0 || from >= photos.length || to >= photos.length || from === to) return photos;
  const next = [...photos];
  const [photo] = next.splice(from, 1);
  next.splice(to, 0, photo);
  return next;
}

function PhotoTile({
  photo,
  index,
  count,
  disabled,
  drag,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  onReorder,
  onRemove,
}: {
  photo: Photo;
  index: number;
  count: number;
  disabled: boolean;
  drag?: DragState;
  onDragStart: (photo: Photo, event: ReactPointerEvent<HTMLButtonElement>) => void;
  onDragMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onDragEnd: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onDragCancel: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onReorder: (from: number, to: number) => void;
  onRemove: (photo: Photo) => void;
}) {
  const [broken, setBroken] = useState(false);
  const source = photo.localPreviewUrl || photo.previewUrl;
  const isDragging = drag?.key === photo.key;
  const positionStyle: CSSProperties | undefined = isDragging
    ? { transform: `translate3d(${drag.x - drag.startX}px, ${drag.y - drag.startY}px, 0)` }
    : undefined;

  return (
    <li
      className={`${styles.tile} ${isDragging ? styles.dragging : ""}`}
      data-photo-key={photo.key}
      style={positionStyle}
    >
      <div className={styles.imageFrame}>
        {source && !broken ? (
          <Image
            unoptimized
            width={480}
            height={320}
            src={source}
            alt={`Property photo ${index + 1}: ${photo.name}`}
            className={styles.image}
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
            onError={() => setBroken(true)}
          />
        ) : (
          <div className={styles.placeholder} role="img" aria-label={`Preview unavailable for ${photo.name}`}>
            <span className={styles.placeholderMark} aria-hidden="true">▧</span>
            <span>Preview unavailable</span>
          </div>
        )}
        {index === 0 && <span className={styles.coverBadge}>Cover photo</span>}
        <button
          type="button"
          className={styles.dragHandle}
          aria-label={`Drag to reorder ${photo.name}`}
          aria-describedby={`owner-photo-help-${photo.key}`}
          disabled={disabled}
          onPointerDown={(event) => onDragStart(photo, event)}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragCancel}
          onKeyDown={(event) => {
            const from = index;
            let to = from;
            if (event.key === "ArrowLeft" || event.key === "ArrowUp") to -= 1;
            if (event.key === "ArrowRight" || event.key === "ArrowDown") to += 1;
            if (to !== from) {
              event.preventDefault();
              onReorder(from, Math.max(0, Math.min(count - 1, to)));
            }
          }}
        >
          <span aria-hidden="true" className={styles.grip}>⠿</span>
          <span className={styles.srOnly}>Reorder photo</span>
        </button>
      </div>
      <div className={styles.tileFooter}>
        <div className={styles.photoDetails}>
          <span className={styles.photoNumber}>Photo {index + 1}</span>
          <span className={styles.fileName} title={photo.name}>{photo.name}</span>
        </div>
        <div className={styles.tileActions}>
          <button
            type="button"
            className={styles.moveButton}
            aria-label={`Move ${photo.name} earlier`}
            disabled={disabled || index === 0}
            onClick={() => onReorder(index, index - 1)}
          >
            <span aria-hidden="true">↑</span>
          </button>
          <button
            type="button"
            className={styles.moveButton}
            aria-label={`Move ${photo.name} later`}
            disabled={disabled || index === count - 1}
            onClick={() => onReorder(index, index + 1)}
          >
            <span aria-hidden="true">↓</span>
          </button>
          <button
            type="button"
            className={styles.removeButton}
            aria-label={`Remove ${photo.name}`}
            disabled={disabled}
            onClick={() => onRemove(photo)}
          >
            Remove
          </button>
        </div>
      </div>
      <span id={`owner-photo-help-${photo.key}`} className={styles.srOnly}>
        Drag to reorder, or focus and use the arrow keys. The first photo is the cover.
      </span>
    </li>
  );
}

export function OwnerPhotoGallery({ photos, disabled, onReorder, onRemove }: OwnerPhotoGalleryProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const dragRef = useRef<DragState | undefined>(undefined);
  const [drag, setDrag] = useState<DragState | undefined>();
  const [announcement, setAnnouncement] = useState("");

  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= photos.length || to >= photos.length) return;
    onReorder(reordered(photos, from, to));
    setAnnouncement(`${photos[from].name} moved to position ${to + 1} of ${photos.length}.${to === 0 ? " It is now the cover photo." : ""}`);
  };

  const startDrag = (photo: Photo, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const next = { key: photo.key, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, moved: false };
    dragRef.current = next;
    setDrag(next);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const next = {
      ...current,
      x: event.clientX,
      y: event.clientY,
      moved: current.moved || Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > 8,
    };
    dragRef.current = next;
    setDrag(next);
  };

  const endDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== event.pointerId) return;
    dragRef.current = undefined;
    setDrag(undefined);
    if (!current.moved) return;
    const nodes = Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-photo-key]") ?? []);
    const target = nodes.reduce<{ index: number; distance: number } | undefined>((best, node, index) => {
      if (node.dataset.photoKey === current.key) return best;
      const rect = node.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = dx * dx + dy * dy;
      return !best || distance < best.distance ? { index, distance } : best;
    }, undefined);
    const from = photos.findIndex((photo) => photo.key === current.key);
    if (target && from >= 0) reorder(from, target.index);
  };

  const cancelDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = undefined;
    setDrag(undefined);
  };

  if (!photos.length) return null;

  return (
    <section className={styles.gallery} aria-label="Property photos">
      <div className={styles.galleryHeading}>
        <div>
          <h2>Arrange your photos</h2>
          <p>Drag a photo into place. The first photo appears as your cover.</p>
        </div>
        <span className={styles.photoCount}>{photos.length} {photos.length === 1 ? "photo" : "photos"}</span>
      </div>
      <ol className={styles.grid} ref={listRef}>
        {photos.map((photo, index) => (
          <PhotoTile
            key={photo.key}
            photo={photo}
            index={index}
            count={photos.length}
            disabled={disabled}
            drag={drag}
            onDragStart={startDrag}
            onDragMove={moveDrag}
            onDragEnd={endDrag}
            onDragCancel={cancelDrag}
            onReorder={reorder}
            onRemove={onRemove}
          />
        ))}
      </ol>
      <p className={styles.srOnly} role="status" aria-live="polite">{announcement}</p>
    </section>
  );
}

export type OwnerPhotoUploadProgressProps = {
  current?: number;
  total?: number;
  fileNames?: string[];
  message?: string;
  loading?: boolean;
  progressLabel?: string;
};

export function OwnerPhotoUploadProgress({ current = 0, total, fileNames = [], message, loading = true, progressLabel = "Photo upload progress" }: OwnerPhotoUploadProgressProps) {
  if (!loading && !message) return null;
  const hasCount = typeof total === "number" && total > 0;
  const completed = hasCount ? Math.max(0, Math.min(total, current)) : 0;
  const percent = hasCount ? Math.round((completed / total) * 100) : undefined;
  const label = message || (hasCount ? `Uploading photo ${Math.min(completed + 1, total)} of ${total}` : "Uploading photos");

  return (
    <section className={styles.progressCard} role="status" aria-live="polite" aria-atomic="true">
      <span className={styles.progressIcon} aria-hidden="true">↑</span>
      <div className={styles.progressContent}>
        <div className={styles.progressTopline}>
          <strong>{label}</strong>
          {hasCount && <span className={styles.progressCount}>{completed} / {total}</span>}
        </div>
        {hasCount ? (
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-label={progressLabel}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={completed}
          >
            <span className={styles.progressFill} style={{ width: `${percent}%` }} />
          </div>
        ) : (
          <div className={`${styles.progressTrack} ${styles.indeterminate}`} aria-hidden="true"><span className={styles.progressFill} /></div>
        )}
        {fileNames.length > 0 && <p className={styles.currentFile}>Now uploading {fileNames[0]}{fileNames.length > 1 ? ` and ${fileNames.length - 1} more` : ""}</p>}
      </div>
    </section>
  );
}
