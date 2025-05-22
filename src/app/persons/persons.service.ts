import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; 

export interface Person {
  _id: string; 
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  department?: string;
  hireDate?: Date;
  salary?: number;
}


export interface PaginatedPersons {
  data: Person[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class PersonsService {
  private apiUrl = environment.apiUrl + '/persons'; 
  
  constructor(private http: HttpClient) {}

  createPerson(person: Omit<Person, '_id'>): Observable<Person> {
    return this.http.post<Person>(this.apiUrl, person).pipe(
      catchError(this.handleError)
    );
  }

  getPersons(page: number, limit: number, department?: string, minSalary?: number, maxSalary?: number): Observable<PaginatedPersons> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (department) {
      params = params.set('department', department);
    }
    if (minSalary !== undefined && minSalary !== null) {
      params = params.set('minSalary', minSalary.toString());
    }
    if (maxSalary !== undefined && maxSalary !== null) {
      params = params.set('maxSalary', maxSalary.toString());
    }

    return this.http.get<PaginatedPersons>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getPersonById(id: string): Observable<Person> {
    return this.http.get<Person>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updatePerson(id: string, person: Partial<Person>): Observable<Person> {
    return this.http.patch<Person>(`${this.apiUrl}/${id}`, person).pipe(
      catchError(this.handleError)
    );
  }

  deletePerson(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getPersonsByDepartmentStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stats/by-department`).pipe(
      catchError(this.handleError)
    );
  }

  getSalaryDistributionStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stats/salary-distribution`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Ocurrió un error:', error);
    const errorMessage = error.error?.message || 'Algo salió mal en la solicitud.';
    return throwError(() => new Error(errorMessage));
  }
}