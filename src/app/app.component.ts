import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmpAddEditComponent } from './emp-add-edit/emp-add-edit.component';
import { EmployeeService } from './services/employee.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CoreService } from './core/core.service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  [x: string]: any;
  displayedColumns: string[] = [
    'id',
    'firstName',
    'lastName',
    'email',
    'dob',
    'gender',
    'education',
    'department',
    'experience',
    'phone',
    'salary',
    'action',
  ];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _dialog: MatDialog,
    private _empService: EmployeeService,
    private _coreService: CoreService,
  ) {}

  ngOnInit(): void {
    this.getEmployeeList();
  }

  openAddEditEmpForm() {
   const DialogRef = this._dialog.open(EmpAddEditComponent);
   DialogRef.afterClosed().subscribe({
    next: (val) => {
      if(val) {
        this.getEmployeeList();
      }
    }
   });
  }

  getEmployeeList() {
    this._empService.getEmployeeList().subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteEmployee(id: number) {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: { id }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._empService.deleteEmployee(result).subscribe({
          next: () => {
            this._coreService.openSnackBar('Employee deleted!', 'Done');
            this.getEmployeeList();
          },
          error: (err) => {
            console.error(err);
          },
        });
      }
    });
  }

  openEditForm(data: any) {
    const DialogRef = this._dialog.open(EmpAddEditComponent, {
      data,
    });
    DialogRef.afterClosed().subscribe({
      next: (val) => {
        if(val) {
          this.getEmployeeList();
        }
      }
     });
   }
}
