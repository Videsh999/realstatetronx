import dbConnect from "@/lib/mongodb";
import { serialize } from "../serialization";
import fallbackProjects from "@/data/fallback-projects.json";
import fallbackPlots from "@/data/fallback-plots.json";

function withFallbackProjects() {
  return serialize(fallbackProjects);
}

function withFallbackPlots(projectId) {
  const id = projectId?.toString?.() || projectId;
  return serialize(
    fallbackPlots.filter((p) => String(p.projectId) === String(id)),
  );
}

/**
 * Fetches all projects from the database.
 */
export async function getProjects() {
  try {
    await dbConnect();
    const Project = (await import("@/models/Project")).default;
    const projects = await Project.find({}).lean();
    if (!projects?.length) return withFallbackProjects();
    return serialize(projects);
  } catch (error) {
    console.error("getProjects failed, using fallback:", error?.message || error);
    return withFallbackProjects();
  }
}

/**
 * Fetches a single project by its slug.
 */
export async function getProjectBySlug(slug) {
  if (!slug) return null;
  try {
    await dbConnect();
    const Project = (await import("@/models/Project")).default;
    const project = await Project.findOne({ slug }).lean();
    if (project) return serialize(project);
  } catch (error) {
    console.error("getProjectBySlug failed:", error?.message || error);
  }
  const fallback = fallbackProjects.find((p) => p.slug === slug);
  return fallback ? serialize(fallback) : null;
}

/**
 * Fetches all plots associated with a project slug.
 */
export async function getProjectPlots(slug) {
  if (!slug) return [];
  try {
    await dbConnect();
    const Project = (await import("@/models/Project")).default;
    const Plot = (await import("@/models/Plot")).default;
    const project = await Project.findOne({ slug }).select("_id").lean();
    if (!project) {
      const fb = fallbackProjects.find((p) => p.slug === slug);
      return fb ? withFallbackPlots(fb._id) : [];
    }
    const plots = await Plot.find({ projectId: project._id }).lean();
    if (!plots?.length) return withFallbackPlots(project._id);
    return serialize(plots);
  } catch (error) {
    console.error("getProjectPlots failed:", error?.message || error);
    const fb = fallbackProjects.find((p) => p.slug === slug);
    return fb ? withFallbackPlots(fb._id) : [];
  }
}

/**
 * Fetches all currently reserved plots across all projects.
 */
export async function getAllReservedPlots() {
  try {
    await dbConnect();
    const Project = (await import("@/models/Project")).default;
    const Plot = (await import("@/models/Plot")).default;
    const reservedPlots = await Plot.find({ status: "reserved" })
      .populate({
        path: "projectId",
        model: Project,
        select: "name slug",
      })
      .sort({ reservedUntil: 1 })
      .lean();

    return serialize(reservedPlots);
  } catch (error) {
    console.error("getAllReservedPlots failed:", error?.message || error);
    return [];
  }
}
