import { describe, expect, it } from "vitest";
import type { ProjectDetail } from "./api/projects";
import { getGroupedProjectDetails } from "./project-detail-groups";
import { buildAboutRows } from "./project-overview";

function project(projectType: string): ProjectDetail {
  return {
    projectType, projectCode: "PA0001", builderName: "Majestan", towers: 2, totalUnits: 40,
    totalFloors: 5, projectAreaSqft: 43560, possessionStatus: "under_construction", possessionDate: "2027-06-30",
    ranges: { facings: ["east"], plotBoundaryWall: true, plotOpenSides: [2] },
    units: [{ status: "available", bathrooms: 2, balconies: 1, carpetAreaSqft: "1200", udsAreaSqft: "400", parking: 1, parkingType: "covered", poojaRoom: true, furnishedStatus: "semi_furnished", maintenanceFee: "3000" }],
  } as unknown as ProjectDetail;
}

describe("Project detail categories", () => {
  it.each(["apartment", "villa", "plot"])("preserves every existing %s detail exactly once", (type) => {
    const data = project(type);
    const original = buildAboutRows(data);
    const fields = getGroupedProjectDetails(data).flatMap((group) => group.fields);
    expect(fields).toHaveLength(original.length);
    expect(new Set(fields.map((field) => field.label)).size).toBe(fields.length);
    for (const row of original) expect(fields).toContainEqual(expect.objectContaining(row));
  });

  it("uses the property category vocabulary and omits empty categories", () => {
    const home = getGroupedProjectDetails(project("apartment"));
    expect(home.map((group) => group.title)).toContain("Bedrooms & Interior Features");
    expect(home.find((group) => group.title === "Parking & Maintenance")?.fields.map((field) => field.label)).toEqual(expect.arrayContaining(["Car parking", "Maintenance"]));
    const plot = getGroupedProjectDetails(project("plot"));
    expect(plot.map((group) => group.title)).toContain("Land Features");
    expect(plot.map((group) => group.title)).not.toContain("Bedrooms & Interior Features");
    expect(plot.every((group) => group.fields.length > 0)).toBe(true);
  });
});
