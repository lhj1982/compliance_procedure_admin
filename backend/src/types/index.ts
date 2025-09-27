export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'user';
  teams: string;
}

export interface Team {
  id: number;
  name: string;
}

export interface TeamsComplianceProcedure {
  id: number;
  team_id: number;
  document_name: string;
  created_at: Date;
  updated_at: Date;
  status: string;
}

export interface AuthRequest extends Request {
  user?: User;
}