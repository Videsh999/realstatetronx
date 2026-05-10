import { getProjects } from "@/utils/data/projects";
import { SITE_CONFIG } from "@/lib/seo-config";

export default async function sitemap() {
  const projects = await getProjects();

  const baseUrl = SITE_CONFIG.url.replace(/\/$/, "");

  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticUrls = [
    {
      url: baseUrl || "/",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  return [...staticUrls, ...projectUrls];
}
