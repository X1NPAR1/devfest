import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDebounce } from 'use-debounce';

export const useLeaderboardSearch = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [query] = useDebounce(search, 300);

  useEffect(() => {
    if (router.isReady && typeof router.query.q === 'string') {
      setSearch(router.query.q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const q = query.trim();
    if ((router.query.q || '') === q) {
      return;
    }
    router.replace(
      { pathname: router.pathname, query: q ? { q } : {} },
      undefined,
      { shallow: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return { search, setSearch, query };
};

export const LeaderboardSearch: FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="flex bg-[#191919] rounded-[12px] h-[72px] px-[32px] focus-within:ring-2 focus-within:ring-white/60">
      <input
        type="search"
        aria-label="Search squads by name"
        className="w-full h-full outline-none text-white bg-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search squads..."
        autoComplete="off"
      />
    </div>
  );
};

export const LeaderboardEmpty: FC<{ onClear: () => void }> = ({ onClear }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-[12px] bg-[#191919] rounded-[12px] py-[32px] px-[32px]">
      <div>No squads match your search.</div>
      <button
        type="button"
        onClick={onClear}
        className="underline hover:text-white/70"
      >
        Clear search
      </button>
    </div>
  );
};
