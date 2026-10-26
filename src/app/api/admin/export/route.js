import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import * as XLSX from "xlsx";
import { checkAdminStatus } from "@/utils/actions/admin";

export async function GET(request) {
  try {
    const { isAdmin } = await checkAdminStatus();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const Project = (await import("@/models/Project")).default;
    const Plot = (await import("@/models/Plot")).default;

    const projects = await Project.find({}).lean();
    const plots = await Plot.find({}).lean();

    const projectMap = {};
    projects.forEach((p) => {
      projectMap[p._id.toString()] = p.name;
    });

    const rows = plots.map((plot) => {
      const projectName =
        projectMap[plot.projectId?.toString()] || "Unknown Project";

      let customerName = "";
      let customerPhone = "";
      let customerAadhar = "";

      const customerData = plot.customer || plot.customers || [];
      if (Array.isArray(customerData) && customerData.length > 0) {
        customerName = customerData.map((c) => c.name).filter(Boolean).join(" & ");
        customerPhone = customerData
          .map((c) => c.phone)
          .filter(Boolean)
          .join(" & ");
        customerAadhar = customerData
          .map((c) => c.aadharNumber || c.aadhar)
          .filter(Boolean)
          .join(" & ");
      } else if (
        typeof customerData === "object" &&
        customerData !== null &&
        !Array.isArray(customerData)
      ) {
        customerName = customerData.name || "";
        customerPhone = customerData.phone || "";
        customerAadhar =
          customerData.aadharNumber || customerData.aadhar || "";
      }

      return {
        "Project Name": projectName,
        "Plot Number": plot.plotNumber || "",
        Status: (plot.status || "available").toUpperCase(),
        "Area (Sq.Ft)": plot.areaSqFt || "-",
        "Area (Cents)": plot.areaCents || "-",
        Facing: plot.facing || "-",
        Road: plot.road || "-",
        Price: plot.price || "-",
        "Customer Name": customerName,
        "Customer Phone": customerPhone,
        "Customer Aadhar": customerAadhar,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plots");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="tronx-plots-export.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Export failed", { status: 500 });
  }
}
