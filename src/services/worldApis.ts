import type { WorldEvent, WeatherData } from '../types';

export const fetchEarthquakes = async (): Promise<WorldEvent[]> => {
  try {
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
    const data = await res.json();
    return data.features.slice(0, 10).map((f: Record<string, unknown>) => {
      const prop = f.properties as Record<string, unknown>;
      const geom = f.geometry as Record<string, unknown>;
      return {
      id: f.id as string,
      title: prop.title as string,
      type: 'earthquake',
      severity: (prop.mag as number) > 5 ? 'high' : (prop.mag as number) > 4 ? 'medium' : 'low',
      timestamp: new Date(prop.time as number).toISOString(),
      source: 'USGS',
      url: prop.url as string,
      metadata: { magnitude: prop.mag, coordinates: geom.coordinates }
    };
    });
  } catch (error) {
    console.error('Error fetching earthquakes', error);
    return [];
  }
};

export const fetchWeather = async (cities: {name: string, lat: number, lon: number}[]): Promise<WeatherData[]> => {
  try {
    const promises = cities.map(async city => {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&timezone=auto`);
      if (!res.ok) throw new Error(`Weather API error for ${city.name}`);
      const data = await res.json();
      return {
        city: city.name,
        temp: data.current_weather?.temperature ?? null,
        condition: String(data.current_weather?.weathercode ?? -1),
        lat: city.lat,
        lon: city.lon
      };
    });
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error fetching weather', error);
    return [];
  }
};

export const fetchWorldNews = async (): Promise<WorldEvent[]> => {
  try {
    const res = await fetch('https://api.gdeltproject.org/api/v2/doc/doc?query=world%20crisis%20OR%20conflict%20OR%20geopolitical&mode=artlist&maxrecords=10&format=json');
    const data = await res.json();
    const articles = data.articles || [];
    return articles.map((r: Record<string, unknown>) => ({
      id: String(r.url || Math.random()),
      title: r.title as string,
      type: 'news',
      severity: 'medium',
      timestamp: r.seendate || new Date().toISOString(),
      source: (r.domain as string) || 'GDELT',
      url: r.url as string
    }));
  } catch (error) {
    console.error('Error fetching world news', error);
    return [];
  }
};

export const fetchExchangeRates = async (): Promise<Record<string, unknown> | null> => {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching exchange rates', error);
    return null;
  }
};

export const fetchSpaceNews = async (): Promise<WorldEvent[]> => {
  try {
    const res = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=5');
    const data = await res.json();
    return data.results.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      title: r.title as string,
      type: 'space',
      severity: 'low',
      timestamp: r.published_at,
      source: r.news_site,
      url: r.url
    }));
  } catch (error) {
    console.error('Error fetching space news', error);
    return [];
  }
};
