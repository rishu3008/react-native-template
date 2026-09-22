import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export type NetworkStatus = {
  /** Null until the first reading arrives. */
  isConnected: boolean | null;
  /** The connection reaches the internet, not just a router. */
  isInternetReachable: boolean | null;
  /** True only once a reading has been taken and it is negative. */
  isOffline: boolean;
};

/**
 * Connectivity, as a hook (AGENTS.md 21, 63).
 *
 * OfflineBanner takes `visible` rather than subscribing itself, because a
 * reusable component owning a hidden subscription is exactly what rule 63
 * forbids. This is the piece that supplies it.
 *
 * `isConnected` starts null rather than true: treating "not yet known" as
 * offline flashes an offline banner at every launch.
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<Omit<NetworkStatus, 'isOffline'>>({
    isConnected: null,
    isInternetReachable: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
    });

    return unsubscribe;
  }, []);

  // A connection that does not reach the internet -- a captive portal, or
  // wifi with no upstream -- is offline for the user's purposes.
  const isOffline =
    status.isConnected === false || status.isInternetReachable === false;

  return { ...status, isOffline };
};
