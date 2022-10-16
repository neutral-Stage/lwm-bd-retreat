import * as React from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Box from "@mui/material/Box";
import { fellowships } from "../../data/fellowship";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Header from "../../components/header";
import SearchableTable from "../../components/searchableTable";
import { Typography } from "@mui/material";
import { client } from "../../service/sanityClient";
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function DhakaChurch({ participant }) {
  return (
    <Box>
      <Header />

      <Container maxWidth="xl" sx={{ marginTop: "3rem" }}>
        <Typography variant="h3" sx={{ marginY: "1rem" }}>
          {" "}
          Dhaka Church{" "}
        </Typography>
        <SearchableTable participants={participant} />
      </Container>
    </Box>
  );
}

export async function getStaticProps() {
  // It's important to default the slug so that it doesn't return "undefined"
  // const { slug = "" } = context.params
  const participant = await client.fetch(
    '*[_type == "participant" && fellowshipName=="Dhaka Church" ]| order(_createdAt desc)'
  );
  return {
    props: {
      participant,
    },
  };
}
