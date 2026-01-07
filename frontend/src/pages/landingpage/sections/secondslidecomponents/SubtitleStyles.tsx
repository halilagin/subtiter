import React from 'react';
import { Block } from '@mui/icons-material';
import { ShortSubtitleStyleBeast } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBeast';
import { ShortSubtitleStyleClassic } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleClassic';
import { ShortSubtitleStyleBobby } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBobby';
import { ShortSubtitleStyleBasker } from '../../../dashboard/dashboard/dialogvideoapplication/dialoggenerate/dialogshorts/ShortSubtitleStyleDefinitionCards/ShortSubtitleStyleBasker';

export const subtitleStyles = [
  { label: "No captions", icon: <Block sx={{ fontSize: 32, color: 'rgba(255, 255, 255, 0.7)' }} /> },
  { label: "Beast", icon: <ShortSubtitleStyleBeast capitalizationStyle="uppercase" selected={() => {}} id="beast" /> },
  { label: "Classic", icon: <ShortSubtitleStyleClassic capitalizationStyle="lowercase" selected={() => {}} id="classic" /> },
  { label: "Bobby", icon: <ShortSubtitleStyleBobby capitalizationStyle="uppercase" selected={() => {}} id="bobby" /> },
  { label: "Basker", icon: <ShortSubtitleStyleBasker capitalizationStyle="title" selected={() => {}} id="basker" /> }
];
