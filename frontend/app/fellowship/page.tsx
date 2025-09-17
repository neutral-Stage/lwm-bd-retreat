'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { getFellowshipsWithSlugs } from '../../data/fellowship';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function FellowshipPage() {
  const fellowships = getFellowshipsWithSlugs();

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
            key={fellowship.slug}
            component={Link}
            href={`/fellowship/${fellowship.slug}`}
          >
            {fellowship.name}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
}