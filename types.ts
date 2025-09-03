export type EventPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CameraEvent {
  camera: string;
  timestamp: string;
  message: string;
  priority: EventPriority;
  personnel?: string[];
  anomalies?: string[];
  isNew?: boolean;
  imageId?: number;
}

export interface GeminiResponse {
  events: CameraEvent[];
}

export type CameraLocation = {
  name: string;
  description: string;
};
