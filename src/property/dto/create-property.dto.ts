import { Tenant } from "src/entities/tenant.entity";
import { User } from "src/entities/user.entity";

export type CreatePropertyDto = {
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  zipCode: string;
  type: string;
  surface: number;
  tenants: Tenant[];
  image: string;
};

