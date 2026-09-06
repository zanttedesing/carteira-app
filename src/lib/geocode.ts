// Geocodificação via Nominatim (OpenStreetMap) — gratuito, sem chave de
// API. É melhor esforço: se o endereço não for encontrado ou o serviço
// falhar, o imóvel continua sendo criado normalmente, só sem coordenadas
// (não aparece no mapa até alguém completar o endereço).
export async function geocodeAddress(
  endereco: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      endereco
    )}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "CarteiraDeAluguel/1.0 (https://carteiradealuguel.com.br)",
      },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data.length) return null;

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

    return { lat, lon };
  } catch {
    return null;
  }
}
