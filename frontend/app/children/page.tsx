import { Metadata } from "next";
import ChildrenClient from "./ChildrenClient";

export const metadata: Metadata = {
  title: "Children Participants - Retreat Management",
  description:
    "Manage children participants with salvation status, baptism records, and comments",
};

export default function ChildrenPage() {
  return <ChildrenClient />;
}
