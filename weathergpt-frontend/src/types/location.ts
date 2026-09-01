import { LocationInfo } from './weather';

export interface LocationSearchResult extends LocationInfo {
  population?: number;
  admin_division?: string;
}

export interface SavedLocation extends LocationInfo {
  id: string;
  is_favorite: boolean;
  notes?: string;
  last_updated?: string;
  cached_temp?: number;
  cached_condition?: string;
  cached_icon?: string;
}
