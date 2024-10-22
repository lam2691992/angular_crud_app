import { Component, Inject, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CoreService } from '../core/core.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';

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
    MatIconModule,
  ],
  templateUrl: './emp-add-edit.component.html',
  styleUrls: ['./emp-add-edit.component.css'],
})
export class EmpAddEditComponent implements OnInit {
  dynamicForm!: FormGroup;
  existingPhones: string[] = [];
  education: string[] = [
    'Associate Degree',
    'Bachelor Degree',
    'Master Degree',
    'PhD',
  ];

  constructor(
    private fb: FormBuilder,
    private _empService: EmployeeService,
    private _dialogRef: MatDialogRef<EmpAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _coreService: CoreService
  ) {
    // Khởi tạo dynamic form
    this.dynamicForm = this.fb.group({
      firstName: ['', [Validators.required, specialCharOrNumberValidator]],
      lastName: ['', [Validators.required, specialCharOrNumberValidator]],
      email: ['', [Validators.email]],
      dob: [''],
      gender: ['Male'],
      education: [''],
      department: [''],
      experience: [''],
      phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
        uniquePhoneValidator([], data?.phone)
      ]],
      salary: [''],
    });
  }

  ngOnInit(): void {
    this._empService.getEmployeeList().subscribe((res) => {
      this.existingPhones = res.map((employee: any) => employee.phone);
      this.addDynamicControls(); // Khởi tạo các điều khiển
  
      if (this.data) {
        this.dynamicForm.patchValue(this.data); // Nạp dữ liệu nếu là edit
  
        // Cập nhật validator cho trường phone sau khi có existingPhones
        this.updatePhoneValidator();
      }
    });
  }
  
  // Hàm cập nhật validator cho trường phone
  updatePhoneValidator() {
    this.dynamicForm.get('phone')?.setValidators([
      Validators.required,
      Validators.pattern('^[0-9]+$'),
      uniquePhoneValidator(this.existingPhones, this.data?.phone) // Truyền currentPhone nếu đang chỉnh sửa
    ]);
    this.dynamicForm.get('phone')?.updateValueAndValidity();
  }

  // Các trường form động
  formFields = [
    {
      label: 'First Name',
      controlName: 'firstName',
      type: 'text',
      required: true,
      placeholder: 'Nguyen Van',
    },
    {
      label: 'Last Name',
      controlName: 'lastName',
      type: 'text',
      required: true,
      placeholder: 'Anh',
    },
    { label: 'Email', controlName: 'email', type: 'email', required: false },
    {
      label: 'Date of birth',
      controlName: 'dob',
      type: 'date',
      required: false,
    },
    { label: 'Gender', controlName: 'gender', type: 'radio', required: false },
    {
      label: 'Education',
      controlName: 'education',
      type: 'select',
      required: false,
    },
    {
      label: 'Department',
      controlName: 'department',
      type: 'text',
      required: false,
      placeholder: 'HR',
    },
    {
      label: 'Experience',
      controlName: 'experience',
      type: 'number',
      required: false,
      placeholder: '1',
    },
    {
      label: 'Phone',
      controlName: 'phone',
      type: 'text',
      required: true,
      placeholder: '+84...',
    },
    {
      label: 'Salary',
      controlName: 'salary',
      type: 'number',
      required: false,
      placeholder: '5000',
    },
  ];

  // Thêm các điều khiển vào dynamic form
  addDynamicControls() {
    this.formFields.forEach((field) => {
      const validators = field.required ? [Validators.required] : [];

      // Tạo control với validators
      const control = this.fb.control(
        field.type === 'radio' ? 'Male' : '', // Giá trị mặc định cho radio
        {
          validators,
          updateOn: 'change', // 'change' để muốn kiểm tra ngay lập tức
        }
      );

      // Thêm validator cho phone
      if (field.controlName === 'phone') {
        control.setValidators([
          Validators.pattern('^[0-9]+$'),
          uniquePhoneValidator(this.existingPhones, this.data?.phone), // Truyền currentPhone nếu đang chỉnh sửa
        ]);
        control.updateValueAndValidity();
      }

      // // Thêm validator cho salary
      // if (field.controlName === 'salary') {
      //   control.setValidators([
      //     Validators.required,
      //     Validators.min(0),
      //   ]);
      // }

      this.dynamicForm.addControl(field.controlName, control);
    });
  }

  // Submit form
  onFormSubmit() {
    if (this.dynamicForm.valid) {
      if (this.data) {
        this._empService
          .updateEmployee(this.data.id, this.dynamicForm.value)
          .subscribe({
            next: () => {
              this._coreService.openSnackBar('Employee updated!');
              this._dialogRef.close(true);
            },
            error: (err: any) => {
              console.error(err);
            },
          });
      } else {
        this._empService.addEmployee(this.dynamicForm.value).subscribe({
          next: () => {
            this._coreService.openSnackBar('Employee added successfully!');
            this._dialogRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
          },
        });
      }
    }
  }

  get fields() {
    return this.dynamicForm.get('fields') as FormArray;
  }
}

// Custom Validators
function specialCharOrNumberValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  const regex = /[^a-zA-Z\s]/; // Kiểm tra ký tự không phải là chữ cái hoặc khoảng trắng

  return value && regex.test(value) ? { specialCharOrNumber: true } : null;
}

export function uniquePhoneValidator(existingPhones: string[], currentPhone?: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const phone = control.value;

    // Nếu không có giá trị, không cần kiểm tra
    if (!phone) {
      return null;
    }

    if (currentPhone && phone === currentPhone) {
      return null;
    }

    // Kiểm tra xem số điện thoại có tồn tại trong danh sách không
    return existingPhones.includes(phone) ? { notUnique: true } : null;
  };
}
