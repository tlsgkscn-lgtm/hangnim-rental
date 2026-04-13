export class CreateUserDto {
  loginId!: string;
  password!: string;
  name!: string;
  company?: string;
  phone?: string;
  role!: "ADMIN" | "USER";
  status!: "ACTIVE" | "PENDING" | "BLOCKED";
  memo?: string;
}