import { createContext, useContext, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const DEFAULT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const MapContext = createContext(null);

export function Map({ center = [78.9629, 20.5937], zoom = 5, className = '', children }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DEFAULT_STYLE,
      center,
      zoom,
      attributionControl: true,
      renderWorldCopies: false,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.setCenter(center);
  }, [center?.[0], center?.[1]]);

  useEffect(() => {
    if (!mapRef.current || typeof zoom !== 'number') return;
    mapRef.current.setZoom(zoom);
  }, [zoom]);

  return (
    <MapContext.Provider value={mapRef}>
      <div ref={containerRef} className={className} />
      {children}
    </MapContext.Provider>
  );
}

export function MapMarker({ longitude, latitude, children, popup }) {
  const mapRef = useContext(MapContext);
  const markerRef = useRef(null);

  useEffect(() => {
    const lng = Number(longitude);
    const lat = Number(latitude);
    const map = mapRef?.current;

    if (!map || !Number.isFinite(lng) || !Number.isFinite(lat)) return;

    const element = document.createElement('div');
    element.className = 'project-alpha-map-marker';
    element.innerHTML = '<span></span>';

    const marker = new maplibregl.Marker({ element })
      .setLngLat([lng, lat])
      .addTo(map);

    if (popup) {
      marker.setPopup(new maplibregl.Popup({ offset: 18 }).setText(popup));
    }

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [mapRef, popup]);

  useEffect(() => {
    const lng = Number(longitude);
    const lat = Number(latitude);
    if (markerRef.current && Number.isFinite(lng) && Number.isFinite(lat)) {
      markerRef.current.setLngLat([lng, lat]);
    }
  }, [longitude, latitude]);

  return null;
}

export function createMapInstance(container, options = {}) {
  const map = new maplibregl.Map({
    container,
    style: options.style || DEFAULT_STYLE,
    center: options.center || [78.9629, 20.5937],
    zoom: options.zoom || 5,
    attributionControl: true,
    renderWorldCopies: false,
  });
  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  return map;
}
