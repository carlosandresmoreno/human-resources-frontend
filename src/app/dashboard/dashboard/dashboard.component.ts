import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexFill,
  ApexPlotOptions,
  ApexLegend,
  ApexResponsive,
  ApexGrid,
} from 'ng-apexcharts';
import { forkJoin } from 'rxjs';
import { PersonsService, Person } from '../../persons/persons.service'; 


export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  fill: ApexFill;
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
  responsive: ApexResponsive[];
  grid: ApexGrid;
  events?: { dataPointSelection?: (event: MouseEvent, chartContext: any, config: any) => void,
             markerClick?: (event: MouseEvent, chartContext: any, config: any) => void,
             // Otros eventos de ApexCharts que puedan ser relevantes, como click para gráficos de barras
             click?: (event: MouseEvent, chartContext: any, config: any) => void
           };
  // events?: { dataPointSelection?: (event: MouseEvent, chartContext: any, config: any) => void };

};


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
})
export class DashboardComponent implements OnInit {
  @ViewChild('chart') departmentChart: ChartComponent | undefined; 
  @ViewChild('salaryChart') salaryChartComponent: ChartComponent | undefined;

  public departmentChartOptions: Partial<ChartOptions> = {};
  public salaryChartOptions: Partial<ChartOptions> = {};
  errorMessage: string | null = null;
  loading: boolean = true;
  loadingPersons: boolean = false; 

  filteredPersons: Person[] = []; 
  currentFilter: { department?: string, minSalary?: number, maxSalary?: number } = {}; 

  constructor(private personsService: PersonsService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadFilteredPersons();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = null;

    forkJoin({
      departmentStats: this.personsService.getPersonsByDepartmentStats(),
      salaryStats: this.personsService.getSalaryDistributionStats()
    }).subscribe({
      next: ({ departmentStats, salaryStats }) => {
        const departments = departmentStats.map((d: any) => d.department || 'Sin Departamento');
        const counts = departmentStats.map((d: any) => d.count);

        this.departmentChartOptions = {
          series: [
            {
              name: 'Número de Personas',
              data: counts,
            },
          ],
          chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false },
            events: {
              dataPointSelection: (event: any, chartContext: any, config: any) => {
                // const selectedDepartment = departments[config.dataPointIndex];
                // this.applyFilterFromChart({ department: selectedDepartment });
                const selectedDepartment = departments[config.dataPointIndex];
                if (this.currentFilter.department === selectedDepartment) {
                  this.clearPersonsFilter();
                } else {
                  this.applyFilterFromChart({ department: selectedDepartment });
                }
              }
            }
          },
          title: { text: 'Personal por Departamento', align: 'left' },
          xaxis: { categories: departments, title: { text: 'Departamento' } },
          plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 5 } },
          dataLabels: {
            enabled: true,
            offsetY: -20,
            style: { fontSize: '12px', colors: ['#304758'] }
          },
          tooltip: {
            y: { formatter: function (val: number) { return val + ' personas'; } },
          },
          grid: { show: false }
        };

        
        const salaryRanges = salaryStats.map((d: any) => d.range);
        const salaryCounts = salaryStats.map((d: any) => d.count);
        const salaryBoundaries = salaryStats.map((d: any) => ({ min: d.minSalary, max: d.maxSalary }));


        this.salaryChartOptions = {
          series: [
            {
              name: 'Número de Personas',
              data: salaryCounts,
            },
          ],
          chart: {
            type: 'line',
            height: 350,
            toolbar: { show: false },
            events: { 
              dataPointSelection: (event: any, chartContext: any, config: any) => {
                // const selectedBoundary = salaryBoundaries[config.dataPointIndex];
                // this.applyFilterFromChart({ minSalary: selectedBoundary.min, maxSalary: selectedBoundary.max });
                const selectedBoundary = salaryBoundaries[config.dataPointIndex];
                const isAlreadyFiltered = this.currentFilter.minSalary === selectedBoundary.min && this.currentFilter.maxSalary === selectedBoundary.max;

                if (isAlreadyFiltered) {
                  this.clearPersonsFilter();
                } else {
                  this.applyFilterFromChart({ minSalary: selectedBoundary.min, maxSalary: selectedBoundary.max });
                }
              }
            }
          },
          title: { text: 'Distribución Salarial', align: 'left' },
          xaxis: { categories: salaryRanges, title: { text: 'Rango Salarial' }, labels: { rotate: -45, trim: true } },
          yaxis: { title: { text: 'Número de Personas' }, labels: { formatter: function (val: number) { return Math.round(val).toString(); } } },
          dataLabels: { enabled: true },
          tooltip: { y: { formatter: function (val: number) { return val + ' personas'; } } },
          stroke: { curve: 'smooth', width: 3 },
          grid: {
            borderColor: '#e7e7e7',
            row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 },
          }
        };
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error al cargar los datos del tablero.';
        this.loading = false;
        console.error('Error al cargar datos del tablero:', err);
      },
    });
  }

  loadFilteredPersons(department?: string, minSalary?: number, maxSalary?: number): void {
    this.loadingPersons = true; 
    this.personsService.getPersons(
      1, 
      100, 
      department,
      minSalary,
      maxSalary
    ).subscribe({
      next: (data) => {
        this.filteredPersons = data.data;
        this.loadingPersons = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error al cargar la lista de personal filtrado.';
        this.loadingPersons = false;
        console.error('Error al cargar personal filtrado:', err);
      }
    });
  }

  applyFilterFromChart(filter: { department?: string, minSalary?: number, maxSalary?: number }): void {
    this.currentFilter = filter; 
    this.loadFilteredPersons(filter.department, filter.minSalary, filter.maxSalary);
  }

  clearPersonsFilter(): void {
    this.currentFilter = {};
    this.loadFilteredPersons();
  }
}


