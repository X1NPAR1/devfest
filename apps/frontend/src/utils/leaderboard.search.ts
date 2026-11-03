export type Ranked<T> = T & { place: number };

export const rankLeaderboard = <T>(list: T[]): Ranked<T>[] =>
  list.map((item, index) => ({ ...item, place: index + 1 }));

export const filterLeaderboard = <T extends { name: string }>(
  list: T[],
  query: string
): T[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return list;
  }
  return list.filter((item) =>
    (item.name || '').toLowerCase().includes(normalized)
  );
};
