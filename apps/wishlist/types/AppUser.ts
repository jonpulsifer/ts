export interface AppUser {
  uid: string;
  email: string;
  name?: string;
  photoUrl?: string;
  address?: string;
  gift_theme?: string;
  shirt_size?: string;
  shoe_size?: string;
  pant_size?: string;
  families?: string[];
  num_gifts?: number;
}
