export type User = {
  id: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};
