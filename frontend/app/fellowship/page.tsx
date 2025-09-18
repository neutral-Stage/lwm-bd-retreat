import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { getAllFellowships } from '../../lib/data-fetching';
import { Fellowship } from '../../types/index';

export default async function FellowshipPage() {
  const fellowships = await getAllFellowships();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Typography variant="h2" fontSize="2rem">
        Fellowships
      </Typography>
      <ButtonGroup
        orientation="vertical"
        aria-label="vertical contained button group"
        variant="contained"
      >
        {fellowships.map((fellowship) => (
          <Button
            key={fellowship.slug.current}
            component={Link}
            href={`/fellowship/${fellowship.slug.current}`}
          >
            {fellowship.fellowship}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
}