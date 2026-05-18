import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TaskItemComponent } from './task-item.component';
import { Note, UrgencyTier } from '../../db';

// Web Awesome components use ElementInternals (form-associated custom elements).
// Happy-dom does not fully implement it, so we stub attachInternals globally.
const internalsStub = {
  setFormValue: () => {},
  setValidity: () => {},
  reportValidity: () => true,
  checkValidity: () => true,
  validity: { valid: true, valueMissing: false, customError: false },
  customStates: new Map<string, unknown>(),
};
Object.defineProperty(HTMLElement.prototype, 'attachInternals', {
  value: () => internalsStub,
  writable: true,
  configurable: true,
});

function makeNote(overrides: Partial<Note> = {}): Note {
  const now = new Date();
  return {
    id: 'test-id',
    title: 'Test task',
    body: null,
    urgency_tier: 'now',
    done: false,
    archived_at: null,
    created_at: now,
    updated_at: now,
    dirty: false,
    ...overrides,
  };
}

describe('TaskItemComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskItemComponent],
    }).compileComponents();
  });

  it('onTierChange is called when the wa-select fires a native change event', () => {
    const fixture = TestBed.createComponent(TaskItemComponent);
    const component = fixture.componentInstance;
    component.task = makeNote({ urgency_tier: 'now' });
    fixture.detectChanges();

    const spy = vi.spyOn(component, 'onTierChange');
    const select = fixture.nativeElement.querySelector('wa-select');
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(spy).toHaveBeenCalled();
  });

  it('onTierChange emits the selected tier value', () => {
    const fixture = TestBed.createComponent(TaskItemComponent);
    const component = fixture.componentInstance;
    component.task = makeNote({ urgency_tier: 'now' });
    fixture.detectChanges();

    const emitted: Array<UrgencyTier | null> = [];
    component.tierChange.subscribe(tier => emitted.push(tier));

    component.onTierChange({ target: { value: 'soon' } } as unknown as Event);

    expect(emitted).toEqual(['soon']);
  });

  it('onTierChange emits null when the empty option is selected', () => {
    const fixture = TestBed.createComponent(TaskItemComponent);
    const component = fixture.componentInstance;
    component.task = makeNote({ urgency_tier: 'now' });
    fixture.detectChanges();

    const emitted: Array<UrgencyTier | null> = [];
    component.tierChange.subscribe(tier => emitted.push(tier));

    component.onTierChange({ target: { value: '' } } as unknown as Event);

    expect(emitted).toEqual([null]);
  });

  it('clicking outside the item clears selected state', () => {
    const fixture = TestBed.createComponent(TaskItemComponent);
    const component = fixture.componentInstance;
    component.task = makeNote();
    component.selected = true;
    fixture.detectChanges();

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    document.body.removeChild(outside);

    expect(component.selected).toBe(false);
  });

  it('double click on title opens edit mode', () => {
    const fixture = TestBed.createComponent(TaskItemComponent);
    const component = fixture.componentInstance;
    component.task = makeNote();
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.va-title');
    title.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

    expect(component.editing).toBe(true);
  });

  it('single click on title sets selected state', () => {
    const fixture = TestBed.createComponent(TaskItemComponent);
    const component = fixture.componentInstance;
    component.task = makeNote();
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.va-title');
    title.click();

    expect(component.selected).toBe(true);
  });

  it('single click on title does not open edit mode', () => {
    const fixture = TestBed.createComponent(TaskItemComponent);
    const component = fixture.componentInstance;
    component.task = makeNote();
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.va-title');
    title.click();

    expect(component.editing).toBe(false);
  });
});
