export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "ADMIN";
}

export interface LoginBody {
  email: string;
  password: string;
}
