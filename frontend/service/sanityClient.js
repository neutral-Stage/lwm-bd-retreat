const sanityClient = require("@sanity/client");
export const client = sanityClient({
  projectId: "4sm78dyf",
  dataset: "production",
  apiVersion: "2021-03-25", // use current UTC date - see "specifying API version"!
  token:
    "sknnqqY9maFNdrzrtDtXV95jxPrDuHV557tP6EbHkvr2DhpdT5lgC76zFRPa9Ji4VCRr7NqSxb6MdKd3ybmJ7NLRyX0qO4Fo9RKeyz7YNuImW9FUi2xxKq4ZHwpEcOU32u5KJfps8FDKL9QxihFXH64j15FbCjo7gRa6WeiMgF2Qe6oZsN4b", // or leave blank for unauthenticated usage
  useCdn: true, // `false` if you want to ensure fresh data
  ignoreBrowserTokenWarning: true,
});
