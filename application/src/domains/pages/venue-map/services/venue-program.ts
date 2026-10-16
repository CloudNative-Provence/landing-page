import { AppClock } from '~/shared/time/app-clock';
import type { ProgramRoom, ProgramSession, ProgramSessionLocation } from '../../program/model/schedule';
import { ProgramLiveView } from '../../program/services/live-view';
import { ProgramSessionReminder } from '../../program/services/session-reminder';
import { mergeSharedProgramSessions, type ProgramDisplaySession } from '../../program/services/shared-sessions';

export interface VenueRoomProgramState {
  sessions: readonly ProgramDisplaySession[];
  current: readonly ProgramDisplaySession[];
  next: readonly ProgramDisplaySession[];
}

/** Live activity and saved destinations from the generated programme locations. */
export class VenueProgram {
  readonly sessions: readonly ProgramDisplaySession[];
  readonly validIds: readonly string[];
  readonly canonicalIds: ReadonlyMap<string, string>;
  private readonly sessionLocations: ReadonlyMap<string, readonly ProgramSessionLocation[]>;
  private readonly hallwayRoomIds: ReadonlySet<string>;

  constructor(sessions: readonly ProgramSession[], rooms: readonly ProgramRoom[]) {
    this.validIds = sessions.map((session) => session.id);
    this.sessions = mergeSharedProgramSessions(sessions).filter((session) => {
      const start = Date.parse(session.startsAt);
      const end = Date.parse(session.endsAt);
      return Number.isFinite(start) && Number.isFinite(end) && start < end;
    });
    this.canonicalIds = new Map(
      this.sessions.flatMap((session) => session.sourceIds.map((id) => [id, session.id] as const))
    );
    const knownRoomIds = new Set(rooms.map((room) => room.id));
    this.hallwayRoomIds = new Set(rooms.filter((room) => room.kind === 'hallway').map((room) => room.id));
    this.sessionLocations = new Map(
      this.sessions.map((session) => {
        const locations = session.locations.filter((location) => knownRoomIds.has(location.roomId));
        return [
          session.id,
          [...locations].sort((left, right) => Number(left.role === 'broadcast') - Number(right.role === 'broadcast')),
        ];
      })
    );
  }

  getSessionRoomIds(sessionId: string): readonly string[] {
    return this.getSessionLocations(sessionId).map((location) => location.roomId);
  }

  getSessionLocations(sessionId: string): readonly ProgramSessionLocation[] {
    return this.sessionLocations.get(this.canonicalIds.get(sessionId) ?? sessionId) ?? [];
  }

  getPreferredRoomId(sessionId: string): string | null {
    const locations = this.getSessionLocations(sessionId);
    const mainRooms = locations.filter((location) => location.role === 'main');
    if (mainRooms.length === 1) return mainRooms[0].roomId;
    return locations.length === 1 ? locations[0].roomId : null;
  }

  getRoomState(roomId: string, now: Date = AppClock.now()): VenueRoomProgramState {
    const sessions = this.sessions.filter((session) => this.getSessionRoomIds(session.id).includes(roomId));
    return this.activity(sessions, now);
  }

  getHallwayState(now: Date = AppClock.now()): VenueRoomProgramState {
    const sessions = this.sessions.filter((session) =>
      this.getSessionRoomIds(session.id).some((roomId) => this.hallwayRoomIds.has(roomId))
    );
    return this.activity(sessions, now);
  }

  private activity(sessions: readonly ProgramDisplaySession[], now: Date): VenueRoomProgramState {
    return {
      sessions,
      current: sessions.filter((session) => ProgramLiveView.getState(session, now) === 'live'),
      next: this.firstUpcoming(sessions, now),
    };
  }

  /** Preserve choices when saved talks overlap instead of silently choosing a room. */
  getNextSavedSessions(ids: Iterable<string>, now: Date = AppClock.now()): readonly ProgramDisplaySession[] {
    const sessions = this.savedSessions(ids);
    const current = sessions.filter((session) => ProgramLiveView.getState(session, now) === 'live');
    return current.length ? current : this.firstUpcoming(sessions, now);
  }

  /** The next-session shortcut advances as soon as a saved session starts. */
  getUpcomingSavedSessions(ids: Iterable<string>, now: Date = AppClock.now()): readonly ProgramDisplaySession[] {
    return this.firstUpcoming(this.savedSessions(ids), now);
  }

  /** Highlight agenda destinations independently of the room being inspected. */
  getPlannedRoomIds(ids: Iterable<string>, now: Date = AppClock.now()): readonly string[] {
    return this.destinationRoomIds(this.getNextSavedSessions(ids, now));
  }

  /** A next saved talk can need a reminder while the current saved talk is still live. */
  getStartingSoonSavedSessions(ids: Iterable<string>, now: Date = AppClock.now()): readonly ProgramDisplaySession[] {
    return this.savedSessions(ids).filter((session) => ProgramSessionReminder.isStartingSoon(session, now));
  }

  private savedSessions(ids: Iterable<string>): readonly ProgramDisplaySession[] {
    const selectedIds = new Set([...ids].map((id) => this.canonicalIds.get(id) ?? id));
    return this.sessions.filter((session) => selectedIds.has(session.id));
  }

  getStartingSoonRoomIds(ids: Iterable<string>, now: Date = AppClock.now()): readonly string[] {
    return this.destinationRoomIds(this.getStartingSoonSavedSessions(ids, now));
  }

  private destinationRoomIds(sessions: readonly ProgramDisplaySession[]): readonly string[] {
    return [
      ...new Set(
        sessions.flatMap((session) => {
          const preferred = this.getPreferredRoomId(session.id);
          return preferred ? [preferred] : this.getSessionRoomIds(session.id);
        })
      ),
    ];
  }

  /** The next instant that can change a room or agenda state, for an idle-friendly refresh timer. */
  getNextBoundary(now: Date = AppClock.now()): Date | null {
    return ProgramSessionReminder.getNextBoundary(this.sessions, now);
  }

  private firstUpcoming(sessions: readonly ProgramDisplaySession[], now: Date): readonly ProgramDisplaySession[] {
    const upcoming = sessions.filter((session) => ProgramLiveView.getState(session, now) === 'upcoming');
    if (!upcoming.length) return [];
    const startsAt = Math.min(...upcoming.map((session) => Date.parse(session.startsAt)));
    return upcoming.filter((session) => Date.parse(session.startsAt) === startsAt);
  }
}
