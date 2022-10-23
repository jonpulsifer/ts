export interface Gift {
  id: string;
  name: string;
  notes?: string;
  url?: string;
  owner: string;
  owner_name?: string;
  claimed_by?: string;
  families?: string[];
}
