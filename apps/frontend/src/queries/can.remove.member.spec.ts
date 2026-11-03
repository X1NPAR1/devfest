import { canRemoveMember } from '@frontend/queries/can.remove.member';

describe('canRemoveMember', () => {
  const base = {
    callerId: 'owner',
    targetId: 'member',
    ownedSquadId: 'squad-1',
    targetSquadId: 'squad-1',
  };

  it('allows the owner to remove a member of their squad', () => {
    expect(canRemoveMember(base)).toEqual({ allowed: true });
  });

  it('rejects callers that do not own a squad', () => {
    expect(canRemoveMember({ ...base, ownedSquadId: null })).toMatchObject({
      allowed: false,
      status: 403,
    });
  });

  it('rejects the owner removing themselves', () => {
    expect(canRemoveMember({ ...base, targetId: 'owner' })).toMatchObject({
      allowed: false,
      status: 400,
    });
  });

  it('rejects targets from another squad', () => {
    expect(
      canRemoveMember({ ...base, targetSquadId: 'squad-2' })
    ).toMatchObject({ allowed: false, status: 404 });
  });

  it('rejects targets that do not exist or have no squad', () => {
    expect(canRemoveMember({ ...base, targetSquadId: null })).toMatchObject({
      allowed: false,
      status: 404,
    });
  });
});
