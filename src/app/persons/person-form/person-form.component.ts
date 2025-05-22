import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { PersonsService, Person } from '../persons.service';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class PersonFormComponent implements OnInit {
  personForm: FormGroup;
  isEditMode: boolean = false;
  personId: string | null = null;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private personsService: PersonsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.personForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      position: [''],
      department: [''],
      hireDate: [''],
      salary: ['', [Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.personId = params.get('id');
      if (this.personId) {
        this.isEditMode = true;
        this.loadPersonData(this.personId);
      }
    });
  }

  loadPersonData(id: string): void {
    this.isLoading = true;
    this.personsService.getPersonById(id).subscribe({
      next: (person: Person) => {
        this.isLoading = false;
        const hireDateFormatted = person.hireDate ? new Date(person.hireDate).toISOString().split('T')[0] : '';
        this.personForm.patchValue({
          ...person,
          hireDate: hireDateFormatted
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Error al cargar los datos del personal.';
        console.error('Error al cargar persona:', err);
        Swal.fire('Error', "error", 'error');
        this.router.navigate(['/persons']);
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.isLoading = true;

    if (this.personForm.valid) {
      const formData = { ...this.personForm.value };

      if (formData.hireDate) {
        formData.hireDate = new Date(formData.hireDate);
      } else {
        delete formData.hireDate;
      }

      if (this.isEditMode && this.personId) {
        this.personsService.updatePerson(this.personId, formData).subscribe({
          next: () => {
            this.isLoading = false;
            Swal.fire('¡Actualizado!', 'El registro ha sido actualizado con éxito.', 'success')
              .then(() => this.router.navigate(['/persons']));
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = err.message || 'Error al actualizar el personal.';
            Swal.fire('Error', "error", 'error');
            console.error('Error al actualizar personal:', err);
          }
        });
      } else {
        this.personsService.createPerson(formData).subscribe({
          next: () => {
            this.isLoading = false;
            Swal.fire('¡Creado!', 'El nuevo registro ha sido creado con éxito.', 'success')
              .then(() => {
                this.personForm.reset();
                this.router.navigate(['/persons']);
              });
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = err.message || 'Error al crear el personal.';
            Swal.fire('Error', "error", 'error');
            console.error('Error al crear personal:', err);
          }
        });
      }
    } else {
      this.isLoading = false;
      this.errorMessage = 'Por favor, rellena todos los campos obligatorios y válidos.';
      Swal.fire('Formulario Inválido', "error", 'warning');
      this.personForm.markAllAsTouched();
    }
  }
}