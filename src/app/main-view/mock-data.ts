export interface MockTask {
  id: string;
  title: string;
  tier: 'now' | 'soon' | 'later' | 'someday';
  linkedNotes: number;
  done: boolean;
}

export const MOCK_NOW_TASKS: MockTask[] = [
  {
    id: '1',
    title: 'Call the dentist to reschedule appointment',
    tier: 'now',
    linkedNotes: 1,
    done: false,
  },
  {
    id: '2',
    title: "Reply to Anna's email about the project",
    tier: 'now',
    linkedNotes: 0,
    done: false,
  },
  {
    id: '3',
    title: 'Pick up prescription from pharmacy',
    tier: 'now',
    linkedNotes: 0,
    done: false,
  },
];

export const MOCK_SOON_TASKS: MockTask[] = [
  {
    id: '4',
    title: 'Book train tickets for next visit',
    tier: 'soon',
    linkedNotes: 0,
    done: false,
  },
  { id: '5', title: 'Finish reading chapter 4', tier: 'soon', linkedNotes: 0, done: false },
  { id: '6', title: 'Look into new headphones', tier: 'soon', linkedNotes: 1, done: false },
  { id: '7', title: 'Water the plants', tier: 'soon', linkedNotes: 0, done: false },
];

export function getFuzzyLabel(count: number): string {
  if (count === 0) return 'nothing';
  if (count === 1) return 'just one thing';
  if (count <= 2) return 'a couple things';
  if (count <= 4) return 'a few things';
  if (count <= 7) return 'quite a few things';
  return 'many things';
}
