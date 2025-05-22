// src/app/persons/person-list/person-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para directivas como @if, @for, pipes
import { RouterModule } from '@angular/router'; // Para routerLink (navegación declarativa)
import { FormsModule } from '@angular/forms'; // Necesario para ngModel en los filtros de formulario
import Swal from 'sweetalert2'; // Para alertas bonitas

import { PersonsService, Person, PaginatedPersons } from '../persons.service'; // Tu servicio y modelos

@Component({
  selector: 'app-person-list',
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.scss'], // Tus estilos SCSS
  standalone: true, // Marca el componente como standalone
  imports: [CommonModule, RouterModule, FormsModule], // Importa los módulos necesarios
})
export class PersonListComponent implements OnInit {
  persons: Person[] = [];
  totalPersons: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  loading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Variables para los filtros
  filterDepartment: string = '';
  filterMinSalary: number | undefined;
  filterMaxSalary: number | undefined;

  constructor(private personsService: PersonsService) {}

  ngOnInit(): void {
    this.loadPersons(); // Carga las personas al iniciar el componente
  }

  loadPersons(): void {
    this.loading = true; // Activa el indicador de carga
    this.errorMessage = null; // Limpia mensajes de error previos
    this.personsService.getPersons(
      this.currentPage,
      this.itemsPerPage,
      this.filterDepartment || undefined, // Pasa undefined si el filtro está vacío
      this.filterMinSalary,
      this.filterMaxSalary
    ).subscribe({
      next: (data: PaginatedPersons) => {
        this.persons = data.data; // Asigna los datos de las personas
        this.totalPersons = data.total; 
        this.totalPages = Math.ceil(this.totalPersons / this.itemsPerPage); 
        this.loading = false; 
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error al cargar el personal.';
        this.loading = false; 
        console.error('Error al cargar el personal:', err);
        Swal.fire('Error', "revisa el error", 'error');
      },
    });
  }

  deletePerson(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡bórralo!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.personsService.deletePerson(id).subscribe({
          next: () => {
            this.successMessage = '¡Personal eliminado con éxito!';
            Swal.fire('¡Eliminado!', 'El registro ha sido eliminado.', 'success');
            this.loadPersons(); 
          },
          error: (err) => {
            this.errorMessage = err.message || 'Error al eliminar el personal.';
            Swal.fire('Error', "revisa el error", 'error');
            console.error('Error al eliminar el personal:', err);
          },
        });
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPersons();
    }
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadPersons();
  }

  clearFilters(): void {
    this.filterDepartment = '';
    this.filterMinSalary = undefined;
    this.filterMaxSalary = undefined;
    this.currentPage = 1;
    this.loadPersons();
  }
}