import * as React from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Header from '../../components/header'
import SearchableTable from '../../components/searchableTable'
import { client } from '../../service/sanityClient'

export default function Sreepur({ participant }) {
  return (
    <Box>
      <Header />
      <Container maxWidth='xl' sx={{ marginTop: '3rem' }}>
        <SearchableTable
          participants={participant}
          fellowship='Sreepur Fellowship'
        />
      </Container>
    </Box>
  )
}

export async function getStaticProps() {
  // It's important to default the slug so that it doesn't return "undefined"
  // const { slug = "" } = context.params
  const participant = await client.fetch(
    '*[_type == "participant" && fellowshipName=="Sreepur Fellowship" && present == "present"]{...,"roomNo":roomNo->roomNo}| order(_createdAt desc)'
  )
  return {
    props: {
      participant,
    },
  }
}
