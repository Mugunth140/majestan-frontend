import type { ProjectDetail } from "./api/projects";
import type { DetailGroup } from "./property-detail-groups";
import { buildAboutRows } from "./project-overview";

/** Use the property category vocabulary without inventing project fields. */
export function getGroupedProjectDetails(project: ProjectDetail): DetailGroup[] {
  const rows = buildAboutRows(project);
  const used = new Set<string>();
  const groups: DetailGroup[] = [];
  const add = (title: string, labels: string[]) => {
    const fields = rows.filter((row) => labels.includes(row.label) && !used.has(row.label));
    fields.forEach((field) => used.add(field.label));
    if (fields.length) groups.push({ title, fields: fields.map((field) => ({ ...field, wide: field.value.length > 60 })) });
  };
  add("Property Overview", ["Project type", "Project ID", "Developer", "Total units"]);
  add(project.projectType === "plot" ? "Plot Area & Dimensions" : "Area & Dimensions", ["Project area", "Carpet area", "UDS area"]);
  add("Bedrooms & Interior Features", ["Bathrooms", "Balconies", "Pooja room", "Study room", "Furnishing"]);
  add("Floor & Building Details", ["Towers", "Floors per tower", "Floor", "Floors"]);
  add(project.projectType === "plot" ? "Land Features" : "Location & Connectivity", ["Boundary wall", "Open sides", "Facing", "Facings available"]);
  add("Parking & Maintenance", ["Car parking", "Guest parking", "Maintenance"]);
  add("Availability & Possession", ["Possession date", "Units on sale", "Available from"]);
  add("Additional Details", rows.filter((row) => !used.has(row.label)).map((row) => row.label));
  return groups;
}
