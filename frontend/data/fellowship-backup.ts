interface Fellowship {
  name: string;
  slug: string;
}

const fellowships: string[] = [
  'Dhaka Church',
  'Amboila Fellowship',
  'Antapara fellowship',
  'Baghadanga fellowship',
  'Bandarban Fellowship',
  'Dinajpur Fellowship',
  'Gopinathpur Fellowship',
  'Gazipur Fellowship',
  'Hativanga fellowship',
  'Kaliganj fellowship',
  'Kathira Fellowship',
  'Koligram Fellowship',
  'Korean Mission Team',
  'Rajshahi Fellowship',
  'Noigaon Fellowship',
  'Ruma Fellowship',
  'Savar Fellowship',
  'Sreepur Fellowship',
  'Sinaipara Fellowship',
  'Thakuragon Fellowship',
  'Vaggomonipara fellowship',
];

const dhakaRetreatFellowships: string[] = [
  'Dhaka Church',
  'Amboila Fellowship',
  'Anondapur Area',
  'Baghadanga fellowship',
  'Dinajpur Fellowship',
  'Gopinathpur Fellowship',
  'Gazipur Fellowship',
  'Kaliganj fellowship',
  'Kathira Fellowship',
  'Khagbari Area',
  'Khulna Area',
  'Koligram Fellowship',
  'Korean Mission Team',
  'Magura Area',
  'Mujibnagar Area',
  'Muladoli Fellowship',
  'Mymensingh Area',
  'Nagirpar Area',
  'Noigaon Fellowship',
  'Panchagor Area',
  'Rajshahi Fellowship',
  'Rangpur Area',
  'Savar Fellowship',
  'Sreepur Fellowship',
  'Thakuragon Fellowship',
];

// Helper function to convert fellowship name to slug
const createSlug = (name: string): string => {
  return name.replace(/\s+/g, '-').toLowerCase();
};

// Helper function to convert slug back to fellowship name
function getNameFromSlug(slug: string): string | undefined {
  return dhakaRetreatFellowships.find(
    (fellowship) => createSlug(fellowship) === slug
  );
}

// Get all fellowship objects with name and slug
function getFellowshipsWithSlugs(): Fellowship[] {
  return dhakaRetreatFellowships.map((name) => ({
    name,
    slug: createSlug(name),
  }));
}

export type { Fellowship };
export { fellowships, dhakaRetreatFellowships, createSlug, getNameFromSlug, getFellowshipsWithSlugs };