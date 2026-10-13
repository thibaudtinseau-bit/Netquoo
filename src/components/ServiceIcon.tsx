import { Building2, HardHat, Sparkles, Stethoscope, Store, Warehouse, type LucideProps } from 'lucide-react';
import type { ServiceIcon as IconName } from '@/data/services';

const icons = {
  building: Building2,
  store: Store,
  stethoscope: Stethoscope,
  sparkles: Sparkles,
  hardhat: HardHat,
  warehouse: Warehouse,
} as const;

export function ServiceIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const Icon = icons[name];
  return <Icon {...props} />;
}
