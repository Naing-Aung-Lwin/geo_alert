export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  position: LatLng;
  icon: string;
  size: [number, number];
}

export interface MapLayer {
  url: string;
  attribution: string;
  baseLayer: boolean;
}

export interface MapEvent {
  event: string;
  payload: {
    touchLatLng?: LatLng;
    [key: string]: any;
  };
}
