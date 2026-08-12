import { Camera, ImagePlus, Layers, Grid3x3, Frame, PawPrint, Baby, Heart, GraduationCap, Award, Gift, Users, UserRound, PartyPopper, LucideIcon } from 'lucide-react';

export interface CreationCategory {
  key: string;
  label: string;
  icon: LucideIcon;
}

// Lista compartida entre la landing (WhatWeCreate) y el panel admin (ejemplos por categoría)
export const CREATION_CATEGORIES: CreationCategory[] = [
  { key: 'fotos-personalizadas', label: 'Fotografías personalizadas', icon: Camera },
  { key: 'restauracion', label: 'Restauración de fotos antiguas', icon: ImagePlus },
  { key: 'fotomontajes', label: 'Fotomontajes', icon: Layers },
  { key: 'collages', label: 'Collages', icon: Grid3x3 },
  { key: 'marcos', label: 'Marcos decorativos', icon: Frame },
  { key: 'mascotas', label: 'Mascotas', icon: PawPrint },
  { key: 'bebes', label: 'Bebés y maternidad', icon: Baby },
  { key: 'bodas', label: 'Bodas y aniversarios', icon: Heart },
  { key: 'graduaciones', label: 'Graduaciones', icon: GraduationCap },
  { key: 'homenajes', label: 'Homenajes', icon: Award },
  { key: 'regalos', label: 'Regalos personalizados', icon: Gift },
  { key: 'familia', label: 'Familia', icon: Users },
  { key: 'abuelos', label: 'Abuelos', icon: UserRound },
  { key: 'cumpleanos', label: 'Cumpleaños', icon: PartyPopper },
];
