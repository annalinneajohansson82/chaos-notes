import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, Output, EventEmitter } from '@angular/core';
import { Note } from '../../db';
import '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';

@Component({
  selector: 'app-task-item',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <li class="va-task-item" [class.va-task-done]="task.done">
      <wa-checkbox
        [checked]="task.done"
        (change)="complete.emit(task)"
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
    .va-task-item.va-task-done { opacity: 0.4; }
  `],
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Note;
  @Output() complete = new EventEmitter<Note>();
}
