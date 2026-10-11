import { describe, expect, it } from "vitest";
import { getYouTubeVideoId, youtubeEmbedUrl, youtubeThumbnailUrl } from "./youtube";

describe("getYouTubeVideoId", () => {
  it("parses watch, short, embed, shorts and live URLs", () => {
    expect(getYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(getYouTubeVideoId("https://www.youtube.com/watch?foo=1&v=dQw4w9WgXcQ&t=5")).toBe("dQw4w9WgXcQ");
    expect(getYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(getYouTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(getYouTubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(getYouTubeVideoId("https://m.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("rejects non-YouTube URLs and garbage", () => {
    expect(getYouTubeVideoId("https://vimeo.com/12345")).toBeNull();
    expect(getYouTubeVideoId("https://www.youtube.com/playlist?list=abc")).toBeNull();
    expect(getYouTubeVideoId("")).toBeNull();
    expect(getYouTubeVideoId(null)).toBeNull();
    expect(getYouTubeVideoId(undefined)).toBeNull();
  });
});

describe("embed and thumbnail URLs", () => {
  it("builds privacy-enhanced embed and thumbnail URLs", () => {
    expect(youtubeEmbedUrl("dQw4w9WgXcQ", true)).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
    );
    expect(youtubeThumbnailUrl("dQw4w9WgXcQ")).toBe(
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    );
  });
});
