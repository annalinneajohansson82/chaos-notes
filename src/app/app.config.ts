import { APP_INITIALIZER, ApplicationConfig, Optional, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { NoteService } from './note.service';
import { CHAOS_DB, ChaosDb, DB_NAME, IDB_OPTIONS } from './db';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: CHAOS_DB,
      useFactory: (name: string | null, idbOptions: { indexedDB: IDBFactory; IDBKeyRange: typeof IDBKeyRange } | undefined) =>
        new ChaosDb(name ?? 'chaos-notes', idbOptions ?? undefined),
      deps: [[new Optional(), DB_NAME], [new Optional(), IDB_OPTIONS]],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (notes: NoteService) => () => notes.seedIfEmpty(),
      deps: [NoteService],
      multi: true,
    },
  ],
};
