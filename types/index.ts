// Type definitions for Ezia vBeta

export interface Project {
  _id?: string;
  space_id: string;
  user_id: string;
  title: string;
  html: string;
  prompts: string[];
  _createdAt?: Date;
  _updatedAt?: Date;
}

export interface User {
  id: string;
  fullname: string;
  avatarUrl: string;
  name: string;
  isPro: boolean;
  isLocalUse?: boolean;
  token?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  icon?: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  icon?: string;
  size?: string;
  context?: string;
  provider?: string;
  disabled?: boolean;
  isVisionModel?: boolean;
  isThinkerModel?: boolean;
}