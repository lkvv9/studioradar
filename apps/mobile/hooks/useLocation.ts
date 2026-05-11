import { useState, useEffect } from "react";
import * as Location from "expo-location";

interface Coords {
  lat: number;
  lng: number;
}

export function useLocation() {
  const [coords, setCoords]   = useState<Coords | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission de localisation refusée");
        // Paris par défaut
        setCoords({ lat: 48.8566, lng: 2.3522 });
        setLoading(false);
        return;
      }

      // Position initiale rapide
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setLoading(false);

      // Mise à jour continue (économique)
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 50 },
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      );
    })();

    return () => { subscription?.remove(); };
  }, []);

  return { coords, error, loading };
}
