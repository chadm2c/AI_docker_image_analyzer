export interface LayerInfo {
  CreatedBy: string;
  Size: number;
}

export interface DockerMetadata {
  image_id: string;
  author?: string;
  os: string;
  architecture: string;
  size: number;
  user?: string;
  exposed_ports?: string[];
  env_vars?: string[];
  history: LayerInfo[];
}

export interface AnalysisResponse {
  image: string;
  metadata: DockerMetadata;
  recommendations: string;
}

export interface DockerfileResponse {
  dockerfile: string;
}

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  size: number;
  children?: FileNode[] | null;
}
