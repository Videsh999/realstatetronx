"use server";

import dbConnect from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { serialize } from "../serialization";
import {
  DEMO_ADMIN_COOKIE,
  getDemoAdminPassword,
  isClerkEnabled,
} from "@/lib/auth-mode";

async function getClerkAuth() {
  const { auth, clerkClient } = await import("@clerk/nextjs/server");
  return { auth, clerkClient };
}

/**
 * Helper to verify admin role (throws error if not admin)
 */
export async function verifyAdmin() {
  if (!isClerkEnabled()) {
    const jar = await cookies();
    const session = jar.get(DEMO_ADMIN_COOKIE)?.value;
    if (session === getDemoAdminPassword()) return;
    throw new Error("Unauthorized: Admin access required");
  }

  const { auth, clerkClient } = await getClerkAuth();
  const authObj = await auth();

  let role =
    authObj.sessionClaims?.metadata?.role ||
    authObj.sessionClaims?.publicMetadata?.role;

  if (!role && authObj.userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(authObj.userId);
      role = user.publicMetadata?.role;
    } catch (error) {
      console.error("Error verifying admin status:", error);
    }
  }

  if (role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
}

/**
 * Check if the current user is an admin without throwing an error
 */
export async function checkAdminStatus() {
  try {
    if (!isClerkEnabled()) {
      const jar = await cookies();
      const session = jar.get(DEMO_ADMIN_COOKIE)?.value;
      return { isAdmin: session === getDemoAdminPassword(), mode: "demo" };
    }

    const { auth, clerkClient } = await getClerkAuth();
    const authObj = await auth();
    if (!authObj.userId) return { isAdmin: false, mode: "clerk" };

    let role =
      authObj.sessionClaims?.metadata?.role ||
      authObj.sessionClaims?.publicMetadata?.role;

    if (!role) {
      const client = await clerkClient();
      const user = await client.users.getUser(authObj.userId);
      role = user.publicMetadata?.role;
    }

    return { isAdmin: role === "admin", mode: "clerk" };
  } catch (error) {
    console.error("Error checking admin status:", error);
    return { isAdmin: false, error: error.message };
  }
}
/**
 * Update plot status (Available, Reserved, Sold)
 */
export async function updatePlotStatus(plotId, status, customerData = null) {
  try {
    await verifyAdmin();
    await dbConnect();
    // Defer model import to prevent client-side bundling issues
    const Plot = (await import("@/models/Plot")).default;
    const Project = (await import("@/models/Project")).default;

    const updateFields = { status };
    if (customerData) {
      // Ensure it's an array for the joint registration schema
      updateFields.customer = Array.isArray(customerData) ? customerData : [customerData];
    } else if (status === "available" || status === "mortgaged") {
      updateFields.customer = [];
    }

    console.log("Updating Plot Status for", plotId, "to", status, "with data:", updateFields.customer);

    const plot = await Plot.findByIdAndUpdate(plotId, updateFields, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!plot) throw new Error("Plot not found");

    console.log("Successfully updated plot in DB:", {
      id: plot._id,
      status: plot.status,
      customerCount: plot.customer?.length
    });

    // Fetch project to get slug for revalidation
    const project = await Project.findById(plot.projectId).select("slug");

    revalidatePath("/admin/plots");
    if (project) {
      revalidatePath(`/projects/${project.slug}`);
    }

    return { success: true, data: serialize(plot) };
  } catch (error) {
    if (error.message !== "Unauthorized: Admin access required") {
      console.error("Error updating plot status:", error);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Fetch Admin Dashboard Statistics
 */
export async function getAdminStats() {
  try {
    await verifyAdmin();
    await dbConnect();
    // Defer model imports to prevent client-side bundling issues
    const Project = (await import("@/models/Project")).default;
    const Plot = (await import("@/models/Plot")).default;
    const Enquiry = (await import("@/models/Enquiry")).default;

    const [projects, totalPlots, occupiedPlots, pendingEnquiriesCount] =
      await Promise.all([
        Project.find({}).lean(),
        Plot.countDocuments(),
        Plot.countDocuments({ status: { $ne: "available" } }),
        Enquiry.countDocuments({ status: "pending" }),
      ]);

    // Calculate per-project stats
    const projectStats = await Promise.all(projects.map(async (project) => {
      const [pTotalPlots, pAvailablePlots, pPendingEnquiries, pRegisteredPlots, pBookedPlots, pReservedPlots] = await Promise.all([
        Plot.countDocuments({ projectId: project._id }),
        Plot.countDocuments({ projectId: project._id, status: "available" }),
        Enquiry.countDocuments({ projectId: project._id, status: "pending" }),
        Plot.countDocuments({ projectId: project._id, status: "registered" }),
        Plot.countDocuments({ projectId: project._id, status: "booked" }),
        Plot.countDocuments({ projectId: project._id, status: "reserved" })
      ]);

      return {
        projectId: project._id.toString(),
        name: project.name,
        slug: project.slug,
        totalPlots: pTotalPlots,
        availablePlots: pAvailablePlots,
        pendingEnquiries: pPendingEnquiries,
        registeredPlots: pRegisteredPlots,
        bookedPlots: pBookedPlots,
        reservedPlots: pReservedPlots
      };
    }));

    return {
      success: true,
      data: {
        globalStats: {
          totalProjects: projects.length,
          totalPlots,
          occupiedPlots,
          pendingEnquiries: pendingEnquiriesCount,
          availablePlots: totalPlots - occupiedPlots,
        },
        projectStats
      },
    };
  } catch (error) {
    if (error.message !== "Unauthorized: Admin access required") {
      console.error("Error fetching admin stats:", error);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Update project details
 */
export async function updateProject(projectId, data) {
  try {
    await verifyAdmin();
    await dbConnect();
    // Defer model import to prevent client-side bundling issues
    const Project = (await import("@/models/Project")).default;

    const project = await Project.findByIdAndUpdate(projectId, data, {
      new: true,
    });

    if (!project) throw new Error("Project not found");

    revalidatePath("/admin/projects");
    revalidatePath(`/projects/${project.slug}`);

    return { success: true, data: serialize(project) };
  } catch (error) {
    console.error("Error updating project:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new project
 */
export async function createProject(data) {
  try {
    await verifyAdmin();
    await dbConnect();
    const Project = (await import("@/models/Project")).default;

    const project = await Project.create(data);

    revalidatePath("/admin/projects");
    revalidatePath("/");

    return { success: true, data: serialize(project) };
  } catch (error) {
    console.error("Error creating project:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId) {
  try {
    await verifyAdmin();
    await dbConnect();
    const Project = (await import("@/models/Project")).default;
    const Plot = (await import("@/models/Plot")).default;

    const project = await Project.findByIdAndDelete(projectId);
    if (!project) throw new Error("Project not found");

    // Also delete associated plots
    await Plot.deleteMany({ projectId });

    revalidatePath("/admin/projects");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update enquiry status
 */
export async function updateEnquiryStatus(enquiryId, status) {
  try {
    await verifyAdmin();
    await dbConnect();
    const Enquiry = (await import("@/models/Enquiry")).default;

    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      { status },
      { new: true },
    );

    if (!enquiry) throw new Error("Enquiry not found");

    revalidatePath("/admin/enquiries");
    revalidatePath("/admin");

    return { success: true, data: serialize(enquiry) };
  } catch (error) {
    console.error("Error updating enquiry status:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update detailed plot information
 */
export async function updatePlot(plotId, data) {
  try {
    await verifyAdmin();
    await dbConnect();
    const Plot = (await import("@/models/Plot")).default;
    const Project = (await import("@/models/Project")).default;

    const existingPlot = await Plot.findById(plotId);
    console.log("Current Data in DB for", plotId, ":", {
      east: existingPlot?.east,
      west: existingPlot?.west,
      north: existingPlot?.north,
      south: existingPlot?.south,
    });

    console.log("Attempting to save with $set:", {
      areaSqFt: data.areaSqFt,
      areaCents: data.areaCents,
      east: data.east,
      west: data.west,
      north: data.north,
      south: data.south,
    });

    const plot = await Plot.findByIdAndUpdate(
      plotId,
      {
        $set: {
          areaSqFt: data.areaSqFt,
          areaCents: data.areaCents,
          east: data.east,
          west: data.west,
          north: data.north,
          south: data.south,
          facing: data.facing,
          road: data.road,
          price: data.price,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!plot) throw new Error("Plot not found");

    console.log("Freshly Saved Result in DB:", {
      id: plot._id,
      east: plot.east,
      west: plot.west,
      north: plot.north,
      south: plot.south,
    });

    // Fetch project to get slug for revalidation
    const project = await Project.findById(plot.projectId).select("slug");

    revalidatePath("/admin/plots");
    // Also revalidate the project page where this plot might be displayed
    if (project) {
      revalidatePath(`/projects/${project.slug}`);
    }

    return { success: true, data: JSON.parse(JSON.stringify(plot)) };
  } catch (error) {
    console.error("Error updating plot:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch the global Site Info configuration
 */
export async function getSiteInfo() {
  try {
    await dbConnect();
    const SiteInfo = (await import("@/models/SiteInfo")).default;
    
    // Always fetch the first one, or return a default structure if none exists
    let info = await SiteInfo.findOne().lean();
    if (!info) {
      info = {
        businessName: "Tronx",
        supportEmail: "videshthota889@gmail.com",
        officeAddress: "123 Real Estate Plaza, Commercial Road, Kurnool, Andhra Pradesh",
        primaryPhone: "+91 63050 03695",
        workingHours: "Mon - Sat | 9:00 AM - 7:00 PM",
      };
    }
    
    return serialize(info);
  } catch (error) {
    console.error("Error fetching site info:", error);
    return null;
  }
}

/**
 * Update the global Site Info configuration
 */
export async function updateSiteInfo(data) {
  try {
    await verifyAdmin();
    await dbConnect();
    const SiteInfo = (await import("@/models/SiteInfo")).default;

    // Use upsert to create if it doesn't exist, update if it does.
    const updatedInfo = await SiteInfo.findOneAndUpdate(
      {}, // Empty filter matches first document
      { ...data },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    revalidatePath("/admin/site-info");
    revalidatePath("/"); // Revalidate homepage in case site info is used there

    return { success: true, data: serialize(updatedInfo) };
  } catch (error) {
    console.error("Error updating site info:", error);
    return { success: false, error: error.message };
  }
}
