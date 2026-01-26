// Enums (reflect Prisma enums as literal unions)
export type UserRole = "USER" | "ADMIN" | "PREMIUM_USER";

export type Templates =
  | "REACT"
  | "VUE"
  | "Express"
  | "NEXTJS"
  | "ANGULAR"
  | "SVELTE";

// Models

export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  // Relations (optional — present if included)
  accounts?: Account[];
  playgrounds?: PlayGround[];
  starredPlaygrounds?: StarMark[];
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refreshToken?: string | null;
  accessToken?: string | null;
  expiresAt?: number | null;
  tokenType?: string | null;
  scope?: string | null;
  idToken?: string | null;
  sessionState?: string | null;
  // Relation (optional)
  user?: User;
}

export interface PlayGround {
  id: string;
  title: string;
  description?: string;
  template: Templates;
  // Relation(s)
  starMarks?: StarMark[]; // present if included
  userId: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface StarMark {
  id: string;
  playgroundId: string;
  userId: string;
  isMarked: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  user?: User;
  playground?: PlayGround;
}

export interface TemplateOptions {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  popularity: number;
  tags: string[];
  features: string[];
  category: "frontend" | "backend" | "fullstack";
}