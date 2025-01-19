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
  users: User[];
  image: string;
};


