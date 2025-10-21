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

export interface InvitationBody {
  groupId: string;
  toUserEmail: string;
}
