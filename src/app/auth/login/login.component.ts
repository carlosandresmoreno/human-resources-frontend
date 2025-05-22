// src/app/auth/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.loginForm.valid) {
      this.isLoading = true; // <-- Inicia el estado de carga

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false; // <-- Finaliza el estado de carga
          console.log('Login successful:', response);
          Swal.fire({ // <-- Alerta de éxito con Swal
            icon: 'success',
            title: '¡Inicio de Sesión Exitoso!',
            text: 'Serás redirigido al panel de Personal.',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            this.router.navigate(['/persons']);
          });
        },
        error: (err) => {
          this.isLoading = false; // <-- Finaliza el estado de carga
          this.errorMessage = err.message || 'Error de inicio de sesión. Por favor, verifica tus credenciales.';
          Swal.fire({ 
            icon: 'error',
            title: '¡Error!',
            text: "fallo",
          });
          console.error('Login error:', err);
        }
      });
    } else {
      this.errorMessage = 'Por favor, introduce un correo electrónico y una contraseña válidos.';
      Swal.fire({ // <-- Alerta de validación de formulario
        icon: 'warning',
        title: 'Formulario Inválido',
        text: this.errorMessage,
      });
    }
  }
}