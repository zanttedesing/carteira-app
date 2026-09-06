"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapProperty = {
  id: string;
  endereco: string;
  latitude: number;
  longitude: number;
};

export function PropertyMap({ properties }: { properties: MapProperty[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Leaflet toca em `window`/`document` assim que é importado, então só
    // carregamos o módulo aqui dentro do efeito (nunca durante a
    // renderização no servidor).
    import("leaflet").then((leafletModule) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const L = leafletModule.default;

      // O bundler não resolve os ícones padrão a partir do CSS importado,
      // então apontamos pros arquivos publicados no npm (mesma versão).
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
        ._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, { scrollWheelZoom: false });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      if (properties.length > 0) {
        const bounds = L.latLngBounds(
          properties.map((p) => [p.latitude, p.longitude])
        );
        properties.forEach((p) => {
          L.marker([p.latitude, p.longitude]).addTo(map).bindPopup(p.endereco);
        });
        map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
      } else {
        map.setView([-14.235, -51.9253], 4);
      }
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-72 w-full overflow-hidden rounded-xl border border-line"
    />
  );
}
