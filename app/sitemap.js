import { getAllSlugs } from "@/content";

const SITE_URL = "https://firstanswer.co";

const localPages = [
  "/las-vegas-hvac-aeo",
  "/las-vegas-personal-injury-lawyer-aeo",
  "/las-vegas-med-spa-aeo",
  "/las-vegas-roofing-aeo",
];

export default function sitemap() {
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/audit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const blogPages = getAllSlugs().map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const localPageEntries = localPages.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...blogPages, ...localPageEntries];
}
