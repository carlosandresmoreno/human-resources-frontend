// src/app/auth/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2'; // <-- Importa SweetAlert2

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null; // Aunque ahora usaremos Swal, lo mantenemos por si acaso
  isLoading: boolean = false; // <-- Nueva variable para el estado de carga

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.registerForm.valid) {
      this.isLoading = true; // <-- Inicia el estado de carga

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.isLoading = false; // <-- Finaliza el estado de carga
          Swal.fire({ // <-- Alerta de éxito con Swal
            icon: 'success',
            title: '¡Registro Exitoso!',
            text: 'Ahora puedes iniciar sesión.',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            this.router.navigate(['/auth/login']);
          });
          console.log('Registro exitoso:', response);
        },
        error: (err) => {
          this.isLoading = false; // <-- Finaliza el estado de carga
          this.errorMessage = err.message || 'El registro falló. Por favor, inténtalo de nuevo.';
          Swal.fire({ 
            icon: 'error',
            title: '¡Error!',
            text: "error",
          });
          console.error('Error de registro:', err);
        }
      });
    } else {
      this.errorMessage = 'Por favor, rellena todos los campos obligatorios correctamente.';
      Swal.fire({ 
        icon: 'warning',
        title: 'Formulario Inválido',
        text: this.errorMessage,
      });
      this.registerForm.markAllAsTouched();
    }
  }
}