import {
  filterLeaderboard,
  rankLeaderboard,
} from '../src/utils/leaderboard.search';

const squads = [
  { id: 'a', name: 'Rocket Team', score: 300 },
  { id: 'b', name: 'Code Ninjas', score: 200 },
  { id: 'c', name: 'rocketeers', score: 100 },
];

describe('rankLeaderboard', () => {
  it('assigns places based on the original order', () => {
    expect(rankLeaderboard(squads).map((p) => p.place)).toEqual([1, 2, 3]);
  });
});

describe('filterLeaderboard', () => {
  const ranked = rankLeaderboard(squads);

  it('returns everything for an empty or blank query', () => {
    expect(filterLeaderboard(ranked, '')).toEqual(ranked);
    expect(filterLeaderboard(ranked, '   ')).toEqual(ranked);
  });

  it('keeps the original place of filtered squads', () => {
    const result = filterLeaderboard(ranked, 'ninja');
    expect(result).toEqual([{ ...squads[1], place: 2 }]);
  });

  it('ignores case and surrounding whitespace', () => {
    const result = filterLeaderboard(ranked, '  ROCKET ');
    expect(result.map((p) => [p.id, p.place])).toEqual([
      ['a', 1],
      ['c', 3],
    ]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterLeaderboard(ranked, 'nope')).toEqual([]);
  });
});
