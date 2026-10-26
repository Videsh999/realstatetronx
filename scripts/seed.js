const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is not defined in .env");
  process.exit(1);
}

const ProjectSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    location: String,
    description: String,
    heroImage: String,
    gallery: [String],
    layoutSvg: String,
    totalPlots: Number,
    totalAcres: Number,
    amenities: [{ title: String, description: String, icon: String }],
    locationHighlights: [
      { title: String, description: String, image: String, distance: String },
    ],
    latitude: Number,
    longitude: Number,
  },
  { timestamps: true },
);

const PlotSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    plotId: String,
    plotNumber: String,
    areaSqFt: Number,
    areaCents: Number,
    facing: String,
    road: String,
    price: Number,
    status: {
      type: String,
      enum: ["available", "reserved", "mortgaged", "registered", "booked"],
      default: "available",
    },
  },
  { timestamps: true },
);

const Project =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema);
const Plot = mongoose.models.Plot || mongoose.model("Plot", PlotSchema);

const sharedAmenities = [
  {
    title: "Gated Community",
    description: "Secure and safe environment with 24/7 security.",
    icon: "ShieldCheck",
  },
  {
    title: "Parks & Greenery",
    description: "Lush green parks and landscaped gardens.",
    icon: "Trees",
  },
  {
    title: "Avenue Plantation",
    description: "Beautiful trees planted along the roads.",
    icon: "Leaf",
  },
  {
    title: "BT Roads",
    description: "Wide black-top roads for smooth transit.",
    icon: "Road",
  },
  {
    title: "Water Tank",
    description: "Dedicated overhead tank for continuous water.",
    icon: "Droplets",
  },
  {
    title: "Electricity",
    description: "Solar street lights and underground electrical lines.",
    icon: "Zap",
  },
];

const sharedHighlights = [
  {
    title: "Kurnool Railway Station",
    description: "Major transit hub connecting to Hyderabad and Bangalore.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/3f/Railway_station_in_kurnool_city.jpg",
    distance: "28 km",
  },
  {
    title: "NH-44 Highway",
    description: "Excellent highway connectivity for effortless travel.",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop",
    distance: "12 km",
  },
  {
    title: "Kodumur Town",
    description: "Nearby markets, schools, and daily essentials.",
    image:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1000&auto=format&fit=crop",
    distance: "8 km",
  },
];

const plotTemplate = [
  { id: "plot-1", number: "1", areaSqFt: 1800, areaCents: 4.13, facing: "East Facing", road: "30' Wide Road" },
  { id: "plot-2", number: "2", areaSqFt: 1650, areaCents: 3.79, facing: "East Facing", road: "30' Wide Road" },
  { id: "plot-3", number: "3", areaSqFt: 2100, areaCents: 4.82, facing: "North Facing", road: "40' Main Road" },
  { id: "plot-4", number: "4", areaSqFt: 1950, areaCents: 4.48, facing: "North Facing", road: "40' Main Road" },
  { id: "plot-5", number: "5", areaSqFt: 2400, areaCents: 5.51, facing: "West Facing", road: "30' Wide Road" },
  { id: "plot-6", number: "6", areaSqFt: 1750, areaCents: 4.02, facing: "West Facing", road: "30' Wide Road" },
  { id: "plot-7", number: "7", areaSqFt: 2200, areaCents: 5.05, facing: "South Facing", road: "30' Wide Road" },
  { id: "plot-8", number: "8", areaSqFt: 1600, areaCents: 3.67, facing: "South Facing", road: "30' Wide Road" },
  { id: "plot-9", number: "9", areaSqFt: 2800, areaCents: 6.43, facing: "East Facing", road: "40' Main Road" },
  { id: "plot-10", number: "10", areaSqFt: 1900, areaCents: 4.36, facing: "North-East Corner", road: "30' & 40' Roads" },
  { id: "plot-11", number: "11", areaSqFt: 2050, areaCents: 4.71, facing: "East Facing", road: "30' Wide Road" },
  { id: "plot-12", number: "12", areaSqFt: 1700, areaCents: 3.9, facing: "West Facing", road: "30' Wide Road" },
  { id: "plot-13", number: "13", areaSqFt: 2300, areaCents: 5.28, facing: "North Facing", road: "30' Wide Road" },
  { id: "plot-14", number: "14", areaSqFt: 1550, areaCents: 3.56, facing: "South Facing", road: "30' Wide Road" },
  { id: "plot-15", number: "15", areaSqFt: 2600, areaCents: 5.97, facing: "West Facing", road: "40' Main Road" },
];

const projects = [
  {
    name: "Vinnu Ventures",
    slug: "vinnu-ventures",
    location: "Pyalakurti, Kodumur Mandal, Kurnool District, AP",
    description:
      "A premium residential venture offering well-planned plots with modern amenities and excellent connectivity. Vinnu Ventures is designed for those seeking a peaceful and comfortable lifestyle.",
    heroImage:
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560520141-949673906370?q=80&w=1000&auto=format&fit=crop",
    ],
    layoutSvg: "/PYALAKURTI_LAYOUT.svg",
    totalPlots: 15,
    totalAcres: 4.2,
    latitude: 15.6919,
    longitude: 77.7731,
    basePrice: 2500000,
  },
  {
    name: "Esh Ventures",
    slug: "esh-ventures",
    location: "Kodumur Road, Kurnool District, AP",
    description:
      "A thoughtfully planned plotted community with wide roads, green belts, and strong growth potential. Esh Ventures blends modern living with lasting investment value.",
    heroImage:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1000&auto=format&fit=crop",
    ],
    layoutSvg: "/PYALAKURTI_LAYOUT.svg",
    totalPlots: 15,
    totalAcres: 3.8,
    latitude: 15.7,
    longitude: 77.78,
    basePrice: 2800000,
  },
];

async function upsertProject(data) {
  const { basePrice, ...projectFields } = data;
  const projectData = {
    ...projectFields,
    amenities: sharedAmenities,
    locationHighlights: sharedHighlights,
  };

  let project = await Project.findOne({ slug: projectData.slug });
  if (project) {
    await Project.updateOne({ _id: project._id }, { $set: projectData });
    project = await Project.findById(project._id);
    console.log(`Updated project "${project.name}" (${project._id})`);
  } else {
    project = await Project.create(projectData);
    console.log(`Created project "${project.name}" (${project._id})`);
  }

  await Plot.deleteMany({ projectId: project._id });
  const plotsToInsert = plotTemplate.map((plot) => ({
    projectId: project._id,
    plotId: `${project.slug}-${plot.id}`,
    plotNumber: plot.number,
    areaSqFt: plot.areaSqFt,
    areaCents: plot.areaCents,
    facing: plot.facing,
    road: plot.road,
    price: Math.floor(basePrice + Math.random() * 1000000),
    status: "available",
  }));
  const inserted = await Plot.insertMany(plotsToInsert);
  console.log(`  → ${inserted.length} plots seeded`);
  return project;
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Remove old Ugadi project completely
    const old = await Project.findOne({ slug: { $in: ["ugadi-ventures", "vinnu-ventures"] } });
    // Delete any leftover ugadi docs
    const ugadi = await Project.find({ slug: "ugadi-ventures" });
    for (const p of ugadi) {
      await Plot.deleteMany({ projectId: p._id });
      await Project.deleteOne({ _id: p._id });
      console.log(`Removed legacy project "${p.name}"`);
    }
    // Also remove any project literally named Ugadi
    const named = await Project.find({ name: /ugadi/i });
    for (const p of named) {
      await Plot.deleteMany({ projectId: p._id });
      await Project.deleteOne({ _id: p._id });
      console.log(`Removed legacy project "${p.name}"`);
    }

    for (const project of projects) {
      await upsertProject(project);
    }

    // Keep only our two ventures
    const keep = projects.map((p) => p.slug);
    const extras = await Project.find({ slug: { $nin: keep } });
    for (const p of extras) {
      await Plot.deleteMany({ projectId: p._id });
      await Project.deleteOne({ _id: p._id });
      console.log(`Removed extra project "${p.name}"`);
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seed();
