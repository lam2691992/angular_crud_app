import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { DialogRef } from '@angular/cdk/dialog';
import {MatTableModule} from '@angular/material/table';

@Component({
  selector: 'app-emp-add-edit',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    MatRadioModule,
    MatToolbarModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
  ],
  templateUrl: './emp-add-edit.component.html',
  styleUrl: './emp-add-edit.component.css',
})
export class EmpAddEditComponent {
[x: string]: any;

  empForm: FormGroup;

  education: string[] = [
    'Associate Degree',
    'Bachelor Degree',
    'Master Degree',
    'PhD',
  ];

  constructor(private _fb: FormBuilder, private _empService: EmployeeService, private _dialogRef:DialogRef<EmpAddEditComponent>) {
    this.empForm = this._fb.group({  
      firstName: [''],
      lastName:[''],
      email: [''],
      dob: [''],
      gender: [''],
      education: [''],
      department: [''],
      experience: [''],
      phone: [''],
    });
  }

  onFormSubmit() {
    if (this.empForm.valid) {
      this._empService.addEmployee(this.empForm.value).subscribe({
        next: (val: any) => {
          alert('Employee added successfully!');
          this._dialogRef.close();
        },
        error: (err: any) => {
          console.error(err);
        }
      })
    }
  }
}
