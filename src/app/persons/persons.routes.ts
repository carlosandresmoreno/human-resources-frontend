// src/app/persons/persons.routes.ts
import { Routes } from '@angular/router';
import { PersonListComponent } from './person-list/person-list.component';
import { PersonFormComponent } from './person-form/person-form.component';

export const PERSON_ROUTES: Routes = [
  { path: '', component: PersonListComponent },
  { path: 'new', component: PersonFormComponent },
  { path: 'edit/:id', component: PersonFormComponent },
];