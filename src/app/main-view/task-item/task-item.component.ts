import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, Output, EventEmitter } from '@angular/core';
import { Note } from '../../db';
import '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';

@Component({
  selector: 'app-task-item',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <li class="va-task-item" [class.va-task-completing]="completing">
      <wa-checkbox
        [checked]="task.done"
        [disabled]="completing"
        (change)="onCheck()"
        [attr.aria-label]="'Complete: ' + task.title"
      >{{ task.title }}</wa-checkbox>
    </li>
  `,
  styles: [`
    :host { display: contents; }

    .va-task-item {
      padding: 4px 8px;
      border-left: 3px solid transparent;
      margin-left: -11px;
      transition: border-color 0.15s;
    }
    .va-task-item:hover { border-left-color: currentColor; }

    /* Checkbox is disabled during this animation rather than supporting unchecking,
       to keep the interaction simple and avoid race conditions with the async archive. */
    @keyframes completeSlideUp {
      to { opacity: 0; transform: translateY(-6px); }
    }
    .va-task-completing {
      animation: completeSlideUp 500ms ease forwards;
      pointer-events: none;
    }
  `],
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Note;
  @Output() complete = new EventEmitter<Note>();

  completing = false;

  onCheck(): void {
    if (this.completing) return;
    this.completing = true;
    setTimeout(() => this.complete.emit(this.task), 500);
  }
}
