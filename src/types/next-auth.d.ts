import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "ADMIN" | "PARTICIPANT";
      participantProfileId: string | null;
    };
  }

  interface User {
    role: "ADMIN" | "PARTICIPANT";
    participantProfileId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "PARTICIPANT";
    participantProfileId?: string | null;
  }
}
