import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Header from "../../components/header";
import SearchableTable from "../../components/searchableTable";
import { client } from "../../service/sanityClient";

export default function Dinajpur({ participant }) {
  return (
    <Box>
      <Header />
      <Container maxWidth="xl" sx={{ marginTop: "3rem" }}>
        <SearchableTable
          participants={participant}
          fellowship="Dinajpur Fellowship"
        />
      </Container>
    </Box>
  );
}

export async function getStaticProps() {
  // It's important to default the slug so that it doesn't return "undefined"
  // const { slug = "" } = context.params
  const participant = await client.fetch(
    '*[_type == "participant" && fellowshipName=="Dinajpur Fellowship"]{...,"roomNo":roomNo->roomNo}| order(_createdAt desc)'
  );
  return {
    props: {
      participant,
    },
  };
}
