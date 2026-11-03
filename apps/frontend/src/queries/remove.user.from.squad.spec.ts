import { removeUserFromSquad } from '@frontend/queries/remove.user.from.squad';

const mockTx = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  squad: {
    delete: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('@db/prisma', () => ({
  prisma: {
    $transaction: (fn: (client: typeof mockTx) => Promise<unknown>) =>
      fn(mockTx),
  },
}));

describe('removeUserFromSquad', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes a regular member and keeps the squad', async () => {
    mockTx.user.findUnique.mockResolvedValue({
      squadId: 'squad-1',
      ownedSquads: [],
      squad: { members: [{ id: 'other' }] },
    });

    await expect(removeUserFromSquad('member')).resolves.toBe('squad-1');

    expect(mockTx.user.update).toHaveBeenCalledWith({
      where: { id: 'member' },
      data: { squadId: null },
    });
    expect(mockTx.squad.delete).not.toHaveBeenCalled();
    expect(mockTx.squad.update).not.toHaveBeenCalled();
  });

  it('deletes the squad when no other active member remains', async () => {
    mockTx.user.findUnique.mockResolvedValue({
      squadId: 'squad-1',
      ownedSquads: [{ id: 'squad-1' }],
      squad: { members: [] },
    });

    await removeUserFromSquad('owner');

    expect(mockTx.squad.delete).toHaveBeenCalledWith({
      where: { id: 'squad-1' },
    });
    expect(mockTx.squad.update).not.toHaveBeenCalled();
  });

  it('transfers ownership when the owner is removed', async () => {
    mockTx.user.findUnique.mockResolvedValue({
      squadId: 'squad-1',
      ownedSquads: [{ id: 'squad-1' }],
      squad: { members: [{ id: 'next' }, { id: 'last' }] },
    });

    await removeUserFromSquad('owner');

    expect(mockTx.squad.update).toHaveBeenCalledWith({
      where: { id: 'squad-1' },
      data: { ownerId: 'next' },
    });
    expect(mockTx.squad.delete).not.toHaveBeenCalled();
  });

  it('does nothing to squads when the user has none', async () => {
    mockTx.user.findUnique.mockResolvedValue({
      squadId: null,
      ownedSquads: [],
      squad: null,
    });

    await expect(removeUserFromSquad('lonely')).resolves.toBeNull();
    expect(mockTx.squad.delete).not.toHaveBeenCalled();
    expect(mockTx.squad.update).not.toHaveBeenCalled();
  });
});
