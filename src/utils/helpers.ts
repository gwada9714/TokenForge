/**
 * Crée une version debounced d'une fonction qui retarde son exécution
 * jusqu'à ce que le temps spécifié se soit écoulé depuis le dernier appel.
 *
 * @param func - La fonction à debounce
 * @param wait - Le nombre de millisecondes à attendre
 * @returns Une version debounced de la fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Crée une version throttled d'une fonction qui ne s'exécute qu'une fois
 * pendant le délai spécifié, peu importe combien de fois elle est appelée.
 *
 * @param func - La fonction à throttle
 * @param limit - Le nombre de millisecondes minimum entre les appels
 * @returns Une version throttled de la fonction
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Retarde l'exécution d'une fonction d'un nombre spécifié de millisecondes
 *
 * @param ms - Le nombre de millisecondes à attendre
 * @returns Une promesse qui se résout après le délai spécifié
 */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Regroupe plusieurs appels à une fonction asynchrone et retourne le résultat une fois que tous sont terminés
 *
 * @param func - La fonction à regrouper
 * @param wait - Le temps d'attente avant d'exécuter le groupe
 * @returns Une fonction qui regroupe les appels
 */
export function batch<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let batch: {
    args: Parameters<T>;
    resolve: (value: ReturnType<T>) => void;
    reject: (reason?: any) => void;
  }[] = [];
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      batch.push({ args, resolve, reject });

      if (!timeout) {
        timeout = setTimeout(async () => {
          const currentBatch = batch;
          batch = [];
          timeout = null;

          try {
            const results = await Promise.all(
              currentBatch.map((item) => func.apply(null, item.args))
            );
            currentBatch.forEach((item, index) => item.resolve(results[index]));
          } catch (error) {
            currentBatch.forEach((item) => item.reject(error));
          }
        }, wait);
      }
    });
  };
}
